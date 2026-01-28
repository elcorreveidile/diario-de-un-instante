'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nombre */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">✨</span>
            <span className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              Diario de un Instante
            </span>
          </Link>

          {/* Navegación */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/archivo"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Archivo
            </Link>
            <Link
              href="/buscar"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Buscar</span>
            </Link>

            {/* Enlace al perfil del usuario autenticado */}
            {user && userProfile && userProfile.displayName && (
              <Link
                href={`/u/${userProfile.displayName.toLowerCase()}`}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium"
              >
                Mi Blog
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
