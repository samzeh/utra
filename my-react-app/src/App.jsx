import { useState, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

import Header from './components/Header';
import VenueMarker from './components/VenueMarker';
import VenuePanel from './components/VenuePanel';
import Legend from './components/Legend';
import { olympicVenues, simulateDataUpdate, calculateRiskLevel as calculateVenueRiskLevel } from './data/venues';
import { getMilanAggregatedData, simulateMilanDataUpdate, calculateRiskLevel, MILAN_COORDINATES } from './data/milanData';
import { getOsloAggregatedData, simulateOsloDataUpdate, calculateRiskLevel as calculateOsloRiskLevel, OSLO_COORDINATES } from './data/osloData';
import { getGrenobleAggregatedData, simulateGrenobleDataUpdate, calculateRiskLevel as calculateGrenobleRiskLevel, GRENOBLE_COORDINATES } from './data/grenobleData';
import { getSaltLakeCityAggregatedData, simulateSaltLakeCityDataUpdate, calculateRiskLevel as calculateSaltLakeCityRiskLevel, SALT_LAKE_CITY_COORDINATES } from './data/saltLakeCityData';

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState(olympicVenues); // Start with Beijing venues
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: 30, // Center to show Beijing, Milan, and Oslo
    latitude: 50,
    zoom: 3, // Zoom out to show all regions
  });

  // Fetch Milan, Oslo, Grenoble, and Salt Lake City temperature data on mount and combine with Beijing venues
  useEffect(() => {
    async function loadClimateData() {
      try {
        setLoading(true);
        // Get aggregated data for all climate stations (last 20 years)
        const [milanData, osloData, grenobleData, saltLakeCityData] = await Promise.all([
          getMilanAggregatedData(20),
          getOsloAggregatedData(20),
          getGrenobleAggregatedData(20),
          getSaltLakeCityAggregatedData(20)
        ]);
        
        // Combine Beijing Olympic venues with climate data
        const allVenues = [...olympicVenues];
        if (milanData) {
          allVenues.push(milanData);
        }
        if (osloData) {
          allVenues.push(osloData);
        }
        if (grenobleData) {
          allVenues.push(grenobleData);
        }
        if (saltLakeCityData) {
          allVenues.push(saltLakeCityData);
        }
        
        setVenues(allVenues);
      } catch (error) {
        console.error('Failed to load climate data:', error);
        // If climate data fails, just use Beijing venues
        setVenues(olympicVenues);
      } finally {
        setLoading(false);
      }
    }
    
    loadClimateData();
  }, []);

  // Simulate real-time data updates every 5 seconds
  useEffect(() => {
    if (venues.length === 0) return;
    
    const interval = setInterval(() => {
      setVenues((currentVenues) =>
        currentVenues.map((venue) => {
          // Check if it's Milan data
          if (venue.id?.startsWith('milan')) {
            const updated = simulateMilanDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateRiskLevel(updated.stabilityScore),
            };
          } else if (venue.id?.startsWith('oslo')) {
            // Oslo data
            const updated = simulateOsloDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateOsloRiskLevel(updated.stabilityScore),
            };
          } else if (venue.id?.startsWith('grenoble')) {
            // Grenoble data
            const updated = simulateGrenobleDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateGrenobleRiskLevel(updated.stabilityScore),
            };
          } else if (venue.id?.startsWith('salt-lake-city')) {
            // Salt Lake City data
            const updated = simulateSaltLakeCityDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateSaltLakeCityRiskLevel(updated.stabilityScore),
            };
          } else if (venue.yearRange) {
            // Other climate data (fallback)
            const updated = simulateMilanDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateRiskLevel(updated.stabilityScore),
            };
          } else {
            // Beijing Olympic venue
            const updated = simulateDataUpdate(venue);
            return {
              ...updated,
              riskLevel: calculateVenueRiskLevel(updated.stabilityScore),
            };
          }
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [venues.length]);

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
      longitude: 30, // Center to show Beijing, Milan, and Oslo
      latitude: 50,
      zoom: 3, // Zoom out to show all regions
    }));
  }, []);

  return (
    <div className="app">
      <Header />
      
      <div className="map-container">
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'white',
            fontSize: '18px'
          }}>
            Loading data...
          </div>
        ) : (
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
        )}

        <Legend />

        {selectedVenue && (
          <VenuePanel venue={selectedVenue} onClose={handleClosePanel} />
        )}
      </div>
    </div>
  );
}

export default App;
