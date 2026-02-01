# Sidebar Intelligence Setup

## Overview

The Sidebar Intelligence generator uses Gemini API to produce structured JSON for venue operations. Output populates the venue panel (risk level, stability score, key drivers, recommended actions, etc.).

## Setup

1. **API key**: Ensure `GEMINI_API_KEY` is set in:
   - `my-react-app/.env.local` (optional)
   - or `utra/Gemini-setup/.env` (already configured)

2. **Run dev** (API + frontend):
   ```bash
   cd my-react-app
   npm run dev:all
   ```
   This starts the API on port 3001 and Vite on 5173 (or next free port).

3. **Or run separately**:
   ```bash
   # Terminal 1: API
   npm run api

   # Terminal 2: Frontend
   npm run dev
   ```

## API

- **POST** `/api/sidebar-insights`
- **Body**: `{ venue, timeWindow, telemetry, opsLogs? }`
- **Response**: `SidebarInsights` JSON

Vite proxies `/api` → `http://localhost:3001`.

## Usage

1. Click a venue marker on the map
2. In the venue panel, click **Generate Insights**
3. AI analysis populates risk level, drivers, actions, stability window, etc.
