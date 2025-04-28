import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';

export async function GET() {
  try {
    await dbConnect();
    const workshops = await Workshop.find({});
    return NextResponse.json(workshops, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const workshop = await Workshop.create(body);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create workshop' }, { status: 500 });
  }
} 