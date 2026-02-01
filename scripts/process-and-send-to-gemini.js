#!/usr/bin/env node
/**
 * Process message.txt (HTML table) → clean readable format → send to Gemini API
 * 
 * Usage: node scripts/process-and-send-to-gemini.js [input-path]
 * Default input: /Users/dhannarula/Downloads/message.txt
 * 
 * Requires: GEMINI_API_KEY in .env (or Gemini-setup/.env)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Load env from project root or Gemini-setup
dotenv.config({ path: join(PROJECT_ROOT, '.env') });
dotenv.config({ path: join(PROJECT_ROOT, 'Gemini-setup', '.env') });

// Default: user's Downloads path. Or pass: node script.js path/to/file.txt
// Or place file at: data/message.txt
const INPUT_PATH = process.argv[2] || '/Users/dhannarula/Downloads/message.txt';
const OUTPUT_CSV = join(PROJECT_ROOT, 'data', 'message-data.csv');
const OUTPUT_GEMINI = join(PROJECT_ROOT, 'data', 'gemini-output.txt');

/**
 * Parse HTML table and extract cell values as 2D array
 */
function parseHtmlTable(html) {
  const rows = [];
  // Match each <tr>...</tr> block
  const rowMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  
  for (const rowMatch of rowMatches) {
    const rowHtml = rowMatch[1];
    const cells = [];
    // Match <td>value</td> or <td><nobr>value</nobr></td>
    const cellMatches = rowHtml.matchAll(/<t[dh][^>]*>(?:<nobr>([^<]*)<\/nobr>|([^<]*))<\/t[dh]>/gi);
    for (const cellMatch of cellMatches) {
      const value = (cellMatch[1] || cellMatch[2] || '').trim();
      cells.push(value);
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  
  return rows;
}

/**
 * Convert 2D array to CSV string
 */
function toCsv(rows) {
  return rows.map(row => 
    row.map(cell => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  ).join('\n');
}

/**
 * Extract plain text summary (first N rows + structure description)
 */
function toReadableText(rows, maxRows = 50) {
  const header = rows[0] || [];
  const dataRows = rows.slice(1, maxRows + 1);
  
  let text = `Temperature data table (${rows.length} rows total)\n`;
  text += `Columns: ${header.join(', ')}\n\n`;
  text += `Data (first ${dataRows.length} rows):\n`;
  text += toCsv([header, ...dataRows]);
  
  if (rows.length > maxRows + 1) {
    text += `\n\n... and ${rows.length - maxRows - 1} more rows`;
  }
  return text;
}

async function main() {
  console.log('📂 Reading:', INPUT_PATH);
  
  let rawContent;
  try {
    rawContent = readFileSync(INPUT_PATH, 'utf-8');
  } catch (err) {
    console.error('❌ Could not read file:', err.message);
    process.exit(1);
  }

  console.log('🔄 Parsing HTML table...');
  const rows = parseHtmlTable(rawContent);
  console.log(`   Extracted ${rows.length} rows`);

  const csv = toCsv(rows);
  const readableText = toReadableText(rows, 100); // First 100 data rows for Gemini

  // Save clean CSV and readable text
  const dataDir = join(PROJECT_ROOT, 'data');
  try {
    const { mkdirSync } = await import('fs');
    mkdirSync(dataDir, { recursive: true });
  } catch (_) {}
  writeFileSync(OUTPUT_CSV, csv, 'utf-8');
  writeFileSync(join(dataDir, 'message-readable.txt'), readableText, 'utf-8');
  console.log('✅ Saved clean CSV:', OUTPUT_CSV);
  console.log('✅ Saved readable text:', join(dataDir, 'message-readable.txt'));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found. Add to .env or Gemini-setup/.env');
    process.exit(1);
  }

  console.log('🤖 Sending to Gemini API...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // Set GEMINI_MODEL in .env (e.g. gemini-2.0-flash, gemini-2.5-flash)
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are analyzing temperature data. Below is a table with monthly temperatures (jan, feb, mar... dec) and yearly averages. The values appear to be in Celsius. Some values like 999.9 indicate missing data.

${readableText}

Please provide:
1. A brief summary of the data (what it represents, time period, location if inferable)
2. Key statistics (min, max, average temperatures)
3. Any notable patterns or trends
4. Recommendations for how this data could be used (e.g., for climate analysis, venue planning)`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('\n' + '='.repeat(60));
    console.log('GEMINI OUTPUT:');
    console.log('='.repeat(60) + '\n');
    console.log(text);

    // Save output
    writeFileSync(OUTPUT_GEMINI, text, 'utf-8');
    console.log('\n✅ Saved Gemini output:', OUTPUT_GEMINI);

  } catch (err) {
    console.error('❌ Gemini API error:', err.message);
    if (err.message?.includes('API key')) {
      console.error('   Check GEMINI_API_KEY in .env or Gemini-setup/.env');
    }
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      console.error('   Quota exceeded. Wait a minute or check https://ai.dev/rate-limit');
      console.error('   Your data was saved to:', OUTPUT_CSV);
    }
    process.exit(1);
  }
}

main();
