// app/[locale]/layout.tsx
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getMessages } from "next-intl/server";
import { Secular_One } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import "../../styles/globals.css";

const secularOne = Secular_One({
  weight: "400",
  variable: "--font-secular-one",
  display: 'swap',
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // Await the params object before accessing it
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale || 'en';
  
  try {
    const t = await getTranslations({ locale, namespace: 'Hero' });
    return {
      title: t('title'),
      description: t('subtitle'),
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch (error) {
    // Fallback to hardcoded values
    return {
      title: locale === 'en' ? 'Glitch Lab' : 'Workshop Manager',
      description: locale === 'en' 
        ? 'Empowering learning through interactive workshops and hands-on experiences.'
        : 'Organizza e gestisci i tuoi workshop con facilità',
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Await the params object before destructuring it
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale || 'en';
  
  // Attempt to load messages with better error handling
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    // Try to load fallback messages
    try {
      messages = await getMessages({ locale: 'en' });
    } catch (fallbackError) {
      // Provide minimal empty messages to prevent crashes
      messages = {};
    }
  }

  return (
    <html lang={locale}>
      <body className={`${secularOne.variable} font-sans`}>
        <NextIntlClientProvider 
          locale={locale} 
          messages={messages} 
          timeZone="Europe/Rome"
          now={new Date()}
          key={`intl-provider-${locale}`}
        >
          <AuthProvider>
            <NotificationProvider>
              <Navbar />
              <main className="min-h-screen bg-[#f5f5f5]">
                {children}
              </main>
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
