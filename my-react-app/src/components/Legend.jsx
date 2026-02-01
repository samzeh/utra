const Legend = () => {
  return (
    <div className="legend">
      <h3 className="legend-title">Risk Levels</h3>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-marker" style={{ backgroundColor: '#10b981' }}></div>
          <span>Low Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Medium Risk</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker" style={{ backgroundColor: '#ef4444' }}></div>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;
