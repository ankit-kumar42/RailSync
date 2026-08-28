import { useState } from "react";
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

export default function TaskCompatibility() {
  const [taskA, setTaskA] = useState({
    task_id: "",
    department: "Engineering",
    asset_id: "",
    corridor_id: "",
    duration_hours: "",
    priority: "",
  });

  const [taskB, setTaskB] = useState({
    task_id: "",
    department: "S&T",
    asset_id: "",
    corridor_id: "",
    duration_hours: "",
    priority: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateTaskA = (field, value) => {
    setTaskA((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateTaskB = (field, value) => {
    setTaskB((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateCompatibility = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/compatibility/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          task_a: {
            ...taskA,
            duration_hours: Number(taskA.duration_hours),
            priority: Number(taskA.priority),
          },

          task_b: {
            ...taskB,
            duration_hours: Number(taskB.duration_hours),
            priority: Number(taskB.priority),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Compatibility calculation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <GitCompare size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Maintenance Task Compatibility
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Determine whether two maintenance activities can be combined into
              the same railway block.
            </p>
          </div>
        </div>
      </div>

      {/* INFORMATION CARD */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 text-blue-600" size={20} />

          <div>
            <h3 className="font-semibold text-blue-900">
              Why compatibility matters
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Compatible maintenance tasks can be executed during the same
              block. This helps reduce infrastructure downtime and improves
              asset availability for train operations.
            </p>
          </div>
        </div>
      </div>

      {/* TASK CARDS */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* TASK A */}

        <TaskCard
          title="Maintenance Task A"
          task={taskA}
          updateTask={updateTaskA}
          departmentOptions={["Engineering", "Traction", "S&T"]}
        />

        {/* TASK B */}

        <TaskCard
          title="Maintenance Task B"
          task={taskB}
          updateTask={updateTaskB}
          departmentOptions={["Engineering", "Traction", "S&T"]}
        />
      </div>

      {/* CALCULATE BUTTON */}

      <div className="flex justify-center">
        <button
          onClick={calculateCompatibility}
          disabled={loading}
          className="
            flex items-center gap-2
            rounded-xl
            bg-blue-600
            px-7 py-3
            font-semibold
            text-white
            shadow-lg
            shadow-blue-600/20
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Checking Compatibility...
            </>
          ) : (
            <>
              <GitCompare size={18} />
              Check Compatibility
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />

            <span className="font-medium text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* RESULT */}

      {result && <CompatibilityResult result={result} />}
    </div>
  );
}

/* ============================================================
   TASK CARD
============================================================ */

function TaskCard({ title, task, updateTask, departmentOptions }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-xs text-slate-500">
          Enter maintenance activity details
        </p>
      </div>

      <div className="space-y-4">
        {/* TASK ID */}

        <Input
          label="Task ID"
          value={task.task_id}
          placeholder="e.g. ENG-001"
          onChange={(value) => updateTask("task_id", value)}
        />

        {/* DEPARTMENT */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Department
          </label>

          <select
            value={task.department}
            onChange={(e) => updateTask("department", e.target.value)}
            className="
              w-full rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-2.5
              text-sm
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          >
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        {/* ASSET */}

        <Input
          label="Asset ID"
          value={task.asset_id}
          placeholder="e.g. TRK-4521"
          onChange={(value) => updateTask("asset_id", value)}
        />

        {/* CORRIDOR */}

        <Input
          label="Corridor ID"
          value={task.corridor_id}
          placeholder="e.g. C-102"
          onChange={(value) => updateTask("corridor_id", value)}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* DURATION */}

          <Input
            label="Duration (hours)"
            type="number"
            value={task.duration_hours}
            placeholder="2"
            onChange={(value) => updateTask("duration_hours", value)}
          />

          {/* PRIORITY */}

          <Input
            label="Priority"
            type="number"
            value={task.priority}
            placeholder="1"
            onChange={(value) => updateTask("priority", value)}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({ label, value, placeholder, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl
          border border-slate-200
          bg-slate-50
          px-4 py-2.5
          text-sm
          outline-none
          transition
          focus:border-blue-500
          focus:bg-white
          focus:ring-2
          focus:ring-blue-100
        "
      />
    </div>
  );
}

/* ============================================================
   RESULT
============================================================ */

function CompatibilityResult({ result }) {
  /*
   Your backend may return fields according to
   CompatibilityResponse.

   This component tries common field names so that
   it can be adapted easily.
  */

  const compatible =
    result.compatible ?? result.is_compatible ?? result.can_combine ?? false;

  const score = result.compatibility_score ?? result.score ?? null;

  const reason =
    result.reason ??
    result.message ??
    result.explanation ??
    "Compatibility analysis completed.";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Compatibility Analysis
          </h2>

          <p className="text-sm text-slate-500">
            AI/Rule engine recommendation
          </p>
        </div>

        {compatible ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            Compatible
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <XCircle size={18} />
            Not Compatible
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* STATUS */}

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Status
          </p>

          <p
            className={`mt-2 text-xl font-bold ${
              compatible ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {compatible ? "Can Combine" : "Separate Blocks"}
          </p>
        </div>

        {/* SCORE */}

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Compatibility Score
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {score !== null ? `${Math.round(score * 100)}%` : "N/A"}
          </p>
        </div>

        {/* RECOMMENDATION */}

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Recommendation
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-800">
            {compatible ? "Combine in same block" : "Schedule separately"}
          </p>
        </div>
      </div>

      {/* REASON */}

      <div className="mt-5 rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Analysis
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">{reason}</p>
      </div>
    </div>
  );
}
