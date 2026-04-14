/**
 * ===== ANIMATION UTILITIES =====
 * 
 * PURPOSE:
 * Helper functions for comparing words, detecting pronunciation errors,
 * and calculating similarity scores for feedback animations.
 */

/**
 * GET CHARACTER DIFFERENCES
 * 
 * Compares two words character-by-character and returns all differences.
 * Used to highlight specific pronunciation mistakes.
 * 
 * @param {string} expected - The target/correct word
 * @param {string} actual - The word the user actually said
 * @returns {Array} Array of error objects with position, expected char, actual char, and error type
 * 
 * ERROR TYPES:
 * - "extra": User said more characters than expected
 * - "missing": User missed some characters
 * - "wrong": User said a different character
 */
export function getCharacterDiff(expected, actual) {
  const errors = [];
  const maxLen = Math.max(expected.length, actual.length);

  for (let i = 0; i < maxLen; i++) {
    const expectedChar = expected[i] || "";  // Get char at position i (or empty if beyond word)
    const actualChar = actual[i] || "";
    
    // If characters don't match, record the error
    if (expectedChar !== actualChar) {
      errors.push({
        position: i,
        expected: expectedChar,
        actual: actualChar,
        type: expectedChar === "" ? "extra" : actualChar === "" ? "missing" : "wrong"
      });
    }
  }

  return errors;
}

/**
 * HIGHLIGHT MISTAKES
 * 
 * Converts a word into an array of character objects with error flags.
 * Used to visually highlight which letters were pronounced wrong.
 * 
 * @param {string} word - The word to break down
 * @param {Array} errors - Error array from getCharacterDiff()
 * @returns {Array} Array of objects: { char: 'a', isError: true/false }
 */
export function highlightMistakes(word, errors) {
  const chars = word.split("");  // Split into individual letters
  return chars.map((char, idx) => {
    const hasError = errors.some(e => e.position === idx);  // Check if this position has error
    return { char, isError: hasError };
  });
}

/**
 * GET SIMILARITY SCORE
 * 
 * Calculates how similar two words are as a percentage (0-100%).
 * Used to determine if pronunciation was "close enough" for feedback.
 * 
 * ALGORITHM:
 * - Counts matching characters at same positions
 * - Divides by longer word length
 * - Returns percentage
 * 
 * EXAMPLES:
 * - "cat" vs "cat" = 100% (perfect match)
 * - "cat" vs "bat" = 66% (2 out of 3 match)
 * - "cat" vs "dog" = 0% (no matches)
 * 
 * @param {string} expected - Target word
 * @param {string} actual - Spoken word
 * @returns {number} Similarity percentage (0-100)
 */
export function getSimilarityScore(expected, actual) {
  const expLen = expected.length;
  const actLen = actual.length;
  const maxLen = Math.max(expLen, actLen);  // Use longer word as denominator
  
  if (maxLen === 0) return 100;  // Both empty = perfect match

  let matches = 0;
  // Count matching characters at same positions
  for (let i = 0; i < Math.min(expLen, actLen); i++) {
    if (expected[i] === actual[i]) matches++;
  }

  return Math.round((matches / maxLen) * 100);  // Convert to percentage
}
