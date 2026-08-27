import { MISTRAL_API_KEY, MISTRAL_MODEL } from '../config';

const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Sends the Trident word puzzle prompt to the Mistral API
 * and returns a list of matching words.
 *
 * @param {string} word1 - Category reference word
 * @param {string} word2 - First letter constraint (uses word2's first letter)
 * @param {string} word3 - Second letter constraint (uses word3's first letter)
 * @returns {Promise<string[]>} Array of matching words
 */
export async function getWordSuggestions(word1, word2, word3) {
  const firstLetter = word2.charAt(0).toUpperCase();
  const secondLetter = word3.charAt(0).toUpperCase();

  const prefix = `${firstLetter}${secondLetter}`; // e.g. "FA"

  const systemPrompt =
    'You are a strict word puzzle solver. ' +
    'You MUST respond with ONLY a valid JSON array of strings — no explanation, no markdown, no code fences.';

  const userPrompt = [
    `Find 5 to 10 words that satisfy ALL THREE rules. Violating ANY rule makes a word INVALID.`,
    ``,
    `RULE 1 — CATEGORY: The word must belong to the same category as "${word1}".`,
    `RULE 2 — FIRST LETTER: The word's 1st character must be "${firstLetter}".`,
    `RULE 3 — SECOND LETTER: The word's 2nd character must be "${secondLetter}".`,
    ``,
    `CRITICAL: This means every word MUST start with the two-letter prefix "${prefix}".`,
    `Example — if firstLetter=F and secondLetter=A:`,
    `  ✓ VALID:   "Faint"  → F-A-I-N-T  (starts with FA)`,
    `  ✗ INVALID: "Flame"  → F-L-A-M-E  (starts with FL, not FA)`,
    `  ✗ INVALID: "Fragile"→ F-R-A-G-I-L-E (starts with FR, not FA)`,
    ``,
    `SELF-CHECK before answering: For each word, confirm word[0]=="${firstLetter}" AND word[1]=="${secondLetter}". Remove any word that fails.`,
    ``,
    `Return ONLY a JSON array:`,
    `["word1", "word2", "word3"]`,
  ].join('\n');

  console.log('[MistralService] Prompt:', userPrompt);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        temperature: 0.7,
        max_tokens: 256,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[MistralService] API error:', response.status, errorBody);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[MistralService] Raw response:', data);

    const text = data?.choices?.[0]?.message?.content || '';
    console.log('[MistralService] Raw text:', text);

    // Strip markdown code fences if the model wraps it anyway
    let cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Extract just the array portion in case of any extra text
    const arrayMatch = cleaned.match(/\[.*\]/s);
    if (arrayMatch) {
      cleaned = arrayMatch[0];
    }

    console.log('[MistralService] Cleaned text:', cleaned);

    let words = [];
    try {
      words = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('[MistralService] JSON parse failed, trying regex fallback:', parseError.message);
      const matches = cleaned.match(/([\"'])(.*?)\1/g);
      if (matches) {
        words = matches.map((m) => m.slice(1, -1));
      } else {
        throw new Error('Failed to parse Mistral response as JSON or string list');
      }
    }

    if (Array.isArray(words)) {
      // Hard filter: remove any word that doesn't literally start with the correct two letters
      const valid = words
        .map((w) => String(w).trim())
        .filter((w) => {
          const startsCorrectly =
            w.charAt(0).toUpperCase() === firstLetter &&
            w.charAt(1).toUpperCase() === secondLetter;
          if (!startsCorrectly) {
            console.warn(`[MistralService] Filtered out invalid word: "${w}" (expected prefix "${prefix}")`);
          }
          return startsCorrectly && w.length > 0;
        });
      console.log('[MistralService] Valid words after filter:', valid);
      return valid;
    }

    console.warn('[MistralService] Expected array but got:', typeof words);
    return [];
  } catch (error) {
    console.error('[MistralService] Call failed:', error);
    throw error;
  }
}
