import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page">
      <div className="text-center py-20">
        <span className="text-6xl mb-6 block">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          El instante que buscas no existe o ha sido movido.
          Quizás este momento aún está por escribirse.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
