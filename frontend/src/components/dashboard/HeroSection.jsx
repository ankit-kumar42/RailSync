import { Sparkles, ArrowRight, Database, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 text-white sm:p-9">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-center">
        {/* Left Side */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Sparkles size={14} />
            AI-POWERED RAILWAY OPERATIONS
          </div>

          <p className="mt-6 text-sm text-slate-400">
            GOOD MORNING, CONTROL OFFICER
          </p>

          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
            Railway Maintenance Intelligence
            <span className="block text-blue-400">
              for Smarter Block Planning
            </span>
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Integrate maintenance defects, BDMS requests, train timetables,
            goods forecasts and corridor intelligence to automatically generate
            optimized maintenance blocks.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/ai-planner")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
            >
              <Sparkles size={17} />
              Generate AI Block Plan
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate("/corridor-network")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              View Network
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                AI STATUS
              </p>

              <h3 className="mt-1 text-lg font-bold">Planning Engine Ready</h3>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <StatusRow
              icon={<Database size={16} />}
              label="Railway Data Sources"
              value="7 Connected"
            />

            <StatusRow label="Block Planning" value="Ready" green />

            <StatusRow label="AI Optimizer" value="Online" green />
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-xs leading-5 text-slate-500">
              System analyzes maintenance requirements, train operations and
              corridor availability to find the best block windows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusRow({ icon, label, value, green = false }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        {icon}
        <span>{label}</span>
      </div>

      <span
        className={
          green
            ? "text-sm font-semibold text-emerald-400"
            : "text-sm font-semibold text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}
