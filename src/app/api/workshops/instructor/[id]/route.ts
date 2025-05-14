import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Workshop from '../../../lib/models/workshop';
import User from '../../../lib/models/user';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = params.id;
    
    await dbConnect();
    
    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }
    
    // Find workshops created by this instructor
    // This assumes you've updated the Workshop model to store the instructor ID
    // For now, we'll search by instructor name
    const workshops = await Workshop.find({ instructor: instructor.name });
    
    return NextResponse.json({ workshops }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instructor workshops:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch instructor workshops' },
      { status: 500 }
    );
  }
} 