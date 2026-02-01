import { useState, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

import Header from './components/Header';
import VenueMarker from './components/VenueMarker';
import VenuePanel from './components/VenuePanel';
import Legend from './components/Legend';
import { olympicVenues, simulateDataUpdate, calculateRiskLevel } from './data/venues';

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_TOKEN;
console.log(mapboxAccessToken);
function App() {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState(olympicVenues);
  const [viewState, setViewState] = useState({
    longitude: 116.3913,
    latitude: 40.3,
    zoom: 7.5,
  });

  // Simulate real-time data updates every 5 seconds
  // In production, this would be replaced with actual API calls or WebSocket connections
  useEffect(() => {
    const interval = setInterval(() => {
      setVenues((currentVenues) =>
        currentVenues.map((venue) => {
          const updated = simulateDataUpdate(venue);
          return {
            ...updated,
            riskLevel: calculateRiskLevel(updated.stabilityScore),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update selected venue when data changes
  useEffect(() => {
    if (selectedVenue) {
      const updated = venues.find((v) => v.id === selectedVenue.id);
      if (updated) {
        setSelectedVenue(updated);
      }
    }
  }, [venues, selectedVenue]);

  const handleMarkerClick = useCallback((venue) => {
    setSelectedVenue(venue);
    setViewState((prev) => ({
      ...prev,
      longitude: venue.coordinates[0],
      latitude: venue.coordinates[1],
      zoom: 10,
    }));
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedVenue(null);
    setViewState((prev) => ({
      ...prev,
      longitude: 116.3913,
      latitude: 40.3,
      zoom: 7.5,
    }));
  }, []);

  return (
    <div className="app">
      <Header />
      
      <div className="map-container">
        <Map
          mapboxAccessToken={mapboxAccessToken}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
          attributionControl={true}
          onLoad={() => console.log('[Frostline] Map loaded successfully')}
          onError={(e) => console.error('[Frostline] Map error:', e)}
        >
          <NavigationControl position="top-right" showCompass showZoom />
          {venues.map((venue) => (
            <VenueMarker
              key={venue.id}
              venue={venue}
              onClick={handleMarkerClick}
            />
          ))}
        </Map>

        <Legend />

        {selectedVenue && (
          <VenuePanel venue={selectedVenue} onClose={handleClosePanel} />
        )}
      </div>
    </div>
  );
}

export default App;
