import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(props: {
  params: { locale: string }
}): Promise<Metadata> {
  // Ensure locale has a value, default to 'en'
  const locale = props.params?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'Hero' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function RootLayout(props: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Ensure locale has a value, default to 'en'
  const locale = props.params?.locale || 'en';
  
  let messages; // Declare messages variable

  try {
    messages = (await import(`../messages/${locale}.json`)).default; // Load messages based on locale
  } catch (error) {
    console.error(`Error loading messages for locale "${locale}":`, error);
    // Fallback to English if there's an error
    messages = (await import(`../messages/en.json`)).default;
  }

  return (
    <html lang={locale} className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              {props.children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
