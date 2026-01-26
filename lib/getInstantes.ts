import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Definición de las 10 áreas de vida
export const AREAS = [
  { id: 'trabajo', nombre: 'Trabajo', emoji: '💼' },
  { id: 'aprendizaje', nombre: 'Aprendizaje', emoji: '📚' },
  { id: 'salud', nombre: 'Salud', emoji: '🏃' },
  { id: 'gestion-cultural', nombre: 'Gestión Cultural', emoji: '🎭' },
  { id: 'ocio', nombre: 'Ocio', emoji: '🎮' },
  { id: 'creacion', nombre: 'Creación', emoji: '✨' },
  { id: 'amistades', nombre: 'Amistades', emoji: '👥' },
  { id: 'familia', nombre: 'Familia', emoji: '🏠' },
  { id: 'entorno', nombre: 'Entorno', emoji: '🌱' },
  { id: 'finanzas', nombre: 'Finanzas', emoji: '💰' },
] as const;

export type AreaId = typeof AREAS[number]['id'];

// Interfaz para un Instante
export interface Instante {
  titulo: string;
  fecha: string;
  area: AreaId;
  tipo: 'pensamiento' | 'accion';
  slug: string;
  content: string;
  contentHtml?: string;
}

// Interfaz para el área con su último instante
export interface AreaConUltimoInstante {
  id: AreaId;
  nombre: string;
  emoji: string;
  ultimoInstante: Instante | null;
  totalInstantes: number;
}

// Obtiene la ruta del directorio de contenido
function getContentDirectory(): string {
  // En desarrollo y producción, usamos la ruta relativa al proyecto
  return path.join(process.cwd(), 'content');
}

// Lee todos los archivos .md de una carpeta específica
function getInstantesFromArea(areaPath: string, areaId: string): Instante[] {
  const instantes: Instante[] = [];

  if (!fs.existsSync(areaPath)) {
    return instantes;
  }

  const files = fs.readdirSync(areaPath);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(areaPath, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parseamos el frontmatter con gray-matter
    const { data, content } = matter(fileContents);

    instantes.push({
      titulo: data.titulo || 'Sin título',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      area: (data.area || areaId) as AreaId,
      tipo: data.tipo || 'pensamiento',
      slug: data.slug || file.replace('.md', ''),
      content: content,
    });
  }

  return instantes;
}

// Función principal: obtiene todos los instantes de todas las áreas
export async function getAllInstantes(): Promise<Instante[]> {
  const contentDir = getContentDirectory();
  const allInstantes: Instante[] = [];

  for (const area of AREAS) {
    const areaPath = path.join(contentDir, area.id);
    const instantes = getInstantesFromArea(areaPath, area.id);
    allInstantes.push(...instantes);
  }

  // Ordenamos por fecha descendente (más reciente primero)
  return allInstantes.sort((a, b) =>
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

// Obtiene instantes de un área específica
export async function getInstantesByArea(areaId: string): Promise<Instante[]> {
  const allInstantes = await getAllInstantes();
  return allInstantes.filter(instante => instante.area === areaId);
}

// Obtiene un instante específico por su slug y área
export async function getInstanteBySlug(areaId: string, slug: string): Promise<Instante | null> {
  const contentDir = getContentDirectory();
  const filePath = path.join(contentDir, areaId, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Convertimos el contenido Markdown a HTML
  const processedContent = await remark()
    .use(html)
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    titulo: data.titulo || 'Sin título',
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    area: (data.area || areaId) as AreaId,
    tipo: data.tipo || 'pensamiento',
    slug: data.slug || slug,
    content: content,
    contentHtml: contentHtml,
  };
}

// Obtiene todas las áreas con su último instante
export async function getAreasConUltimoInstante(): Promise<AreaConUltimoInstante[]> {
  const allInstantes = await getAllInstantes();

  return AREAS.map(area => {
    const instantesDeArea = allInstantes.filter(i => i.area === area.id);
    const ultimoInstante = instantesDeArea.length > 0 ? instantesDeArea[0] : null;

    return {
      id: area.id,
      nombre: area.nombre,
      emoji: area.emoji,
      ultimoInstante,
      totalInstantes: instantesDeArea.length,
    };
  });
}

// Obtiene información de un área específica
export function getAreaInfo(areaId: string) {
  return AREAS.find(area => area.id === areaId) || null;
}

// Obtiene estadísticas generales
export async function getEstadisticas() {
  const allInstantes = await getAllInstantes();
  const areasConInstantes = await getAreasConUltimoInstante();

  const pensamientos = allInstantes.filter(i => i.tipo === 'pensamiento').length;
  const acciones = allInstantes.filter(i => i.tipo === 'accion').length;
  const areasActivas = areasConInstantes.filter(a => a.totalInstantes > 0).length;

  return {
    totalInstantes: allInstantes.length,
    pensamientos,
    acciones,
    areasActivas,
    totalAreas: AREAS.length,
  };
}
