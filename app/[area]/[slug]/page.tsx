import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getInstanteBySlug, getAreaInfo, getAllInstantes, AREAS } from '@/lib/getInstantes';

interface InstantePageProps {
  params: { area: string; slug: string };
}

// Genera las rutas estáticas para todos los instantes
export async function generateStaticParams() {
  const instantes = await getAllInstantes();

  return instantes.map((instante) => ({
    area: instante.area,
    slug: instante.slug,
  }));
}

// Genera metadatos dinámicos
export async function generateMetadata({ params }: InstantePageProps) {
  const instante = await getInstanteBySlug(params.area, params.slug);

  if (!instante) {
    return { title: 'Instante no encontrado' };
  }

  return {
    title: `${instante.titulo} | Diario de un Instante`,
    description: instante.content.substring(0, 160),
  };
}

export default async function InstantePage({ params }: InstantePageProps) {
  const instante = await getInstanteBySlug(params.area, params.slug);
  const areaInfo = getAreaInfo(params.area);

  if (!instante || !areaInfo) {
    notFound();
  }

  return (
    <div className="container-page max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${params.area}`} className="hover:text-gray-700">
              {areaInfo.nombre}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">
            {instante.titulo}
          </li>
        </ol>
      </nav>

      {/* Artículo */}
      <article className="bg-white rounded-xl border border-gray-100 p-8">
        {/* Header */}
        <header className="mb-8 pb-8 border-b border-gray-100">
          {/* Área y tipo */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{areaInfo.emoji}</span>
            <span className="text-sm text-gray-500">{areaInfo.nombre}</span>
            <span className="text-gray-300">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              instante.tipo === 'accion'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-violet-50 text-violet-700'
            }`}>
              {instante.tipo === 'accion' ? 'Acción' : 'Pensamiento'}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {instante.titulo}
          </h1>

          {/* Fecha */}
          <time
            dateTime={instante.fecha}
            className="text-sm text-gray-400"
          >
            {format(new Date(instante.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </time>
        </header>

        {/* Contenido */}
        <div
          className="prose-instante"
          dangerouslySetInnerHTML={{ __html: instante.contentHtml || '' }}
        />
      </article>

      {/* Navegación */}
      <nav className="mt-8 flex justify-between">
        <Link
          href={`/${params.area}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a {areaInfo.nombre}
        </Link>
        <Link
          href="/archivo"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Ver archivo completo
        </Link>
      </nav>
    </div>
  );
}
