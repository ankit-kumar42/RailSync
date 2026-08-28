import { useState } from "react";

import {
  Gauge,
  BrainCircuit,
  Wrench,
  Route,
  Train,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ArrowUp,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";

import { calculatePriority } from "../services/priorityApi";

export default function MaintenancePriority() {
  const [form, setForm] = useState({
    task: "",
    asset: "",
    corridor: "",
    traffic_load: 0.7,
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     CALCULATE
  ========================================================= */

  const handleCalculate = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        task: form.task,
        asset: form.asset,
        corridor: form.corridor,
        traffic_load: Number(form.traffic_load),
      };

      console.log("Priority request:", payload);

      const response = await calculatePriority(payload);

      console.log("Priority response:", response);

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to calculate maintenance priority.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setForm({
      task: "",
      asset: "",
      corridor: "",
      traffic_load: 0.7,
    });

    setResult(null);

    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                  <BrainCircuit size={16} />
                  Intelligent Maintenance Planning
                </div>

                <h1 className="text-3xl font-bold">
                  Maintenance Priority Engine
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Calculate the operational priority of a railway maintenance
                  task using asset condition, corridor information and traffic
                  load.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    PRIORITY ENGINE ONLINE
                  </p>

                  <p className="text-xs text-slate-400">
                    AI decision service ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-[500px_1fr]">
          {/* =================================================
              INPUT FORM
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Maintenance Request
                </h2>

                <p className="text-xs text-slate-500">
                  Enter task and operational details.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* TASK */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Maintenance Task
                </label>

                <textarea
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Example: Rail fracture inspection and track repair"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ASSET */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Asset
                </label>

                <div className="relative">
                  <Wrench
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="asset"
                    value={form.asset}
                    onChange={handleChange}
                    placeholder="Example: Track Section SEC-0002"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* CORRIDOR */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Corridor
                </label>

                <div className="relative">
                  <Route
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="corridor"
                    value={form.corridor}
                    onChange={handleChange}
                    placeholder="Example: Delhi - Ambala Corridor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* TRAFFIC LOAD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Traffic Load
                  </label>

                  <span className="font-bold text-blue-700">
                    {(Number(form.traffic_load) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="range"
                    name="traffic_load"
                    min="0"
                    max="1"
                    step="0.01"
                    value={form.traffic_load}
                    onChange={handleChange}
                    className="w-full"
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                    <span>Low</span>

                    <span>Medium</span>

                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertTriangle size={18} />

                  <div>
                    <p className="text-sm font-bold">Calculation Failed</p>

                    <p className="mt-1 text-xs">{error}</p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>

                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={17} />
                      Calculate Priority
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              RESULT
          ================================================= */}

          <div>
            {!result ? <EmptyState /> : <PriorityResult result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-w-md px-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Gauge size={40} />
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-800">
          Maintenance Priority Assessment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter maintenance task information to determine how urgently the task
          should be considered by the railway planning system.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Info icon={<Wrench size={16} />} text="Asset" />

          <Info icon={<Route size={16} />} text="Corridor" />

          <Info icon={<Train size={16} />} text="Traffic Load" />

          <Info icon={<Gauge size={16} />} text="Priority Score" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO
============================================================ */

function Info({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-left">
      <span className="text-blue-600">{icon}</span>

      <span className="text-xs font-semibold text-slate-600">{text}</span>
    </div>
  );
}

/* ============================================================
   RESULT
============================================================ */

function PriorityResult({ result }) {
  /*
    Your PriorityResponse schema may use different names.

    These fallbacks allow the frontend to work with
    common naming conventions.
  */

  const score = Number(
    result.priority_score ?? result.score ?? result.priority ?? 0,
  );

  const percentage = score <= 1 ? Math.round(score * 100) : Math.round(score);

  const priority =
    result.priority_level ??
    result.priority ??
    result.level ??
    getPriorityLevel(percentage);

  const recommendation =
    result.recommendation ?? result.action ?? getRecommendation(priority);

  return (
    <div className="space-y-6">
      {/* =================================================
          SCORE CARD
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <BrainCircuit size={16} />
              AI Priority Assessment
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              Maintenance Priority
            </h2>
          </div>

          <PriorityBadge priority={priority} />
        </div>

        {/* SCORE */}

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[230px_1fr]">
          <PriorityGauge percentage={percentage} />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Priority Score
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              {percentage}

              <span className="text-2xl text-slate-400">/100</span>
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The priority engine has classified this maintenance activity as{" "}
              <strong className="text-slate-700">{priority}</strong> priority.
            </p>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 size={19} className="text-blue-600" />

                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Recommended Action
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    {recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          INPUT SUMMARY
      ================================================= */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Planning Factors
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FactorCard
            title="Maintenance Task"
            value={result.features?.task || result.task || "Provided task"}
            icon={<Wrench size={18} />}
          />

          <FactorCard
            title="Asset"
            value={result.features?.asset || result.asset || "Selected asset"}
            icon={<ShieldAlert size={18} />}
          />

          <FactorCard
            title="Corridor"
            value={
              result.features?.corridor ||
              result.corridor ||
              "Selected corridor"
            }
            icon={<Route size={18} />}
          />

          <FactorCard
            title="Traffic Load"
            value={`${(
              Number(
                result.features?.traffic_load ?? result.traffic_load ?? 0,
              ) * 100
            ).toFixed(0)}%`}
            icon={<Train size={18} />}
          />
        </div>
      </div>

      {/* =================================================
          AI EXPLANATION
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BrainCircuit size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              How this priority helps the planner
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The calculated priority can be passed to the AI Block Planner.
              High-priority maintenance activities can be scheduled earlier
              while considering available corridors, train movements and
              maintenance block windows.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Step
                number="01"
                title="Prioritize"
                text="Rank maintenance activities."
              />

              <Step
                number="02"
                title="Coordinate"
                text="Check corridor and train conflicts."
              />

              <Step
                number="03"
                title="Schedule"
                text="Assign the best available block."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PRIORITY GAUGE
============================================================ */

function PriorityGauge({ percentage }) {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="relative mx-auto h-48 w-48">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            #2563eb ${safePercentage * 3.6}deg,
            #e2e8f0 ${safePercentage * 3.6}deg
          )`,
        }}
      />

      <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
        <ArrowUp size={22} className="text-blue-600" />

        <span className="text-3xl font-bold text-slate-900">
          {safePercentage}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Priority
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({ priority }) {
  const normalized = String(priority).toLowerCase();

  let classes = "bg-slate-100 text-slate-700 border-slate-200";

  if (normalized.includes("critical")) {
    classes = "bg-red-100 text-red-700 border-red-200";
  } else if (normalized.includes("high")) {
    classes = "bg-orange-100 text-orange-700 border-orange-200";
  } else if (normalized.includes("medium")) {
    classes = "bg-amber-100 text-amber-700 border-amber-200";
  } else if (normalized.includes("low")) {
    classes = "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${classes}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />

      {priority}
    </span>
  );
}

/* ============================================================
   FACTOR CARD
============================================================ */

function FactorCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({ number, title, text }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <span className="text-xs font-bold text-blue-600">{number}</span>

      <p className="mt-1 text-sm font-bold text-slate-700">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

/* ============================================================
   PRIORITY LEVEL FALLBACK
============================================================ */

function getPriorityLevel(score) {
  if (score >= 80) {
    return "Critical";
  }

  if (score >= 60) {
    return "High";
  }

  if (score >= 30) {
    return "Medium";
  }

  return "Low";
}

/* ============================================================
   RECOMMENDATION FALLBACK
============================================================ */

function getRecommendation(priority) {
  const value = String(priority).toLowerCase();

  if (value.includes("critical")) {
    return "Schedule immediate maintenance in the earliest safe block.";
  }

  if (value.includes("high")) {
    return "Schedule maintenance at the earliest suitable block window.";
  }

  if (value.includes("medium")) {
    return "Include this activity in the upcoming maintenance plan.";
  }

  return "Continue monitoring and schedule during routine maintenance.";
}
