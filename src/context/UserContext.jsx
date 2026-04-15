import { createContext, useEffect, useMemo, useState } from "react";
import { awardBadgeForStreak, calculatePoints } from "../utils/scoring";
import API_BASE_URL, { apiUrl } from "../utils/api";

export const UserContext = createContext(null);


const initialProgress = {
  wordsPracticed: 0,
  levelsCompleted: 0,
};

const initialHints = {
  neonMagnet: 0,
  shadowLetter: 0,
  underscoreReveal: 0,
  firstLetterBloom: 0,
};

const normalizeHints = (hints = {}) => ({
  ...initialHints,
  ...hints,
});

const initialLeaderboard = [];

const getDefaultUser = () => ({
  name: "Guest",
  loggedIn: false,
  isGuest: false,
  score: 0,
  badges: [],
  streak: 0,
  progress: initialProgress,
  coins: 0,
  premium: false,
  premiumTier: null,
  premiumExpiry: null,
  gmail: "",
  id: null,
  username: "Guest",
  hints: initialHints,
  profilePicture: "",
  fullName: "",
});

const savedUser = localStorage.getItem("user");
const parsedUser = savedUser ? JSON.parse(savedUser) : null;

const initialUser = parsedUser
  ? {
      name: parsedUser.username || parsedUser.name || "Guest",
      loggedIn: parsedUser.loggedIn ?? true,
      isGuest: Boolean(parsedUser.isGuest),
      score: parsedUser.score || 0,
      badges: parsedUser.badges || [],
      streak: parsedUser.streak || 0,
      progress: parsedUser.progress || initialProgress,
      coins: parsedUser.coins || 0,
      premium: parsedUser.premium || false,
      premiumTier: parsedUser.premiumTier || null,
      premiumExpiry: parsedUser.premiumExpiry || null,
      gmail: parsedUser.gmail || "",
      id: parsedUser.id || null,
      username: parsedUser.username || parsedUser.name || "Guest",
      hints: normalizeHints(parsedUser.hints),
      profilePicture: parsedUser.profilePicture || "",
      fullName: parsedUser.fullName || "",
    }
  : getDefaultUser();

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);

  const persistUser = (updatedUser) => {
    if (updatedUser?.isGuest) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return;
    }

    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const mergeUserData = (baseUser, userData = {}) => ({
    ...baseUser,
    name: userData.username || userData.name || baseUser.name || "Guest",
    username: userData.username || userData.name || baseUser.username || "Guest",
    gmail: userData.gmail ?? baseUser.gmail ?? "",
    id: userData.id ?? baseUser.id ?? null,
    coins: userData.coins ?? baseUser.coins ?? 0,
    score: userData.score ?? baseUser.score ?? 0,
    badges: userData.badges || baseUser.badges || [],
    streak: userData.streak ?? baseUser.streak ?? 0,
    progress: userData.progress || baseUser.progress || initialProgress,
    premium: userData.premium ?? baseUser.premium ?? false,
    premiumTier: userData.premiumTier ?? baseUser.premiumTier ?? null,
    premiumExpiry: userData.premiumExpiry ?? baseUser.premiumExpiry ?? null,
    hints: normalizeHints(userData.hints || baseUser.hints),
    profilePicture: userData.profilePicture ?? baseUser.profilePicture ?? "",
    fullName: userData.fullName ?? baseUser.fullName ?? "",
    loggedIn: userData.loggedIn ?? true,
    isGuest: userData.isGuest ?? baseUser.isGuest ?? false,
  });

  const setAndPersistUser = (updater) => {
    setUser((prev) => {
      const nextUser = typeof updater === "function" ? updater(prev) : updater;
      persistUser(nextUser);
      return nextUser;
    });
  };

  const authenticatedFetch = async (path, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token || user.isGuest) {
      throw new Error("Please login or create account.");
    }

    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    if (data.user) {
      setAndPersistUser((prev) => mergeUserData(prev, data.user));
    }

    return data;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || user.isGuest) return;

    authenticatedFetch("/me").catch((error) => {
      console.error("LOAD USER ERROR:", error);
    });
  }, []);

  const login = (userData) => {
    const updatedUser = mergeUserData(getDefaultUser(), userData);
    setUser(updatedUser);
    persistUser(updatedUser);
  };

  const loginAsGuest = (username) => {
    const cleanName = (username || "Guest").trim();
    const guestUser = {
      ...getDefaultUser(),
      loggedIn: true,
      isGuest: true,
      name: cleanName,
      username: cleanName,
    };

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(guestUser);
  };

  const setUserData = (updatedFields) => {
    setAndPersistUser((prev) => mergeUserData(prev, updatedFields));
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(getDefaultUser());
  };

  const addScore = (difficulty, correct = true) => {
    const points = calculatePoints(difficulty, correct);

    if (points > 0 && user.loggedIn && !user.isGuest) {
      syncLeaderboardScore(points, "player1").catch((error) => {
        console.error("ADD SCORE SYNC ERROR:", error);
      });
    }

    return points;
  };

  const syncLeaderboardScore = async (points, mode = "player1") => {
    const safePoints = Math.max(0, Number(points || 0));

    if (!safePoints || !user.loggedIn || user.isGuest || mode !== "player1") {
      return null;
    }

    setAndPersistUser((prev) => ({
      ...prev,
      score: Number(prev.score || 0) + safePoints,
    }));

    try {
      const response = await authenticatedFetch("/update-score", {
        method: "POST",
        body: JSON.stringify({
          score: safePoints,
          mode,
          gameCompleted: false,
          won: false,
        }),
      });

      updateLeaderboard(user.name, safePoints);
      fetchLeaderboard();
      return response;
    } catch (error) {
      console.error("LEADERBOARD SYNC ERROR:", error);
      authenticatedFetch("/me").catch(() => {});
      throw error;
    }
  };

  const finalizeRoundScore = async (roundScore, options = {}) => {
    const safeRoundScore = Math.max(0, Number(roundScore || 0));
    const { mode = "player1", won = false } = options;

    if (!user.loggedIn || user.isGuest) {
      setAndPersistUser((prev) => ({
        ...prev,
        score: Number(prev.score || 0) + safeRoundScore,
      }));
      return { offline: true, score: safeRoundScore };
    }

    try {
      const response = await authenticatedFetch("/update-score", {
        method: "POST",
        body: JSON.stringify({
          score: safeRoundScore,
          mode,
          gameCompleted: true,
          won,
        }),
      });

      updateLeaderboard(user.name, safeRoundScore);
      fetchLeaderboard();
      return response;
    } catch (error) {
      console.error("FINALIZE ROUND SCORE ERROR:", error);
      throw error;
    }
  };

  const updateStreak = (increment = true) => {
    setAndPersistUser((prev) => {
      const nextStreak = increment ? prev.streak + 1 : 0;
      const badge = awardBadgeForStreak(nextStreak);
      const badges = badge && !prev.badges.includes(badge) ? [...prev.badges, badge] : prev.badges;

      return { ...prev, streak: nextStreak, badges };
    });
  };

  const addWordPracticed = () => {
    setAndPersistUser((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        wordsPracticed: prev.progress.wordsPracticed + 1,
      },
    }));
  };

  const completeLevel = () => {
    setAndPersistUser((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        levelsCompleted: prev.progress.levelsCompleted + 1,
      },
    }));
  };

  const addCoins = (amount) => {
    setAndPersistUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  const spendCoins = (amount, reason = "spend", details = null) => {
    if (user.isGuest || user.coins < amount) {
      return false;
    }

    setAndPersistUser((prev) => ({
      ...prev,
      coins: prev.coins - amount,
    }));

    authenticatedFetch("/spend-coins", {
      method: "POST",
      body: JSON.stringify({ amount, reason, details }),
    }).catch((error) => {
      console.error("SPEND COINS SYNC ERROR:", error);
      authenticatedFetch("/me").catch(() => {});
    });

    return true;
  };

  const purchaseHint = (hintKey, cost, quantity = 1) => {
    const totalCost = cost * quantity;
    if (user.isGuest || user.coins < totalCost) {
      return false;
    }

    setAndPersistUser((prev) => ({
      ...prev,
      coins: prev.coins - totalCost,
      hints: {
        ...normalizeHints(prev.hints),
        [hintKey]: (prev.hints?.[hintKey] || 0) + quantity,
      },
    }));

    authenticatedFetch("/purchase-hint", {
      method: "POST",
      body: JSON.stringify({ hintKey, cost, quantity }),
    }).catch((error) => {
      console.error("PURCHASE HINT SYNC ERROR:", error);
      authenticatedFetch("/me").catch(() => {});
    });

    return true;
  };

  const consumeHint = (hintKey) => {
    const currentCount = user.hints?.[hintKey] || 0;
    if (currentCount <= 0) {
      return false;
    }

    setAndPersistUser((prev) => ({
      ...prev,
      hints: {
        ...normalizeHints(prev.hints),
        [hintKey]: Math.max((prev.hints?.[hintKey] || 0) - 1, 0),
      },
    }));

    if (!user.isGuest) {
      authenticatedFetch("/consume-hint", {
        method: "POST",
        body: JSON.stringify({ hintKey }),
      }).catch((error) => {
        console.error("CONSUME HINT SYNC ERROR:", error);
        authenticatedFetch("/me").catch(() => {});
      });
    }

    return true;
  };

  const getHintCount = (hintKey) => user.hints?.[hintKey] || 0;

  const canAfford = (amount) => !user.isGuest && user.coins >= amount;

  const purchasePremium = async ({ name, cost, days, bonusCoins = 0 }) => {
    if (user.isGuest) {
      throw new Error("Please login or create account.");
    }

    const response = await authenticatedFetch("/purchase-premium", {
      method: "POST",
      body: JSON.stringify({ name, cost, days, bonusCoins }),
    });

    return response;
  };

  const setPremium = (isPremium, expiryDate, premiumTier = null) => {
    setAndPersistUser((prev) => ({
      ...prev,
      premium: isPremium,
      premiumExpiry: expiryDate,
      premiumTier,
    }));
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboards`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      const entries = Array.isArray(data) ? data : Array.isArray(data.entries) ? data.entries : [];

      setLeaderboard(
        entries.map((entry, index) => ({
          rank: entry.rank || index + 1,
          name: entry.username || entry.name || "Player",
          username: entry.username || entry.name || "Player",
          gmail: entry.gmail || "",
          score: Number(entry.score || 0),
          coins: Number(entry.coins || 0),
          premiumTier: entry.premiumTier || entry.premium_tier || null,
          profilePicture: entry.profilePicture || entry.profile_picture || "",
          gamesPlayed: Number(entry.gamesPlayed || entry.games_played || 0),
          wins: Number(entry.wins || 0),
        }))
      );
    } catch (error) {
      console.error("FETCH LEADERBOARD ERROR:", error);
    }
  };

  const updateLeaderboard = (playerName, score) => {
    setLeaderboard((prev) => {
      const exists = prev.findIndex((entry) => entry.name === playerName);

      if (exists !== -1) {
        const updated = [...prev];
        updated[exists].score = Number(updated[exists].score || 0) + Number(score || 0);
        return updated.sort((a, b) => b.score - a.score);
      }

      const newLeaderboard = [...prev, { name: playerName, score }];
      return newLeaderboard.sort((a, b) => b.score - a.score).slice(0, 100);
    });
  };

  const getLeaderboard = () => leaderboard;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const value = useMemo(
    () => ({
      user,
      leaderboard,
      login,
      loginAsGuest,
      logout,
      setUserData,
      addScore,
      finalizeRoundScore,
      updateStreak,
      addWordPracticed,
      completeLevel,
      addCoins,
      spendCoins,
      purchaseHint,
      consumeHint,
      getHintCount,
      canAfford,
      setPremium,
      purchasePremium,
      syncLeaderboardScore,
      updateLeaderboard,
      getLeaderboard,
      refreshLeaderboard: fetchLeaderboard,
      refreshUser: () => authenticatedFetch("/me"),
    }),
    [user, leaderboard]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
