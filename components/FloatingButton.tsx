'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingButton() {
  const pathname = usePathname();

  // No mostrar en admin o login
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      href="/admin/nuevo"
      className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 z-50"
      aria-label="Crear nuevo instante"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </Link>
  );
}
