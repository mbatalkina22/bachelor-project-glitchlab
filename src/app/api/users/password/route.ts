import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Update user password
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
    const { currentPassword, newPassword } = await request.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Please provide current and new password' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the user with password included
      const user = await User.findById(decoded.userId).select('+password');
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      return NextResponse.json({ 
        message: 'Password updated successfully' 
      }, { status: 200 });
    } catch (error: any) {
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
      { error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
} 