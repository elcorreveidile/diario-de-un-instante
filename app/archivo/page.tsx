import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAllInstantes, getAreaInfo } from '@/lib/getInstantes';
import InstanteCard from '@/components/InstanteCard';

export const metadata = {
  title: 'Archivo | Diario de un Instante',
  description: 'Todos los instantes registrados, ordenados cronológicamente.',
};

export default async function ArchivoPage() {
  const instantes = await getAllInstantes();

  // Agrupar por mes para mejor organización
  const instantesPorMes = instantes.reduce((acc, instante) => {
    const mes = format(new Date(instante.fecha), 'MMMM yyyy', { locale: es });
    if (!acc[mes]) {
      acc[mes] = [];
    }
    acc[mes].push(instante);
    return acc;
  }, {} as Record<string, typeof instantes>);

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
          <li className="text-gray-900 font-medium">Archivo</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Archivo
        </h1>
        <p className="text-gray-500">
          Todos los instantes ordenados cronológicamente.
          {instantes.length > 0 && (
            <span className="ml-2 text-sm text-gray-400">
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
                <h2 className="text-lg font-semibold text-gray-700 capitalize whitespace-nowrap">
                  {mes}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">
                  {instantesDelMes.length} {instantesDelMes.length === 1 ? 'instante' : 'instantes'}
                </span>
              </div>

              {/* Instantes del mes */}
              <div className="space-y-4">
                {instantesDelMes.map((instante) => (
                  <InstanteCard
                    key={`${instante.area}-${instante.slug}`}
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
          <p className="text-gray-400 mb-4">
            Aún no hay instantes registrados.
          </p>
          <p className="text-sm text-gray-300">
            Comienza agregando archivos .md en la carpeta
            <code className="bg-gray-100 px-2 py-1 rounded mx-1">content/</code>
          </p>
        </section>
      )}
    </div>
  );
}
