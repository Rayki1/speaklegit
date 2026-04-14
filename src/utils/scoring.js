/**
 * ===== SCORING UTILITIES =====
 * 
 * PURPOSE:
 * Helper functions for calculating points, awarding badges,
 * and managing leaderboard data.
 */

/**
 * CALCULATE POINTS
 * 
 * Determines how many points to award based on difficulty and correctness.
 * 
 * POINT SYSTEM:
 * - Easy: 10 points (1x multiplier)
 * - Medium: 15 points (1.5x multiplier)
 * - Hard: 25 points (2.5x multiplier)
 * - Incorrect: 0 points
 * 
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @param {boolean} correct - Whether answer was correct
 * @returns {number} Points awarded
 */
export function calculatePoints(difficulty, correct) {
  if (!correct) return 0;

  const pointsByDifficulty = {
    easy: 10,
    medium: 15,
    hard: 25,
  };

  return pointsByDifficulty[difficulty] || pointsByDifficulty.easy;
}

const TIMED_SCORING_BRACKETS = {
  easy: [
    { minRemaining: 11, points: 10, performance: "Epic" },
    { minRemaining: 6, points: 7, performance: "Good" },
    { minRemaining: 1, points: 4, performance: "Barely" },
  ],
  medium: [
    { minRemaining: 16, points: 15, performance: "Epic" },
    { minRemaining: 11, points: 10, performance: "Good" },
    { minRemaining: 1, points: 5, performance: "Barely" },
  ],
  hard: [
    { minRemaining: 25, points: 25, performance: "Epic" },
    { minRemaining: 15, points: 15, performance: "Good" },
    { minRemaining: 1, points: 5, performance: "Barely" },
  ],
};

const TIER_CALLOUTS = {
  1: ["GODLIKE!", "PERFECT!"],
  2: ["NICE!", "GREAT!"],
  3: ["SAFE!", "PHEW!"],
};

const TIMED_ROUND_SECONDS = {
  easy: 15,
  medium: 20,
  hard: 30,
};

const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

const REWARD_ANIMATION_DURATIONS = {
  1: 2000,
  2: 1200,
  3: 800,
};

const VICTORY_RANKS = [
  { minPercent: 90, label: "LEGENDARY!", icon: "🏅", accent: "gold" },
  { minPercent: 70, label: "PRO!", icon: "🏆", accent: "silver" },
  { minPercent: 50, label: "GOOD!", icon: "👍", accent: "good" },
  { minPercent: 0, label: "TRY AGAIN!", icon: "💪", accent: "retry" },
];

export function getTimedRoundSeconds(difficulty) {
  return TIMED_ROUND_SECONDS[difficulty] || TIMED_ROUND_SECONDS.easy;
}

export function getNextDifficulty(difficulty) {
  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  if (currentIndex === -1 || currentIndex >= DIFFICULTY_ORDER.length - 1) return null;
  return DIFFICULTY_ORDER[currentIndex + 1];
}

export function getTopTierPoints(difficulty) {
  const safeDifficulty = TIMED_SCORING_BRACKETS[difficulty] ? difficulty : "easy";
  return TIMED_SCORING_BRACKETS[safeDifficulty][0].points;
}

export function getRewardAnimationDuration(tier) {
  return REWARD_ANIMATION_DURATIONS[tier] || REWARD_ANIMATION_DURATIONS[2];
}

export function calculateTimedPoints(difficulty, timeRemaining, perfectTopBracketStreak = 0) {
  const safeDifficulty = TIMED_SCORING_BRACKETS[difficulty] ? difficulty : "easy";
  const safeTimeRemaining = Math.max(1, Math.floor(Number(timeRemaining || 0)));
  const brackets = TIMED_SCORING_BRACKETS[safeDifficulty];
  const matched = brackets.find((bracket) => safeTimeRemaining >= bracket.minRemaining) || brackets[brackets.length - 1];
  const isTopBracket = matched.minRemaining === brackets[0].minRemaining;
  const tier = isTopBracket ? 1 : matched.minRemaining === brackets[1].minRemaining ? 2 : 3;

  const nextTopBracketStreak = isTopBracket ? perfectTopBracketStreak + 1 : 0;
  const multiplier = isTopBracket && nextTopBracketStreak >= 3 ? 2 : 1;
  const points = Math.round(matched.points * multiplier);
  const calloutOptions = TIER_CALLOUTS[tier] || TIER_CALLOUTS[3];
  const callout = calloutOptions[safeTimeRemaining % calloutOptions.length];

  return {
    points,
    basePoints: matched.points,
    multiplier,
    performance: matched.performance,
    tier,
    callout,
    isTopBracket,
    nextTopBracketStreak,
  };
}

export function getVictoryRank(score, practiced, difficulty) {
  const safePracticed = Math.max(1, Number(practiced || 0));
  const topTierPoints = getTopTierPoints(difficulty);
  const percent = Math.max(0, Math.min(100, Math.round((Number(score || 0) / (safePracticed * topTierPoints)) * 100)));
  const rank = VICTORY_RANKS.find((entry) => percent >= entry.minPercent) || VICTORY_RANKS[VICTORY_RANKS.length - 1];

  return {
    ...rank,
    percent,
  };
}

/**
 * AWARD BADGE FOR STREAK
 * 
 * Awards achievement badges based on win streak length.
 * 
 * BADGE TIERS:
 * - 3+ streak: "Warm-Up Pro"
 * - 5+ streak: "Rising Speaker"
 * - 10+ streak: "Fluent Star"
 * 
 * @param {number} streak - Current win streak count
 * @returns {string|null} Badge name or null if no badge earned
 */
export function awardBadgeForStreak(streak) {
  if (streak >= 10) return "Fluent Star";  // Top tier badge
  if (streak >= 5) return "Rising Speaker";  // Mid tier badge
  if (streak >= 3) return "Warm-Up Pro";  // Entry tier badge
  return null;  // No badge yet
}

/**
 * GET SAMPLE LEADERBOARD
 * 
 * Returns mock leaderboard data for display.
 * In a real app, this would fetch from a database or API.
 * 
 * @returns {Array} Array of player objects with name, points, and badge
 */
export function getSampleLeaderboard() {
  return [
    { name: "Kai", points: 1200, badge: "Fluent Star" },
    { name: "Amira", points: 980, badge: "Rising Speaker" },
    { name: "Luis", points: 860, badge: "Warm-Up Pro" },
  ];
}
