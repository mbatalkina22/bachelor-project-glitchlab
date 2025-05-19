import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Workshop from '../../lib/models/workshop';
import User from '../../lib/models/user';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();

    const workshop = await Workshop.findById(params.id);
    
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Fetch instructor details from instructorIds (multiple instructors)
    let instructorDetailsList = [];
    
    if (workshop.instructorIds && Array.isArray(workshop.instructorIds) && workshop.instructorIds.length > 0) {
      // Use Promise.all to fetch all instructors in parallel
      const instructorPromises = workshop.instructorIds.map(id => 
        User.findById(id).select('name surname avatar description')
      );
      
      const instructors = await Promise.all(instructorPromises);
      instructorDetailsList = instructors.filter(instructor => instructor !== null);
      
      if (instructorDetailsList.length === 0) {
        console.warn(`No valid instructors found for workshop ${params.id}`);
      }
    }
    // Fallback to old single instructorId if instructorIds doesn't exist (for backward compatibility)
    else if (workshop.instructorId) {
      const instructorDetails = await User.findById(workshop.instructorId)
        .select('name surname avatar description');
      
      if (instructorDetails) {
        instructorDetailsList = [instructorDetails];
      } else {
        console.warn(`Instructor with ID ${workshop.instructorId} not found for workshop ${params.id}`);
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
    console.error('Error fetching workshop by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 });
  }
}