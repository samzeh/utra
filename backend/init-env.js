/**
 * Initialize environment file
 * 
 * This script helps create a .env file with your Gemini API key
 * Run: node init-env.js
 */

import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initEnv() {
  console.log('🔑 Gemini API Key Setup\n');
  console.log('Get your API key from: https://makersuite.google.com/app/apikey\n');
  
  if (existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  const apiKey = await question('Enter your Gemini API key: ');
  
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ API key cannot be empty.');
    rl.close();
    return;
  }
  
  const envContent = `# Google Gemini API Key
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=${apiKey.trim()}
`;
  
  writeFileSync(envPath, envContent);
  console.log('\n✅ .env file created successfully!');
  console.log('📝 You can now run: npm run setup');
  
  rl.close();
}

initEnv();