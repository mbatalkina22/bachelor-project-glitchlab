"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Image from "next/image";
import { useAuth } from '@/context/AuthContext';
import HeroButton from "./HeroButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.user-avatar')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const changeLanguage = (newLocale: string) => {
    // Get the current path without the locale prefix
    const currentPath = pathname.replace(/^\/[^\/]+/, '');
    
    // Navigate to the same page but with a different locale
    router.push(`/${newLocale}${currentPath || '/'}`);
    
    // Force a page refresh to ensure translations are applied
    window.location.href = `/${newLocale}${currentPath || '/'}`;
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-row items-center justify-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 mr-4 rounded-full overflow-hidden">
                <img src="/images/logo.png" alt="Glitch Lab Logo" className="w-full h-full object-cover" />
              </div>
              <span className={`text-xl font-secularone font-bold ${isScrolled ? 'text-gray-800' : 'text-white'}`}>Glitch Lab</span>
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
            
            {/* Authentication buttons or User Avatar */}
            {!loading && (
              <div className="relative ml-3">
                {user ? (
                  <>
                    <button 
                      className="user-avatar flex text-sm rounded-full focus:outline-none"
                      onClick={toggleUserMenu}
                      aria-expanded={isUserMenuOpen ? 'true' : 'false'}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                          src={user.avatar}
                          alt="User avatar"
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/32?text=User";
                          }}
                        />
                      </div>
                    </button>
                    
                    {/* User dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="user-menu origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <div className="px-4 py-2 border-b">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link 
                            href={`/${locale}/profile`} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('yourProfile')}
                          </Link>
                          <Link 
                            href={`/${locale}/profile/settings`} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('settings')}
                          </Link>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                            onClick={handleLogout}
                          >
                            {t('signOut')}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex space-x-2">
                   <HeroButton
                    href={`/${locale}/login`}
                    text={t('login')}
                    backgroundColor={isScrolled ? "transparent" : "white"}
                    textColor="#7471f9"
                    className={`${isScrolled ? "border border-[#7471f9]" : "border-none"} text-sm`}
                  />
                  <HeroButton
                    href={`/${locale}/register`}
                    text={t('register')}
                    backgroundColor="#7471f9"
                    textColor="white"
                    className={`${isScrolled ? "border border-[#7471f9]" : "border-none"} text-sm`}
                  />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* User avatar or auth buttons for mobile */}
            {!loading && (
              user ? (
                <button
                  className="mr-2 flex text-sm rounded-full focus:outline-none"
                  onClick={() => router.push(`/${locale}/profile`)}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={user.avatar}
                      alt="User avatar"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/32?text=User";
                      }}
                    />
                  </div>
                </button>
              ) : (
                <div className="flex space-x-2 mr-2">
                  <HeroButton
                    href={`/${locale}/login`}
                    text={t('login')}
                    backgroundColor={isScrolled ? "transparent" : "white"}
                    textColor="#7471f9"
                    className={`${isScrolled ? "border border-[#7471f9]" : "border-none"} text-xs`}
                  />
                  <HeroButton
                    href={`/${locale}/register`}
                    text={t('register')}
                    backgroundColor="#7471f9"
                    textColor="white"
                    className={`${isScrolled ? "border border-[#7471f9]" : "border-none"} text-xs`}
                  />
                </div>
              )
            )}
            
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden ${isScrolled ? 'bg-white' : 'bg-black/40'}`}>
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
          {user && (
            <>
              <Link href={`/${locale}/profile`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
                {t('profile')}
              </Link>
              <Link href={`/${locale}/profile/settings`} className={`block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
                {t('settings')}
              </Link>
              <button
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
                onClick={handleLogout}
              >
                {t('signOut')}
              </button>
            </>
          )}
          
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
