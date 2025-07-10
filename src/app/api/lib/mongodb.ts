import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Ensure the connection string points to the GlitchLab database
const MONGODB_URI = process.env.MONGODB_URI.endsWith('/') 
  ? `${process.env.MONGODB_URI}GlitchLab` 
  : `${process.env.MONGODB_URI}/GlitchLab`;

// Track the connection state
let isConnected = false;

/**
 * Connect to MongoDB database
 */
async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = true;
    return db;
  } catch (error) {
    throw error;
  }
}

export default dbConnect; 