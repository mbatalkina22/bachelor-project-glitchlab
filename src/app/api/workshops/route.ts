import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';
import { verify } from 'jsonwebtoken';
import User from '../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

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
    // Check authentication and instructor role
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the requesting user
      const requestingUser = await User.findById(decoded.userId);
      
      if (!requestingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Check if requesting user is an instructor
      if (requestingUser.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can create workshops' },
          { status: 403 }
        );
      }

      // Get workshop data from request body
      const body = await request.json();
      
      // Verify that instructorId is a valid instructor
      if (body.instructorId) {
        const instructorUser = await User.findById(body.instructorId);
        if (!instructorUser || instructorUser.role !== 'instructor') {
          return NextResponse.json(
            { error: 'Selected instructor is not valid' },
            { status: 400 }
          );
        }
        // Get instructor name for backward compatibility
        body.instructor = `${instructorUser.name} ${instructorUser.surname || ''}`.trim();
      }
      
      // Create the workshop
      const workshop = await Workshop.create(body);
      return NextResponse.json(workshop, { status: 201 });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating workshop:', error);
    return NextResponse.json({ error: error.message || 'Failed to create workshop' }, { status: 500 });
  }
}