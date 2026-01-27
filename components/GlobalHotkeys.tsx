'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/navigation';

export default function GlobalHotkeys() {
  const router = useRouter();

  // Cmd/Ctrl + K para buscar
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    router.push('/buscar');
  });

  // Cmd/Ctrl + N para nuevo instante
  useHotkeys('mod+n', (e) => {
    e.preventDefault();
    router.push('/admin/nuevo');
  });

  return null;
}
