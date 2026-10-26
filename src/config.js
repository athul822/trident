// ─── API Keys ───────────────────────────────────────────────────────────────
// Keys are loaded from the .env file (gitignored).
// See .env.example for required variables.
// Expo SDK 49+ automatically exposes EXPO_PUBLIC_* variables via process.env.

// ─── Groq ───
// Get your key: https://console.groq.com/keys
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
export const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-120b';

// ─── Mistral AI ───
// Get your key: https://console.mistral.ai/
export const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
export const MISTRAL_MODEL = 'mistral-small-latest';

// ─── Google Gemini ───
// Get your key: https://aistudio.google.com/apikey
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
export const GEMINI_MODEL = 'gemini-flash-latest';

