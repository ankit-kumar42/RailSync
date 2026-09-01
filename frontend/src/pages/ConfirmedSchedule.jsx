import { useEffect, useState } from "react";

import {
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Train,
  MapPin,
} from "lucide-react";

import { getConfirmedSchedule } from "../services/scheduleService";

// ============================================================
// COMPONENT
// ============================================================

export default function ConfirmedSchedule() {
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD CONFIRMED SCHEDULE
  // ============================================================

  const loadConfirmedSchedule = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getConfirmedSchedule();

      console.log("CONFIRMED SCHEDULE RESPONSE:", response);

      if (!response) {
        throw new Error("Empty response received from confirmed schedule API.");
      }

      if (response.success === false) {
        throw new Error(
          response.error ||
            response.detail?.error ||
            "Unable to load confirmed schedule.",
        );
      }

      /*
       * Support both:
       *
       * {
       *   success: true,
       *   data: {
       *     scheduled: [],
       *     unscheduled: []
       *   }
       * }
       *
       * and:
       *
       * {
       *   scheduled: [],
       *   unscheduled: []
       * }
       */

      const data = response?.data || response;

      const scheduled = Array.isArray(data?.scheduled) ? data.scheduled : [];

      const unscheduled = Array.isArray(data?.unscheduled)
        ? data.unscheduled
        : [];

      setScheduledTasks(scheduled);
      setUnscheduledTasks(unscheduled);

      if (showRefreshMessage) {
        setSuccess("Confirmed schedule refreshed successfully.");
      }
    } catch (err) {
      console.error("Load confirmed schedule error:", err);

      setError(err?.message || "Unable to load confirmed schedule.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadConfirmedSchedule();
  }, []);

  // ============================================================
  // DISPLAY VALUE
  // ============================================================

  const displayValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value);
  };

  // ============================================================
  // NORMALIZE STATUS FOR DISPLAY
  // ============================================================

  const displayStatus = (status) => {
    const value = String(status || "PENDING")
      .trim()
      .toUpperCase();

    switch (value) {
      case "IN_PROGRESS":
        return "IN PROGRESS";

      case "NOT_DONE":
        return "NOT DONE";

      case "DONE":
        return "DONE";

      case "RESOLVED":
        return "RESOLVED";

      case "CANCELLED":
        return "CANCELLED";

      case "PENDING":
      default:
        return "PENDING";
    }
  };

  // ============================================================
  // STATUS BADGE CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const value = String(status || "PENDING")
      .trim()
      .toUpperCase();

    switch (value) {
      case "DONE":
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "NOT_DONE":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-slate-200 text-slate-700";

      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={38}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading confirmed schedule...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-600/20">
            <CalendarCheck size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Confirmed Schedule
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Newly confirmed maintenance tasks stored in the database.
            </p>
          </div>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={() => loadConfirmedSchedule(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          SUCCESS MESSAGE
      ======================================================= */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* ======================================================
          ERROR MESSAGE
      ======================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <span className="break-words">{error}</span>
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Confirmed"
          value={scheduledTasks.length + unscheduledTasks.length}
          icon={<CalendarCheck size={21} />}
        />

        <SummaryCard
          title="Scheduled"
          value={scheduledTasks.length}
          icon={<CheckCircle2 size={21} />}
        />

        <SummaryCard
          title="Unscheduled"
          value={unscheduledTasks.length}
          icon={<AlertTriangle size={21} />}
        />
      </div>

      {/* ======================================================
          CONFIRMED SCHEDULED TASKS
      ======================================================= */}

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-emerald-50/50 px-6 py-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={21} className="text-emerald-600" />

              <h2 className="font-bold text-slate-900">
                Confirmed Scheduled Tasks
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Tasks successfully assigned and confirmed.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {scheduledTasks.length} tasks
          </span>
        </div>

        {/* EMPTY */}

        {scheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={30} />}
            title="No confirmed scheduled tasks"
            message="No scheduled tasks have been confirmed yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Task ID</th>

                  <th className="px-6 py-4">Asset</th>

                  <th className="px-6 py-4">Corridor</th>

                  <th className="px-6 py-4">Block Window</th>

                  <th className="px-6 py-4">Date</th>

                  <th className="px-6 py-4">Time</th>

                  <th className="px-6 py-4">Duration</th>

                  <th className="px-6 py-4">Priority</th>

                  <th className="px-6 py-4">Risk</th>

                  <th className="px-6 py-4">Traffic</th>

                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {scheduledTasks.map((task, index) => {
                  const taskId = task?.task_id ?? task?.id ?? index;

                  const status = displayStatus(task?.status);

                  return (
                    <tr
                      key={String(taskId)}
                      className="transition hover:bg-slate-50"
                    >
                      {/* TASK ID */}

                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">
                          {displayValue(task?.task_id ?? task?.id)}
                        </span>
                      </td>

                      {/* ASSET */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Train size={16} className="text-slate-400" />

                          {displayValue(task?.asset_id)}
                        </div>
                      </td>

                      {/* CORRIDOR */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin size={16} className="text-slate-400" />

                          {displayValue(task?.corridor_id)}
                        </div>
                      </td>

                      {/* BLOCK WINDOW */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.block_window_id)}
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.date)}
                      </td>

                      {/* TIME */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock3 size={16} className="text-blue-500" />

                          {displayValue(task?.start_time)}

                          {" - "}

                          {displayValue(task?.end_time)}
                        </div>
                      </td>

                      {/* DURATION */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.estimated_duration_hrs)} hrs
                      </td>

                      {/* PRIORITY */}

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {displayValue(task?.priority_score)}
                        </span>
                      </td>

                      {/* RISK */}

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {displayValue(task?.failure_risk)}
                        </span>
                      </td>

                      {/* TRAFFIC */}

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {displayValue(task?.traffic_load)}
                        </span>
                      </td>

                      {/* STATUS - DISPLAY ONLY */}

                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ======================================================
          CONFIRMED UNSCHEDULED TASKS
      ======================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-orange-50/50 px-6 py-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={21} className="text-orange-600" />

              <h2 className="font-bold text-slate-900">
                Confirmed Unscheduled Tasks
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Tasks confirmed as unable to fit into the generated schedule.
            </p>
          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {unscheduledTasks.length} tasks
          </span>
        </div>

        {/* EMPTY */}

        {unscheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={30} />}
            title="No confirmed unscheduled tasks"
            message="All confirmed tasks were successfully scheduled."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Task ID</th>

                  <th className="px-6 py-4">Asset</th>

                  <th className="px-6 py-4">Corridor</th>

                  <th className="px-6 py-4">Compatibility</th>


                  <th className="px-6 py-4">Reason</th>

                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {unscheduledTasks.map((task, index) => {
                  const taskId = task?.task_id ?? task?.id ?? index;

                  const status = displayStatus(task?.status);

                  return (
                    <tr
                      key={String(taskId)}
                      className="transition hover:bg-slate-50"
                    >
                      {/* TASK ID */}

                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">
                          {displayValue(task?.task_id ?? task?.id)}
                        </span>
                      </td>

                      {/* ASSET */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.asset_id)}
                      </td>

                      {/* CORRIDOR */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.corridor_id)}
                      </td>

                      {/* COMPATIBILITY */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.compatibility_group)}
                      </td>

                      {/* REASON CODE */}

                     

                      {/* REASON */}

                      <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.reason)}
                      </td>

                      {/* STATUS - DISPLAY ONLY */}

                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const value = String(status || "PENDING")
    .trim()
    .toUpperCase();

  let className = "bg-yellow-100 text-yellow-700";

  switch (value) {
    case "DONE":
    case "RESOLVED":
      className = "bg-emerald-100 text-emerald-700";
      break;

    case "IN_PROGRESS":
      className = "bg-blue-100 text-blue-700";
      break;

    case "NOT_DONE":
      className = "bg-red-100 text-red-700";
      break;

    case "CANCELLED":
      className = "bg-slate-200 text-slate-700";
      break;

    case "PENDING":
    default:
      className = "bg-yellow-100 text-yellow-700";
      break;
  }

  return (
    <span
      className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
    >
      {value === "IN_PROGRESS"
        ? "IN PROGRESS"
        : value === "NOT_DONE"
          ? "NOT DONE"
          : value}
    </span>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">{icon}</div>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ icon, title, message }) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-700">{title}</h3>

      <p className="mx-auto mt-1 max-w-lg text-sm text-slate-400">{message}</p>
    </div>
  );
}
