import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import Review from '../../lib/models/review';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Delete user account
export async function DELETE(request: Request) {
  try {
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
      
      // Find the user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Delete user's reviews
      await Review.deleteMany({ user: decoded.userId });
      
      // Update workshop registration counts
      if (user.registeredWorkshops && user.registeredWorkshops.length > 0) {
        for (const workshopId of user.registeredWorkshops) {
          const workshop = await Workshop.findById(workshopId);
          if (workshop) {
            workshop.registeredCount = Math.max(0, workshop.registeredCount - 1);
            await workshop.save();
          }
        }
      }
      
      // Delete the user
      await User.findByIdAndDelete(decoded.userId);
      
      return NextResponse.json({ 
        message: 'Account deleted successfully' 
      }, { status: 200 });
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
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
} 