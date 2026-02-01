/**
 * Temperature API Service
 * 
 * Fetches temperature data from the backend API
 */

// Use relative URL in browser (Vite proxy handles it), or absolute URL if specified
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

/**
 * Fetch temperature data for a specific location
 */
export async function fetchTemperatureData(location, yearRange = null) {
  try {
    let url = `${API_BASE_URL}/api/temperature?location=${encodeURIComponent(location)}`;
    
    if (yearRange) {
      url += `&minYear=${yearRange.start}&maxYear=${yearRange.end}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch temperature data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    throw error;
  }
}

/**
 * Fetch temperature statistics for a location
 */
export async function fetchTemperatureStats(location = null) {
  try {
    let url = `${API_BASE_URL}/api/temperature/stats`;
    if (location) {
      url += `?location=${encodeURIComponent(location)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching temperature stats:', error);
    throw error;
  }
}

/**
 * Fetch temperature data for a specific year
 */
export async function fetchTemperatureByYear(location, year) {
  try {
    const url = `${API_BASE_URL}/api/temperature/year/${year}?location=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch temperature data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching temperature by year:', error);
    throw error;
  }
}

/**
 * Transform temperature data to venue-like format for display
 */
export function transformTemperatureToVenue(tempData, locationName) {
  if (!tempData || !tempData.year) return null;
  
  // Calculate average temperature from monthly values
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const values = months
    .map(month => tempData[month])
    .filter(val => val !== null && val !== undefined);
  
  const avgTemp = values.length > 0
    ? values.reduce((sum, val) => sum + val, 0) / values.length
    : null;
  
  // Calculate stability score based on temperature variance
  const variance = values.length > 1
    ? values.reduce((sum, val) => sum + Math.pow(val - avgTemp, 2), 0) / values.length
    : 0;
  
  // Lower variance = higher stability (inverted, scaled to 0-100)
  const stabilityScore = Math.max(0, Math.min(100, 100 - (variance * 2)));
  
  // Determine risk level
  let riskLevel = 'Low';
  if (stabilityScore < 60) riskLevel = 'High';
  else if (stabilityScore < 80) riskLevel = 'Medium';
  
  // Get coordinates for location
  const locationCoords = {
    'Milan, Italy': [9.1859, 45.4642],
    'Beijing': [116.3913, 39.9042],
  };
  
  const coordinates = locationCoords[locationName] || [0, 0];
  
  return {
    id: `temp-${tempData.year}-${locationName}`,
    name: `${locationName} - ${tempData.year}`,
    type: 'Temperature Station',
    location: locationName,
    coordinates: coordinates,
    year: tempData.year,
    surfaceTemp: avgTemp ? parseFloat(avgTemp.toFixed(1)) : null,
    stabilityScore: Math.round(stabilityScore),
    riskLevel: riskLevel,
    monthlyData: {
      jan: tempData.jan,
      feb: tempData.feb,
      mar: tempData.mar,
      apr: tempData.apr,
      may: tempData.may,
      jun: tempData.jun,
      jul: tempData.jul,
      aug: tempData.aug,
      sep: tempData.sep,
      oct: tempData.oct,
      nov: tempData.nov,
      dec: tempData.dec,
    },
    aiInsight: `Historical temperature data for ${locationName} in ${tempData.year}. Average temperature: ${avgTemp ? avgTemp.toFixed(1) : 'N/A'}°C.`,
    lastUpdated: tempData.updatedAt || tempData.createdAt || new Date().toISOString(),
  };
}
