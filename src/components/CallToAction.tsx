"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const CallToAction = () => {
  const router = useRouter();
  const t = useTranslations('CallToAction');

  return (
    <div className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('title')}</h2>
          <p className="text-xl mb-8 opacity-90">{t('description')}</p>
          <button onClick={() => router.push('/workshops')} className="bg-white text-black hover:bg-transparent hover:text-white hover:border hover:border-white py-3 px-8 rounded-full text-lg font-medium transition-colors">
            {t('button')}
          </button>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CallToAction; 