'use client';

import { useEffect, useState } from 'react';
import { getAllInstantes } from '@/lib/firestore';
import {
  calcularEstadisticasCompletas,
  EstadisticasCompletas,
} from '@/lib/estadisticas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasCompletas | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEstadisticas = async () => {
      try {
        const instantes = await getAllInstantes();
        const stats = await calcularEstadisticasCompletas(instantes, true); // true = incluir privados en admin
        setEstadisticas(stats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos para mostrar.</p>
      </div>
    );
  }

  // Datos para el gráfico radar
  const radarData = estadisticas.balanceAreas.map(area => ({
    area: area.nombre.substring(0, 3).toUpperCase(),
    full: area.nombre,
    count: area.count,
    emoji: area.emoji,
  }));

  // Datos para comparativa de meses
  const comparativaData = [
    {
      mes: estadisticas.comparativaMeses.mesAnterior.periodo,
      Instantes: estadisticas.comparativaMeses.mesAnterior.total,
    },
    {
      mes: estadisticas.comparativaMeses.mesActual.periodo,
      Instantes: estadisticas.comparativaMeses.mesActual.total,
    },
  ];

  // Colores para las áreas
  const COLORS = [
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
    '#a855f7'
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-500 mt-1">
          Análisis de tus patrones de escritura
        </p>
      </div>

      {/* Racha Actual */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Racha actual
            </h2>
            <p className="text-sm text-gray-500">
              {estadisticas.rachaActual === 0
                ? 'Escribe hoy para empezar tu racha'
                : `¡Sigue así!`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">
              {estadisticas.rachaActual}
            </div>
            <div className="text-sm text-gray-500">
              {estadisticas.rachaActual === 1 ? 'día' : 'días'}
            </div>
          </div>
        </div>
        {estadisticas.rachaActual > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(estadisticas.rachaActual * 5, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {estadisticas.rachaActual >= 30 ? '🔥 ¡Muy bien!' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Balance por Área */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Balance por área
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'dataMax']}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Radar
                name="Instantes"
                dataKey="count"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {estadisticas.balanceAreas.map((area, index) => (
            <div
              key={area.area}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
            >
              <span className="text-lg">{area.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {area.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {area.count} ({area.porcentaje.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparativa Temporal */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comparativa mensual
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativaData}>
              <XAxis
                dataKey="mes"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#e5e7eb"
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#e5e7eb"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="Instantes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.comparativaMeses.mesAnterior.total}
            </p>
            <p className="text-sm text-gray-500">
              {estadisticas.comparativaMeses.mesAnterior.periodo}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.comparativaMeses.mesActual.total}
            </p>
            <p className="text-sm text-gray-500">
              {estadisticas.comparativaMeses.mesActual.periodo}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Palabra más usada */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Palabra más usada
          </h2>
          {estadisticas.palabraMasUsada ? (
            <div>
              <p className="text-3xl font-bold text-violet-600 mb-1">
                &quot;{estadisticas.palabraMasUsada}&quot;
              </p>
              <p className="text-sm text-gray-500">
                Es la palabra que más repetiste en tus instantes
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              Aún no tienes suficientes instantes para analizar
            </p>
          )}
        </div>

        {/* Áreas descuidadas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Áreas por atender
          </h2>
          {estadisticas.areasDescuidadas.length > 0 ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                No escribes sobre estos temas desde hace más de 30 días:
              </p>
              <div className="flex flex-wrap gap-2">
                {estadisticas.areasDescuidadas.map(areaId => {
                  const area = estadisticas.balanceAreas.find(
                    a => a.area === areaId
                  );
                  return area ? (
                    <span
                      key={areaId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm"
                    >
                      <span>{area.emoji}</span>
                      <span>{area.nombre}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ) : (
            <p className="text-green-600 font-medium">
              ¡Excelente! Estás atendiendo todas las áreas 🎉
            </p>
          )}
        </div>
      </div>

      {/* Actividad por día (calendar heatmap) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad diaria (últimos 90 días)
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {estadisticas.actividadPorDia.slice(-90).map(({ fecha, count }) => {
              const nivel = count === 0 ? 0 : count <= 1 ? 1 : count <= 2 ? 2 : count <= 3 ? 3 : 4;
              const colores = [
                'bg-gray-100',
                'bg-violet-200',
                'bg-violet-400',
                'bg-violet-600',
                'bg-violet-800',
              ];

              return (
                <div
                  key={fecha}
                  className={`w-3 h-3 rounded-sm ${colores[nivel]} flex-shrink-0`}
                  title={`${fecha}: ${count} instantes`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100" />
              <div className="w-3 h-3 rounded-sm bg-violet-200" />
              <div className="w-3 h-3 rounded-sm bg-violet-400" />
              <div className="w-3 h-3 rounded-sm bg-violet-600" />
              <div className="w-3 h-3 rounded-sm bg-violet-800" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
