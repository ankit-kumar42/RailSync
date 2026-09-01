
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
  CalendarDays,
  History,
  Siren,
} from "lucide-react";

import { calculatePriority } from "../services/priorityApi";

/* ============================================================
   DEFAULT FORM
============================================================ */

const DEFAULT_FORM = {
  task_id: "",
  severity: "Medium",
  overdue_days: 15,
  last_maintenance_date: "2026-01-01",

  asset_id: "",
  asset_name: "",
  criticality_rating: 3,
  age_years: 10,
  historical_failure_count: 1,

  corridor_id: "",
  corridor_name: "",
  operational_criticality: 3,

  traffic_load: 0.7,
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function MaintenancePriority() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================
     HANDLE INPUT
  ========================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* ==========================================================
     CALCULATE PRIORITY
  ========================================================== */

  const handleCalculate = async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * Frontend validation
       */

      if (!form.severity) {
        throw new Error("Please select task severity.");
      }

      if (!form.last_maintenance_date) {
        throw new Error("Please select the last maintenance date.");
      }

      if (
        form.criticality_rating === "" ||
        Number(form.criticality_rating) < 1 ||
        Number(form.criticality_rating) > 5
      ) {
        throw new Error("Asset criticality must be between 1 and 5.");
      }

      if (
        form.operational_criticality === "" ||
        Number(form.operational_criticality) < 1 ||
        Number(form.operational_criticality) > 5
      ) {
        throw new Error(
          "Operational criticality must be between 1 and 5."
        );
      }

      /*
       * EXACT backend structure:
       *
       * {
       *   task: {...},
       *   asset: {...},
       *   corridor: {...},
       *   traffic_load: number
       * }
       */

      const payload = {
        task: {
          task_id: form.task_id || "TASK-001",
          severity: String(form.severity).trim(),
          overdue_days: Number(form.overdue_days),
          last_maintenance_date: form.last_maintenance_date,
        },

        asset: {
          asset_id: form.asset_id || "ASSET-001",
          name: form.asset_name || "Railway Asset",
          criticality_rating: Number(form.criticality_rating),
          age_years: Number(form.age_years),
          historical_failure_count: Number(
            form.historical_failure_count
          ),
        },

        corridor: {
          corridor_id: form.corridor_id || "COR-001",
          name: form.corridor_name || "Railway Corridor",
          operational_criticality: Number(
            form.operational_criticality
          ),
        },

        traffic_load: Number(form.traffic_load),
      };

      console.log(
        "Priority request:",
        JSON.stringify(payload, null, 2)
      );

      const response = await calculatePriority(payload);

      console.log("Priority response:", response);

      setResult(response);
    } catch (err) {
      console.error("Priority calculation error:", err);

      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to calculate maintenance priority.";

      /*
       * FastAPI may return detail as an array.
       */

      if (Array.isArray(backendMessage)) {
        setError(
          backendMessage
            .map((item) => item?.msg || "Validation error")
            .join(", ")
        );
      } else {
        setError(String(backendMessage));
      }

      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    setForm({ ...DEFAULT_FORM });
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1700px]">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Gauge size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Maintenance Priority
              </h1>

              <p className="text-sm text-slate-500">
                AI-powered maintenance priority assessment
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            HORIZONTAL INPUT FORM
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Priority Inputs
                </h2>

                <p className="text-xs text-slate-500">
                  Enter task, asset, corridor and traffic information.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              HORIZONTAL FORM
          ================================================== */}

          <div className="grid gap-5 xl:grid-cols-4">

            {/* =================================================
                TASK
            ================================================= */}

            <FormGroup title="Task Information" icon={<ClipboardList size={16} />}>

              <InputField
                label="Task ID"
                name="task_id"
                value={form.task_id}
                onChange={handleChange}
                placeholder="TASK-001"
              />

              <SelectField
                label="Severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                icon={<Siren size={16} />}
                options={[
                  "Low",
                  "Medium",
                  "High",
                  "Critical",
                ]}
              />

              <NumberField
                label="Overdue Days"
                name="overdue_days"
                value={form.overdue_days}
                onChange={handleChange}
                min="0"
                step="1"
                unit="days"
                icon={<AlertTriangle size={16} />}
              />

              <DateField
                label="Last Maintenance"
                name="last_maintenance_date"
                value={form.last_maintenance_date}
                onChange={handleChange}
              />

            </FormGroup>

            {/* =================================================
                ASSET
            ================================================= */}

            <FormGroup title="Asset Information" icon={<Wrench size={16} />}>

              <InputField
                label="Asset ID"
                name="asset_id"
                value={form.asset_id}
                onChange={handleChange}
                placeholder="ASSET-001"
              />

              <InputField
                label="Asset Name"
                name="asset_name"
                value={form.asset_name}
                onChange={handleChange}
                placeholder="Track Section A"
              />

              <NumberField
                label="Criticality Rating"
                name="criticality_rating"
                value={form.criticality_rating}
                onChange={handleChange}
                min="1"
                max="5"
                step="1"
                unit="1–5"
                icon={<ShieldAlert size={16} />}
              />

              <NumberField
                label="Asset Age"
                name="age_years"
                value={form.age_years}
                onChange={handleChange}
                min="0"
                step="0.1"
                unit="years"
                icon={<History size={16} />}
              />

              <NumberField
                label="Historical Failures"
                name="historical_failure_count"
                value={form.historical_failure_count}
                onChange={handleChange}
                min="0"
                step="1"
                unit="events"
                icon={<AlertTriangle size={16} />}
              />

            </FormGroup>

            {/* =================================================
                CORRIDOR
            ================================================= */}

            <FormGroup title="Corridor Information" icon={<Route size={16} />}>

              <InputField
                label="Corridor ID"
                name="corridor_id"
                value={form.corridor_id}
                onChange={handleChange}
                placeholder="COR-001"
              />

              <InputField
                label="Corridor Name"
                name="corridor_name"
                value={form.corridor_name}
                onChange={handleChange}
                placeholder="Delhi - Ambala"
              />

              <NumberField
                label="Operational Criticality"
                name="operational_criticality"
                value={form.operational_criticality}
                onChange={handleChange}
                min="1"
                max="5"
                step="1"
                unit="1–5"
                icon={<Route size={16} />}
              />

            </FormGroup>

            {/* =================================================
                TRAFFIC
            ================================================= */}

            <FormGroup title="Traffic Information" icon={<Train size={16} />}>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Traffic Load
                  </label>

                  <span className="text-sm font-bold text-blue-700">
                    {(
                      Number(form.traffic_load) * 100
                    ).toFixed(0)}
                    %
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
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Train
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-blue-900">
                      Direct Traffic Mode
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-800">
                      The selected traffic load is sent directly
                      to the priority engine.
                    </p>
                  </div>
                </div>
              </div>

            </FormGroup>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-bold">
                  Priority Calculation Failed
                </p>

                <p className="mt-1 text-xs leading-5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="mt-6 flex flex-col justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
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

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <div className="mt-6">

          {!result ? (
            <EmptyState />
          ) : (
            <PriorityResult result={result} />
          )}

        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORM GROUP
============================================================ */

function FormGroup({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-700">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {children}
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
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* ============================================================
   SELECT FIELD
============================================================ */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  icon,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            icon ? "pl-9" : "pl-3"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}

/* ============================================================
   NUMBER FIELD
============================================================ */

function NumberField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  icon,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-16 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
            {unit}
          </span>
        )}

      </div>
    </div>
  );
}

/* ============================================================
   DATE FIELD
============================================================ */

function DateField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        <CalendarDays
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Gauge size={32} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-800">
        Priority Assessment
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Enter the maintenance information above and calculate
        the AI-powered priority score. The result will appear here.
      </p>

      <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">

        <Info
          icon={<Siren size={16} />}
          text="Task Severity"
        />

        <Info
          icon={<Wrench size={16} />}
          text="Asset Criticality"
        />

        <Info
          icon={<Route size={16} />}
          text="Corridor Criticality"
        />

        <Info
          icon={<Train size={16} />}
          text="Traffic Load"
        />

        <Info
          icon={<ShieldAlert size={16} />}
          text="Failure Risk"
        />

        <Info
          icon={<Gauge size={16} />}
          text="Priority Score"
        />

      </div>
    </div>
  );
}

/* ============================================================
   INFO
============================================================ */

function Info({ icon, text }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-3">

      <span className="text-blue-600">
        {icon}
      </span>

      <span className="text-xs font-semibold text-slate-600">
        {text}
      </span>

    </div>
  );
}

/* ============================================================
   PRIORITY RESULT
============================================================ */

function PriorityResult({ result }) {
  const rawScore = Number(
    result?.priority_score ?? 0
  );

  const score = Math.min(
    1,
    Math.max(0, rawScore)
  );

  const percentage = Math.round(
    score * 100
  );

  const priority = getPriorityLevel(
    percentage
  );

  return (
    <div className="space-y-6">

      {/* ======================================================
          SCORE
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <BrainCircuit size={15} />
              AI Priority Assessment
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              Maintenance Priority
            </h2>

            {result?.task_id && (
              <p className="mt-1 text-xs text-slate-400">
                Task ID: {result.task_id}
              </p>
            )}
          </div>

          <PriorityBadge priority={priority} />

        </div>

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[220px_1fr]">

          <PriorityGauge percentage={percentage} />

          <div>

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Priority Score
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              {percentage}
              <span className="text-2xl text-slate-400">
                /100
              </span>
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The priority engine calculated a normalized
              score of{" "}
              <strong className="text-slate-700">
                {rawScore.toFixed(4)}
              </strong>{" "}
              and classified this activity as{" "}
              <strong className="text-slate-700">
                {priority}
              </strong>{" "}
              priority.
            </p>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">

              <div className="flex gap-3">

                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-xs font-bold text-blue-900">
                    Recommended Action
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    {getRecommendation(priority)}
                  </p>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MODEL SCORES
      ====================================================== */}

      <div>

        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Priority Model Scores
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ScoreCard
            title="Severity"
            score={result?.severity_score}
          />

          <ScoreCard
            title="Overdue"
            score={result?.overdue_score}
          />

          <ScoreCard
            title="Maintenance Age"
            score={result?.maintenance_age_score}
            subtitle={
              result?.maintenance_age_days !== undefined
                ? `${result.maintenance_age_days} days`
                : undefined
            }
          />

          <ScoreCard
            title="Asset Criticality"
            score={result?.asset_criticality_score}
          />

          <ScoreCard
            title="Corridor Criticality"
            score={result?.corridor_criticality_score}
          />

          <ScoreCard
            title="Failure Risk"
            score={result?.failure_risk}
          />

          <ScoreCard
            title="Traffic"
            score={result?.traffic_score}
          />

        </div>
      </div>

      {/* ======================================================
          CONTRIBUTIONS
      ====================================================== */}

      <ContributionPanel
        contributions={result?.contributions}
      />

      {/* ======================================================
          TRAFFIC
      ====================================================== */}

      {result?.traffic && (
        <TrafficPanel
          traffic={result.traffic}
        />
      )}

      {/* ======================================================
          RECOMMENDATION
      ====================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex gap-3">

          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>

            <p className="text-sm font-bold text-blue-900">
              Planning Recommendation
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800">
              This priority score can be passed to the AI
              Block Planner. Higher-priority activities should
              receive earlier consideration when selecting
              safe maintenance windows.
            </p>

          </div>

        </div>
      </div>

    </div>
  );
}

/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  title,
  score,
  subtitle,
}) {
  const value = Number(score ?? 0);

  const percentage = Math.round(
    Math.min(1, Math.max(0, value)) * 100
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <span className="text-lg font-bold text-slate-800">
          {percentage}%
        </span>

      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <div className="mt-2 flex items-center justify-between">

        <p className="text-[11px] text-slate-400">
          normalized score
        </p>

        {subtitle && (
          <p className="text-[11px] font-semibold text-slate-500">
            {subtitle}
          </p>
        )}

      </div>
    </div>
  );
}

/* ============================================================
   CONTRIBUTIONS
============================================================ */

function ContributionPanel({
  contributions,
}) {
  if (!contributions) {
    return null;
  }

  const items = [
    ["Severity", contributions.severity],
    ["Overdue", contributions.overdue],
    [
      "Maintenance Age",
      contributions.maintenance_age,
    ],
    [
      "Asset Criticality",
      contributions.asset_criticality,
    ],
    [
      "Corridor Criticality",
      contributions.corridor_criticality,
    ],
    [
      "Failure Risk",
      contributions.failure_risk,
    ],
    ["Traffic", contributions.traffic],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Gauge size={20} />
        </div>

        <div>
          <h3 className="font-bold text-slate-800">
            Priority Contributions
          </h3>

          <p className="text-xs text-slate-500">
            Contribution of each factor to the final score.
          </p>
        </div>

      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        {items.map(([label, value]) => {

          const numericValue = Number(
            value ?? 0
          );

          const percentage = Math.min(
            100,
            Math.max(
              0,
              numericValue * 100
            )
          );

          return (
            <div key={label}>

              <div className="mb-1 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-600">
                  {label}
                </span>

                <span className="text-xs font-bold text-slate-800">
                  {numericValue.toFixed(4)}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

/* ============================================================
   TRAFFIC PANEL
============================================================ */

function TrafficPanel({
  traffic,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Train size={20} />
        </div>

        <div>
          <h3 className="font-bold text-slate-800">
            Traffic Analysis
          </h3>

          <p className="text-xs text-slate-500">
            Traffic factors used by the priority engine.
          </p>
        </div>

      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <TrafficValue
          title="Traffic Load"
          value={`${(
            Number(
              traffic?.traffic_load ?? 0
            ) * 100
          ).toFixed(0)}%`}
        />

        <TrafficValue
          title="Train Count"
          value={traffic?.train_count ?? 0}
        />

        <TrafficValue
          title="Train Impact"
          value={Number(
            traffic?.train_impact ?? 0
          ).toFixed(4)}
        />

        <TrafficValue
          title="Freight Volume"
          value={Number(
            traffic?.freight_volume ?? 0
          ).toFixed(2)}
        />

      </div>
    </div>
  );
}

/* ============================================================
   TRAFFIC VALUE
============================================================ */

function TrafficValue({
  title,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   PRIORITY GAUGE
============================================================ */

function PriorityGauge({
  percentage,
}) {
  const safePercentage = Math.min(
    100,
    Math.max(0, percentage)
  );

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

        <ArrowUp
          size={22}
          className="text-blue-600"
        />

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

function PriorityBadge({
  priority,
}) {
  const normalized = String(
    priority
  ).toLowerCase();

  let classes =
    "bg-slate-100 text-slate-700 border-slate-200";

  if (normalized.includes("critical")) {
    classes =
      "bg-red-100 text-red-700 border-red-200";
  } else if (normalized.includes("high")) {
    classes =
      "bg-orange-100 text-orange-700 border-orange-200";
  } else if (normalized.includes("medium")) {
    classes =
      "bg-amber-100 text-amber-700 border-amber-200";
  } else if (normalized.includes("low")) {
    classes =
      "bg-emerald-100 text-emerald-700 border-emerald-200";
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
   PRIORITY LEVEL
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
   RECOMMENDATION
============================================================ */

function getRecommendation(priority) {
  const value = String(
    priority
  ).toLowerCase();

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


