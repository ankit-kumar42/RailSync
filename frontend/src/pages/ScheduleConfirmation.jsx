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

import {
  generateSchedule,
  confirmSchedule,
  getConfirmedSchedule,
} from "../services/scheduleService.js";

// ============================================================
// COMPONENT
// ============================================================

export default function ScheduleConfirmation() {
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingConfirmed, setLoadingConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [planningStartDate, setPlanningStartDate] = useState("");
  const [planningEndDate, setPlanningEndDate] = useState("");

  // ==========================================================
  // LOAD CONFIRMED
  // ==========================================================

  const loadConfirmedSchedule = async () => {
    try {
      setLoadingConfirmed(true);
      setError("");

      const response = await getConfirmedSchedule();

      if (!response?.success) {
        throw new Error(
          response?.error || "Unable to load confirmed schedule."
        );
      }

      const data = response?.data || {};

      setScheduledTasks(
        Array.isArray(data.scheduled) ? data.scheduled : []
      );

      setUnscheduledTasks(
        Array.isArray(data.unscheduled) ? data.unscheduled : []
      );
    } catch (err) {
      console.error("Failed to load confirmed schedule:", err);

      setError(
        err?.message || "Unable to load confirmed schedule."
      );
    } finally {
      setLoadingConfirmed(false);
    }
  };

  // ==========================================================
  // PAGE LOAD
  // ==========================================================

  useEffect(() => {
    loadConfirmedSchedule();
  }, []);

  // ==========================================================
  // GENERATE
  // ==========================================================

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        planning_start_date: planningStartDate || null,
        planning_end_date: planningEndDate || null,
      };

      const response = await generateSchedule(payload);

      if (!response) {
        throw new Error("Empty response received.");
      }

      if (response.success === false) {
        throw new Error(
          response.error || "Unable to generate schedule."
        );
      }

      const data = response?.data || response;

      const scheduled = Array.isArray(data?.scheduled)
        ? data.scheduled
        : [];

      const unscheduled = Array.isArray(data?.unscheduled)
        ? data.unscheduled
        : [];

      // --------------------------------------------------------
      // IMPORTANT
      //
      // Every newly generated task gets PENDING status unless
      // the AI explicitly returns another valid status.
      // --------------------------------------------------------

      const normalizedScheduled = scheduled.map((task) => ({
        ...task,
        status: normalizeStatus(task.status),
      }));

      const normalizedUnscheduled = unscheduled.map((task) => ({
        ...task,
        status: normalizeUnscheduledStatus(task.status),
      }));

      setScheduledTasks(normalizedScheduled);
      setUnscheduledTasks(normalizedUnscheduled);

      setSuccess(
        `Schedule generated successfully. ${normalizedScheduled.length} scheduled and ${normalizedUnscheduled.length} unscheduled tasks.`
      );
    } catch (err) {
      console.error("Generate schedule error:", err);

      setError(
        err?.message || "Unable to generate schedule."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CHANGE SCHEDULED STATUS BEFORE CONFIRMATION
  // ==========================================================

  const handleScheduledStatusChange = (taskId, status) => {
    setScheduledTasks((current) =>
      current.map((task) =>
        task.task_id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  };

  // ==========================================================
  // CHANGE UNSCHEDULED STATUS BEFORE CONFIRMATION
  // ==========================================================

  const handleUnscheduledStatusChange = (taskId, status) => {
    setUnscheduledTasks((current) =>
      current.map((task) =>
        task.task_id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  };

  // ==========================================================
  // CONFIRM
  // ==========================================================

  const handleConfirmSchedule = async () => {
    try {
      setConfirming(true);
      setError("");
      setSuccess("");

      if (
        scheduledTasks.length === 0 &&
        unscheduledTasks.length === 0
      ) {
        setError("There are no tasks to confirm.");
        return;
      }

      // --------------------------------------------------------
      // SEND CURRENT UI STATUS TO BACKEND
      // --------------------------------------------------------

      const payload = {
        scheduled: scheduledTasks.map((task) => ({
          ...task,
          status: normalizeStatus(task.status),
        })),

        unscheduled: unscheduledTasks.map((task) => ({
          ...task,
          status: normalizeUnscheduledStatus(task.status),
        })),
      };

      console.log("CONFIRM PAYLOAD:", payload);

      const response = await confirmSchedule(payload);

      if (!response?.success) {
        throw new Error(
          response?.error || "Unable to confirm schedule."
        );
      }

      // --------------------------------------------------------
      // IMPORTANT:
      //
      // Once confirmed, remove the generated tasks from this page.
      // The confirmed page/API becomes the source of truth.
      // --------------------------------------------------------

      setScheduledTasks([]);
      setUnscheduledTasks([]);

      setSuccess(
        response.message ||
          "Schedule confirmed successfully. Confirmed tasks have been moved to the confirmed schedule."
      );
    } catch (err) {
      console.error("Confirm schedule error:", err);

      setError(
        err?.message || "Unable to confirm schedule."
      );
    } finally {
      setConfirming(false);
    }
  };

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
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}

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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadConfirmedSchedule}
            disabled={
              loadingConfirmed ||
              loading ||
              confirming
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loadingConfirmed
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleGenerateSchedule}
            disabled={loading || confirming}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            {loading
              ? "Generating..."
              : "Generate Schedule"}
          </button>
        </div>
      </div>

      {/* PLANNING RANGE */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-900">
          Planning Range
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Start Date
            </label>

            <input
              type="date"
              value={planningStartDate}
              onChange={(e) =>
                setPlanningStartDate(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              End Date
            </label>

            <input
              type="date"
              value={planningEndDate}
              onChange={(e) =>
                setPlanningEndDate(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{success}</span>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="break-words">
            {error}
          </div>
        </div>
      )}

      {/* SUMMARY */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total"
          value={
            scheduledTasks.length +
            unscheduledTasks.length
          }
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
              Review and edit status before confirmation.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {scheduledTasks.length} tasks
          </span>
        </div>

        {scheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={30} />}
            title="No scheduled tasks"
            message="Generate a schedule to review tasks before confirmation."
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
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {scheduledTasks.map((task, index) => (
                  <tr
                    key={
                      task.task_id ||
                      task.id ||
                      index
                    }
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">
                        {displayValue(task.task_id)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Train
                          size={16}
                          className="text-slate-400"
                        />

                        {displayValue(task.asset_id)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin
                          size={16}
                          className="text-slate-400"
                        />

                        {displayValue(task.corridor_id)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {displayValue(task.block_window_id)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {displayValue(task.date)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock3
                          size={16}
                          className="text-blue-500"
                        />

                        {displayValue(task.start_time)}
                        {" - "}
                        {displayValue(task.end_time)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {displayValue(
                        task.estimated_duration_hrs
                      )}{" "}
                      hrs
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {displayValue(task.priority_score)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {displayValue(task.failure_risk)}
                      </span>
                    </td>

                    {/* EDITABLE BEFORE CONFIRMATION */}

                    <td className="px-6 py-4">
                      <StatusSelect
                        value={normalizeStatus(task.status)}
                        onChange={(value) =>
                          handleScheduledStatusChange(
                            task.task_id,
                            value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
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
              Review and edit status before confirmation.
            </p>
          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {unscheduledTasks.length} tasks
          </span>
        </div>

        {unscheduledTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={30} />}
            title="No unscheduled tasks"
            message="There are currently no unscheduled tasks."
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
                {unscheduledTasks.map((task, index) => (
                  <tr
                    key={
                      task.task_id ||
                      task.id ||
                      index
                    }
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">
                        {displayValue(task.task_id)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {displayValue(task.asset_id)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {displayValue(task.corridor_id)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {displayValue(
                        task.compatibility_group
                      )}
                    </td>


                    <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                      {displayValue(task.reason)}
                    </td>

                    {/* EDITABLE BEFORE CONFIRMATION */}

                    <td className="px-6 py-4">
                      <StatusSelect
                        value={normalizeUnscheduledStatus(
                          task.status
                        )}
                        onChange={(value) =>
                          handleUnscheduledStatusChange(
                            task.task_id,
                            value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CONFIRM */}

      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur sm:flex-row">
          <div>
            <p className="font-bold text-slate-900">
              Ready to confirm?
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Confirming moves these generated tasks to the confirmed schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmSchedule}
            disabled={
              confirming ||
              loading ||
              (
                scheduledTasks.length === 0 &&
                unscheduledTasks.length === 0
              )
            }
            className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                <CheckCircle2 size={18} />
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
// STATUS NORMALIZATION
// ============================================================

function normalizeStatus(status) {
  const allowed = [
    "PENDING",
    "IN_PROGRESS",
    "DONE",
    "NOT_DONE",
  ];

  const value = String(status || "PENDING").toUpperCase();

  return allowed.includes(value)
    ? value
    : "PENDING";
}

function normalizeUnscheduledStatus(status) {
  const allowed = [
    "PENDING",
    "IN_PROGRESS",
    "DONE",
    "NOT_DONE",
  ];

  const value = String(status || "PENDING").toUpperCase();

  return allowed.includes(value)
    ? value
    : "PENDING";
}

// ============================================================
// EDITABLE STATUS SELECT
// ============================================================

function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value || "PENDING"}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="PENDING">
        PENDING
      </option>

      <option value="IN_PROGRESS">
        IN PROGRESS
      </option>

      <option value="DONE">
        DONE
      </option>

      <option value="NOT_DONE">
        NOT DONE
      </option>
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

