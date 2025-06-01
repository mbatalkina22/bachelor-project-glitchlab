import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Update user's notification preferences
export async function PUT(request: Request) {
  try {
    console.log('Received notification preferences update request');
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const { emailNotifications } = await request.json();
    console.log('Received preferences:', emailNotifications);
    
    if (typeof emailNotifications?.workshops !== 'boolean' || typeof emailNotifications?.changes !== 'boolean') {
      console.log('Invalid preferences format:', emailNotifications);
      return NextResponse.json(
        { error: 'Invalid notification preferences' },
        { status: 400 }
      );
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();

      // Find the user
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found:', decoded.userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('Before update - User notifications:', user.emailNotifications);
      
      // Update with direct set instead of object assignment
      await User.findByIdAndUpdate(decoded.userId, {
        $set: {
          'emailNotifications.workshops': emailNotifications.workshops,
          'emailNotifications.changes': emailNotifications.changes
        }
      });
      
      // Get the updated user to return the current values
      const updatedUser = await User.findById(decoded.userId);
      console.log('After update - User notifications:', updatedUser.emailNotifications);

      return NextResponse.json({
        message: 'Notification preferences updated successfully',
        emailNotifications: updatedUser.emailNotifications
      });

    } catch (error) {
      console.error('Token verification or database error:', error);
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

// Get user's current notification preferences
export async function GET(request: Request) {
  try {
    console.log('Received notification preferences get request');
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found:', decoded.userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('Retrieved user notifications:', user.emailNotifications);
      return NextResponse.json({
        emailNotifications: user.emailNotifications || {
          workshops: true,
          changes: true
        }
      });
    } catch (error) {
      console.error('Token verification or database error:', error);
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}