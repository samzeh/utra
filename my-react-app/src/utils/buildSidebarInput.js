/**
 * Build sidebar-insights API input from venue and optional telemetry.
 * Uses venue data to construct mock telemetry if none provided.
 * Includes real Beijing regional climate data from message-data.csv.
 */

import { monthlyAverages, monthlyMin, monthlyMax } from '../data/temperatureData';

export function buildSidebarInput(venue, telemetryOverrides = {}) {
  if (!venue) {
    throw new Error('Venue is required');
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 6);
  const end = new Date(now);

  // Safe venue ID conversion for calculations
  const venueIdNum = typeof venue.id === 'number' ? venue.id : (typeof venue.id === 'string' ? parseInt(venue.id) || 1 : 1);
  const surfaceTemp = venue.surfaceTemp ?? 0;

  // Mock temperature time-series from venue surfaceTemp (slight deterministic variation)
  const tempPoints = [];
  for (let i = 12; i >= 0; i--) {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() - i * 30);
    const drift = ((venueIdNum * 7 + i) % 10 - 5) * 0.15;
    const v = surfaceTemp + drift;
    tempPoints.push({ tsISO: t.toISOString(), value: Math.round(v * 10) / 10 });
  }

  // Determine surface type safely
  const venueType = venue.type || 'Unknown';
  const surfaceType = venueType.includes('Ice') ? 'ice' 
    : venueType.includes('Snow') ? 'snow' 
    : venueType.includes('Temperature') ? 'mixed'
    : 'mixed';

  // Determine elevation based on location
  const location = venue.location || '';
  const elevationM = location === 'Yanqing' ? 1200 
    : location === 'Zhangjiakou' ? 1700 
    : location.includes('Milan') ? 120
    : 50;

  const coordinates = venue.coordinates || [0, 0];

  const venueInput = {
    id: String(venue.id || 'unknown'),
    name: venue.name || 'Unknown Venue',
    sportType: venueType,
    surfaceType: surfaceType,
    latitude: coordinates[1] || 0,
    longitude: coordinates[0] || 0,
    elevationM: elevationM,
    surfaceTemp: surfaceTemp,
    stabilityScore: venue.stabilityScore ?? 0,
    riskLevel: venue.riskLevel || 'Unknown',
  };

  const timeWindow = {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    tz: 'Asia/Shanghai',
  };

  const telemetry = {
    temperatureC: telemetryOverrides.temperatureC ?? tempPoints,
    humidityPct: telemetryOverrides.humidityPct,
    windMps: telemetryOverrides.windMps,
    precipMm: telemetryOverrides.precipMm,
    snowMm: telemetryOverrides.snowMm,
  };

  return {
    venue: venueInput,
    timeWindow,
    telemetry,
    opsLogs: telemetryOverrides.opsLogs ?? [],
    regionalClimate: {
      monthlyAverages,
      monthlyMin,
      monthlyMax,
      recordCount: 186,
    },
  };
}
