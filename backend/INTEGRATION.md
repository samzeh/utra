# Integrating Gemini API with React App

This guide shows how to use the Gemini API setup in your React application.

## Setup for React/Vite

1. **Install the dependency in your React app:**
   ```bash
   cd ../my-react-app
   npm install @google/generative-ai
   ```

2. **Copy the config file:**
   - Copy `Gemini-setup/config.js` to your React app's `src` directory, or
   - Import it directly from the Gemini-setup directory

3. **Set up environment variables:**
   - In `my-react-app`, create a `.env` file (or add to existing one)
   - Add: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Note: Vite requires the `VITE_` prefix for environment variables

4. **Use in your React components:**
   ```jsx
   import { analyzeData } from '../Gemini-setup/config.js';
   
   function DataAnalysis() {
     const [result, setResult] = useState('');
     const [loading, setLoading] = useState(false);
     
     const handleAnalyze = async () => {
       setLoading(true);
       try {
         const data = { /* your data */ };
         const analysis = await analyzeData(
           'Analyze this data and provide insights',
           data
         );
         setResult(analysis);
       } catch (error) {
         console.error('Analysis failed:', error);
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <div>
         <button onClick={handleAnalyze} disabled={loading}>
           {loading ? 'Analyzing...' : 'Analyze Data'}
         </button>
         {result && <div>{result}</div>}
       </div>
     );
   }
   ```

## Important Notes

- **API Key Security**: Never commit your `.env` file. Add it to `.gitignore`
- **Client-side vs Server-side**: For production apps, consider using a backend API to keep your API key secure
- **Rate Limits**: Be aware of Gemini API rate limits when making requests from the client