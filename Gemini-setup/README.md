# Gemini API Setup

This directory contains the setup and configuration for the Google Gemini API key.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd Gemini-setup
   npm install
   ```

2. **Configure the API key:**
   
   **Option A - Interactive setup (recommended):**
   ```bash
   npm run init
   ```
   This will prompt you to enter your API key and create the `.env` file automatically.
   
   **Option B - Manual setup:**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in this directory
   - Add your API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Validate the setup:**
   ```bash
   npm run setup
   ```
   This will test your API key and verify everything is working.
   
   **Note:** If you get a model not found error, you may need to update the model name in `config.js`. 
   Check which models your API key has access to at [Google AI Studio](https://aistudio.google.com/app/apikey).
   Common model names to try: `'gemini-1.5-flash'`, `'gemini-1.5-pro'`, or `'gemini-pro'`.

4. **Use the API:**
   - Import the configuration from `config.js`
   - Use the `getGeminiClient()`, `getGeminiModel()`, or `analyzeData()` functions
   - See `example.js` for usage examples

## Files

- `config.js` - Main configuration file for API key management and data analysis functions
- `setup.js` - Utility script to validate and test the API key
- `init-env.js` - Interactive script to create the `.env` file
- `example.js` - Example usage demonstrating data analysis capabilities
- `.env` - Your actual API key (not committed to git, create this file)

## Usage Examples

### Basic Analysis
```javascript
import { analyzeData } from './config.js';

const result = await analyzeData(
  'Analyze this data and provide insights',
  { sales: 1000, profit: 200 }
);
console.log(result);
```

### Direct Model Access
```javascript
import { getGeminiModel } from './config.js';

const model = getGeminiModel();
const result = await model.generateContent('Your prompt here');
console.log(result.response.text());
```

### Run Examples
```bash
npm run example
```

## Security Note

Never commit your `.env` file to version control. It's already included in `.gitignore`.