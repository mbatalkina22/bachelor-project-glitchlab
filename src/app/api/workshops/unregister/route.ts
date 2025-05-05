import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/user';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { workshopId } = await request.json();

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();

      // Check if workshop exists
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }

      // Update user's registered workshops
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if user is registered
      if (!user.registeredWorkshops.includes(workshopId)) {
        return NextResponse.json(
          { error: 'User is not registered for this workshop' },
          { status: 400 }
        );
      }

      // Remove workshop from user's registered workshops
      user.registeredWorkshops = user.registeredWorkshops.filter(id => id.toString() !== workshopId);
      await user.save();

      return NextResponse.json({ 
        message: 'Successfully unregistered from workshop',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          registeredWorkshops: user.registeredWorkshops
        }
      }, { status: 200 });

    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Workshop unregistration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unregister from workshop' },
      { status: 500 }
    );
  }
} 