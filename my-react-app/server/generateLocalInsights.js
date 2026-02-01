/**
 * Local insight generator using venue + telemetry + regional climate data.
 * Produces the same JSON shape as Gemini when API quota is exceeded.
 * Uses actual Beijing region data from message-data.csv.
 */

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const DEFAULT_MONTHLY_AVG = {
  jan: -4.2, feb: -1.3, mar: 5.5, apr: 14.0, may: 20.3, jun: 24.7,
  jul: 26.4, aug: 25.1, sep: 20.1, oct: 13.0, nov: 4.3, dec: -2.3,
};

export function generateLocalInsights(input) {
  const venue = input.venue;
  const tel = input.telemetry || {};
  const climate = input.regionalClimate?.monthlyAverages || DEFAULT_MONTHLY_AVG;
  const temps = tel.temperatureC || [];
  const tw = input.timeWindow;

  // Derive metrics from data
  const currentTemp = temps.length ? temps[temps.length - 1].value : venue.surfaceTemp ?? 0;
  const tempRange = temps.length >= 2
    ? Math.max(...temps.map((t) => t.value)) - Math.min(...temps.map((t) => t.value))
    : 0;
  const avgTemp = temps.length ? temps.reduce((s, t) => s + t.value, 0) / temps.length : currentTemp;
  const nearFreeze = Math.abs(currentTemp) < 2 || temps.some((t) => Math.abs(t.value) < 2);
  const warming = temps.length >= 3 && temps[temps.length - 1].value > temps[0].value;

  // Stability score: lower near freeze, lower with high volatility
  let stabilityScore = 75;
  if (nearFreeze) stabilityScore -= 20;
  if (tempRange > 3) stabilityScore -= 15;
  if (warming && currentTemp > -2) stabilityScore -= 10;
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  // Risk level from stability
  let riskLevel = 'LOW';
  if (stabilityScore < 40) riskLevel = 'CRITICAL';
  else if (stabilityScore < 55) riskLevel = 'HIGH';
  else if (stabilityScore < 75) riskLevel = 'MEDIUM';

  // Key drivers from actual data
  const keyDrivers = [];
  if (nearFreeze) {
    keyDrivers.push({
      title: 'Freeze-thaw zone',
      impact: 'DOWN',
      evidence: `Surface temp ${currentTemp.toFixed(1)}°C near 0°C; Beijing regional avg for month: ${getMonthAvg(climate)}°C.`,
    });
  }
  if (tempRange > 2) {
    keyDrivers.push({
      title: 'Temperature volatility',
      impact: 'DOWN',
      evidence: `Range ${tempRange.toFixed(1)}°C in last ${temps.length} readings increases surface stress.`,
    });
  }
  if (warming && currentTemp > -3) {
    keyDrivers.push({
      title: 'Warming trend',
      impact: 'DOWN',
      evidence: 'Recent readings show upward trend; surface stability may decline.',
    });
  }
  if (!nearFreeze && stabilityScore >= 70) {
    keyDrivers.push({
      title: 'Stable temperature',
      impact: 'UP',
      evidence: `Current ${currentTemp.toFixed(1)}°C well below freeze-thaw zone; regional climate supports conditions.`,
    });
  }
  if (keyDrivers.length === 0) {
    keyDrivers.push({
      title: 'Regional climate',
      impact: 'UP',
      evidence: `Beijing region historical data (186 records) indicates seasonal norms; venue within expected range.`,
    });
  }

  // Recommended actions
  const recommendedActions = [];
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendedActions.push({
      action: 'Delay events until surface re-stabilizes',
      urgency: 'NOW',
      rationale: 'Surface temperature near critical threshold.',
    });
  }
  if (nearFreeze) {
    recommendedActions.push({
      action: 'Monitor surface every 15 minutes for freeze-thaw damage',
      urgency: 'SOON',
      rationale: 'Temperature cycling through 0°C increases cracking risk.',
    });
  }
  recommendedActions.push({
    action: 'Continue standard ops monitoring',
    urgency: 'MONITOR',
    rationale: 'Regional climate data used for baseline; no immediate intervention.',
  });

  // Stability window from score
  const baseMin = stabilityScore >= 70 ? 60 : stabilityScore >= 50 ? 30 : 15;
  const baseMax = stabilityScore >= 70 ? 180 : stabilityScore >= 50 ? 90 : 45;

  const shortBriefingText = [
    `${venue.name} (${venue.sportType}): surface temp ${currentTemp.toFixed(1)}°C, stability score ${stabilityScore}/100.`,
    nearFreeze ? 'Alert: near freeze-thaw zone; increased monitoring recommended.' : 'Conditions within operational range.',
    `Regional climate (Beijing, 186 records): monthly norms support venue operations.`,
  ].join(' ');

  const now = new Date().toISOString();
  return {
    source: 'local',
    riskLevel,
    stabilityScore,
    stabilityWindowMinutes: { min: baseMin, max: baseMax },
    keyDrivers,
    whatChanged: ['Local analysis; API quota exceeded.'],
    recommendedActions,
    confidence: 0.65,
    assumptions: [
      'Analysis from venue telemetry + Beijing regional climate (message-data.csv).',
      'Gemini API quota exceeded; local heuristic used.',
    ],
    shortBriefingText,
    audioBriefingScript: shortBriefingText,
    reportForHashing: {
      venueId: venue.id,
      windowStartISO: tw?.startISO ?? now,
      windowEndISO: tw?.endISO ?? now,
      riskLevel,
      stabilityScore,
      topDrivers: keyDrivers.slice(0, 3).map((d) => d.title),
      generatedAtISO: now,
      model: 'local-fallback',
    },
  };
}

function getMonthAvg(climate) {
  const m = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const i = new Date().getMonth();
  return climate[m[i]] ?? 0;
}
