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

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Feature a review - only for instructors
export async function POST(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
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
      
      // Get workshop name for the featured review
      let workshopName = '';
      const workshop = await Workshop.findById(review.workshop);
      if (workshop) {
        workshopName = workshop.name || 
          (workshop.nameTranslations?.en || workshop.nameTranslations?.it || 'Unnamed Workshop');
      } else {
        workshopName = 'Unknown Workshop';
      }
      
      // Update to featured
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { 
          featured: true,
          workshopName
        },
        { new: true }
      );
      
      return NextResponse.json(updatedReview, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to feature review' },
      { status: 500 }
    );
  }
}

// Remove a review from featured - only for instructors
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
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
      
      // Check if user is an instructor
      const user = await User.findById(decoded.userId);
      if (!user || user.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Only instructors can unfeature reviews' },
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
      
      // Update to remove featured
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { 
          featured: false 
        },
        { new: true }
      );
      
      return NextResponse.json(updatedReview, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unfeature review' },
      { status: 500 }
    );
  }
}