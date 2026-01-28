// Firebase Admin SDK - Solo para server-side
let adminDbInstance: any = null;

export async function getAdminDb() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin solo puede usarse en el servidor');
  }

  if (adminDbInstance) {
    return adminDbInstance;
  }

  // Importación dinámica solo en servidor
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  const adminConfig = {
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  };

  if (getApps().length === 0) {
    console.log('[Firebase Admin] Inicializando...');
    initializeApp(adminConfig);
    console.log('[Firebase Admin] Inicializado correctamente');
  }

  adminDbInstance = getFirestore();
  console.log('[Firebase Admin] Firestore obtenido');
  return adminDbInstance;
}
