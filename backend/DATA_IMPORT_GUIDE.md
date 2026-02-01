# Data Import Guide

This guide explains how to import data from txt/csv files into MongoDB and access it via the API.

## Quick Start

### 1. Import Your Data

```bash
cd backend
npm run import <path-to-your-file> [options]
```

**Examples:**
```bash
# Import CSV file with auto-detected format
npm run import ../data/message-data.csv

# Import with starting year (if year column contains averages, not actual years)
npm run import ../data/message-data.csv --start-year 1838

# Skip invalid rows
npm run import ../data/message-data.csv --skip-invalid

# Specify format explicitly
npm run import ../data/data.txt --format txt
```

### 2. Access Your Data via API

Once imported, access your data through the API:

```bash
# Get all data
curl http://localhost:3001/api/temperature

# Get statistics
curl http://localhost:3001/api/temperature/stats

# Get data for a specific year
curl http://localhost:3001/api/temperature/year/2020

# Get data for a year range
curl http://localhost:3001/api/temperature/range/2020/2025

# Get data for a specific month
curl http://localhost:3001/api/temperature/month/jan

# Get average temperature for a year
curl http://localhost:3001/api/temperature/average/2020

# Get data with filters
curl "http://localhost:3001/api/temperature?minYear=2020&maxYear=2025&limit=10"
```

## Supported File Formats

### CSV Format
- Comma-separated values
- First row can be headers (auto-detected)
- Example:
  ```csv
  jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec,year
  -6.4,-2.9,2.5,13.4,19.8,21.5,25.2,23.5,18.8,11.7,3.8,-3.9,10.6
  ```

### TXT Format
- Can be comma, tab, or space-separated
- Headers are optional
- Example:
  ```
  jan  feb  mar  apr  may  jun  jul  aug  sep  oct  nov  dec  year
  -6.4 -2.9 2.5  13.4 19.8 21.5 25.2 23.5 18.8 11.7 3.8  -3.9 10.6
  ```

## Data Structure

The import script expects data with:
- **12 monthly values**: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec
- **Year column**: Can be actual year (1900-3000) or average temperature

If the "year" column contains average temperatures (like 10.6, 11.9), use `--start-year` to specify the starting year:

```bash
npm run import data.csv --start-year 1838
```

## Missing Data Handling

The script automatically handles common missing data indicators:
- `999.9`, `-999`, `999` → treated as null
- Empty values → treated as null
- `null`, `NULL` → treated as null

Use `--skip-invalid` to skip rows with no valid data.

## API Endpoints

### GET `/api/temperature`
Get all temperature data with optional filters.

**Query Parameters:**
- `year` - Specific year
- `minYear` - Minimum year
- `maxYear` - Maximum year
- `month` - Filter by specific month (jan, feb, mar, etc.)
- `limit` - Limit number of results
- `sort` - Sort order: `asc` or `desc` (default: asc)

**Example:**
```
GET /api/temperature?minYear=2020&maxYear=2025&limit=10
```

### GET `/api/temperature/stats`
Get statistics about the data.

**Response:**
```json
{
  "totalRecords": 156,
  "yearRange": {
    "min": 1838,
    "max": 2023
  },
  "availableYears": [1838, 1839, ...]
}
```

### GET `/api/temperature/year/:year`
Get data for a specific year.

**Example:**
```
GET /api/temperature/year/2020
```

### GET `/api/temperature/range/:startYear/:endYear`
Get data for a year range.

**Example:**
```
GET /api/temperature/range/2020/2025
```

### GET `/api/temperature/month/:month`
Get all data for a specific month.

**Example:**
```
GET /api/temperature/month/jan
```

### GET `/api/temperature/average/:year`
Get average temperature for a specific year.

**Example:**
```
GET /api/temperature/average/2020
```

## Customizing for Your Data

### Create a New Model

1. Create a model in `backend/models/`:
   ```javascript
   import mongoose from 'mongoose';
   
   const yourSchema = new mongoose.Schema({
     // your fields
   });
   
   export default mongoose.model('YourModel', yourSchema);
   ```

2. Update the import script to use your model, or create a new import script.

### Create Custom Routes

1. Create routes in `backend/routes/`:
   ```javascript
   import express from 'express';
   import YourModel from '../models/YourModel.js';
   
   const router = express.Router();
   
   router.get('/', async (req, res) => {
     const data = await YourModel.find();
     res.json(data);
   });
   
   export default router;
   ```

2. Add to `server.js`:
   ```javascript
   import yourRoutes from './routes/yourRoutes.js';
   app.use('/api/your-endpoint', yourRoutes);
   ```

## Troubleshooting

### "No valid data found to import"
- Check that your file has valid data
- Ensure the format matches expected structure
- Try using `--skip-invalid` to see what's being skipped

### "Year is required" errors
- Your data might not have a year column
- Use `--start-year` to specify the starting year
- Check that the year column contains actual years (1900-3000), not averages

### Data not showing in API
- Make sure the server is running: `npm start`
- Check that data was imported: `npm run import` should show "Import complete"
- Verify the collection name matches your model

## Next Steps

- Create custom models for your specific data types
- Add authentication to protect your API
- Add data validation and error handling
- Create frontend components to visualize the data
