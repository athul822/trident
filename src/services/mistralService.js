import {
  GROQ_API_KEY,
  GROQ_MODEL,
  MISTRAL_API_KEY,
  MISTRAL_MODEL,
} from '../config';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MISTRAL_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Builds the shared word puzzle prompt.
 */
function buildPrompt(word1, word2, word3) {
  const firstLetter = (word2 || '').charAt(0).toUpperCase();
  const secondLetter = (word3 || '').charAt(0).toUpperCase();
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

  return { firstLetter, secondLetter, prefix, systemPrompt, userPrompt };
}

/**
 * Parses and validates the raw text response from an LLM.
 */
function parseAndFilterWords(text, firstLetter, secondLetter, prefix, provider = 'AI') {
  // Strip <think> reasoning blocks if present (from reasoning models)
  let cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Extract just the array portion in case of any extra text
  const arrayMatch = cleaned.match(/\[.*\]/s);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  console.log(`[${provider}] Cleaned text:`, cleaned);

  let words = [];
  try {
    words = JSON.parse(cleaned);
  } catch (parseError) {
    console.warn(`[${provider}] JSON parse failed, trying regex fallback:`, parseError.message);
    const matches = cleaned.match(/(["'])(.*?)\1/g);
    if (matches) {
      words = matches.map((m) => m.slice(1, -1));
    } else {
      throw new Error(`Failed to parse ${provider} response as JSON or string list`);
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
          console.warn(`[${provider}] Filtered out invalid word: "${w}" (expected prefix "${prefix}")`);
        }
        return startsCorrectly && w.length > 0;
      });
    console.log(`[${provider}] Valid words after filter:`, valid);
    return valid;
  }

  console.warn(`[${provider}] Expected array but got:`, typeof words);
  return [];
}

/**
 * Calls Groq API with openai/gpt-oss-120b.
 */
export async function callGroq(word1, word2, word3) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const { firstLetter, secondLetter, prefix, systemPrompt, userPrompt } = buildPrompt(
    word1,
    word2,
    word3
  );

  console.log('[Groq] Calling Groq API with model:', GROQ_MODEL);

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: 'medium',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Groq] API error:', response.status, errorBody);
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  console.log('[Groq] Raw response:', data);

  const text = data?.choices?.[0]?.message?.content || '';
  console.log('[Groq] Raw text:', text);

  return parseAndFilterWords(text, firstLetter, secondLetter, prefix, 'Groq');
}

/**
 * Calls Mistral API.
 */
export async function callMistral(word1, word2, word3) {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  const { firstLetter, secondLetter, prefix, systemPrompt, userPrompt } = buildPrompt(
    word1,
    word2,
    word3
  );

  console.log('[Mistral] Calling Mistral API with model:', MISTRAL_MODEL);

  const response = await fetch(MISTRAL_ENDPOINT, {
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
    console.error('[Mistral] API error:', response.status, errorBody);
    throw new Error(`Mistral API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  console.log('[Mistral] Raw response:', data);

  const text = data?.choices?.[0]?.message?.content || '';
  console.log('[Mistral] Raw text:', text);

  return parseAndFilterWords(text, firstLetter, secondLetter, prefix, 'Mistral');
}

/**
 * Fetches word suggestions by calling Groq API first.
 * If Groq fails (network error, API error, or no valid words) or is not configured,
 * it retries with Mistral API as fallback.
 *
 * @param {string} word1 - Category reference word
 * @param {string} word2 - First letter constraint (uses word2's first letter)
 * @param {string} word3 - Second letter constraint (uses word3's first letter)
 * @returns {Promise<string[]>} Array of matching words
 */
export async function getWordSuggestions(word1, word2, word3) {
  // 1. Try Groq first if API key is present
  if (GROQ_API_KEY) {
    try {
      console.log('[WordSuggestions] Attempting Groq API...');
      const words = await callGroq(word1, word2, word3);
      if (Array.isArray(words) && words.length > 0) {
        console.log('[WordSuggestions] Successfully retrieved words from Groq:', words);
        return words;
      }
      console.warn('[WordSuggestions] Groq returned 0 valid words, falling back to Mistral...');
    } catch (groqError) {
      console.warn('[WordSuggestions] Groq call failed, falling back to Mistral:', groqError.message);
    }
  } else {
    console.log('[WordSuggestions] GROQ_API_KEY not configured, proceeding directly with Mistral...');
  }

  // 2. Retry with Mistral as fallback
  try {
    console.log('[WordSuggestions] Calling Mistral API...');
    return await callMistral(word1, word2, word3);
  } catch (mistralError) {
    console.error('[WordSuggestions] Mistral API also failed:', mistralError);
    throw mistralError;
  }
}
