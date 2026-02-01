import { Marker } from 'react-map-gl/mapbox';

const VenueMarker = ({ venue, onClick }) => {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return '#10b981'; // green
      case 'Medium':
        return '#f59e0b'; // amber
      case 'High':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <Marker
      longitude={venue.coordinates[0]}
      latitude={venue.coordinates[1]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(venue);
      }}
    >
      <div
        className="venue-marker"
        style={{
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Pulsing ring for high-risk venues */}
        {venue.riskLevel === 'High' && (
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #ef4444',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        
        {/* Main marker */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: getRiskColor(venue.riskLevel),
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            position: 'relative',
            zIndex: 1,
          }}
        />
        
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${getRiskColor(venue.riskLevel)}`,
          }}
        />
      </div>
    </Marker>
  );
};

export default VenueMarker;
