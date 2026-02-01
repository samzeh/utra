/**
 * Sidebar Intelligence generator using Gemini API.
 * Falls back to local analysis when API quota exceeded (429).
 * Output: strict JSON matching SidebarInsights schema.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateLocalInsights } from './generateLocalInsights.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '..', 'Gemini-setup', '.env') });

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const REQUIRED_KEYS = [
  'riskLevel', 'stabilityScore', 'stabilityWindowMinutes', 'keyDrivers',
  'whatChanged', 'recommendedActions', 'confidence', 'assumptions',
  'shortBriefingText', 'audioBriefingScript', 'reportForHashing'
];

export async function generateSidebarInsights(input) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  // Try Gemini if API key is available
  if (apiKey) {
    try {
      const prompt = buildPrompt(input);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response?.text?.() ?? result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const raw = extractJSON(text);
        const validated = validateAndClamp(raw, input);
        return validated;
      }
    } catch (err) {
      const msg = err?.message ?? String(err);
      const isQuotaError = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
      if (isQuotaError) {
        console.warn('[sidebar-insights] Gemini quota exceeded, using local fallback:', msg.slice(0, 80));
      } else {
        console.warn('[sidebar-insights] Gemini error, using local fallback:', msg.slice(0, 120));
      }
      return generateLocalInsights(input);
    }
  }

  // No API key or Gemini failed: use local analysis with venue + regional climate data
  return generateLocalInsights(input);
}

function buildPrompt(input) {
  const venue = input.venue;
  const tw = input.timeWindow;
  const tel = input.telemetry;
  const ops = input.opsLogs || [];
  const climate = input.regionalClimate;

  const climateBlock = climate
    ? `Regional climate (Beijing, ${climate.recordCount ?? 186} records from message-data.csv):
- monthlyAverages °C: ${JSON.stringify(climate.monthlyAverages)}
- monthlyMin: ${JSON.stringify(climate.monthlyMin)}
- monthlyMax: ${JSON.stringify(climate.monthlyMax)}

`
    : '';

  return `You are a venue operations analyst for Winter Olympics surface stability. Output ONE valid JSON object only. No markdown, no prose, no code blocks.

Input context:
- Venue: ${venue.name} (${venue.id}), ${venue.sportType}, ${venue.surfaceType}
- Location: ${venue.latitude}, ${venue.longitude}${venue.elevationM != null ? `, ${venue.elevationM}m` : ''}
- Time window: ${tw.startISO} to ${tw.endISO} (${tw.tz})

${climateBlock}Telemetry:
- temperatureC (${tel.temperatureC?.length ?? 0} points): ${JSON.stringify(tel.temperatureC?.slice(-12) ?? [])}
${tel.humidityPct?.length ? `- humidityPct (${tel.humidityPct.length}): ${JSON.stringify(tel.humidityPct.slice(-6))}` : ''}
${tel.windMps?.length ? `- windMps (${tel.windMps.length}): ${JSON.stringify(tel.windMps.slice(-6))}` : ''}
${tel.precipMm?.length ? `- precipMm (${tel.precipMm.length}): ${JSON.stringify(tel.precipMm.slice(-6))}` : ''}
${tel.snowMm?.length ? `- snowMm (${tel.snowMm.length}): ${JSON.stringify(tel.snowMm.slice(-6))}` : ''}

Ops logs: ${JSON.stringify(ops.slice(-10))}

Risk must be explainable from: freeze-thaw crossings near 0°C, temp volatility, warming/cooling trend, precipitation, wind. Never mention athletes or coaching. Focus on venue operations and surface stability.

Output this exact JSON shape (no extra keys):
{
  "riskLevel": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
  "stabilityScore": 0-100,
  "stabilityWindowMinutes": { "min": number, "max": number },
  "keyDrivers": [{ "title": string, "impact": "UP"|"DOWN", "evidence": string }],
  "whatChanged": [string],
  "recommendedActions": [{ "action": string, "urgency": "NOW"|"SOON"|"MONITOR", "rationale": string }],
  "confidence": 0-1,
  "assumptions": [string],
  "shortBriefingText": string,
  "audioBriefingScript": string,
  "reportForHashing": {
    "venueId": "${venue.id}",
    "windowStartISO": "${tw.startISO}",
    "windowEndISO": "${tw.endISO}",
    "riskLevel": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
    "stabilityScore": number,
    "topDrivers": [string],
    "generatedAtISO": "<ISO timestamp now>",
    "model": "<model name>"
  }
}`;
}

function extractJSON(text) {
  let s = text.trim();
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(s);
}

function validateAndClamp(raw, input) {
  for (const k of REQUIRED_KEYS) {
    if (raw[k] === undefined) {
      throw new Error(`Missing required key: ${k}`);
    }
  }
  if (!RISK_LEVELS.includes(raw.riskLevel)) {
    raw.riskLevel = 'MEDIUM';
  }
  raw.stabilityScore = Math.max(0, Math.min(100, Number(raw.stabilityScore) || 50));
  raw.confidence = Math.max(0, Math.min(1, Number(raw.confidence) ?? 0.5));
  if (!raw.stabilityWindowMinutes?.min || !raw.stabilityWindowMinutes?.max) {
    raw.stabilityWindowMinutes = { min: 30, max: 120 };
  }
  raw.stabilityWindowMinutes.min = Math.max(0, Number(raw.stabilityWindowMinutes.min) || 30);
  raw.stabilityWindowMinutes.max = Math.max(raw.stabilityWindowMinutes.min, Number(raw.stabilityWindowMinutes.max) || 120);
  if (!Array.isArray(raw.keyDrivers)) raw.keyDrivers = [];
  if (!Array.isArray(raw.whatChanged)) raw.whatChanged = [];
  if (!Array.isArray(raw.recommendedActions)) raw.recommendedActions = [];
  if (!Array.isArray(raw.assumptions)) raw.assumptions = [];
  raw.shortBriefingText = String(raw.shortBriefingText ?? '');
  raw.audioBriefingScript = String(raw.audioBriefingScript ?? '');
  if (!raw.reportForHashing) raw.reportForHashing = {};
  raw.reportForHashing.venueId = raw.reportForHashing.venueId ?? input.venue.id;
  raw.reportForHashing.windowStartISO = raw.reportForHashing.windowStartISO ?? input.timeWindow.startISO;
  raw.reportForHashing.windowEndISO = raw.reportForHashing.windowEndISO ?? input.timeWindow.endISO;
  raw.reportForHashing.riskLevel = raw.riskLevel;
  raw.reportForHashing.stabilityScore = raw.stabilityScore;
  raw.reportForHashing.topDrivers = Array.isArray(raw.reportForHashing.topDrivers) ? raw.reportForHashing.topDrivers : raw.keyDrivers.slice(0, 3).map((d) => d.title);
  raw.reportForHashing.generatedAtISO = raw.reportForHashing.generatedAtISO ?? new Date().toISOString();
  raw.reportForHashing.model = raw.reportForHashing.model ?? 'gemini-2.0-flash';
  return raw;
}
