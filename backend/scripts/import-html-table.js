/**
 * Import HTML Table Data
 * 
 * This script parses HTML table data and imports it into MongoDB.
 * Specifically designed for temperature data tables.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { connectDB, disconnectDB } from '../db.js';
import TemperatureData from '../models/TemperatureData.js';

// Load environment variables
if (typeof process !== 'undefined' && process.versions?.node && typeof window === 'undefined') {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const dotenv = require('dotenv');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    dotenv.config({ path: join(__dirname, '..', '.env') });
  } catch (error) {
    // Ignore errors
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const filePath = args[0];
const options = {
  startYear: null,
  location: 'Milan, Italy'
};

// Parse options
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--start-year' && args[i + 1]) {
    options.startYear = parseInt(args[i + 1]);
  }
  if (args[i] === '--location' && args[i + 1]) {
    options.location = args[i + 1];
  }
}

if (!filePath) {
  console.error('❌ Error: File path is required');
  console.log('\nUsage: node scripts/import-html-table.js <file-path> [options]');
  console.log('\nOptions:');
  console.log('  --start-year <year>  Starting year (default: infer from data)');
  console.log('  --location <name>    Location name (default: Milan, Italy)');
  process.exit(1);
}

// Parse HTML table
function parseHTMLTable(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract table rows using regex
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [];
    let match;
    
    while ((match = rowRegex.exec(content)) !== null) {
      rows.push(match[1]);
    }
    
    if (rows.length === 0) {
      throw new Error('No table rows found');
    }
    
    // Extract header row
    const headerRow = rows[0];
    const headerRegex = /<t[dh][^>]*>([^<]*)<\/t[dh]>/gi;
    const headers = [];
    let headerMatch;
    
    while ((headerMatch = headerRegex.exec(headerRow)) !== null) {
      headers.push(headerMatch[1].trim().toLowerCase());
    }
    
    console.log(`   Found headers: ${headers.join(', ')}`);
    
    // Extract data rows
    const data = [];
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        // Extract text from cell, handling <nobr> tags
        let cellText = cellMatch[1]
          .replace(/<nobr>/gi, '')
          .replace(/<\/nobr>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        cells.push(cellText);
      }
      
      if (cells.length === 0) continue;
      
      // Parse values
      const record = {};
      let hasValidData = false;
      
      // Map cells to headers
      headers.forEach((header, index) => {
        if (index < cells.length) {
          const value = parseValue(cells[index]);
          if (value !== null) {
            const headerLower = header.toLowerCase();
            
            // Check if this is the year column (contains average temp, not actual year)
            if (headerLower === 'year') {
              // If value is a reasonable year (1900-3000), use it as year
              if (value >= 1900 && value <= 3000) {
                record.year = Math.round(value);
              } else {
                // It's probably average temperature
                record.averageTemp = value;
              }
            } else if (months.includes(headerLower)) {
              // Monthly temperature value
              record[headerLower] = value;
              hasValidData = true;
            } else {
              record[headerLower] = value;
            }
          }
        }
      });
      
      // If no year found, infer from row position
      if (!record.year) {
        const startYear = options.startYear || 1763; // Default starting year for Milan data
        record.year = startYear + (i - 1); // i-1 because first row is header
      }
      
      // Only add if we have valid monthly data
      if (hasValidData && record.year) {
        record.location = options.location;
        data.push(record);
      }
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to parse HTML table: ${error.message}`);
  }
}

// Convert value to number, handling missing data indicators
function parseValue(val) {
  if (!val || val.trim() === '' || val === 'null' || val === 'NULL') {
    return null;
  }
  const num = parseFloat(val);
  // Handle common missing data indicators
  if (isNaN(num) || num === 999.9 || num === -999 || num === 999 || Math.abs(num) > 1000) {
    return null;
  }
  return num;
}

// Import data to MongoDB
async function importData() {
  try {
    console.log('📂 Importing HTML table data from:', filePath);
    
    // Resolve file path
    const resolvedPath = resolve(filePath);
    console.log('   Resolved path:', resolvedPath);
    console.log('   Location:', options.location);
    
    // Connect to database
    console.log('\n🔌 Connecting to MongoDB...');
    await connectDB();
    
    // Parse data
    console.log('\n📊 Parsing HTML table...');
    const data = parseHTMLTable(resolvedPath);
    console.log(`   Found ${data.length} records`);
    
    if (data.length === 0) {
      console.log('⚠️  No valid data found to import');
      await disconnectDB();
      process.exit(0);
    }
    
    // Show sample of first record
    if (data.length > 0) {
      console.log('\n📋 Sample record:');
      console.log(`   Year: ${data[0].year}, Location: ${data[0].location}`);
      console.log(`   Jan: ${data[0].jan}, Feb: ${data[0].feb}, Mar: ${data[0].mar}`);
    }
    
    // Import to MongoDB
    console.log('\n💾 Importing to MongoDB...');
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const record of data) {
      try {
        // Use upsert to avoid duplicates (based on year and location)
        const query = { year: record.year };
        if (record.location) {
          query.location = record.location;
        }
        
        const result = await TemperatureData.findOneAndUpdate(
          query,
          { $set: record },
          { upsert: true, new: true }
        );
        if (result.isNew) {
          imported++;
        } else {
          updated++;
        }
      } catch (error) {
        errors++;
        console.error(`   Error importing record for year ${record.year}:`, error.message);
      }
    }
    
    console.log('\n✅ Import complete!');
    console.log(`   Imported: ${imported} new records`);
    console.log(`   Updated: ${updated} existing records`);
    if (errors > 0) {
      console.log(`   Errors: ${errors} records`);
    }
    
    // Show summary
    const total = await TemperatureData.countDocuments();
    console.log(`\n📈 Total records in database: ${total}`);
    
    // Show year range for this location
    if (options.location) {
      const locationData = await TemperatureData.find({ location: options.location }).sort({ year: 1 });
      if (locationData.length > 0) {
        console.log(`\n📍 ${options.location} data:`);
        console.log(`   Years: ${locationData[0].year} - ${locationData[locationData.length - 1].year}`);
        console.log(`   Records: ${locationData.length}`);
      }
    }
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

// Run import
importData();
