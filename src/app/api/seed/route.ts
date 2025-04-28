import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';

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
        date: "June 15, 2023",
        time: "2:00 PM - 5:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/ux-badge.png",
        categories: ["design", "beginner"],
        level: "Beginner",
        location: "Online",
        instructor: "Sarah Johnson"
      },
      {
        name: "Advanced JavaScript Patterns",
        description: "Dive deep into advanced JavaScript patterns and techniques. Perfect for developers looking to enhance their JS skills.",
        date: "June 22, 2023",
        time: "10:00 AM - 3:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/js-badge.png",
        categories: ["coding", "advanced"],
        level: "Advanced",
        location: "San Francisco",
        instructor: "Michael Chen"
      },
      {
        name: "Data Visualization with D3.js",
        description: "Create stunning data visualizations using the D3.js library. Learn how to transform your data into interactive and insightful visualizations.",
        date: "July 5, 2023",
        time: "1:00 PM - 4:30 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/d3-badge.png",
        categories: ["coding", "data"],
        level: "Intermediate",
        location: "New York",
        instructor: "Emily Rodriguez"
      },
      {
        name: "React Performance Optimization",
        description: "Learn techniques to optimize your React applications for better performance. Discover common bottlenecks and how to resolve them.",
        date: "July 12, 2023",
        time: "9:00 AM - 12:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/react-badge.png",
        categories: ["coding", "optimization"],
        level: "Intermediate",
        location: "Online",
        instructor: "David Kim"
      },
      {
        name: "Introduction to Machine Learning",
        description: "Get started with machine learning concepts and practical applications. This workshop covers the basics of ML algorithms and implementation.",
        date: "July 18, 2023",
        time: "1:00 PM - 5:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/ml-badge.png",
        categories: ["data", "ai"],
        level: "Beginner",
        location: "Boston",
        instructor: "Jessica Martinez"
      },
      {
        name: "Responsive Web Design",
        description: "Create websites that look great on any device using modern CSS techniques. Learn about flexbox, grid, and responsive design principles.",
        date: "July 25, 2023",
        time: "10:00 AM - 2:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/css-badge.png",
        categories: ["design", "web"],
        level: "Beginner",
        location: "Online",
        instructor: "Robert Wilson"
      },
      {
        name: "User Research Methods",
        description: "Master essential user research methods to inform your product decisions. Learn how to conduct interviews, surveys, and usability tests.",
        date: "August 2, 2023",
        time: "1:00 PM - 4:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/research-badge.png",
        categories: ["design", "research"],
        level: "Intermediate",
        location: "Seattle",
        instructor: "Amanda Thompson"
      },
      {
        name: "Advanced CSS Animations",
        description: "Take your web animations to the next level with advanced CSS techniques. Create engaging interactions without JavaScript.",
        date: "August 8, 2023",
        time: "9:00 AM - 12:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/animation-badge.png",
        categories: ["design", "animation"],
        level: "Advanced",
        location: "Online",
        instructor: "Chris Lee"
      },
      {
        name: "Testing for Frontend Developers",
        description: "Learn how to write effective tests for your frontend applications. Cover unit, integration, and end-to-end testing strategies.",
        date: "August 15, 2023",
        time: "10:00 AM - 3:00 PM",
        imageSrc: "/images/workshop.jpg",
        badgeImageSrc: "/images/badges/testing-badge.png",
        categories: ["testing", "coding"],
        level: "Intermediate",
        location: "Chicago",
        instructor: "Lisa Parker"
      }
    ];

    await Workshop.insertMany(sampleWorkshops);

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
} 