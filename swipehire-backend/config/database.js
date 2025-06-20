const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI.replace(/:[^:]+@/, ':****@')}`);
    console.log("Conceptual: Ensure database indexes are created for fields like User.firebaseUid, User.email, etc.");
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
