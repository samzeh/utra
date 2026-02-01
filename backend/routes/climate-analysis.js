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
 * Analyze climate trends for a location and assess Winter Olympics suitability
 * POST /api/climate-analysis
 * Body: { location: string, yearRange?: { start: number, end: number } }
 */
router.post('/', async (req, res) => {
  try {
    const { location, yearRange } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Fetch temperature data for the location
    const query = { location };
    if (yearRange) {
      query.year = { $gte: yearRange.start, $lte: yearRange.end };
    }
    
    const data = await TemperatureData.find(query).sort({ year: 1 });
    
    if (data.length === 0) {
      return res.status(404).json({ error: `No temperature data found for ${location}` });
    }

    // Calculate statistics
    const years = data.map(d => d.year);
    const yearRange_actual = {
      min: Math.min(...years),
      max: Math.max(...years)
    };

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
    const midPoint = Math.floor(annualAverages.length / 2);
    const firstHalf = annualAverages.slice(0, midPoint);
    const secondHalf = annualAverages.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;

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
        changePercent: ((trend / firstHalfAvg) * 100).toFixed(2)
      },
      sampleYears: {
        earliest: data[0],
        latest: data[data.length - 1]
      }
    };

    // Create comprehensive prompt for Gemini
    const prompt = `You are a climate scientist and sports medicine expert analyzing historical temperature data for Winter Olympics venue suitability assessment.

Location: ${location}
Data Period: ${yearRange_actual.min} - ${yearRange_actual.max} (${data.length} years of records)

Temperature Statistics:
- Overall Average: ${overallAvg?.toFixed(1)}°C
- Temperature Trend: ${trend > 0 ? '+' : ''}${trend.toFixed(2)}°C change (${analysisData.temperatureTrend.changePercent}%) from early period to recent period
- Monthly averages: ${JSON.stringify(monthlyStats, null, 2)}

Please provide a comprehensive analysis in the following format:

1. CLIMATE TREND ANALYSIS:
   Analyze the historical temperature trends and identify any significant patterns, warming trends, or climate changes.

2. WINTER OLYMPICS SUITABILITY ASSESSMENT:
   Evaluate whether ${location} is suitable for hosting future Winter Olympic events based on:
   - Average winter temperatures (Dec-Feb)
   - Temperature stability and consistency
   - Historical trends indicating warming or cooling
   - Comparison to ideal Winter Olympics conditions (typically requiring consistent sub-zero temperatures during competition months)
   - Snow reliability and ice quality factors

3. ATHLETE INJURY RISK ASSESSMENT:
   [IMPORTANT: This section must be clearly separated and distinct from other analysis]
   
   As a sports medicine expert, analyze how climate trends in ${location} may have affected or could affect injury rates for winter athletes. Consider:
   - How warming temperatures impact snow and ice conditions
   - Changes in surface hardness/softness affecting falls and impacts
   - Variable conditions leading to unpredictable terrain
   - Equipment performance in changing temperatures
   - Historical correlation between temperature anomalies and injury rates in winter sports
   - Specific risks for different winter sports (alpine skiing, figure skating, ice hockey, etc.)
   - Projected injury risk trends based on current climate trajectory
   
   Provide a specific injury risk rating (Low/Medium/High/Very High) and detailed explanation of the factors contributing to this risk.

Format your response as structured text with clear section headers. Be specific, data-driven, and cite the temperature statistics provided.`;

    // Get Gemini analysis
    const geminiAnalysis = await analyzeData(prompt, analysisData);

    // Parse the analysis to extract injury risk separately
    const injuryRiskMatch = geminiAnalysis.match(/ATHLETE INJURY RISK ASSESSMENT:?([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    const injuryRiskSection = injuryRiskMatch ? injuryRiskMatch[1].trim() : null;
    
    // Extract injury risk rating
    const riskRatingMatch = geminiAnalysis.match(/injury risk rating[:\s]+(Low|Medium|High|Very High)/i);
    const injuryRiskRating = riskRatingMatch ? riskRatingMatch[1] : 'Unknown';

    // Remove injury risk section from main analysis for separate display
    const mainAnalysis = geminiAnalysis.replace(/ATHLETE INJURY RISK ASSESSMENT:?[\s\S]*?(?=\n\n|\n[A-Z]|$)/i, '').trim();

    res.json({
      location,
      yearRange: yearRange_actual,
      statistics: {
        totalRecords: data.length,
        overallAverage: overallAvg,
        temperatureTrend: analysisData.temperatureTrend,
        monthlyStatistics: monthlyStats
      },
      analysis: {
        climateTrends: mainAnalysis,
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
    res.status(500).json({ 
      error: 'Failed to analyze climate data', 
      message: error.message 
    });
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

export default router;
