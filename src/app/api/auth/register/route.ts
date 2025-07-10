import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import PendingUser from '../../lib/models/pendingUser';
import { generateVerificationCode, sendVerificationEmail } from '@/utils/email/verification';
import { sign } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request) {
  try {
    const { name, email, password, avatar, role, surname, description, website, linkedin, emailLanguage } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists in Users collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Also check if there's a pending registration for this email
    const existingPendingUser = await PendingUser.findOne({ email });
    if (existingPendingUser) {
      // Delete the existing pending user to allow re-registration
      await PendingUser.deleteOne({ email });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create pending user object with basic fields
    const pendingUserData: any = {
      name,
      email,
      password,
      avatar: avatar || '/images/default-avatar.png',
      emailLanguage: emailLanguage || 'en',
      verificationCode,
      verificationCodeExpires
    };

    // Add instructor fields if role is instructor
    if (role === 'instructor') {
      pendingUserData.role = 'instructor';
      if (surname) pendingUserData.surname = surname;
      if (description) pendingUserData.description = description;
      if (website) pendingUserData.website = website;
      if (linkedin) pendingUserData.linkedin = linkedin;
    }

    // Create new pending user instead of regular user
    const pendingUser = await PendingUser.create(pendingUserData);

    // Send verification email using the user's preferred email language
    await sendVerificationEmail(email, verificationCode, emailLanguage);

    // Create JWT token with pending flag and short expiry
    // We'll use the PendingUser ID rather than a User ID
    const token = sign(
      { pendingUserId: pendingUser._id, isPending: true },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return pending user data without sensitive fields
    const { password: _, verificationCode: __, verificationCodeExpires: ___, ...pendingUserWithoutSensitiveData } = pendingUser.toObject();

    return NextResponse.json({ 
      pendingUser: pendingUserWithoutSensitiveData, 
      token,
      needsVerification: true 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}