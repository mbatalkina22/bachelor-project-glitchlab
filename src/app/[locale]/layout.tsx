// app/[locale]/layout.tsx
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getMessages } from "next-intl/server";
import { Secular_One } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  const locale = resolvedParams.locale;
  
  const t = await getTranslations({ locale, namespace: 'Hero' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}


export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Await the params object before accessing it
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${secularOne.variable} scroll-smooth`}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
