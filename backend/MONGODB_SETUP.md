# MongoDB Setup Guide

This guide will help you connect your backend to a MongoDB database.

## Prerequisites

1. **MongoDB Installation Options:**
   - **Local MongoDB**: Install MongoDB Community Edition on your machine
   - **MongoDB Atlas**: Use the free cloud-hosted MongoDB (recommended for beginners)
   - **Docker**: Run MongoDB in a Docker container

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `mongoose` - MongoDB object modeling for Node.js
- `express` - Web framework for Node.js
- `cors` - Enable CORS for your API

### 2. Configure MongoDB Connection

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password
5. Whitelist your IP address:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

#### Option B: Local MongoDB

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service (usually runs automatically)
3. Your connection string will be: `mongodb://localhost:27017/your-database-name`

### 3. Set Environment Variables

Create or update your `.env` file in the `backend` directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/your-database-name

# Server Port (optional, defaults to 3001)
PORT=3001

# Gemini API Key (if using)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Replace `username`, `password`, and `database-name` with your actual values.

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
   Database: your-database-name
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

## Testing the Connection

1. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test API:**
   ```bash
   curl http://localhost:3001/api
   ```

## Creating Your Own Models

1. Create a model file in `backend/models/`:
   ```javascript
   import mongoose from 'mongoose';

   const yourSchema = new mongoose.Schema({
     field1: String,
     field2: Number,
     // ... more fields
   });

   export default mongoose.model('YourModel', yourSchema);
   ```

2. Create routes in `backend/routes/`:
   ```javascript
   import express from 'express';
   import YourModel from '../models/yourModel.js';

   const router = express.Router();
   
   router.get('/', async (req, res) => {
     const items = await YourModel.find();
     res.json(items);
   });
   
   export default router;
   ```

3. Import routes in `server.js`:
   ```javascript
   import yourRoutes from './routes/yourRoutes.js';
   app.use('/api/your-endpoint', yourRoutes);
   ```

## Example Usage

See `backend/models/example.js` and `backend/routes/example.js` for a complete CRUD example.

To enable the example routes, uncomment these lines in `server.js`:
```javascript
import exampleRoutes from './routes/example.js';
app.use('/api/examples', exampleRoutes);
```

## Troubleshooting

### Connection Failed
- Check your connection string is correct
- Verify your IP is whitelisted (for Atlas)
- Ensure MongoDB service is running (for local)
- Check your username/password are correct

### Port Already in Use
- Change the PORT in `.env` file
- Or stop the process using port 3001

### Module Not Found
- Run `npm install` again
- Check that you're in the `backend` directory

## Next Steps

- Create your own models and routes
- Add authentication/authorization
- Set up API validation
- Add error handling middleware
- Integrate with your React frontend
