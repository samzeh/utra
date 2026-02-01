/**
 * Build sidebar-insights API input from venue and optional telemetry.
 * Uses venue data to construct mock telemetry if none provided.
 * Includes real Beijing regional climate data from message-data.csv.
 */

import { monthlyAverages, monthlyMin, monthlyMax } from '../data/temperatureData';

export function buildSidebarInput(venue, telemetryOverrides = {}) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 6);
  const end = new Date(now);

  // Mock temperature time-series from venue surfaceTemp (slight deterministic variation)
  const tempPoints = [];
  for (let i = 12; i >= 0; i--) {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() - i * 30);
    const drift = ((venue.id * 7 + i) % 10 - 5) * 0.15;
    const v = venue.surfaceTemp + drift;
    tempPoints.push({ tsISO: t.toISOString(), value: Math.round(v * 10) / 10 });
  }

  const venueInput = {
    id: String(venue.id),
    name: venue.name,
    sportType: venue.type,
    surfaceType: venue.type.includes('Ice') ? 'ice' : venue.type.includes('Snow') ? 'snow' : 'mixed',
    latitude: venue.coordinates[1],
    longitude: venue.coordinates[0],
    elevationM: venue.location === 'Yanqing' ? 1200 : venue.location === 'Zhangjiakou' ? 1700 : 50,
    surfaceTemp: venue.surfaceTemp,
    stabilityScore: venue.stabilityScore,
    riskLevel: venue.riskLevel,
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
