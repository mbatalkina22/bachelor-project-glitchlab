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

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${secularOne.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-[#f5f5f5]">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
