import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';
import User from '../../lib/models/user';
import { sendWorkshopUpdateEmail } from '@/utils/email/verification';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteParams) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Fetch instructor details from instructorIds (multiple instructors)
    let instructorDetailsList = [];
    
    if (workshop.instructorIds && Array.isArray(workshop.instructorIds) && workshop.instructorIds.length > 0) {
      // Use Promise.all to fetch all instructors in parallel
      const instructorPromises = workshop.instructorIds.map((id: string) => 
        User.findById(id).select('name surname avatar description')
      );
      
      const instructors = await Promise.all(instructorPromises);
      instructorDetailsList = instructors.filter(instructor => instructor !== null);
      
      if (instructorDetailsList.length === 0) {
      }
    }
    // Fallback to old single instructorId if instructorIds doesn't exist (for backward compatibility)
    else if (workshop.instructorId) {
      const instructorDetails = await User.findById(workshop.instructorId)
        .select('name surname avatar description');
      
      if (instructorDetails) {
        instructorDetailsList = [instructorDetails];
      } else {
      }
    }

    // Combine workshop data with instructor details
    const workshopData = workshop.toObject();
    
    // Add instructors details array
    workshopData.instructorDetailsList = instructorDetailsList.length > 0 
      ? instructorDetailsList 
      : [{
          name: workshop.instructor || 'Instructor',
          avatar: "/images/avatar.jpg"
        }];

    // Keep single instructorDetails for backward compatibility
    if (instructorDetailsList.length > 0) {
      workshopData.instructorDetails = instructorDetailsList[0];
    } else {
      workshopData.instructorDetails = {
        name: workshop.instructor || 'Instructor',
        avatar: "/images/avatar.jpg"
      };
    }

    return NextResponse.json(workshopData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    // Verify authentication and instructor role
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
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
        { error: 'Only instructors can update workshops' },
        { status: 403 }
      );
    }

    const params = await context.params;
    
    // Find the workshop
    const workshop = await Workshop.findById(params.id);
    
    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }
    
    // Get updated workshop data from request body
    const updatedData = await request.json();

    // Convert dates to Date objects for proper comparison
    const oldStartDate = new Date(workshop.startDate);
    const oldEndDate = new Date(workshop.endDate);
    const newStartDate = new Date(updatedData.startDate);
    const newEndDate = new Date(updatedData.endDate);
    
    // Compare full date and time values
    const hasDateChanged = 
      oldStartDate.getTime() !== newStartDate.getTime() || 
      oldEndDate.getTime() !== newEndDate.getTime();
      
    // Compare locations
    const hasLocationChanged = updatedData.location !== workshop.location;

    // If either date/time or location changed, notify users who have change notifications enabled
    if (hasDateChanged || hasLocationChanged) {
      // Find all registered users who have change notifications enabled
      const registeredUsers = await User.find({
        registeredWorkshops: { $in: [params.id] },
        'emailNotifications.changes': true
      });

      // Send update emails to users who have change notifications enabled
      for (const user of registeredUsers) {
        try {
          await sendWorkshopUpdateEmail(
            user.email,
            {
              workshopName: updatedData.nameTranslations?.[user.emailLanguage || 'en'] || updatedData.name,
              previousDateTime: oldStartDate,
              newDateTime: newStartDate,
              previousLocation: workshop.location,
              newLocation: updatedData.location
            },
            user.emailLanguage || 'en'
          );
        } catch (emailError) {
          // Continue with other users even if one email fails
        }
      }
    }
    
    // Update the workshop
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      params.id, 
      { $set: updatedData },
      { new: true }
    );
    
    return NextResponse.json(updatedWorkshop, { status: 200 });
  } catch (error: any) {
    
    if ((error as any).name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update workshop' },
      { status: 500 }
    );
  }
}