import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();

    // Check if workshops already exist
    const count = await Workshop.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded' }, { status: 200 });
    }
    // Sample workshop data
    const sampleWorkshops = [
      {
        name: "UX Design Fundamentals",
        description: "Learn the basics of user experience design in this hands-on workshop. You'll discover essential UX principles and how to apply them to your projects.",
        startDate: new Date("2025-05-15T15:00:00"),
        endDate: new Date("2025-05-15T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["design", "beginner"],
        level: "Beginner",
        location: "Online",
        instructor: "Sarah Johnson",
   
      },
      {
        name: "Advanced JavaScript Patterns",
        description: "Dive deep into advanced JavaScript patterns and best practices. Learn about design patterns, closures, and modern JavaScript features.",
        startDate: new Date("2025-05-22T10:00:00"),
        endDate: new Date("2025-05-22T15:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["coding", "advanced"],
        level: "Advanced",
        location: "San Francisco",
        instructor: "Michael Chen",
        capacity: 3,
     
      },
      {
        name: "Data Visualization with D3.js",
        description: "Create stunning data visualizations using the D3.js library. Learn how to transform your data into interactive and insightful visualizations.",
        startDate: new Date("2025-05-11T13:00:00"),
        endDate: new Date("2025-05-11T16:30:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["coding", "data"],
        level: "Intermediate",
        location: "New York",
        instructor: "Emily Rodriguez",
        
      },
      {
        name: "React Performance Optimization",
        description: "Learn techniques to optimize your React applications for better performance. Discover common bottlenecks and how to resolve them.",
        startDate: new Date("2025-05-12T09:00:00"),
        endDate: new Date("2025-05-12T12:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["coding", "optimization"],
        level: "Intermediate",
        location: "Online",
        instructor: "David Kim",
        
      },
      {
        name: "Introduction to Machine Learning",
        description: "Get started with machine learning concepts and practical applications. This workshop covers the basics of ML algorithms and implementation.",
        startDate: new Date("2025-05-18T13:00:00"),
        endDate: new Date("2025-05-18T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["data", "ai"],
        level: "Beginner",
        location: "Boston",
        instructor: "Jessica Martinez",
        
      },
      {
        name: "Responsive Web Design",
        description: "Create websites that look great on any device using modern CSS techniques. Learn about flexbox, grid, and responsive design principles.",
        startDate: new Date("2025-05-25T10:00:00"),
        endDate: new Date("2025-05-25T14:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["design", "web"],
        level: "Beginner",
        location: "Online",
        instructor: "Robert Wilson",
       
      },
      {
        name: "User Research Methods",
        description: "Master essential user research methods to inform your product decisions. Learn how to conduct interviews, surveys, and usability tests.",
        startDate: new Date("2025-05-02T13:00:00"),
        endDate: new Date("2025-05-02T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["design", "research"],
        level: "Intermediate",
        location: "Seattle",
        instructor: "Amanda Thompson",
      
      },
      {
        name: "Advanced CSS Animations",
        description: "Take your web animations to the next level with advanced CSS techniques. Create engaging interactions without JavaScript.",
        startDate: new Date("2025-05-08T18:00:00"),
        endDate: new Date("2025-05-08T18:02:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["design", "animation"],
        level: "Advanced",
        location: "Online",
        instructor: "Chris Lee",
      
      },
      {
        name: "Testing for Frontend Developers",
        description: "Learn how to write effective tests for your frontend applications. Cover unit, integration, and end-to-end testing strategies.",
        startDate: new Date("2025-05-15T10:00:00"),
        endDate: new Date("2025-05-15T15:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["testing", "coding"],
        level: "Intermediate",
        location: "Chicago",
        instructor: "Lisa Parker",
     
      },
      {
        name: "Advanced React State Management",
        description: "Learn how to write effective tests for your frontend applications. Cover unit, integration, and end-to-end testing strategies.",
        startDate: new Date("2025-05-06T12:00:00"),
        endDate: new Date("2025-05-06T15:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["react", "state"],
        level: "Intermediate",
        location: "Chicago",
        instructor: "Lisa Parker",
       
      },
      {
        name: "Testing for Frontend Developers",
        description: "Learn how to test your frontend applications. Cover unit, integration, and end-to-end testing strategies.",
        startDate: new Date("2025-05-10T20:00:00"),
        endDate: new Date("2025-05-10T21:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badge.png",
        categories: ["testing", "16+", "coding"],
        level: "Intermediate",
        location: "Chicago",
        instructor: "Lisa Parker",
       
      }
    ];

    // Create workshops with the new schema
    await Workshop.insertMany(sampleWorkshops);

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 });
  }
} 