import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

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

      const user = await User.findById(decoded.userId)
        .populate('registeredWorkshops')
        .select('registeredWorkshops');

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(user.registeredWorkshops || [], { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching registered workshops:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registered workshops' },
      { status: 500 }
    );
  }
} 