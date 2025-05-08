import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../lib/mongodb';
import Review from '../lib/models/review';
import User from '../lib/models/user';
import mongoose from 'mongoose';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Get all reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find all reviews for the specified workshop with pagination
    const reviews = await Review.find({ workshop: workshopId })
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(offset)
      .limit(limit);
    
    // Get total count for pagination info
    const totalCount = await Review.countDocuments({ workshop: workshopId });
    
    return NextResponse.json({
      reviews,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + reviews.length < totalCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Create a new review
export async function POST(request: Request) {
  try {
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
      
      // Check if user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Check if required fields are provided
      if (!body.workshopId || !body.circleColor || !body.circleFont || !body.circleText) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Check if workshop ID is valid
      if (!mongoose.Types.ObjectId.isValid(body.workshopId)) {
        return NextResponse.json(
          { error: 'Invalid workshop ID' },
          { status: 400 }
        );
      }
      
      // Check if user has already reviewed this workshop
      const existingReview = await Review.findOne({ 
        user: decoded.userId,
        workshop: body.workshopId 
      });
      
      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this workshop' },
          { status: 400 }
        );
      }
      
      // Create the review
      const review = await Review.create({
        user: decoded.userId,
        workshop: body.workshopId,
        userName: user.name,
        circleColor: body.circleColor,
        circleFont: body.circleFont,
        circleText: body.circleText,
        comment: body.comment || '',
        createdAt: new Date()
      });
      
      return NextResponse.json(review, { status: 201 });
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
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
} 