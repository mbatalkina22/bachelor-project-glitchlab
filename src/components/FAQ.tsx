"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';

const FAQ = () => {
  const t = useTranslations('FAQ');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Get FAQ items from translations
  const faqs = t.raw('items') as Array<{question: string, answer: string}>;

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-secularone mb-12 text-center text-black">{t('title')}</h2>
        </ScrollReveal>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} className={`delay-${index * 100}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-black">{faq.question}</span>
                  <Icon
                    icon={openFaq === index ? "heroicons:chevron-up" : "heroicons:chevron-down"}
                    className="text-black w-5 h-5 transition-transform"
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? "max-h-96 py-4" : "max-h-0 py-0"
                  }`}
                >
                  <p className="text-black whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;