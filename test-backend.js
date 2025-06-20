// Test script to verify backend functionality
const mongoose = require('mongoose');

// Test database connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test User model
    const User = require('./swipehire-backend/models/User');
    console.log('✅ User model loaded successfully');
    
    // Test finding a user (without actually querying)
    console.log('✅ User model schema includes companyProfileComplete:', 'companyProfileComplete' in User.schema.paths);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConnection();