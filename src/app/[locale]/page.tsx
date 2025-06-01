"use client";

import Image from "next/image";
import HeroButton from "@/components/HeroButton";
import ScrollReveal from "@/components/ScrollReveal";
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import FeaturedWorkshops from "@/components/FeaturedWorkshops";
import FeaturedReviews from "@/components/FeaturedReviews";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  const heroT = useTranslations('Hero');
  const servicesT = useTranslations('Services');
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-screen w-full">
        <Image
          src="/images/main_banner.png"
          alt="Placeholder image"
          width={1200}
          height={800}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center font-secularone">{heroT('title')}</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-center">{heroT('subtitle')}</p>
          <HeroButton text={heroT('exploreButton')} />
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl mb-12 text-center text-black font-secularone">{servicesT('title')}</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal className="delay-100">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:calendar" className="w-8 h-8 text-[#5dfdcf] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('workshopSchedule.title')}</h3>
              </div>
              <p className="text-gray-600">{servicesT('workshopSchedule.description')}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal className="delay-200">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:user-group" className="w-8 h-8 text-[#fdcb2a] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('participantEngagement.title')}</h3>
              </div>
              <p className="text-gray-600">{servicesT('participantEngagement.description')}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal className="delay-300">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:academic-cap" className="w-8 h-8 text-[#f39aec] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('diverseLearningPaths.title')}</h3>
              </div>
              <p className="text-gray-600">{servicesT('diverseLearningPaths.description')}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Featured Workshops Section */}
      <FeaturedWorkshops />

      {/* Reviews Section */}
      <FeaturedReviews />

      {/* FAQ Section */}
      <FAQ />

      {/* Call to Action */}
      <CallToAction />
      
    </div>
  );
}
