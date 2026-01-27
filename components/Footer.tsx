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

          {/* Copyright */}
          <p className="text-xs text-gray-300 dark:text-gray-600">
            {currentYear} · Diario de un Instante
          </p>
        </div>
      </div>
    </footer>
  );
}
