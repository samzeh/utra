# Frostline Architecture Overview

## Component Hierarchy

```
App.jsx (Main Container)
│
├─ Header.jsx
│  └─ Shows: "❄️ Frostline" branding + "Live Monitoring" status
│
└─ Map Container
   ├─ Mapbox Map Component
   │  ├─ Background: Dark theme map
   │  ├─ Center: Beijing region (116.39°E, 40.3°N)
   │  └─ Zoom: 7.5 (regional view)
   │
   ├─ VenueMarker.jsx (x8 instances)
   │  ├─ Props: venue data, onClick handler
   │  ├─ Visual: Colored circle (green/amber/red)
   │  ├─ Effect: Pulsing animation for high risk
   │  └─ Interaction: Click to select venue
   │
   ├─ Legend.jsx
   │  ├─ Position: Bottom-left corner
   │  ├─ Shows: Risk level color key
   │  └─ Style: Frosted glass effect
   │
   └─ VenuePanel.jsx (conditional)
      ├─ Position: Top-right corner
      ├─ Triggers: When venue selected
      ├─ Content:
      │  ├─ Venue name & type
      │  ├─ Surface temperature
      │  ├─ Stability score (0-100)
      │  ├─ Risk level badge
      │  ├─ AI insight text
      │  └─ Last updated timestamp
      └─ Interaction: Close button

```

## Data Flow

```
1. Initial Load
   venues.js (mock data)
      ↓
   App.jsx (useState: venues, selectedVenue)
      ↓
   Map renders with all VenueMarkers

2. Real-Time Updates (every 5 seconds)
   setInterval in App.jsx
      ↓
   simulateDataUpdate() from venues.js
      ↓
   Updates venue state
      ↓
   Re-renders markers + panel (if open)

3. User Interaction
   User clicks VenueMarker
      ↓
   handleMarkerClick() in App.jsx
      ↓
   Updates selectedVenue state
      ↓
   Map zooms to venue
      ↓
   VenuePanel appears with details

4. Close Panel
   User clicks X button
      ↓
   handleClosePanel() in App.jsx
      ↓
   Clears selectedVenue state
      ↓
   Map zooms back to overview
      ↓
   VenuePanel disappears
```

## State Management

```javascript
// App.jsx - Main state
const [venues, setVenues] = useState(olympicVenues)
// Array of 8 venue objects with metrics

const [selectedVenue, setSelectedVenue] = useState(null)
// Currently selected venue (or null)

const [viewState, setViewState] = useState({
  longitude: 116.3913,
  latitude: 40.3,
  zoom: 7.5
})
// Map camera position
```

## Key Functions

### simulateDataUpdate(venue)
**Location**: `src/data/venues.js`
**Purpose**: Simulates real-time data changes
**Replaces with**: API call to `fetch('https://api.backend.com/venues/123')`

### calculateRiskLevel(stabilityScore)
**Location**: `src/data/venues.js`
**Purpose**: Determines risk level from stability score
**Logic**:
- 80-100 → Low (green)
- 60-79 → Medium (amber)
- 0-59 → High (red)

### handleMarkerClick(venue)
**Location**: `src/App.jsx`
**Purpose**: Handles venue selection
**Actions**:
1. Set selectedVenue state
2. Update map viewState to zoom to venue
3. Triggers VenuePanel render

### handleClosePanel()
**Location**: `src/App.jsx`
**Purpose**: Closes venue details panel
**Actions**:
1. Clear selectedVenue state
2. Reset map viewState to overview
3. Hides VenuePanel

## Styling Architecture

```
index.css
├─ Global reset & base styles
├─ Dark theme colors (#0a0e27 background)
├─ Font family & sizing
└─ Scrollbar styling

App.css
├─ Header styles
│  └─ Gradient background, flexbox layout
├─ Map container styles
│  └─ Full height, relative positioning
├─ Marker styles
│  ├─ Color-coded circles
│  ├─ Pulsing animation
│  └─ Hover effects
├─ Legend styles
│  └─ Frosted glass overlay
└─ VenuePanel styles
   ├─ Slide-in animation
   ├─ Metric display grid
   ├─ Stability bar chart
   ├─ AI insight box (blue tint)
   └─ Close button hover state
```

## Environment Variables

```bash
# .env.local
VITE_MAPBOX_TOKEN=pk.ey...

# Accessed in code via:
import.meta.env.VITE_MAPBOX_TOKEN
```

## API Integration Points

### Where to Add Real Data

**1. Initial venue load**
```javascript
// Replace in App.jsx useEffect
const response = await fetch('https://api.backend.com/venues');
const venuesData = await response.json();
setVenues(venuesData);
```

**2. Real-time updates**
```javascript
// Replace setInterval with WebSocket
const ws = new WebSocket('wss://api.backend.com/stream');
ws.onmessage = (e) => {
  const update = JSON.parse(e.data);
  setVenues(prev => prev.map(v => 
    v.id === update.id ? { ...v, ...update } : v
  ));
};
```

**3. Historical data (future)**
```javascript
// Add to VenuePanel
const [history, setHistory] = useState([]);
useEffect(() => {
  fetch(`https://api.backend.com/venues/${venue.id}/history`)
    .then(r => r.json())
    .then(setHistory);
}, [venue.id]);
```

## Performance Notes

- Map uses GPU acceleration (Mapbox GL)
- Only re-renders changed markers
- VenuePanel uses React.memo for optimization
- Real-time updates use functional setState to avoid race conditions
- Markers use inline styles (no class lookups)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (needs Mapbox GL JS 2.x)
- Mobile: ✅ Responsive design works on iOS/Android

## Dependencies

```json
"dependencies": {
  "react": "^19.2.0",           // UI framework
  "react-dom": "^19.2.0",       // DOM renderer
  "react-map-gl": "^8.1.0",     // React wrapper for Mapbox
  "mapbox-gl": "^3.x",          // Map engine (installed with react-map-gl)
}
```

## Build Output

```
dist/
├── index.html                 # Entry HTML (460 bytes)
├── assets/
│   ├── index-[hash].css      # Bundled styles (44 KB)
│   ├── index-[hash].js       # Your React code (221 KB)
│   └── mapbox-gl-[hash].js   # Mapbox library (1.68 MB)
```

**Note**: Large bundle is expected (Mapbox GL is feature-rich). For production, consider lazy-loading Mapbox only when needed.

## Security Notes

- ✅ Mapbox token is public-safe (intended for frontend)
- ✅ `.env.local` in .gitignore (won't commit secrets)
- ✅ No sensitive data in venue objects
- ⚠️  In production, validate all API responses
- ⚠️  Add rate limiting for real-time updates
- ⚠️  Use HTTPS for all API calls

## Testing Checklist

- [ ] Map loads without errors
- [ ] All 8 venue markers appear
- [ ] Markers are color-coded correctly
- [ ] Clicking marker opens panel
- [ ] Panel shows correct venue data
- [ ] Close button works
- [ ] Data updates every 5 seconds
- [ ] Pulsing animation on high-risk venues
- [ ] Legend is visible and positioned correctly
- [ ] Responsive on mobile (test on phone or DevTools)
- [ ] Build succeeds (`npm run build`)

## Future Enhancements

### Phase 2 (Post-Hackathon)
- Real weather API integration
- Historical trend charts
- Alert notifications
- Venue comparison view
- Admin dashboard for data updates

### Phase 3 (Production)
- User authentication
- Role-based access (organizer, broadcaster, public)
- Export to PDF/CSV
- Multi-language support
- Mobile app (React Native)
- Predictive analytics / ML

---

This diagram shows the complete architecture of Frostline. Use it as a reference when explaining the system or making modifications.
