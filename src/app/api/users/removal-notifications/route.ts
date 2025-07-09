import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// API endpoint for creating removal notifications
export async function POST(request: Request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { userId, workshopId, workshopName, removedBy } = await request.json();
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the requesting user (should be an instructor)
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
          { error: 'Only instructors can create removal notifications' },
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

      // Create notification object
      const notification = {
        type: 'workshop_removal',
        title: 'removalNotificationTitle',
        message: 'removalNotificationMessage',
        workshopId: workshopId,
        workshopName: workshopName,
        read: false,
        createdAt: new Date(),
        action: {
          label: 'exploreWorkshopsAction',
          href: '/workshops'
        }
      };

      // Add notification to user's notifications array
      user.notifications = user.notifications || [];
      user.notifications.unshift(notification); // Add to beginning of array

      // Keep only the latest 50 notifications per user
      if (user.notifications.length > 50) {
        user.notifications = user.notifications.slice(0, 50);
      }

      await user.save();

      return NextResponse.json({ 
        message: 'Removal notification created successfully',
        notification: notification
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
    console.error('Error creating removal notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create removal notification' },
      { status: 500 }
    );
  }
}

// API endpoint for getting user notifications
export async function GET(request: Request) {
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
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        notifications: user.notifications || []
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
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// API endpoint for marking notifications as read
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { notificationId, markAllAsRead } = await request.json();
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (markAllAsRead) {
        // Mark all notifications as read
        user.notifications.forEach((notification: any) => {
          notification.read = true;
        });
      } else if (notificationId) {
        // Mark specific notification as read
        const notification = user.notifications.id(notificationId);
        if (notification) {
          notification.read = true;
        }
      }

      await user.save();

      return NextResponse.json({
        message: 'Notifications updated successfully'
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
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
