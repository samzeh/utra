/**
 * Grenoble Temperature Data
 * 
 * Fetches and manages temperature data for Grenoble, France
 */

import { fetchTemperatureData, fetchTemperatureStats, transformTemperatureToVenue } from '../services/temperatureApi';

const GRENOBLE_COORDINATES = [5.7245, 45.1885];
const LOCATION_NAME = 'Grenoble, France';

/**
 * Fetch Grenoble temperature data and transform to venue format
 */
export async function getGrenobleTemperatureData(yearRange = null) {
  try {
    const data = await fetchTemperatureData(LOCATION_NAME, yearRange);
    
    // Transform each record to venue format
    const venues = data
      .map(record => transformTemperatureToVenue(record, LOCATION_NAME))
      .filter(venue => venue !== null)
      .sort((a, b) => b.year - a.year); // Sort by year descending (most recent first)
    
    return venues;
  } catch (error) {
    console.error('Error fetching Grenoble data:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get recent years of Grenoble data (default: last 10 years)
 */
export async function getRecentGrenobleData(years = 10) {
  try {
    const stats = await fetchTemperatureStats(LOCATION_NAME);
    if (!stats.yearRange) return [];
    
    const endYear = stats.yearRange.max;
    const startYear = Math.max(stats.yearRange.min, endYear - years + 1);
    
    return await getGrenobleTemperatureData({ start: startYear, end: endYear });
  } catch (error) {
    console.error('Error fetching recent Grenoble data:', error);
    return [];
  }
}

/**
 * Get aggregated Grenoble data as a single marker
 * Combines recent years into one display point
 */
export async function getGrenobleAggregatedData(years = 20) {
  try {
    const data = await getRecentGrenobleData(years);
    if (data.length === 0) return null;
    
    // Calculate averages across all years
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthlyTotals = {};
    const monthlyCounts = {};
    
    months.forEach(month => {
      monthlyTotals[month] = 0;
      monthlyCounts[month] = 0;
    });
    
    let totalAvgTemp = 0;
    let avgTempCount = 0;
    let totalStability = 0;
    
    data.forEach(venue => {
      months.forEach(month => {
        if (venue.monthlyData && venue.monthlyData[month] !== null && venue.monthlyData[month] !== undefined) {
          monthlyTotals[month] += venue.monthlyData[month];
          monthlyCounts[month]++;
        }
      });
      
      if (venue.surfaceTemp !== null) {
        totalAvgTemp += venue.surfaceTemp;
        avgTempCount++;
      }
      totalStability += venue.stabilityScore;
    });
    
    // Calculate averages
    const monthlyAverages = {};
    months.forEach(month => {
      monthlyAverages[month] = monthlyCounts[month] > 0 
        ? parseFloat((monthlyTotals[month] / monthlyCounts[month]).toFixed(1))
        : null;
    });
    
    const avgTemp = avgTempCount > 0 ? parseFloat((totalAvgTemp / avgTempCount).toFixed(1)) : null;
    const avgStability = data.length > 0 ? Math.round(totalStability / data.length) : 0;
    const riskLevel = calculateRiskLevel(avgStability);
    
    const yearRange = {
      min: Math.min(...data.map(v => v.year)),
      max: Math.max(...data.map(v => v.year))
    };
    
    return {
      id: `grenoble-aggregated`,
      name: `${LOCATION_NAME}`,
      type: 'Climate Station',
      location: LOCATION_NAME,
      coordinates: GRENOBLE_COORDINATES,
      year: `${yearRange.min}-${yearRange.max}`,
      yearRange: yearRange,
      surfaceTemp: avgTemp,
      stabilityScore: avgStability,
      riskLevel: riskLevel,
      monthlyData: monthlyAverages,
      dataCount: data.length,
      aiInsight: `Aggregated temperature data for ${LOCATION_NAME} from ${yearRange.min} to ${yearRange.max}. Average temperature: ${avgTemp ? avgTemp.toFixed(1) : 'N/A'}°C across ${data.length} years of historical data.`,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating aggregated Grenoble data:', error);
    return null;
  }
}

/**
 * Get all available Grenoble data
 */
export async function getAllGrenobleData() {
  return await getGrenobleTemperatureData();
}

/**
 * Simulate data update (for real-time feel)
 */
export function simulateGrenobleDataUpdate(venue) {
  // For temperature data, we can add small variations
  const tempVariation = (Math.random() - 0.5) * 0.2;
  const scoreVariation = Math.floor((Math.random() - 0.5) * 2);
  
  return {
    ...venue,
    surfaceTemp: venue.surfaceTemp ? parseFloat((venue.surfaceTemp + tempVariation).toFixed(1)) : venue.surfaceTemp,
    stabilityScore: Math.max(0, Math.min(100, venue.stabilityScore + scoreVariation)),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate risk level based on stability score
 */
export function calculateRiskLevel(score) {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Medium';
  return 'High';
}

export { LOCATION_NAME, GRENOBLE_COORDINATES };
