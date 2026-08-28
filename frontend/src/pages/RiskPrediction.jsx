import { useState } from "react";

import {
  ShieldAlert,
  BrainCircuit,
  Activity,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  RefreshCw,
  Loader2,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { predictRisk } from "../services/predictRisk.js";

export default function RiskPrediction() {
  const [form, setForm] = useState({
    age_years: 10,
    days_since_last_maintenance: 90,
    overdue_days: 15,
    prior_failure_count: 1,
    traffic_load: 0.7,
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     PREDICT RISK
  ========================================================= */

  const handlePredict = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        age_years: Number(form.age_years),

        days_since_last_maintenance: Number(form.days_since_last_maintenance),

        overdue_days: Number(form.overdue_days),

        prior_failure_count: Number(form.prior_failure_count),

        traffic_load: Number(form.traffic_load),
      };

      const response = await predictRisk(payload);

      console.log("Risk response:", response);

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to calculate asset failure risk.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setForm({
      age_years: 10,
      days_since_last_maintenance: 90,
      overdue_days: 15,
      prior_failure_count: 1,
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
                  AI Asset Intelligence
                </div>

                <h1 className="text-3xl font-bold">Asset Risk Prediction</h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Predict the probability of infrastructure asset failure using
                  maintenance history, asset age, overdue work, previous
                  failures and traffic load.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    RISK ENGINE ONLINE
                  </p>

                  <p className="text-xs text-slate-400">
                    ML prediction service ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-[480px_1fr]">
          {/* =================================================
              INPUT PANEL
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Wrench size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Asset Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Enter asset condition parameters.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* AGE */}

              <InputField
                label="Asset Age"
                name="age_years"
                value={form.age_years}
                onChange={handleChange}
                unit="years"
                icon={<Clock3 size={16} />}
                min="0"
                step="0.1"
              />

              {/* MAINTENANCE */}

              <InputField
                label="Days Since Last Maintenance"
                name="days_since_last_maintenance"
                value={form.days_since_last_maintenance}
                onChange={handleChange}
                unit="days"
                icon={<Wrench size={16} />}
                min="0"
              />

              {/* OVERDUE */}

              <InputField
                label="Overdue Maintenance"
                name="overdue_days"
                value={form.overdue_days}
                onChange={handleChange}
                unit="days"
                icon={<AlertTriangle size={16} />}
                min="0"
              />

              {/* FAILURES */}

              <InputField
                label="Previous Failures"
                name="prior_failure_count"
                value={form.prior_failure_count}
                onChange={handleChange}
                unit="events"
                icon={<TrendingUp size={16} />}
                min="0"
              />

              {/* TRAFFIC */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Traffic Load
                  </label>

                  <span className="text-sm font-bold text-blue-700">
                    {Number(form.traffic_load).toFixed(2)}
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
                  <AlertTriangle size={18} className="mt-0.5" />

                  <div>
                    <p className="text-sm font-bold">Prediction Failed</p>

                    <p className="mt-1 text-xs">{error}</p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>

                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={17} />
                      Predict Risk
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              RESULT PANEL
          ================================================= */}

          <div className="space-y-6">
            {!result && <EmptyRiskState />}

            {result && <RiskResult result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INPUT FIELD
============================================================ */

function InputField({
  label,
  name,
  value,
  onChange,
  unit,
  icon,
  min,
  step = "1",
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyRiskState() {
  return (
    <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-w-md px-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldAlert size={38} />
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-800">
          Asset Risk Assessment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter asset maintenance and operational parameters on the left to
          calculate the probability of failure.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <InfoBox icon={<Activity size={16} />} text="Failure Probability" />

          <InfoBox icon={<Gauge size={16} />} text="Risk Classification" />

          <InfoBox icon={<Clock3 size={16} />} text="Maintenance Urgency" />

          <InfoBox icon={<ShieldAlert size={16} />} text="Asset Safety" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({ icon, text }) {
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

function RiskResult({ result }) {
  const probability = Number(result.failure_probability || 0);

  const percentage = Math.round(probability * 100);

  const risk = result.risk_level || "Unknown";

  return (
    <>
      {/* RISK CARD */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <ShieldAlert size={16} />
              AI Risk Assessment
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              Asset Failure Risk
            </h2>
          </div>

          <RiskBadge risk={risk} />
        </div>

        {/* PROBABILITY */}

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[220px_1fr]">
          <RiskGauge percentage={percentage} />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Failure Probability
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              {percentage}%
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The ML model estimates a{" "}
              <strong className="text-slate-700">{percentage}%</strong>{" "}
              probability that this asset may experience a failure based on the
              supplied operational and maintenance parameters.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">
                Recommended Action
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {getRecommendation(risk)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE CARDS */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Model Input Factors
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Asset Age"
            value={`${result.features?.age_years ?? "—"} years`}
            icon={<Clock3 size={18} />}
          />

          <FeatureCard
            title="Maintenance Gap"
            value={`${result.features?.days_since_last_maintenance ?? "—"} days`}
            icon={<Wrench size={18} />}
          />

          <FeatureCard
            title="Overdue Work"
            value={`${result.features?.overdue_days ?? "—"} days`}
            icon={<AlertTriangle size={18} />}
          />

          <FeatureCard
            title="Previous Failures"
            value={`${result.features?.prior_failure_count ?? "—"} events`}
            icon={<TrendingUp size={18} />}
          />

          <FeatureCard
            title="Traffic Load"
            value={`${(
              Number(result.features?.traffic_load ?? 0) * 100
            ).toFixed(0)}%`}
            icon={<TrainIcon />}
          />

          <FeatureCard
            title="Risk Level"
            value={risk}
            icon={<ShieldAlert size={18} />}
          />
        </div>
      </div>

      {/* DECISION */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <CheckCircle2 size={20} className="mt-0.5 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-blue-900">
              Planning Recommendation
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800">
              Use this risk score as an input to the AI Block Planner.
              Higher-risk assets should receive higher maintenance priority and
              should be considered when allocating available maintenance blocks.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   RISK GAUGE
============================================================ */

function RiskGauge({ percentage }) {
  return (
    <div className="relative mx-auto h-48 w-48">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            #2563eb ${percentage * 3.6}deg,
            #e2e8f0 ${percentage * 3.6}deg
          )`,
        }}
      />

      <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-3xl font-bold text-slate-900">{percentage}%</span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Probability
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   RISK BADGE
============================================================ */

function RiskBadge({ risk }) {
  const styles = {
    Critical: "bg-red-100 text-red-700 border-red-200",

    High: "bg-orange-100 text-orange-700 border-orange-200",

    Medium: "bg-amber-100 text-amber-700 border-amber-200",

    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
        styles[risk] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {risk} Risk
    </div>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

/* ============================================================
   RECOMMENDATION
============================================================ */

function getRecommendation(risk) {
  switch (risk) {
    case "Critical":
      return "Immediate inspection and priority maintenance block recommended.";

    case "High":
      return "Schedule maintenance at the earliest suitable block window.";

    case "Medium":
      return "Monitor asset condition and include in upcoming maintenance planning.";

    case "Low":
      return "Continue normal monitoring and scheduled preventive maintenance.";

    default:
      return "Review asset condition before scheduling maintenance.";
  }
}

/* ============================================================
   TRAIN ICON
============================================================ */

function TrainIcon() {
  return <Activity size={18} />;
}
