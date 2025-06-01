import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Review from '../../lib/models/review';

// Get all featured reviews for the main page
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Find all reviews that are marked as featured
    // Removed the comment filtering to show all featured reviews
    const featuredReviews = await Review.find({ 
      featured: true
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(12); // Limit to a reasonable number
    
    return NextResponse.json(featuredReviews, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured reviews' },
      { status: 500 }
    );
  }
}