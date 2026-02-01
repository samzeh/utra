/**
 * Test MongoDB Connection
 * 
 * This script tests the MongoDB connection without starting the full server.
 */

import { connectDB, disconnectDB } from './db.js';

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...\n');
    await connectDB();
    console.log('\n✅ Connection successful!');
    console.log(`   Database: ${process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'connected'}`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
