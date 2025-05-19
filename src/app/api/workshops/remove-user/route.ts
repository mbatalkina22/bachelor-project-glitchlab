import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// API endpoint for removing users from workshops
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
    const { userId, workshopId } = await request.json();
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the requesting user (the instructor)
      const instructor = await User.findById(decoded.userId);
      
      if (!instructor) {
        return NextResponse.json(
          { error: 'Instructor not found' },
          { status: 404 }
        );
      }
      
      // Check if requesting user is an instructor
      if (instructor.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can remove users from workshops' },
          { status: 403 }
        );
      }

      // Find the target user
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Find the workshop
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }

      // Check if user is registered for the workshop
      if (!user.registeredWorkshops.includes(workshopId)) {
        return NextResponse.json(
          { error: 'User is not registered for this workshop' },
          { status: 400 }
        );
      }

      // Check if user has a badge for this workshop - if they do, they can't be removed
      const hasBadge = user.badges?.some(badge => 
        badge.workshopId.toString() === workshopId.toString()
      );
      
      if (hasBadge) {
        return NextResponse.json(
          { error: 'Cannot remove a user who has been awarded a badge' },
          { status: 400 }
        );
      }

      // Remove workshop from user's registered workshops
      user.registeredWorkshops = user.registeredWorkshops.filter(
        id => id.toString() !== workshopId.toString()
      );
      await user.save();

      // Decrement workshop registered count
      if (workshop.registeredCount > 0) {
        workshop.registeredCount -= 1;
        await workshop.save();
      }

      return NextResponse.json({ 
        message: 'User successfully removed from workshop'
      }, { status: 200 });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error removing user from workshop:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove user from workshop' },
      { status: 500 }
    );
  }
}