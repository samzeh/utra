import { useState, useCallback } from 'react';

const API_BASE = '';

/**
 * @param {Object} options
 * @param {Object} options.venue - { id, name, sportType, surfaceType, latitude, longitude, elevationM?, aspectDeg?, maintenanceLevel? }
 * @param {Object} options.timeWindow - { startISO, endISO, tz }
 * @param {Object} options.telemetry - { temperatureC: [{tsISO, value}], humidityPct?, windMps?, precipMm?, snowMm? }
 * @param {Array} [options.opsLogs] - [{ tsISO, type, note? }]
 * @returns {{ data: Object|null, loading: boolean, error: string|null, fetch: function }}
 */
export function useSidebarInsights(options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async (overrides = {}) => {
    const { venue, timeWindow, telemetry, opsLogs } = { ...options, ...overrides };
    if (!venue || !timeWindow || !telemetry) {
      setError('venue, timeWindow, telemetry required');
      return null;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`${API_BASE}/api/sidebar-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue,
          timeWindow,
          telemetry,
          opsLogs: opsLogs ?? [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || res.statusText);
      }
      setData(json);
      return json;
    } catch (err) {
      setError(err.message || 'Failed to fetch insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.venue?.id, options.timeWindow?.startISO]);

  return { data, loading, error, fetch: fetchInsights };
}
