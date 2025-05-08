import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import Review from '../../lib/models/review';
import mongoose from 'mongoose';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId');
    
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
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
      
      // Check if workshop ID is valid
      if (!mongoose.Types.ObjectId.isValid(workshopId)) {
        return NextResponse.json(
          { error: 'Invalid workshop ID' },
          { status: 400 }
        );
      }
      
      // Check if user has already reviewed this workshop
      const existingReview = await Review.findOne({ 
        user: decoded.userId,
        workshop: workshopId 
      });
      
      return NextResponse.json({ 
        hasReviewed: !!existingReview,
        review: existingReview 
      }, { status: 200 });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking review status:', error);
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    );
  }
} 