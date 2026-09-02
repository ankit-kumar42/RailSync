import { useEffect, useState } from "react";

import {
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Train,
  MapPin,
  X,
  ExternalLink,
  Activity,
  Gauge,
  ShieldAlert,
  Navigation,
  Wrench,
  AlertCircle,
} from "lucide-react";

import { getConfirmedSchedule } from "../services/scheduleService";

// ============================================================
// API
// ============================================================

const TASK_API = "http://127.0.0.1:8001";

// ============================================================
// GLOBAL HELPERS
// ============================================================

function displayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function normalizeStatus(status) {
  return String(status || "PENDING")
    .trim()
    .toUpperCase();
}

function displayStatus(status) {
  const value = normalizeStatus(status);

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
}

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

  // Selected task for modal
  const [selectedTask, setSelectedTask] = useState(null);

  // Detailed API state
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);

  const [taskDetailsError, setTaskDetailsError] = useState("");

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
      setSuccess("");

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
  // OPEN TASK DETAILS
  // ============================================================

  const openTaskDetails = async (task) => {
    const taskId = task?.task_id ?? task?.id ?? null;

    console.log("Opening task details for:", taskId);

    /*
     * First show the information already available
     * in the confirmed schedule.
     *
     * This means the modal opens immediately even if
     * the detailed task API later returns 404.
     */

    setSelectedTask({
      ...task,
    });

    setTaskDetailsError("");

    if (!taskId) {
      setTaskDetailsError(
        "This scheduled item does not contain a valid task ID.",
      );

      return;
    }

    setTaskDetailsLoading(true);

    try {
      const url = `${TASK_API}/tasks/${encodeURIComponent(taskId)}`;

      console.log("Fetching complete task:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      /*
       * Handle 404 separately.
       *
       * A schedule record may contain a generated/test ID
       * which does not exist in the task database.
       */

      if (response.status === 404) {
        console.warn(`Task ${taskId} was not found in the task API.`);

        setTaskDetailsError(
          `Complete task information was not found for "${taskId}". Showing the information available from the confirmed schedule.`,
        );

        return;
      }

      if (!response.ok) {
        let errorMessage = "Unable to load complete task information.";

        try {
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            errorMessage = errorData.detail;
          } else if (typeof errorData?.message === "string") {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(errorMessage);
      }

      const taskData = await response.json();

      console.log("COMPLETE TASK RESPONSE:", taskData);

      /*
       * Merge:
       *
       * 1. confirmed schedule information
       * 2. complete task information
       *
       * If the same field exists in both,
       * taskData takes priority.
       */

      setSelectedTask({
        ...task,
        ...taskData,
      });
    } catch (err) {
      console.error("Load task details error:", err);

      /*
       * Do NOT close the modal.
       *
       * The user can still see the confirmed schedule
       * information.
       */

      setTaskDetailsError(
        err?.message ||
          "Unable to load complete task information. Showing available schedule information.",
      );
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setTaskDetailsError("");
    setTaskDetailsLoading(false);
  };

  // ============================================================
  // LOADING
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
              Confirmed railway maintenance tasks and allocated maintenance
              blocks.
            </p>
          </div>
        </div>

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
          SUCCESS
      ======================================================= */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <span className="break-words">{error}</span>
        </div>
      )}

      {/* ======================================================
          INFO
      ======================================================= */}

      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <ExternalLink size={19} className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              View complete task information
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Click a Task ID or any task row to view additional maintenance
              information.
            </p>
          </div>
        </div>
      </div>

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
          SCHEDULED TASKS
      ======================================================= */}

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

        {scheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={30} />}
            title="No confirmed scheduled tasks"
            message="No scheduled tasks have been confirmed yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Task</th>

                  <th className="px-6 py-4">Asset</th>

                  <th className="px-6 py-4">Corridor</th>

                  <th className="px-6 py-4">Block Window</th>

                  <th className="px-6 py-4">Date</th>

                  <th className="px-6 py-4">Time</th>

                  <th className="px-6 py-4">Duration</th>

                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {scheduledTasks.map((task, index) => {
                  const taskId = task?.task_id ?? task?.id ?? index;

                  return (
                    <tr
                      key={String(taskId)}
                      onClick={() => openTaskDetails(task)}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                    >
                      {/* TASK */}

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTaskDetails(task);
                          }}
                          className="group flex items-center gap-2 text-left"
                        >
                          <span className="font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {displayValue(task?.task_id ?? task?.id)}
                          </span>

                          <ExternalLink
                            size={14}
                            className="text-blue-400 opacity-0 transition group-hover:opacity-100"
                          />
                        </button>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Click to view details
                        </p>
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

                      {/* BLOCK */}

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

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <StatusBadge status={displayStatus(task?.status)} />
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
          UNSCHEDULED TASKS
      ======================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

        {unscheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={30} />}
            title="No confirmed unscheduled tasks"
            message="All confirmed tasks were successfully scheduled."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Task</th>

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

                  return (
                    <tr
                      key={String(taskId)}
                      onClick={() => openTaskDetails(task)}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTaskDetails(task);
                          }}
                          className="group flex items-center gap-2"
                        >
                          <span className="font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {displayValue(task?.task_id ?? task?.id)}
                          </span>

                          <ExternalLink
                            size={14}
                            className="text-blue-400 opacity-0 transition group-hover:opacity-100"
                          />
                        </button>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Click to view details
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.asset_id)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.corridor_id)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.compatibility_group)}
                      </td>

                      <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.reason)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={displayStatus(task?.status)} />
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
          TASK DETAILS MODAL
      ======================================================= */}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          loading={taskDetailsLoading}
          error={taskDetailsError}
          onClose={closeTaskDetails}
        />
      )}
    </div>
  );
}

// ============================================================
// TASK DETAILS MODAL
// ============================================================

function TaskDetailsModal({ task, loading, error, onClose }) {
  const taskId = task?.task_id ?? task?.id ?? "-";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-600 p-3">
              <Wrench size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Maintenance Task
              </p>

              <h2 className="mt-1 text-xl font-bold">{displayValue(taskId)}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={23} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-6">
          {/* API ERROR */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Complete task information unavailable
                </p>

                <p className="mt-1 leading-6">{error}</p>
              </div>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
              <RefreshCw size={19} className="animate-spin text-blue-600" />

              <p className="text-sm font-medium text-blue-700">
                Loading complete task information...
              </p>
            </div>
          )}

          {/* TASK INFORMATION */}

          <DetailSection title="Task Information" icon={<Wrench size={18} />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Task ID" value={task?.task_id} />

              <DetailItem label="Database ID" value={task?.id} />

              <DetailItem label="Asset ID" value={task?.asset_id} />

              <DetailItem label="Corridor ID" value={task?.corridor_id} />

              <DetailItem label="System" value={task?.system} />

              <DetailItem label="Defect Type" value={task?.defect_type} />

              <DetailItem
                label="Severity"
                value={task?.severity}
                highlight={String(task?.severity || "").toUpperCase()}
              />

              <DetailItem label="Overdue Days" value={task?.overdue_days} />

              <DetailItem
                label="Last Maintenance Date"
                value={task?.last_maintenance_date}
              />
            </div>
          </DetailSection>

          {/* LOCATION */}

          <DetailSection
            title="Location Information"
            icon={<Navigation size={18} />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label="Start Location"
                value={
                  task?.location_start_km !== undefined
                    ? `${task.location_start_km} km`
                    : undefined
                }
              />

              <DetailItem
                label="End Location"
                value={
                  task?.location_end_km !== undefined
                    ? `${task.location_end_km} km`
                    : undefined
                }
              />

              <DetailItem
                label="Location"
                value={
                  task?.location_km !== undefined
                    ? `${task.location_km} km`
                    : undefined
                }
              />
            </div>
          </DetailSection>

          {/* MAINTENANCE */}

          <DetailSection
            title="Maintenance Information"
            icon={<Activity size={18} />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label="Estimated Duration"
                value={
                  task?.estimated_duration_hrs !== undefined
                    ? `${task.estimated_duration_hrs} hrs`
                    : undefined
                }
              />

              <DetailItem label="Defect Type" value={task?.defect_type} />

              <DetailItem label="Severity" value={task?.severity} />

              <DetailItem label="Overdue Days" value={task?.overdue_days} />
            </div>
          </DetailSection>

          {/* AI */}

          <DetailSection
            title="AI & Risk Information"
            icon={<ShieldAlert size={18} />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricBox
                label="Priority Score"
                value={task?.priority_score}
                icon={<Gauge size={18} />}
              />

              <MetricBox
                label="Failure Risk"
                value={task?.failure_risk}
                icon={<ShieldAlert size={18} />}
              />

              <MetricBox
                label="Traffic Load"
                value={task?.traffic_load}
                icon={<Train size={18} />}
              />

              <MetricBox
                label="Status"
                value={displayStatus(task?.status)}
                icon={<Activity size={18} />}
              />
            </div>
          </DetailSection>

          {/* CONFIRMED SCHEDULE */}

          <DetailSection
            title="Confirmed Schedule"
            icon={<CalendarCheck size={18} />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Block Window" value={task?.block_window_id} />

              <DetailItem label="Date" value={task?.date} />

              <DetailItem label="Start Time" value={task?.start_time} />

              <DetailItem label="End Time" value={task?.end_time} />

              <DetailItem
                label="Duration"
                value={
                  task?.estimated_duration_hrs !== undefined
                    ? `${task.estimated_duration_hrs} hrs`
                    : undefined
                }
              />

              <DetailItem label="Status" value={displayStatus(task?.status)} />

              <DetailItem
                label="Compatibility"
                value={task?.compatibility_group}
              />

              <DetailItem label="Reason" value={task?.reason} />
            </div>
          </DetailSection>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL SECTION
// ============================================================

function DetailSection({ title, icon, children }) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="text-blue-600">{icon}</div>

        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ label, value, highlight }) {
  const text = displayValue(value);

  let valueClass = "text-sm font-semibold text-slate-800";

  if (highlight === "CRITICAL") {
    valueClass = "text-sm font-bold text-red-600";
  } else if (highlight === "HIGH") {
    valueClass = "text-sm font-bold text-orange-600";
  } else if (highlight === "MEDIUM") {
    valueClass = "text-sm font-bold text-yellow-600";
  } else if (highlight === "LOW") {
    valueClass = "text-sm font-bold text-emerald-600";
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-2 break-words ${valueClass}`}>{text}</p>
    </div>
  );
}

// ============================================================
// METRIC BOX
// ============================================================

function MetricBox({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">{icon}</div>
      </div>

      <p className="mt-3 text-lg font-bold text-slate-900">
        {displayValue(value)}
      </p>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

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

    default:
      className = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
    >
      {displayStatus(value)}
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
