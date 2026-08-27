import { CalendarCheck, Clock3, AlertCircle, BarChart3 } from "lucide-react";

import SectionCard from "../common/SectionCard";

export default function HistoricalPerformance() {
  const metrics = [
    {
      label: "Total Blocks",
      value: "156",
      icon: CalendarCheck,
    },
    {
      label: "Avg Duration",
      value: "2.8 hrs",
      icon: Clock3,
    },
    {
      label: "Delayed Blocks",
      value: "18",
      icon: AlertCircle,
    },
    {
      label: "Utilization",
      value: "76%",
      icon: BarChart3,
    },
  ];

  return (
    <SectionCard
      title="Historical Block Performance"
      subtitle="Insights generated from historical block records"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-800">
                {metric.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">{metric.label}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
