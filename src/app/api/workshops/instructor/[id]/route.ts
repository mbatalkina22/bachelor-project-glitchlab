import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Workshop from '../../../lib/models/workshop';
import User from '../../../lib/models/user';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
    
    // Find workshops where this instructor is included in the instructorIds array
    const workshops = await Workshop.find({ instructorIds: instructorId });
    
    return NextResponse.json({ workshops }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch instructor workshops' },
      { status: 500 }
    );
  }
}