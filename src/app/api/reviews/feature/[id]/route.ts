import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import Review from '../../../lib/models/review';
import User from '../../../lib/models/user';
import Workshop from '../../../lib/models/workshop';
import mongoose from 'mongoose';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

interface Params {
  params: {
    id: string;
  };
}

// Toggle a review's featured status (instructors only)
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
      
      // Check if user is an instructor
      const user = await User.findById(decoded.userId);
      if (!user || user.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can feature reviews' },
          { status: 403 }
        );
      }
      
      // Find the review
      const review = await Review.findById(id);
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Get workshop name if this review is being featured
      let workshopName = review.workshopName;
      if (!workshopName && body.featured) {
        const workshop = await Workshop.findById(review.workshop);
        if (workshop) {
          workshopName = workshop.name || 
            (workshop.nameTranslations?.en || workshop.nameTranslations?.it || 'Unnamed Workshop');
        } else {
          workshopName = 'Unknown Workshop';
        }
      }
      
      // Toggle featured status and update workshop name if needed
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { 
          featured: body.featured,
          ...(body.featured && { workshopName })
        },
        { new: true }
      );
      
      return NextResponse.json(updatedReview, { status: 200 });
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}