import { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  RefreshCw,
  Search,
  Database,
  Train,
  Route,
  ShieldAlert,
  Filter,
  X,
  CircleDot,
  ChevronDown,
} from "lucide-react";

import {
  getConfirmedSchedule,
  confirmSchedule,
  updateScheduledStatus,
  updateUnscheduledStatus,
} from "../services/scheduleService";

/* ============================================================
   CONSTANTS
============================================================ */

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "DONE",
    label: "Completed",
  },
  {
    value: "NOT_DONE",
    label: "Not Done",
  },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function ScheduleConfirmation() {
  const [scheduled, setScheduled] = useState([]);
  const [unscheduled, setUnscheduled] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ==========================================================
     DEPARTMENT
  ========================================================== */

  const getDepartment = (taskId = "") => {
    const prefix = taskId.split("-")[0]?.toUpperCase();

    if (prefix === "ENG") {
      return "Engineering";
    }

    if (prefix === "TRD") {
      return "Traction";
    }

    if (prefix === "SNT") {
      return "S&T";
    }

    return "Other";
  };

  /* ==========================================================
     LOAD SCHEDULE
  ========================================================== */

  const loadSchedule = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await getConfirmedSchedule();

      const data = response?.data || {};

      setScheduled(data.scheduled || []);
      setUnscheduled(data.unscheduled || []);
    } catch (err) {
      setError(err.message || "Failed to load confirmed schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const matchesSearch = (task) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      task.task_id?.toLowerCase().includes(query) ||
      task.asset_id?.toLowerCase().includes(query) ||
      task.corridor_id?.toLowerCase().includes(query) ||
      task.block_window_id?.toLowerCase().includes(query) ||
      task.reason_code?.toLowerCase().includes(query) ||
      task.reason?.toLowerCase().includes(query)
    );
  };

  /* ==========================================================
     FILTER SCHEDULED
  ========================================================== */

  const filteredScheduled = useMemo(() => {
    return scheduled.filter((task) => {
      const matchesDepartment =
        department === "ALL" || getDepartment(task.task_id) === department;

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch(task) && matchesDepartment && matchesStatus;
    });
  }, [scheduled, search, department, statusFilter]);

  /* ==========================================================
     FILTER UNSCHEDULED
  ========================================================== */

  const filteredUnscheduled = useMemo(() => {
    return unscheduled.filter((task) => {
      const matchesDepartment =
        department === "ALL" || getDepartment(task.task_id) === department;

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch(task) && matchesDepartment && matchesStatus;
    });
  }, [unscheduled, search, department, statusFilter]);

  /* ==========================================================
     KPI
  ========================================================== */

  const pending = scheduled.filter((task) => task.status === "PENDING").length;

  const inProgress = scheduled.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const completed = scheduled.filter((task) => task.status === "DONE").length;

  const notDone = scheduled.filter((task) => task.status === "NOT_DONE").length;

  const unscheduledCount = unscheduled.length;

  /* ==========================================================
     DEPARTMENT COUNTS
  ========================================================== */

  const departmentCounts = useMemo(() => {
    return {
      Engineering: scheduled.filter(
        (task) => getDepartment(task.task_id) === "Engineering",
      ).length,

      Traction: scheduled.filter(
        (task) => getDepartment(task.task_id) === "Traction",
      ).length,

      "S&T": scheduled.filter((task) => getDepartment(task.task_id) === "S&T")
        .length,
    };
  }, [scheduled]);

  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setDepartment("ALL");
    setStatusFilter("ALL");
  };

  const filtersActive =
    search !== "" || department !== "ALL" || statusFilter !== "ALL";

  /* ==========================================================
     CONFIRM SCHEDULE
  ========================================================== */

  const handleConfirm = async () => {
    if (scheduled.length === 0 && unscheduled.length === 0) {
      setError("There are no schedule records to confirm.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await confirmSchedule(scheduled, unscheduled);

      setMessage(result?.message || "Schedule confirmed successfully.");

      await loadSchedule();
    } catch (err) {
      setError(err.message || "Failed to confirm schedule.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     SCHEDULED STATUS
  ========================================================== */

  const handleScheduledStatus = async (taskId, newStatus) => {
    const previous = [...scheduled];

    setMessage("");
    setError("");

    setScheduled((current) =>
      current.map((task) =>
        task.task_id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task,
      ),
    );

    try {
      await updateScheduledStatus(taskId, newStatus);
    } catch (err) {
      setScheduled(previous);

      setError(err.message || "Unable to update task status.");
    }
  };

  /* ==========================================================
     UNSCHEDULED STATUS
  ========================================================== */

  const handleUnscheduledStatus = async (taskId, newStatus) => {
    const previous = [...unscheduled];

    setMessage("");
    setError("");

    setUnscheduled((current) =>
      current.map((task) =>
        task.task_id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task,
      ),
    );

    try {
      await updateUnscheduledStatus(taskId, newStatus);
    } catch (err) {
      setUnscheduled(previous);

      setError(err.message || "Unable to update task status.");
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw size={22} className="animate-spin" />

          <span className="font-medium">Loading schedule...</span>
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
            <CalendarCheck size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Schedule Confirmation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review, confirm and monitor AI-generated railway maintenance
              schedules.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadSchedule}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Confirm Schedule
              </>
            )}
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
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <div className="flex-1">{error}</div>

          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ======================================================
          KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock3}
          description="Awaiting execution"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={RefreshCw}
          description="Currently underway"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={CheckCircle2}
          description="Maintenance completed"
        />

        <StatCard
          title="Not Done"
          value={notDone}
          icon={AlertTriangle}
          description="Not completed"
        />

        <StatCard
          title="Unscheduled"
          value={unscheduledCount}
          icon={AlertTriangle}
          description="Require attention"
        />
      </div>

      {/* ======================================================
          FILTER SECTION
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-900">Schedule Filters</h2>

              <p className="text-xs text-slate-500">
                Filter maintenance tasks by department, status or search term.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_200px_auto]">
            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search task, asset, corridor or block..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Department */}

            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>

                <option value="Engineering">Engineering</option>

                <option value="Traction">Traction Distribution</option>

                <option value="S&T">Signal & Telecom</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Status */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

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

          {/* Department summary */}

          <div className="mt-4 flex flex-wrap gap-2">
            <DepartmentFilterPill
              label="Engineering"
              count={departmentCounts.Engineering}
              active={department === "Engineering"}
              onClick={() =>
                setDepartment(
                  department === "Engineering" ? "ALL" : "Engineering",
                )
              }
            />

            <DepartmentFilterPill
              label="Traction"
              count={departmentCounts.Traction}
              active={department === "Traction"}
              onClick={() =>
                setDepartment(department === "Traction" ? "ALL" : "Traction")
              }
            />

            <DepartmentFilterPill
              label="S&T"
              count={departmentCounts["S&T"]}
              active={department === "S&T"}
              onClick={() =>
                setDepartment(department === "S&T" ? "ALL" : "S&T")
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          SCHEDULED MAINTENANCE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CircleDot size={18} className="text-emerald-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Scheduled Maintenance
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Confirmed maintenance activities from the backend database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {department !== "ALL" && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {department}
              </span>
            )}

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {filteredScheduled.length} Tasks
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] table-auto text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3">Task</th>

                <th className="whitespace-nowrap px-4 py-3">Department</th>

                <th className="whitespace-nowrap px-4 py-3">Asset</th>

                <th className="whitespace-nowrap px-4 py-3">Corridor</th>

                <th className="whitespace-nowrap px-4 py-3">Block</th>

                <th className="whitespace-nowrap px-4 py-3">Date / Time</th>

                <th className="whitespace-nowrap px-4 py-3">Duration</th>

                <th className="whitespace-nowrap px-4 py-3">Priority</th>

                <th className="whitespace-nowrap px-4 py-3">Risk</th>

                <th className="whitespace-nowrap px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredScheduled.map((task) => (
                <ScheduledRow
                  key={task.task_id}
                  task={task}
                  onStatusChange={handleScheduledStatus}
                  getDepartment={getDepartment}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredScheduled.length === 0 && (
          <EmptyState
            title="No scheduled tasks found"
            description="There are no confirmed scheduled tasks matching the current filters."
          />
        )}
      </section>

      {/* ======================================================
          UNSCHEDULED MAINTENANCE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />

              <h2 className="text-lg font-bold text-slate-900">
                Unscheduled Maintenance
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Tasks that require further planning or a compatible maintenance
              block.
            </p>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {filteredUnscheduled.length} Tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-3">Task</th>

                <th className="whitespace-nowrap px-4 py-3">Department</th>

                <th className="whitespace-nowrap px-4 py-3">Asset</th>

                <th className="whitespace-nowrap px-4 py-3">Corridor</th>

                <th className="whitespace-nowrap px-4 py-3">Group</th>

                <th className="whitespace-nowrap px-4 py-3">Reason</th>

                <th className="whitespace-nowrap px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUnscheduled.map((task) => (
                <UnscheduledRow
                  key={task.task_id}
                  task={task}
                  onStatusChange={handleUnscheduledStatus}
                  getDepartment={getDepartment}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUnscheduled.length === 0 && (
          <EmptyState
            title="No unscheduled tasks found"
            description="There are no unscheduled tasks matching the current filters."
          />
        )}
      </section>

      {/* ======================================================
          SYSTEM INFORMATION
      ====================================================== */}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={Database}
          title="Data Source"
          value="FastAPI + Database"
        />

        <InfoCard
          icon={Train}
          title="Train Operations"
          value="Integrated Planning"
        />

        <InfoCard
          icon={ShieldAlert}
          title="AI Decision Support"
          value="Risk + Priority + Blocks"
        />
      </section>
    </div>
  );
}

/* ============================================================
   SCHEDULED ROW
============================================================ */

function ScheduledRow({ task, onStatusChange, getDepartment }) {
  return (
    <tr className="group transition hover:bg-slate-50">
      {/* TASK */}

      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CalendarCheck size={17} />
          </div>

          <div>
            <p className="font-bold text-slate-900">{task.task_id}</p>

            <p className="text-[11px] text-slate-400">Maintenance</p>
          </div>
        </div>
      </td>

      {/* DEPARTMENT */}

      <td className="whitespace-nowrap px-4 py-4">
        <DepartmentBadge department={getDepartment(task.task_id)} />
      </td>

      {/* ASSET */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="font-medium text-slate-700">
          {task.asset_id || "-"}
        </span>
      </td>

      {/* CORRIDOR */}

      <td className="whitespace-nowrap px-4 py-4">
        <div className="flex items-center gap-2">
          <Route size={14} className="text-blue-500" />

          <span className="font-medium text-slate-700">
            {task.corridor_id || "-"}
          </span>
        </div>
      </td>

      {/* BLOCK */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {task.block_window_id || "-"}
        </span>
      </td>

      {/* DATE / TIME */}

      <td className="whitespace-nowrap px-4 py-4">
        <div className="flex items-center gap-2">
          <Clock3 size={14} className="text-slate-400" />

          <div>
            <span className="font-semibold text-slate-800">
              {task.date || "-"}
            </span>

            <span className="ml-2 text-xs text-slate-500">
              {task.start_time || "--:--"} - {task.end_time || "--:--"}
            </span>
          </div>
        </div>
      </td>

      {/* DURATION */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="text-sm font-medium text-slate-700">
          {task.estimated_duration_hrs ?? "-"} hrs
        </span>
      </td>

      {/* PRIORITY */}

      <td className="whitespace-nowrap px-4 py-4">
        <PriorityBadge score={task.priority_score} />
      </td>

      {/* RISK */}

      <td className="whitespace-nowrap px-4 py-4">
        <RiskBadge risk={task.failure_risk} />
      </td>

      {/* STATUS */}

      <td className="whitespace-nowrap px-4 py-4">
        <ScheduledStatus
          value={task.status}
          onChange={(status) => onStatusChange(task.task_id, status)}
        />
      </td>
    </tr>
  );
}

/* ============================================================
   UNSCHEDULED ROW
============================================================ */

function UnscheduledRow({ task, onStatusChange, getDepartment }) {
  return (
    <tr className="transition hover:bg-slate-50">
      {/* TASK */}

      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle size={17} />
          </div>

          <div>
            <p className="font-bold text-slate-900">{task.task_id}</p>

            <p className="text-[11px] text-slate-400">Unscheduled</p>
          </div>
        </div>
      </td>

      {/* DEPARTMENT */}

      <td className="whitespace-nowrap px-4 py-4">
        <DepartmentBadge department={getDepartment(task.task_id)} />
      </td>

      {/* ASSET */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="font-medium text-slate-700">
          {task.asset_id || "-"}
        </span>
      </td>

      {/* CORRIDOR */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="font-medium text-slate-700">
          {task.corridor_id || "-"}
        </span>
      </td>

      {/* GROUP */}

      <td className="whitespace-nowrap px-4 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {task.compatibility_group || "-"}
        </span>
      </td>

      {/* REASON */}

      <td className="min-w-[320px] px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="whitespace-nowrap rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            {task.reason_code || "UNKNOWN"}
          </span>

          <span className="text-sm text-slate-500">{task.reason || "-"}</span>
        </div>
      </td>

      {/* STATUS */}

      <td className="whitespace-nowrap px-4 py-4">
        <UnscheduledStatus
          value={task.status}
          onChange={(status) => onStatusChange(task.task_id, status)}
        />
      </td>
    </tr>
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
   DEPARTMENT BADGE
============================================================ */

function DepartmentBadge({ department }) {
  const styles = {
    Engineering: "bg-blue-50 text-blue-700 border-blue-100",

    Traction: "bg-purple-50 text-purple-700 border-purple-100",

    "S&T": "bg-emerald-50 text-emerald-700 border-emerald-100",

    Other: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        styles[department] || styles.Other
      }`}
    >
      {department}
    </span>
  );
}

/* ============================================================
   DEPARTMENT FILTER PILL
============================================================ */

function DepartmentFilterPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}

      <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">
        {count}
      </span>
    </button>
  );
}

/* ============================================================
   PRIORITY
============================================================ */

function PriorityBadge({ score }) {
  const value = Number(score || 0);

  let className = "bg-slate-100 text-slate-700";

  if (value >= 80) {
    className = "bg-red-50 text-red-700";
  } else if (value >= 60) {
    className = "bg-amber-50 text-amber-700";
  } else {
    className = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex min-w-[38px] justify-center rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {value}
    </span>
  );
}

/* ============================================================
   RISK
============================================================ */

function RiskBadge({ risk }) {
  const percentage = Math.round(Number(risk || 0) * 100);

  let label = "Low";

  let className = "bg-emerald-50 text-emerald-700";

  if (percentage >= 75) {
    label = "Critical";
    className = "bg-red-50 text-red-700";
  } else if (percentage >= 50) {
    label = "High";
    className = "bg-orange-50 text-orange-700";
  } else if (percentage >= 25) {
    label = "Medium";
    className = "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {label} {percentage}%
    </span>
  );
}

/* ============================================================
   SCHEDULED STATUS
============================================================ */

function ScheduledStatus({ value, onChange }) {
  const currentValue = value || "PENDING";

  return (
    <select
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border px-3 py-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-blue-100 ${
        currentValue === "DONE"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : currentValue === "IN_PROGRESS"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : currentValue === "NOT_DONE"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}

/* ============================================================
   UNSCHEDULED STATUS
============================================================ */

function UnscheduledStatus({ value, onChange }) {
  const currentValue = value || "PENDING";

  return (
    <select
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border px-3 py-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-blue-100 ${
        currentValue === "DONE"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : currentValue === "IN_PROGRESS"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : currentValue === "NOT_DONE"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ title, description }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <CalendarCheck size={22} />
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
