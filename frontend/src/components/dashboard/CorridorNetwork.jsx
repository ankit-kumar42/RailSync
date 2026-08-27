import { Route, ArrowRight } from "lucide-react";
import SectionCard from "../common/SectionCard";

export default function CorridorNetwork() {
  const sections = [
    { id: "SEC-0001", status: "normal" },
    { id: "SEC-0002", status: "critical" },
    { id: "SEC-0003", status: "high" },
    { id: "SEC-0004", status: "normal" },
    { id: "SEC-0005", status: "normal" },
  ];

  const statusClass = {
    normal: "bg-emerald-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <SectionCard
      title="Railway Corridor Network"
      subtitle="Operational health across connected sections"
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-[650px] items-center justify-between py-8">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${
                    statusClass[section.status]
                  }`}
                >
                  <Route size={18} />
                </div>

                <span className="mt-3 whitespace-nowrap text-[10px] font-bold text-slate-500">
                  {section.id}
                </span>
              </div>

              {index !== sections.length - 1 && (
                <div className="mx-2 flex flex-1 items-center">
                  <div className="h-1 flex-1 rounded-full bg-slate-200" />

                  <ArrowRight size={15} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-5 text-xs">
        <Legend color="bg-emerald-500" label="Normal" />
        <Legend color="bg-orange-500" label="High Risk" />
        <Legend color="bg-red-500" label="Critical" />
      </div>
    </SectionCard>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
