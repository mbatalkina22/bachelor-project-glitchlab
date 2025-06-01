// API route for toggling featured status of reviews
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "../../lib/mongodb";
import Review from "../../lib/models/review";
import User from "../../lib/models/user";

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication with JWT
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    try {
      // Verify token - using the same pattern as other endpoints
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      await dbConnect();
      
      // Find the user to check role
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Verify instructor role
      if (user.role !== "instructor") {
        return NextResponse.json(
          { error: "Forbidden: Only instructors can feature reviews" },
          { status: 403 }
        );
      }

      // Get request body
      const body = await request.json();
      const { reviewId, featured } = body;

      if (!reviewId) {
        return NextResponse.json(
          { error: "Missing reviewId" },
          { status: 400 }
        );
      }

      // Find and update the review
      const review = await Review.findById(reviewId);

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }

      // Update the featured status without requiring a comment
      review.featured = !!featured; // Convert to boolean
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
    console.error("Error toggling review featured status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}