import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diario de un Instante',
  description: 'Un jardín digital para cultivar un año más consciente y con propósito, un instante a la vez.',
  keywords: ['diario', 'personal', 'reflexión', 'productividad', 'mindfulness'],
  authors: [{ name: 'Diario de un Instante' }],
  openGraph: {
    title: 'Diario de un Instante',
    description: 'Un jardín digital para cultivar un año más consciente y con propósito.',
    type: 'website',
    locale: 'es_ES',
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
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
