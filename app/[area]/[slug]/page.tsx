import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InstanteContent from './InstanteContent';
import { getAreaInfo } from '@/lib/firestore';
import { adminDb } from '@/lib/firebase-admin';

interface PageProps {
  params: {
    area: string;
    slug: string;
  };
}

// Generar metadata estática para SEO y Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { area, slug } = params;

  try {
    // Buscar el instante en el servidor usando Admin SDK
    const snapshot = await adminDb
      .collection('instantes')
      .where('area', '==', area)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        title: 'Instante no encontrado - Diario de un Instante',
      };
    }

    const doc = snapshot.docs[0];
    const instante = {
      id: doc.id,
      ...doc.data(),
    } as any;

    const areaInfo = getAreaInfo(area);
    const baseUrl = 'https://www.diariodeuninstante.com';
    const ogImageUrl = `${baseUrl}/api/og/instante/${doc.id}`;
    const title = instante.titulo;
    const description = instante.content
      .replace(/[#*`\[\]]/g, '')
      .substring(0, 150) + '...';

    return {
      title: `${title} | ${areaInfo?.nombre || ''} - Diario de un Instante`,
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
        type: 'article',
        url: `${baseUrl}/${area}/${slug}`,
        siteName: 'Diario de un Instante',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error en generateMetadata:', error);
    return {
      title: 'Diario de un Instante',
    };
  }
}

export default function InstantePage({ params }: PageProps) {
  const areaInfo = getAreaInfo(params.area);

  if (!areaInfo) {
    notFound();
  }

  return <InstanteContent areaId={params.area} slug={params.slug} />;
}
