'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Instante, getAreaInfo, toggleLike } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';

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
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(instante.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // Verificar si el usuario actual dio like
  const userHasLiked = user && instante.likes && instante.likes.includes(user.uid);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !instante.id) {
      return;
    }

    setLoadingLike(true);
    try {
      const result = await toggleLike(instante.id, user.uid);
      setLikeCount(result.likeCount);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Error al dar like:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <Link href={`/${instante.area}/${instante.slug}`}>
      <article
        className="group rounded-lg p-5 hover:shadow-sm transition-all duration-200 border border-gray-100 dark:border-gray-800 dark:!bg-gray-800"
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

        {/* Tags */}
        {instante.tags && instante.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {instante.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/tag/${encodeURIComponent(tag)}`;
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Footer con área y likes */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-gray-700">
          {showArea && areaInfo && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{areaInfo.emoji}</span>
              <span className="text-xs text-gray-700 dark:text-gray-400 font-medium">{areaInfo.nombre}</span>
            </div>
          )}

          {/* Botón de like */}
          <button
            onClick={handleLike}
            disabled={!user || loadingLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              userHasLiked || isLiked
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''} ${loadingLike ? 'opacity-70' : ''}`}
            title={user ? (userHasLiked || isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
          >
            <svg
              className="w-4 h-4"
              fill={userHasLiked || isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>
        </div>
      </article>
    </Link>
  );
}
