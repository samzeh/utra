/**
 * MongoDB Database Connection
 * 
 * This module handles the connection to MongoDB using Mongoose.
 * It exports a function to connect to the database and handles connection events.
 */

import mongoose from 'mongoose';

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
    // Ignore errors - dotenv may not be needed if env vars are set another way
  }
}

/**
 * Get MongoDB connection string from environment variables
 * @returns {string} The MongoDB connection string
 * @throws {Error} If the connection string is not set
 */
function getMongoUri() {
  const mongoUri = process.env?.MONGODB_URI || process.env?.MONGO_URI || null;

  if (!mongoUri) {
    throw new Error(
      'MongoDB connection string is not set. Please set MONGODB_URI in your .env file.\n' +
      'Format: mongodb://localhost:27017/your-database-name\n' +
      'Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database-name'
    );
  }

  return mongoUri;
}

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export async function connectDB() {
  try {
    const mongoUri = getMongoUri();
    
    const options = {
      // These options help with connection stability
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(mongoUri, options);

    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
    throw error;
  }
}

export default {
  connectDB,
  disconnectDB,
  getMongoUri
};
