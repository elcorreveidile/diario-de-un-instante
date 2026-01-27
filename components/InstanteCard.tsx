import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Instante, getAreaInfo } from '@/lib/firestore';

interface InstanteCardProps {
  instante: Instante;
  showArea?: boolean;
}

export default function InstanteCard({ instante, showArea = false }: InstanteCardProps) {
  const areaInfo = getAreaInfo(instante.area);

  return (
    <Link href={`/${instante.area}/${instante.slug}`}>
      <article className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm dark:hover:shadow-gray-900/50 transition-all duration-200">
        {/* Header con fecha y tipo */}
        <div className="flex items-center justify-between mb-3">
          <time
            dateTime={instante.fecha}
            className="text-xs text-gray-400 dark:text-gray-500 font-medium"
          >
            {format(new Date(instante.fecha), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </time>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            instante.tipo === 'accion'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
          }`}>
            {instante.tipo === 'accion' ? 'Acción' : 'Pensamiento'}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 mb-2 line-clamp-2">
          {instante.titulo}
        </h3>

        {/* Preview del contenido */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {instante.content.replace(/[#*`\[\]]/g, '').substring(0, 150)}...
        </p>

        {/* Footer con área (si se muestra) */}
        {showArea && areaInfo && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
            <span className="text-sm">{areaInfo.emoji}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{areaInfo.nombre}</span>
          </div>
        )}
      </article>
    </Link>
  );
}
