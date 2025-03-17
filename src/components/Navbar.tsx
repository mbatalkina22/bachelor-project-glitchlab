"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current page is the main page
  const isMainPage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Only add scroll listener on main page
    if (isMainPage) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
      // Force isScrolled to true on non-main pages
      setIsScrolled(true);
    }
  }, [isMainPage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const changeLanguage = (newLocale: string) => {
    // Get the current path without the locale prefix
    const currentPath = pathname.replace(/^\/[^\/]+/, '');
    
    // Navigate to the same page but with a different locale
    router.push(`/${newLocale}${currentPath || '/'}`);
    
    // Force a page refresh to ensure translations are applied
    window.location.href = `/${newLocale}${currentPath || '/'}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <span className={`text-xl font-bold ${isScrolled ? 'text-gray-800' : 'text-white'}`}>Workshop Manager</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href={`/${locale}`} className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
              {t('home')}
            </Link>
            <Link href={`/${locale}/workshops`} className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
              {t('workshops')}
            </Link>
            <Link href={`/${locale}/calendar`} className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
              {t('calendar')}
            </Link>
            {/* Language switcher */}
            <div className="relative ml-3">
              <button 
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
                onClick={() => changeLanguage(locale === 'en' ? 'it' : 'en')}
              >
                <Icon icon={locale === 'en' ? 'emojione:flag-for-united-kingdom' : 'emojione:flag-for-italy'} className="w-5 h-5 mr-1" />
                <span>{locale === 'en' ? 'EN' : 'IT'}</span>
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'} focus:outline-none`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isMenuOpen ? (
                <Icon 
                  icon="heroicons:bars-3" 
                  className="h-6 w-6" 
                  aria-hidden="true" 
                />
              ) : (
                <Icon 
                  icon="heroicons:x-mark" 
                  className="h-6 w-6" 
                  aria-hidden="true" 
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden ${isScrolled ? 'bg-white' : 'bg-black bg-opacity-70'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href={`/${locale}`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
            {t('home')}
          </Link>
          <Link href={`/${locale}/workshops`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
            {t('workshops')}
          </Link>
          <Link href={`/${locale}/calendar`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
            {t('calendar')}
          </Link>
          <Link href={`/${locale}/about-us`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
            {t('aboutUs')}
          </Link>
          
          {/* Language switcher for mobile */}
          <button 
            className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
            onClick={() => changeLanguage(locale === 'en' ? 'it' : 'en')}
          >
            <Icon icon={locale === 'en' ? 'emojione:flag-for-united-kingdom' : 'emojione:flag-for-italy'} className="w-5 h-5 mr-2" />
            <span>{locale === 'en' ? 'English' : 'Italiano'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
