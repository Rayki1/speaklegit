/**
 * ===== PRONUNCIATION HELPER UTILITIES =====
 * 
 * PURPOSE:
 * Provides tools to help users learn proper pronunciation through
 * syllable breakdown, phonetic guides, and pronunciation tips.
 */

/**
 * SYLLABLE BREAKDOWN
 * 
 * Breaks a word into approximate syllables based on vowel patterns.
 * Not 100% accurate but helpful for visual guidance.
 * 
 * ALGORITHM:
 * - Identifies vowel clusters (a, e, i, o, u, y)
 * - Splits on consonant boundaries between vowels
 * - Handles common patterns (silent e, double consonants)
 * 
 * @param {string} word - The word to break into syllables
 * @returns {string[]} Array of syllable strings
 * 
 * EXAMPLES:
 * - "hello" → ["hel", "lo"]
 * - "beautiful" → ["beau", "ti", "ful"]
 * - "see" → ["see"]
 * - "confidence" → ["con", "fi", "dence"]
 */
export function getSyllables(word) {
  const normalized = word.toLowerCase().trim();
  
  // Single letter or very short words (1-2 chars) are one syllable
  if (normalized.length <= 2) {
    return [normalized];
  }

  // Basic syllable splitting using vowel patterns
  const vowels = 'aeiouy';
  const syllables = [];
  let currentSyllable = '';
  let lastWasVowel = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const isVowel = vowels.includes(char);
    
    currentSyllable += char;

    // Split on consonant after vowel (with lookahead for next vowel)
    if (lastWasVowel && !isVowel && i + 1 < normalized.length && vowels.includes(normalized[i + 1])) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }

    lastWasVowel = isVowel;
  }

  // Add remaining syllable
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }

  // If splitting failed or only one syllable, return whole word
  return syllables.length > 0 ? syllables : [normalized];
}

/**
 * FORMAT SYLLABLES FOR DISPLAY
 * 
 * Formats syllables with visual separators and emphasis.
 * Uses bullets (•) to separate syllables clearly.
 * 
 * @param {string} word - The word to format
 * @returns {string} Formatted syllable string with separators
 * 
 * EXAMPLES:
 * - "hello" → "hel • lo"
 * - "beautiful" → "beau • ti • ful"
 * - "see" → "see"
 */
export function formatSyllables(word) {
  const syllables = getSyllables(word);
  return syllables.join(' • ');
}

/**
 * GET PRONUNCIATION TIP
 * 
 * Provides contextual pronunciation guidance based on word characteristics.
 * Analyzes word patterns and offers specific tips.
 * 
 * @param {string} word - The word to get tips for
 * @returns {string} Helpful pronunciation tip
 */
export function getPronunciationTip(word) {
  const normalized = word.toLowerCase().trim();
  const syllables = getSyllables(word);

  // Single letter
  if (normalized.length === 1) {
    return 'Pronounce this letter clearly and hold the sound';
  }

  // Very short words (2 letters like "as", "is", "at")
  if (normalized.length === 2) {
    if (normalized === 'as') return 'One quick sound - say it smoothly like "azz"';
    if (normalized === 'is') return 'One quick sound - say "izz" smoothly';
    if (normalized === 'at') return 'One quick sound - emphasize the "a" then add "t"';
    return 'Short word - one smooth sound, speak it clearly';
  }

  // 3-letter words
  if (normalized.length === 3) {
    if (normalized === 'see') return 'Say the letter "C" slowly and add a long "ee" sound at the end';
    if (normalized === 'the') return 'One sound - say "thuh" or "thee" depending on context';
    return 'Short word - speak it clearly and hold the vowel sound';
  }

  // Words with silent 'e'
  if (normalized.endsWith('e') && normalized.length > 3) {
    return `The final "e" is silent. Focus on: ${formatSyllables(normalized.slice(0, -1))}`;
  }

  // Multi-syllable words
  if (syllables.length > 2) {
    return `Break it down: ${formatSyllables(normalized)}. Say each part separately first, then combine`;
  }

  if (syllables.length === 2) {
    return `Two syllables: ${formatSyllables(normalized)}. Emphasize the first part slightly more`;
  }

  // Default tip
  return `Sound it out: ${formatSyllables(normalized)}`;
}

/**
 * PHONETIC SPELLING HELPER
 * 
 * Provides simple phonetic representation for common tricky words.
 * Not full IPA notation, but easier-to-read pronunciation guide.
 * 
 * @param {string} word - The word to get phonetic spelling for
 * @returns {string|null} Phonetic spelling or null if not in dictionary
 */
export function getPhoneticSpelling(word) {
  const phoneticMap = {
    // Common tricky words
    'see': 'SEE (like the letter C + ee)',
    'sea': 'SEE (sounds like "see")',
    'through': 'THROO',
    'thought': 'THAWT',
    'enough': 'ee-NUFF',
    'beautiful': 'BYOO-tuh-ful',
    'definitely': 'DEF-in-it-lee',
    'conscience': 'KON-shuns',
    'pronunciation': 'pruh-NUN-see-AY-shun',
    'library': 'LY-brer-ee',
    'february': 'FEB-roo-air-ee',
    'wednesday': 'WENZ-day',
    'probably': 'PRAH-buh-blee',
    'comfortable': 'KUM-fer-tuh-bul',
    'temperature': 'TEM-per-uh-chur',
    'interesting': 'IN-ter-es-ting',
    'different': 'DIF-er-ent',
    'chocolate': 'CHOK-lit',
    'vegetable': 'VEJ-tuh-bul',
    'separate': 'SEP-uh-rate',
  };

  return phoneticMap[word.toLowerCase()] || null;
}

/**
 * GENERATE IPA-STYLE PHONETIC NOTATION
 * 
 * Auto-generates approximate IPA phonetic notation for any word.
 * Uses pattern matching for common letter combinations.
 * 
 * @param {string} word - The word to convert to phonetic notation
 * @returns {string} IPA-style phonetic string
 */
export function getIPAPhonetic(word) {
  const normalized = word.toLowerCase().trim();
  
  // Extensive IPA mapping for common words
  const ipaMap = {
    // Easy words
    'cat': 'kæt',
    'dog': 'dɔɡ',
    'run': 'rʌn',
    'sit': 'sɪt',
    'jump': 'dʒʌmp',
    'play': 'pleɪ',
    'eat': 'iːt',
    'sleep': 'sliːp',
    'book': 'bʊk',
    'pen': 'pɛn',
    'desk': 'dɛsk',
    'house': 'haʊs',
    'tree': 'triː',
    'sun': 'sʌn',
    'moon': 'muːn',
    'star': 'stɑːr',
    'water': 'ˈwɔːtər',
    'fire': 'faɪər',
    'bread': 'brɛd',
    'milk': 'mɪlk',
    'fish': 'fɪʃ',
    'bird': 'bɜːrd',
    'car': 'kɑːr',
    'bike': 'baɪk',
    
    // Medium words
    'confidence': 'ˈkɑːnfɪdəns',
    'clarity': 'ˈklærəti',
    'practice': 'ˈpræktɪs',
    'pronunciation': 'prəˌnʌnsiˈeɪʃən',
    'knowledge': 'ˈnɑːlɪdʒ',
    'education': 'ˌɛdʒuˈkeɪʃən',
    'library': 'ˈlaɪbrɛri',
    'computer': 'kəmˈpjuːtər',
    'language': 'ˈlæŋɡwɪdʒ',
    'vocabulary': 'voʊˈkæbjəˌlɛri',
    'conversation': 'ˌkɑːnvərˈseɪʃən',
    'grammar': 'ˈɡræmər',
    'dictionary': 'ˈdɪkʃəˌnɛri',
    'literature': 'ˈlɪtərətʃər',
    'alphabet': 'ˈælfəˌbɛt',
    'sentence': 'ˈsɛntəns',
    'paragraph': 'ˈpærəˌɡræf',
    'important': 'ɪmˈpɔːrtənt',
    'excellent': 'ˈɛksələnt',
    'beautiful': 'ˈbjuːtɪfəl',
    'dangerous': 'ˈdeɪndʒərəs',
    'delicious': 'dɪˈlɪʃəs',
    'comfortable': 'ˈkʌmfərtəbəl',
    'impossible': 'ɪmˈpɑːsəbəl',
    'adventure': 'ədˈvɛntʃər',
    'attention': 'əˈtɛnʃən',
    'atmosphere': 'ˈætməsˌfɪr',
    
    // Hard words
    'onomatopoeia': 'ˌɑːnəˌmætəˈpiːə',
    'eloquence': 'ˈɛləkwəns',
    'serendipity': 'ˌsɛrənˈdɪpəti',
    'perspicacious': 'ˌpɜːrspɪˈkeɪʃəs',
    'mellifluous': 'məˈlɪfluəs',
    'ubiquitous': 'juːˈbɪkwɪtəs',
    'ephemeral': 'ɪˈfɛmərəl',
    'paradigm': 'ˈpærədaɪm',
  };
  
  // Return mapped IPA or generate approximate one
  if (ipaMap[normalized]) {
    return ipaMap[normalized];
  }
  
  // Generate approximate IPA for unmapped words
  return generateApproximateIPA(normalized);
}

/**
 * GENERATE APPROXIMATE IPA
 * 
 * Creates a rough IPA transcription using common patterns.
 * Not linguistically perfect but helpful for pronunciation.
 */
function generateApproximateIPA(word) {
  let ipa = word;
  
  // Common vowel patterns
  ipa = ipa.replace(/ee/g, 'iː');
  ipa = ipa.replace(/ea/g, 'iː');
  ipa = ipa.replace(/oo/g, 'uː');
  ipa = ipa.replace(/ou/g, 'aʊ');
  ipa = ipa.replace(/ow/g, 'aʊ');
  ipa = ipa.replace(/ai/g, 'eɪ');
  ipa = ipa.replace(/ay/g, 'eɪ');
  ipa = ipa.replace(/oi/g, 'ɔɪ');
  ipa = ipa.replace(/oy/g, 'ɔɪ');
  
  // Common consonant patterns
  ipa = ipa.replace(/ch/g, 'tʃ');
  ipa = ipa.replace(/sh/g, 'ʃ');
  ipa = ipa.replace(/th/g, 'θ');
  ipa = ipa.replace(/ng/g, 'ŋ');
  ipa = ipa.replace(/ph/g, 'f');
  
  // Single vowels
  ipa = ipa.replace(/a(?![ːɪʊə])/g, 'æ');
  ipa = ipa.replace(/e(?![ːɪə])/g, 'ɛ');
  ipa = ipa.replace(/i(?![ː])/g, 'ɪ');
  ipa = ipa.replace(/o(?![ːʊɪ])/g, 'ɑː');
  ipa = ipa.replace(/u(?![ː])/g, 'ʌ');
  
  return ipa;
}

/**
 * IS WORD TOO SHORT FOR DETECTION
 * 
 * Determines if a word is so short it might be confused with a letter
 * by speech recognition. These need special handling.
 * 
 * @param {string} word - The word to check
 * @returns {boolean} True if word needs special detection handling
 */
export function needsSpecialDetection(word) {
  const normalized = word.toLowerCase().trim();
  const singleLetterWords = ['a', 'i'];
  const letterSoundingWords = ['see', 'sea', 'bee', 'tea', 'pea', 'why', 'you', 'eye'];
  
  return singleLetterWords.includes(normalized) || 
         letterSoundingWords.includes(normalized) ||
         normalized.length === 1;
}

/**
 * LEVENSHTEIN EDIT DISTANCE
 * Used to fuzzy-match very short words (e.g. "be" vs "bee", edit distance = 1).
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * VALIDATE SPOKEN WORD
 * 
 * Enhanced validation that handles homophones and letter confusion.
 * Returns match score and suggests alternatives if needed.
 * 
 * @param {string} expected - The target word
 * @param {string} spoken - What the user said
 * @returns {Object} Validation result with match, score, and suggestions
 */
export function validateSpokenWord(expected, spoken) {
  const normalizedExpected = expected.toLowerCase().trim().replace(/[^a-z]/g, '');
  const normalizedSpoken = spoken.toLowerCase().trim().replace(/[^a-z]/g, '');

  // Exact match
  if (normalizedExpected === normalizedSpoken) {
    return { match: true, score: 100, type: 'exact' };
  }

  // Handle single letter confusion (e.g., "b" detected when saying "bee")
  if (normalizedSpoken.length === 1 && normalizedExpected.length > 1) {
    const letterSounds = {
      'c': ['see', 'sea'],
      'b': ['bee', 'be'],
      'p': ['pea', 'pee'],
      't': ['tea', 'tee'],
      'r': ['are'],
      'y': ['why'],
      'u': ['you'],
      'i': ['eye'],
      'k': ['kay'],
      'j': ['jay'],
    };

    if (letterSounds[normalizedSpoken]?.includes(normalizedExpected)) {
      return {
        match: true,
        score: 90,
        type: 'homophone',
        suggestion: `Great! "${expected}" sounds like the letter "${normalizedSpoken.toUpperCase()}"`
      };
    }

    return {
      match: false,
      score: 0,
      type: 'too_short',
      suggestion: `Not quite. The word is "${expected}". Try saying it more clearly.`
    };
  }

  // Handle expected word sounds like letter (e.g., saying "see" but we want "c")
  if (normalizedExpected.length === 1 && normalizedSpoken.length > 1) {
    const reverseLetterSounds = {
      'see': 'c', 'sea': 'c',
      'bee': 'b', 'be': 'b',
      'pea': 'p', 'pee': 'p',
      'tea': 't', 'tee': 't',
      'are': 'r',
      'why': 'y',
      'you': 'u',
      'eye': 'i',
    };

    if (reverseLetterSounds[normalizedSpoken] === normalizedExpected) {
      return {
        match: true,
        score: 90,
        type: 'letter_word',
        suggestion: `Correct! "${normalizedSpoken}" is how you say the letter "${normalizedExpected.toUpperCase()}"`
      };
    }
  }

  // Edit-distance check for short words (≤5 chars) — catches "be"→"bee", "se"→"see", etc.
  const maxExpLen = normalizedExpected.length;
  if (maxExpLen <= 5) {
    const editDist = levenshtein(normalizedExpected, normalizedSpoken);
    // Allow 1 edit for words ≤3 chars, 2 edits for 4-5 chars
    const allowedEdits = maxExpLen <= 3 ? 1 : 2;
    if (editDist <= allowedEdits) {
      return { match: true, score: 88, type: 'close_enough' };
    }
  }

  // Similarity check for close matches
  const maxLen = Math.max(normalizedExpected.length, normalizedSpoken.length);
  let matchCount = 0;

  for (let i = 0; i < Math.min(normalizedExpected.length, normalizedSpoken.length); i++) {
    if (normalizedExpected[i] === normalizedSpoken[i]) {
      matchCount++;
    }
  }

  const similarity = Math.round((matchCount / maxLen) * 100);

  if (similarity >= 60) {
    return {
      match: false,
      score: similarity,
      type: 'close_match',
      suggestion: `Almost there! (${similarity}% match) - Try again.`
    };
  }

  return {
    match: false,
    score: similarity,
    type: 'different',
    suggestion: `Not quite. The word is "${expected}". Try again.`
  };
}
