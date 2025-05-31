import { NextResponse } from 'next/server';
import { verify, JsonWebTokenError } from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/user';
import Workshop from '../../../lib/models/workshop';
import { sendWorkshopCancellationEmail } from '@/utils/email/verification';

interface Params {
  params: {
    id: string;
  };
}

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function POST(request: Request, { params }: Params) {
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
    const workshopId = params.id;
    
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
          { error: 'Only instructors can cancel workshops' },
          { status: 403 }
        );
      }

      // Find the workshop
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      
      // Check if workshop is already canceled
      if (workshop.canceled) {
        return NextResponse.json(
          { error: 'Workshop is already canceled' },
          { status: 400 }
        );
      }
      
      // Update workshop to canceled status
      workshop.canceled = true;
      await workshop.save();
      
      // Find all users registered for this workshop
      const registeredUsers = await User.find({
        registeredWorkshops: { $in: [workshopId] }
      });
      
      // Send cancellation emails and unregister all users from the workshop
      for (const user of registeredUsers) {
        // Send cancellation email in user's preferred language
        await sendWorkshopCancellationEmail(
          user.email,
          workshop.nameTranslations?.[user.emailLanguage || 'en'] || workshop.name,
          workshop.startDate,
          user.emailLanguage || 'en'
        );
        
        // Unregister user from workshop
        user.registeredWorkshops = user.registeredWorkshops.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== workshopId.toString()
        );
        await user.save();
      }
      
      // Reset registered count to 0
      workshop.registeredCount = 0;
      await workshop.save();

      return NextResponse.json({ 
        message: 'Workshop successfully canceled',
        workshop
      }, { status: 200 });

    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error canceling workshop:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel workshop' },
      { status: 500 }
    );
  }
}