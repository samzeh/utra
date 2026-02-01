/**
 * Express Server with MongoDB
 * 
 * This is the main server file that sets up Express and connects to MongoDB.
 */

import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

// Load environment variables
if (typeof process !== 'undefined' && process.versions?.node && typeof window === 'undefined') {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const dotenv = require('dotenv');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    dotenv.config({ path: join(__dirname, '.env') });
  } catch (error) {
    // Ignore errors
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Example API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to the API',
    endpoints: {
      health: '/health',
      api: '/api',
      temperature: {
        all: '/api/temperature',
        stats: '/api/temperature/stats',
        byYear: '/api/temperature/year/:year',
        byRange: '/api/temperature/range/:startYear/:endYear',
        byMonth: '/api/temperature/month/:month',
        average: '/api/temperature/average/:year'
      }
    }
  });
});

// Import and use routes
import temperatureRoutes from './routes/temperature.js';
app.use('/api/temperature', temperatureRoutes);

import climateAnalysisRoutes from './routes/climate-analysis.js';
app.use('/api/climate-analysis', climateAnalysisRoutes);

// Import and use example routes (uncomment when ready)
// import exampleRoutes from './routes/example.js';
// app.use('/api/examples', exampleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
