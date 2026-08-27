import { Database, CheckCircle2 } from "lucide-react";
import SectionCard from "../common/SectionCard";

export default function DataIntegration({ sources = [] }) {
  return (
    <SectionCard
      title="Data Integration Center"
      subtitle="Railway data sources currently available to the AI engine"
    >
      {sources.length === 0 ? (
        <p className="text-sm text-slate-500">No data sources connected.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <div
              key={source}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <Database size={17} />
                </div>

                <p className="text-sm font-semibold text-slate-700">{source}</p>
              </div>

              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
