import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';
import mongoose from 'mongoose';

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
    return NextResponse.json({ error: error.message || 'Failed to import workshops' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',');

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'No workshop IDs provided' },
        { status: 400 }
      );
    }

    // Validate all IDs
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid workshop IDs provided' },
        { status: 400 }
      );
    }

    await dbConnect();

    const workshops = await Workshop.find({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    return NextResponse.json({ workshops });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    );
  }
} 