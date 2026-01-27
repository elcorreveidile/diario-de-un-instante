import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface InviteCode {
  id?: string;
  code: string;
  email?: string; // Email opcional para restringir el código
  used: boolean;
  usedBy?: string;
  usedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

// Generar código de invitación aleatorio (formato: XXXX-XXXX-XXXX)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusiones
  const segments = 3;
  const segmentLength = 4;

  let code = '';
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < segments - 1) code += '-';
  }

  return code;
}

// Crear un nuevo código de invitación
export async function createInviteCode(createdBy: string, email?: string): Promise<InviteCode> {
  const code = generateInviteCode();

  const docRef = await addDoc(collection(db, 'invites'), {
    code,
    email: email || null,
    used: false,
    usedBy: null,
    usedAt: null,
    createdBy,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    code,
    email,
    used: false,
    createdBy,
    createdAt: Timestamp.now(),
  };
}

// Obtener todos los códigos de invitación
export async function getAllInviteCodes(): Promise<InviteCode[]> {
  const q = query(
    collection(db, 'invites'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as InviteCode[];
}

// Obtener códigos de invitación no usados
export async function getUnusedInviteCodes(): Promise<InviteCode[]> {
  const q = query(
    collection(db, 'invites'),
    where('used', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as InviteCode[];
}

// Verificar si un código es válido
export async function verifyInviteCode(code: string): Promise<boolean> {
  const q = query(
    collection(db, 'invites'),
    where('code', '==', code),
    where('used', '==', false)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}
