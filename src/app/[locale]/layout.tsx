import type { Metadata } from "next";
import { Secular_One } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

const secularOne = Secular_One({
  weight: "400",
  variable: "--font-secular-one",
  subsets: ["latin"],
})


export async function generateMetadata(props: {
  params: { locale: string }
}): Promise<Metadata> {
  // Ensure locale has a value, default to 'en'
  const { locale } = props.params || { locale: 'en' };
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
    <html lang={locale} className={`${secularOne.variable} scroll-smooth`}>
      <body
        className="antialiased"
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
