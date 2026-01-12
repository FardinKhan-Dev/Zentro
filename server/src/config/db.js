import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_DEV_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI not configured in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    logger.info(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`✗ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
