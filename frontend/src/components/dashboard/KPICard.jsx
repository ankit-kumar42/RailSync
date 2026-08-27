export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  accent = "blue",
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-slate-800">{value}</h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            colors[accent] || colors.blue
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
