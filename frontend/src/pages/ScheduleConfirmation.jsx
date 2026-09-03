
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Train,
  MapPin,
} from "lucide-react";

import {
  generateSchedule,
  confirmSchedule,
} from "../services/scheduleService";

// ============================================================
// STATUS OPTIONS
// ============================================================

const SCHEDULED_STATUS_OPTIONS = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
];

const UNSCHEDULED_STATUS_OPTIONS = [
  "PENDING",
  "RESOLVED",
  "CANCELLED",
];

// ============================================================
// COMPONENT
// ============================================================

export default function ScheduleConfirmation() {
  const navigate = useNavigate();

  // IMPORTANT:
  // These start empty.
  //
  // We intentionally DO NOT call getConfirmedSchedule()
  // when this page opens.
  //
  // This page only contains the temporary/generated schedule.
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [planningStartDate, setPlanningStartDate] =
    useState("");

  const [planningEndDate, setPlanningEndDate] =
    useState("");

  // ==========================================================
  // DISPLAY VALUE
  // ==========================================================

  const displayValue = (value, fallback = "-") => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return String(value);
  };

  // ==========================================================
  // GENERATE SCHEDULE
  // ==========================================================

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // VALIDATE DATES
      // ------------------------------------------------------

      if (
        planningStartDate &&
        planningEndDate &&
        planningStartDate > planningEndDate
      ) {
        throw new Error(
          "Planning start date cannot be after the end date.",
        );
      }

      // ------------------------------------------------------
      // PAYLOAD
      // ------------------------------------------------------

      const payload = {
        planning_start_date:
          planningStartDate || null,

        planning_end_date:
          planningEndDate || null,
      };

      console.log(
        "========================================",
      );

      console.log("GENERATING SCHEDULE");

      console.log("REQUEST:", payload);

      console.log(
        "========================================",
      );

      // ------------------------------------------------------
      // CALL BACKEND
      // ------------------------------------------------------

      const response =
        await generateSchedule(payload);

      console.log(
        "GENERATE SCHEDULE RESPONSE:",
        response,
      );

      if (!response) {
        throw new Error(
          "Empty response received from schedule API.",
        );
      }

      if (response.success === false) {
        throw new Error(
          response.error ||
            response.detail?.error ||
            "Unable to generate schedule.",
        );
      }

      // ------------------------------------------------------
      // SUPPORT BOTH RESPONSE FORMATS
      //
      // {
      //   scheduled: [],
      //   unscheduled: []
      // }
      //
      // OR
      //
      // {
      //   success: true,
      //   data: {
      //     scheduled: [],
      //     unscheduled: []
      //   }
      // }
      // ------------------------------------------------------

      const data =
        response?.data || response;

      const scheduled =
        Array.isArray(data?.scheduled)
          ? data.scheduled
          : [];

      const unscheduled =
        Array.isArray(data?.unscheduled)
          ? data.unscheduled
          : [];

      // ------------------------------------------------------
      // NORMALIZE RESULTS
      // ------------------------------------------------------

      const normalizedScheduled =
        scheduled.map(
          normalizeScheduledTask,
        );

      const normalizedUnscheduled =
        unscheduled.map(
          normalizeUnscheduledTask,
        );

      // ------------------------------------------------------
      // SHOW GENERATED SCHEDULE
      // ------------------------------------------------------

      setScheduledTasks(
        normalizedScheduled,
      );

      setUnscheduledTasks(
        normalizedUnscheduled,
      );

      setSuccess(
        `Schedule generated successfully. ${normalizedScheduled.length} scheduled and ${normalizedUnscheduled.length} unscheduled tasks.`,
      );
    } catch (err) {
      console.error(
        "Generate schedule error:",
        err,
      );

      setError(
        err?.message ||
          "Unable to generate schedule.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CHANGE SCHEDULED STATUS
  //
  // Status is changed locally.
  //
  // It is sent to backend when Confirm Schedule is clicked.
  // ==========================================================

  const handleScheduledStatusChange = (
    taskId,
    status,
  ) => {
    const normalizedStatus =
      normalizeScheduledStatus(status);

    setScheduledTasks((current) =>
      current.map((task) => {
        const currentId =
          task?.task_id ??
          task?.id;

        if (
          String(currentId) !==
          String(taskId)
        ) {
          return task;
        }

        return {
          ...task,
          status: normalizedStatus,
        };
      }),
    );

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // CHANGE UNSCHEDULED STATUS
  //
  // Status is changed locally.
  //
  // It is sent to backend when Confirm Schedule is clicked.
  // ==========================================================

  const handleUnscheduledStatusChange = (
    taskId,
    status,
  ) => {
    const normalizedStatus =
      normalizeUnscheduledStatus(status);

    setUnscheduledTasks((current) =>
      current.map((task) => {
        const currentId =
          task?.task_id ??
          task?.id;

        if (
          String(currentId) !==
          String(taskId)
        ) {
          return task;
        }

        return {
          ...task,
          status: normalizedStatus,
        };
      }),
    );

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // CONFIRM SCHEDULE
  // ==========================================================

  const handleConfirmSchedule = async () => {
    try {
      setConfirming(true);
      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // VALIDATE
      // ------------------------------------------------------

      if (
        scheduledTasks.length === 0 &&
        unscheduledTasks.length === 0
      ) {
        throw new Error(
          "There is no generated schedule to confirm. Please generate a schedule first.",
        );
      }

      // ------------------------------------------------------
      // PREPARE SCHEDULED TASKS
      //
      // IMPORTANT:
      // Include the CURRENT status selected by the user.
      // ------------------------------------------------------

      const scheduled =
        scheduledTasks.map((task) => ({
          ...task,

          task_id:
            task?.task_id ??
            task?.id,

          status:
            normalizeScheduledStatus(
              task?.status,
            ),
        }));

      // ------------------------------------------------------
      // PREPARE UNSCHEDULED TASKS
      //
      // IMPORTANT:
      // Include the CURRENT status selected by the user.
      // ------------------------------------------------------

      const unscheduled =
        unscheduledTasks.map((task) => ({
          ...task,

          task_id:
            task?.task_id ??
            task?.id,

          status:
            normalizeUnscheduledStatus(
              task?.status,
            ),
        }));

      const payload = {
        scheduled,
        unscheduled,
      };

      console.log(
        "========================================",
      );

      console.log(
        "CONFIRMING SCHEDULE",
      );

      console.log(
        "CONFIRM REQUEST:",
        payload,
      );

      console.log(
        "========================================",
      );

      // ------------------------------------------------------
      // SAVE TO BACKEND
      // ------------------------------------------------------

      const response =
        await confirmSchedule(payload);

      console.log(
        "CONFIRM SCHEDULE RESPONSE:",
        response,
      );

      if (!response) {
        throw new Error(
          "Empty response received from confirm schedule API.",
        );
      }

      if (response.success === false) {
        throw new Error(
          response.error ||
            response.detail?.error ||
            "Unable to confirm schedule.",
        );
      }

      // ------------------------------------------------------
      // IMPORTANT
      //
      // DO NOT reload confirmed schedule here.
      //
      // ConfirmedSchedule.jsx is responsible for loading
      // the newly saved records.
      // ------------------------------------------------------

      setScheduledTasks([]);
      setUnscheduledTasks([]);

      setSuccess("");

      // ------------------------------------------------------
      // REDIRECT TO CONFIRMED SCHEDULE
      // ------------------------------------------------------

      navigate("/confirmed-schedule");
    } catch (err) {
      console.error(
        "Confirm schedule error:",
        err,
      );

      setError(
        err?.message ||
          "Unable to confirm schedule.",
      );
    } finally {
      setConfirming(false);
    }
  };

  // ==========================================================
  // REFRESH / RESET GENERATED SCHEDULE
  //
  // Since this page represents a temporary generated schedule,
  // Refresh means generate again using the selected dates.
  // ==========================================================

  const handleRefresh = async () => {
    if (
      loading ||
      confirming
    ) {
      return;
    }

    await handleGenerateSchedule();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg">
            <CalendarCheck size={26} />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Schedule Confirmation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Generate, review and confirm the AI maintenance schedule.
            </p>

          </div>

        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          
          <button
            type="button"
            onClick={
              handleGenerateSchedule
            }
            disabled={
              loading ||
              confirming
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Generating..."
              : "Generate Schedule"}

          </button>

        </div>

      </div>

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{success}</span>

        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span className="break-words">
            {error}
          </span>

        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          title="Generated Total"
          value={
            scheduledTasks.length +
            unscheduledTasks.length
          }
          icon={
            <CalendarCheck size={21} />
          }
        />

        <SummaryCard
          title="Scheduled"
          value={
            scheduledTasks.length
          }
          icon={
            <CheckCircle2 size={21} />
          }
        />

        <SummaryCard
          title="Unscheduled"
          value={
            unscheduledTasks.length
          }
          icon={
            <AlertTriangle size={21} />
          }
        />

      </div>

      {/* ======================================================
          SCHEDULED TASKS
      ====================================================== */}

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-emerald-50/50 px-6 py-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-2">

              <CheckCircle2
                size={21}
                className="text-emerald-600"
              />

              <h2 className="font-bold text-slate-900">
                Scheduled Tasks
              </h2>

            </div>

            <p className="mt-1 text-sm text-slate-500">
              Tasks assigned to valid maintenance windows.
            </p>

          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {scheduledTasks.length} tasks
          </span>

        </div>

        {scheduledTasks.length === 0 ? (

          <EmptyState
            icon={
              <CalendarCheck size={30} />
            }
            title="No scheduled tasks"
            message="Click Generate Schedule to generate the maintenance schedule."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px] text-left">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                <tr>

                  <th className="px-6 py-4">
                    Task ID
                  </th>

                  <th className="px-6 py-4">
                    Asset
                  </th>

                  <th className="px-6 py-4">
                    Corridor
                  </th>

                  <th className="px-6 py-4">
                    Block Window
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Time
                  </th>

                  <th className="px-6 py-4">
                    Duration
                  </th>

                  <th className="px-6 py-4">
                    Priority
                  </th>

                  <th className="px-6 py-4">
                    Risk
                  </th>

                  <th className="px-6 py-4">
                    Traffic
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {scheduledTasks.map(
                  (task, index) => {

                    const taskId =
                      task?.task_id ??
                      task?.id ??
                      index;

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
                            {task?.priority_score != null
                              ? `${(task.priority_score * 100).toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </td>

                        {/* RISK */}

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            {task?.failure_risk != null
                              ? `${(task.failure_risk * 100).toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </td>

                        {/* TRAFFIC */}

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {task?.traffic_load != null
                              ? `${(task.traffic_load * 100).toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <StatusSelect
                            value={normalizeScheduledStatus(task?.status)}
                            options={SCHEDULED_STATUS_OPTIONS}
                            disabled={confirming || loading}
                            onChange={(value) =>
                              handleScheduledStatusChange(taskId, value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ======================================================
          UNSCHEDULED TASKS
      ====================================================== */}

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-orange-50/50 px-6 py-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-2">

              <AlertTriangle
                size={21}
                className="text-orange-600"
              />

              <h2 className="font-bold text-slate-900">
                Unscheduled Tasks
              </h2>

            </div>

            <p className="mt-1 text-sm text-slate-500">
              Tasks that could not be assigned to a maintenance window.
            </p>

          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {unscheduledTasks.length} tasks
          </span>

        </div>

        {unscheduledTasks.length === 0 ? (

          <EmptyState
            icon={
              <CheckCircle2 size={30} />
            }
            title="No unscheduled tasks"
            message="Generate a schedule to see tasks that could not be assigned."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                <tr>

                  <th className="px-6 py-4">
                    Task ID
                  </th>

                  <th className="px-6 py-4">
                    Asset
                  </th>

                  <th className="px-6 py-4">
                    Corridor
                  </th>

                  <th className="px-6 py-4">
                    Compatibility
                  </th>

                

                  <th className="px-6 py-4">
                    Reason
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {unscheduledTasks.map(
                  (task, index) => {

                    const taskId =
                      task?.task_id ??
                      task?.id ??
                      index;

                    return (
                      <tr
                        key={String(taskId)}
                        className="transition hover:bg-slate-50"
                      >

                        {/* TASK ID */}

                        <td className="px-6 py-4">

                          <span className="font-bold text-blue-600">
                            {displayValue(
                              task?.task_id ??
                                task?.id,
                            )}
                          </span>

                        </td>

                        {/* ASSET */}

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {displayValue(
                            task?.asset_id,
                          )}
                        </td>

                        {/* CORRIDOR */}

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {displayValue(
                            task?.corridor_id,
                          )}
                        </td>

                        {/* COMPATIBILITY */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {displayValue(
                            task?.compatibility_group,
                          )}
                        </td>

                        {/* REASON */}

                        <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                          {displayValue(
                            task?.reason,
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <StatusSelect
                            value={
                              normalizeUnscheduledStatus(
                                task?.status,
                              )
                            }
                            options={
                              UNSCHEDULED_STATUS_OPTIONS
                            }
                            disabled={
                              confirming ||
                              loading
                            }
                            onChange={(value) =>
                              handleUnscheduledStatusChange(
                                taskId,
                                value,
                              )
                            }
                          />

                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ======================================================
          CONFIRM BAR
      ====================================================== */}

      <div className="sticky bottom-4 z-10">

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur sm:flex-row">

          <div>

            <p className="font-bold text-slate-900">
              Ready to confirm?
            </p>

            
            

          </div>

          <button
            type="button"
            onClick={
              handleConfirmSchedule
            }
            disabled={
              confirming ||
              loading ||
              (
                scheduledTasks.length === 0 &&
                unscheduledTasks.length === 0
              )
            }
            className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {confirming ? (
              <>
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />

                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={18}
                />

                Confirm Schedule
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// NORMALIZE SCHEDULED TASK
// ============================================================

function normalizeScheduledTask(task) {
  return {
    ...task,

    task_id:
      task?.task_id ??
      task?.id ??
      "",

    status:
      normalizeScheduledStatus(
        task?.status,
      ),
  };
}

// ============================================================
// NORMALIZE UNSCHEDULED TASK
// ============================================================

function normalizeUnscheduledTask(task) {
  return {
    ...task,

    task_id:
      task?.task_id ??
      task?.id ??
      "",

    status:
      normalizeUnscheduledStatus(
        task?.status,
      ),
  };
}

// ============================================================
// NORMALIZE SCHEDULED STATUS
// ============================================================

function normalizeScheduledStatus(
  status,
) {
  const value = String(
    status || "PENDING",
  )
    .trim()
    .toUpperCase();

  return SCHEDULED_STATUS_OPTIONS.includes(
    value,
  )
    ? value
    : "PENDING";
}

// ============================================================
// NORMALIZE UNSCHEDULED STATUS
// ============================================================

function normalizeUnscheduledStatus(
  status,
) {
  const value = String(
    status || "PENDING",
  )
    .trim()
    .toUpperCase();

  return UNSCHEDULED_STATUS_OPTIONS.includes(
    value,
  )
    ? value
    : "PENDING";
}

// ============================================================
// STATUS SELECT
// ============================================================

function StatusSelect({
  value,
  options,
  onChange,
  disabled,
}) {
  return (
    <select
      value={value || "PENDING"}
      disabled={disabled}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options.map((status) => (
        <option
          key={status}
          value={status}
        >
          {status.replaceAll(
            "_",
            " ",
          )}
        </option>
      ))}
    </select>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  title,
  message,
}) {
  return (
    <div className="py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-700">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-lg text-sm text-slate-400">
        {message}
      </p>

    </div>
  );
}

