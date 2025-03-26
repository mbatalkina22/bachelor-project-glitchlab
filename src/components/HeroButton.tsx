"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { forwardRef } from "react";

interface HeroButtonProps {
  text?: string;
  href?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  padding?: string;
  onClick?: () => void;
}

const HeroButton = forwardRef<HTMLButtonElement, HeroButtonProps>(({ 
  text,
  href,
  backgroundColor = "white",
  textColor = "black",
  hoverBackgroundColor = "transparent",
  hoverTextColor = "white",
  hoverBorderColor = "white",
  padding = "px-8 py-3",
  onClick 
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
    backgroundColor,
    color: textColor,
    border: '1px solid transparent',
  };

  const buttonClasses = `${padding} rounded-full font-medium transition-colors`;

  // If there's an href and no explicit onClick, use Link component
  if (href && !onClick) {
    return (
      <Link href={href} className="inline-block">
        <button 
          ref={ref}
          className={buttonClasses}
          style={buttonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = hoverBackgroundColor;
            e.currentTarget.style.color = hoverTextColor;
            e.currentTarget.style.borderColor = hoverBorderColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = backgroundColor;
            e.currentTarget.style.color = textColor;
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {text || t('exploreButton')}
        </button>
      </Link>
    );
  }

  // Otherwise use a regular button with onClick
  return (
    <button 
      ref={ref}
      onClick={handleClick}
      className={buttonClasses}
      style={buttonStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = hoverBackgroundColor;
        e.currentTarget.style.color = hoverTextColor;
        e.currentTarget.style.borderColor = hoverBorderColor;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
        e.currentTarget.style.color = textColor;
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {text || t('exploreButton')}
    </button>
  );
});

HeroButton.displayName = 'HeroButton';

export default HeroButton; 