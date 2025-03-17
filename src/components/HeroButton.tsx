"use client";

import { useTranslations } from "next-intl";

interface HeroButtonProps {
  text?: string;
}

const HeroButton = ({ text }: HeroButtonProps) => {
  const t = useTranslations('Hero');
  
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      onClick={handleScroll}
      className="px-8 py-3 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors"
    >
      {text || t('exploreButton')}
    </button>
  );
};

export default HeroButton; 