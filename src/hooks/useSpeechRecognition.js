/**
 * ===== SPEECH RECOGNITION CUSTOM HOOK =====
 * 
 * PURPOSE:
 * Provides a reusable React hook for Web Speech Recognition API.
 * Captures spoken words and converts them to text with improved sensitivity.
 * 
 * FEATURES:
 * - Automatically detects browser support
 * - Captures full phrases for better syllable detection
 * - Real-time interim results for live feedback
 * - Continuous listening mode for longer phrases
 * - Configurable options for different use cases
 * 
 * BROWSER COMPATIBILITY:
 * - Chrome/Edge: Full support with webkitSpeechRecognition
 * - Firefox: Limited support
 * - Safari: Requires prefix (webkitSpeechRecognition)
 * 
 * OPTIONS:
 * @param {Object} options - Configuration options
 * @param {boolean} options.continuous - Keep listening after results (default: false)
 * @param {boolean} options.interimResults - Show partial results in real-time (default: true)
 * @param {boolean} options.singleWord - Extract only first word (default: false)
 * 
 * RETURNS:
 * {
 *   listening: boolean - Whether currently listening
 *   transcript: string - The captured text
 *   interimTranscript: string - Partial results (if interimResults enabled)
 *   supported: boolean - Whether browser supports API
 *   startListening: function - Start recording
 *   stopListening: function - Stop recording
 * }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import bgMusic from "../utils/bgMusic";

const DEFAULT_NOISE_WORDS = [
  "uh",
  "um",
  "erm",
  "hmm",
  "mm",
  "ah",
  "oh",
  "noise",
  "static",
  "background",
];

const normalizeForCompare = (text) =>
  (text || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const cleanTranscript = (text, noiseWords) => {
  if (!text) return "";

  const noiseSet = new Set(noiseWords.map((word) => word.toLowerCase()));
  const normalized = normalizeForCompare(text)
    .split(" ")
    .filter(Boolean)
    .filter((word) => !noiseSet.has(word));

  const deduped = [];
  for (const word of normalized) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== word) {
      deduped.push(word);
    }
  }

  return deduped.join(" ").trim();
};

// Letter name → phonetic sound words (e.g. saying "b" when the word is "bee")
const LETTER_SOUNDS = {
  b: ["bee", "be"],
  c: ["see", "sea"],
  p: ["pea", "pee"],
  t: ["tea", "tee"],
  r: ["are"],
  y: ["why"],
  u: ["you"],
  i: ["eye"],
  k: ["kay"],
  j: ["jay"],
};

const wordOverlapScore = (candidate, expected) => {
  const a = cleanTranscript(candidate, DEFAULT_NOISE_WORDS).split(" ").filter(Boolean);
  const b = cleanTranscript(expected, DEFAULT_NOISE_WORDS).split(" ").filter(Boolean);
  if (!a.length || !b.length) return 0;

  // Phonetic letter-sound match: spoken "b" → expected "bee"
  if (a.length === 1 && a[0].length === 1) {
    const sounds = LETTER_SOUNDS[a[0]] || [];
    if (b.some((w) => sounds.includes(w))) return 1.0;
  }
  // Reverse: expected is a letter, spoken is its phonetic sound ("bee" → "b")
  if (b.length === 1 && b[0].length === 1) {
    const sounds = LETTER_SOUNDS[b[0]] || [];
    if (a.some((w) => sounds.includes(w))) return 1.0;
  }

  // For very short words (≤4 chars), partial prefix match counts
  if (b.length === 1 && b[0].length <= 4 && a.length === 1) {
    const exp = b[0];
    const spk = a[0];
    if (exp.startsWith(spk) || spk.startsWith(exp)) return 0.85;
  }

  const bSet = new Set(b);
  let matches = 0;
  for (const token of a) {
    if (bSet.has(token)) matches += 1;
  }

  return matches / Math.max(a.length, b.length);
};

function useSpeechRecognition(options = {}) {
  // ===== CONFIGURATION =====
  const {
    continuous = false,
    interimResults = true,
    singleWord = false,
    expectedText = "",
    minConfidence = 0.28,
    noiseWords = DEFAULT_NOISE_WORDS,
  } = options;

  // ===== STATE =====
  const [listening, setListening] = useState(false);  // Is microphone active?
  const [transcript, setTranscript] = useState("");  // Final captured speech text
  const [interimTranscript, setInterimTranscript] = useState("");  // Partial/interim text
  const [supported, setSupported] = useState(true);  // Is API supported?
  const [speechError, setSpeechError] = useState(null); // "no-speech" | "noisy" | null
  const recognitionRef = useRef(null);  // Reference to recognition instance
  const acceptResultsRef = useRef(false);  // Ignore late onresult events after stop/reset

  // ===== INITIALIZATION =====
  /**
   * Sets up Speech Recognition instance on component mount
   */
  useEffect(() => {
    // Check browser support (standard or webkit-prefixed)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);  // Browser doesn't support speech recognition
      return undefined;
    }

    // Create and configure recognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";  // Language: English (US)
    recognition.interimResults = interimResults;  // Support real-time results
    recognition.maxAlternatives = 5;  // Return more alternatives to recover from noisy captures
    recognition.continuous = continuous;  // Keep listening after results

    // ===== EVENT HANDLERS =====
    recognition.onstart = () => {
      acceptResultsRef.current = true;
      setSpeechError(null);
      bgMusic.duck(); // lower bg music while mic is active
      setListening(true);
    };  // Microphone started
    recognition.onend = () => {
      acceptResultsRef.current = false;
      bgMusic.restore(); // restore bg music volume
      setListening(false);
    };  // Microphone stopped
    recognition.onerror = (event) => {
      acceptResultsRef.current = false;
      bgMusic.restore(); // restore bg music volume on error too
      setListening(false);

      if (event.error === "no-speech") {
        setSpeechError("no-speech"); // "We didn't hear you, please try again."
      } else if (event.error === "audio-capture" || event.error === "network") {
        setSpeechError("noisy"); // "Too much noise? Try raising your voice."
      } else if (event.error !== "aborted") {
        setSpeechError("no-speech");
      }
    };  // Error occurred
    
    // Handle speech results
    recognition.onresult = (event) => {
      if (!acceptResultsRef.current) {
        return;
      }

      let finalText = "";
      let interimText = "";

      // Process all results (including interim)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const primaryTranscript = result[0]?.transcript || "";

        if (result.isFinal) {
          let selectedTranscript = primaryTranscript;
          let selectedScore = -1;

          if (expectedText) {
            for (let altIndex = 0; altIndex < result.length; altIndex++) {
              const alternative = result[altIndex];
              const altTranscript = alternative?.transcript || "";
              const overlap = wordOverlapScore(altTranscript, expectedText);
              const weighted = overlap * 0.85 + (alternative?.confidence || 0) * 0.15;
              if (weighted > selectedScore) {
                selectedScore = weighted;
                selectedTranscript = altTranscript;
              }
            }
          }

          const confidence = result[0]?.confidence ?? 1;
          const confidencePass = confidence >= minConfidence;
          const expectedPass = expectedText ? selectedScore >= 0.2 : true;
          const cleanedFinal = cleanTranscript(selectedTranscript, noiseWords);

          if (cleanedFinal && (confidencePass || expectedPass)) {
            finalText += cleanedFinal + " ";
          }
        } else {
          interimText += `${cleanTranscript(primaryTranscript, noiseWords)} `;
        }
      }

      // Update interim results for real-time feedback
      if (interimText) {
        setInterimTranscript(interimText.trim());
      }

      // Update final transcript
      if (finalText) {
        const processedText = singleWord
          ? finalText.trim().split(/\s+/)[0]  // Extract first word only if requested
          : finalText.trim();  // Keep full phrase for better syllable detection
        
        setTranscript(processedText);
        setInterimTranscript("");  // Clear interim when final is set
        
        // Stop listening after result if not continuous
        if (!continuous) {
          recognition.stop();
        }
      }
    };

    recognitionRef.current = recognition;  // Store reference

    // Cleanup on unmount
    return () => {
      recognition.stop();
    };
  }, [continuous, interimResults, singleWord, expectedText, minConfidence, noiseWords]);

  // ===== CONTROL FUNCTIONS =====
  /**
   * Starts listening for speech input
   * Clears previous transcript before starting
   */
  const startListening = () => {
    if (!recognitionRef.current) return;  // Exit if not initialized
    setTranscript("");  // Clear previous text
    setInterimTranscript("");  // Clear interim text
    recognitionRef.current.start();  // Begin listening
  };

  /**
   * Stops listening for speech input
   */
  const stopListening = () => {
    acceptResultsRef.current = false;
    recognitionRef.current?.stop();  // Safely stop if exists
  };

  /**
   * Clears both final and interim transcripts.
   * Useful when advancing to a new word/round to avoid stale carry-over.
   */
  const clearTranscript = useCallback(() => {
    acceptResultsRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setSpeechError(null);
  }, []);

  const startListeningSafe = () => {
    if (!recognitionRef.current) return;
    clearTranscript();
    acceptResultsRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (error) {
      // Recover from rapid re-trigger by restarting the recognition instance.
      if (error?.name === "InvalidStateError") {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (_err) {
            // Swallow restart errors to avoid crashing UI interaction.
          }
        }, 60);
      }
    }
  };

  // ===== RETURN API =====
  return { 
    listening, 
    transcript, 
    interimTranscript, 
    supported,
    speechError, // "no-speech" | "noisy" | null — use to display retry prompts
    startListening: startListeningSafe,
    stopListening,
    clearTranscript,
  };
}

export default useSpeechRecognition;
