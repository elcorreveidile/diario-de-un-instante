import { Metadata } from 'next';
import HomeContent from './HomeContent';

// Generar metadata para la home
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = 'https://www.diariodeuninstante.com';
  const ogImageUrl = `${baseUrl}/api/og/home`;
  const title = 'Diario de un Instante';
  const description = 'Un jardín digital para cultivar un año 2026 más consciente y con propósito. Capturando pensamientos y acciones, un instante a la vez.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      url: baseUrl,
      siteName: 'Diario de un Instante',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      'fb:app_id': '708534115647880',
    },
  };
}

export default function HomePage() {
  return <HomeContent />;
}
