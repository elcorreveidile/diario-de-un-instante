import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Instante, getAreaInfo } from '@/lib/firestore';

interface InstanteCardProps {
  instante: Instante;
  showArea?: boolean;
  showUser?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function InstanteCard({
  instante,
  showArea = false,
  showUser = true,
  primaryColor = '#8b5cf6',
  secondaryColor = '#f5f3ff'
}: InstanteCardProps) {
  const areaInfo = getAreaInfo(instante.area);

  return (
    <Link href={`/${instante.area}/${instante.slug}`}>
      <article
        className="group rounded-lg p-5 hover:shadow-sm transition-all duration-200 border border-gray-100 dark:border-gray-800"
        style={{
          backgroundColor: secondaryColor,
        }}
      >
        {/* Header con fecha y tipo */}
        <div className="flex items-center justify-between mb-3">
          <time
            dateTime={instante.fecha}
            className="text-xs text-gray-700 dark:text-gray-400 font-medium"
          >
            {format(new Date(instante.fecha), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </time>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            {instante.tipo === 'accion' ? 'Acción' : 'Pensamiento'}
          </span>
        </div>

        {/* Título */}
        <h3
          className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
          style={{ color: primaryColor }}
        >
          {instante.titulo}
        </h3>

        {/* Preview del contenido */}
        <p className="text-sm text-gray-800 dark:text-gray-400 line-clamp-2 mb-3">
          {instante.content.replace(/[#*`\[\]]/g, '').substring(0, 150)}...
        </p>

        {/* Footer con área (si se muestra) */}
        {showArea && areaInfo && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-300 dark:border-gray-700">
            <span className="text-sm">{areaInfo.emoji}</span>
            <span className="text-xs text-gray-700 dark:text-gray-400 font-medium">{areaInfo.nombre}</span>
          </div>
        )}
      </article>
    </Link>
  );
}
