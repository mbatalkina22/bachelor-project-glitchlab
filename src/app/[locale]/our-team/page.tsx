'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ScrollReveal';
import { Icon } from '@iconify/react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface Instructor {
  _id: string;
  name: string;
  surname?: string;
  description?: string;
  website?: string;
  linkedin?: string;
  avatar?: string;
}

export default function OurTeamPage() {
  const t = useTranslations('OurTeam');
  const tProfile = useTranslations('Profile');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('/api/instructors');
        if (!response.ok) {
          throw new Error('Failed to fetch instructors');
        }
        const data = await response.json();
        setInstructors(data.instructors);
      } catch (err) {
        setError('Failed to load instructors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <ScrollReveal key={instructor._id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                  <div className="relative h-64">
                    <Image
                      src={instructor.avatar || "/images/default-avatar.png"}
                      alt={`${instructor.name} ${instructor.surname || ""}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-avatar.png";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {instructor.name} {instructor.surname || ""}
                    </h3>
                    <p className="text-[#7471f9] font-medium mb-4">{tProfile('instructor')}</p>
                    <p className="text-gray-600 mb-4">
                      {instructor.description || tProfile('notSpecified')}
                    </p>
                    <div className="flex flex-col space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{tProfile('website')}</h4>
                        {instructor.website ? (
                          <a 
                            href={instructor.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#7471f9] hover:text-[#5a57c7] flex items-center"
                          >
                            <Icon icon="heroicons:globe-alt" className="w-5 h-5 mr-2" />
                            {instructor.website}
                          </a>
                        ) : (
                          <p className="text-gray-500 italic flex items-center">
                            <Icon icon="heroicons:globe-alt" className="w-5 h-5 mr-2 text-gray-400" />
                            {tProfile('notProvided')}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{tProfile('linkedinProfile')}</h4>
                        {instructor.linkedin ? (
                          <a 
                            href={instructor.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#7471f9] hover:text-[#5a57c7] flex items-center"
                          >
                            <Icon icon="mdi:linkedin" className="w-5 h-5 mr-2" />
                            {tProfile('linkedinProfile')}
                          </a>
                        ) : (
                          <p className="text-gray-500 italic flex items-center">
                            <Icon icon="mdi:linkedin" className="w-5 h-5 mr-2 text-gray-400" />
                            {tProfile('notProvided')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noInstructors')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
