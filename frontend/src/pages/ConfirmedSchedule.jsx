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

const API_BASE_URL = "http://127.0.0.1:8001";

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "PENDING",
  },
  {
    value: "IN_PROGRESS",
    label: "IN PROGRESS",
  },
  {
    value: "DONE",
    label: "DONE",
  },
  {
    value: "NOT_DONE",
    label: "NOT DONE",
  },
];

// ============================================================
// HELPERS
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
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function displayStatus(status) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "IN_PROGRESS":
      return "IN PROGRESS";

    case "NOT_DONE":
      return "NOT DONE";

    case "DONE":
      return "DONE";

    case "PENDING":
    default:
      return "PENDING";
  }
}

// ============================================================
// GET REAL TASK ID
// ============================================================

function getTaskId(task) {
  if (!task) {
    return null;
  }

  /*
   * IMPORTANT:
   * The status API expects task_id, not the database numeric id.
   *
   * We therefore prefer task_id.
   */

  if (
    task.task_id !== undefined &&
    task.task_id !== null &&
    String(task.task_id).trim() !== ""
  ) {
    return String(task.task_id).trim();
  }

  /*
   * Some API responses may use taskId instead.
   */

  if (
    task.taskId !== undefined &&
    task.taskId !== null &&
    String(task.taskId).trim() !== ""
  ) {
    return String(task.taskId).trim();
  }

  return null;
}

// ============================================================
// STATUS COLOR
// ============================================================

function getStatusClasses(status) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "DONE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400";

    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-400";

    case "NOT_DONE":
      return "border-red-200 bg-red-50 text-red-700 focus:border-red-400";

    case "PENDING":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-400";
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ConfirmedSchedule() {
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // MODAL
  // ==========================================================

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskType, setSelectedTaskType] = useState(null);

  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [taskDetailsError, setTaskDetailsError] = useState("");

  // ==========================================================
  // STATUS UPDATE
  // ==========================================================

  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // ==========================================================
  // LOAD CONFIRMED SCHEDULE
  // ==========================================================

  const loadConfirmedSchedule = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (showRefreshState) {
        setSuccess("");
      }

      const response = await getConfirmedSchedule();

      console.log("CONFIRMED SCHEDULE RESPONSE:", response);

      if (!response) {
        throw new Error("No response received from the schedule API.");
      }

      if (response.success === false) {
        throw new Error(
          response?.error ||
            response?.detail?.error ||
            response?.detail ||
            "Unable to load confirmed schedule.",
        );
      }

      const data = response?.data || response;

      const scheduled = Array.isArray(data?.scheduled) ? data.scheduled : [];

      const unscheduled = Array.isArray(data?.unscheduled)
        ? data.unscheduled
        : [];

      console.log("SCHEDULED TASKS:", scheduled);
      console.log("UNSCHEDULED TASKS:", unscheduled);

      /*
       * Log the actual IDs received from the backend.
       * This is especially important for unscheduled tasks.
       */

      console.log(
        "UNSCHEDULED TASK IDS:",
        unscheduled.map((task) => ({
          task_id: task?.task_id,
          taskId: task?.taskId,
          id: task?.id,
          status: task?.status,
        })),
      );

      setScheduledTasks(scheduled);
      setUnscheduledTasks(unscheduled);

      if (showRefreshState) {
        setSuccess("Confirmed schedule refreshed successfully.");
      }
    } catch (err) {
      console.error("CONFIRMED SCHEDULE LOAD ERROR:", err);

      setError(err?.message || "Unable to load confirmed schedule.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadConfirmedSchedule();
  }, []);

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const updateTaskStatus = async (task, newStatus, taskType) => {
    const taskId = getTaskId(task);

    if (!taskId) {
      console.error("STATUS UPDATE FAILED - TASK OBJECT:", task);

      setError(
        "Cannot update status because this task does not contain a valid task_id.",
      );

      return;
    }

    const normalizedStatus = normalizeStatus(newStatus);

    /*
     * Only these four values are allowed by the backend.
     */

    if (!STATUS_OPTIONS.some((option) => option.value === normalizedStatus)) {
      setError(`Invalid status selected: ${normalizedStatus}`);
      return;
    }

    // --------------------------------------------------------
    // DETERMINE CORRECT BACKEND ENDPOINT
    // --------------------------------------------------------

    const basePath =
      taskType === "unscheduled"
        ? "/schedule/unscheduled/"
        : "/schedule/scheduled/";

    const endpoint =
      `${API_BASE_URL}${basePath}` + `${encodeURIComponent(taskId)}/status`;

    const requestUrl =
      `${endpoint}?status=` + `${encodeURIComponent(normalizedStatus)}`;

    try {
      setUpdatingTaskId(String(taskId));

      setError("");
      setSuccess("");

      console.log("==========================================");
      console.log("STATUS UPDATE");
      console.log("==========================================");
      console.log("Task ID:", taskId);
      console.log("Task Type:", taskType);
      console.log("New Status:", normalizedStatus);
      console.log("Request URL:", requestUrl);
      console.log("Task Object:", task);
      console.log("==========================================");

      const response = await fetch(requestUrl, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
        },
      });

      let responseData = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      console.log("STATUS UPDATE RESPONSE:", {
        status: response.status,
        ok: response.ok,
        data: responseData,
      });

      // ------------------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        let message = "Unable to update task status.";

        if (typeof responseData?.detail === "string") {
          message = responseData.detail;
        } else if (typeof responseData?.detail?.error === "string") {
          message = responseData.detail.error;
        } else if (Array.isArray(responseData?.detail?.allowed)) {
          message =
            `${responseData?.detail?.error || "Invalid status."} ` +
            `Allowed values: ${responseData.detail.allowed.join(", ")}`;
        } else if (typeof responseData?.error === "string") {
          message = responseData.error;
        } else if (typeof responseData?.message === "string") {
          message = responseData.message;
        }

        throw new Error(message);
      }

      // ------------------------------------------------------
      // UPDATE LOCAL STATE
      // ------------------------------------------------------

      if (taskType === "scheduled") {
        /*
         * Scheduled tasks remain in the scheduled list even
         * when their status changes.
         */

        setScheduledTasks((previousTasks) =>
          previousTasks.map((item) => {
            const itemId = getTaskId(item);

            if (String(itemId) !== String(taskId)) {
              return item;
            }

            return {
              ...item,
              status: normalizedStatus,
            };
          }),
        );
      }

      // ------------------------------------------------------
      // UNSCHEDULED TASK BEHAVIOR
      // ------------------------------------------------------

      if (taskType === "unscheduled") {
        if (normalizedStatus === "DONE") {
          /*
           * IMPORTANT:
           *
           * Once an UNSCHEDULED task is marked DONE,
           * immediately remove it from the unscheduled list.
           */

          setUnscheduledTasks((previousTasks) =>
            previousTasks.filter((item) => {
              const itemId = getTaskId(item);

              return String(itemId) !== String(taskId);
            }),
          );

          /*
           * Close the modal because the task is completed.
           */

          setSelectedTask(null);
          setSelectedTaskType(null);
          setTaskDetailsError("");
          setTaskDetailsLoading(false);
        } else {
          /*
           * For PENDING, IN_PROGRESS and NOT_DONE,
           * keep the task in the unscheduled list and
           * only update its status.
           */

          setUnscheduledTasks((previousTasks) =>
            previousTasks.map((item) => {
              const itemId = getTaskId(item);

              if (String(itemId) !== String(taskId)) {
                return item;
              }

              return {
                ...item,
                status: normalizedStatus,
              };
            }),
          );
        }
      }

      // ------------------------------------------------------
      // UPDATE MODAL
      // ------------------------------------------------------

      /*
       * Only update the modal if the task was NOT just
       * completed and removed.
       */

      if (!(taskType === "unscheduled" && normalizedStatus === "DONE")) {
        setSelectedTask((previousTask) => {
          if (!previousTask) {
            return previousTask;
          }

          const previousId = getTaskId(previousTask);

          if (String(previousId) !== String(taskId)) {
            return previousTask;
          }

          return {
            ...previousTask,
            status: normalizedStatus,
          };
        });
      }

      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      if (taskType === "unscheduled" && normalizedStatus === "DONE") {
        setSuccess(
          `Task ${taskId} has been completed and removed from unscheduled tasks.`,
        );
      } else {
        setSuccess(
          `Task ${taskId} status updated to ${displayStatus(
            normalizedStatus,
          )}.`,
        );
      }

      // ------------------------------------------------------
      // RELOAD FROM BACKEND
      // ------------------------------------------------------

      /*
       * Reload after the successful update so the UI reflects
       * the actual database state.
       *
       * IMPORTANT:
       * Your backend's confirmed-schedule API should also avoid
       * returning DONE tasks inside "unscheduled".
       */

      await loadConfirmedSchedule(false);
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);

      setError(err?.message || `Unable to update ${taskType} task status.`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // ==========================================================
  // OPEN TASK DETAILS
  // ==========================================================

  const openTaskDetails = async (task, taskType) => {
    const taskId = getTaskId(task);

    setSelectedTask({
      ...task,
    });

    setSelectedTaskType(taskType);

    setTaskDetailsError("");

    if (!taskId) {
      setTaskDetailsError("This task does not contain a valid task ID.");

      return;
    }

    setTaskDetailsLoading(true);

    try {
      const url = `${API_BASE_URL}/tasks/` + `${encodeURIComponent(taskId)}`;

      console.log("TASK DETAILS REQUEST:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        setTaskDetailsError(
          `Complete task information was not found for "${taskId}". Showing the information available from the schedule.`,
        );

        return;
      }

      if (!response.ok) {
        let message = "Unable to load task details.";

        try {
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            message = errorData.detail;
          } else if (typeof errorData?.message === "string") {
            message = errorData.message;
          }
        } catch {
          // Ignore parsing error.
        }

        throw new Error(message);
      }

      const taskData = await response.json();

      console.log("TASK DETAILS RESPONSE:", taskData);

      setSelectedTask({
        ...task,
        ...taskData,
      });
    } catch (err) {
      console.error("TASK DETAILS ERROR:", err);

      setTaskDetailsError(
        err?.message || "Unable to load complete task information.",
      );
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setSelectedTaskType(null);
    setTaskDetailsError("");
    setTaskDetailsLoading(false);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}

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

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <span className="break-words">{error}</span>
        </div>
      )}

      {/* SUMMARY */}

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
            <table className="w-full min-w-[1100px] text-left">
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
                  const taskId = getTaskId(task) || `scheduled-${index}`;

                  return (
                    <tr
                      key={String(taskId)}
                      onClick={() => openTaskDetails(task, "scheduled")}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            openTaskDetails(task, "scheduled");
                          }}
                          className="group flex items-center gap-2 text-left"
                        >
                          <span className="font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {displayValue(getTaskId(task))}
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

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Train size={16} className="text-slate-400" />

                          {displayValue(task?.asset_id)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin size={16} className="text-slate-400" />

                          {displayValue(task?.corridor_id)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.block_window_id)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {displayValue(task?.date)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock3 size={16} className="text-blue-500" />

                          {displayValue(task?.start_time)}

                          {" - "}

                          {displayValue(task?.end_time)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {displayValue(task?.estimated_duration_hrs)} hrs
                      </td>

                      <td
                        className="px-6 py-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StatusSelect
                          task={task}
                          taskType="scheduled"
                          updatingTaskId={updatingTaskId}
                          onChange={updateTaskStatus}
                        />
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
            <table className="w-full min-w-[1000px] text-left">
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
                  const taskId = getTaskId(task) || `unscheduled-${index}`;

                  return (
                    <tr
                      key={String(taskId)}
                      onClick={() => openTaskDetails(task, "unscheduled")}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            openTaskDetails(task, "unscheduled");
                          }}
                          className="group flex items-center gap-2 text-left"
                        >
                          <span className="font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {displayValue(getTaskId(task))}
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

                      <td
                        className="px-6 py-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StatusSelect
                          task={task}
                          taskType="unscheduled"
                          updatingTaskId={updatingTaskId}
                          onChange={updateTaskStatus}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* TASK DETAILS MODAL */}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          taskType={selectedTaskType}
          loading={taskDetailsLoading}
          error={taskDetailsError}
          onClose={closeTaskDetails}
          updatingTaskId={updatingTaskId}
          onStatusChange={updateTaskStatus}
        />
      )}
    </div>
  );
}

// ============================================================
// STATUS SELECT
// ============================================================

function StatusSelect({ task, taskType, updatingTaskId, onChange }) {
  const taskId = getTaskId(task);

  const currentStatus = normalizeStatus(task?.status);

  const isUpdating =
    taskId !== null && String(updatingTaskId) === String(taskId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentStatus}
        disabled={isUpdating || !taskId}
        onChange={(event) => {
          onChange(task, event.target.value, taskType);
        }}
        className={`min-w-[145px] rounded-xl border px-3 py-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-blue-500/20 ${getStatusClasses(
          currentStatus,
        )} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isUpdating && (
        <RefreshCw size={16} className="animate-spin text-blue-600" />
      )}
    </div>
  );
}

// ============================================================
// TASK DETAILS MODAL
// ============================================================

function TaskDetailsModal({
  task,
  taskType,
  loading,
  error,
  onClose,
  updatingTaskId,
  onStatusChange,
}) {
  const taskId = getTaskId(task) || "-";

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

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-6">
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Task Status
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Update the current maintenance progress.
                </p>
              </div>

              <StatusSelect
                task={task}
                taskType={taskType}
                updatingTaskId={updatingTaskId}
                onChange={onStatusChange}
              />
            </div>
          </div>

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

          {loading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
              <RefreshCw size={19} className="animate-spin text-blue-600" />

              <p className="text-sm font-medium text-blue-700">
                Loading complete task information...
              </p>
            </div>
          )}

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
    valueClass = "text-sm font-bold text-amber-600";
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
