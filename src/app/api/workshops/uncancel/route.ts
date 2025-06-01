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
    // Check authentication and instructor role
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { workshopId, newStartDate, newEndDate } = await request.json();

    if (!workshopId || !newStartDate || !newEndDate) {
      return NextResponse.json(
        { error: 'Workshop ID, new start date, and new end date are required' },
        { status: 400 }
      );
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();

      // Find the requesting user
      const instructor = await User.findById(decoded.userId);

      if (!instructor) {
        return NextResponse.json(
          { error: 'Instructor not found' },
          { status: 404 }
        );
      }

      // Check if requesting user is an instructor
      if (instructor.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can uncancel workshops' },
          { status: 403 }
        );
      }

      // Find the canceled workshop
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }

      // Check if workshop is canceled
      if (!workshop.canceled) {
        return NextResponse.json(
          { error: 'Workshop is not canceled' },
          { status: 400 }
        );
      }

      // Update the existing workshop with new dates and set canceled to false
      workshop.startDate = new Date(newStartDate);
      workshop.endDate = new Date(newEndDate);
      workshop.canceled = false;
      workshop.reminderSent = false; // Reset reminder status when workshop is uncanceled
      
      await workshop.save();

      return NextResponse.json({ 
        message: 'Workshop successfully uncanceled',
        updatedWorkshop: workshop
      }, { status: 200 });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error uncanceling workshop:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to uncancel workshop' },
      { status: 500 }
    );
  }
}