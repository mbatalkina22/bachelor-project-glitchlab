import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import bcrypt from 'bcryptjs';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Update user profile
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
    const body = await request.json();
    
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
      
      // Update basic profile fields
      if (body.name) user.name = body.name;
      if (body.email) user.email = body.email;
      if (body.avatar) user.avatar = body.avatar;
      
      // Update instructor fields if user is an instructor
      if (user.role === 'instructor') {
        if (body.surname !== undefined) user.surname = body.surname;
        if (body.description !== undefined) user.description = body.description;
        if (body.website !== undefined) user.website = body.website;
        if (body.linkedin !== undefined) user.linkedin = body.linkedin;
      }
      
      await user.save();
      
      // Return user without password
      const userObj = user.toObject();
      delete userObj.password;
      
      return NextResponse.json(userObj, { status: 200 });
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
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 