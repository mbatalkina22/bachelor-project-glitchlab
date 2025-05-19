import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// API endpoint for awarding badges to users
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
          { error: 'Only instructors can award badges' },
          { status: 403 }
        );
      }

      // Find the target user to award the badge to
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Find the workshop to get badge details
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

      // Check if user already has this badge
      const existingBadge = user.badges?.find(badge => 
        badge.workshopId.toString() === workshopId.toString()
      );

      if (existingBadge) {
        return NextResponse.json(
          { error: 'User already has this badge' },
          { status: 400 }
        );
      }

      // Create badge object
      const badge = {
        id: workshopId,
        workshopId: workshopId,
        name: workshop.badgeName || `${workshop.name} Badge`,
        image: "/images/badge.png", // Default image or from workshop
        date: new Date(),
        description: `Completed the ${workshop.name} workshop`,
        awardedBy: decoded.userId
      };

      // Add badge to user
      if (!user.badges) {
        user.badges = [];
      }
      user.badges.push(badge);
      
      // Important: We're NOT removing the workshop from the user's registeredWorkshops
      // This ensures the user still shows up in the registered users list
      // and we can display their badge awarded status
      
      await user.save();

      return NextResponse.json({ 
        message: 'Badge successfully awarded',
        badge
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
    console.error('Error awarding badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to award badge' },
      { status: 500 }
    );
  }
}