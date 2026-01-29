import { notFound } from 'next/navigation';
import { getInstantesByTag, getAllTags } from '@/lib/firestore';
import InstanteCard from '@/components/InstanteCard';

interface PageProps {
  params: { tag: string };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const tag = decodeURIComponent(params.tag);

  return {
    title: `#${tag} - Diario de un Instante`,
    description: `Instantes etiquetados con "${tag}"`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const tag = decodeURIComponent(params.tag);
  const instantes = await getInstantesByTag(tag);

  if (instantes.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            #{tag}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {instantes.length} {instantes.length === 1 ? 'instante encontrado' : 'instantes encontrados'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instantes.map((instante) => (
            <InstanteCard key={instante.id} instante={instante} />
          ))}
        </div>
      </div>
    </div>
  );
}
