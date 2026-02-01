/**
 * Setup and validation script for Gemini API
 * 
 * Run this script to validate your API key configuration:
 * node setup.js
 */

import { getApiKey, getGeminiModel, analyzeData } from './config.js';

async function validateSetup() {
  console.log('🔍 Validating Gemini API setup...\n');
  
  try {
    // Check if API key is configured
    const apiKey = getApiKey();
    console.log('✅ API key found');
    console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
    
    // Test API connection with a simple request
    console.log('🧪 Testing API connection...');
    const testPrompt = 'Say "Hello, Gemini API is working!" in one sentence.';
    const response = await analyzeData(testPrompt);
    
    console.log('✅ API connection successful!\n');
    console.log('📝 Test response:');
    console.log(`   ${response}\n`);
    
    console.log('🎉 Setup complete! You can now use the Gemini API for data analysis.');
    
  } catch (error) {
    console.error('❌ Setup validation failed:');
    console.error(`   ${error.message}\n`);
    console.log('💡 To fix this:');
    console.log('   1. Make sure you have a .env file in the Gemini-setup directory');
    console.log('   2. Add your API key: GEMINI_API_KEY=AIzaSyCrHQeslqn44ig89MKJ6eeu_f4h-iIeWoE');
    console.log('   3. Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }
}

// Run validation
validateSetup();