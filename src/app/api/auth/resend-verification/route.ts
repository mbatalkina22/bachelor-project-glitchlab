import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import PendingUser from '../../lib/models/pendingUser';
import { generateVerificationCode, sendVerificationEmail } from '@/utils/email/verification';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request) {
  try {
    const { token, locale } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    try {
      // Verify the token to get the pending user ID
      const decoded = verify(token, process.env.JWT_SECRET!) as { pendingUserId?: string, isPending?: boolean };
      await dbConnect();

      // Check if this is a pending user token
      if (!decoded.pendingUserId || !decoded.isPending) {
        return NextResponse.json(
          { error: 'Invalid verification token. Please register again.' },
          { status: 400 }
        );
      }

      // Find the pending user
      const pendingUser = await PendingUser.findById(decoded.pendingUserId);
      if (!pendingUser) {
        return NextResponse.json(
          { error: 'Registration request not found or expired. Please register again.' },
          { status: 404 }
        );
      }

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Update pending user with new verification code
      pendingUser.verificationCode = verificationCode;
      pendingUser.verificationCodeExpires = verificationCodeExpires;
      await pendingUser.save();

      // Send verification email with user's locale
      await sendVerificationEmail(pendingUser.email, verificationCode, locale || 'en');

      return NextResponse.json({
        message: 'Verification code sent successfully',
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
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}