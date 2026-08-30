import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wrench,
  MapPin,
  Activity,
  XCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

export default function ConfirmedSchedule() {
  const [scheduled, setScheduled] = useState([]);
  const [unscheduled, setUnscheduled] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [updatingTask, setUpdatingTask] = useState(null);

  // ============================================================
  // FETCH CONFIRMED SCHEDULE
  // ============================================================

  const fetchConfirmedSchedule = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_BASE_URL}/schedule/confirmed`);

      if (!response.ok) {
        throw new Error(
          `Failed to load confirmed schedule (${response.status})`,
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load confirmed schedule.");
      }

      setScheduled(result.data?.scheduled || []);
      setUnscheduled(result.data?.unscheduled || []);
    } catch (err) {
      console.error("Confirmed schedule error:", err);

      setError(err.message || "Unable to connect to the backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    fetchConfirmedSchedule();
  }, []);

  // ============================================================
  // UPDATE SCHEDULED STATUS
  // ============================================================

  const updateScheduledStatus = async (taskId, status) => {
    try {
      setUpdatingTask(taskId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/schedule/scheduled/${encodeURIComponent(
          taskId,
        )}/status?status=${encodeURIComponent(status)}`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail?.error ||
            result?.error ||
            "Failed to update scheduled task status.",
        );
      }

      // Update UI immediately
      setScheduled((currentTasks) =>
        currentTasks.map((task) =>
          task.task_id === taskId
            ? {
                ...task,
                status: status,
              }
            : task,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to update scheduled task status.");
    } finally {
      setUpdatingTask(null);
    }
  };

  // ============================================================
  // UPDATE UNSCHEDULED STATUS
  // ============================================================

  const updateUnscheduledStatus = async (taskId, status) => {
    try {
      setUpdatingTask(taskId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/schedule/unscheduled/${encodeURIComponent(
          taskId,
        )}/status?status=${encodeURIComponent(status)}`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail?.error ||
            result?.error ||
            "Failed to update unscheduled task status.",
        );
      }

      // Update UI immediately
      setUnscheduled((currentTasks) =>
        currentTasks.map((task) =>
          task.task_id === taskId
            ? {
                ...task,
                status: status,
              }
            : task,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to update unscheduled task status.");
    } finally {
      setUpdatingTask(null);
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "NOT_DONE":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "PENDING":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  // ============================================================
  // STATUS ICON
  // ============================================================

  const StatusIcon = ({ status }) => {
    if (status === "DONE") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "IN_PROGRESS") {
      return <Activity size={15} />;
    }

    if (status === "NOT_DONE") {
      return <XCircle size={15} />;
    }

    return <Clock size={15} />;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                className="mx-auto mb-4 animate-spin text-blue-600"
                size={35}
              />

              <p className="text-sm font-medium text-slate-600">
                Loading confirmed schedule...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <CalendarCheck size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Confirmed Schedule
                </h1>

                <p className="text-sm text-slate-500">
                  Maintenance tasks saved after schedule confirmation
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchConfirmedSchedule(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Unable to load schedule</p>

              <p className="mt-1 text-sm">{error}</p>

              <button
                onClick={() => fetchConfirmedSchedule()}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Scheduled */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Scheduled Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {scheduled.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarCheck size={22} />
              </div>
            </div>
          </div>

          {/* Unscheduled */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unscheduled Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {unscheduled.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {scheduled.length + unscheduled.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SCHEDULED TASKS
        ====================================================== */}

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Scheduled Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks assigned to confirmed maintenance windows
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {scheduled.length}
            </span>
          </div>

          {scheduled.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No scheduled tasks"
              message="No scheduled maintenance tasks have been confirmed yet."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Task
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Asset
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Corridor
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Block Window
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Time
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Priority
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {scheduled.map((task) => (
                      <tr
                        key={task.task_id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Task */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Wrench size={17} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {task.task_id}
                              </p>

                              {task.estimated_duration_hrs != null && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {task.estimated_duration_hrs} hrs
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Asset */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Wrench size={15} className="text-slate-400" />

                            {task.asset_id || "-"}
                          </div>
                        </td>

                        {/* Corridor */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <MapPin size={15} className="text-slate-400" />

                            {task.corridor_id || "-"}
                          </div>
                        </td>

                        {/* Block Window */}

                        <td className="px-5 py-5 text-sm text-slate-700">
                          {task.block_window_id || "-"}
                        </td>

                        {/* Date */}

                        <td className="px-5 py-5 text-sm font-medium text-slate-700">
                          {formatDate(task.date)}
                        </td>

                        {/* Time */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Clock size={15} className="text-slate-400" />

                            {task.start_time || "--:--"}
                            {" - "}
                            {task.end_time || "--:--"}
                          </div>
                        </td>

                        {/* Priority */}

                        <td className="px-5 py-5">
                          <PriorityBadge score={task.priority_score} />
                        </td>

                        {/* Status */}

                        <td className="px-5 py-5">
                          <StatusSelect
                            value={task.status}
                            disabled={updatingTask === task.task_id}
                            onChange={(status) =>
                              updateScheduledStatus(task.task_id, status)
                            }
                            getStatusClass={getStatusClass}
                            StatusIcon={StatusIcon}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            UNSCHEDULED TASKS
        ====================================================== */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Unscheduled Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Confirmed tasks that could not be assigned to a block window
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              {unscheduled.length}
            </span>
          </div>

          {unscheduled.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No unscheduled tasks"
              message="All confirmed maintenance tasks have been assigned to a schedule."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {unscheduled.map((task) => (
                <div
                  key={task.task_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {/* Card Header */}

                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <AlertTriangle size={20} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {task.task_id}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Unscheduled maintenance
                        </p>
                      </div>
                    </div>

                    <StatusSelect
                      value={task.status}
                      disabled={updatingTask === task.task_id}
                      onChange={(status) =>
                        updateUnscheduledStatus(task.task_id, status)
                      }
                      getStatusClass={getStatusClass}
                      StatusIcon={StatusIcon}
                    />
                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem label="Asset" value={task.asset_id} />

                    <DetailItem label="Corridor" value={task.corridor_id} />

                    <DetailItem
                      label="Compatibility Group"
                      value={task.compatibility_group}
                    />

                    <DetailItem label="Reason Code" value={task.reason_code} />
                  </div>

                  {/* Reason */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reason
                    </p>

                    <p className="text-sm leading-6 text-slate-700">
                      {task.reason || "No reason provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={26} />
      </div>

      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
}

// ============================================================
// PRIORITY BADGE
// ============================================================

function PriorityBadge({ score }) {
  if (score == null) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  let className = "bg-slate-100 text-slate-700";

  if (score >= 80) {
    className = "bg-red-50 text-red-700";
  } else if (score >= 50) {
    className = "bg-amber-50 text-amber-700";
  } else {
    className = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {Number(score).toFixed(0)}
    </span>
  );
}

// ============================================================
// STATUS SELECT
// ============================================================

function StatusSelect({
  value,
  disabled,
  onChange,
  getStatusClass,
  StatusIcon,
}) {
  return (
    <div className="relative">
      <div
        className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1.5 ${getStatusClass(
          value,
        )}`}
      >
        <StatusIcon status={value} />

        <select
          value={value || "PENDING"}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-bold outline-none disabled:cursor-not-allowed"
        >
          <option value="PENDING">PENDING</option>

          <option value="IN_PROGRESS">IN PROGRESS</option>

          <option value="DONE">DONE</option>

          <option value="NOT_DONE">NOT DONE</option>
        </select>
      </div>
    </div>
  );
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
