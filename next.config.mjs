import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para leer archivos markdown en producción
  output: 'standalone',
  // Excluir firebase-admin del bundling del cliente
  serverExternalPackages: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/firestore'],
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})(nextConfig);
