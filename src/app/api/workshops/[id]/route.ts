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

    // Fetch instructor details from instructorId
    let instructorDetails = null;
    if (workshop.instructorId) {
      instructorDetails = await User.findById(workshop.instructorId)
        .select('name surname avatar description'); // Only select needed fields
      
      if (!instructorDetails) {
        console.warn(`Instructor with ID ${workshop.instructorId} not found for workshop ${params.id}`);
      }
    }

    // Combine workshop data with instructor details
    const workshopData = workshop.toObject();
    workshopData.instructorDetails = instructorDetails || {
      name: workshop.instructor,
      avatar: "/images/avatar.jpg"
    };

    return NextResponse.json(workshopData, { status: 200 });
  } catch (error) {
    console.error('Error fetching workshop by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 });
  }
}