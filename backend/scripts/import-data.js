/**
 * Import Data Script
 * 
 * This script imports data from txt or csv files into MongoDB.
 * 
 * Usage:
 *   node scripts/import-data.js <file-path> [options]
 * 
 * Options:
 *   --model <modelName>  - Model to use (default: TemperatureData)
 *   --collection <name>  - Collection name (default: based on model)
 *   --format <csv|txt>   - File format (default: auto-detect)
 *   --skip-invalid       - Skip rows with invalid data
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
  model: 'TemperatureData',
  format: null,
  skipInvalid: args.includes('--skip-invalid'),
  startYear: null
};

// Parse options
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--model' && args[i + 1]) {
    options.model = args[i + 1];
  }
  if (args[i] === '--format' && args[i + 1]) {
    options.format = args[i + 1];
  }
  if (args[i] === '--start-year' && args[i + 1]) {
    options.startYear = parseInt(args[i + 1]);
  }
}

if (!filePath) {
  console.error('❌ Error: File path is required');
  console.log('\nUsage: node scripts/import-data.js <file-path> [options]');
  console.log('\nOptions:');
  console.log('  --model <name>     Model to use (default: TemperatureData)');
  console.log('  --format <csv|txt>  File format (default: auto-detect)');
  console.log('  --skip-invalid     Skip rows with invalid data');
  process.exit(1);
}

// Determine file format
function detectFormat(filePath) {
  if (options.format) {
    return options.format.toLowerCase();
  }
  const ext = filePath.split('.').pop().toLowerCase();
  return ext === 'csv' ? 'csv' : 'txt';
}

// Parse CSV line
function parseCSVLine(line) {
  return line.split(',').map(val => val.trim());
}

// Parse TXT line (handles various formats)
function parseTXTLine(line) {
  // Try comma-separated first
  if (line.includes(',')) {
    return parseCSVLine(line);
  }
  // Try tab-separated
  if (line.includes('\t')) {
    return line.split('\t').map(val => val.trim());
  }
  // Try space-separated (multiple spaces)
  return line.split(/\s+/).filter(val => val.length > 0);
}

// Convert value to number, handling missing data indicators
function parseValue(val) {
  if (!val || val.trim() === '' || val === 'null' || val === 'NULL') {
    return null;
  }
  const num = parseFloat(val);
  // Handle common missing data indicators
  if (isNaN(num) || num === 999.9 || num === -999 || num === 999) {
    return null;
  }
  return num;
}

// Parse data file
function parseDataFile(filePath, format) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Detect header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('jan') || firstLine.includes('year') || 
                      firstLine.includes('month') || firstLine.includes('date');
    
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const headers = hasHeader ? parseCSVLine(lines[0]) : null;

    const parser = format === 'csv' ? parseCSVLine : parseTXTLine;
    const data = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const values = parser(line);
      
      // Skip if all values are missing/invalid
      const validValues = values.filter(v => {
        const num = parseValue(v);
        return num !== null;
      });
      
      if (validValues.length === 0 && options.skipInvalid) {
        continue;
      }

      // Map values to object
      let record = {};
      
      if (headers) {
        // Use headers to map values
        let hasYear = false;
        headers.forEach((header, index) => {
          if (index < values.length) {
            const value = parseValue(values[index]);
            if (value !== null) {
              const headerLower = header.toLowerCase();
              // Check if this is a year column
              if (headerLower === 'year') {
                // If value looks like a year (1900-3000), use it as year
                // Otherwise, it might be average temperature, store as averageTemp
                if (value >= 1900 && value <= 3000) {
                  record.year = Math.round(value);
                  hasYear = true;
                } else {
                  record.averageTemp = value;
                }
              } else {
                record[headerLower] = value;
              }
            }
          }
        });
        
        // If no year found, try to infer from row number
        if (!hasYear) {
          const startYear = options.startYear || (process.env.START_YEAR ? parseInt(process.env.START_YEAR) : null);
          if (startYear) {
            // i is the index in the dataLines array (after header)
            record.year = startYear + i;
            hasYear = true;
          } else {
            // Skip if we can't determine year
            if (options.skipInvalid) {
              continue;
            }
          }
        }
        
        // Only add if we have a valid year
        if (!hasYear || !record.year) {
          if (options.skipInvalid) {
            continue;
          }
        }
      } else {
        // Assume standard format: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, year
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        // Last column might be year or average temperature
        // If we have 13 columns, check the last one
        let year = null;
        let averageTemp = null;
        
        if (values.length >= 13) {
          // Last column could be year or average
          const lastValue = parseValue(values[values.length - 1]);
          if (lastValue !== null) {
            // If it's a reasonable year (1900-3000), it's a year
            if (lastValue >= 1900 && lastValue <= 3000) {
              year = Math.round(lastValue);
            } else {
              // Otherwise, it's probably average temperature
              averageTemp = lastValue;
            }
          }
        }
        
        // If no year found, try to infer from row number
        // You can specify a starting year with --start-year option
        if (year === null) {
          // Try to infer year from data position (assuming data starts from a base year)
          // For temperature data, rows might represent sequential years
          // This is a fallback - adjust based on your data
          const startYear = options.startYear || (process.env.START_YEAR ? parseInt(process.env.START_YEAR) : null);
          if (startYear) {
            year = startYear + i; // i is the index in dataLines array
          } else {
            // Skip if we can't determine year
            if (options.skipInvalid) {
              continue;
            }
          }
        }
        
        // Only proceed if we have a valid year
        if (year !== null) {
          record.year = year;
          if (averageTemp !== null) {
            record.averageTemp = averageTemp;
          }
          
          // Map monthly values
          months.forEach((month, index) => {
            if (index < values.length - 1) {
              const value = parseValue(values[index]);
              if (value !== null) {
                record[month] = value;
              }
            }
          });
        }
      }

      // Only add if we have a valid year (required field)
      if (record.year && record.year >= 1900 && record.year <= 3000) {
        data.push(record);
      } else if (!options.skipInvalid) {
        // Log skipped records for debugging
        console.log(`   Skipping row ${i + 1}: missing or invalid year`);
      }
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

// Import data to MongoDB
async function importData() {
  try {
    console.log('📂 Importing data from:', filePath);
    
    // Resolve file path (can be relative or absolute)
    const resolvedPath = resolve(filePath);
    console.log('   Resolved path:', resolvedPath);
    
    // Detect format
    const format = detectFormat(filePath);
    console.log('   Format:', format);
    
    // Connect to database
    console.log('\n🔌 Connecting to MongoDB...');
    await connectDB();
    
    // Parse data
    console.log('\n📊 Parsing data file...');
    const data = parseDataFile(resolvedPath, format);
    console.log(`   Found ${data.length} records`);
    
    if (data.length === 0) {
      console.log('⚠️  No valid data found to import');
      await disconnectDB();
      process.exit(0);
    }
    
    // Import to MongoDB
    console.log('\n💾 Importing to MongoDB...');
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const record of data) {
      try {
        // Use upsert to avoid duplicates (based on year)
        if (record.year) {
          const result = await TemperatureData.findOneAndUpdate(
            { year: record.year },
            { $set: record },
            { upsert: true, new: true }
          );
          if (result.isNew) {
            imported++;
          } else {
            updated++;
          }
        } else {
          // If no year, just insert
          await TemperatureData.create(record);
          imported++;
        }
      } catch (error) {
        errors++;
        if (!options.skipInvalid) {
          console.error(`   Error importing record:`, error.message);
        }
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
