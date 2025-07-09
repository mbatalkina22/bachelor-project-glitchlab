"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-secularone text-gray-900 mb-4">
              {t('companyName')}
            </h3>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-secularone text-gray-900 tracking-wider uppercase">
              {t('quickLinks')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="text-base text-gray-500 hover:text-gray-900">
                  {t('workshops')}
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-base text-gray-500 hover:text-gray-900">
                  {t('calendar')}
                </Link>
              </li>
              <li>
                <Link href="/our-team" className="text-base text-gray-500 hover:text-gray-900">
                  {t('ourTeam')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-secularone text-gray-900 tracking-wider uppercase">
              {t('contact')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="text-base text-gray-500">
                {t('email')}
              </li>
              <li className="text-base text-gray-500">
                {t('phone')}
              </li>
              <li className="text-base text-gray-500">
                {t('address')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 