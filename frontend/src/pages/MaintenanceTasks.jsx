import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Train,
  X,
} from "lucide-react";

import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
} from "../services/taskService";

/* ============================================================
   MAIN PAGE
============================================================ */

export default function MaintenanceTasks() {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [systemFilter, setSystemFilter] = useState("ALL");

  const [selectedTask, setSelectedTask] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD TASKS
  ========================================================== */

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTasks();

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load maintenance tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.task_id?.toLowerCase().includes(query) ||
        task.asset_id?.toLowerCase().includes(query) ||
        task.corridor_id?.toLowerCase().includes(query) ||
        task.defect_type?.toLowerCase().includes(query) ||
        task.system?.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "ALL" ||
        String(task.severity || "").toUpperCase() ===
          severityFilter.toUpperCase();

      const matchesSystem =
        systemFilter === "ALL" ||
        String(task.system || "").toUpperCase() === systemFilter.toUpperCase();

      return matchesSearch && matchesSeverity && matchesSystem;
    });
  }, [tasks, search, severityFilter, systemFilter]);

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const severityOptions = useMemo(() => {
    const values = tasks
      .map((task) => task.severity)
      .filter(Boolean)
      .map((value) => String(value));

    return [...new Set(values)].sort();
  }, [tasks]);

  const systemOptions = useMemo(() => {
    const values = tasks
      .map((task) => task.system)
      .filter(Boolean)
      .map((value) => String(value));

    return [...new Set(values)].sort();
  }, [tasks]);

  /* ==========================================================
     KPI
  ========================================================== */

  const totalTasks = tasks.length;

  const overdueTasks = tasks.filter(
    (task) => Number(task.overdue_days || 0) > 0,
  ).length;

  const highSeverityTasks = tasks.filter((task) => {
    const severity = String(task.severity || "").toUpperCase();

    return (
      severity === "HIGH" || severity === "CRITICAL" || severity === "SEVERE"
    );
  }).length;

  const totalDuration = tasks.reduce(
    (sum, task) => sum + Number(task.estimated_duration_hrs || 0),
    0,
  );

  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setSeverityFilter("ALL");
    setSystemFilter("ALL");
  };

  const filtersActive =
    search !== "" || severityFilter !== "ALL" || systemFilter !== "ALL";

  /* ==========================================================
     VIEW TASK
  ========================================================== */

  const handleViewTask = async (taskId) => {
    setError("");

    try {
      const task = await getTask(taskId);

      setSelectedTask(task);
    } catch (err) {
      setError(err.message || "Unable to load task details.");
    }
  };

  /* ==========================================================
     DELETE TASK
  ========================================================== */

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete task ${taskId}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingTask(taskId);
    setError("");
    setMessage("");

    try {
      const result = await deleteTask(taskId);

      setTasks((current) => current.filter((task) => task.task_id !== taskId));

      if (selectedTask?.task_id === taskId) {
        setSelectedTask(null);
      }

      setMessage(result?.message || `Task ${taskId} deleted successfully.`);
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    } finally {
      setDeletingTask(null);
    }
  };

  /* ==========================================================
     CREATE TASK
  ========================================================== */

  const handleCreateTask = async (formData) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const createdTask = await createTask(formData);

      setTasks((current) => [...current, createdTask]);

      setShowCreateModal(false);

      setMessage(`Task ${createdTask.task_id} created successfully.`);
    } catch (err) {
      setError(err.message || "Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw size={22} className="animate-spin" />

          <span className="font-medium">Loading maintenance tasks...</span>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6 pb-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <Train size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Maintenance Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage railway maintenance tasks from the backend database.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadTasks}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setError("");
              setMessage("");
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Task
          </button>
        </div>
      </div>

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />

          {message}

          <button onClick={() => setMessage("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0" />

          <span>{error}</span>

          <button onClick={() => setError("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================================
          KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={Database}
          description="Tasks in database"
        />

        <StatCard
          title="Overdue"
          value={overdueTasks}
          icon={Clock3}
          description="Tasks past due"
        />

        <StatCard
          title="High Severity"
          value={highSeverityTasks}
          icon={ShieldAlert}
          description="High-risk maintenance"
        />

        <StatCard
          title="Estimated Hours"
          value={`${totalDuration.toFixed(1)} hrs`}
          icon={CalendarClock}
          description="Total maintenance effort"
        />
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Task Filters</h2>

          <p className="mt-1 text-xs text-slate-500">
            Search and filter maintenance tasks.
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_220px_auto]">
            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task, asset, corridor, defect..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Severity */}

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>

              {severityOptions.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>

            {/* System */}

            <select
              value={systemFilter}
              onChange={(event) => setSystemFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Systems</option>

              {systemOptions.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>

            {/* Clear */}

            <button
              onClick={clearFilters}
              disabled={!filtersActive}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          TASK TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Maintenance Task Register
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks loaded directly from FastAPI.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {filteredTasks.length} Tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Task</th>

                <th className="px-4 py-3">Asset</th>

                <th className="px-4 py-3">Corridor</th>

                <th className="px-4 py-3">Location</th>

                <th className="px-4 py-3">Defect</th>

                <th className="px-4 py-3">Severity</th>

                <th className="px-4 py-3">Overdue</th>

                <th className="px-4 py-3">Duration</th>

                <th className="px-4 py-3">System</th>

                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.task_id}
                  task={task}
                  onView={handleViewTask}
                  onDelete={handleDeleteTask}
                  deleting={deletingTask === task.task_id}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <EmptyState
            title="No maintenance tasks found"
            description={
              tasks.length === 0
                ? "There are currently no maintenance tasks in the database."
                : "Try changing your search or filters."
            }
          />
        )}
      </section>

      {/* ======================================================
          SYSTEM INFO
      ====================================================== */}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={Database}
          title="Data Source"
          value="FastAPI + SQLAlchemy"
        />

        <InfoCard
          icon={Train}
          title="Maintenance"
          value="Railway Task Management"
        />

        <InfoCard
          icon={ShieldAlert}
          title="Planning"
          value="Ready for AI Scheduling"
        />
      </section>

      {/* ======================================================
          CREATE MODAL
      ====================================================== */}

      {showCreateModal && (
        <CreateTaskModal
          saving={saving}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   TASK ROW
============================================================ */

function TaskRow({ task, onView, onDelete, deleting }) {
  return (
    <tr className="transition hover:bg-slate-50">
      {/* TASK */}

      <td className="whitespace-nowrap px-5 py-4">
        <div>
          <p className="font-bold text-slate-900">{task.task_id}</p>

          <p className="mt-1 text-[11px] text-slate-400">Maintenance task</p>
        </div>
      </td>

      {/* ASSET */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="font-medium text-slate-700">
          {task.asset_id || "-"}
        </span>
      </td>

      {/* CORRIDOR */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {task.corridor_id || "-"}
        </span>
      </td>

      {/* LOCATION */}

      <td className="whitespace-nowrap px-4 py-4">
        <div>
          {task.location_km !== null && task.location_km !== undefined ? (
            <p className="font-semibold text-slate-700">
              KM {task.location_km}
            </p>
          ) : (
            <p className="font-semibold text-slate-700">
              {task.location_start_km ?? "-"} - {task.location_end_km ?? "-"}
            </p>
          )}

          {(task.location_start_km !== null ||
            task.location_end_km !== null) && (
            <p className="text-[11px] text-slate-400">Range</p>
          )}
        </div>
      </td>

      {/* DEFECT */}

      <td className="max-w-[220px] px-4 py-4">
        <div>
          <p className="font-medium text-slate-700">
            {task.defect_type || "-"}
          </p>

          {task.last_maintenance_date && (
            <p className="mt-1 text-[11px] text-slate-400">
              Last: {formatDate(task.last_maintenance_date)}
            </p>
          )}
        </div>
      </td>

      {/* SEVERITY */}

      <td className="whitespace-nowrap px-4 py-4">
        <SeverityBadge severity={task.severity} />
      </td>

      {/* OVERDUE */}

      <td className="whitespace-nowrap px-4 py-4">
        <OverdueBadge days={task.overdue_days} />
      </td>

      {/* DURATION */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="text-sm font-medium text-slate-700">
          {task.estimated_duration_hrs ?? "-"} hrs
        </span>
      </td>

      {/* SYSTEM */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {task.system || "-"}
        </span>
      </td>

      {/* ACTIONS */}

      <td className="whitespace-nowrap px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onView(task.task_id)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Eye size={14} />
            View
          </button>

          <button
            onClick={() => onDelete(task.task_id)}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   CREATE TASK MODAL
============================================================ */

function CreateTaskModal({ saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
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
  });

  const [formError, setFormError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.task_id.trim()) {
      setFormError("Task ID is required.");
      return;
    }

    if (!form.asset_id.trim()) {
      setFormError("Asset ID is required.");
      return;
    }

    if (!form.corridor_id.trim()) {
      setFormError("Corridor ID is required.");
      return;
    }

    /*
     * Convert numeric fields from strings to numbers.
     * Empty optional numeric fields become null.
     */

    const payload = {
      task_id: form.task_id.trim(),
      asset_id: form.asset_id.trim(),
      corridor_id: form.corridor_id.trim(),

      location_start_km:
        form.location_start_km === "" ? null : Number(form.location_start_km),

      location_end_km:
        form.location_end_km === "" ? null : Number(form.location_end_km),

      location_km: form.location_km === "" ? null : Number(form.location_km),

      defect_type: form.defect_type.trim() || null,

      severity: form.severity.trim() || null,

      overdue_days: form.overdue_days === "" ? 0 : Number(form.overdue_days),

      last_maintenance_date: form.last_maintenance_date || null,

      estimated_duration_hrs:
        form.estimated_duration_hrs === ""
          ? null
          : Number(form.estimated_duration_hrs),

      system: form.system.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch {
      // Parent handles API errors.
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Create Maintenance Task
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add a new task to the maintenance database.
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* BASIC INFORMATION */}

        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-800">
            Task Information
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <FormInput
              label="Task ID *"
              value={form.task_id}
              onChange={(value) => updateField("task_id", value)}
              placeholder="ENG-001"
            />

            <FormInput
              label="Asset ID *"
              value={form.asset_id}
              onChange={(value) => updateField("asset_id", value)}
              placeholder="TRK-4521"
            />

            <FormInput
              label="Corridor ID *"
              value={form.corridor_id}
              onChange={(value) => updateField("corridor_id", value)}
              placeholder="COR-101"
            />

            <FormInput
              label="Defect Type"
              value={form.defect_type}
              onChange={(value) => updateField("defect_type", value)}
              placeholder="Rail crack"
            />

            <FormInput
              label="Severity"
              value={form.severity}
              onChange={(value) => updateField("severity", value)}
              placeholder="HIGH"
            />

            <FormInput
              label="System"
              value={form.system}
              onChange={(value) => updateField("system", value)}
              placeholder="Track"
            />
          </div>
        </div>

        {/* LOCATION */}

        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-800">Location</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <FormInput
              label="Start KM"
              type="number"
              step="0.001"
              value={form.location_start_km}
              onChange={(value) => updateField("location_start_km", value)}
              placeholder="100.500"
            />

            <FormInput
              label="End KM"
              type="number"
              step="0.001"
              value={form.location_end_km}
              onChange={(value) => updateField("location_end_km", value)}
              placeholder="101.500"
            />

            <FormInput
              label="Location KM"
              type="number"
              step="0.001"
              value={form.location_km}
              onChange={(value) => updateField("location_km", value)}
              placeholder="101.000"
            />
          </div>
        </div>

        {/* MAINTENANCE */}

        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-800">
            Maintenance Details
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <FormInput
              label="Overdue Days"
              type="number"
              value={form.overdue_days}
              onChange={(value) => updateField("overdue_days", value)}
              placeholder="0"
            />

            <FormInput
              label="Estimated Duration (hrs)"
              type="number"
              step="0.1"
              value={form.estimated_duration_hrs}
              onChange={(value) => updateField("estimated_duration_hrs", value)}
              placeholder="2"
            />

            <FormInput
              label="Last Maintenance Date"
              type="date"
              value={form.last_maintenance_date}
              onChange={(value) => updateField("last_maintenance_date", value)}
            />
          </div>
        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <RefreshCw size={16} className="animate-spin" />}

            {saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   TASK DETAIL MODAL
============================================================ */

function TaskDetailModal({ task, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Maintenance Task
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {task.task_id}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailItem label="Task ID" value={task.task_id} />

          <DetailItem label="Asset ID" value={task.asset_id} />

          <DetailItem label="Corridor ID" value={task.corridor_id} />

          <DetailItem label="System" value={task.system} />

          <DetailItem label="Defect Type" value={task.defect_type} />

          <DetailItem label="Severity" value={task.severity} />

          <DetailItem label="Overdue Days" value={task.overdue_days} />

          <DetailItem
            label="Estimated Duration"
            value={
              task.estimated_duration_hrs !== null &&
              task.estimated_duration_hrs !== undefined
                ? `${task.estimated_duration_hrs} hrs`
                : null
            }
          />

          <DetailItem label="Location KM" value={task.location_km} />

          <DetailItem
            label="Location Start KM"
            value={task.location_start_km}
          />

          <DetailItem label="Location End KM" value={task.location_end_km} />

          <DetailItem
            label="Last Maintenance"
            value={
              task.last_maintenance_date
                ? formatDate(task.last_maintenance_date)
                : null
            }
          />

          <DetailItem label="Database ID" value={task.id} />
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  step,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-800">
        {value !== null && value !== undefined && value !== ""
          ? String(value)
          : "-"}
      </p>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SEVERITY BADGE
============================================================ */

function SeverityBadge({ severity }) {
  const value = String(severity || "UNKNOWN").toUpperCase();

  let className = "bg-slate-100 text-slate-600";

  if (value === "CRITICAL" || value === "SEVERE") {
    className = "bg-red-50 text-red-700";
  } else if (value === "HIGH") {
    className = "bg-orange-50 text-orange-700";
  } else if (value === "MEDIUM") {
    className = "bg-amber-50 text-amber-700";
  } else if (value === "LOW") {
    className = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {value}
    </span>
  );
}

/* ============================================================
   OVERDUE BADGE
============================================================ */

function OverdueBadge({ days }) {
  const value = Number(days || 0);

  if (value <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 size={12} />
        On time
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
      <AlertTriangle size={12} />
      {value} day{value === 1 ? "" : "s"}
    </span>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ title, description }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Database size={22} />
      </div>

      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL
============================================================ */

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}
