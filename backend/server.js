const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const { mongoose, initializeDatabase } = require("./db");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const app = express();
const { Schema } = mongoose;

function toOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

const configuredFrontendOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((entry) => toOrigin(entry))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredFrontendOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      try {
        const parsedOrigin = new URL(origin);
        const normalizedOrigin = parsedOrigin.origin;
        const hostname = parsedOrigin.hostname;
        if (
          allowedOrigins.has(normalizedOrigin) ||
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.endsWith(".vercel.app")
        ) {
          return callback(null, true);
        }
      } catch (error) {
        console.error("CORS ORIGIN PARSE ERROR:", error);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
let databaseInitPromise = null;
let modelBootstrapPromise = null;

async function ensureModelsInitialized() {
  return;
}

function ensureDatabaseInitialized() {
  if (!databaseInitPromise) {
    databaseInitPromise = initializeDatabase()
      .then(async () => {
        try {
          await ensureModelsInitialized();
        } catch (error) {
          console.error("MODEL INITIALIZATION WARNING:", error);
        }
      })
      .catch((error) => {
        databaseInitPromise = null;
        throw error;
      });
  }

  return databaseInitPromise;
}

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

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const UserSchema = new Schema(
  {
    userId: { type: Number, required: true, unique: true, index: true },
    gmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    profilePicture: { type: String, default: "" },
    fullName: { type: String, default: "" },
    premium: { type: Boolean, default: false },
    premiumTier: { type: String, default: null },
    premiumExpiry: { type: Date, default: null },
    hints: {
      neonMagnet: { type: Number, default: 0 },
      shadowLetter: { type: Number, default: 0 },
      underscoreReveal: { type: Number, default: 0 },
      firstLetterBloom: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const LeaderboardSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    username: { type: String, required: true },
    score: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    mode: { type: String, default: "player1", index: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
LeaderboardSchema.index({ userId: 1, mode: 1 }, { unique: true });

const WalletTransactionSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    transactionType: { type: String, required: true },
    aggregateKey: { type: String, required: true },
    amount: { type: Number, default: 0 },
    coinsChange: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 1 },
    details: { type: Schema.Types.Mixed, default: {} },
    lastTransactionAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
WalletTransactionSchema.index({ userId: 1, aggregateKey: 1 }, { unique: true });

const CoinPurchaseSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    coinsBought: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const PremiumPurchaseSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    premiumTier: { type: String, required: true },
    costCoins: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    bonusCoins: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const PasswordResetSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    resetToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    preferredMethod: { type: String, enum: ["email", "phone"], default: "email" },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Leaderboard =
  mongoose.models.Leaderboard || mongoose.model("Leaderboard", LeaderboardSchema);
const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);
const CoinPurchase =
  mongoose.models.CoinPurchase || mongoose.model("CoinPurchase", CoinPurchaseSchema);
const PremiumPurchase =
  mongoose.models.PremiumPurchase ||
  mongoose.model("PremiumPurchase", PremiumPurchaseSchema);
const PasswordReset =
  mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);
const ContactMessage =
  mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);

ensureModelsInitialized = async function ensureModelsInitializedImpl() {
  if (!modelBootstrapPromise) {
    modelBootstrapPromise = (async () => {
      // Ensure collections and indexes exist before first request logic runs.
      await Promise.all([
        Counter.init(),
        User.init(),
        Leaderboard.init(),
        WalletTransaction.init(),
        CoinPurchase.init(),
        PremiumPurchase.init(),
        PasswordReset.init(),
        ContactMessage.init(),
      ]);

      await Counter.updateOne(
        { key: "users" },
        { $setOnInsert: { seq: 0 } },
        { upsert: true }
      );
    })().catch((error) => {
      modelBootstrapPromise = null;
      throw error;
    });
  }

  return modelBootstrapPromise;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
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

function buildDefaultHints(hints = {}) {
  return {
    neonMagnet: Number(hints.neonMagnet || 0),
    shadowLetter: Number(hints.shadowLetter || 0),
    underscoreReveal: Number(hints.underscoreReveal || 0),
    firstLetterBloom: Number(hints.firstLetterBloom || 0),
  };
}

function isDuplicateKeyError(error) {
  return error && (error.code === 11000 || error.code === 11001);
}

async function getNextSequence(key) {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.seq;
}

async function ensurePremiumState(userDoc) {
  if (!userDoc) return;

  if (userDoc.premium && userDoc.premiumExpiry && userDoc.premiumExpiry.getTime() <= Date.now()) {
    userDoc.premium = false;
    userDoc.premiumTier = null;
    userDoc.premiumExpiry = null;
    await userDoc.save();
  }
}

async function getUserById(userId) {
  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId)) return null;

  const userDoc = await User.findOne({ userId: numericUserId });
  if (!userDoc) return null;

  await ensurePremiumState(userDoc);

  return {
    id: userDoc.userId,
    gmail: userDoc.gmail,
    username: userDoc.username,
    coins: Number(userDoc.coins || 0),
    score: Number(userDoc.score || 0),
    profilePicture: userDoc.profilePicture || "",
    fullName: userDoc.fullName || "",
    premium: Boolean(userDoc.premium),
    premiumTier: userDoc.premiumTier || null,
    premiumExpiry: userDoc.premiumExpiry || null,
    hints: buildDefaultHints(userDoc.hints || {}),
    createdAt: userDoc.createdAt,
  };
}

async function getUserByGmail(gmail) {
  const cleanGmail = String(gmail || "").trim().toLowerCase();
  if (!cleanGmail) return null;

  const userDoc = await User.findOne({ gmail: cleanGmail });
  if (!userDoc) return null;

  return getUserById(userDoc.userId);
}

function buildUserPayload(user, extras = {}) {
  const merged = {
    ...user,
    profilePicture: extras.profilePicture || user.profilePicture || "",
    fullName: extras.fullName || user.fullName || "",
  };

  return {
    id: Number(merged.id),
    gmail: merged.gmail,
    username: merged.username,
    coins: Number(merged.coins || 0),
    score: Number(merged.score || 0),
    profilePicture: merged.profilePicture || "",
    fullName: merged.fullName || "",
    premium: Boolean(merged.premium),
    premiumTier: merged.premiumTier || null,
    premiumExpiry: merged.premiumExpiry || null,
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

async function recordWalletTransaction({
  userId,
  type,
  amount = 0,
  coinsChange = 0,
  details = null,
}) {
  const parsedDetails = details || {};
  const aggregateKey = buildWalletAggregateKey(type, parsedDetails);

  await WalletTransaction.findOneAndUpdate(
    { userId: Number(userId), aggregateKey },
    {
      $set: {
        transactionType: type,
        details: parsedDetails,
        lastTransactionAt: new Date(),
      },
      $inc: {
        amount: Number(amount || 0),
        coinsChange: Number(coinsChange || 0),
        transactionCount: 1,
      },
      $setOnInsert: {
        userId: Number(userId),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertLeaderboardEntry(userId, scoreOverride = null, mode = "player1") {
  const user = await User.findOne({ userId: Number(userId) });

  if (!user) {
    throw new Error("User not found for leaderboard sync");
  }

  const leaderboardScore =
    scoreOverride === null
      ? Number(user.score || 0)
      : Math.max(0, Number(scoreOverride || 0));

  await Leaderboard.findOneAndUpdate(
    { userId: user.userId, mode },
    {
      $set: {
        username: user.username,
        score: leaderboardScore,
      },
      $setOnInsert: {
        gamesPlayed: 0,
        wins: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function incrementLeaderboardGamesPlayed(userId, mode = "player1") {
  const user = await User.findOne({ userId: Number(userId) });
  if (!user) return;

  await Leaderboard.findOneAndUpdate(
    { userId: user.userId, mode },
    {
      $set: {
        username: user.username,
      },
      $max: {
        score: Number(user.score || 0),
      },
      $inc: {
        gamesPlayed: 1,
      },
      $setOnInsert: {
        wins: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function initializeNewUserData(userId) {
  const initializationErrors = [];

  try {
    await upsertLeaderboardEntry(userId);
  } catch (error) {
    console.error("LEADERBOARD INIT ERROR:", error);
    initializationErrors.push("leaderboard");
  }

  return initializationErrors;
}

async function buildRegisterResponse(userId, extras = {}) {
  const insertedUser = await getUserById(userId);

  if (!insertedUser) {
    throw new Error("User account was created but could not be loaded");
  }

  return buildAuthResponse(insertedUser, extras);
}

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/healthz", async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    await mongoose.connection.db.command({ ping: 1 });

    res.json({ ok: true, message: "Backend and MongoDB are reachable" });
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
      await User.updateOne(
        { userId: existingUser.id },
        {
          $set: {
            profilePicture: googleUser.picture || "",
            fullName: googleUser.name || "",
          },
        }
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

    const usernameCheck = await User.findOne({
      username: cleanUsername,
      gmail: { $ne: gmail },
    }).select("userId");

    if (usernameCheck) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingUser = await getUserByGmail(gmail);

    if (existingUser) {
      await User.updateOne(
        { userId: existingUser.id },
        {
          $set: {
            username: cleanUsername,
            profilePicture: decoded.profilePicture || "",
            fullName: decoded.fullName || "",
          },
        }
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

    const nextUserId = await getNextSequence("users");

    await User.create({
      userId: nextUserId,
      gmail,
      username: cleanUsername,
      password: hashedPassword,
      profilePicture: decoded.profilePicture || "",
      fullName: decoded.fullName || "",
      hints: buildDefaultHints(),
    });

    const initializationErrors = await initializeNewUserData(nextUserId);

    const authResponse = await buildRegisterResponse(nextUserId, {
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
      return res
        .status(401)
        .json({ message: "Google session expired. Please continue with Google again." });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: "Username or Gmail already exists" });
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

    const existingUsername = await User.exists({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingGmail = await User.exists({ gmail });
    if (existingGmail) {
      return res.status(400).json({ message: "Gmail already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nextUserId = await getNextSequence("users");

    await User.create({
      userId: nextUserId,
      gmail,
      username,
      password: hashedPassword,
      profilePicture: "",
      fullName: "",
      hints: buildDefaultHints(),
    });

    const initializationErrors = await initializeNewUserData(nextUserId);

    const authResponse = await buildRegisterResponse(nextUserId);
    return res.status(201).json({
      ...authResponse,
      warning: initializationErrors.length
        ? `Account created. Some profile extras were retried later: ${initializationErrors.join(", ")}`
        : undefined,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: "Username or Gmail already exists" });
    }

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

    const userDoc = await User.findOne({ username });

    if (!userDoc) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const fullUser = await getUserById(userDoc.userId);
    return res.json(buildAuthResponse(fullUser));
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message || "Login failed" });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { gmail } = req.body;

    if (!gmail) {
      return res.status(400).json({ message: "Gmail is required" });
    }

    const cleanGmail = String(gmail).trim().toLowerCase();
    const userDoc = await User.findOne({ gmail: cleanGmail });

    if (!userDoc) {
      return res.status(404).json({ message: "No account found with that Gmail" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.create({
      userId: userDoc.userId,
      resetToken,
      expiresAt,
    });

    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${frontendBase}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanGmail,
      subject: "Reset Your Password",
      html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>
          `,
    });

    return res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Database error during forgot password" });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const resetDoc = await PasswordReset.findOne({
      resetToken: token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetDoc) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    await User.updateOne({ userId: resetDoc.userId }, { $set: { password: hashedPassword } });
    await PasswordReset.deleteMany({ userId: resetDoc.userId });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/buy-coins", verifyToken, async (req, res) => {
  try {
    const { coins_bought, amount } = req.body;
    const userId = Number(req.user.id);

    const safeCoinsBought = Number(coins_bought);
    const safeAmount = Number(amount);

    if (
      !Number.isFinite(safeCoinsBought) ||
      safeCoinsBought <= 0 ||
      !Number.isFinite(safeAmount) ||
      safeAmount <= 0
    ) {
      return res.status(400).json({ message: "Coins and amount are required" });
    }

    await User.updateOne({ userId }, { $inc: { coins: safeCoinsBought } });

    await CoinPurchase.create({
      userId,
      coinsBought: safeCoinsBought,
      amount: safeAmount,
    });

    await recordWalletTransaction({
      userId,
      type: "buy_coins",
      amount: safeAmount,
      coinsChange: safeCoinsBought,
      details: { coinsBought: safeCoinsBought },
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
    const userId = Number(req.user.id);
    const spendAmount = Number(amount);

    if (!Number.isFinite(spendAmount) || spendAmount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Number(userDoc.coins || 0) < spendAmount) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    userDoc.coins = Number(userDoc.coins || 0) - spendAmount;
    await userDoc.save();

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
    const userId = Number(req.user.id);
    const safeQuantity = Number(quantity);
    const safeCost = Number(cost);

    if (!HINT_KEYS.includes(hintKey)) {
      return res.status(400).json({ message: "Invalid hint key" });
    }

    if (
      !Number.isFinite(safeQuantity) ||
      safeQuantity <= 0 ||
      !Number.isFinite(safeCost) ||
      safeCost <= 0
    ) {
      return res.status(400).json({ message: "Invalid cost or quantity" });
    }

    const totalCost = safeCost * safeQuantity;

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Number(userDoc.coins || 0) < totalCost) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    userDoc.coins = Number(userDoc.coins || 0) - totalCost;
    userDoc.hints = buildDefaultHints(userDoc.hints || {});
    userDoc.hints[hintKey] = Number(userDoc.hints[hintKey] || 0) + safeQuantity;
    await userDoc.save();

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
    const userId = Number(req.user.id);

    if (!HINT_KEYS.includes(hintKey)) {
      return res.status(400).json({ message: "Invalid hint key" });
    }

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    userDoc.hints = buildDefaultHints(userDoc.hints || {});
    const currentQty = Number(userDoc.hints[hintKey] || 0);

    if (currentQty <= 0) {
      return res.status(400).json({ message: "No hint inventory left" });
    }

    userDoc.hints[hintKey] = currentQty - 1;
    await userDoc.save();

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
    const userId = Number(req.user.id);
    const safeCost = Number(cost);
    const safeDays = Number(days);
    const safeBonusCoins = Number(bonusCoins || 0);

    if (
      !name ||
      !Number.isFinite(safeCost) ||
      safeCost < 0 ||
      !Number.isFinite(safeDays) ||
      safeDays <= 0
    ) {
      return res.status(400).json({ message: "Invalid premium package" });
    }

    const tierCode = PREMIUM_TIER_MAP[name] || name.toLowerCase().replace(/\s+/g, "_");

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Number(userDoc.coins || 0) < safeCost) {
      return res.status(400).json({ message: "Not enough coins for subscription" });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + safeDays);

    userDoc.coins = Number(userDoc.coins || 0) - safeCost + safeBonusCoins;
    userDoc.premium = true;
    userDoc.premiumTier = tierCode;
    userDoc.premiumExpiry = expiry;
    await userDoc.save();

    await PremiumPurchase.create({
      userId,
      premiumTier: tierCode,
      costCoins: safeCost,
      durationDays: safeDays,
      bonusCoins: safeBonusCoins,
      expiresAt: expiry,
    });

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
    const cleanPreferredMethod = ["email", "phone"].includes(preferredMethod)
      ? preferredMethod
      : "email";
    const cleanMessage = String(message || "").trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      preferredMethod: cleanPreferredMethod,
      message: cleanMessage,
    });

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
          <div style="white-space: pre-wrap; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">${cleanMessage
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</div>
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
    const userId = Number(req.user.id);

    if (score === undefined || !Number.isFinite(Number(score))) {
      return res.status(400).json({ message: "Valid score is required" });
    }

    const safeScore = Math.max(0, Number(score));

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    userDoc.score = Math.max(Number(userDoc.score || 0), safeScore);
    await userDoc.save();

    if (gameCompleted) {
      await upsertLeaderboardEntry(userId, safeScore, mode);
      await incrementLeaderboardGamesPlayed(userId, mode);

      if (won) {
        await Leaderboard.updateOne({ userId, mode }, { $inc: { wins: 1 } });
      }
    }

    const user = await getUserById(userId);
    return res.json({ message: "Score updated successfully", user: buildUserPayload(user) });
  } catch (error) {
    console.error("UPDATE SCORE ERROR:", error);
    return res.status(500).json({ message: "Failed to update score" });
  }
});

app.get("/leaderboards", async (req, res) => {
  try {
    const leaderboardRows = await Leaderboard.find({ mode: "player1" })
      .sort({ score: -1, username: 1 })
      .limit(100)
      .lean();

    const userIds = leaderboardRows.map((row) => row.userId);
    const users = await User.find({ userId: { $in: userIds } })
      .select("userId gmail coins premiumTier profilePicture")
      .lean();

    const userMap = new Map(users.map((user) => [user.userId, user]));

    const combined = leaderboardRows
      .map((row) => {
        const user = userMap.get(row.userId) || {};
        return {
          userId: row.userId,
          username: row.username,
          gmail: user.gmail || "",
          score: Number(row.score || 0),
          coins: Number(user.coins || 0),
          gamesPlayed: Number(row.gamesPlayed || 0),
          wins: Number(row.wins || 0),
          premiumTier: user.premiumTier || null,
          profilePicture: user.profilePicture || "",
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.coins !== a.coins) return b.coins - a.coins;
        return String(a.username).localeCompare(String(b.username));
      });

    return res.json({
      mode: "player1",
      entries: combined.map((row, index) => ({
        rank: index + 1,
        ...row,
      })),
    });
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(buildUserPayload(user));
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});

if (require.main === module) {
  (async () => {
    try {
      await ensureDatabaseInitialized();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("DATABASE INITIALIZATION ERROR:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  app,
  ensureDatabaseInitialized,
};
