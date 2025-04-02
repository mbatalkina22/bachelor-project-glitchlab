"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { useTranslations } from 'next-intl';
import HeroButton from './HeroButton';

const CallToAction = () => {
  const t = useTranslations('CallToAction');

  return (
    <div className="py-20 bg-[#7471f9] text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-secularone mb-6">{t('title')}</h2>
          <p className="text-xl mb-8 opacity-90">{t('description')}</p>
          <HeroButton 
            text={t('button')}
            href="/workshops"
            backgroundColor="white"
            textColor="black"
          />
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CallToAction; 