const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-icon">❄️</span>
            Frostline
          </h1>
          <span className="header-subtitle">Winter Olympics Intelligence Platform</span>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Live Monitoring</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
