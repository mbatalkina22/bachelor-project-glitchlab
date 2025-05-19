import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';
import User from '../lib/models/user';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();

    // Check if workshops already exist
    const count = await Workshop.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded' }, { status: 200 });
    }

    // Find instructors in the database
    const instructors = await User.find({ role: 'instructor' });
    
    if (instructors.length === 0) {
      return NextResponse.json({ 
        error: 'No instructors found in the database. Please add instructors first.' 
      }, { status: 400 });
    }

    // Log found instructors for debugging
    console.log(`Found ${instructors.length} instructors in the database`);
    
    // Sample workshop data - using instructorId instead of instructor string
    const sampleWorkshops = [
      {
        name: "Web Development Bootcamp",
        description: "An intensive workshop covering HTML, CSS, and JavaScript fundamentals. Build responsive websites from scratch and deploy them to the web.",
        startDate: new Date("2025-06-10T09:00:00"),
        endDate: new Date("2025-06-10T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Web Dev Pro",
        categories: ["coding", "web", "frontend"],
        level: "Beginner",
        location: "Online",
        instructorId: instructors[0]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "UI/UX Design Principles",
        description: "Master the fundamentals of user interface and user experience design. Learn about wireframing, prototyping, and user testing methodologies.",
        startDate: new Date("2025-06-15T10:00:00"),
        endDate: new Date("2025-06-15T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Design Thinker",
        categories: ["design", "ux", "creative"],
        level: "Intermediate",
        location: "San Francisco",
        instructorId: instructors[1 % instructors.length]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Mobile App Development with React Native",
        description: "Build cross-platform mobile applications using React Native. From setup to deployment, learn to create apps that work on both iOS and Android.",
        startDate: new Date("2025-06-20T09:00:00"),
        endDate: new Date("2025-06-20T18:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "App Builder",
        categories: ["coding", "mobile", "react"],
        level: "Advanced",
        location: "New York",
        instructorId: instructors[0]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Data Visualization with D3.js",
        description: "Turn complex data into engaging interactive visualizations using D3.js. Perfect for developers and data analysts looking to enhance their visualization skills.",
        startDate: new Date("2025-06-25T13:00:00"),
        endDate: new Date("2025-06-25T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Data Viz Expert",
        categories: ["data", "visualization", "javascript"],
        level: "Intermediate",
        location: "Online",
        instructorId: instructors[1 % instructors.length]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Introduction to Machine Learning",
        description: "Understand the fundamentals of machine learning algorithms and their applications. Hands-on experience with Python libraries like scikit-learn and TensorFlow.",
        startDate: new Date("2025-07-05T10:00:00"),
        endDate: new Date("2025-07-05T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "ML Explorer",
        categories: ["ai", "data", "python"],
        level: "Beginner",
        location: "Boston",
        instructorId: instructors[0]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "DevOps Essentials",
        description: "Learn the principles of DevOps including CI/CD pipelines, containerization with Docker, and orchestration with Kubernetes.",
        startDate: new Date("2025-07-12T09:00:00"),
        endDate: new Date("2025-07-12T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "DevOps Ninja",
        categories: ["devops", "cloud", "infrastructure"],
        level: "Advanced",
        location: "Seattle",
        instructorId: instructors[1 % instructors.length]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Blockchain Development Fundamentals",
        description: "Discover the world of blockchain technology and smart contracts. Build a simple dApp using Ethereum and Solidity.",
        startDate: new Date("2025-07-18T10:00:00"),
        endDate: new Date("2025-07-18T15:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Blockchain Pioneer",
        categories: ["blockchain", "web3", "coding"],
        level: "Intermediate",
        location: "Online",
        instructorId: instructors[0]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Cybersecurity Best Practices",
        description: "Learn essential security principles to protect applications from common vulnerabilities. Covers OWASP Top 10 and practical defense techniques.",
        startDate: new Date("2025-07-25T09:00:00"),
        endDate: new Date("2025-07-25T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Security Guardian",
        categories: ["security", "hacking", "defense"],
        level: "Advanced",
        location: "Chicago",
        instructorId: instructors[1 % instructors.length]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Game Development with Unity",
        description: "Create interactive 2D and 3D games using Unity. Learn game physics, animations, and C# programming specifically for game development.",
        startDate: new Date("2025-08-02T10:00:00"),
        endDate: new Date("2025-08-02T18:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Game Creator",
        categories: ["game-dev", "unity", "coding"],
        level: "Beginner",
        location: "Los Angeles",
        instructorId: instructors[0]._id,
        capacity: 10,
        registeredCount: 0
      },
      {
        name: "Advanced GraphQL API Development",
        description: "Master building scalable APIs with GraphQL. Learn schema design, resolvers, subscriptions, and integration with various databases.",
        startDate: new Date("2025-08-10T09:00:00"),
        endDate: new Date("2025-08-10T17:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "API Architect",
        categories: ["api", "backend", "graphql"],
        level: "Advanced",
        location: "Online",
        instructorId: instructors[1 % instructors.length]._id,
        capacity: 10,
        registeredCount: 0
      }
    ];

    // Create workshops with the new schema
    await Workshop.insertMany(sampleWorkshops);

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      instructorsUsed: instructors.length 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 });
  }
}