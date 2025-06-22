import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import PendingUser from '../../lib/models/pendingUser';
import { sign } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request) {
  try {
    // Get the verification code and token from the request body
    const { verificationCode, token } = await request.json();

    if (!verificationCode || !token) {
      return NextResponse.json(
        { error: 'Verification code and token are required' },
        { status: 400 }
      );
    }

    try {
      // Verify the token to get the pending user ID
      const decoded = verify(token, process.env.JWT_SECRET!) as { pendingUserId?: string, userId?: string, isPending?: boolean };
      await dbConnect();

      // If token doesn't have pendingUserId or isPending flag, it's likely an old-style token
      if (!decoded.pendingUserId || !decoded.isPending) {
        return NextResponse.json(
          { error: 'Invalid verification token. Please register again.' },
          { status: 400 }
        );
      }

      // Find the pending user
      const pendingUser = await PendingUser.findById(decoded.pendingUserId).select('+password');
      if (!pendingUser) {
        return NextResponse.json(
          { error: 'Registration request not found or expired. Please register again.' },
          { status: 404 }
        );
      }

      // Check if verification code is valid and not expired
      if (!pendingUser.verificationCode || pendingUser.verificationCode !== verificationCode) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      if (pendingUser.verificationCodeExpires && new Date(pendingUser.verificationCodeExpires) < new Date()) {
        // Delete expired pending user
        await PendingUser.deleteOne({ _id: pendingUser._id });
        
        return NextResponse.json(
          { error: 'Verification code has expired. Please register again.', expired: true },
          { status: 400 }
        );
      }

      // Check if email is already registered (in case someone registered between pending creation and verification)
      const existingUser = await User.findOne({ email: pendingUser.email });
      if (existingUser) {
        // Delete the pending user since the email is already in use
        await PendingUser.deleteOne({ _id: pendingUser._id });
        
        return NextResponse.json(
          { error: 'This email is already registered with an account.' },
          { status: 400 }
        );
      }

      // Create a new verified user from the pending user data
      const userData: any = {
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password, // Already hashed in the PendingUser model
        avatar: pendingUser.avatar,
        role: pendingUser.role || 'user',
        emailLanguage: pendingUser.emailLanguage || 'en',
        isVerified: true // User is created already verified
      };
      
      // Add optional instructor fields if present
      if (pendingUser.surname) userData.surname = pendingUser.surname;
      if (pendingUser.description) userData.description = pendingUser.description;
      if (pendingUser.website) userData.website = pendingUser.website;
      if (pendingUser.linkedin) userData.linkedin = pendingUser.linkedin;

      // Create the actual user in the database
      // Since the password is already hashed from PendingUser, we use insertOne to bypass Mongoose middleware
      const userDoc = await User.collection.insertOne(userData);
      
      // Get the inserted user document
      const user = await User.findById(userDoc.insertedId);

      // Delete the pending user now that we've created the real user
      await PendingUser.deleteOne({ _id: pendingUser._id });

      // Create a new token for the authenticated user
      const newToken = sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Email verified successfully',
        isVerified: true,
        token: newToken
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
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}