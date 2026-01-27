import { Instante, AREAS, AreaId } from './firestore';

// Interfaces para estadísticas
export interface ActividadPorDia {
  fecha: string; // YYYY-MM-DD
  count: number;
}

export interface BalanceArea {
  area: AreaId;
  nombre: string;
  emoji: string;
  count: number;
  porcentaje: number;
}

export interface PalabraFrecuencia {
  palabra: string;
  count: number;
}

export interface ComparativaTemporal {
  periodo: string;
  total: number;
  porArea: Record<AreaId, number>;
}

export interface EstadisticasCompletas {
  rachaActual: number;
  actividadPorDia: ActividadPorDia[];
  balanceAreas: BalanceArea[];
  palabraMasUsada: string | null;
  areasDescuidadas: AreaId[];
  comparativaMeses: {
    mesActual: ComparativaTemporal;
    mesAnterior: ComparativaTemporal;
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

export async function calcularEstadisticasCompletas(
  instantes: Instante[]
): Promise<EstadisticasCompletas> {
  const instantesVisibles = filtrarInstantesVisibles(instantes);

  return {
    rachaActual: calcularRachaActual(instantesVisibles),
    actividadPorDia: calcularActividadPorDia(instantesVisibles),
    balanceAreas: calcularBalanceAreas(instantesVisibles),
    palabraMasUsada: encontrarPalabraMasUsada(instantesVisibles),
    areasDescuidadas: encontrarAreasDescuidadas(instantesVisibles),
    comparativaMeses: calcularComparativaMeses(instantesVisibles),
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function filtrarInstantesVisibles(instantes: Instante[]): Instante[] {
  return instantes.filter(i => {
    const esPublico = i.privado === false || !i.hasOwnProperty('privado');
    const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
    return esPublico && esVisible;
  });
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s]/g, '') // Solo letras, números y espacios
    .trim();
}

// ============================================================================
// RACHA ACTUAL (STREAK)
// ============================================================================

export function calcularRachaActual(instantes: Instante[]): number {
  if (instantes.length === 0) return 0;

  // Ordenar por fecha descendente
  const ordenados = [...instantes].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Obtener fechas únicas (YYYY-MM-DD)
  const fechasUnicas = new Set(
    ordenados.map(i => new Date(i.fecha).toISOString().split('T')[0])
  );

  const hoy = new Date().toISOString().split('T')[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Si no hay actividad hoy ni ayer, la racha es 0
  if (!fechasUnicas.has(hoy) && !fechasUnicas.has(ayer)) {
    return 0;
  }

  // Calcular racha desde el último día activo
  let racha = 0;
  let fechaActual = fechasUnicas.has(hoy) ? new Date(hoy) : new Date(ayer);

  while (true) {
    const fechaStr = fechaActual.toISOString().split('T')[0];
    if (fechasUnicas.has(fechaStr)) {
      racha++;
      fechaActual = new Date(fechaActual.getTime() - 86400000); // Restar 1 día
    } else {
      break;
    }
  }

  return racha;
}

// ============================================================================
// ACTIVIDAD POR DÍA (CALENDAR HEATMAP)
// ============================================================================

export function calcularActividadPorDia(
  instantes: Instante[],
  dias: number = 365
): ActividadPorDia[] {
  const actividad: Record<string, number> = {};

  // Inicializar últimos N días con 0
  const hoy = new Date();
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(hoy.getTime() - i * 86400000);
    const fechaStr = fecha.toISOString().split('T')[0];
    actividad[fechaStr] = 0;
  }

  // Contar instantes por día
  instantes.forEach(instante => {
    const fechaStr = new Date(instante.fecha).toISOString().split('T')[0];
    if (actividad.hasOwnProperty(fechaStr)) {
      actividad[fechaStr]++;
    }
  });

  // Convertir a array y ordenar
  return Object.entries(actividad)
    .map(([fecha, count]) => ({ fecha, count }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ============================================================================
// BALANCE POR ÁREA (GRÁFICO RADAR)
// ============================================================================

export function calcularBalanceAreas(instantes: Instante[]): BalanceArea[] {
  const total = instantes.length;
  if (total === 0) {
    return AREAS.map(area => ({
      area: area.id,
      nombre: area.nombre,
      emoji: area.emoji,
      count: 0,
      porcentaje: 0,
    }));
  }

  const conteoPorArea: Record<AreaId, number> = {} as Record<AreaId, number>;

  // Inicializar
  AREAS.forEach(area => {
    conteoPorArea[area.id] = 0;
  });

  // Contar
  instantes.forEach(instante => {
    conteoPorArea[instante.area]++;
  });

  // Crear array con porcentajes
  return AREAS.map(area => ({
    area: area.id,
    nombre: area.nombre,
    emoji: area.emoji,
    count: conteoPorArea[area.id],
    porcentaje: (conteoPorArea[area.id] / total) * 100,
  }));
}

// ============================================================================
// PALABRA MÁS USADA
// ============================================================================

export function encontrarPalabraMasUsada(
  instantes: Instante[],
  minLongitud: number = 4
): string | null {
  const frecuencia: Record<string, number> = {};

  // Palabras comunes a ignorar (stopwords en español)
  const stopwords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'es', 'un', 'se',
    'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar',
    'tener', 'le', 'lo', 'todo', 'pero', 'mas', 'hacer', 'o',
    'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'si', 'ya',
    'entre', 'cuando', 'todo', 'uno', 'desde', 'ser', 'donde',
    'mi', 'me', 'te', 'ti', 'tu', 'nos', 'nosotros', 'vosotros',
    'el', 'ellos', 'ellas', 'eso', 'eso', 'esa', 'esas', 'esos',
  ]);

  instantes.forEach(instante => {
    const palabras = normalizarTexto(instante.content)
      .split(/\s+/)
      .filter(p => p.length >= minLongitud && !stopwords.has(p));

    palabras.forEach(palabra => {
      frecuencia[palabra] = (frecuencia[palabra] || 0) + 1;
    });
  });

  // Encontrar la más frecuente
  let maxPalabra: string | null = null;
  let maxCount = 0;

  Object.entries(frecuencia).forEach(([palabra, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxPalabra = palabra;
    }
  });

  return maxPalabra;
}

// ============================================================================
// ÁREAS DESCUIDADAS (TENDENCIAS)
// ============================================================================

export function encontrarAreasDescuidadas(
  instantes: Instante[],
  umbralDias: number = 30
): AreaId[] {
  const hoy = new Date();
  const fechaLimite = new Date(hoy.getTime() - umbralDias * 86400000);

  // Último instante por área
  const ultimoPorArea: Record<AreaId, Date | null> = {} as Record<AreaId, Date | null>;

  AREAS.forEach(area => {
    ultimoPorArea[area.id] = null;
  });

  instantes.forEach(instante => {
    const fechaInstante = new Date(instante.fecha);
    const ultimo = ultimoPorArea[instante.area];

    if (!ultimo || fechaInstante > ultimo) {
      ultimoPorArea[instante.area] = fechaInstante;
    }
  });

  // Áreas sin actividad en el umbral de días (o nunca usadas)
  return AREAS
    .filter(area => {
      const ultimo = ultimoPorArea[area.id];
      return !ultimo || ultimo < fechaLimite;
    })
    .map(area => area.id);
}

// ============================================================================
// COMPARATIVA TEMPORAL (MES ACTUAL VS ANTERIOR)
// ============================================================================

export function calcularComparativaMeses(instantes: Instante[]): {
  mesActual: ComparativaTemporal;
  mesAnterior: ComparativaTemporal;
} {
  const hoy = new Date();

  // Primer día del mes actual
  const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  // Primer día del mes anterior
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

  // Último día del mes anterior
  const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const mesActual = filtrarPorPeriodo(instantes, primerDiaMesActual, hoy);
  const mesAnterior = filtrarPorPeriodo(
    instantes,
    primerDiaMesAnterior,
    ultimoDiaMesAnterior
  );

  return {
    mesActual: crearComparativa(mesActual, formatMes(hoy.getFullYear(), hoy.getMonth())),
    mesAnterior: crearComparativa(
      mesAnterior,
      formatMes(hoy.getFullYear(), hoy.getMonth() - 1)
    ),
  };
}

function filtrarPorPeriodo(
  instantes: Instante[],
  inicio: Date,
  fin: Date
): Instante[] {
  return instantes.filter(i => {
    const fecha = new Date(i.fecha);
    return fecha >= inicio && fecha <= fin;
  });
}

function crearComparativa(
  instantes: Instante[],
  periodo: string
): ComparativaTemporal {
  const porArea: Record<AreaId, number> = {} as Record<AreaId, number>;

  AREAS.forEach(area => {
    porArea[area.id] = 0;
  });

  instantes.forEach(instante => {
    porArea[instante.area]++;
  });

  return {
    periodo,
    total: instantes.length,
    porArea,
  };
}

function formatMes(año: number, mes: number): string {
  const nombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${nombres[mes]} ${año}`;
}
