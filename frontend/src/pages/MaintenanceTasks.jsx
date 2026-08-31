
import { useCallback, useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  X,
  RefreshCw,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Database,
  MapPin,
  CalendarDays,
  Clock3,
} from "lucide-react";

import {
  getTasks,
  createTask,
  deleteTask,
} from "../services/taskService";

// ============================================================
// INITIAL FORM
// ============================================================

const INITIAL_FORM = {
  task_id: "",
  asset_id: "",
  corridor_id: "",

  location_start_km: "",
  location_end_km: "",
  location_km: "",

  defect_type: "",
  severity: "",

  overdue_days: "0",

  last_maintenance_date: "",

  estimated_duration_hrs: "",

  system: "",
};

// ============================================================
// HELPERS
// ============================================================

function getTaskId(task) {
  return task?.task_id || task?.id || "";
}

function getTaskList(response) {
  /*
   * Backend currently returns:
   *
   * [
   *   {...},
   *   {...}
   * ]
   *
   * The additional cases make this component tolerant
   * if the API is later wrapped in { data: [...] }.
   */

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.tasks)) {
    return response.data.tasks;
  }

  if (Array.isArray(response?.tasks)) {
    return response.tasks;
  }

  return [];
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  } catch {
    return value;
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function MaintenanceTasks() {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  // ==========================================================
  // LOAD TASKS
  // ==========================================================

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTasks();

      console.log("GET /tasks response:", response);

      const taskList = getTaskList(response);

      console.log("Tasks extracted:", taskList);

      setTasks(taskList);
    } catch (err) {
      console.error("Failed to load maintenance tasks:", err);

      setTasks([]);

      setError(
        err?.message ||
          "Unable to load maintenance tasks. Check that the backend is running on http://localhost:8000.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  const validateForm = () => {
    if (!form.task_id.trim()) {
      return "Task ID is required.";
    }

    if (!form.asset_id.trim()) {
      return "Asset ID is required.";
    }

    if (!form.corridor_id.trim()) {
      return "Corridor ID is required.";
    }

    if (!form.defect_type.trim()) {
      return "Defect type is required.";
    }

    if (!form.severity) {
      return "Severity is required.";
    }

    if (!form.last_maintenance_date) {
      return "Last maintenance date is required.";
    }

    if (
      form.estimated_duration_hrs === "" ||
      Number.isNaN(Number(form.estimated_duration_hrs)) ||
      Number(form.estimated_duration_hrs) < 0
    ) {
      return "Estimated duration must be 0 or greater.";
    }

    if (
      form.overdue_days !== "" &&
      (Number.isNaN(Number(form.overdue_days)) ||
        Number(form.overdue_days) < 0)
    ) {
      return "Overdue days cannot be negative.";
    }

    if (
      form.location_start_km !== "" &&
      Number(form.location_start_km) < 0
    ) {
      return "Start KM cannot be negative.";
    }

    if (
      form.location_end_km !== "" &&
      Number(form.location_end_km) < 0
    ) {
      return "End KM cannot be negative.";
    }

    if (form.location_km !== "" && Number(form.location_km) < 0) {
      return "Location KM cannot be negative.";
    }

    if (
      form.location_start_km !== "" &&
      form.location_end_km !== "" &&
      Number(form.location_end_km) < Number(form.location_start_km)
    ) {
      return "End KM cannot be less than Start KM.";
    }

    return "";
  };

  // ==========================================================
  // CREATE TASK
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        task_id: form.task_id.trim(),

        asset_id: form.asset_id.trim(),

        corridor_id: form.corridor_id.trim(),

        location_start_km:
          form.location_start_km === ""
            ? null
            : Number(form.location_start_km),

        location_end_km:
          form.location_end_km === ""
            ? null
            : Number(form.location_end_km),

        location_km:
          form.location_km === ""
            ? null
            : Number(form.location_km),

        defect_type: form.defect_type.trim(),

        severity: form.severity,

        overdue_days:
          form.overdue_days === ""
            ? 0
            : Number(form.overdue_days),

        last_maintenance_date:
          form.last_maintenance_date,

        estimated_duration_hrs:
          Number(form.estimated_duration_hrs),

        system:
          form.system.trim() || null,
      };

      console.log("POST /tasks payload:", payload);

      const response = await createTask(payload);

      console.log("POST /tasks response:", response);

      setSuccess("Maintenance task created successfully.");

      setForm({
        ...INITIAL_FORM,
      });

      setShowForm(false);

      await loadTasks();
    } catch (err) {
      console.error("Create task failed:", err);

      setError(
        err?.message ||
          "Failed to create maintenance task.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const handleDelete = async (taskId) => {
    if (!taskId) {
      setError("Unable to delete task: task ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete task ${taskId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(taskId);

      setError("");
      setSuccess("");

      console.log(`DELETE /tasks/${taskId}`);

      await deleteTask(taskId);

      setSuccess(
        `Maintenance task ${taskId} deleted successfully.`,
      );

      await loadTasks();
    } catch (err) {
      console.error("Delete task failed:", err);

      setError(
        err?.message ||
          "Failed to delete maintenance task.",
      );
    } finally {
      setDeleting("");
    }
  };

  // ==========================================================
  // OPEN FORM
  // ==========================================================

  const openForm = () => {
    setError("");
    setSuccess("");

    setForm({
      ...INITIAL_FORM,
    });

    setShowForm(true);
  };

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const highSeverityCount = tasks.filter((task) => {
    const severity = String(
      task?.severity || "",
    ).toUpperCase();

    return (
      severity === "HIGH" ||
      severity === "CRITICAL"
    );
  }).length;

  const overdueCount = tasks.filter(
    (task) =>
      Number(task?.overdue_days || 0) > 0,
  ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/20">
            <ClipboardList size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Maintenance Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage railway maintenance tasks.
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Add Task
          </button>

        </div>
      </div>

      {/* ====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

          <CheckCircle2 size={19} />

          <span>{success}</span>

        </div>
      )}

      {/* ====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Request Error
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* ====================================================
          SUMMARY
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          title="Total Tasks"
          value={tasks.length}
          icon={
            <ClipboardList size={20} />
          }
          iconClass="bg-blue-100 text-blue-600"
        />

        <SummaryCard
          title="High / Critical"
          value={highSeverityCount}
          icon={
            <AlertTriangle size={20} />
          }
          iconClass="bg-red-100 text-red-600"
        />

        <SummaryCard
          title="Overdue Tasks"
          value={overdueCount}
          icon={
            <Database size={20} />
          }
          iconClass="bg-orange-100 text-orange-600"
        />

      </div>

      {/* ====================================================
          TABLE CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:px-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="font-bold text-slate-900">
                All Maintenance Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks currently stored in the backend database.
              </p>
            </div>

            {!loading && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {tasks.length}{" "}
                {tasks.length === 1
                  ? "Task"
                  : "Tasks"}
              </span>
            )}

          </div>

        </div>

        {/* ==================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">

            <RefreshCw
              size={32}
              className="animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading maintenance tasks...
            </p>

          </div>
        )}

        {/* ==================================================
            EMPTY
        =================================================== */}

        {!loading && tasks.length === 0 && (
          <div className="py-20 text-center">

            <ClipboardList
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-700">
              No maintenance tasks
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Click "Add Task" to create your first task.
            </p>

            <button
              type="button"
              onClick={openForm}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={17} />
                Add First Task
              </span>
            </button>

          </div>
        )}

        {/* ==================================================
            TABLE
        =================================================== */}

        {!loading && tasks.length > 0 && (
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
                    Location
                  </th>

                  <th className="px-6 py-4">
                    Defect
                  </th>

                  <th className="px-6 py-4">
                    Severity
                  </th>

                  <th className="px-6 py-4">
                    Overdue
                  </th>

                  <th className="px-6 py-4">
                    Duration
                  </th>

                  <th className="px-6 py-4">
                    Last Maintenance
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {tasks.map((task, index) => {

                  const taskId =
                    getTaskId(task);

                  const location =
                    task.location_km ??
                    (
                      task.location_start_km != null &&
                      task.location_end_km != null
                        ? `${task.location_start_km} - ${task.location_end_km}`
                        : task.location_start_km ??
                          task.location_end_km ??
                          "-"
                    );

                  return (
                    <tr
                      key={`${taskId}-${index}`}
                      className="transition hover:bg-slate-50"
                    >

                      {/* TASK ID */}

                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {task.task_id || "-"}
                        </span>
                      </td>

                      {/* ASSET */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {task.asset_id || "-"}
                      </td>

                      {/* CORRIDOR */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {task.corridor_id || "-"}
                      </td>

                      {/* LOCATION */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span>
                            {location}
                            {location !== "-"
                              ? " KM"
                              : ""}
                          </span>

                        </div>

                      </td>

                      {/* DEFECT */}

                      <td className="px-6 py-4 text-sm text-slate-700">

                        <div>
                          {task.defect_type || "-"}
                        </div>

                        {task.system && (
                          <div className="mt-1 text-xs text-slate-400">
                            {task.system}
                          </div>
                        )}

                      </td>

                      {/* SEVERITY */}

                      <td className="px-6 py-4">
                        <SeverityBadge
                          severity={task.severity}
                        />
                      </td>

                      {/* OVERDUE */}

                      <td className="px-6 py-4 text-sm">

                        <span
                          className={
                            Number(
                              task.overdue_days || 0,
                            ) > 0
                              ? "font-bold text-red-600"
                              : "text-slate-500"
                          }
                        >
                          {task.overdue_days || 0} days
                        </span>

                      </td>

                      {/* DURATION */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        <div className="flex items-center gap-2">

                          <Clock3
                            size={15}
                            className="text-slate-400"
                          />

                          {task.estimated_duration_hrs ??
                            "-"}{" "}
                          hrs

                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-sm text-slate-600">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(
                            task.last_maintenance_date,
                          )}

                        </div>

                      </td>

                      {/* DELETE */}

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          disabled={
                            deleting === taskId
                          }
                          onClick={() =>
                            handleDelete(taskId)
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete task"
                        >

                          {deleting === taskId ? (
                            <RefreshCw
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={18} />
                          )}

                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ====================================================
          CREATE TASK MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-6">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Add Maintenance Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the details of the railway maintenance task.
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-7 p-5 sm:p-6"
            >

              {/* ==================================================
                  TASK INFORMATION
              =================================================== */}

              <section>

                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Task Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <Input
                    label="Task ID"
                    name="task_id"
                    value={form.task_id}
                    onChange={handleChange}
                    placeholder="TASK-001"
                    required
                  />

                  <Input
                    label="Asset ID"
                    name="asset_id"
                    value={form.asset_id}
                    onChange={handleChange}
                    placeholder="ASSET-001"
                    required
                  />

                  <Input
                    label="Corridor ID"
                    name="corridor_id"
                    value={form.corridor_id}
                    onChange={handleChange}
                    placeholder="COR-001"
                    required
                  />

                  <Input
                    label="Defect Type"
                    name="defect_type"
                    value={form.defect_type}
                    onChange={handleChange}
                    placeholder="Track defect"
                    required
                  />

                  <Select
                    label="Severity"
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    options={[
                      "Low",
                      "Medium",
                      "High",
                      "Critical",
                    ]}
                    required
                  />

                  <Input
                    label="System"
                    name="system"
                    value={form.system}
                    onChange={handleChange}
                    placeholder="Track / Signal / Power"
                  />

                </div>

              </section>

              {/* ==================================================
                  LOCATION
              =================================================== */}

              <section>

                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Location
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <Input
                    label="Start KM"
                    name="location_start_km"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.location_start_km}
                    onChange={handleChange}
                    placeholder="10.50"
                  />

                  <Input
                    label="End KM"
                    name="location_end_km"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.location_end_km}
                    onChange={handleChange}
                    placeholder="12.50"
                  />

                  <Input
                    label="Location KM"
                    name="location_km"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.location_km}
                    onChange={handleChange}
                    placeholder="11.50"
                  />

                </div>

              </section>

              {/* ==================================================
                  MAINTENANCE INFORMATION
              =================================================== */}

              <section>

                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Maintenance Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <Input
                    label="Overdue Days"
                    name="overdue_days"
                    type="number"
                    min="0"
                    step="1"
                    value={form.overdue_days}
                    onChange={handleChange}
                    placeholder="0"
                  />

                  <Input
                    label="Estimated Duration (Hours)"
                    name="estimated_duration_hrs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      form.estimated_duration_hrs
                    }
                    onChange={handleChange}
                    placeholder="4"
                    required
                  />

                  <Input
                    label="Last Maintenance Date"
                    name="last_maintenance_date"
                    type="date"
                    value={
                      form.last_maintenance_date
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

              </section>

              {/* ==================================================
                  FORM ERROR
              =================================================== */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Unable to create task
                    </p>

                    <p className="mt-1">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* ==================================================
                  BUTTONS
              =================================================== */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Creating..."
                    : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`rounded-xl p-2 ${iconClass}`}
        >
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
// SEVERITY BADGE
// ============================================================

function SeverityBadge({ severity }) {
  const value = String(
    severity || "",
  ).toUpperCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (value === "CRITICAL") {
    className =
      "bg-red-100 text-red-700";
  } else if (value === "HIGH") {
    className =
      "bg-orange-100 text-orange-700";
  } else if (value === "MEDIUM") {
    className =
      "bg-yellow-100 text-yellow-700";
  } else if (value === "LOW") {
    className =
      "bg-emerald-100 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {severity || "-"}
    </span>
  );
}

// ============================================================
// INPUT
// ============================================================

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  step,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />

    </div>
  );
}

// ============================================================
// SELECT
// ============================================================

function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >

        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

