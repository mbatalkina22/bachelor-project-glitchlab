import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import Workshop from '../../../lib/models/workshop';
import User from '../../../lib/models/user';
import { sendWorkshopReminderEmail } from '@/utils/email/verification';

interface Params {
  params: {
    id: string;
  };
}

// Update workshop sending reminders to respect notification preferences
export async function POST(request: Request, { params }: Params) {
  try {
    // Verify authentication token
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
          { error: 'Only instructors can send workshop reminders' },
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

      // Check if workshop is canceled
      if (workshop.canceled) {
        return NextResponse.json(
          { error: 'Cannot send reminder for a canceled workshop' },
          { status: 400 }
        );
      }

      // Check if reminder has already been sent
      if (workshop.reminderSent) {
        return NextResponse.json(
          { error: 'Reminder has already been sent for this workshop' },
          { status: 400 }
        );
      }

      // Find all users registered for this workshop who have workshop notifications enabled
      const registeredUsers = await User.find({
        registeredWorkshops: { $in: [workshopId] },
        'emailNotifications.workshops': true
      });

      // Send reminder emails to all registered users
      let successCount = 0;
      for (const user of registeredUsers) {
        const success = await sendWorkshopReminderEmail(
          user.email,
          workshop.nameTranslations?.[user.emailLanguage || 'en'] || workshop.name,
          workshop.startDate,
          user.emailLanguage || 'en'
        );
        if (success) successCount++;
      }

      // Mark reminder as sent
      workshop.reminderSent = true;
      await workshop.save();

      return NextResponse.json({ 
        message: 'Workshop reminder sent successfully',
        sentTo: successCount,
        totalUsers: registeredUsers.length
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
    console.error('Error sending workshop reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send workshop reminder' },
      { status: 500 }
    );
  }
}