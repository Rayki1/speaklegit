const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("./db");
const { initializeDatabase } = db;
require("dotenv").config();

const app = express();

const allowedOrigins = new Set([
  (process.env.FRONTEND_URL || '').trim(),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    try {
      const hostname = new URL(origin).hostname;
      if (allowedOrigins.has(origin) || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch (error) {
      console.error('CORS ORIGIN PARSE ERROR:', error);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is missing. Auth routes will fail until it is set.");
}

const HINT_KEYS = [
  "neonMagnet",
  "shadowLetter",
  "underscoreReveal",
  "firstLetterBloom",
];

const PREMIUM_TIER_MAP = {
  "Freemium Trial": "trial",
  "Monthly Premium": "monthly",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT ERROR:", err);
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

function buildDefaultHints(hints = {}) {
  return {
    neonMagnet: 0,
    shadowLetter: 0,
    underscoreReveal: 0,
    firstLetterBloom: 0,
    ...hints,
  };
}

async function getHintInventory(userId) {
  const rows = await dbQuery(
    "SELECT hint_key, quantity FROM user_hints WHERE user_id = ?",
    [userId]
  );

  const hints = buildDefaultHints();
  rows.forEach((row) => {
    if (row.hint_key in hints) {
      hints[row.hint_key] = row.quantity;
    }
  });

  return hints;
}

async function ensurePremiumState(userId) {
  const rows = await dbQuery(
    "SELECT premium, premium_expiry FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  if (!rows.length) return;

  const row = rows[0];
  if (row.premium && row.premium_expiry && new Date(row.premium_expiry).getTime() <= Date.now()) {
    await dbQuery(
      "UPDATE users SET premium = 0, premium_tier = NULL, premium_expiry = NULL WHERE id = ?",
      [userId]
    );
  }
}

async function getUserById(userId) {
  await ensurePremiumState(userId);
  const rows = await dbQuery(
    `SELECT id, gmail, username, coins, score, profile_picture, full_name,
            premium, premium_tier, premium_expiry, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (!rows.length) return null;

  const user = rows[0];
  user.hints = await getHintInventory(userId);
  return user;
}

async function getUserByGmail(gmail) {
  const rows = await dbQuery(
    `SELECT id, gmail, username, coins, score, profile_picture, full_name,
            premium, premium_tier, premium_expiry, created_at
     FROM users WHERE gmail = ? LIMIT 1`,
    [gmail]
  );

  if (!rows.length) return null;
  await ensurePremiumState(rows[0].id);
  return getUserById(rows[0].id);
}

function buildUserPayload(user, extras = {}) {
  const merged = {
    ...user,
    profile_picture: extras.profilePicture || user.profile_picture || user.profilePicture || "",
    full_name: extras.fullName || user.full_name || user.fullName || "",
  };

  return {
    id: merged.id,
    gmail: merged.gmail,
    username: merged.username,
    coins: Number(merged.coins || 0),
    score: Number(merged.score || 0),
    profilePicture: merged.profile_picture || "",
    fullName: merged.full_name || "",
    premium: Boolean(merged.premium),
    premiumTier: merged.premium_tier || null,
    premiumExpiry: merged.premium_expiry || null,
    hints: buildDefaultHints(merged.hints || {}),
  };
}

function buildAuthResponse(user, extras = {}) {
  const cleanUser = buildUserPayload(user, extras);
  const token = jwt.sign(
    {
      id: cleanUser.id,
      gmail: cleanUser.gmail,
      username: cleanUser.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    message: "Login successful",
    token,
    user: cleanUser,
  };
}

async function verifyGoogleCredential(credential) {
  if (!credential) {
    throw new Error("Missing Google credential");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!response.ok) {
    throw new Error("Invalid Google token");
  }

  const payload = await response.json();

  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID mismatch");
  }

  if (!payload.email || payload.email_verified !== "true") {
    throw new Error("Google email is not verified");
  }

  return payload;
}

function buildWalletAggregateKey(type, details = {}) {
  switch (type) {
    case "buy_coins":
      return "buy_coins";
    case "purchase_hint":
      return `purchase_hint:${details.hintKey || "general"}`;
    case "consume_hint":
      return `consume_hint:${details.hintKey || "general"}`;
    case "purchase_premium":
      return `purchase_premium:${details.tier || details.premiumTier || "premium"}`;
    case "purchase_exclusive_item":
      return `purchase_exclusive_item:${details.itemName || "item"}`;
    default:
      return type || "general";
  }
}

async function recordWalletTransaction({ userId, type, amount = 0, coinsChange = 0, details = null }) {
  const parsedDetails = details || {};
  const aggregateKey = buildWalletAggregateKey(type, parsedDetails);

  await dbQuery(
    `INSERT INTO wallet_transactions (
        user_id, transaction_type, aggregate_key, amount, coins_change, transaction_count, details, last_transaction_at
     ) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE
        amount = amount + VALUES(amount),
        coins_change = coins_change + VALUES(coins_change),
        transaction_count = transaction_count + 1,
        details = VALUES(details),
        last_transaction_at = NOW()`,
    [userId, type, aggregateKey, amount, coinsChange, JSON.stringify(parsedDetails)]
  );
}


async function upsertLeaderboardEntry(userId, scoreOverride = null, mode = 'player1') {
  const rows = await dbQuery(
    `SELECT id, username, score
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    throw new Error("User not found for leaderboard sync");
  }

  const user = rows[0];
  const leaderboardScore = scoreOverride === null ? Number(user.score || 0) : Math.max(0, Number(scoreOverride || 0));

  await dbQuery(
    `INSERT INTO leaderboard (user_id, username, score, mode)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        score = VALUES(score),
        updated_at = CURRENT_TIMESTAMP`,
    [userId, user.username, leaderboardScore, mode]
  );
}

async function incrementLeaderboardGamesPlayed(userId, mode = 'player1') {
  await dbQuery(
    `INSERT INTO leaderboard (user_id, username, score, games_played, mode)
     SELECT id, username, score, 1, ?
     FROM users
     WHERE id = ?
     ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        score = GREATEST(score, VALUES(score)),
        games_played = games_played + 1,
        updated_at = CURRENT_TIMESTAMP`,
    [mode, userId]
  );
}

async function initializeNewUserData(userId) {
  const initializationErrors = [];

  for (const hintKey of HINT_KEYS) {
    try {
      await dbQuery(
        `INSERT INTO user_hints (user_id, hint_key, quantity)
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE quantity = quantity`,
        [userId, hintKey]
      );
    } catch (error) {
      console.error(`USER_HINTS INIT ERROR (${hintKey}):`, error);
      initializationErrors.push(`hint:${hintKey}`);
    }
  }

  try {
    await upsertLeaderboardEntry(userId);
  } catch (error) {
    console.error('LEADERBOARD INIT ERROR:', error);
    initializationErrors.push('leaderboard');
  }

  return initializationErrors;
}

async function buildRegisterResponse(userId, extras = {}) {
  const insertedUser = await getUserById(userId);

  if (insertedUser) {
    return buildAuthResponse(insertedUser, extras);
  }

  const fallbackRows = await dbQuery(
    `SELECT id, gmail, username, coins, score, profile_picture, full_name, premium, premium_tier, premium_expiry
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (!fallbackRows.length) {
    throw new Error('User account was created but could not be loaded');
  }

  return buildAuthResponse({
    ...fallbackRows[0],
    hints: buildDefaultHints(),
  }, extras);
}

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/healthz", async (req, res) => {
  try {
    await dbQuery("SELECT 1 AS ok");
    res.json({ ok: true, message: "Backend and database are reachable" });
  } catch (error) {
    console.error("HEALTH CHECK ERROR:", error);
    res.status(500).json({ ok: false, message: error.message || "Database is not reachable" });
  }
});

app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;
    const googleUser = await verifyGoogleCredential(credential);
    const gmail = googleUser.email.trim().toLowerCase();

    const existingUser = await getUserByGmail(gmail);

    if (existingUser) {
      await dbQuery(
        "UPDATE users SET profile_picture = ?, full_name = ? WHERE id = ?",
        [googleUser.picture || "", googleUser.name || "", existingUser.id]
      );
    }

    const refreshedUser = await getUserByGmail(gmail);

    if (refreshedUser && refreshedUser.username) {
      return res.json({
        needsUsername: false,
        ...buildAuthResponse(refreshedUser, {
          profilePicture: googleUser.picture || "",
          fullName: googleUser.name || "",
        }),
      });
    }

    const signupToken = jwt.sign(
      {
        gmail,
        googleSub: googleUser.sub,
        profilePicture: googleUser.picture || "",
        fullName: googleUser.name || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      needsUsername: true,
      signupToken,
      gmail,
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return res.status(401).json({ message: error.message || "Google login failed" });
  }
});

app.post("/google-complete-profile", async (req, res) => {
  try {
    const { signupToken, username } = req.body;
    const cleanUsername = (username || "").trim();

    if (!signupToken) {
      return res.status(400).json({ message: "Signup token is required" });
    }

    if (!cleanUsername) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    const decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
    const gmail = decoded.gmail;

    const usernameCheck = await dbQuery(
      "SELECT id FROM users WHERE username = ? AND gmail <> ? LIMIT 1",
      [cleanUsername, gmail]
    );

    if (usernameCheck.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingUser = await getUserByGmail(gmail);

    if (existingUser) {
      await dbQuery(
        "UPDATE users SET username = ?, profile_picture = ?, full_name = ? WHERE id = ?",
        [cleanUsername, decoded.profilePicture || "", decoded.fullName || "", existingUser.id]
      );

      const updatedUser = await getUserById(existingUser.id);
      return res.json(
        buildAuthResponse(updatedUser, {
          profilePicture: decoded.profilePicture || "",
          fullName: decoded.fullName || "",
        })
      );
    }

    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const insertResult = await dbQuery(
      `INSERT INTO users (gmail, username, password, profile_picture, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      [gmail, cleanUsername, hashedPassword, decoded.profilePicture || "", decoded.fullName || ""]
    );

    const initializationErrors = await initializeNewUserData(insertResult.insertId);

    const authResponse = await buildRegisterResponse(insertResult.insertId, {
      profilePicture: decoded.profilePicture || "",
      fullName: decoded.fullName || "",
    });

    return res.status(201).json({
      ...authResponse,
      warning: initializationErrors.length
        ? `Account created. Some profile extras were retried later: ${initializationErrors.join(", ")}`
        : undefined,
    });
  } catch (error) {
    console.error("GOOGLE COMPLETE PROFILE ERROR:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Google session expired. Please continue with Google again." });
    }

    return res.status(500).json({ message: error.message || "Failed to save profile" });
  }
});


app.post("/register", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const gmail = (req.body.gmail || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !gmail || !password) {
      return res.status(400).json({ message: "Username, Gmail, and password are required" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUsername = await dbQuery(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingGmail = await dbQuery(
      "SELECT id FROM users WHERE gmail = ? LIMIT 1",
      [gmail]
    );

    if (existingGmail.length > 0) {
      return res.status(400).json({ message: "Gmail already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await dbQuery(
      `INSERT INTO users (gmail, username, password, profile_picture, full_name)
       VALUES (?, ?, ?, '', '')`,
      [gmail, username, hashedPassword]
    );

    const initializationErrors = await initializeNewUserData(insertResult.insertId);

    const authResponse = await buildRegisterResponse(insertResult.insertId);
    return res.status(201).json({
      ...authResponse,
      warning: initializationErrors.length
        ? `Account created. Some profile extras were retried later: ${initializationErrors.join(", ")}`
        : undefined,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: error.message || "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const rows = await dbQuery(
      `SELECT id, gmail, username, password, coins, score, profile_picture, full_name, premium, premium_tier, premium_expiry, created_at
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const fullUser = await getUserById(user.id);
    return res.json(buildAuthResponse(fullUser));
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message || "Login failed" });
  }
});

app.post("/forgot-password", (req, res) => {
  const { gmail } = req.body;

  if (!gmail) {
    return res.status(400).json({ message: "Gmail is required" });
  }

  const sql = "SELECT * FROM users WHERE gmail = ?";
  db.query(sql, [gmail], (err, results) => {
    if (err) {
      console.error("FORGOT PASSWORD DB ERROR:", err);
      return res.status(500).json({ message: "Database error during forgot password" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No account found with that Gmail" });
    }

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const insertSql =
      "INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (?, ?, ?)";

    db.query(insertSql, [user.id, resetToken, expiresAt], (insertErr) => {
      if (insertErr) {
        console.error("RESET TOKEN INSERT ERROR:", insertErr);
        return res.status(500).json({ message: "Could not create reset token" });
      }

      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

      transporter.sendMail(
        {
          from: process.env.EMAIL_USER,
          to: gmail,
          subject: "Reset Your Password",
          html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>
          `,
        },
        (mailErr) => {
          if (mailErr) {
            console.error("EMAIL SEND ERROR:", mailErr);
            return res.status(500).json({ message: "Failed to send email" });
          }

          res.json({ message: "Password reset email sent" });
        }
      );
    });
  });
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  const sql =
    "SELECT * FROM password_resets WHERE reset_token = ? AND expires_at > NOW()";

  db.query(sql, [token], async (err, results) => {
    if (err) {
      console.error("RESET PASSWORD DB ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const resetRow = results[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetRow.user_id],
      (updateErr) => {
        if (updateErr) {
          console.error("UPDATE PASSWORD ERROR:", updateErr);
          return res.status(500).json({ message: "Failed to update password" });
        }

        db.query(
          "DELETE FROM password_resets WHERE user_id = ?",
          [resetRow.user_id],
          () => {}
        );

        res.json({ message: "Password reset successful" });
      }
    );
  });
});

app.post("/buy-coins", verifyToken, async (req, res) => {
  try {
    const { coins_bought, amount } = req.body;
    const userId = req.user.id;

    if (!coins_bought || !amount) {
      return res.status(400).json({ message: "Coins and amount are required" });
    }

    await dbQuery("UPDATE users SET coins = coins + ? WHERE id = ?", [coins_bought, userId]);

    await dbQuery(
      "INSERT INTO coin_purchases (user_id, coins_bought, amount) VALUES (?, ?, ?)",
      [userId, coins_bought, amount]
    );

    await recordWalletTransaction({
      userId,
      type: "buy_coins",
      amount,
      coinsChange: Number(coins_bought),
      details: { coinsBought: coins_bought },
    });

    const user = await getUserById(userId);
    return res.json({ message: "Coins purchased successfully", user: buildUserPayload(user) });
  } catch (error) {
    console.error("BUY COINS ERROR:", error);
    return res.status(500).json({ message: "Failed to buy coins" });
  }
});

app.post("/spend-coins", verifyToken, async (req, res) => {
  try {
    const { amount, reason = "spend", details = null } = req.body;
    const userId = req.user.id;
    const spendAmount = Number(amount);

    if (!Number.isFinite(spendAmount) || spendAmount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const result = await dbQuery(
      "UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?",
      [spendAmount, userId, spendAmount]
    );

    if (!result.affectedRows) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    await recordWalletTransaction({
      userId,
      type: reason,
      coinsChange: -spendAmount,
      details,
    });

    const user = await getUserById(userId);
    return res.json({ message: "Coins deducted successfully", user: buildUserPayload(user) });
  } catch (error) {
    console.error("SPEND COINS ERROR:", error);
    return res.status(500).json({ message: "Failed to deduct coins" });
  }
});

app.post("/purchase-hint", verifyToken, async (req, res) => {
  try {
    const { hintKey, cost, quantity = 1 } = req.body;
    const userId = req.user.id;
    const safeQuantity = Number(quantity);
    const safeCost = Number(cost);

    if (!HINT_KEYS.includes(hintKey)) {
      return res.status(400).json({ message: "Invalid hint key" });
    }

    if (!Number.isFinite(safeQuantity) || safeQuantity <= 0 || !Number.isFinite(safeCost) || safeCost <= 0) {
      return res.status(400).json({ message: "Invalid cost or quantity" });
    }

    const totalCost = safeCost * safeQuantity;

    const deductResult = await dbQuery(
      "UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?",
      [totalCost, userId, totalCost]
    );

    if (!deductResult.affectedRows) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    await dbQuery(
      `INSERT INTO user_hints (user_id, hint_key, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, hintKey, safeQuantity]
    );

    await recordWalletTransaction({
      userId,
      type: "purchase_hint",
      coinsChange: -totalCost,
      details: { hintKey, quantity: safeQuantity },
    });

    const user = await getUserById(userId);
    return res.json({ message: "Hint purchased", user: buildUserPayload(user) });
  } catch (error) {
    console.error("PURCHASE HINT ERROR:", error);
    return res.status(500).json({ message: "Failed to purchase hint" });
  }
});

app.post("/consume-hint", verifyToken, async (req, res) => {
  try {
    const { hintKey } = req.body;
    const userId = req.user.id;

    if (!HINT_KEYS.includes(hintKey)) {
      return res.status(400).json({ message: "Invalid hint key" });
    }

    const result = await dbQuery(
      "UPDATE user_hints SET quantity = quantity - 1 WHERE user_id = ? AND hint_key = ? AND quantity > 0",
      [userId, hintKey]
    );

    if (!result.affectedRows) {
      return res.status(400).json({ message: "No hint inventory left" });
    }

    const user = await getUserById(userId);
    return res.json({ message: "Hint consumed", user: buildUserPayload(user) });
  } catch (error) {
    console.error("CONSUME HINT ERROR:", error);
    return res.status(500).json({ message: "Failed to consume hint" });
  }
});

app.post("/purchase-premium", verifyToken, async (req, res) => {
  try {
    const { name, cost, days, bonusCoins = 0 } = req.body;
    const userId = req.user.id;
    const safeCost = Number(cost);
    const safeDays = Number(days);
    const safeBonusCoins = Number(bonusCoins || 0);

    if (!name || !Number.isFinite(safeCost) || safeCost < 0 || !Number.isFinite(safeDays) || safeDays <= 0) {
      return res.status(400).json({ message: "Invalid premium package" });
    }

    const tierCode = PREMIUM_TIER_MAP[name] || name.toLowerCase().replace(/\s+/g, "_");

    const deductResult = await dbQuery(
      "UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?",
      [safeCost, userId, safeCost]
    );

    if (!deductResult.affectedRows) {
      return res.status(400).json({ message: "Not enough coins for subscription" });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + safeDays);

    await dbQuery(
      `UPDATE users
       SET premium = 1,
           premium_tier = ?,
           premium_expiry = ?,
           coins = coins + ?
       WHERE id = ?`,
      [tierCode, expiry, safeBonusCoins, userId]
    );

    await dbQuery(
      `INSERT INTO premium_purchases (user_id, premium_tier, cost_coins, duration_days, bonus_coins, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, tierCode, safeCost, safeDays, safeBonusCoins, expiry]
    );

    await recordWalletTransaction({
      userId,
      type: "purchase_premium",
      coinsChange: -safeCost + safeBonusCoins,
      details: { tier: tierCode, days: safeDays, bonusCoins: safeBonusCoins },
    });

    const user = await getUserById(userId);
    return res.json({ message: "Premium activated", user: buildUserPayload(user) });
  } catch (error) {
    console.error("PURCHASE PREMIUM ERROR:", error);
    return res.status(500).json({ message: "Failed to purchase premium" });
  }
});


app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone = "", preferredMethod = "email", message } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanPreferredMethod = ["email", "phone"].includes(preferredMethod) ? preferredMethod : "email";
    const cleanMessage = String(message || "").trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    await dbQuery(
      `INSERT INTO contact_messages (name, email, phone, preferred_method, message)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanPhone, cleanPreferredMethod, cleanMessage]
    );

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "Speaksoncloud@gmail.com";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      replyTo: cleanEmail,
      subject: `SPEAKS Contact Form - ${cleanName}`,
      text: `New contact form message

Name: ${cleanName}
Email: ${cleanEmail}
Phone: ${cleanPhone || "N/A"}
Preferred method: ${cleanPreferredMethod}

Message:
${cleanMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New SPEAKS Contact Form Message</h2>
          <p><strong>Name:</strong> ${cleanName}</p>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>Phone:</strong> ${cleanPhone || "N/A"}</p>
          <p><strong>Preferred method:</strong> ${cleanPreferredMethod}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">${cleanMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </div>
      `,
    });

    return res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

app.post("/update-score", verifyToken, async (req, res) => {
  try {
    const { score, mode = "player1", gameCompleted = false, won = false } = req.body;
    const userId = req.user.id;

    if (score === undefined || !Number.isFinite(Number(score))) {
      return res.status(400).json({ message: "Valid score is required" });
    }

    const safeScore = Math.max(0, Number(score));

    await dbQuery(
      "UPDATE users SET score = GREATEST(score, ?) WHERE id = ?",
      [safeScore, userId]
    );

    if (gameCompleted) {
      await upsertLeaderboardEntry(userId, safeScore, mode);
      await incrementLeaderboardGamesPlayed(userId, mode);

      if (won) {
        await dbQuery(
          `UPDATE leaderboard
           SET wins = wins + 1
           WHERE user_id = ? AND mode = ?`,
          [userId, mode]
        );
      }
    }

    const user = await getUserById(userId);
    return res.json({ message: "Score updated successfully", user: buildUserPayload(user) });
  } catch (error) {
    console.error("UPDATE SCORE ERROR:", error);
    return res.status(500).json({ message: "Failed to update score" });
  }
});

app.get("/leaderboards", (req, res) => {
  const sql = `
    SELECT l.user_id, l.username, l.score, l.games_played, l.wins, l.mode,
           u.gmail, u.coins, u.premium_tier, u.profile_picture
    FROM leaderboard l
    INNER JOIN users u ON u.id = l.user_id
    WHERE l.mode = 'player1'
    ORDER BY l.score DESC, u.coins DESC, l.username ASC
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("LEADERBOARD ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }

    res.json({
      mode: "player1",
      entries: results.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        username: row.username,
        gmail: row.gmail,
        score: Number(row.score || 0),
        coins: Number(row.coins || 0),
        gamesPlayed: Number(row.games_played || 0),
        wins: Number(row.wins || 0),
        premiumTier: row.premium_tier || null,
        profilePicture: row.profile_picture || "",
      })),
    });
  });
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(buildUserPayload(user));
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('DATABASE INITIALIZATION ERROR:', error);
    process.exit(1);
  }
})();
