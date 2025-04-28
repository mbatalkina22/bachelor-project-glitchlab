import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be an array of workshops' }, { status: 400 });
    }
    
    await dbConnect();
    
    const workshops = await Workshop.insertMany(body);
    return NextResponse.json(workshops, { status: 201 });
  } catch (error: any) {
    console.error('Error in batch import:', error);
    return NextResponse.json({ error: error.message || 'Failed to import workshops' }, { status: 500 });
  }
} 