import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/utils/email/verification';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Generate a test verification code
    const testCode = '123456';
    
    // Send test email
    const result = await sendVerificationEmail(email, testCode);
    
    if (result) {
      return NextResponse.json({
        message: `Test verification email sent to ${email}`,
        success: true
      }, { status: 200 });
    } else {
      return NextResponse.json({
        error: 'Failed to send test email',
        success: false
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}