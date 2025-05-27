import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all workshops directly from the database
    const workshops = await Workshop.find({}).lean();
    
    // Log the raw workshop data to see if translations are stored
    console.log('Debug - Raw workshop data from database:');
    console.log(JSON.stringify(workshops, null, 2));
    
    return NextResponse.json({ 
      message: 'Debug endpoint for workshops data',
      count: workshops.length,
      workshops 
    }, { status: 200 });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Failed to fetch workshops for debugging' }, { status: 500 });
  }
}