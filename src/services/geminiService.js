import { GEMINI_API_KEY, GEMINI_MODEL } from '../config';

/**
 * Sends the Trident word puzzle prompt to the Gemini API
 * and returns a list of matching words.
 *
 * @param {string} word1 - Category reference word
 * @param {string} word2 - First letter constraint
 * @param {string} word3 - Second letter constraint
 * @returns {Promise<string[]>} Array of matching words
 */
export async function getWordSuggestions(word1, word2, word3) {
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const firstLetter = word2.charAt(0).toUpperCase();
  const secondLetter = word3.charAt(0).toUpperCase();

  const prompt = [
    `You are a JSON API. You MUST output ONLY a valid JSON array of strings. No conversational text.`,
    `Find 5 to 10 words that satisfy ALL three rules:`,
    `1. Category: Must belong to the same category as "${word1}" (e.g., if it is a fruit, list fruits).`,
    `2. Starts with: "${firstLetter}"`,
    `3. Second letter: "${secondLetter}"`,
    ``,
    `important: Output format required:`,
    `["word1", "word2", "word3"]`,
  ].join('\n');
console.log("Prompt: " + prompt);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[GeminiService] Gemini API error:', response.status, errorBody);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GeminiService] data text response:', data);

    // Extract text from Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    console.log('[GeminiService] Raw text response:', text);

    // Parse the JSON array from the response
    // Handle cases where Gemini wraps it in markdown code fences
    let cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Sometimes the model might still prefix with some text like "Here are the words:"
    // We can try to extract just the array part if there's extra text
    const arrayMatch = cleaned.match(/\[.*\]/s);
    if (arrayMatch) {
      cleaned = arrayMatch[0];
    }
    
    console.log('[GeminiService] Cleaned text for parsing:', cleaned);

    let words = [];
    try {
      // First try standard JSON parsing
      words = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('[GeminiService] JSON Parse Error:', parseError.message);
      console.warn('[GeminiService] Attempting regex fallback extraction...');
      
      // Fallback: extract anything inside double or single quotes
      // This handles invalid JSON like trailing commas or single quotes
      const matches = cleaned.match(/(["'])(.*?)\1/g);
      if (matches) {
        words = matches.map(m => m.slice(1, -1)); // strip the quotes
      } else {
        console.error('[GeminiService] Regex extraction failed. Raw text:', text);
        throw new Error('Failed to parse Gemini response as JSON or string list');
      }
    }

    if (Array.isArray(words)) {
      console.log('[GeminiService] Parsed words array:', words);
      return words.map((w) => String(w).trim()).filter(Boolean);
    }
    
    console.warn('[GeminiService] Expected array but got:', typeof words);
    return [];
  } catch (error) {
    console.error('[GeminiService] Gemini API call failed:', error);
    throw error;
  }
}
