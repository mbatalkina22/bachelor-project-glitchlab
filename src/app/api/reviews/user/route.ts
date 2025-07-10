import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '../../lib/mongodb';
import Review from '../../lib/models/review';
import Workshop from '../../lib/models/workshop';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function GET(request: Request) {
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
      
      // Find all reviews by this user
      const reviews = await Review.find({ user: decoded.userId })
        .sort({ createdAt: -1 }); // Sort by most recent
      
      // Fetch workshop information for each review
      const reviewsWithWorkshops = await Promise.all(
        reviews.map(async (review: any) => {
          const workshop = await Workshop.findById(review.workshop, 'name');
          return {
            ...review.toObject(),
            workshopName: workshop ? workshop.name : 'Unknown Workshop'
          };
        })
      );
      
      return NextResponse.json({
        reviews: reviewsWithWorkshops
      }, { status: 200 });
    } catch (error: any) {
      if ((error as any).name === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user reviews' },
      { status: 500 }
    );
  }
} 