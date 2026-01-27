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

          {/* Versión y créditos */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-300 dark:text-gray-600 text-center sm:text-right">
            <span>v0.4</span>
            <span>·</span>
            <span>Desarrollado por <a href="https://twitter.com/jabelainez" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors">@jabelainez</a></span>
            <span>·</span>
            <span>© {currentYear} All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
