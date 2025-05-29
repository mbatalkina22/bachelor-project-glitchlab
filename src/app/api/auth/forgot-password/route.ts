import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/mongodb';
import User from '@/app/api/lib/models/user';
import PasswordReset from '@/app/api/lib/models/passwordReset';
import { generateVerificationCode, sendPasswordResetEmail } from '@/utils/email/verification';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, locale } = await request.json();

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that email doesn't exist for security reasons
      return NextResponse.json({ success: true, message: 'If your email is registered, you will receive a password reset code.' });
    }

    // Generate a verification code
    const code = generateVerificationCode();
    
    // Set expiry time to 30 minutes from now
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);

    // Save the verification code to database
    await PasswordReset.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        email: email.toLowerCase(),
        code,
        expires,
        used: false
      },
      { upsert: true, new: true }
    );

    // Send verification email
    await sendPasswordResetEmail(email.toLowerCase(), code, locale || 'en');

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset code.'
    });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}