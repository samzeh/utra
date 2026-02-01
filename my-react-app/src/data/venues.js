// Mock Winter Olympic venue data
// In production, this would come from a real-time API

export const olympicVenues = [
  {
    id: 1,
    name: "Ice Cube Curling Center",
    type: "Curling",
    location: "Beijing",
    coordinates: [116.3913, 39.9938],
    surfaceTemp: -4.2,
    stabilityScore: 92,
    riskLevel: "Low",
    aiInsight: "Ice surface is maintaining optimal temperature. No weather-related disruptions expected for the next 12 hours. Surface preparation completed 2 hours ago.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    name: "National Speed Skating Oval",
    type: "Speed Skating",
    location: "Beijing",
    coordinates: [116.3972, 39.9950],
    surfaceTemp: -3.8,
    stabilityScore: 88,
    riskLevel: "Low",
    aiInsight: "Ice quality excellent. Minor temperature fluctuation detected but within acceptable range. Zamboni maintenance scheduled in 3 hours.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Genting Snow Park - Halfpipe",
    type: "Freestyle Skiing",
    location: "Zhangjiakou",
    coordinates: [115.2833, 40.9833],
    surfaceTemp: -8.5,
    stabilityScore: 65,
    riskLevel: "Medium",
    aiInsight: "Snow stability declining due to rising ambient temperature. Wind speeds increasing. Recommend additional snow treatment before evening events.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    name: "National Sliding Centre - Bobsleigh",
    type: "Bobsleigh/Luge",
    location: "Yanqing",
    coordinates: [115.9795, 40.4714],
    surfaceTemp: -6.2,
    stabilityScore: 78,
    riskLevel: "Medium",
    aiInsight: "Track surface showing signs of wear in Turn 7. Ice temperature optimal but requires monitoring. Surface re-spray recommended within 2 hours.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Big Air Shougang",
    type: "Big Air",
    location: "Beijing",
    coordinates: [116.1833, 39.9167],
    surfaceTemp: -2.1,
    stabilityScore: 55,
    riskLevel: "High",
    aiInsight: "ALERT: Surface temperature approaching critical threshold. Wind gusts detected at 28 km/h. Consider delaying events by 90 minutes for re-freezing.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Wukesong Arena",
    type: "Ice Hockey",
    location: "Beijing",
    coordinates: [116.2833, 39.9167],
    surfaceTemp: -5.5,
    stabilityScore: 95,
    riskLevel: "Low",
    aiInsight: "Indoor venue performing optimally. Ice surface hardness ideal. HVAC systems maintaining perfect conditions. No interventions required.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 7,
    name: "National Alpine Ski Centre",
    type: "Alpine Skiing",
    location: "Yanqing",
    coordinates: [115.9833, 40.6333],
    surfaceTemp: -7.8,
    stabilityScore: 72,
    riskLevel: "Medium",
    aiInsight: "Snow coverage adequate but base layer showing weakness at mid-mountain. Weather models predict warming trend. Grooming operations ongoing.",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 8,
    name: "Genting Snow Park - Slopestyle",
    type: "Snowboard",
    location: "Zhangjiakou",
    coordinates: [115.2900, 40.9900],
    surfaceTemp: -9.2,
    stabilityScore: 82,
    riskLevel: "Low",
    aiInsight: "Excellent snow conditions. Fresh snowfall overnight improved surface quality. Jump landings inspected and cleared. Competition ready.",
    lastUpdated: new Date().toISOString(),
  },
];

// Helper function to simulate real-time data updates
export function simulateDataUpdate(venue) {
  const tempVariation = (Math.random() - 0.5) * 0.4;
  const scoreVariation = Math.floor((Math.random() - 0.5) * 3);
  
  return {
    ...venue,
    surfaceTemp: parseFloat((venue.surfaceTemp + tempVariation).toFixed(1)),
    stabilityScore: Math.max(0, Math.min(100, venue.stabilityScore + scoreVariation)),
    lastUpdated: new Date().toISOString(),
  };
}

// Determine risk level based on stability score
export function calculateRiskLevel(score) {
  if (score >= 80) return "Low";
  if (score >= 60) return "Medium";
  return "High";
}
