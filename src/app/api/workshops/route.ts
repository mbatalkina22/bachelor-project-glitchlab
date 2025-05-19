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
      
      console.log("Workshop payload received:", JSON.stringify(body));
      
      // Ensure instructorIds array is provided
      if (!body.instructorIds || !Array.isArray(body.instructorIds) || body.instructorIds.length === 0) {
        console.error("Invalid instructorIds:", body.instructorIds);
        return NextResponse.json(
          { error: 'At least one instructor ID must be provided' },
          { status: 400 }
        );
      }
      
      // Verify that each instructorId is a valid instructor
      const instructorPromises = body.instructorIds.map((id: string) => User.findById(id));
      const instructors = await Promise.all(instructorPromises);
      
      console.log(`Found ${instructors.filter(Boolean).length} valid instructors out of ${body.instructorIds.length} requested`);
      
      // Check if any instructor is not found or not an instructor
      const invalidInstructors = instructors.filter((instructor, index) => 
        !instructor || instructor.role !== 'instructor'
      );
      
      if (invalidInstructors.length > 0) {
        console.error("Invalid instructors found:", invalidInstructors.length);
        return NextResponse.json(
          { error: 'One or more selected instructors are not valid' },
          { status: 400 }
        );
      }
      
      // Create the workshop
      const workshop = await Workshop.create(body);
      console.log("Workshop created successfully with ID:", workshop._id);
      return NextResponse.json(workshop, { status: 201 });
    } catch (error: any) {
      console.error("Error in workshop creation process:", error);
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