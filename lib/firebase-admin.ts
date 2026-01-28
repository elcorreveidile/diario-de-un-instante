import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectIds = [
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'diario-de-un-instante',
];

// Función helper para crear el certificado
function getCert() {
  // Si tenemos las variables individuales de Firebase Admin
  if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Si tenemos el JSON completo
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }

  throw new Error('No se encontraron credenciales de Firebase Admin SDK');
}

// Inicializar la app de Firebase Admin
function initFirebaseAdmin() {
  // Verificar si estamos en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK no puede usarse en el cliente');
  }

  // Si ya está inicializado, retornarlo
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    const certConfig = getCert();
    const app = initializeApp({
      credential: cert(certConfig),
      ...projectIds.find(id => id) ? { projectId: projectIds.find(id => id) } : {}
    });

    console.log('[Firebase Admin] App inicializada correctamente');
    return app;
  } catch (error) {
    console.error('[Firebase Admin] Error al inicializar:', error);
    throw error;
  }
}

// Exportar las instancias
export const adminDb = getFirestore(initFirebaseAdmin());
