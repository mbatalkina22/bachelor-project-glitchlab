import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../lib/mongodb';
import Review from '../lib/models/review';
import User from '../lib/models/user';
import { getWorkshopStatus } from '@/utils/workshopStatus';
import Workshop from '../lib/models/workshop';

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
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the user to check if they're an instructor
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Prevent instructors from submitting reviews
      if (user.role === 'instructor') {
        return NextResponse.json(
          { error: 'Instructors cannot submit reviews' },
          { status: 403 }
        );
      }
      
      const body = await request.json();
      const { workshop: workshopId } = body;
      
      // Find the workshop to check its status
      const workshop = await Workshop.findById(workshopId);
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
          { error: 'Reviews can only be submitted for past workshops' },
          { status: 403 }
        );
      }
      
      // Check if user has already reviewed this workshop
      const existingReview = await Review.findOne({ 
        user: decoded.userId,
        workshop: workshopId
      });
      
      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this workshop' },
          { status: 400 }
        );
      }
      
      // Create the review
      const review = await Review.create({
        ...body,
        user: decoded.userId,
        userName: user.name,
        workshop: workshopId
      });
      
      return NextResponse.json(review, { status: 201 });
    } catch (error: any) {
      if ((error as any).name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}