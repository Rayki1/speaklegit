const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let state = seed || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) % 4294967296) / 4294967296;
  };
}

export function seededShuffle(items, seedInput) {
  const seed = typeof seedInput === "number" ? seedInput : hashString(String(seedInput));
  const random = createSeededRandom(seed);
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function getAdaptiveDifficulty(difficulty, streak = 0, replaySeed = 0) {
  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  if (currentIndex === -1) return "medium";

  if (streak >= 6 && currentIndex < DIFFICULTY_ORDER.length - 1 && replaySeed % 2 === 0) {
    return DIFFICULTY_ORDER[currentIndex + 1];
  }

  if (streak <= 1 && currentIndex > 0 && replaySeed % 2 === 1) {
    return DIFFICULTY_ORDER[currentIndex - 1];
  }

  return difficulty;
}

function getTodayToken() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function readRecentIds(storageKey) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecentIds(storageKey, ids) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Ignore storage errors.
  }
}

export function buildQuestionDeck({
  items,
  count,
  gameKey,
  difficulty,
  replaySeed = 0,
  recentWindow = 36,
  getId,
}) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const safeCount = Math.max(1, Math.min(count, items.length));
  const dailySeed = `${gameKey}:${difficulty}:${getTodayToken()}:${replaySeed}`;
  const shuffled = seededShuffle(items, dailySeed);

  const storageKey = `speaks-recent:${gameKey}:${difficulty}`;
  const recentIds = readRecentIds(storageKey);
  const idFor = (entry, index) => {
    if (typeof getId === "function") return String(getId(entry, index));
    return String(index);
  };

  const fresh = shuffled.filter((entry, index) => !recentIds.includes(idFor(entry, index)));
  const selected = (fresh.length >= safeCount ? fresh : shuffled).slice(0, safeCount);

  const newIds = selected.map((entry, index) => idFor(entry, index));
  const merged = [...newIds, ...recentIds.filter((id) => !newIds.includes(id))].slice(0, recentWindow);
  writeRecentIds(storageKey, merged);

  return selected;
}
