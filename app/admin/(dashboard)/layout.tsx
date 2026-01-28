'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Admin */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-semibold text-gray-900">
                Panel admin
              </Link>

              {/* Menú escritorio */}
              <nav className="hidden sm:flex gap-4">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Instantes
                </Link>
                <Link
                  href="/admin/nuevo"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Nuevo
                </Link>
                <Link
                  href="/admin/estadisticas"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Estadísticas
                </Link>
                <Link
                  href="/admin/comments"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Comentarios
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/newsletters"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Newsletters
                    </Link>
                    <Link
                      href="/admin/invitaciones"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Invitaciones
                    </Link>
                    <Link
                      href="/admin/solicitudes"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Solicitudes
                    </Link>
                    <Link
                      href="/admin/usuarios"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Usuarios
                    </Link>
                  </>
                )}
                <Link
                  href="/admin/configuracion"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Configuración
                </Link>
                <Link
                  href="/admin/configuracion-blog"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Mi Blog
                </Link>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                  target="_blank"
                >
                  Ver blog ↗
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.email}
              </span>

              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={() => logout()}
                className="text-sm text-red-600 hover:text-red-700 hidden sm:block"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 py-4 space-y-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Instantes
              </Link>
              <Link
                href="/admin/nuevo"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Nuevo
              </Link>
              <Link
                href="/admin/estadisticas"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Estadísticas
              </Link>
              <Link
                href="/admin/comments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Comentarios
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/newsletters"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Newsletters
                  </Link>
                  <Link
                    href="/admin/invitaciones"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Invitaciones
                  </Link>
                  <Link
                    href="/admin/solicitudes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Solicitudes
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Usuarios
                  </Link>
                </>
              )}
              <Link
                href="/admin/configuracion"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Configuración
              </Link>
              <Link
                href="/admin/configuracion-blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Mi Blog
              </Link>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                target="_blank"
              >
                Ver blog ↗
              </Link>
              <div className="px-4 pt-2 border-t border-gray-200 mt-2">
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
