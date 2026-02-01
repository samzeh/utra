# Data Processing Scripts

## process-and-send-to-gemini.js

Converts `message.txt` (HTML table) → clean CSV → sends to Gemini API for analysis.

### Usage

```bash
# Process default file (/Users/dhannarula/Downloads/message.txt)
npm run gemini:process

# Or specify a path
node scripts/process-and-send-to-gemini.js path/to/your/message.txt
```

### Setup

1. **GEMINI_API_KEY** – Add to `Gemini-setup/.env` or `utra/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

2. **GEMINI_MODEL** (optional) – Default: `gemini-2.0-flash`
   ```
   GEMINI_MODEL=gemini-2.5-flash
   ```

### Output Files

- `data/message-data.csv` – Full table as CSV (186 rows)
- `data/message-readable.txt` – First 100 rows in readable format
- `data/gemini-output.txt` – Gemini analysis (when API succeeds)

### Input Format

The script expects an HTML table with:
- Header row: jan, feb, mar... dec, year
- Data rows: temperature values in Celsius
- Values like `999.9` = missing data

### Quota / 429 Errors

If you see "429 Too Many Requests" or "quota exceeded":
- Wait ~60 seconds and retry
- Check https://ai.dev/rate-limit for your usage
- Your CSV and readable text are still saved even when Gemini fails
