import { useState } from 'react';
import { months } from '../data/temperatureData';
import { useSidebarInsights } from '../hooks/useSidebarInsights';
import { buildSidebarInput } from '../utils/buildSidebarInput';
import { fetchClimateAnalysis } from '../services/climateAnalysisApi';

const VenuePanel = ({ venue, onClose }) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showClimateAnalysis, setShowClimateAnalysis] = useState(false);
  const [climateAnalysis, setClimateAnalysis] = useState(null);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateError, setClimateError] = useState(null);
  const { data: insights, loading, error, fetch: fetchInsights } = useSidebarInsights();
  
  // Check if this is a climate station (has location and yearRange)
  // Convert ID to string for safe comparison (Beijing venues have numeric IDs)
  const venueId = String(venue.id || '');
  const isClimateStation = venue.location && venue.yearRange && 
    (venueId.startsWith('milan') || venueId.startsWith('oslo') || venueId.startsWith('grenoble') || venueId.startsWith('salt-lake-city'));

  const handleGenerateClick = () => {
    try {
      setShowAIInsights(true);
      const input = buildSidebarInput(venue);
      fetchInsights(input);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const handleClimateAnalysisClick = async () => {
    if (!isClimateStation || !venue.location) return;
    
    setShowClimateAnalysis(true);
    setClimateLoading(true);
    setClimateError(null);
    
    try {
      const analysis = await fetchClimateAnalysis(venue.location, venue.yearRange);
      setClimateAnalysis(analysis);
    } catch (error) {
      console.error('Error fetching climate analysis:', error);
      setClimateError(error.message || 'Failed to analyze climate data');
    } finally {
      setClimateLoading(false);
    }
  };

  const getInjuryRiskColor = (rating) => {
    const r = (rating || '').toUpperCase();
    if (r === 'LOW') return '#10b981';
    if (r === 'MEDIUM') return '#f59e0b';
    if (r === 'HIGH') return '#ef4444';
    if (r === 'VERY HIGH') return '#dc2626';
    return '#6b7280';
  };

  if (!venue) return null;

  // Safe value getters with defaults
  const stabilityScore = insights?.stabilityScore ?? venue.stabilityScore ?? 0;
  const riskLevel = insights?.riskLevel ?? venue.riskLevel ?? 'Unknown';
  const surfaceTemp = venue.surfaceTemp ?? null;

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
          <p className="venue-type">
            {venue.type} • {venue.location}
            {venue.yearRange && ` • ${venue.yearRange.min}-${venue.yearRange.max}`}
            {venue.dataCount && ` (${venue.dataCount} years)`}
          </p>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="venue-metrics">
        <div className="metric">
          <span className="metric-label">Average Temperature</span>
          <span className="metric-value temperature">
            {surfaceTemp !== null && surfaceTemp !== undefined
              ? `${surfaceTemp > 0 ? '+' : ''}${surfaceTemp}°C`
              : 'N/A'}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Stability Score</span>
          <div className="stability-bar">
            <div
              className="stability-fill"
              style={{
                width: `${Math.max(0, Math.min(100, stabilityScore))}%`,
                backgroundColor: getStabilityColor(stabilityScore),
              }}
            />
            <span className="stability-value">{stabilityScore}/100</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-label">Risk Level</span>
          <span
            className="risk-badge"
            style={{
              backgroundColor: getRiskColor(riskLevel),
            }}
          >
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Climate Analysis Section (for climate stations) */}
      {isClimateStation && (
        <div className="ai-insight" style={{ marginBottom: '20px', borderTop: '2px solid #374151', paddingTop: '15px' }}>
          <div className="ai-insight-header">
            <span className="ai-icon">🌡️</span>
            <span>Climate & Olympics Analysis</span>
            <button
              className="ai-generate-btn"
              onClick={handleClimateAnalysisClick}
              disabled={climateLoading}
            >
              {climateLoading ? 'Analyzing…' : showClimateAnalysis ? 'Refresh Analysis' : 'Analyze Climate Trends'}
            </button>
          </div>
          {climateLoading && <p className="ai-insight-text">Analyzing climate data with Gemini AI…</p>}
          {climateError && <p className="ai-insight-error">{climateError}</p>}
          {climateAnalysis && (
            <div className="climate-analysis-content">
              {/* Climate Trends Section */}
              <div className="climate-section">
                <h3 style={{ color: '#60a5fa', marginBottom: '10px', fontSize: '16px' }}>
                  📈 Climate Trend Analysis
                </h3>
                <div className="climate-stats" style={{ marginBottom: '15px', padding: '10px', background: '#1f2937', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Temperature Trend: </span>
                      <span style={{ color: climateAnalysis.statistics.temperatureTrend.change > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                        {climateAnalysis.statistics.temperatureTrend.change > 0 ? '+' : ''}
                        {climateAnalysis.statistics.temperatureTrend.change.toFixed(2)}°C
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '5px' }}>
                        ({climateAnalysis.statistics.temperatureTrend.changePercent}%)
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Overall Average: </span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>
                        {climateAnalysis.statistics.overallAverage?.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>
                <div className="climate-trends-text" style={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.6',
                  color: '#d1d5db',
                  fontSize: '14px'
                }}>
                  {climateAnalysis.analysis.climateTrends}
                </div>
              </div>

              {/* Olympics Suitability Section */}
              {climateAnalysis.analysis.olympicsSuitability && (
                <div className="olympics-suitability-section" style={{ 
                  marginTop: '25px', 
                  padding: '15px', 
                  background: '#1f2937', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>🏔️</span>
                    <h3 style={{ color: '#3b82f6', margin: 0, fontSize: '16px' }}>
                      Future Winter Olympics Hosting Suitability (2025-2050)
                    </h3>
                    {climateAnalysis.analysis.olympicsSuitability.likelihood && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: climateAnalysis.analysis.olympicsSuitability.likelihood.includes('Likely') ? '#10b981' : 
                                         climateAnalysis.analysis.olympicsSuitability.likelihood.includes('Unlikely') ? '#ef4444' : '#f59e0b',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        {climateAnalysis.analysis.olympicsSuitability.likelihood}
                      </span>
                    )}
                  </div>
                  <div className="olympics-suitability-text" style={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.6',
                    color: '#d1d5db',
                    fontSize: '14px'
                  }}>
                    {climateAnalysis.analysis.olympicsSuitability.detailedAnalysis}
                  </div>
                </div>
              )}

              {/* Injury Risk Section - Separated */}
              <div className="injury-risk-section" style={{ 
                marginTop: '25px', 
                padding: '15px', 
                background: '#1f2937', 
                borderRadius: '8px',
                borderLeft: `4px solid ${getInjuryRiskColor(climateAnalysis.analysis.injuryRisk.rating)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <h3 style={{ color: '#fbbf24', margin: 0, fontSize: '16px' }}>
                    Athlete Injury Risk Assessment
                  </h3>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: getInjuryRiskColor(climateAnalysis.analysis.injuryRisk.rating),
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {climateAnalysis.analysis.injuryRisk.rating} RISK
                  </span>
                </div>
                <div className="injury-risk-text" style={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.6',
                  color: '#d1d5db',
                  fontSize: '14px'
                }}>
                  {climateAnalysis.analysis.injuryRisk.detailedAnalysis}
                </div>
                {climateAnalysis.analysis.injuryRisk.factors && climateAnalysis.analysis.injuryRisk.factors.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <strong style={{ color: '#fbbf24', fontSize: '13px' }}>Key Risk Factors:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#d1d5db', fontSize: '13px' }}>
                      {climateAnalysis.analysis.injuryRisk.factors.map((factor, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standard AI Insights (for Olympic venues) */}
      <div className="ai-insight">
        <div className="ai-insight-header">
          <span className="ai-icon">🤖</span>
          <span>AI Analysis</span>
          {!isClimateStation && (
            <button
              className="ai-generate-btn"
              onClick={handleGenerateClick}
              disabled={loading}
            >
              {loading ? 'Generating…' : showAIInsights ? 'Refresh' : 'Generate Insights'}
            </button>
          )}
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
          <p className="ai-insight-text">{venue.aiInsight || 'No analysis available'}</p>
        )}
      </div>

      {venue.monthlyData && (
        <div className="temp-data-section">
          <div className="temp-data-header">
            <span className="temp-icon">📊</span>
            <span>Monthly Temperature Data</span>
            <span className="temp-record-count">({venue.year})</span>
          </div>
          <div className="temp-monthly-grid">
            {months && months.map((month) => {
              const temp = venue.monthlyData?.[month];
              return (
                <div key={month} className="temp-month-cell">
                  <span className="temp-month-label">{month}</span>
                  <span className="temp-month-value">
                    {temp !== null && temp !== undefined 
                      ? `${temp > 0 ? '+' : ''}${temp}°C`
                      : 'N/A'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="temp-data-note">
            Monthly temperature data {venue.yearRange ? `(${venue.yearRange.min}-${venue.yearRange.max})` : `for ${venue.year}`}. 
            {venue.location} historical climate records.
          </p>
        </div>
      )}

      <div className="venue-footer">
        <span className="last-updated">
          Last updated: {venue.lastUpdated 
            ? (() => {
                try {
                  return new Date(venue.lastUpdated).toLocaleTimeString();
                } catch (e) {
                  return 'Unknown';
                }
              })()
            : 'Unknown'}
        </span>
      </div>
    </div>
  );
};

export default VenuePanel;
