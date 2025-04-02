"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import ScrollReveal from '@/components/ScrollReveal';
import WorkshopCard from '@/components/WorkshopCard';
import TestimonialCard from '@/components/TestimonialCard';
import ReviewList, { Review } from '@/components/ReviewList';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import HeroButton from '@/components/HeroButton';

interface WorkshopReview {
  name: string;
  comment?: string;
  circleColor: string;
  circleFont: string;
  circleText: string;
  date?: string;
}

const WorkshopDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('WorkshopDetail');
  const [isRegistered, setIsRegistered] = useState(false);

  // This would come from an API in a real application
  const workshop = {
    id: id,
    title: "UX Design Fundamentals",
    description: "Learn the basics of user experience design in this hands-on workshop. You'll discover essential UX principles and how to apply them to your projects. This workshop is designed for beginners who want to understand the fundamentals of UX design and start implementing these principles in their work. We'll cover user research, information architecture, wireframing, prototyping, and usability testing.",
    longDescription: "This comprehensive UX Design workshop is perfect for beginners and those looking to refresh their skills. Over the course of the session, we'll dive deep into the principles that make for exceptional user experiences.\n\nYou'll learn how to conduct effective user research, create user personas, develop information architecture, design intuitive navigation systems, create wireframes and prototypes, and conduct usability testing. All of these skills are essential for creating digital products that users love.\n\nThis workshop balances theory with hands-on practice. You'll work on real-world examples and leave with practical skills you can immediately apply to your projects. Whether you're a designer looking to expand your skillset, a developer wanting to better understand UX, or a product manager aiming to create more user-centered products, this workshop will provide valuable insights and techniques.",
    date: "June 15, 2023",
    time: "2:00 PM - 5:00 PM",
    location: "Main Campus, Building A, Room 101",
    imageSrc: "/images/workshop.jpg",
    categories: ["design", "beginner", "hands-on"],
    registeredCount: 24,
    capacity: 30,
    requiredLevel: "Beginner",
    earnableBadge: "UX Fundamentals Badge",
    instructorName: "Sarah Johnson",
    instructorRole: "Senior UX Designer",
    instructorBio: "Sarah has over 10 years of experience in UX design and has worked with major tech companies. She specializes in user research and information architecture.",
    instructorAvatar: "/images/avatar.jpg"
  };

  // Sample reviews
  const reviews: WorkshopReview[] = [
    { 
      name: "Michael Chen", 
      circleColor: "#383838",
      circleFont: "Arial",
      circleText: "Amazing!",
      comment: "This workshop completely changed how I think about user interfaces. The hands-on approach was super helpful!",
      date: "2 days ago"
    },
    { 
      name: "Emily Rodriguez", 
      circleColor: "#7471f9",
      circleFont: "Georgia",
      circleText: "Great!",
      comment: "Sarah is an excellent instructor. The workshop was well-organized and packed with useful information.",
      date: "1 week ago"
    },
    { 
      name: "David Kim", 
      circleColor: "#fdcb2a",
      circleFont: "Verdana",
      circleText: "Perfect",
      comment: "Great introduction to UX principles. I'd recommend this to anyone looking to understand the basics.",
      date: "2 weeks ago"
    }
  ];

  // Similar workshops
  const similarWorkshops = [
    {
      id: "2",
      title: "Advanced UX Research Methods",
      description: "Take your UX research skills to the next level with advanced methods and techniques for gathering user insights.",
      date: "July 10, 2023",
      time: "1:00 PM - 4:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100",
      bgColor: "#7471f9"
    },
    {
      id: "3",
      title: "UI Design for UX Designers",
      description: "Learn how to complement your UX skills with UI design principles for creating visually appealing interfaces.",
      date: "July 18, 2023",
      time: "10:00 AM - 2:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-200",
      headingColor: "#f39aec"
    },
    {
      id: "4",
      title: "Prototyping with Figma",
      description: "Master the art of creating interactive prototypes using Figma to communicate your design ideas effectively.",
      date: "August 5, 2023",
      time: "9:00 AM - 12:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-300",
      buttonColor: "#fdcb2a"
    }
  ];

  // Past workshops (would be filtered by date in a real app)
  const pastWorkshops = [
    {
      id: "5",
      title: "Introduction to Design Thinking",
      description: "Learn the design thinking process and how to apply it to solve complex problems creatively.",
      date: "May 22, 2023",
      time: "2:00 PM - 5:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100",
      bgColor: "#5dfdcf"
    }
  ];

  const handleRegister = () => {
    setIsRegistered(true);
    // In a real app, you would call an API to register the user
  };

  const handleUnregister = () => {
    setIsRegistered(false);
    // In a real app, you would call an API to unregister the user
  };

  // Reference for the register button section
  const registerSectionRef = React.useRef<HTMLButtonElement>(null);

  // Function to scroll to registration section
  const scrollToRegister = () => {
    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Icon icon="heroicons:home" className="w-4 h-4 mr-2" />
                  {t('home')}
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-gray-400" />
                  <Link href="/workshops" className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-900 md:ml-2">
                    {t('workshops')}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 line-clamp-1">
                    {workshop.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Workshop Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="md:flex">
            {/* Workshop Image */}
            <div className="md:w-1/3 relative h-64 md:h-auto">
              <Image 
                src={workshop.imageSrc} 
                alt={workshop.title} 
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/400x200?text=Workshop+Image";
                }}
              />
            </div>
            
            {/* Workshop Info */}
            <div className="md:w-2/3 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {workshop.categories.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                    {category}
                  </span>
                ))}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">{workshop.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  <Icon icon="heroicons:calendar" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">{workshop.date}</span>
                </div>
                <div className="flex items-center mr-6">
                  <Icon icon="heroicons:clock" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">{workshop.time}</span>
                </div>
                <div className="flex items-center">
                  <Icon icon="heroicons:map-pin" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">{workshop.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Icon icon="heroicons:users" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {workshop.registeredCount}/{workshop.capacity} {t('registered')}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Icon icon="heroicons:academic-cap" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {t('requiredLevel')}: {workshop.requiredLevel}
                  </span>
                </div>
              </div>

              {isRegistered ? (
                <HeroButton 
                  text={t('unregister')}
                  onClick={handleUnregister}
                  backgroundColor="#FF0000"
                  textColor="white"
                  className="w-full md:w-auto"
                />
              ) : (
                <HeroButton 
                  text={t('register')}
                  onClick={handleRegister}
                  backgroundColor="#4f46e5"
                  textColor="white"
                  className="w-full md:w-auto"
                  ref={registerSectionRef}
                />
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-black">{t('description')}</h2>
            <p className="text-gray-700 whitespace-pre-line">{workshop.longDescription}</p>
          </div>
          
          {/* Badge Section */}
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <ScrollReveal>
              <h2 className="text-xl font-semibold mb-4 text-black">{t('earnableBadge')}</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32 transform hover:scale-110 transition-transform duration-300 hover:rotate-3">
                  <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl bg-white">
                    <div className="absolute inset-0 bg-indigo-100 animate-pulse opacity-30"></div>
                    <Image 
                      src="/images/badge.png" 
                      alt="Workshop Badge" 
                      fill
                      className="object-cover p-1 relative z-10 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/200?text=Badge";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded-full shadow-md">
                    NEW
                  </div>
                </div>
                <div className="text-center md:text-left max-w-lg">
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">{workshop.earnableBadge}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('badgeDescription')}
                  </p>
                  <HeroButton 
                    text={t('unlockBadge')}
                    onClick={scrollToRegister}
                    backgroundColor="white"
                    textColor="#4f46e5"
                    className="text-sm shadow-sm border border-indigo-100 hover:bg-gray-50"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Instructor */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-black">{t('instructor')}</h2>
            <div className="flex items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image 
                  src={workshop.instructorAvatar} 
                  alt={workshop.instructorName} 
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/100?text=Avatar";
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-black">{workshop.instructorName}</h3>
                <p className="text-gray-500">{workshop.instructorRole}</p>
                <p className="text-gray-700 mt-2">{workshop.instructorBio}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Workshops */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-black">{t('similarWorkshops')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarWorkshops.map((workshop, index) => (
              <ScrollReveal key={index} className={workshop.delay}>
                <WorkshopCard {...workshop} />
              </ScrollReveal>
            ))}
          </div>
        </div>
        
        {/* Past Workshops */}
        {pastWorkshops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-black">{t('pastWorkshops')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastWorkshops.map((workshop, index) => (
                <ScrollReveal key={index} className={workshop.delay}>
                  <WorkshopCard {...workshop} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Section - Using ReviewList component */}
        <div className="mb-12">
          <ReviewList reviews={reviews as Review[]} />
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
