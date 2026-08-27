import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "../common/SectionCard";

export default function AIRecommendation({ data }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <SectionCard
        title="AI Recommended Block"
        subtitle="Best coordinated maintenance opportunity"
      >
        <p className="text-sm text-slate-500">
          AI recommendation is not available yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="AI Recommended Block"
      subtitle="Best coordinated maintenance opportunity"
    >
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              <Sparkles size={13} />
              AI RECOMMENDED
            </div>

            <h4 className="mt-4 text-2xl font-bold text-slate-800">
              {data.section}
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              {data.start} — {data.end}
            </p>
          </div>

          <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-xs text-slate-400">Conflicts</p>

            <p className="text-lg font-bold text-emerald-600">
              {data.conflicts}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="Engineering" value={data.engineeringTasks} />

          <MiniStat label="S&T" value={data.signalTasks} />

          <MiniStat label="TRD" value={data.trdTasks} />
        </div>

        <div className="mt-5 space-y-2">
          <InfoRow text={`${data.totalTasks} tasks coordinated in one block`} />

          <InfoRow
            text={`${data.downtimeReduction}% estimated downtime reduction`}
          />
        </div>

        <button
          onClick={() => navigate("/ai-planner")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View Full AI Plan
          <ArrowRight size={16} />
        </button>
      </div>
    </SectionCard>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-lg font-bold text-slate-800">{value ?? 0}</p>

      <p className="mt-1 text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

function InfoRow({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <CheckCircle2 size={16} className="text-emerald-500" />
      <span>{text}</span>
    </div>
  );
}
