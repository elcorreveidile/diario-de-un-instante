'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicInstantesByArea, getAreaInfo, Instante } from '@/lib/firestore';
import InstanteCard from '@/components/InstanteCard';

export default function AreaPage() {
  const params = useParams();
  const areaId = params.area as string;

  const [instantes, setInstantes] = useState<Instante[]>([]);
  const [loading, setLoading] = useState(true);

  const areaInfo = getAreaInfo(areaId);

  useEffect(() => {
    const loadInstantes = async () => {
      try {
        const data = await getPublicInstantesByArea(areaId);
        setInstantes(data);
      } catch (error) {
        console.error('Error cargando instantes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInstantes();
  }, [areaId]);

  if (!areaInfo) {
    notFound();
  }

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando instantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white font-medium">{areaInfo.nombre}</li>
        </ol>
      </nav>

      {/* Header del área */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{areaInfo.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {areaInfo.nombre}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {instantes.length} {instantes.length === 1 ? 'instante' : 'instantes'} registrados
            </p>
          </div>
        </div>
      </header>

      {/* Lista de instantes */}
      {instantes.length > 0 ? (
        <section>
          <div className="space-y-4">
            {instantes.map((instante) => (
              <InstanteCard key={instante.id || instante.slug} instante={instante} />
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Aún no hay instantes registrados en esta área.
          </p>
          <Link
            href="/admin/nuevo"
            className="inline-block mt-2 text-gray-900 dark:text-white hover:underline"
          >
            Crear el primer instante
          </Link>
        </section>
      )}
    </div>
  );
}
