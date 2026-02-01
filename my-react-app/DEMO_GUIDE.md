# Frostline - Quick Reference Guide

## 🎯 Demo Checklist

Before presenting:
- [ ] Mapbox token is set in `.env.local`
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start the server
- [ ] Test clicking on different venue markers
- [ ] Verify real-time updates are working (numbers change every 5s)

## 🗺️ Map Controls

- **Pan**: Click and drag
- **Zoom**: Scroll wheel or pinch gesture
- **Click marker**: Opens venue details panel
- **Close panel**: Click X button or click another marker

## 🎨 Color Coding

- 🟢 **Green**: Low risk (Stability score 80-100)
- 🟡 **Amber**: Medium risk (Stability score 60-79)
- 🔴 **Red**: High risk (Stability score 0-59)

## 📊 Venue Metrics Explained

### Surface Temperature
- Current ice/snow surface temperature in Celsius
- Negative values indicate frozen surfaces
- Critical for maintaining surface quality

### Stability Score (0-100)
- Composite metric of surface quality
- Factors: temperature, humidity, wear, weather
- Higher = better conditions

### Risk Level
- Auto-calculated from stability score
- Determines if events should proceed
- High risk may require delays or maintenance

### AI Insight
- Contextual analysis of current conditions
- Recommendations for venue operators
- Alerts for critical situations

## 🔄 Real-Time Updates

The app simulates real-time data updates every 5 seconds:
- Surface temperatures fluctuate slightly
- Stability scores adjust based on conditions
- Risk levels recalculate automatically
- Timestamps update to show data freshness

**For production**: Replace `simulateDataUpdate()` in `src/data/venues.js` with actual API calls or WebSocket connections.

## 🏗️ Architecture Overview

```
User clicks marker
    ↓
App.jsx handles click event
    ↓
Updates selectedVenue state
    ↓
VenuePanel renders with venue data
    ↓
Real-time updates refresh data every 5s
    ↓
Panel updates automatically
```

## 📝 Key Files to Customize

1. **src/data/venues.js** - Add/edit venue data
2. **src/App.jsx** - Adjust map center, zoom, or data source
3. **src/App.css** - Modify colors, sizing, or animations
4. **src/components/VenuePanel.jsx** - Change metrics display

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
# Add environment variable: VITE_MAPBOX_TOKEN
```

### GitHub Pages
```bash
npm run build
# Configure vite.config.js base path
# Deploy dist/ folder to gh-pages branch
```

## 🐛 Common Issues

### Map shows error or blank screen
- Check `.env.local` has valid Mapbox token
- Token format: `pk.ey...` (starts with pk.)
- Ensure token has "Public" scope enabled

### Markers not clickable
- Check browser console for JavaScript errors
- Verify venue coordinates are valid
- Format: [longitude, latitude] not [lat, lng]

### Styles look wrong
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check that mapbox-gl CSS is imported
- Restart dev server

### Performance issues
- Reduce number of venues if too many markers
- Disable real-time updates if not needed
- Use production build for better performance

## 💡 Enhancement Ideas

### Quick Wins (< 30 min each)
- Add weather icons to markers
- Show historical data charts
- Add venue filtering by sport type
- Implement search functionality
- Add export data button

### Medium Tasks (1-2 hours each)
- Connect to real weather API
- Add 3D terrain view
- Implement user authentication
- Create admin dashboard for venue updates
- Add alert notifications system

### Advanced Features (3+ hours each)
- Predictive analytics using ML
- Historical trend analysis
- Integration with broadcasting schedules
- Mobile app version
- Multi-language support

## 📞 Getting Help

1. Check the inline comments in code files
2. Review README.md for setup instructions
3. Mapbox docs: https://docs.mapbox.com/
4. React Map GL: https://visgl.github.io/react-map-gl/

---

**Remember**: This is a hackathon MVP. Focus on demo impact over perfect code!
