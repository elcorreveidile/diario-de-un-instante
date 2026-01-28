import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import FloatingButton from '@/components/FloatingButton';
import GlobalHotkeys from '@/components/GlobalHotkeys';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diario de un Instante',
  description: 'Un jardín digital para cultivar un año más consciente y con propósito, un instante a la vez.',
  keywords: ['diario', 'personal', 'reflexión', 'productividad', 'mindfulness'],
  authors: [{ name: 'Diario de un Instante' }],
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Diario de un Instante',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'Diario de un Instante',
    description: 'Un jardín digital para cultivar un año más consciente y con propósito.',
    type: 'website',
    locale: 'es_ES',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          title: 'RSS Global',
          url: 'https://www.diariodeuninstante.com/rss',
        },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Script
          id="fb-app-id"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: '<meta property="fb:app_id" content="708534115647880" />',
          }}
        />
        <Providers>
          <GlobalHotkeys />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingButton />
        </Providers>
      </body>
    </html>
  );
}
