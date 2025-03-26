"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

interface TestimonialCardProps {
  name: string;
  quote: string;
  rating: number;
  avatarSrc: string;
  delay: string;
}

const TestimonialCard = ({ name, quote, rating, avatarSrc, delay }: TestimonialCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image 
            src={avatarSrc} 
            alt={`${name} avatar`} 
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/100?text=Avatar";
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold text-black">{name}</h4>
        </div>
      </div>
      <p className="text-gray-600 italic">{quote}</p>
      <div className="flex mt-4 text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Icon 
            key={i}
            icon={i < rating ? "heroicons:star-solid" : "heroicons:star-outline"} 
            className="w-5 h-5" 
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCard; 