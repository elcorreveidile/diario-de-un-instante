export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mensaje */}
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center sm:text-left">
            Un jardín digital para cultivar una vida más consciente.
          </p>

          {/* Versión, créditos y RSS */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-300 dark:text-gray-600 text-center sm:text-right">
            <span>v0.7 - Contenido Avanzado</span>
            <span>·</span>
            <span>Desarrollado por <a href="https://twitter.com/jabelainez" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors">@jabelainez</a></span>
            <span>·</span>
            <a href="/rss" className="flex items-center gap-1 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.22 7.38 21 6 21c-1.38 0-2.36-1.78-2.36-3.18a2.18 2.18 0 0 1 2.54-2.18zM12 12c-2.62 0-4.88-1.86-6.5-4.47a9.86 9.86 0 0 1 13 0C16.88 10.14 14.62 12 12 12zm0-4a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
              </svg>
              RSS
            </a>
            <span>·</span>
            <span>© {currentYear} All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
