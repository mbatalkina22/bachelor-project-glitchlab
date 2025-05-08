"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";
import HeroButton from "./HeroButton";
import { getWorkshopStatus, getStatusColor } from '@/utils/workshopStatus';
import { useTranslations } from 'next-intl';

interface WorkshopCardProps {
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  imageSrc: string;
  delay: string;
  bgColor?: string;
  headingColor?: string;
  buttonColor?: string;
  isRegistered?: boolean;
}

const WorkshopCard = ({ 
  id = "1", 
  title, 
  description, 
  startDate, 
  endDate, 
  imageSrc, 
  delay, 
  bgColor = "#ffffff",
  isRegistered = false
}: WorkshopCardProps) => {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('WorkshopDetail');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const status = getWorkshopStatus(startDate, endDate);
  const statusColor = getStatusColor(status);

  return (
    <div className={`rounded-lg overflow-hidden shadow-md h-full flex flex-col relative`} style={{ backgroundColor: bgColor }}>
      {isRegistered && (
        <div className="absolute top-2 right-4 z-10">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center">
            <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
            {t('registered')}
          </span>
        </div>
      )}
      <div className="relative h-48 w-full bg-gray-200">
        <Image 
          src={imageSrc} 
          alt={`${title} workshop`} 
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/400x200?text=Workshop+Image";
          }}
        />
        <div className="absolute top-2 left-4">
          <span className={`${statusColor} text-white px-3 py-1 rounded-full text-sm font-medium capitalize shadow-md`}>
            {status}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-secularone mb-2 line-clamp-1 text-black">{title}</h3>
        <p className="text-gray-600 mb-4 h-24 overflow-hidden line-clamp-4">{description}</p>
        {status !== 'past' && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
            <span>{formatDate(startDate)}</span>
            <Icon icon="heroicons:clock" className="w-4 h-4 ml-4 mr-1" />
            <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
          </div>
        )}
        <div className="mt-auto">
          <HeroButton 
            text="Learn More"
            href={`/${locale}/workshops/${id}`}
            backgroundColor="white"
            textColor="black"
          />
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard; 