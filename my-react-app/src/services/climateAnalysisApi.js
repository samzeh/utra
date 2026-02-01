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
    // Use relative URL in browser (Vite proxy handles it), or absolute URL if specified
    const url = `${API_BASE_URL}/api/climate-analysis`;
    
    console.log('Fetching climate analysis from:', url);
    console.log('Request body:', { location, yearRange });
    
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
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Failed to fetch climate analysis: ${response.statusText}`;
      let errorDetails = null;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        // If response is not JSON, use status text
        console.error('Failed to parse error response:', e);
      }
      
      // Provide more helpful error message
      if (response.status === 404) {
        if (errorDetails && errorDetails.availableLocations) {
          throw new Error(`${errorMessage}. Available locations: ${errorDetails.availableLocations.join(', ')}`);
        }
        throw new Error(`${errorMessage}. Please check that the location name matches exactly.`);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Climate analysis received successfully');
    return data;
  } catch (error) {
    console.error('Error fetching climate analysis:', error);
    // Provide more helpful error message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please ensure the backend server is running on port 3001.');
    }
    throw error;
  }
}
