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
} from 'firebase/firestore';
import { db } from './firebase';

// Definición de las 11 áreas de vida
export const AREAS = [
  {
    id: 'trabajo',
    nombre: 'Trabajo',
    emoji: '💼',
    definicion: 'Mi oficio, el servicio que ofrezco y el valor que genero en el mundo.'
  },
  {
    id: 'aprendizaje',
    nombre: 'Aprendizaje',
    emoji: '📚',
    definicion: 'El ejercicio de expandir mi mundo interior y mis capacidades.'
  },
  {
    id: 'salud',
    nombre: 'Salud',
    emoji: '🏃',
    definicion: 'El pilar que sostiene toda mi energía, claridad y bienestar.'
  },
  {
    id: 'gestion-cultural',
    nombre: 'Gestión Cultural',
    emoji: '🎭',
    definicion: 'Construir puentes y ser un agente activo en el mundo de las ideas y el arte.'
  },
  {
    id: 'ocio',
    nombre: 'Ocio',
    emoji: '🎮',
    definicion: 'El espacio para la alegría pura, el juego y la recreación sin culpa.'
  },
  {
    id: 'creacion',
    nombre: 'Creación',
    emoji: '✨',
    definicion: 'El taller de mi alma, donde mi voz literaria encuentra forma y se expresa.'
  },
  {
    id: 'amistades',
    nombre: 'Amistades',
    emoji: '👥',
    definicion: 'Los lazos que elijo y que nutren, desafían y celebran mi camino.'
  },
  {
    id: 'familia',
    nombre: 'Familia',
    emoji: '🏠',
    definicion: 'Mi raíz, mi origen y el núcleo incondicional de mi historia.'
  },
  {
    id: 'entorno',
    nombre: 'Entorno',
    emoji: '🌱',
    definicion: 'Diseñar el espacio físico y los sistemas que me rodean para potenciar mi vida.'
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    emoji: '💰',
    definicion: 'La herramienta que me da libertad, seguridad y la capacidad de construir mis sueños.'
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología',
    emoji: '💻',
    definicion: 'El taller donde mis ideas digitales toman forma y se hacen realidad.'
  },
] as const;

export type AreaId = typeof AREAS[number]['id'];

// Interfaz para un Instante
export interface Instante {
  id?: string;
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
}

// Interfaz para crear/actualizar
export interface InstanteInput {
  titulo: string;
  fecha: string;
  area: AreaId;
  tipo: 'pensamiento' | 'accion';
  slug: string;
  content: string;
  estado: 'borrador' | 'publicado';
  privado: boolean;
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
  const q = query(
    collection(db, COLLECTION_NAME),
    where('privado', '==', false),
    where('estado', '==', 'publicado'),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
}

// Obtener instantes públicos por área
export async function getPublicInstantesByArea(areaId: string): Promise<Instante[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('area', '==', areaId),
    where('privado', '==', false),
    where('estado', '==', 'publicado'),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Instante[];
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
  const allInstantes = await getPublicInstantes(); // CAMBIO V0.2: Solo públicos publicados

  return AREAS.map(area => {
    const instantesDeArea = allInstantes.filter(i => i.area === area.id);
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
  const allInstantes = await getPublicInstantes(); // CAMBIO V0.2: Solo públicos publicados

  const pensamientos = allInstantes.filter(i => i.tipo === 'pensamiento').length;
  const acciones = allInstantes.filter(i => i.tipo === 'accion').length;
  const areasActivas = new Set(allInstantes.map(i => i.area)).size;

  return {
    totalInstantes: allInstantes.length,
    pensamientos,
    acciones,
    areasActivas,
    totalAreas: AREAS.length,
  };
}
