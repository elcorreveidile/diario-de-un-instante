import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

// Definición de las 11 áreas de vida
export const AREAS = [
  {
    id: 'trabajo',
    nombre: 'Trabajo',
    emoji: '💼',
    definicion: 'Mi oficio, el servicio que ofrezco y el valor que genero en el mundo.',
    preguntasGuia: [
      '¿Qué logro profesional celebro hoy?',
      '¿Qué habilidad fortalecí en mi trabajo?',
      '¿Cómo mi trabajo aportó valor a otros?',
      '¿Qué desafío superé y qué aprendí?',
      '¿Qué relación construí o fortalecí profesionalmente?'
    ]
  },
  {
    id: 'aprendizaje',
    nombre: 'Aprendizaje',
    emoji: '📚',
    definicion: 'El ejercicio de expandir mi mundo interior y mis capacidades.',
    preguntasGuia: [
      '¿Qué nuevo conocimiento adquirí hoy?',
      '¿Qué habilidad practiqué o mejoré?',
      '¿Qué descubrimiento hice sobre mí mismo?',
      '¿Qué libro, curso o recurso me inspiró?',
      '¿Qué error se convirtió en aprendizaje?'
    ]
  },
  {
    id: 'salud',
    nombre: 'Salud',
    emoji: '🏃',
    definicion: 'El pilar que sostiene toda mi energía, claridad y bienestar.',
    preguntasGuia: [
      '¿Cómo cuidé mi cuerpo hoy?',
      '¿Qué elección saludable hice?',
      '¿Cómo me sentí física y mentalmente?',
      '¿Qué hábito wellness fortalecí?',
      '¿Cómo descansé y recargué energías?'
    ]
  },
  {
    id: 'gestion-cultural',
    nombre: 'Gestión Cultural',
    emoji: '🎭',
    definicion: 'Construir puentes y ser un agente activo en el mundo de las ideas y el arte.',
    preguntasGuia: [
      '¿Qué experiencia cultural me impactó?',
      '¿Qué idea o proyecto artístico exploré?',
      '¿Cómo conecté con otras personas a través del arte o la cultura?',
      '¿Qué obra (libro, película, música) me inspiró?',
      '¿Qué iniciativa cultural impulsé o apoyé?'
    ]
  },
  {
    id: 'ocio',
    nombre: 'Ocio',
    emoji: '🎮',
    definicion: 'El espacio para la alegría pura, el juego y la recreación sin culpa.',
    preguntasGuia: [
      '¿Qué actividad me hizo sonreír hoy?',
      '¿Cómo me permití descansar sin culpas?',
      '¿Qué hobby o pasatiempo disfruté plenamente?',
      '¿Qué momento de alegría pura viví?',
      '¿Cómo desconecté de mis obligaciones y disfruté el presente?'
    ]
  },
  {
    id: 'creacion',
    nombre: 'Creación',
    emoji: '✨',
    definicion: 'El taller de mi alma, donde mi voz literaria encuentra forma y se expresa.',
    preguntasGuia: [
      '¿Qué creé hoy con mis manos o mi mente?',
      '¿Qué idea puse en papel o comenzó a tomar forma?',
      '¿Cómo expresé mi voz única?',
      '¿Qué bloqueo creativo superé?',
      '¿Qué proyecto o obra me apasiona hoy?'
    ]
  },
  {
    id: 'amistades',
    nombre: 'Amistades',
    emoji: '👥',
    definicion: 'Los lazos que elijo y que nutren, desafían y celebran mi camino.',
    preguntasGuia: [
      '¿Qué amigo connecté o reconecté hoy?',
      '¿Cómo fui un buen amigo para alguien?',
      '¿Qué conversación significativa tuve?',
      '¿Qué momento compartido valoro especialmente?',
      '¿Cómo nutrí mis relaciones de amistad?'
    ]
  },
  {
    id: 'familia',
    nombre: 'Familia',
    emoji: '🏠',
    definicion: 'Mi raíz, mi origen y el núcleo incondicional de mi historia.',
    preguntasGuia: [
      '¿Qué momento familiar disfruté hoy?',
      '¿Cómo demostré amor a mis seres queridos?',
      '¿Qué tradición o recuerdo familiar valoré?',
      '¿Qué conversación importante tuve con mi familia?',
      '¿Cómo honré mis raíces y mi historia?'
    ]
  },
  {
    id: 'entorno',
    nombre: 'Entorno',
    emoji: '🌱',
    definicion: 'Diseñar el espacio físico y los sistemas que me rodean para potenciar mi vida.',
    preguntasGuia: [
      '¿Cómo mejoré mi espacio físico hoy?',
      '¿Qué organización o sistema optimicé?',
      '¿Qué cambio en mi entorno me hizo sentir mejor?',
      '¿Cómo cuidé el espacio donde vivo o trabajo?',
      '¿Qué ajuste a mis rutinas o sistemas funcionó bien?'
    ]
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    emoji: '💰',
    definicion: 'La herramienta que me da libertad, seguridad y la capacidad de construir mis sueños.',
    preguntasGuia: [
      '¿Qué decisión financiera inteligente hice hoy?',
      '¿Cómo avancé hacia mis metas financieras?',
      '¿Qué gasto evité o qué dinero ahorré?',
      '¿Qué inversión (en dinero o en mí mismo) hice?',
      '¿Cómo practicé gratitud por lo que tengo?'
    ]
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología',
    emoji: '💻',
    definicion: 'El taller donde mis ideas digitales toman forma y se hacen realidad.',
    preguntasGuia: [
      '¿Qué herramienta o tecnología aprendí a usar mejor?',
      '¿Qué proyecto digital avancé hoy?',
      '¿Cómo usé la tecnología para mejorar mi vida?',
      '¿Qué problema técnico resolví?',
      '¿Qué idea o prototipo comencé a desarrollar?'
    ]
  },
] as const;

export type AreaId = typeof AREAS[number]['id'];

// v0.7 - Metadata para imágenes almacenadas
export interface ImageMetadata {
  url: string;           // URL de descarga de Firebase Storage
  path: string;          // Ruta en Storage (para borrado)
  name: string;          // Nombre original del archivo
  size: number;          // Tamaño en bytes
  type: string;          // MIME type (image/jpeg, etc.)
  uploadedAt: Date;      // Timestamp de subida
}

// Interfaz para un Instante
export interface Instante {
  id?: string;
  userId: string; // ID del usuario propietario (v0.5 multi-tenant)
  titulo: string;
  fecha: string;
  area: AreaId;
  tipo: 'pensamiento' | 'accion';
  slug: string;
  content: string;
  estado: 'borrador' | 'publicado';
  privado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // v0.6 - Reacciones
  likes?: string[]; // Array de UIDs de usuarios que dieron like
  likeCount?: number; // Contador de likes (para ordenamiento)
  // v0.7 - Tags
  tags?: string[]; // Array de tags personalizados (ej: ['productividad', 'reflexión'])
  // v0.7 - Imágenes
  images?: ImageMetadata[]; // Array de imágenes (máximo 5 por instante)
}

// Interfaz para crear/actualizar
export interface InstanteInput {
  userId: string; // ID del usuario propietario (v0.5 multi-tenant)
  titulo: string;
  fecha: string;
  area: AreaId;
  tipo: 'pensamiento' | 'accion';
  slug: string;
  content: string;
  estado: 'borrador' | 'publicado';
  privado: boolean;
  tags?: string[]; // v0.7 - Tags personalizados
  images?: ImageMetadata[]; // v0.7 - Imágenes
}

// Interfaz para el área con su último instante
export interface AreaConUltimoInstante {
  id: AreaId;
  nombre: string;
  emoji: string;
  definicion: string;
  ultimoInstante: Instante | null;
  totalInstantes: number;
}

const COLLECTION_NAME = 'instantes';

// Generar slug desde título
export function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno
}

// Obtener todos los instantes
export async function getAllInstantes(): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
}

// Obtener instantes por área
export async function getInstantesByArea(areaId: string): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('area', '==', areaId),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
}

// Obtener un instante por ID
export async function getInstanteById(id: string): Promise<Instante | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Instante;
}

// Obtener un instante por área y slug
export async function getInstanteBySlug(areaId: string, slug: string): Promise<Instante | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('area', '==', areaId),
    where('slug', '==', slug)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Instante;
}

// ==================== NUEVAS FUNCIONES V0.2 ====================

// Obtener solo instantes públicos y publicados
export async function getPublicInstantes(): Promise<Instante[]> {
  // Obtenemos todos los instantes ordenados por fecha
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  // Filtramos en el cliente para incluir aquellos que no tienen el campo 'privado'
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })).filter((instante: any) => {
    const esPublico = instante.privado === false || !instante.hasOwnProperty('privado');
    const esPublicado = instante.estado === 'publicado' || !instante.hasOwnProperty('estado');
    return esPublico && esPublicado;
  }) as Instante[];
}

// Obtener instantes públicos por área
export async function getPublicInstantesByArea(areaId: string): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('area', '==', areaId),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  // Filtramos en el cliente para incluir aquellos que no tienen el campo 'privado'
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })).filter((instante: any) => {
    const esPublico = instante.privado === false || !instante.hasOwnProperty('privado');
    const esPublicado = instante.estado === 'publicado' || !instante.hasOwnProperty('estado');
    return esPublico && esPublicado;
  }) as Instante[];
}

// Obtener instante público por slug
export async function getPublicInstanteBySlug(areaId: string, slug: string): Promise<Instante | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('area', '==', areaId),
    where('slug', '==', slug),
    where('privado', '==', false),
    where('estado', '==', 'publicado')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Instante;
}

// Filtrar instantes por estado
export async function getInstantesByEstado(estado: 'borrador' | 'publicado'): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('estado', '==', estado),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
}

// ==================== FIN NUEVAS FUNCIONES V0.2 ====================

// Crear nuevo instante
export async function createInstante(data: InstanteInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

// Actualizar instante
export async function updateInstante(id: string, data: Partial<InstanteInput>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Eliminar instante
export async function deleteInstante(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Obtener áreas con su último instante
export async function getAreasConUltimoInstante(): Promise<AreaConUltimoInstante[]> {
  const allInstantes = await getAllInstantes(); // FIX: Usar getAllInstantes y filtrar por compatibilidad

  return AREAS.map(area => {
    // Filtrar instantes: solo los que son públicos Y (publicados O no tienen campo estado)
    const instantesDeArea = allInstantes.filter(i => {
      const esPublico = i.privado === false || !i.hasOwnProperty('privado');
      const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
      return i.area === area.id && esPublico && esVisible;
    });
    const ultimoInstante = instantesDeArea.length > 0 ? instantesDeArea[0] : null;

    return {
      id: area.id,
      nombre: area.nombre,
      emoji: area.emoji,
      definicion: area.definicion,
      ultimoInstante,
      totalInstantes: instantesDeArea.length,
    };
  });
}

// Obtener información de un área
export function getAreaInfo(areaId: string) {
  return AREAS.find(area => area.id === areaId) || null;
}

// Obtener estadísticas
export async function getEstadisticas() {
  const allInstantes = await getAllInstantes(); // FIX: Usar getAllInstantes y filtrar por compatibilidad

  // Filtrar solo los que son públicos Y (publicados O no tienen campo estado)
  const instantesVisibles = allInstantes.filter(i => {
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return esPublico && esVisible;
  });

  const pensamientos = instantesVisibles.filter(i => i.tipo === 'pensamiento').length;
  const acciones = instantesVisibles.filter(i => i.tipo === 'accion').length;
  const areasActivas = new Set(instantesVisibles.map(i => i.area)).size;

  return {
    totalInstantes: instantesVisibles.length,
    pensamientos,
    acciones,
    areasActivas,
    totalAreas: AREAS.length,
  };
}

// ==================== NUEVAS FUNCIONES v0.5 - MULTI-TENANT ====================

// Interfaces para gestión de usuarios y blogs
export interface Usuario {
  uid: string;
  email: string;
  displayName?: string;
  username?: string; // Username único en minúsculas para URLs (/u/username)
  role: 'admin' | 'user';
  createdAt: Date;
  emailVerified?: boolean;
}

export interface BlogConfig {
  displayName: string; // Nombre para mostrar en "Diario de un Instante de..."
  username?: string; // Username único en minúsculas para URLs (/u/username)
  bio?: string; // Descripción del usuario
  photoURL?: string; // URL de foto de perfil
  headerPhotoURL?: string; // URL de foto de cabecera
  primaryColor?: string; // Color principal (hex)
  secondaryColor?: string; // Color secundario (hex)
}

// Obtener todos los usuarios
export async function getAllUsuarios(): Promise<Usuario[]> {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      username: data.username,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate() || new Date(),
      emailVerified: data.emailVerified || false,
    };
  });
}

// Obtener un usuario por UID
export async function getUsuarioByUid(uid: string): Promise<Usuario | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
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

// Actualizar rol de usuario
export async function updateUsuarioRole(uid: string, role: 'admin' | 'user'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

// Eliminar un usuario (solo Firestore, no Firebase Auth)
export async function deleteUsuario(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

// ==================== CONFIGURACIÓN DE BLOG v0.5.2 ====================

// Obtener configuración del blog de un usuario
export async function getBlogConfig(userId: string): Promise<BlogConfig | null> {
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

// Actualizar configuración del blog
export async function updateBlogConfig(userId: string, config: Partial<BlogConfig>): Promise<void> {
  const updateData: any = {};

  if (config.displayName !== undefined) updateData.displayName = config.displayName;
  if (config.username !== undefined) updateData.username = config.username.toLowerCase();
  if (config.bio !== undefined) updateData.bio = config.bio;
  if (config.photoURL !== undefined) updateData.photoURL = config.photoURL;
  if (config.headerPhotoURL !== undefined) updateData.headerPhotoURL = config.headerPhotoURL;
  if (config.primaryColor !== undefined) updateData.primaryColor = config.primaryColor;
  if (config.secondaryColor !== undefined) updateData.secondaryColor = config.secondaryColor;

  await updateDoc(doc(db, 'users', userId), updateData);
}

// Obtener usuario por username (campo username o displayName para compatibilidad)
export async function getUserByUsername(username: string): Promise<Usuario | null> {
  console.log('[getUserByUsername] Buscando:', username);
  const usersRef = collection(db, 'users');
  const usernameLower = username.toLowerCase();

  // Primero buscar por campo username (nuevo sistema)
  const qByUsername = query(usersRef, where('username', '==', usernameLower));
  const snapshotByUsername = await getDocs(qByUsername);

  console.log('[getUserByUsername] Por username:', usernameLower, 'resultados:', snapshotByUsername.size);

  if (!snapshotByUsername.empty) {
    const userDoc = snapshotByUsername.docs[0];
    const data = userDoc.data();
    console.log('[getUserByUsername] Usuario encontrado por username:', data.username);
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

  console.log('[getUserByUsername] Por displayName:', username, 'resultados:', snapshotByDisplayName.size);

  if (!snapshotByDisplayName.empty) {
    const userDoc = snapshotByDisplayName.docs[0];
    const data = userDoc.data();
    console.log('[getUserByUsername] Usuario encontrado por displayName:', data.displayName);
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

  console.log('[getUserByUsername] Usuario no encontrado');
  return null;
}

// ==================== FIN NUEVAS FUNCIONES v0.5.2 ====================

// ==================== FUNCIONES GLOBAL (ALIASES PARA COMPATIBILIDAD) ====================
// Estas funciones son aliases para mantener compatibilidad con código existente

export async function getGlobalPublicInstantesByArea(areaId: string): Promise<Instante[]> {
  return await getPublicInstantesByArea(areaId);
}

export async function getGlobalPublicInstantes(): Promise<Instante[]> {
  return await getPublicInstantes();
}

export async function getGlobalAreasConUltimoInstante(): Promise<AreaConUltimoInstante[]> {
  return await getAreasConUltimoInstante();
}

export async function getGlobalEstadisticas() {
  return await getEstadisticas();
}

// ==================== FIN FUNCIONES GLOBAL ====================

// Obtener todos los instantes de un usuario
export async function getInstantesByUser(userId: string): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
}

// Obtener instantes públicos de un usuario (para páginas públicas)
export async function getPublicInstantesByUser(userId: string): Promise<Instante[]> {
  const allInstantes = await getInstantesByUser(userId);

  return allInstantes.filter(i => {
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return esPublico && esVisible;
  });
}

// Obtener instantes públicos de un usuario por área
export async function getPublicInstantesByUserAndArea(userId: string, areaId: string): Promise<Instante[]> {
  const allInstantes = await getInstantesByUser(userId);

  return allInstantes.filter(i => {
    const matchArea = i.area === areaId;
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return matchArea && esPublico && esVisible;
  });
}

// Obtener instante público por slug de un usuario específico
export async function getPublicInstanteByUserAndSlug(userId: string, areaId: string, slug: string): Promise<Instante | null> {
  const allInstantes = await getInstantesByUser(userId);

  const instante = allInstantes.find(i => {
    const matchArea = i.area === areaId;
    const matchSlug = i.slug === slug;
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return matchArea && matchSlug && esPublico && esVisible;
  });

  return instante || null;
}

// Obtener áreas con último instante de un usuario
export async function getAreasConUltimoInstanteByUser(userId: string): Promise<AreaConUltimoInstante[]> {
  const allInstantes = await getInstantesByUser(userId);

  return AREAS.map(area => {
    const instantesDeArea = allInstantes.filter(i => {
      const esPublico = i.privado === false || !i.hasOwnProperty('privado');
      const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
      return i.area === area.id && esPublico && esVisible;
    });
    const ultimoInstante = instantesDeArea.length > 0 ? instantesDeArea[0] : null;

    return {
      id: area.id,
      nombre: area.nombre,
      emoji: area.emoji,
      definicion: area.definicion,
      ultimoInstante,
      totalInstantes: instantesDeArea.length,
    };
  });
}

// Obtener estadísticas de un usuario
export async function getEstadisticasByUser(userId: string) {
  const allInstantes = await getInstantesByUser(userId);

  const instantesVisibles = allInstantes.filter(i => {
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return esPublico && esVisible;
  });

  const pensamientos = instantesVisibles.filter(i => i.tipo === 'pensamiento').length;
  const acciones = instantesVisibles.filter(i => i.tipo === 'accion').length;
  const areasActivas = new Set(instantesVisibles.map(i => i.area)).size;

  return {
    totalInstantes: instantesVisibles.length,
    pensamientos,
    acciones,
    areasActivas,
    totalAreas: AREAS.length,
  };
}

// ==================== v0.6 - REACCIONES ====================

// Alternar like de un usuario en un instante
export async function toggleLike(instanteId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const instanteRef = doc(db, COLLECTION_NAME, instanteId);
      const instanteDoc = await transaction.get(instanteRef);

      if (!instanteDoc.exists()) {
        throw new Error('El instante no existe');
      }

      const instante = instanteDoc.data() as Instante;

      // Solo permitir likes en instantes públicos
      const esPublico = instante.privado === false || !instante.hasOwnProperty('privado');
      if (!esPublico) {
        throw new Error('Solo se puede dar like a instantes públicos');
      }

      const likes = instante.likes || [];
      const alreadyLiked = likes.includes(userId);

      let newLikes: string[];
      if (alreadyLiked) {
        // Quitar like
        newLikes = likes.filter(uid => uid !== userId);
      } else {
        // Agregar like
        newLikes = [...likes, userId];
      }

      // Actualizar documento
      transaction.update(instanteRef, {
        likes: newLikes,
        likeCount: newLikes.length,
        updatedAt: new Date(),
      });

      return {
        liked: !alreadyLiked,
        likeCount: newLikes.length,
      };
    });

    return result;
  } catch (error) {
    console.error('Error en toggleLike:', error);
    throw error;
  }
}

// Verificar si un usuario dio like a un instante
export async function userLikedInstante(instanteId: string, userId: string): Promise<boolean> {
  try {
    const instanteDoc = await getDoc(doc(db, COLLECTION_NAME, instanteId));

    if (!instanteDoc.exists()) {
      return false;
    }

    const instante = instanteDoc.data() as Instante;
    const likes = instante.likes || [];

    return likes.includes(userId);
  } catch (error) {
    console.error('Error en userLikedInstante:', error);
    return false;
  }
}

// Obtener instantes más likeados
export async function getMostLikedInstantes(limit: number = 10): Promise<Instante[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('privado', '==', false),
      orderBy('likeCount', 'desc'),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);

    const instantes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Instante[];

    return instantes.slice(0, limit);
  } catch (error) {
    console.error('Error en getMostLikedInstantes:', error);
    // Si falla por falta de índice compuesto, intentar sin ordenar por likeCount
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('privado', '==', false),
        orderBy('fecha', 'desc')
      );

      const snapshot = await getDocs(q);

      const instantes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Instante[];

      // Ordenar manualmente por likeCount
      instantes.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));

      return instantes.slice(0, limit);
    } catch (fallbackError) {
      console.error('Error en fallback de getMostLikedInstantes:', fallbackError);
      return [];
    }
  }
}

// ==================== FIN NUEVAS FUNCIONES v0.5 ====================

// ==================== v0.6 - COMENTARIOS ====================

const COMMENTS_COLLECTION = 'comments';

// Interfaz para un comentario
export interface Comment {
  id?: string;
  instanteId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  parentId?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: Date;
  updatedAt?: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

// Interfaz para crear un comentario
export interface CommentInput {
  instanteId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  parentId?: string | null;
}

// Interfaz para comentario con respuestas anidadas
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

// Crear un nuevo comentario
export async function createComment(data: CommentInput): Promise<string> {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    ...data,
    status: 'approved', // Auto-aprobar por ahora
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

// Obtener comentarios de un instante (aprobados y no borrados)
export async function getCommentsByInstante(instanteId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('instanteId', '==', instanteId),
    where('status', '==', 'approved')
    // Sin orderBy para evitar necesidad de índice compuesto
  );

  const snapshot = await getDocs(q);

  const comments = snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        editedAt: data.editedAt?.toDate?.() || data.editedAt,
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
      };
    })
    .filter((comment: any) => !comment.deletedAt) as Comment[];

  // Ordenar manualmente por createdAt descendente
  comments.sort((a: any, b: any) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return comments;
}

// Construir árbol de comentarios con respuestas anidadas
export async function getThreadedComments(instanteId: string): Promise<CommentWithReplies[]> {
  const allComments = await getCommentsByInstante(instanteId);

  // Separar comentarios raíz de respuestas
  const rootComments = allComments.filter(c => !c.parentId);
  const replies = allComments.filter(c => c.parentId);

  // Función recursiva para añadir respuestas
  function addReplies(parentId: string): CommentWithReplies[] {
    const directReplies = replies
      .filter(r => r.parentId === parentId)
      .map(r => ({
        ...r,
        replies: addReplies(r.id!),
      }));

    return directReplies;
  }

  // Constrir árbol
  return rootComments.map(comment => ({
    ...comment,
    replies: addReplies(comment.id!),
  }));
}

// Obtener un comentario por ID
export async function getCommentById(commentId: string): Promise<Comment | null> {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    editedAt: data.editedAt?.toDate?.() || data.editedAt,
    deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
  } as Comment;
}

// Actualizar un comentario
export async function updateComment(commentId: string, content: string): Promise<void> {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(docRef, {
    content,
    editedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Soft delete de un comentario
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await getCommentById(commentId);

  if (!comment) {
    throw new Error('El comentario no existe');
  }

  if (comment.userId !== userId) {
    throw new Error('No tienes permiso para eliminar este comentario');
  }

  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(docRef, {
    deletedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Moderar un comentario (cambiar estado)
export async function moderateComment(
  commentId: string,
  status: 'approved' | 'rejected' | 'spam'
): Promise<void> {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

// Obtener todos los comentarios pendientes de moderación
export async function getPendingComments(instanteId?: string): Promise<Comment[]> {
  let q: any;

  if (instanteId) {
    q = query(
      collection(db, COMMENTS_COLLECTION),
      where('instanteId', '==', instanteId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, COMMENTS_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      editedAt: data.editedAt?.toDate?.() || data.editedAt,
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }) as Comment[];
}

// Obtener conteo de comentarios de un instante
export async function getCommentCount(instanteId: string): Promise<number> {
  const comments = await getCommentsByInstante(instanteId);
  return comments.length;
}

// ==================== v0.7 - TAGS ====================

/**
 * Obtener todos los tags usados en instantes públicos
 * @returns Array de tags únicos ordenados alfabéticamente
 */
export async function getAllTags(): Promise<string[]> {
  const allInstantes = await getPublicInstantes();

  // Recopilar todos los tags únicos
  const tagsSet = new Set<string>();
  allInstantes.forEach(instante => {
    if (instante.tags) {
      instante.tags.forEach(tag => tagsSet.add(tag));
    }
  });

  // Ordenar alfabéticamente
  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Obtener instantes por tag
 * @param tag Tag a buscar
 * @returns Array de instantes con ese tag
 */
export async function getInstantesByTag(tag: string): Promise<Instante[]> {
  const allInstantes = await getPublicInstantes();

  return allInstantes.filter(instante =>
    instante.tags?.includes(tag)
  );
}

/**
 * Obtener tags más populares con conteo
 * @param limit Número máximo de tags a devolver
 * @returns Array de tags con su conteo de uso
 */
export async function getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
  const allInstantes = await getPublicInstantes();

  const tagCounts = new Map<string, number>();

  allInstantes.forEach(instante => {
    if (instante.tags) {
      instante.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  // Convertir a array y ordenar por popularidad
  const sorted = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, limit);
}

// ==================== FIN COMENTARIOS v0.6 ====================
