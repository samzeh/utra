const VenuePanel = ({ venue, onClose }) => {
  if (!venue) return null;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      default:
        return '#6b7280';
    }
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
                width: `${venue.stabilityScore}%`,
                backgroundColor: getStabilityColor(venue.stabilityScore),
              }}
            />
            <span className="stability-value">{venue.stabilityScore}/100</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-label">Risk Level</span>
          <span
            className="risk-badge"
            style={{
              backgroundColor: getRiskColor(venue.riskLevel),
            }}
          >
            {venue.riskLevel}
          </span>
        </div>
      </div>

      <div className="ai-insight">
        <div className="ai-insight-header">
          <span className="ai-icon">🤖</span>
          <span>AI Analysis</span>
        </div>
        <p className="ai-insight-text">{venue.aiInsight}</p>
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
