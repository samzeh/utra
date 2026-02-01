/**
 * Temperature Data API Routes
 * 
 * Provides endpoints to query and access temperature data from MongoDB.
 */

import express from 'express';
import TemperatureData from '../models/TemperatureData.js';

const router = express.Router();

// GET /api/temperature - Get all temperature data with optional filters
router.get('/', async (req, res) => {
  try {
    const { year, minYear, maxYear, month, limit, sort, location } = req.query;
    
    // Build query
    const query = {};
    
    if (year) {
      query.year = parseInt(year);
    } else {
      if (minYear) query.year = { ...query.year, $gte: parseInt(minYear) };
      if (maxYear) query.year = { ...query.year, $lte: parseInt(maxYear) };
    }
    
    // Filter by location if provided
    if (location) {
      query.location = location;
    }
    
    // Build projection if specific month requested
    let projection = {};
    if (month) {
      const monthMap = {
        'jan': 'jan', 'feb': 'feb', 'mar': 'mar', 'apr': 'apr',
        'may': 'may', 'jun': 'jun', 'jul': 'jul', 'aug': 'aug',
        'sep': 'sep', 'oct': 'oct', 'nov': 'nov', 'dec': 'dec'
      };
      const monthKey = monthMap[month.toLowerCase()];
      if (monthKey) {
        projection = { year: 1, [monthKey]: 1 };
      }
    }
    
    // Build options
    const options = {};
    if (limit) options.limit = parseInt(limit);
    if (sort) {
      options.sort = sort === 'desc' ? { year: -1 } : { year: 1 };
    } else {
      options.sort = { year: 1 }; // Default sort by year ascending
    }
    
    const data = await TemperatureData.find(query, projection, options);
    
    res.json({
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temperature/stats - Get statistics about the data
router.get('/stats', async (req, res) => {
  try {
    const { location } = req.query;
    const query = location ? { location } : {};
    
    const total = await TemperatureData.countDocuments(query);
    const years = await TemperatureData.find(query, { year: 1 }).sort({ year: 1 });
    
    const yearRange = years.length > 0 ? {
      min: years[0].year,
      max: years[years.length - 1].year
    } : null;
    
    // Get unique locations
    const locations = await TemperatureData.distinct('location');
    
    res.json({
      totalRecords: total,
      yearRange: yearRange,
      availableYears: years.map(y => y.year),
      locations: locations.filter(l => l !== null)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temperature/year/:year - Get data for a specific year
router.get('/year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const { location } = req.query;
    
    const query = { year };
    if (location) {
      query.location = location;
    }
    
    const data = location 
      ? await TemperatureData.findOne(query)
      : await TemperatureData.find(query);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ error: `No data found for year ${year}${location ? ` in ${location}` : ''}` });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temperature/range/:startYear/:endYear - Get data for a year range
router.get('/range/:startYear/:endYear', async (req, res) => {
  try {
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);
    
    const data = await TemperatureData.find({
      year: { $gte: startYear, $lte: endYear }
    }).sort({ year: 1 });
    
    res.json({
      range: { start: startYear, end: endYear },
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temperature/month/:month - Get all data for a specific month
router.get('/month/:month', async (req, res) => {
  try {
    const month = req.params.month.toLowerCase();
    const monthMap = {
      'jan': 'jan', 'feb': 'feb', 'mar': 'mar', 'apr': 'apr',
      'may': 'may', 'jun': 'jun', 'jul': 'jul', 'aug': 'aug',
      'sep': 'sep', 'oct': 'oct', 'nov': 'nov', 'dec': 'dec'
    };
    
    const monthKey = monthMap[month];
    if (!monthKey) {
      return res.status(400).json({ error: 'Invalid month. Use: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec' });
    }
    
    const data = await TemperatureData.find(
      { [monthKey]: { $ne: null } },
      { year: 1, [monthKey]: 1 }
    ).sort({ year: 1 });
    
    res.json({
      month: monthKey,
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temperature/average/:year - Get average temperature for a year
router.get('/average/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const data = await TemperatureData.findOne({ year });
    
    if (!data) {
      return res.status(404).json({ error: `No data found for year ${year}` });
    }
    
    const values = data.getMonthlyValues().filter(v => v !== null);
    const average = values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : null;
    
    res.json({
      year: year,
      average: average,
      availableMonths: values.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
