import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Kanit, Sarabun, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import PDPABanner from '@/components/common/PDPABanner';
import Navbar from '@/components/layout/Navbar';
import Providers from './Providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TNA Medical — Healthcare for All',
  description: 'Trustworthy, clinically-backed medical supplements for your health.',
};

const kanit = Kanit({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  variable: '--font-kanit',
});

const sarabun = Sarabun({
  weight: ['400', '500', '600'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: 'en' | 'th' };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${kanit.variable} ${sarabun.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body text-gray-900 bg-white">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar locale={locale} />
            {children}
            <PDPABanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
