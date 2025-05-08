import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import Review from '../../lib/models/review';
import mongoose from 'mongoose';
import { getWorkshopStatus } from '@/utils/workshopStatus';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

interface Params {
  params: {
    id: string;
  };
}

// Get a specific review
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// Update a review
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const body = await request.json();
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the review
      const review = await Review.findById(id);
      
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Check if the user is the owner of the review
      if (review.user.toString() !== decoded.userId) {
        return NextResponse.json(
          { error: 'Unauthorized to update this review' },
          { status: 403 }
        );
      }
      
      // Verify the workshop is in the past before allowing updates
      const workshop = await Workshop.findById(review.workshop);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      
      // Check if the workshop is in the past (ended)
      const workshopStatus = getWorkshopStatus(workshop.startDate, workshop.endDate);
      if (workshopStatus !== 'past') {
        return NextResponse.json(
          { error: 'Reviews can only be updated for past workshops' },
          { status: 403 }
        );
      }
      
      // Update only allowed fields
      if (body.circleColor) review.circleColor = body.circleColor;
      if (body.circleFont) review.circleFont = body.circleFont;
      if (body.circleText) review.circleText = body.circleText;
      review.comment = body.comment ?? '';
      
      await review.save();
      
      return NextResponse.json(review, { status: 200 });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete a review
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
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
      
      // Find the review
      const review = await Review.findById(id);
      
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Check if the user is the owner of the review
      if (review.user.toString() !== decoded.userId) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this review' },
          { status: 403 }
        );
      }
      
      // Verify the workshop is in the past before allowing deletion
      const workshop = await Workshop.findById(review.workshop);
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      
      // Check if the workshop is in the past (ended)
      const workshopStatus = getWorkshopStatus(workshop.startDate, workshop.endDate);
      if (workshopStatus !== 'past') {
        return NextResponse.json(
          { error: 'Reviews can only be deleted for past workshops' },
          { status: 403 }
        );
      }
      
      // Delete the review
      await Review.findByIdAndDelete(id);
      
      return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
} 