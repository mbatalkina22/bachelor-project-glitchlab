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
  const aboutT = useTranslations('About');
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
          <HeroButton text={heroT('exploreButton')} />
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 px-4 md:px-8 bg-gradient-to-b">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-secularone bg-gradient-to-r from-blue-600 via-[#7471f9] to-purple-600 bg-clip-text text-transparent">
                  {aboutT('title')}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                  {aboutT('description')}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-[#7471f9]/20 via-[#6366f1]/15 to-[#5c59e8]/20 blur-xl rounded-2xl"></div>
                <div className="relative">
                  <Image
                    src="/images/main2.jpg"
                    alt="GlitchLab Workshop"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-xl w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal className="delay-100">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:cog-6-tooth" className="w-8 h-8 text-[#7471f9] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('howItWorks.title')}</h3>
              </div>
              <p className="text-gray-600">{servicesT('howItWorks.description')}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal className="delay-200">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:light-bulb" className="w-8 h-8 text-[#fdcb2a] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('themes.title')}</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                {servicesT.raw('themes.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#7471f9] mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          
          <ScrollReveal className="delay-300">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex items-center mb-4">
                <Icon icon="heroicons:heart" className="w-8 h-8 text-[#f39aec] mr-3" />
                <h3 className="text-xl font-secularone text-black">{servicesT('whyParticipate.title')}</h3>
              </div>
              <p className="text-gray-600">{servicesT('whyParticipate.description')}</p>
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
