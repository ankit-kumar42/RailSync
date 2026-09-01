import { useState } from "react";

import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  GitCompare,
  MapPin,
  CalendarDays,
  Clock3,
  ShieldAlert,
  Route,
  Activity,
  Gauge,
  Wrench,
} from "lucide-react";

import { calculateCompatibility } from "../services/compatibilityApi";

/* ============================================================
   DEFAULT TASK
============================================================ */

const createDefaultTask = () => ({
  task_id: "",
  asset_id: "",
  corridor_id: "",
  location_start_km: 0,
  location_end_km: 0,
  defect_type: "",
  severity: "Medium",
  overdue_days: 0,
  last_maintenance_date: "",
  estimated_duration_hrs: 1,
});

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Compatibility() {
  const [taskA, setTaskA] = useState(createDefaultTask());
  const [taskB, setTaskB] = useState(createDefaultTask());

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     TASK CHANGE
  ========================================================== */

  const handleTaskChange = (task, event) => {
    const { name, value } = event.target;

    const numericFields = [
      "location_start_km",
      "location_end_km",
      "overdue_days",
      "estimated_duration_hrs",
    ];

    const nextValue = numericFields.includes(name) ? value : value;

    if (task === "A") {
      setTaskA((previous) => ({
        ...previous,
        [name]: nextValue,
      }));
    } else {
      setTaskB((previous) => ({
        ...previous,
        [name]: nextValue,
      }));
    }
  };

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateTask = (task, label) => {
    if (!task.task_id.trim()) {
      return `${label}: Task ID is required.`;
    }

    if (!task.asset_id.trim()) {
      return `${label}: Asset ID is required.`;
    }

    if (!task.corridor_id.trim()) {
      return `${label}: Corridor ID is required.`;
    }

    if (!task.defect_type.trim()) {
      return `${label}: Defect type is required.`;
    }

    if (!task.last_maintenance_date) {
      return `${label}: Last maintenance date is required.`;
    }

    if (Number(task.location_end_km) < Number(task.location_start_km)) {
      return `${label}: End location cannot be less than start location.`;
    }

    if (Number(task.estimated_duration_hrs) <= 0) {
      return `${label}: Estimated duration must be greater than 0.`;
    }

    return "";
  };

  /* ==========================================================
     CALCULATE COMPATIBILITY
  ========================================================== */

  const handleCalculate = async () => {
    setError("");
    setResult(null);

    const taskAError = validateTask(taskA, "Task A");

    if (taskAError) {
      setError(taskAError);
      return;
    }

    const taskBError = validateTask(taskB, "Task B");

    if (taskBError) {
      setError(taskBError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        task_a: {
          task_id: taskA.task_id.trim(),
          asset_id: taskA.asset_id.trim(),
          corridor_id: taskA.corridor_id.trim(),

          location_start_km: Number(taskA.location_start_km),

          location_end_km: Number(taskA.location_end_km),

          defect_type: taskA.defect_type.trim(),

          severity: taskA.severity,

          overdue_days: Number(taskA.overdue_days),

          last_maintenance_date: taskA.last_maintenance_date,

          estimated_duration_hrs: Number(taskA.estimated_duration_hrs),
        },

        task_b: {
          task_id: taskB.task_id.trim(),
          asset_id: taskB.asset_id.trim(),
          corridor_id: taskB.corridor_id.trim(),

          location_start_km: Number(taskB.location_start_km),

          location_end_km: Number(taskB.location_end_km),

          defect_type: taskB.defect_type.trim(),

          severity: taskB.severity,

          overdue_days: Number(taskB.overdue_days),

          last_maintenance_date: taskB.last_maintenance_date,

          estimated_duration_hrs: Number(taskB.estimated_duration_hrs),
        },
      };

      console.log("Compatibility request:", payload);

      const response = await calculateCompatibility(payload);

      console.log("Compatibility response:", response);

      setResult(response);
    } catch (err) {
      console.error("Compatibility calculation error:", err);

      setError(err.message || "Unable to calculate task compatibility.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    setTaskA(createDefaultTask());
    setTaskB(createDefaultTask());

    setResult(null);
    setError("");
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-[1700px]">
        

        {/* ==================================================
            TASK FORMS
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GitCompare size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Compare Maintenance Tasks
              </h2>

              <p className="text-xs text-slate-500">
                Enter the information for both tasks.
              </p>
            </div>
          </div>

          {/* ==================================================
              HORIZONTAL TASK GRID
          ================================================== */}

          <div className="grid gap-6 xl:grid-cols-2">
            <TaskForm
              title="Task A"
              task={taskA}
              onChange={(event) => handleTaskChange("A", event)}
              accent="blue"
            />

            <TaskForm
              title="Task B"
              task={taskB}
              onChange={(event) => handleTaskChange("B", event)}
              accent="indigo"
            />
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle size={19} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-bold">
                  Compatibility Calculation Failed
                </p>

                <p className="mt-1 text-xs leading-5">{error}</p>
              </div>
            </div>
          )}

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Reset
            </button>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <BrainCircuit size={17} />
                  Calculate Compatibility
                </>
              )}
            </button>
          </div>
        </div>

        {/* ==================================================
            RESULT
        ================================================== */}

        <div className="mt-6">
          {!result ? (
            <EmptyCompatibility />
          ) : (
            <CompatibilityResult result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TASK FORM
============================================================ */

function TaskForm({ title, task, onChange, accent }) {
  const headerClass =
    accent === "indigo"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      {/* HEADER */}

      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${headerClass}`}
        >
          <ClipboardIcon />
        </div>

        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>

          <p className="text-xs text-slate-500">Maintenance activity details</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ROW 1 */}

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Task ID"
            name="task_id"
            value={task.task_id}
            onChange={onChange}
            placeholder="TASK-001"
            icon={<Wrench size={16} />}
          />

          <TextInput
            label="Asset ID"
            name="asset_id"
            value={task.asset_id}
            onChange={onChange}
            placeholder="ASSET-001"
            icon={<ShieldAlert size={16} />}
          />
        </div>

        {/* ROW 2 */}

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Corridor ID"
            name="corridor_id"
            value={task.corridor_id}
            onChange={onChange}
            placeholder="CORRIDOR-001"
            icon={<Route size={16} />}
          />

          <SelectInput
            label="Severity"
            name="severity"
            value={task.severity}
            onChange={onChange}
            icon={<AlertTriangle size={16} />}
            options={["Low", "Medium", "High", "Critical"]}
          />
        </div>

        {/* ROW 3 */}

        <div className="grid gap-4 md:grid-cols-2">
          <NumberInput
            label="Start Location"
            name="location_start_km"
            value={task.location_start_km}
            onChange={onChange}
            min="0"
            step="0.01"
            unit="km"
            icon={<MapPin size={16} />}
          />

          <NumberInput
            label="End Location"
            name="location_end_km"
            value={task.location_end_km}
            onChange={onChange}
            min="0"
            step="0.01"
            unit="km"
            icon={<MapPin size={16} />}
          />
        </div>

        {/* ROW 4 */}

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Defect Type"
            name="defect_type"
            value={task.defect_type}
            onChange={onChange}
            placeholder="Rail defect"
            icon={<AlertTriangle size={16} />}
          />

          <NumberInput
            label="Overdue Days"
            name="overdue_days"
            value={task.overdue_days}
            onChange={onChange}
            min="0"
            step="1"
            unit="days"
            icon={<CalendarDays size={16} />}
          />
        </div>

        {/* ROW 5 */}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Last Maintenance
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                name="last_maintenance_date"
                value={task.last_maintenance_date}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <NumberInput
            label="Estimated Duration"
            name="estimated_duration_hrs"
            value={task.estimated_duration_hrs}
            onChange={onChange}
            min="0.1"
            step="0.1"
            unit="hrs"
            icon={<Clock3 size={16} />}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TEXT INPUT
============================================================ */

function TextInput({ label, name, value, onChange, placeholder, icon }) {
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
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

/* ============================================================
   NUMBER INPUT
============================================================ */

function NumberInput({ label, name, value, onChange, min, step, unit, icon }) {
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
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-16 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   SELECT INPUT
============================================================ */

function SelectInput({ label, name, value, onChange, icon, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
   EMPTY STATE
============================================================ */

function EmptyCompatibility() {
  return (
    <div className="flex min-h-[430px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-w-lg px-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <GitCompare size={40} />
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-800">
          Task Compatibility Assessment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter Task A and Task B details above to determine whether the two
          maintenance activities can be planned together.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <InfoBox icon={<Route size={16} />} text="Corridor" />

          <InfoBox icon={<MapPin size={16} />} text="Location" />

          <InfoBox icon={<Clock3 size={16} />} text="Duration" />

          <InfoBox icon={<Gauge size={16} />} text="Compatibility" />
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

function CompatibilityResult({ result }) {
  const score = Number(result.compatibility_score ?? 0);

  const percentage = score <= 1 ? Math.round(score * 100) : Math.round(score);

  const safePercentage = Math.min(100, Math.max(0, percentage));

  const compatible = Boolean(result.compatible);

  return (
    <div className="space-y-6">
      {/* ==================================================
          MAIN RESULT
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <BrainCircuit size={16} />
              AI Compatibility Assessment
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              Task Compatibility
            </h2>
          </div>

          <CompatibilityBadge compatible={compatible} />
        </div>

        {/* SCORE */}

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[230px_1fr]">
          <CompatibilityGauge percentage={safePercentage} />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Compatibility Score
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              {safePercentage}
              <span className="text-2xl text-slate-400">/100</span>
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The AI compatibility engine has determined that these maintenance
              tasks are{" "}
              <strong className="text-slate-700">
                {compatible ? "compatible" : "not compatible"}
              </strong>{" "}
              for combined planning based on the evaluated operational factors.
            </p>

            <div
              className={`mt-5 rounded-xl p-4 ${
                compatible ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <div className="flex gap-3">
                {compatible ? (
                  <CheckCircle2 size={20} className="mt-0.5 text-emerald-600" />
                ) : (
                  <XCircle size={20} className="mt-0.5 text-red-600" />
                )}

                <div>
                  <p
                    className={`text-xs font-bold ${
                      compatible ? "text-emerald-900" : "text-red-900"
                    }`}
                  >
                    Planning Decision
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      compatible ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    {compatible
                      ? "These tasks can be considered for combined scheduling."
                      : "These tasks should not be combined without further planning review."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          FACTORS
      ================================================== */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Compatibility Factors
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ScoreCard
            title="Corridor"
            value={result.corridor_compatibility}
            icon={<Route size={18} />}
          />

          <ScoreCard
            title="Location"
            value={result.location_score}
            icon={<MapPin size={18} />}
          />

          <ScoreCard
            title="Deadline"
            value={result.deadline_compatibility}
            icon={<CalendarDays size={18} />}
          />

          <ScoreCard
            title="Defect"
            value={result.defect_compatibility}
            icon={<ShieldAlert size={18} />}
          />

          <ScoreCard
            title="Duration"
            value={result.duration_compatibility}
            icon={<Clock3 size={18} />}
          />
        </div>
      </div>

      {/* ==================================================
          LOCATION / TASK SUMMARY
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        <SummaryCard
          title="Task A"
          value={result.task_a}
          icon={<Wrench size={18} />}
        />

        <SummaryCard
          title="Task B"
          value={result.task_b}
          icon={<Wrench size={18} />}
        />

        <SummaryCard
          title="Location Distance"
          value={`${Number(result.location_distance_km ?? 0).toFixed(2)} km`}
          icon={<MapPin size={18} />}
        />
      </div>

      {/* ==================================================
          AI EXPLANATION
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BrainCircuit size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              How compatibility helps the planner
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The compatibility score can be used by the AI Block Planner to
              identify maintenance tasks that may be safely grouped into the
              same maintenance window. This can reduce repeated corridor access
              and improve maintenance planning efficiency.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Step
                number="01"
                title="Compare"
                text="Evaluate both maintenance activities."
              />

              <Step
                number="02"
                title="Check"
                text="Analyze corridor, location and operational compatibility."
              />

              <Step
                number="03"
                title="Schedule"
                text="Use compatible tasks for combined planning."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPATIBILITY GAUGE
============================================================ */

function CompatibilityGauge({ percentage }) {
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
        <GitCompare size={22} className="text-blue-600" />

        <span className="text-3xl font-bold text-slate-900">{percentage}</span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Compatibility
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   COMPATIBILITY BADGE
============================================================ */

function CompatibilityBadge({ compatible }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
        compatible
          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
          : "border-red-200 bg-red-100 text-red-700"
      }`}
    >
      {compatible ? <CheckCircle2 size={16} /> : <XCircle size={16} />}

      {compatible ? "Compatible" : "Not Compatible"}
    </span>
  );
}

/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({ title, value, icon }) {
  const numericValue = Number(value ?? 0);

  const percentage =
    numericValue <= 1
      ? Math.round(numericValue * 100)
      : Math.round(numericValue);

  const safeValue = Math.min(100, Math.max(0, percentage));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          {icon}
        </div>

        <span className="text-lg font-bold text-blue-700">{safeValue}%</span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 truncate text-lg font-bold text-slate-800">
        {value || "—"}
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
   CLIPBOARD ICON
============================================================ */

function ClipboardIcon() {
  return <Activity size={19} />;
}
