import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGODB_URI, USE_IN_MEMORY_DB } = process.env;
let mongoMemoryServer = null;

export async function connectDB() {
  try {
    let uri = MONGODB_URI;

    // If explicitly requested or no MONGO_URI provided, start an in-memory server
    if (USE_IN_MEMORY_DB === 'true' || !uri) {
      // lazy load to avoid adding a required dependency for production
      // eslint-disable-next-line import/no-extraneous-dependencies
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log('Using in-memory MongoDB');
    }

    if (!uri) {
      console.error('No MongoDB URI available');
      return;
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

export async function gracefulShutdown() {
  try {
    await mongoose.connection.close(false);
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('MongoDB connection closed');
  } finally {
    process.exit(0);
  }
}

export default connectDB;
