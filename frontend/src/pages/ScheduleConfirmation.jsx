import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Save,
  RefreshCw,
  Circle,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const initialScheduled = [
  {
    task_id: "ENG-001",
    asset_id: "TRK-4521",
    corridor_id: "COR-101",
    block_window_id: "BW-001",
    date: "2026-09-02",
    start_time: "01:00",
    end_time: "03:00",
    estimated_duration_hrs: 2,
    priority_score: 87,
    failure_risk: 0.72,
    status: "PENDING",
  },
];

const initialUnscheduled = [
  {
    task_id: "SNT-004",
    asset_id: "SIG-220",
    corridor_id: "COR-101",
    compatibility_group: "CG-12",
    reason_code: "NO_BLOCK",
    reason: "No suitable block window available",
    status: "PENDING",
  },
];

export default function ScheduleConfirmation() {
  const [scheduled, setScheduled] = useState(initialScheduled);

  const [unscheduled, setUnscheduled] = useState(initialUnscheduled);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const confirmSchedule = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/schedule/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled,
          unscheduled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.error || data.detail || "Unable to confirm schedule",
        );
      }

      setMessage(
        `Schedule confirmed successfully. ${data.data.scheduled_count} scheduled and ${data.data.unscheduled_count} unscheduled tasks saved.`,
      );
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (taskId, status, type) => {
    try {
      const endpoint =
        type === "scheduled"
          ? `/schedule/scheduled/${taskId}/status?status=${status}`
          : `/schedule/unscheduled/${taskId}/status?status=${status}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.error || data.detail || "Status update failed",
        );
      }

      if (type === "scheduled") {
        setScheduled((prev) =>
          prev.map((task) =>
            task.task_id === taskId ? { ...task, status } : task,
          ),
        );
      } else {
        setUnscheduled((prev) =>
          prev.map((task) =>
            task.task_id === taskId ? { ...task, status } : task,
          ),
        );
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const pending = scheduled.filter((x) => x.status === "PENDING").length;

  const inProgress = scheduled.filter((x) => x.status === "IN_PROGRESS").length;

  const completed = scheduled.filter((x) => x.status === "DONE").length;

  const notDone = scheduled.filter((x) => x.status === "NOT_DONE").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <CalendarCheck size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Schedule Confirmation
            </h1>

            <p className="text-sm text-slate-500">
              Review, confirm and monitor AI-generated maintenance schedules.
            </p>
          </div>
        </div>

        <button
          onClick={confirmSchedule}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Confirm Schedule
            </>
          )}
        </button>
      </div>

      {/* SUCCESS / ERROR MESSAGE */}

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending" value={pending} icon={Clock3} />

        <StatCard title="In Progress" value={inProgress} icon={RefreshCw} />

        <StatCard title="Completed" value={completed} icon={CheckCircle2} />

        <StatCard title="Not Done" value={notDone} icon={AlertTriangle} />
      </div>

      {/* SCHEDULED TASKS */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Confirmed Maintenance Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks assigned to available railway block windows.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {scheduled.length} Tasks
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Corridor</th>
                <th className="px-6 py-4">Block</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {scheduled.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {task.task_id}
                  </td>

                  <td className="px-6 py-4 text-slate-600">{task.asset_id}</td>

                  <td className="px-6 py-4 text-slate-600">
                    {task.corridor_id}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {task.block_window_id}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">
                      {task.date}
                    </div>

                    <div className="text-xs text-slate-500">
                      {task.start_time} - {task.end_time}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    {task.priority_score}
                  </td>

                  <td className="px-6 py-4">
                    <RiskBadge risk={task.failure_risk} />
                  </td>

                  <td className="px-6 py-4">
                    <StatusSelector
                      value={task.status}
                      onChange={(status) =>
                        updateStatus(task.task_id, status, "scheduled")
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNSCHEDULED */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-500" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Unscheduled Maintenance
              </h2>

              <p className="text-sm text-slate-500">
                Tasks that could not be assigned to a suitable block.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Corridor</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Reason Code</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {unscheduled.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold">{task.task_id}</td>

                  <td className="px-6 py-4 text-slate-600">{task.asset_id}</td>

                  <td className="px-6 py-4 text-slate-600">
                    {task.corridor_id}
                  </td>

                  <td className="px-6 py-4">
                    {task.compatibility_group || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      {task.reason_code}
                    </span>
                  </td>

                  <td className="max-w-xs px-6 py-4 text-slate-500">
                    {task.reason}
                  </td>

                  <td className="px-6 py-4">
                    <StatusSelector
                      value={task.status}
                      onChange={(status) =>
                        updateStatus(task.task_id, status, "unscheduled")
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RISK BADGE
============================================================ */

function RiskBadge({ risk }) {
  const percentage = Math.round(Number(risk || 0) * 100);

  let label = "Low";

  if (percentage >= 75) {
    label = "Critical";
  } else if (percentage >= 50) {
    label = "High";
  } else if (percentage >= 25) {
    label = "Medium";
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {label} {percentage}%
    </span>
  );
}

/* ============================================================
   STATUS SELECTOR
============================================================ */

function StatusSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
    >
      <option value="PENDING">Pending</option>

      <option value="IN_PROGRESS">In Progress</option>

      <option value="DONE">Done</option>

      <option value="NOT_DONE">Not Done</option>
    </select>
  );
}
