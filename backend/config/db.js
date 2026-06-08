// STUGUIDE X - Database Connection
// Manages the MongoDB mongoose connection with automatic failover to the HybridDB local store.

const mongoose = require('mongoose');
const hybridDb = require('./hybridDb');

const DEFAULT_MONGO_URI = 'mongodb://localhost:27017';
const DEFAULT_MONGO_DB_NAME = 'stuguide';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || DEFAULT_MONGO_DB_NAME;
    console.log(`[Database] Connecting to MongoDB: ${connStr} (${dbName})`);
    
    const conn = await mongoose.connect(connStr, {
      dbName,
      serverSelectionTimeoutMS: 4000 // Fall back to local db within 4 seconds if unreachable
    });
    
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    hybridDb.isActive = false;
  } catch (error) {
    console.warn(`[Database] Connection to MongoDB failed: ${error.message}`);
    console.warn(`[Database] WARNING: Activating HybridDB Local File Database.`);
    hybridDb.isActive = true;
  }
};

module.exports = connectDB;
