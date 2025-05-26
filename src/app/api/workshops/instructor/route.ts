import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function GET(request: Request) {
  try {
    // Verify authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Decode token to get user ID
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();

      // Find all workshops where this user is an instructor
      const workshops = await Workshop.find({
        instructorIds: decoded.userId
      });

      return NextResponse.json(workshops || [], { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching instructor workshops:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch instructor workshops' },
      { status: 500 }
    );
  }
}