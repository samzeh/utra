/**
 * Gemini API Configuration
 * 
 * This module handles the setup and configuration of the Google Gemini API.
 * It loads the API key from environment variables and provides a configured client.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env file in Node.js environment
// Note: This file is designed for Node.js usage. For browser/Vite, use VITE_GEMINI_API_KEY
// Use top-level await to ensure .env is loaded before module exports
if (typeof process !== 'undefined' && process.versions?.node && typeof window === 'undefined') {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const dotenv = require('dotenv');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    dotenv.config({ path: join(__dirname, '.env') });
  } catch (error) {
    // Ignore errors - dotenv may not be needed if env vars are set another way
  }
}

/**
 * Get the Gemini API key from environment variables
 * Supports both Node.js (process.env) and Vite (import.meta.env) environments
 * @returns {string} The API key
 * @throws {Error} If the API key is not set
 */
export function getApiKey() {
  // Try Vite environment first (for browser/client-side usage)
  // Then try Node.js environment (for server-side usage)
  // @ts-ignore - import.meta.env is available in Vite environments
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  const nodeKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY;
  const apiKey = viteKey || nodeKey || null;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'Gemini API key is not set. Please set GEMINI_API_KEY in your .env file.\n' +
      'For Vite/React apps, use VITE_GEMINI_API_KEY instead.\n' +
      'Get your API key from: https://makersuite.google.com/app/apikey'
    );
  }
  
  return apiKey;
}

/**
 * Initialize and return a Gemini AI client
 * @returns {GoogleGenerativeAI} Configured Gemini AI client
 */
export function getGeminiClient() {
  const apiKey = getApiKey();
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get a Gemini model instance
 * @param {string} modelName - The model name (default: 'gemini-1.5-flash')
 * Try: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', or check your API key's available models
 * @returns {any} The model instance
 */
export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  const client = getGeminiClient();
  // Remove 'models/' prefix if present, as the SDK adds it automatically
  const cleanModelName = modelName.replace(/^models\//, '');
  return client.getGenerativeModel({ model: cleanModelName });
}

/**
 * Analyze data using Gemini
 * @param {string} prompt - The prompt/question to send to Gemini
 * @param {any} data - Optional data to include in the analysis
 * @param {string} modelName - The model name to use (default: 'gemini-1.5-flash')
 * @returns {Promise<string>} The response from Gemini
 */
export async function analyzeData(prompt, data = null, modelName = 'gemini-1.5-flash') {
  try {
    const model = getGeminiModel(modelName);
    
    let fullPrompt = prompt;
    if (data) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fullPrompt = `${prompt}\n\nData to analyze:\n${dataString}`;
    }
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to analyze data with Gemini: ${error.message}`);
  }
}

export default {
  getApiKey,
  getGeminiClient,
  getGeminiModel,
  analyzeData
};