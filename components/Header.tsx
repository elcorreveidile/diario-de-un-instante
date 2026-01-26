import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nombre */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">✨</span>
            <span className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
              Diario de un Instante
            </span>
          </Link>

          {/* Navegación */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/archivo"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Archivo
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
