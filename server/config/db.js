const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri !== 'memory') {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    }

    // If MONGO_URI is set to 'memory' or not provided, try memory server for local zero-config sandbox/dev
    console.log('[Database] No external MONGO_URI configured or explicitly set to memory. Initializing in-memory MongoDB engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-Memory MongoDB Connected at: ${uri}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection attempt failed: ${error.message}`);
    // Try fallback to MongoMemoryServer so the app runs smoothly out-of-the-box
    try {
      console.log('[Database] Fallback: Spinning up in-memory MongoDB instance for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Database] In-Memory Fallback MongoDB Connected at: ${uri}`);
      return conn;
    } catch (innerError) {
      console.error(`[Database] Fatal: Could not establish MongoDB connection: ${innerError.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error('[Database] Error closing DB connection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };

