# ❄️ Frostline

**Real-time Winter Olympics Intelligence Platform**

Frostline is a hackathon project that combines climate risk monitoring, venue operations data, and AI-generated insights to help Winter Olympic organizers, broadcasters, and fans understand ice and snow surface conditions across multiple venues.

## 🎯 Features

- **Interactive Map View**: Central Mapbox-powered map showing all Winter Olympic venues
- **Real-Time Monitoring**: Live updates of surface temperature, stability scores, and risk levels
- **AI Insights**: Intelligent analysis and recommendations for each venue
- **Risk Visualization**: Color-coded markers (Green = Low, Amber = Medium, Red = High)
- **Venue Details**: Click any marker to see detailed metrics and AI-generated insights
- **Professional Dark Theme**: Polished UI optimized for demo presentations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Mapbox Token

1. Get a free Mapbox access token at [mapbox.com](https://account.mapbox.com/access-tokens/)
2. Create a `.env.local` file in the project root:

```bash
VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

**Important**: Replace `your_actual_mapbox_token_here` with your actual Mapbox token!

### 3. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Top navigation bar with branding
│   ├── VenueMarker.jsx     # Custom map markers for venues
│   ├── VenuePanel.jsx      # Side panel showing venue details
│   └── Legend.jsx          # Map legend for risk levels
├── data/
│   └── venues.js           # Mock venue data (replace with real API)
├── App.jsx                 # Main application component
├── App.css                 # Application-specific styles
├── index.css               # Global styles
└── main.jsx                # React entry point
```

## 📊 Venue Data Structure

Currently using mock data. Each venue includes:

- **Location**: GPS coordinates for map positioning
- **Surface Temperature**: Current temperature in Celsius
- **Stability Score**: 0-100 scale indicating surface quality
- **Risk Level**: Low, Medium, or High (auto-calculated)
- **AI Insight**: Contextual analysis and recommendations
- **Last Updated**: Timestamp for data freshness

## 🔌 Integrating Real Data

To connect real data sources:

1. **Replace mock data**: Edit `src/data/venues.js` and replace `olympicVenues` array with API calls
2. **Real-time updates**: Replace the `simulateDataUpdate` function with WebSocket connections or polling
3. **Backend integration**: Add API endpoints in `src/App.jsx` within the `useEffect` hook

Example API integration:

```javascript
// In App.jsx
useEffect(() => {
  const fetchVenueData = async () => {
    const response = await fetch('https://api.yourbackend.com/venues');
    const data = await response.json();
    setVenues(data);
  };
  
  fetchVenueData();
  const interval = setInterval(fetchVenueData, 5000);
  return () => clearInterval(interval);
}, []);
```

## 🎨 Customization

### Change Map Style

Edit `src/App.jsx` line with `mapStyle`:

```javascript
mapStyle="mapbox://styles/mapbox/dark-v11"  // Current
mapStyle="mapbox://styles/mapbox/satellite-v9"  // Satellite view
mapStyle="mapbox://styles/mapbox/streets-v12"  // Streets view
```

### Adjust Default View

Modify `viewState` in `src/App.jsx`:

```javascript
const [viewState, setViewState] = useState({
  longitude: 116.3913,  // Center longitude
  latitude: 40.3,        // Center latitude
  zoom: 7.5,             // Zoom level (higher = closer)
});
```

### Add More Venues

Edit `src/data/venues.js` and add objects to the `olympicVenues` array following the existing structure.

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - Interactive maps
- **react-map-gl** - React wrapper for Mapbox

## 📝 Demo Script (60 seconds)

1. **Opening (5s)**: "Frostline monitors ice and snow conditions across Winter Olympic venues in real-time"
2. **Map Overview (10s)**: Pan around map showing multiple venues with color-coded risk markers
3. **Low Risk Venue (15s)**: Click green marker → "This ice rink is optimal with 95 stability score"
4. **High Risk Venue (15s)**: Click red marker → "This venue shows high risk - AI recommends delaying events"
5. **Real-Time Updates (10s)**: "Data updates every 5 seconds" (show changing numbers)
6. **Closing (5s)**: "Helping organizers make informed decisions to keep athletes safe"

## 🔧 Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## 🐛 Troubleshooting

**Map not loading?**
- Check that your Mapbox token is correct in `.env.local`
- Ensure the token has the required scopes
- Check browser console for errors

**Markers not appearing?**
- Verify venue data has valid `coordinates` arrays
- Check that coordinates are in [longitude, latitude] format

**Styling issues?**
- Make sure `mapbox-gl/dist/mapbox-gl.css` is imported in `App.jsx`
- Clear browser cache and restart dev server

## 📄 License

Built for hackathon purposes. Adapt and modify as needed!

---

**Need help?** Check the inline code comments for integration points and data structure examples.
