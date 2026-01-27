import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, updateDoc, doc } from 'firebase/firestore';
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

// ==================== SOLICITUDES DE INVITACIÓN ====================

export interface InvitationRequest {
  id?: string;
  name: string;
  email: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  inviteCodeSent?: boolean;
}

// Crear una nueva solicitud de invitación
export async function createInvitationRequest(
  name: string,
  email: string,
  reason?: string
): Promise<InvitationRequest> {
  const docRef = await addDoc(collection(db, 'invitation_requests'), {
    name,
    email,
    reason: reason || '',
    status: 'pending',
    createdAt: Timestamp.now(),
    reviewedAt: null,
    reviewedBy: null,
    inviteCodeSent: false,
  });

  return {
    id: docRef.id,
    name,
    email,
    reason,
    status: 'pending',
    createdAt: Timestamp.now(),
  };
}

// Obtener todas las solicitudes de invitación
export async function getAllInvitationRequests(): Promise<InvitationRequest[]> {
  const q = query(
    collection(db, 'invitation_requests'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as InvitationRequest[];
}

// Obtener solicitudes pendientes
export async function getPendingInvitationRequests(): Promise<InvitationRequest[]> {
  const q = query(
    collection(db, 'invitation_requests'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as InvitationRequest[];
}

// Actualizar estado de una solicitud
export async function updateInvitationRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string
): Promise<void> {
  const updates: any = {
    status,
    reviewedAt: Timestamp.now(),
    reviewedBy,
  };

  await updateDoc(doc(db, 'invitation_requests', requestId), updates);
}

// Marcar que se envió el código de invitación
export async function markInviteCodeSent(requestId: string): Promise<void> {
  await updateDoc(doc(db, 'invitation_requests', requestId), {
    inviteCodeSent: true,
  });
}
