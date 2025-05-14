import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request) {
  try {
    // Check authentication and instructor role
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
      
      // Find the requesting user
      const requestingUser = await User.findById(decoded.userId);
      
      if (!requestingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Check if requesting user is an instructor
      if (requestingUser.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can register new instructors' },
          { status: 403 }
        );
      }

      // Get new instructor data
      const { name, email, password, surname, description, website, linkedin, avatar } = await request.json();

      // Validate required fields
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Please provide name, email, and password' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Create new instructor
      const newInstructor = await User.create({
        name,
        email,
        password,
        role: 'instructor',
        surname: surname || '',
        description: description || '',
        website: website || '',
        linkedin: linkedin || '',
        avatar: avatar || '/images/avatar.jpg'
      });

      // Return instructor without password
      const { password: _, ...instructorWithoutPassword } = newInstructor.toObject();

      return NextResponse.json(instructorWithoutPassword, { status: 201 });
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
    console.error('Error registering instructor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register instructor' },
      { status: 500 }
    );
  }
} 