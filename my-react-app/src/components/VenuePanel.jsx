import { useState } from 'react';
import { months, monthlyAverages, monthlyMin, monthlyMax, recordCount } from '../data/temperatureData';
import { useSidebarInsights } from '../hooks/useSidebarInsights';
import { buildSidebarInput } from '../utils/buildSidebarInput';

const VenuePanel = ({ venue, onClose }) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const { data: insights, loading, error, fetch: fetchInsights } = useSidebarInsights();

  const handleGenerateClick = () => {
    setShowAIInsights(true);
    fetchInsights(buildSidebarInput(venue));
  };

  if (!venue) return null;

  const getRiskColor = (riskLevel) => {
    const l = (riskLevel || '').toUpperCase();
    if (l === 'LOW') return '#10b981';
    if (l === 'MEDIUM') return '#f59e0b';
    if (l === 'HIGH') return '#ef4444';
    if (l === 'CRITICAL') return '#dc2626';
    return '#6b7280';
  };

  const getStabilityColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="venue-panel">
      <div className="venue-panel-header">
        <div>
          <h2>{venue.name}</h2>
          <p className="venue-type">{venue.type} • {venue.location}</p>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="venue-metrics">
        <div className="metric">
          <span className="metric-label">Surface Temperature</span>
          <span className="metric-value temperature">
            {venue.surfaceTemp > 0 ? '+' : ''}{venue.surfaceTemp}°C
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Stability Score</span>
          <div className="stability-bar">
            <div
              className="stability-fill"
              style={{
                width: `${(insights?.stabilityScore ?? venue.stabilityScore)}%`,
                backgroundColor: getStabilityColor(insights?.stabilityScore ?? venue.stabilityScore),
              }}
            />
            <span className="stability-value">{insights?.stabilityScore ?? venue.stabilityScore}/100</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-label">Risk Level</span>
          <span
            className="risk-badge"
            style={{
              backgroundColor: getRiskColor(insights?.riskLevel ?? venue.riskLevel),
            }}
          >
            {insights?.riskLevel ?? venue.riskLevel}
          </span>
        </div>
      </div>

      <div className="ai-insight">
        <div className="ai-insight-header">
          <span className="ai-icon">🤖</span>
          <span>AI Analysis</span>
          <button
            className="ai-generate-btn"
            onClick={handleGenerateClick}
            disabled={loading}
          >
            {loading ? 'Generating…' : showAIInsights ? 'Refresh' : 'Generate Insights'}
          </button>
        </div>
        {loading && <p className="ai-insight-text">Analyzing venue data…</p>}
        {error && <p className="ai-insight-error">{error}</p>}
        {insights ? (
          <>
            {insights.source === 'local' && (
              <p className="ai-insight-local-note">Local analysis (API quota exceeded — using venue + regional climate data)</p>
            )}
            <p className="ai-insight-text">{insights.shortBriefingText}</p>
            {insights.keyDrivers?.length > 0 && (
              <div className="ai-key-drivers">
                {insights.keyDrivers.map((d, i) => (
                  <div key={i} className={`key-driver key-driver-${d.impact?.toLowerCase()}`}>
                    <span className="driver-impact">{d.impact === 'UP' ? '↑' : '↓'}</span>
                    <strong>{d.title}</strong>: {d.evidence}
                  </div>
                ))}
              </div>
            )}
            {insights.recommendedActions?.length > 0 && (
              <div className="ai-actions">
                {insights.recommendedActions.map((a, i) => (
                  <div key={i} className={`action action-${a.urgency?.toLowerCase()}`}>
                    [{a.urgency}] {a.action}
                  </div>
                ))}
              </div>
            )}
            {insights.stabilityWindowMinutes && (
              <p className="ai-stability-window">
                Stability window: {insights.stabilityWindowMinutes.min}–{insights.stabilityWindowMinutes.max} min
                {insights.confidence != null && ` · Confidence: ${(insights.confidence * 100).toFixed(0)}%`}
              </p>
            )}
          </>
        ) : (
          <p className="ai-insight-text">{venue.aiInsight}</p>
        )}
      </div>

      <div className="temp-data-section">
        <div className="temp-data-header">
          <span className="temp-icon">📊</span>
          <span>Regional Climate Data</span>
          <span className="temp-record-count">({recordCount} records)</span>
        </div>
        <div className="temp-monthly-grid">
          {months.map((month) => (
            <div key={month} className="temp-month-cell">
              <span className="temp-month-label">{month}</span>
              <span className="temp-month-value">
                {monthlyAverages[month] > 0 ? '+' : ''}{monthlyAverages[month]}°C
              </span>
              <span className="temp-month-range">
                {monthlyMin[month]} / {monthlyMax[month]}
              </span>
            </div>
          ))}
        </div>
        <p className="temp-data-note">Monthly averages (min/max). Beijing region historical data.</p>
      </div>

      <div className="venue-footer">
        <span className="last-updated">
          Last updated: {new Date(venue.lastUpdated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default VenuePanel;
