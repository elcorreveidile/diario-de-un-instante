// Funciones server-side que usan Firebase Admin SDK
// Este archivo SOLO debe importarse en server components

import { collection, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { getAdminDb } from './firebase-admin';

// Obtener usuario por username (campo username o displayName para compatibilidad)
export async function getUserByUsername(username: string): Promise<any> {
  console.log('[Server] getUserByUsername:', username);
  const db = await getAdminDb();
  const usersRef = collection(db, 'users');
  const usernameLower = username.toLowerCase();

  // Primero buscar por campo username (nuevo sistema)
  const qByUsername = query(usersRef, where('username', '==', usernameLower));
  const snapshotByUsername = await getDocs(qByUsername);

  console.log('[Server] Por username:', usernameLower, 'resultados:', snapshotByUsername.size);

  if (!snapshotByUsername.empty) {
    const userDoc = snapshotByUsername.docs[0];
    const data = userDoc.data();
    console.log('[Server] Usuario encontrado por username:', data.username);
    return {
      uid: userDoc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      username: data.username,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate() || new Date(),
      emailVerified: data.emailVerified || false,
    };
  }

  // Fallback: buscar por displayName (compatibilidad con datos antiguos)
  const qByDisplayName = query(usersRef, where('displayName', '==', username));
  const snapshotByDisplayName = await getDocs(qByDisplayName);

  console.log('[Server] Por displayName:', username, 'resultados:', snapshotByDisplayName.size);

  if (!snapshotByDisplayName.empty) {
    const userDoc = snapshotByDisplayName.docs[0];
    const data = userDoc.data();
    console.log('[Server] Usuario encontrado por displayName:', data.displayName);
    return {
      uid: userDoc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      username: data.username,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate() || new Date(),
      emailVerified: data.emailVerified || false,
    };
  }

  console.log('[Server] Usuario no encontrado');
  return null;
}

// Obtener configuración del blog de un usuario
export async function getBlogConfig(userId: string): Promise<any> {
  const db = await getAdminDb();
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    displayName: data.displayName || data.email?.split('@')[0] || 'Usuario',
    username: data.username,
    bio: data.bio,
    photoURL: data.photoURL,
    headerPhotoURL: data.headerPhotoURL,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
  };
}

// Obtener instantes públicos de un usuario
export async function getPublicInstantesByUser(userId: string): Promise<any[]> {
  const db = await getAdminDb();
  const instantesRef = collection(db, 'instantes');
  const q = query(instantesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const allInstantes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return allInstantes.filter((i: any) => {
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return esPublico && esVisible;
  });
}
