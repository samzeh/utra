/**
 * API server for Frostline Sidebar Intelligence.
 * Run: node server/api.js (port 3001)
 */

import express from 'express';
import cors from 'cors';
import { generateSidebarInsights } from './sidebarInsights.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/sidebar-insights', async (req, res) => {
  try {
    const input = req.body;
    if (!input?.venue || !input?.timeWindow || !input?.telemetry) {
      return res.status(400).json({
        error: 'Missing required fields: venue, timeWindow, telemetry',
      });
    }
    const output = await generateSidebarInsights(input);
    res.json(output);
  } catch (err) {
    console.error('[sidebar-insights]', err);
    res.status(500).json({
      error: err.message || 'Failed to generate sidebar insights',
    });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Frostline API running at http://localhost:${PORT}`);
});
