'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAllInstantes, Instante } from '@/lib/firestore';
import InstanteCard from '@/components/InstanteCard';

export default function ArchivoPage() {
  const [instantes, setInstantes] = useState<Instante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstantes = async () => {
      try {
        const data = await getAllInstantes();
        setInstantes(data);
      } catch (error) {
        console.error('Error cargando instantes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInstantes();
  }, []);

  // Agrupar por mes para mejor organización
  const instantesPorMes = instantes.reduce((acc, instante) => {
    const mes = format(new Date(instante.fecha), 'MMMM yyyy', { locale: es });
    if (!acc[mes]) {
      acc[mes] = [];
    }
    acc[mes].push(instante);
    return acc;
  }, {} as Record<string, typeof instantes>);

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando archivo...</p>
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
          <li className="text-gray-900 dark:text-white font-medium">Archivo</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Archivo
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Todos los instantes ordenados cronológicamente.
          {instantes.length > 0 && (
            <span className="ml-2 text-sm text-gray-400 dark:text-gray-500">
              ({instantes.length} {instantes.length === 1 ? 'instante' : 'instantes'} en total)
            </span>
          )}
        </p>
      </header>

      {/* Timeline por meses */}
      {Object.keys(instantesPorMes).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(instantesPorMes).map(([mes, instantesDelMes]) => (
            <section key={mes}>
              {/* Separador de mes */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 capitalize whitespace-nowrap">
                  {mes}
                </h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {instantesDelMes.length} {instantesDelMes.length === 1 ? 'instante' : 'instantes'}
                </span>
              </div>

              {/* Instantes del mes */}
              <div className="space-y-4">
                {instantesDelMes.map((instante) => (
                  <InstanteCard
                    key={instante.id || `${instante.area}-${instante.slug}`}
                    instante={instante}
                    showArea={true}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Aún no hay instantes registrados.
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
