"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { forwardRef } from "react";

interface HeroButtonProps {
  children?: React.ReactNode; 
  text?: string;               
  href?: string; 
  onClick?: () => void;        
  backgroundColor?: string;
  textColor?: string;
  className?: string; // Optional class name for additional styling
}

// Helper function to darken a color for hover state
const getDarkerColor = (color: string) => {
  if (!color) return '';
  
  if (color.startsWith('#')) {
    // Convert hex to RGB and darken
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Darken by reducing each component by 20%
    const darkenFactor = 0.8;
    const newR = Math.floor(r * darkenFactor);
    const newG = Math.floor(g * darkenFactor);
    const newB = Math.floor(b * darkenFactor);
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  // Handle Tailwind color classes
  if (color.includes('-')) {
    const parts = color.split('-');
    // If it has a number after the dash like blue-500, increase the number for darker shade
    if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      const colorName = parts[0];
      const shade = parseInt(parts[1]);
      const darkerShade = Math.min(shade + 200, 900); // Don't go beyond 900
      return `${colorName}-${darkerShade}`;
    }
  }
  
  return color;
};

const HeroButton = forwardRef<HTMLButtonElement, HeroButtonProps>(({ 
  children,
  text,
  href,
  onClick,
  backgroundColor = '#4f46e5', // Default indigo color
  textColor = 'white',
  className = '', // Default empty string for className
}, ref) => {
  const t = useTranslations('Hero');
  const router = useRouter();
  
  const defaultScrollHandler = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      defaultScrollHandler();
    }
  };

  const buttonStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
  };
  
  const hoverStyle = {
    backgroundColor: getDarkerColor(backgroundColor),
  };

  const baseClasses = `
    rounded-full
    font-medium
    transition-all
    duration-200
    transform
    shadow-md
    hover:shadow-lg
    hover:-translate-y-0.5
    active:translate-y-0.5
    active:shadow-sm
    px-6 py-2
    ${className}
  `;

  const buttonContent = children || text || t('exploreButton');

  // If there's an href and no explicit onClick, use Link component
  if (href && !onClick) {
    return (
      <Link href={href} className="inline-block">
        <button 
          ref={ref}
          className={baseClasses}
          style={buttonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          {buttonContent}
        </button>
      </Link>
    );
  }

  // Otherwise use a regular button with onClick
  return (
    <button 
      ref={ref}
      onClick={handleClick}
      className={baseClasses}
      style={buttonStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(1px)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      {buttonContent}
    </button>
  );
});

HeroButton.displayName = 'HeroButton';

export default HeroButton; 