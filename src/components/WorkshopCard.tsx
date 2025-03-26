"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";
import HeroButton from "./HeroButton";

interface WorkshopCardProps {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  imageSrc: string;
  delay: string;
  bgColor?: string;
  headingColor?: string;
  buttonColor?: string;
}

const WorkshopCard = ({ 
  id = "1", 
  title, 
  description, 
  date, 
  time, 
  imageSrc, 
  delay, 
  bgColor = "#ffffff",
  headingColor,
  buttonColor
}: WorkshopCardProps) => {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className={`rounded-lg overflow-hidden shadow-md h-full flex flex-col`} style={{ backgroundColor: bgColor }}>
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
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1" style={{ color: 'black' }}>{title}</h3>
        <p className="text-gray-600 mb-4 h-24 overflow-hidden line-clamp-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
          <span>{date}</span>
          <Icon icon="heroicons:clock" className="w-4 h-4 ml-4 mr-1" />
          <span>{time}</span>
        </div>
        <div className="mt-auto">
          <HeroButton 
            text="Learn More"
            href={`/${locale}/workshops/${id}`}
            backgroundColor="white"
            textColor="black"
            hoverBackgroundColor="transparent"
            hoverTextColor={buttonColor || "black"}
            hoverBorderColor={buttonColor || "black"}
            padding="py-2 px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard; 