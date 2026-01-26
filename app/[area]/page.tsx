import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInstantesByArea, getAreaInfo, AREAS } from '@/lib/getInstantes';
import InstanteCard from '@/components/InstanteCard';

interface AreaPageProps {
  params: { area: string };
}

// Genera las rutas estáticas para todas las áreas
export async function generateStaticParams() {
  return AREAS.map((area) => ({
    area: area.id,
  }));
}

// Genera metadatos dinámicos
export async function generateMetadata({ params }: AreaPageProps) {
  const areaInfo = getAreaInfo(params.area);

  if (!areaInfo) {
    return { title: 'Área no encontrada' };
  }

  return {
    title: `${areaInfo.nombre} | Diario de un Instante`,
    description: `Todos los instantes registrados en el área de ${areaInfo.nombre}`,
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const areaInfo = getAreaInfo(params.area);

  if (!areaInfo) {
    notFound();
  }

  const instantes = await getInstantesByArea(params.area);

  return (
    <div className="container-page">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{areaInfo.nombre}</li>
        </ol>
      </nav>

      {/* Header del área */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{areaInfo.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {areaInfo.nombre}
            </h1>
            <p className="text-gray-500">
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
              <InstanteCard key={instante.slug} instante={instante} />
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-16">
          <p className="text-gray-400 mb-4">
            Aún no hay instantes registrados en esta área.
          </p>
          <p className="text-sm text-gray-300">
            Los instantes aparecerán aquí cuando los agregues en la carpeta
            <code className="bg-gray-100 px-2 py-1 rounded mx-1">
              content/{params.area}/
            </code>
          </p>
        </section>
      )}
    </div>
  );
}
