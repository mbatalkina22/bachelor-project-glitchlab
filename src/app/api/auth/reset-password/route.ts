import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/api/lib/mongodb';
import User from '@/app/api/lib/models/user';
import PasswordReset from '@/app/api/lib/models/passwordReset';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, code, password } = await request.json();
    
    // Check if this is just a verification request or an actual password reset
    const isVerificationOnly = password === 'temporary-verification-only';
    
    console.log('Reset password request:', { email, code, isVerificationOnly, passwordLength: password?.length });

    // Find the password reset request
    const passwordResetRequest = await PasswordReset.findOne({
      email: email.toLowerCase(),
      code,
      // Only check for used=false if this is a verification OR an actual reset
      ...(isVerificationOnly ? {} : { used: false }),
      expires: { $gt: new Date() }
    });

    console.log('Password reset request found:', !!passwordResetRequest);
    
    if (!passwordResetRequest) {
      console.log('Password reset request not found or expired');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // If this is just verification and not actual reset, return success
    if (isVerificationOnly) {
      console.log('Verification successful, not marking as used yet');
      return NextResponse.json({
        success: true,
        message: 'Verification code is valid'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found:', email.toLowerCase());
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Important: Let the model's pre-save hook handle the password hashing
    // This prevents double-hashing
    user.password = password;
    
    try {
      await user.save();
      console.log('Password updated successfully for user:', email.toLowerCase());
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return NextResponse.json(
        { success: false, message: 'Failed to save new password' },
        { status: 500 }
      );
    }

    // Mark verification code as used
    passwordResetRequest.used = true;
    await passwordResetRequest.save();
    console.log('Marked reset code as used');

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}