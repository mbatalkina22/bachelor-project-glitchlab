import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();

    const workshop = await Workshop.findById(params.id);
    
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json(workshop, { status: 200 });
  } catch (error) {
    console.error('Error fetching workshop by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 });
  }
} 