"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Arvo, Bebas_Neue, Dancing_Script, Lobster } from "next/font/google";

// Initialize the fonts
const dancingScript = Dancing_Script({ subsets: ["latin"] });
const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

interface TestimonialCardProps {
  name: string;
  quote: string;
  rating: number;
  avatarSrc: string;
  delay: string;
  circleColor?: string;
  circleFont?: string;
  circleText?: string;
  workshopId?: string;
  workshopName?: string;
}

const TestimonialCard = ({ 
  name, 
  quote, 
  rating, 
  avatarSrc, 
  delay, 
  circleColor = "#7471f9", 
  circleFont = "Dancing Script", 
  circleText = "Amazing", 
  workshopId,
  workshopName
}: TestimonialCardProps) => {
  const params = useParams();
  const locale = params.locale as string || 'en';

  // Helper to get the font family based on the selection
  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case "Dancing Script":
        return dancingScript.style.fontFamily;
      case "Lobster":
        return lobster.style.fontFamily;
      case "Arvo":
        return arvo.style.fontFamily;
      case "Bebas Neue":
        return bebasNeue.style.fontFamily;
      default:
        return dancingScript.style.fontFamily;
    }
  };

  // Stamp component with direct color application
  const Stamp = ({
    color,
    font,
    text,
  }: {
    color: string;
    font: string;
    text: string;
  }) => {
    return (
      <div className="relative w-24 h-24 mx-auto">
        <div className="relative w-full h-full">
          {/* SVG circle stamp */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 66.73 69.75"
            className="absolute inset-0 w-full h-full"
            style={{ filter: `drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))` }}
            key={color}
          >
            <g id="Layer_2" data-name="Layer 2">
              <g id="Layer_3" data-name="Layer 3">
                <path fill={color} d="M38.54,5.1A30.11,30.11,0,0,1,61.75,24.72h4.87l.06-.44-1.94-2V19.44l-2.22-1.73-.44-2.77-2.45-1.38-.84-2.68-2.63-1L54.92,7.36l-2.75-.59L50.58,4.45l-2.8-.17L45.86,2.22l-2.8.25L40.85.73l-2.73.66L35.68,0,33.07,1.06,30.45,0,28,1.48,25.29.86,23.12,2.64l-2.81-.2L18.43,4.53l-2.8.22L14.07,7.1l-2.73.64-1.19-2.55-2.61-1.18L5.94,6.23,3.71,8,2.47,10.52.26,11.68,0,14.48,1.07,17.1.42,19.71l1.49,2.42L.29,24.73H5.23A30.12,30.12,0,0,1,38.54,5.1Z"/>
                <path fill={color} d="M22.23,6.8,25,4.12,7.38.68A4,4,0,0,0,2.73,5.1l1.1,19.69L5.65,23A30.11,30.11,0,0,1,22.23,6.8Z"/>
                <path fill={color} d="M63.48,4.57A4,4,0,0,0,58.76.24L41.24,4,44,6.61a30.14,30.14,0,0,1,16.86,16l1.84,1.75Z"/>
                <path fill={color} d="M61.68,45A30.11,30.11,0,0,1,5.05,45H.11l-.06.44L2,47.5l0,2.81L4.22,52l.44,2.77,2.45,1.38L8,58.87l2.63,1,1.23,2.53,2.75.59,1.59,2.32,2.8.17,1.92,2.06,2.8-.25L25.88,69l2.73-.66,2.44,1.39,2.6-1.06,2.63,1,2.41-1.43,2.75.62,2.17-1.78,2.81.2,1.88-2.09L51.1,65l1.55-2.35L55.39,62l1.19-2.55,2.61-1.17,1.6-2.23,2.23-1.78,1.24-2.55,2.21-1.15.26-2.8-1.07-2.62.65-2.62-1.49-2.42,1.62-2.61h-4.9Z"/>
                <path fill={color} d="M37.63,10.3a24.87,24.87,0,0,0-27,14.42h2.21a22.83,22.83,0,0,1,41,0h2.22a25.68,25.68,0,0,0-2.4-4.23A24.69,24.69,0,0,0,37.63,10.3Z"/>
                <path fill={color} d="M29.44,57.28A22.8,22.8,0,0,1,13,45H10.74A24.82,24.82,0,0,0,29.1,59.25a25.2,25.2,0,0,0,4.32.37A24.87,24.87,0,0,0,56,45H53.78A22.87,22.87,0,0,1,29.44,57.28Z"/>
                <path fill={color} d="M45.35,51.83a20.84,20.84,0,0,1-29-5.07c-.39-.56-.76-1.14-1.09-1.73H13a22.84,22.84,0,0,0,40.82,0H51.49A20.77,20.77,0,0,1,45.35,51.83Z"/>
                <path fill={color} d="M33.35,13.93a21,21,0,0,1,3.6.31,20.73,20.73,0,0,1,13.47,8.55,21.28,21.28,0,0,1,1.19,1.93h2.26a22.83,22.83,0,0,0-41,0h2.27A20.9,20.9,0,0,1,33.35,13.93Z"/>
                <path fill={color} d="M42.4,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.47.47,0,0,0,.13.53l.91.82,0,1.22a.49.49,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.33-.85l-.91-.81,0-1.22A.48.48,0,0,0,42.4,45.07Z"/>
                <path fill={color} d="M34.22,48.07a.46.46,0,0,0-.54.13l-.82.91-1.22,0a.48.48,0,0,0-.33.84l.92.82,0,1.22a.49.49,0,0,0,.31.46.49.49,0,0,0,.54-.13l.81-.91,1.23,0a.49.49,0,0,0,.33-.85l-.92-.81,0-1.22A.47.47,0,0,0,34.22,48.07Z"/>
                <path fill={color} d="M26,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.45.45,0,0,0,.13.53l.91.82L24,49a.47.47,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.46-.31.5.5,0,0,0-.13-.54l-.91-.81,0-1.22A.48.48,0,0,0,26,45.07Z"/>
                <path fill={color} d="M24.05,24.28a.49.49,0,0,0,.54-.13l.81-.92,1.23,0a.48.48,0,0,0,.33-.84L26,21.59l0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.23,0a.49.49,0,0,0-.33.85l.92.81,0,1.23A.47.47,0,0,0,24.05,24.28Z"/>
                <path fill={color} d="M32.24,21.28a.5.5,0,0,0,.54-.13l.81-.92,1.22,0a.47.47,0,0,0,.46-.3.46.46,0,0,0-.13-.54l-.91-.82,0-1.22a.48.48,0,0,0-.31-.46.5.5,0,0,0-.54.13l-.81.92-1.22,0a.49.49,0,0,0-.46.31.49.49,0,0,0,.13.54l.91.81,0,1.23A.5.5,0,0,0,32.24,21.28Z"/>
                <path fill={color} d="M40.43,24.28a.48.48,0,0,0,.53-.13l.82-.92,1.22,0a.48.48,0,0,0,.46-.3.49.49,0,0,0-.13-.54l-.91-.82,0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.22,0a.48.48,0,0,0-.46.31.47.47,0,0,0,.12.54l.92.81,0,1.23A.48.48,0,0,0,40.43,24.28Z"/>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Text positioned in center */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <span 
            style={{ 
              fontFamily: getFontFamily(font),
              color: color,
              fontSize: '16px',
              textAlign: 'center'
            }}
            className="font-bold px-2"
          >
            {text}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      {/* Review content */}
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <Stamp
            color={circleColor}
            font={circleFont}
            text={circleText}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
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
              <h4 className="font-medium text-gray-900">
                {name}
              </h4>
            </div>
            <div className="flex text-yellow-400">
              {[...Array(rating)].map((_, i) => (
                <Icon 
                  key={i}
                  icon="heroicons:star-solid"
                  className="w-4 h-4" 
                />
              ))}
            </div>
          </div>
          <p className="text-gray-700">{quote}</p>
          
          {workshopId && (
            <div className="flex justify-end mt-3 border-t pt-3">
              <Link 
                href={`/${locale}/workshops/${workshopId}`}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Icon icon="heroicons:eye" className="w-4 h-4 mr-1" />
                {workshopName ? `View "${workshopName}"` : 'View Workshop'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;