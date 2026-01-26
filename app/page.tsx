import { getAreasConUltimoInstante, getEstadisticas } from '@/lib/getInstantes';
import AreaCard from '@/components/AreaCard';
import Stats from '@/components/Stats';

export default async function HomePage() {
  const areas = await getAreasConUltimoInstante();
  const stats = await getEstadisticas();

  return (
    <div className="container-page">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Diario de un Instante
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Un jardín digital para cultivar un año 2026 más consciente y con propósito.
          Capturando pensamientos y acciones, un instante a la vez.
        </p>
      </section>

      {/* Estadísticas */}
      <section className="mb-12">
        <Stats
          totalInstantes={stats.totalInstantes}
          pensamientos={stats.pensamientos}
          acciones={stats.acciones}
          areasActivas={stats.areasActivas}
        />
      </section>

      {/* Grid de Áreas */}
      <section>
        <h2 className="section-title">
          Las 10 Áreas de mi Vida
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
