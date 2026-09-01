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
  Train,
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

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // PREDICT RISK
  // ============================================================

  const handlePredict = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        age_years: Number(form.age_years),
        days_since_last_maintenance: Number(form.days_since_last_maintenance),
        overdue_days: Number(form.overdue_days),
        prior_failure_count: Number(form.prior_failure_count),
        traffic_load: Number(form.traffic_load),
      };

      // Basic frontend validation
      if (!Number.isFinite(payload.age_years) || payload.age_years < 0) {
        throw new Error("Asset age must be a valid number.");
      }

      if (
        !Number.isFinite(payload.days_since_last_maintenance) ||
        payload.days_since_last_maintenance < 0
      ) {
        throw new Error("Days since last maintenance must be a valid number.");
      }

      if (!Number.isFinite(payload.overdue_days) || payload.overdue_days < 0) {
        throw new Error("Overdue days must be a valid number.");
      }

      if (
        !Number.isInteger(payload.prior_failure_count) ||
        payload.prior_failure_count < 0
      ) {
        throw new Error(
          "Previous failure count must be a non-negative integer.",
        );
      }

      if (
        !Number.isFinite(payload.traffic_load) ||
        payload.traffic_load < 0 ||
        payload.traffic_load > 1
      ) {
        throw new Error("Traffic load must be between 0 and 1.");
      }

      console.log("Sending risk prediction payload:", payload);

      const response = await predictRisk(payload);

      console.log("Risk prediction response:", response);

      setResult(response);
    } catch (err) {
      console.error("Risk prediction error:", err);

      setError(err?.message || "Unable to calculate asset failure risk.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

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
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* ======================================================
            HEADER
        ======================================================= */}

       

        {/* ======================================================
            MAIN GRID
        ======================================================= */}

        <div className="grid gap-6 xl:grid-cols-[450px_1fr]">
          {/* ====================================================
              INPUT PANEL
          ==================================================== */}

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

            <form onSubmit={handlePredict} className="space-y-5">
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
                step="1"
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
                step="1"
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
                step="1"
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
                    <span>0.00 Low</span>
                    <span>0.50 Medium</span>
                    <span>1.00 High</span>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm font-bold">Prediction Failed</p>

                    <p className="mt-1 text-xs leading-5">{error}</p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
            </form>
          </div>

          {/* ====================================================
              RESULT PANEL
          ==================================================== */}

          <div className="space-y-6">
            {!result && !loading && <EmptyRiskState />}

            {loading && <LoadingRiskState />}

            {result && !loading && <RiskResult result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INPUT FIELD
// ============================================================

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
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingRiskState() {
  return (
    <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="text-center">
        <Loader2 size={45} className="mx-auto animate-spin text-blue-600" />

        <h2 className="mt-5 text-lg font-bold text-slate-800">
          Analyzing Asset Risk
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Sending the five required features to the AI risk model...
        </p>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

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
          Enter the five asset parameters on the left and run the AI model to
          calculate the probability of asset failure.
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

// ============================================================
// INFO BOX
// ============================================================

function InfoBox({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-left">
      <span className="text-blue-600">{icon}</span>

      <span className="text-xs font-semibold text-slate-600">{text}</span>
    </div>
  );
}

// ============================================================
// RESULT
// ============================================================

function RiskResult({ result }) {
  /*
   * Expected backend response:
   *
   * {
   *   failure_probability: 0.72,
   *   risk_level: "High",
   *   features: {
   *      age_years: 10,
   *      days_since_last_maintenance: 90,
   *      overdue_days: 15,
   *      prior_failure_count: 1,
   *      traffic_load: 0.7
   *   }
   * }
   *
   * The feature fallback below also supports responses where
   * the backend returns the five values directly.
   */

  const probability = Number(
    result?.failure_probability ??
      result?.probability ??
      result?.failureProbability ??
      0,
  );

  const safeProbability = Math.min(Math.max(probability, 0), 1);

  const percentage = Math.round(safeProbability * 100);

  const risk =
    result?.risk_level ??
    result?.risk ??
    result?.riskLevel ??
    getRiskFromPercentage(percentage);

  const features = result?.features ?? result ?? {};

  return (
    <>
      {/* ======================================================
          RISK CARD
      ======================================================= */}

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

      {/* ======================================================
          FEATURE CARDS
      ======================================================= */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Model Input Factors
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Asset Age"
            value={`${features.age_years ?? "—"} years`}
            icon={<Clock3 size={18} />}
          />

          <FeatureCard
            title="Maintenance Gap"
            value={`${features.days_since_last_maintenance ?? "—"} days`}
            icon={<Wrench size={18} />}
          />

          <FeatureCard
            title="Overdue Work"
            value={`${features.overdue_days ?? "—"} days`}
            icon={<AlertTriangle size={18} />}
          />

          <FeatureCard
            title="Previous Failures"
            value={`${features.prior_failure_count ?? "—"} events`}
            icon={<TrendingUp size={18} />}
          />

          <FeatureCard
            title="Traffic Load"
            value={formatTrafficLoad(features.traffic_load)}
            icon={<Train size={18} />}
          />

          <FeatureCard
            title="Risk Level"
            value={risk}
            icon={<ShieldAlert size={18} />}
          />
        </div>
      </div>

      {/* ======================================================
          DECISION
      ======================================================= */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-blue-900">
              Planning Recommendation
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800">
              Use this risk score as an input to the AI Block Planner.
              Higher-risk assets should receive higher maintenance priority when
              allocating available maintenance blocks.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// RISK GAUGE
// ============================================================

function RiskGauge({ percentage }) {
  const angle = percentage * 3.6;

  return (
    <div className="relative mx-auto h-48 w-48">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            #2563eb ${angle}deg,
            #e2e8f0 ${angle}deg
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

// ============================================================
// RISK BADGE
// ============================================================

function RiskBadge({ risk }) {
  const normalizedRisk = String(risk || "Unknown")
    .trim()
    .toLowerCase();

  const styles = {
    critical: "bg-red-100 text-red-700 border-red-200",

    high: "bg-orange-100 text-orange-700 border-orange-200",

    medium: "bg-amber-100 text-amber-700 border-amber-200",

    low: "bg-emerald-100 text-emerald-700 border-emerald-200",

    unknown: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const displayRisk =
    normalizedRisk === "critical"
      ? "Critical"
      : normalizedRisk === "high"
        ? "High"
        : normalizedRisk === "medium"
          ? "Medium"
          : normalizedRisk === "low"
            ? "Low"
            : "Unknown";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
        styles[normalizedRisk] || styles.unknown
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {displayRisk} Risk
    </div>
  );
}

// ============================================================
// FEATURE CARD
// ============================================================

function FeatureCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

// ============================================================
// RECOMMENDATION
// ============================================================

function getRecommendation(risk) {
  const normalized = String(risk || "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "critical":
      return "Immediate inspection and priority maintenance block recommended.";

    case "high":
      return "Schedule maintenance at the earliest suitable block window.";

    case "medium":
      return "Monitor asset condition and include it in upcoming maintenance planning.";

    case "low":
      return "Continue normal monitoring and scheduled preventive maintenance.";

    default:
      return "Review asset condition before scheduling maintenance.";
  }
}

// ============================================================
// FALLBACK RISK CALCULATION
// ============================================================

function getRiskFromPercentage(percentage) {
  if (percentage >= 80) {
    return "Critical";
  }

  if (percentage >= 60) {
    return "High";
  }

  if (percentage >= 30) {
    return "Medium";
  }

  return "Low";
}

// ============================================================
// TRAFFIC DISPLAY
// ============================================================

function formatTrafficLoad(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${(number * 100).toFixed(0)}%`;
}
