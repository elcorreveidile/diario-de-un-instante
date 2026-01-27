interface StatsProps {
  totalInstantes: number;
  pensamientos: number;
  acciones: number;
  areasActivas: number;
  totalAreas?: number;
}

export default function Stats({ totalInstantes, pensamientos, acciones, areasActivas, totalAreas = 11 }: StatsProps) {
  const stats = [
    { label: 'Total instantes', value: totalInstantes, color: 'text-gray-900' },
    { label: 'Pensamientos', value: pensamientos, color: 'text-violet-600' },
    { label: 'Acciones', value: acciones, color: 'text-emerald-600' },
    { label: 'Áreas activas', value: `${areasActivas}/${totalAreas}`, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-50 rounded-lg p-4 text-center"
        >
          <p className={`text-2xl font-semibold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
