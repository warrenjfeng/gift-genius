// API Configuration
// For production, these should be set as environment variables
// For GitHub Pages, you'll need to use a backend proxy or use environment variables
// since API keys shouldn't be exposed in client-side code
//
// IMPORTANT: Update the API URLs below with the correct endpoints for:
// - Gemini 3 (or latest Gemini model): https://ai.google.dev/
// - Nano Banana Pro: Update with actual API endpoint when available

export const API_CONFIG = {
  // Gemini 3 Pro API - for text generation and analysis
  // Get your API key from: https://makersuite.google.com/app/apikey
  // Documentation: https://ai.google.dev/gemini-api/docs/gemini-3
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
  
  // Gemini 3 Pro Image (Nano Banana Pro) - for image generation
  // This is the image generation model: gemini-3-pro-image-preview
  // Documentation: https://ai.google.dev/gemini-api/docs/gemini-3
  NANO_BANANA_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY || '',
  NANO_BANANA_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
}

