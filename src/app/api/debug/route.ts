import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    
    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get count of workshops
    const workshopCount = await mongoose.connection.db.collection('workshops').countDocuments();
    
    // Return connection info
    return NextResponse.json({
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db.databaseName,
      collections: collectionNames,
      workshopCount,
      connectionString: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@') // Hide credentials
    }, { status: 200 });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 