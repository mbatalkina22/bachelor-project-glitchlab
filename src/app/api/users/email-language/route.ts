import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Update user's email language preference
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const { emailLanguage } = await request.json();
    
    // Validate email language
    if (!emailLanguage || (emailLanguage !== 'en' && emailLanguage !== 'it')) {
      return NextResponse.json(
        { error: 'Invalid email language. Supported languages are "en" and "it"' },
        { status: 400 }
      );
    }

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

      // Update email language preference
      user.emailLanguage = emailLanguage;
      await user.save();

      return NextResponse.json({
        message: 'Email language updated successfully',
        emailLanguage: user.emailLanguage
      });
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
      { error: error.message || 'Failed to update email language' },
      { status: 500 }
    );
  }
}

// Get user's current email language preference
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
      
      // Find the user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        emailLanguage: user.emailLanguage || 'en'
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
      { error: error.message || 'Failed to get email language preference' },
      { status: 500 }
    );
  }
}