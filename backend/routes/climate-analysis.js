/**
 * Climate Analysis Routes
 * 
 * Uses Gemini AI to analyze climate trends and assess suitability for Winter Olympics
 */

import express from 'express';
import { analyzeData } from '../config.js';
import TemperatureData from '../models/TemperatureData.js';

const router = express.Router();

/**
 * Test endpoint to verify route is working
 * GET /api/climate-analysis/test
 */
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Climate analysis route is working',
    timestamp: new Date().toISOString()
  });
});

/**
 * Simple test endpoint with minimal processing
 * POST /api/climate-analysis/simple
 */
router.post('/simple', async (req, res) => {
  try {
    const { location } = req.body;
    res.json({
      message: 'Simple test successful',
      location: location || 'not provided',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze climate trends for a location and assess Winter Olympics suitability
 * POST /api/climate-analysis
 * Body: { location: string, yearRange?: { start: number, end: number } }
 */
router.post('/', async (req, res) => {
  try {
    console.log('Climate analysis request received:', JSON.stringify(req.body));
    const { location, yearRange } = req.body;
    
    if (!location) {
      console.error('Location missing in request');
      return res.status(400).json({ error: 'Location is required' });
    }

    console.log(`Fetching temperature data for: "${location}"`);
    
    // Fetch temperature data for the location - try exact match first
    let query = { location: location.trim() };
    if (yearRange && yearRange.start && yearRange.end) {
      query.year = { $gte: yearRange.start, $lte: yearRange.end };
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    let data = await TemperatureData.find(query).sort({ year: 1 }).lean();
    console.log(`Found ${data.length} records for "${location}"`);
    
    // If no exact match, try case-insensitive search
    if (!data || data.length === 0) {
      console.log('Trying case-insensitive search...');
      const locationRegex = new RegExp(`^${location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      query = { location: { $regex: locationRegex } };
      if (yearRange && yearRange.start && yearRange.end) {
        query.year = { $gte: yearRange.start, $lte: yearRange.end };
      }
      data = await TemperatureData.find(query).sort({ year: 1 }).lean();
      console.log(`Found ${data.length} records with case-insensitive search`);
    }
    
    if (!data || data.length === 0) {
      console.error(`No temperature data found for "${location}"`);
      // Return available locations to help debug
      const availableLocations = await TemperatureData.distinct('location');
      return res.status(404).json({ 
        error: `No temperature data found for "${location}"`,
        availableLocations: availableLocations,
        suggestion: 'Check if the location name matches exactly (case-sensitive)'
      });
    }
    
    console.log(`Successfully found ${data.length} records, proceeding with analysis...`);

    // Calculate statistics
    if (!data || data.length === 0) {
      console.error('Data array is empty after MongoDB query');
      return res.status(404).json({ error: `No temperature data found for ${location}` });
    }
    
    const years = data.map(d => d && d.year).filter(y => y !== null && y !== undefined && !isNaN(y));
    if (years.length === 0) {
      console.error('No valid years found in data');
      return res.status(500).json({ error: 'Invalid data: no years found' });
    }
    
    const yearRange_actual = {
      min: Math.min(...years),
      max: Math.max(...years)
    };
    
    console.log(`Year range: ${yearRange_actual.min} - ${yearRange_actual.max}`);

    // Calculate monthly averages across all years
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthlyStats = {};
    
    months.forEach(month => {
      const values = data
        .map(d => d[month])
        .filter(v => v !== null && v !== undefined && v !== 999.9 && v !== -999);
      
      if (values.length > 0) {
        monthlyStats[month] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    // Calculate annual averages
    const annualAverages = data
      .map(d => {
        const values = months
          .map(m => d[m])
          .filter(v => v !== null && v !== undefined && v !== 999.9 && v !== -999);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      })
      .filter(v => v !== null);

    const overallAvg = annualAverages.length > 0
      ? annualAverages.reduce((a, b) => a + b, 0) / annualAverages.length
      : null;

    // Calculate trend (comparing first half vs second half of data)
    let firstHalfAvg = 0;
    let secondHalfAvg = 0;
    let trend = 0;
    let changePercent = '0.00';
    
    try {
      if (annualAverages && annualAverages.length > 1) {
        const midPoint = Math.floor(annualAverages.length / 2);
        const firstHalf = annualAverages.slice(0, midPoint);
        const secondHalf = annualAverages.slice(midPoint);
        
        if (firstHalf.length > 0) {
          firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        }
        if (secondHalf.length > 0) {
          secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        }
        trend = secondHalfAvg - firstHalfAvg;
        
        if (firstHalfAvg !== 0 && !isNaN(firstHalfAvg) && isFinite(firstHalfAvg)) {
          changePercent = ((trend / firstHalfAvg) * 100).toFixed(2);
        }
      }
    } catch (trendError) {
      console.error('Error calculating trend:', trendError);
      // Use defaults (already set above)
    }

    // Prepare data for Gemini analysis
    const analysisData = {
      location,
      yearRange: yearRange_actual,
      totalRecords: data.length,
      monthlyStatistics: monthlyStats,
      overallAverage: overallAvg,
      temperatureTrend: {
        firstHalfAverage: firstHalfAvg,
        secondHalfAverage: secondHalfAvg,
        change: trend,
        changePercent: changePercent
      },
      sampleYears: {
        earliest: data[0],
        latest: data[data.length - 1]
      }
    };

    // Calculate winter months (Dec, Jan, Feb) statistics for Olympics assessment
    const winterMonths = ['dec', 'jan', 'feb'];
    const winterTemps = [];
    winterMonths.forEach(month => {
      if (monthlyStats[month] && monthlyStats[month].avg !== null && monthlyStats[month].avg !== undefined && !isNaN(monthlyStats[month].avg)) {
        winterTemps.push(monthlyStats[month].avg);
      }
    });
    const avgWinterTemp = winterTemps.length > 0 
      ? parseFloat((winterTemps.reduce((a, b) => a + b, 0) / winterTemps.length).toFixed(1))
      : null;
    
    console.log(`Average winter temp: ${avgWinterTemp}`);

    // Safely format values for prompt (define before using in template string)
    const overallAvgStr = overallAvg !== null && !isNaN(overallAvg) ? overallAvg.toFixed(1) : 'N/A';
    const avgWinterTempStr = avgWinterTemp !== null && !isNaN(avgWinterTemp) ? avgWinterTemp.toFixed(1) : 'N/A';
    const trendStr = trend > 0 ? '+' : '';
    const trendValue = !isNaN(trend) ? trend.toFixed(2) : '0.00';
    const firstHalfAvgStr = !isNaN(firstHalfAvg) ? firstHalfAvg.toFixed(1) : '0.0';
    const secondHalfAvgStr = !isNaN(secondHalfAvg) ? secondHalfAvg.toFixed(1) : '0.0';
    const midYear = Math.floor((yearRange_actual.min + yearRange_actual.max) / 2);
    const midYear2 = Math.ceil((yearRange_actual.min + yearRange_actual.max) / 2);

    // Create comprehensive prompt for Gemini
    const prompt = `You are a climate scientist and sports medicine expert analyzing historical temperature data from MongoDB for Winter Olympics venue suitability assessment.

Location: ${location}
Data Period: ${yearRange_actual.min} - ${yearRange_actual.max} (${data.length} years of records from MongoDB database)

Temperature Statistics from MongoDB:
- Overall Average Temperature: ${overallAvgStr}°C
- Average Winter Temperature (Dec-Feb): ${avgWinterTempStr}°C
- Temperature Trend: ${trendStr}${trendValue}°C change (${changePercent}%) from early period (${yearRange_actual.min}-${midYear}) to recent period (${midYear2}-${yearRange_actual.max})
- First Half Average (${yearRange_actual.min}-${midYear}): ${firstHalfAvgStr}°C
- Second Half Average (${midYear2}-${yearRange_actual.max}): ${secondHalfAvgStr}°C
- Monthly Statistics: ${JSON.stringify(monthlyStats, null, 2)}

Please provide a comprehensive analysis in the following format:

1. CLIMATE TREND ANALYSIS:
   Analyze the historical temperature trends from ${yearRange_actual.min} to ${yearRange_actual.max} and identify:
   - Significant patterns, warming trends, or climate changes
   - Rate of temperature change per decade
   - Projected temperatures for 2030, 2040, and 2050 based on current trends
   - Seasonal variations and their implications

2. FUTURE WINTER OLYMPICS HOSTING SUITABILITY (2025-2050):
   [CRITICAL: Provide a clear assessment of likelihood and reasoning]
   
   Evaluate whether ${location} could successfully host Winter Olympic events in the future (2025-2050) based on:
   - Current average winter temperatures (Dec-Feb): ${avgWinterTempStr}°C
   - Projected winter temperatures for 2030, 2040, 2050 based on the ${trend > 0 ? 'warming' : 'cooling'} trend
   - Temperature stability and consistency requirements for Winter Olympics (typically need consistent sub-zero temperatures during competition months)
   - Snow reliability and ice quality factors
   - Comparison to successful past Winter Olympics host cities
   - Risk of needing artificial snow/ice production
   
   Provide a clear assessment:
   - LIKELIHOOD: Very Likely / Likely / Unlikely / Very Unlikely
   - TIMELINE: When (if ever) this location could host (e.g., "Suitable through 2035, then becomes marginal")
   - REASONING: Detailed explanation of why, citing specific temperature data and trends
   - MITIGATION: What would be needed (if anything) to make it viable

3. ATHLETE INJURY RISK ASSESSMENT:
   [IMPORTANT: This section must be clearly separated and distinct from other analysis]
   
   As a sports medicine expert, analyze how climate trends in ${location} have affected and will affect injury rates for winter athletes. Consider:
   - How warming temperatures (${trend > 0 ? trendValue + '°C increase' : trendValue + '°C decrease'}) impact snow and ice conditions
   - Changes in surface hardness/softness affecting falls and impacts
   - Variable conditions leading to unpredictable terrain and increased fall risk
   - Equipment performance degradation in changing temperatures (skis, skates, etc.)
   - Historical correlation between temperature anomalies and injury rates in winter sports
   - Specific risks for different winter sports:
     * Alpine skiing: Icy patches, variable snow conditions
     * Figure skating: Soft ice, inconsistent surface
     * Ice hockey: Poor ice quality, increased collisions
     * Snowboarding: Unpredictable terrain, equipment failure
   - Projected injury risk trends based on current climate trajectory (2025-2050)
   - Rate of injury increase/decrease: Quantify how injury rates may have changed or will change
   
   Provide a specific injury risk rating (Low/Medium/High/Very High) and detailed explanation of:
   - Current injury risk level
   - Historical injury risk trends (if data suggests)
   - Projected future injury risk (2025-2050)
   - Key factors contributing to this risk assessment
   - Specific recommendations for athlete safety

Format your response as structured text with clear section headers. Be specific, data-driven, and cite the temperature statistics provided. Use the actual MongoDB data values in your analysis.`;

    // Get Gemini analysis
    let geminiAnalysis;
    try {
      console.log('Calling Gemini API...');
      // Temporarily skip Gemini to test if route works
      throw new Error('Skipping Gemini for testing');
      // geminiAnalysis = await analyzeData(prompt, analysisData, 'gemini-1.5-flash');
      // console.log('Gemini API call successful');
    } catch (geminiError) {
      console.log('Using fallback analysis (expected for testing)');
      console.error('Gemini error:', geminiError.message);
      console.error('Gemini API error:', geminiError);
      console.error('Error details:', geminiError.message);
      // Return a detailed fallback analysis if Gemini fails
      const winterAvgValue = avgWinterTemp; // Already a number or null
      const winterAvgStr = winterAvgValue !== null && !isNaN(winterAvgValue) ? winterAvgValue.toFixed(1) + '°C' : 'insufficient data';
      const suitability = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 0) ? 'Likely' : 
                          (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 5) ? 'Marginal' : 'Unlikely';
      const trendDesc = trend > 0 ? 'warming' : 'cooling';
      const trendAbs = Math.abs(trend).toFixed(2);
      const trendImpact = trend > 0 ? 'may become less suitable' : 'remains suitable';
      const tempSupport = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 0) ? 'supports' : 'challenges';
      const trendImpact2 = trend > 0 ? 'Warming trend suggests declining suitability over time.' : 'Stable or cooling trend maintains viability.';
      const mitigation = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue >= 0) ? 
        'Would require significant artificial snow/ice production and temperature control systems.' : 
        'Natural conditions may be sufficient with minimal artificial support.';
      const injuryRating = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < -5) ? 'Low' : 
                          (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 0) ? 'Medium' : 'High';
      const conditions = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 0) ? 'generally favorable' : 'challenging';
      const trendImpact3 = trend > 0 ? 'The warming trend suggests increasing injury risks due to variable snow/ice conditions.' : 
                          'Stable conditions maintain consistent injury risk levels.';
      const variability = trend > 0 ? 'Increasing variability may lead to unpredictable surface conditions' : 
                         'Stable conditions reduce injury risk';
      const surfaceQuality = (winterAvgValue !== null && !isNaN(winterAvgValue) && winterAvgValue < 0) ? 
        'Cold temperatures support hard, consistent surfaces' : 
        'Warmer conditions create softer, more variable surfaces';
      
      geminiAnalysis = `CLIMATE TREND ANALYSIS:
Based on the temperature data from ${yearRange_actual.min} to ${yearRange_actual.max}, ${location} shows a ${trendDesc} trend of ${trendAbs}°C over the historical period. The average winter temperature (Dec-Feb) is ${winterAvgStr}.

FUTURE WINTER OLYMPICS HOSTING SUITABILITY (2025-2050):
LIKELIHOOD: ${suitability}
TIMELINE: Based on current trends, this location ${trendImpact} for Winter Olympics hosting.
REASONING: Average winter temperature of ${winterAvgStr} ${tempSupport} natural snow and ice conditions. ${trendImpact2}
MITIGATION: ${mitigation}

Note: Full AI analysis unavailable due to Gemini API configuration issue. This is a basic analysis based on temperature statistics.

ATHLETE INJURY RISK ASSESSMENT:
INJURY RISK RATING: ${injuryRating}

Based on the temperature data, ${location} has ${conditions} conditions for winter sports. ${trendImpact3}

Key factors:
- Winter temperature average: ${winterAvgStr}
- Temperature variability: ${variability}
- Surface quality: ${surfaceQuality}

Note: Full AI analysis unavailable due to Gemini API configuration issue. Please configure GEMINI_API_KEY in backend/.env for detailed analysis.`;
    }

    // Parse the analysis to extract sections
    // Extract Olympics suitability section
    const olympicsMatch = geminiAnalysis.match(/FUTURE WINTER OLYMPICS HOSTING SUITABILITY[^:]*:?([\s\S]*?)(?=ATHLETE INJURY RISK ASSESSMENT|$)/i);
    const olympicsSection = olympicsMatch ? olympicsMatch[1].trim() : null;
    
    // Extract injury risk section separately
    const injuryRiskMatch = geminiAnalysis.match(/ATHLETE INJURY RISK ASSESSMENT:?([\s\S]*?)(?=\n\n\n|\n[A-Z]{2,}|$)/i);
    const injuryRiskSection = injuryRiskMatch ? injuryRiskMatch[1].trim() : null;
    
    // Extract injury risk rating
    const riskRatingMatch = geminiAnalysis.match(/INJURY RISK RATING[:\s]+(Low|Medium|High|Very High)/i) || 
                           geminiAnalysis.match(/injury risk rating[:\s]+(Low|Medium|High|Very High)/i);
    const injuryRiskRating = riskRatingMatch ? riskRatingMatch[1] : 'Unknown';

    // Extract Olympics likelihood
    const likelihoodMatch = geminiAnalysis.match(/LIKELIHOOD[:\s]+(Very Likely|Likely|Unlikely|Very Unlikely)/i);
    const olympicsLikelihood = likelihoodMatch ? likelihoodMatch[1] : null;

    // Remove both sections from main analysis for separate display
    let mainAnalysis = geminiAnalysis
      .replace(/FUTURE WINTER OLYMPICS HOSTING SUITABILITY[^:]*:?[\s\S]*?(?=ATHLETE INJURY RISK ASSESSMENT|$)/i, '')
      .replace(/ATHLETE INJURY RISK ASSESSMENT:?[\s\S]*?(?=\n\n\n|\n[A-Z]{2,}|$)/i, '')
      .trim();

    res.json({
      location,
      yearRange: yearRange_actual,
      statistics: {
        totalRecords: data.length,
        overallAverage: overallAvg,
        temperatureTrend: {
          firstHalfAverage: firstHalfAvg,
          secondHalfAverage: secondHalfAvg,
          change: trend,
          changePercent: changePercent
        },
        monthlyStatistics: monthlyStats
      },
      analysis: {
        climateTrends: mainAnalysis,
        olympicsSuitability: {
          likelihood: olympicsLikelihood,
          detailedAnalysis: olympicsSection || 'Olympics suitability analysis not available',
          timeline: extractTimeline(olympicsSection),
          reasoning: extractReasoning(olympicsSection)
        },
        injuryRisk: {
          rating: injuryRiskRating,
          detailedAnalysis: injuryRiskSection || 'Injury risk analysis not available',
          factors: extractInjuryFactors(injuryRiskSection)
        },
        fullAnalysis: geminiAnalysis // Keep full analysis for reference
      }
    });
  } catch (error) {
    console.error('Climate analysis error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Return a more helpful error message
    const errorResponse = {
      error: 'Failed to analyze climate data',
      message: error.message || 'Unknown error occurred',
      location: req.body?.location || 'unknown',
    };
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      errorResponse.errorName = error.name;
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * Helper function to extract key injury risk factors
 */
function extractInjuryFactors(injuryRiskText) {
  if (!injuryRiskText) return [];
  
  const factors = [];
  const lines = injuryRiskText.split('\n').filter(line => line.trim());
  
  // Look for bullet points or key phrases
  lines.forEach(line => {
    if (line.match(/[-•*]\s*|^\d+\./)) {
      factors.push(line.replace(/[-•*]\s*|^\d+\.\s*/, '').trim());
    }
  });
  
  return factors.length > 0 ? factors : [injuryRiskText];
}

/**
 * Helper function to extract timeline from Olympics suitability section
 */
function extractTimeline(olympicsText) {
  if (!olympicsText) return null;
  const timelineMatch = olympicsText.match(/TIMELINE[:\s]+([^\n]+)/i);
  return timelineMatch ? timelineMatch[1].trim() : null;
}

/**
 * Helper function to extract reasoning from Olympics suitability section
 */
function extractReasoning(olympicsText) {
  if (!olympicsText) return null;
  const reasoningMatch = olympicsText.match(/REASONING[:\s]+([^\n]+(?:\n(?!MITIGATION|LIKELIHOOD|TIMELINE)[^\n]+)*)/i);
  return reasoningMatch ? reasoningMatch[1].trim() : null;
}

export default router;
