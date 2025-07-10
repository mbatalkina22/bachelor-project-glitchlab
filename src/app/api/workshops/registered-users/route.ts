import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify instructor's token
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find requesting user and check if they're an instructor
      const requestingUser = await User.findById(decoded.userId);
      if (!requestingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (requestingUser.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can view registered users' },
          { status: 403 }
        );
      }
      
      // Find workshop and verify it exists
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      
      // Find all users registered for this workshop
      // Include badges field to check which users already have badges for this workshop
      const registeredUsers = await User.find({
        registeredWorkshops: { $in: [workshopId] }
      }).select('name email avatar badges');
      
      // Process users to properly format badge info
      const processedUsers = registeredUsers.map(user => {
        // Convert Mongoose document to plain object
        const plainUser = user.toObject();
        
        // Include only essential badge data if needed
        if (plainUser.badges && plainUser.badges.length > 0) {
          // Keep the badges array but only include relevant fields
          plainUser.badges = plainUser.badges.map((badge: any) => ({
            workshopId: badge.workshopId,
            name: badge.name
          }));
        }
        
        return plainUser;
      });
      
      return NextResponse.json({ 
        users: processedUsers,
        workshop: {
          name: workshop.name,
          registeredCount: workshop.registeredCount,
          capacity: workshop.capacity
        }
      }, { status: 200 });
      
    } catch (error) {
      if ((error as any).name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registered users' },
      { status: 500 }
    );
  }
}