/**
 * Climate Analysis API Service
 * 
 * Fetches Gemini AI climate analysis from the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

/**
 * Fetch climate analysis for a specific location
 */
export async function fetchClimateAnalysis(location, yearRange = null) {
  try {
    const url = `${API_BASE_URL}/api/climate-analysis`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        yearRange
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch climate analysis: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching climate analysis:', error);
    throw error;
  }
}
