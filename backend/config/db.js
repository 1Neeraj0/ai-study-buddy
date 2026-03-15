const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('xxxxx') || uri.includes('<')) {
    console.error('\n============================================');
    console.error('  MongoDB URI not configured!');
    console.error('  Please update MONGODB_URI in backend/.env');
    console.error('  Get a free cluster at: mongodb.com/atlas');
    console.error('============================================\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
