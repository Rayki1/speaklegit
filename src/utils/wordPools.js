/**
 * ===== WORD POOLS LIBRARY =====
 * 
 * PURPOSE:
 * Centralized repository of words for all game types and difficulty levels.
 * 
 * STRUCTURE:
 * Each export contains objects with easy/medium/hard arrays:
 * - pronunciationWords: Words for pronunciation practice
 * - readingWords: Words for reading comprehension
 * - spellingWords: Words for spelling challenges
 * - vocabularyWords: Word-definition pairs for vocabulary building
 * 
 * DIFFICULTY PROGRESSION:
 * - Easy: Short, common words (3-5 letters)
 * - Medium: Longer, more complex words (6-12 letters)
 * - Hard: Advanced, sophisticated vocabulary (10+ letters)
 */

// ===== PRONUNCIATION WORD POOLS =====
// Used by Pronunciation game module
export const pronunciationWords = {
  // EASY: Simple 2-4 letter words for beginners
  easy: [
    "cat", "dog", "run", "sit", "jump", "play", "eat", "sleep",
    "book", "pen", "desk", "house", "tree", "sun", "moon", "star",
    "water", "fire", "bread", "milk", "fish", "bird", "car", "bike",
    "hat", "bat", "rat", "mat", "fan", "can", "man", "pan",
    "bed", "red", "led", "fed", "box", "fox", "mix", "fix",
    "top", "pop", "mop", "shop", "bag", "tag", "rag", "wag",
    "cup", "pup", "sup", "nut", "hut", "cut", "but", "shut",
    "yes", "leg", "beg", "peg", "pin", "win", "bin", "tin",
    "hot", "pot", "dot", "got", "wet", "pet", "set", "net",
    "big", "dig", "pig", "wig", "lip", "dip", "hip", "tip",
    "fun", "bun", "sun", "run", "sad", "mad", "bad", "had",
    "day", "way", "say", "pay", "see", "bee", "fee", "tea",
    "go", "no", "so", "to", "up", "us", "as", "is",
    "jam", "map", "lamp", "kite", "snow"
  ],
  // MEDIUM: Multi-syllable words, common vocabulary (6-12 letters)
  medium: [
    "confidence", "clarity", "practice", "pronunciation", "knowledge", "education",
    "library", "computer", "language", "vocabulary", "conversation", "grammar",
    "dictionary", "literature", "alphabet", "sentence", "paragraph", "important",
    "excellent", "beautiful", "dangerous", "delicious", "comfortable", "impossible",
    "adventure", "attention", "atmosphere", "audience", "authority", "available",
    "balance", "behavior", "benefit", "brilliant", "business", "calendar",
    "candidate", "capacity", "category", "celebrate", "ceremony", "challenge",
    "character", "chocolate", "circumstance", "classroom", "collection", "combination",
    "committee", "community", "companion", "comparison", "competition", "comprehend",
    "concentrate", "condition", "confidence", "connection", "consequence", "consider",
    "continue", "contribution", "convenient", "cooperation", "coordinate", "creative",
    "curiosity", "customer", "decision", "definition", "delicate", "democracy",
    "demonstrate", "departure", "dependent", "description", "determine", "develop",
    "difference", "difficult", "dimension", "direction", "disadvantage", "discipline",
    "discovery", "discussion", "distribution", "document", "domestic", "dramatic",
    "generation", "guidance", "identity", "landmark", "narrative"
  ],
  // HARD: Advanced vocabulary, challenging pronunciations (10+ letters)
  hard: [
    "onomatopoeia", "eloquence", "serendipity", "perspicacious", "mellifluous",
    "ubiquitous", "ephemeral", "cogent", "paradigm", "obsequious", "pusillanimous",
    "perspicuity", "ennui", "cacophony", "ameliorate", "pellucid", "incongruent",
    "sanguine", "perfunctory", "efficacious", "ebullient", "erudite", "capricious",
    "acquiesce", "acrimonious", "anachronism", "anathema", "bellicose", "benevolent",
    "bourgeois", "callous", "capricious", "circumlocution", "clandestine", "commensurate",
    "compendium", "connoisseur", "contemptuous", "contentious", "corroborate", "deleterious",
    "delineate", "denigrate", "deprecate", "derisive", "desultory", "dichotomy",
    "didactic", "digression", "dilettante", "disingenuous", "ebullient", "eclectic",
    "effervescent", "effrontery", "egregious", "elegy", "eloquent", "emancipate",
    "embellish", "emulate", "enervate", "enigmatic", "epitome", "equanimity",
    "equivocate", "erudite", "eschew", "esoteric", "ethereal", "euphemism",
    "exacerbate", "exculpate", "exemplary", "exhaustive", "exonerate", "expedient",
    "extrapolate", "facetious", "fallacious", "fastidious", "feckless", "felicitous",
    "impecunious", "intransigent", "munificent", "obstreperous", "parsimonious"
  ]
};

// ===== READING WORD POOLS =====
// Used for reading comprehension exercises
export const readingWords = {
  // EASY: Basic everyday vocabulary
  easy: [
    "apple", "banana", "orange", "table", "chair", "door", "window",
    "picture", "color", "number", "letter", "word", "page", "friend",
    "family", "school", "teacher", "student", "happy", "sad", "big", "small",
    "flower", "garden", "kitchen", "bedroom", "bathroom", "garage", "umbrella",
    "rainbow", "cloud", "rain", "snow", "thunder", "lightning", "storm",
    "mountain", "river", "ocean", "beach", "forest", "desert", "valley",
    "morning", "evening", "night", "today", "tomorrow", "yesterday", "always",
    "never", "sometimes", "often", "usually", "maybe", "perhaps", "because",
    "before", "after", "during", "while", "until", "since", "although",
    "chocolate", "candy", "cookie", "cake", "pizza", "burger", "sandwich",
    "breakfast", "lunch", "dinner", "snack", "drink", "juice", "coffee"
  ],
  // MEDIUM: Common nouns, verbs, and adjectives with more syllables
  medium: [
    "adventure", "butterfly", "calendar", "dangerous", "elephant", "forest", "garden",
    "hurricane", "island", "jellyfish", "keyboard", "landscape", "mountain", "notebook",
    "orchestra", "penguin", "question", "restaurant", "sandwich", "telephone", "universe",
    "acceleration", "achievement", "acquisition", "adaptable", "adventure", "affection",
    "agriculture", "alternative", "ambition", "analysis", "anniversary", "appearance",
    "application", "appreciate", "arrangement", "assignment", "assistance", "assumption",
    "atmosphere", "attachment", "attraction", "authority", "availability", "awareness",
    "background", "basketball", "beautiful", "beginning", "behavior", "belligerent",
    "beneficial", "biological", "bravery", "brilliant", "calculator", "campaign",
    "capability", "catastrophe", "celebrate", "centimeter", "ceremony", "challenge",
    "champion", "character", "chemistry", "chocolate", "circulation", "civilization",
    "clarification", "classification", "combination", "comfortable", "commander"
  ],
  // HARD: Technical and academic vocabulary
  hard: [
    "archaeology", "bibliography", "calligraphy", "denouement", "encyclopedia", "fahrenheit",
    "genealogy", "hypothesis", "infrastructure", "jurisdiction", "kaleidoscope", "lexicon",
    "manuscript", "nomenclature", "orthography", "paleontology", "quotient", "reconnaissance",
    "aberration", "abstemious", "acclimatization", "accomplishment", "accumulation", "acknowledgment",
    "acquaintance", "administration", "advantageous", "adversarial", "aesthetically", "affirmative",
    "aggrandizement", "alimentation", "alphabetically", "amalgamation", "ambidextrous", "amelioration",
    "amphitheater", "anesthetize", "annihilation", "anthropology", "antidisestablishmentarianism",
    "apocalyptic", "apothecary", "appreciation", "apprehension", "archaeological", "architectural",
    "argumentative", "arithmetical", "assassination", "astronomical", "asynchronous", "atmospheric"
  ]
};

// ===== SPELLING WORD POOLS =====
// Used for word scramble/spelling challenges
export const spellingWords = {
  // EASY: Simple words for younger learners
  easy: [
    "hello", "world", "please", "thank", "sorry", "friend", "school",
    "water", "apple", "orange", "monkey", "bicycle", "elephant", "dinosaur",
    "pizza", "chocolate", "umbrella", "rainbow", "butterfly", "penguin",
    "castle", "dragon", "wizard", "princess", "robot", "rocket", "planet",
    "tiger", "lion", "bear", "rabbit", "turtle", "chicken", "horse",
    "happy", "sunny", "funny", "lucky", "pretty", "silly", "windy",
    "beach", "party", "music", "dance", "smile", "laugh", "dream",
    "magic", "story", "candy", "cookie", "honey", "jelly", "butter",
    "purple", "yellow", "orange", "green", "silver", "golden", "bright",
    "summer", "winter", "spring", "autumn", "season", "weather", "nature"
  ],
  // MEDIUM: Commonly misspelled words
  medium: [
    "address", "beautiful", "beginning", "believe", "calendar", "committee",
    "different", "education", "excellent", "favorite", "immediately", "knowledge",
    "necessary", "occur", "particular", "receive", "separate", "successful", "usually", "weird",
    "absence", "abundance", "acceptable", "accessible", "accidentally", "accommodate",
    "accompanied", "accomplish", "accordance", "accurate", "achievement", "acknowledge",
    "acquaintance", "acquire", "across", "actually", "adequate", "adjacent",
    "adjustment", "admirable", "admission", "adolescent", "advantage", "advertisement",
    "affectionate", "affordable", "aggressive", "agreeable", "agriculture", "aisle",
    "alcohol", "allowance", "although", "aluminum", "amateur", "ambassador",
    "ambulance", "analysis", "ancient", "anniversary", "announcement", "anonymous"
  ],
  // HARD: Notoriously difficult spellings
  hard: [
    "accommodate", "bureaucracy", "chauffeur", "conscientious", "curriculum", "dachshund",
    "embarrassment", "entrepreneur", "fluorescent", "gauge", "handkerchief", "ignorance",
    "jurisdiction", "knowledgeable", "lieutenant", "maneuver", "necessary", "occasionally",
    "abstemious", "acquiesce", "acrimonious", "adjudicate", "aggrandize", "algorithm",
    "ameliorate", "anachronism", "anecdote", "anomalous", "antecedent", "antipathy",
    "apocalypse", "apotheosis", "archaeology", "archaic", "archipelago", "asphyxiate",
    "asymmetrical", "auxiliary", "balustrade", "belligerent", "bibliophile", "bourgeois",
    "brusque", "bureaucratic", "cacophony", "camaraderie", "cartographer", "catastrophe",
    "chanteuse", "chiaroscuro", "cholesterol", "chrysanthemum", "cinnamon", "circumlocution",
    "claustrophobic", "cognizant", "colloquial", "commemorate", "commissary", "connoisseur"
  ]
};

// ===== VOCABULARY WORD POOLS =====
// Word-meaning pairs for vocabulary building exercises
export const vocabularyWords = {
  // EASY: Simple adjectives and basic vocabulary
  easy: [
    { word: "happy", meaning: "feeling or showing pleasure" },
    { word: "quick", meaning: "moving fast" },
    { word: "bright", meaning: "giving out much light" },
    { word: "calm", meaning: "peaceful and quiet" },
    { word: "clever", meaning: "intelligent and smart" },
    { word: "cozy", meaning: "warm and comfortable" },
    { word: "fresh", meaning: "recently made or obtained" },
    { word: "kind", meaning: "caring and helpful" },
    { word: "brave", meaning: "showing courage" },
    { word: "gentle", meaning: "mild and kind" },
    { word: "honest", meaning: "truthful and sincere" },
    { word: "joyful", meaning: "full of happiness" },
    { word: "loud", meaning: "making much noise" },
    { word: "neat", meaning: "tidy and organized" },
    { word: "polite", meaning: "showing good manners" },
    { word: "proud", meaning: "feeling satisfaction" },
    { word: "quiet", meaning: "making little noise" },
    { word: "rude", meaning: "not polite" },
    { word: "safe", meaning: "free from danger" },
    { word: "shy", meaning: "nervous around people" },
    { word: "silly", meaning: "foolish in a funny way" },
    { word: "strong", meaning: "having great power" },
    { word: "tiny", meaning: "very small" },
    { word: "wise", meaning: "having knowledge" },
  ],
  medium: [
    { word: "benevolent", meaning: "kind and generous" },
    { word: "persistent", meaning: "continuing firmly" },
    { word: "eloquent", meaning: "fluent and expressive" },
    { word: "pragmatic", meaning: "practical and realistic" },
    { word: "meticulous", meaning: "showing great attention to detail" },
    { word: "vivacious", meaning: "lively and energetic" },
    { word: "juxtapose", meaning: "to place side by side" },
    { word: "ambiguous", meaning: "open to more than one interpretation" },
    { word: "abundant", meaning: "existing in large quantities" },
    { word: "adamant", meaning: "refusing to change one's mind" },
    { word: "adverse", meaning: "harmful or unfavorable" },
    { word: "candid", meaning: "truthful and straightforward" },
    { word: "cynical", meaning: "distrustful of human sincerity" },
    { word: "diligent", meaning: "showing care and effort" },
    { word: "ecstatic", meaning: "feeling overwhelming happiness" },
    { word: "elusive", meaning: "difficult to find or catch" },
    { word: "emulate", meaning: "to imitate with effort to equal" },
    { word: "falter", meaning: "to lose strength or momentum" },
    { word: "frivolous", meaning: "not having serious purpose" },
    { word: "gregarious", meaning: "fond of company" },
  ],
  hard: [
    { word: "perspicacious", meaning: "having keen insight" },
    { word: "laconic", meaning: "using very few words" },
    { word: "obfuscate", meaning: "to make unclear or obscure" },
    { word: "sanguine", meaning: "optimistic in outlook" },
    { word: "pellucid", meaning: "translucently clear" },
    { word: "ephemeral", meaning: "lasting a very short time" },
    { word: "sesquipedalian", meaning: "characterized by long words" },
    { word: "antediluvian", meaning: "extremely old-fashioned" },
    { word: "bellicose", meaning: "demonstrating aggression" },
    { word: "cacophony", meaning: "harsh discordant mixture of sounds" },
    { word: "capricious", meaning: "given to sudden changes of mood" },
    { word: "convoluted", meaning: "extremely complex and difficult" },
    { word: "deleterious", meaning: "causing harm or damage" },
    { word: "ebullient", meaning: "cheerful and full of energy" },
    { word: "erudite", meaning: "having great knowledge" },
    { word: "esoteric", meaning: "intended for a small group" },
    { word: "fastidious", meaning: "very attentive to detail" },
    { word: "idiosyncratic", meaning: "peculiar or individual" },
    { word: "imperious", meaning: "arrogant and domineering" },
    { word: "loquacious", meaning: "tending to talk a great deal" },
  ]
};

// Helper functions
export function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomWords(words, count = 1) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(getRandomWord(words));
  }
  return result;
}

export function getRandomWordsByDifficulty(wordPool, difficulty, count = 1) {
  const words = wordPool[difficulty] || wordPool.easy;
  if (!Array.isArray(words) || words.length === 0) return [];

  const shuffled = shuffleArray(words);
  const target = Math.min(count, shuffled.length);
  return shuffled.slice(0, target);
}

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
