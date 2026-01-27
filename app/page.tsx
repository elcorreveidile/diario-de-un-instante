'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAreasConUltimoInstante, getEstadisticas, AreaConUltimoInstante } from '@/lib/firestore';
import AreaCard from '@/components/AreaCard';
import Stats from '@/components/Stats';

export default function HomePage() {
  const [areas, setAreas] = useState<AreaConUltimoInstante[]>([]);
  const [stats, setStats] = useState({
    totalInstantes: 0,
    pensamientos: 0,
    acciones: 0,
    areasActivas: 0,
    totalAreas: 11,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [areasData, statsData] = await Promise.all([
          getAreasConUltimoInstante(),
          getEstadisticas(),
        ]);
        setAreas(areasData);
        setStats(statsData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando tu diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Diario de un Instante
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Un jardín digital para cultivar un año 2026 más consciente y con propósito.
          Capturando pensamientos y acciones, un instante a la vez.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Panel de admin
        </Link>
      </section>

      {/* Estadísticas */}
      <section className="mb-12">
        <Stats
          totalInstantes={stats.totalInstantes}
          pensamientos={stats.pensamientos}
          acciones={stats.acciones}
          areasActivas={stats.areasActivas}
          totalAreas={stats.totalAreas}
        />
      </section>

      {/* Grid de Áreas */}
      <section>
        <h2 className="section-title">
          Las 11 áreas de mi vida
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>
    </div>
  );
}
