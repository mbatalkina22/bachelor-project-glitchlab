"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface WorkshopCardProps {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  imageSrc: string;
  delay: string;
}

const WorkshopCard = ({ id = "1", title, description, date, time, imageSrc, delay }: WorkshopCardProps) => {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col">
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
        <h3 className="text-xl font-semibold mb-2 text-black line-clamp-1">{title}</h3>
        <p className="text-gray-600 mb-4 h-24 overflow-hidden line-clamp-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
          <span>{date}</span>
          <Icon icon="heroicons:clock" className="w-4 h-4 ml-4 mr-1" />
          <span>{time}</span>
        </div>
        <div className="mt-auto">
          <Link href={`/${locale}/workshops/${id}`} className="inline-block">
            <button className="bg-black hover:bg-transparent hover:text-black hover:border hover:border-black text-white py-2 px-4 rounded-full transition-colors">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard; 