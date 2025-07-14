import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import User from '../lib/models/user';

export async function GET() {
  try {
    await dbConnect();
    
    // Find all users with role 'instructor' but exclude the test email
    const instructors = await User.find({ 
      role: 'instructor',
      email: { $ne: 'mari.batalkina@gmail.com' } // Exclude this email from display
    })
      .select('name surname description website linkedin avatar')
      .sort({ name: 1 });
    
    return NextResponse.json({ instructors }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
} 