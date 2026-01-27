import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaConUltimoInstante } from '@/lib/firestore';

interface AreaCardProps {
  area: AreaConUltimoInstante;
}

export default function AreaCard({ area }: AreaCardProps) {
  const hasInstantes = area.ultimoInstante !== null;

  return (
    <Link href={`/${area.id}`}>
      <article className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
        {/* Indicador de área */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label={area.nombre}>
              {area.emoji}
            </span>
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300">
              {area.nombre}
            </h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
            {area.totalInstantes} {area.totalInstantes === 1 ? 'instante' : 'instantes'}
          </span>
        </div>

        {/* Definición del área */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {area.definicion}
          </p>
          {hasInstantes && area.ultimoInstante ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-1">
              <span className="text-gray-500 dark:text-gray-400">Último:</span>
              <time dateTime={area.ultimoInstante.fecha}>
                {format(new Date(area.ultimoInstante.fecha), "d 'de' MMMM", { locale: es })}
              </time>
            </div>
          ) : null}
        </div>

        {/* Flecha indicadora */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </article>
    </Link>
  );
}
