import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Save,
  RefreshCw,
  Search,
  Filter,
  RotateCcw,
  Train,
  Wrench,
  Zap,
  Radio,
} from "lucide-react";

const API_URL = "http://localhost:8000";

/* ============================================================
   MOCK SCHEDULED DATA
============================================================ */

const MOCK_SCHEDULED = [
  {
    task_id: "ENG-001",
    department: "Engineering",
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
  {
    task_id: "ENG-002",
    department: "Engineering",
    asset_id: "TRK-4530",
    corridor_id: "COR-102",
    block_window_id: "BW-004",
    date: "2026-09-02",
    start_time: "03:30",
    end_time: "05:30",
    estimated_duration_hrs: 2,
    priority_score: 91,
    failure_risk: 0.81,
    status: "IN_PROGRESS",
  },
  {
    task_id: "ENG-003",
    department: "Engineering",
    asset_id: "BRG-120",
    corridor_id: "COR-105",
    block_window_id: "BW-008",
    date: "2026-09-03",
    start_time: "00:30",
    end_time: "02:30",
    estimated_duration_hrs: 2,
    priority_score: 76,
    failure_risk: 0.46,
    status: "DONE",
  },
  {
    task_id: "SNT-001",
    department: "S&T",
    asset_id: "SIG-220",
    corridor_id: "COR-101",
    block_window_id: "BW-002",
    date: "2026-09-03",
    start_time: "02:00",
    end_time: "04:00",
    estimated_duration_hrs: 2,
    priority_score: 94,
    failure_risk: 0.89,
    status: "PENDING",
  },
  {
    task_id: "SNT-002",
    department: "S&T",
    asset_id: "SIG-315",
    corridor_id: "COR-104",
    block_window_id: "BW-006",
    date: "2026-09-04",
    start_time: "01:30",
    end_time: "03:00",
    estimated_duration_hrs: 1.5,
    priority_score: 82,
    failure_risk: 0.64,
    status: "PENDING",
  },
  {
    task_id: "SNT-003",
    department: "S&T",
    asset_id: "TC-550",
    corridor_id: "COR-108",
    block_window_id: "BW-010",
    date: "2026-09-05",
    start_time: "02:00",
    end_time: "04:30",
    estimated_duration_hrs: 2.5,
    priority_score: 73,
    failure_risk: 0.39,
    status: "DONE",
  },
  {
    task_id: "TD-001",
    department: "Traction Distribution",
    asset_id: "OHE-778",
    corridor_id: "COR-103",
    block_window_id: "BW-003",
    date: "2026-09-02",
    start_time: "23:00",
    end_time: "01:00",
    estimated_duration_hrs: 2,
    priority_score: 96,
    failure_risk: 0.91,
    status: "PENDING",
  },
  {
    task_id: "TD-002",
    department: "Traction Distribution",
    asset_id: "TSS-221",
    corridor_id: "COR-107",
    block_window_id: "BW-009",
    date: "2026-09-04",
    start_time: "23:30",
    end_time: "02:00",
    estimated_duration_hrs: 2.5,
    priority_score: 88,
    failure_risk: 0.78,
    status: "IN_PROGRESS",
  },
  {
    task_id: "TD-003",
    department: "Traction Distribution",
    asset_id: "OHE-810",
    corridor_id: "COR-109",
    block_window_id: "BW-012",
    date: "2026-09-06",
    start_time: "00:00",
    end_time: "02:00",
    estimated_duration_hrs: 2,
    priority_score: 69,
    failure_risk: 0.31,
    status: "NOT_DONE",
  },
];

/* ============================================================
   MOCK UNSCHEDULED DATA
============================================================ */

const MOCK_UNSCHEDULED = [
  {
    task_id: "ENG-004",
    department: "Engineering",
    asset_id: "TRK-4590",
    corridor_id: "COR-101",
    compatibility_group: "CG-ENG-01",
    reason_code: "NO_BLOCK",
    reason: "No suitable engineering block window available.",
    status: "PENDING",
  },
  {
    task_id: "ENG-005",
    department: "Engineering",
    asset_id: "BRG-145",
    corridor_id: "COR-110",
    compatibility_group: "CG-ENG-02",
    reason_code: "TRAIN_CONFLICT",
    reason: "Heavy passenger train movement conflicts with requested block.",
    status: "PENDING",
  },
  {
    task_id: "SNT-004",
    department: "S&T",
    asset_id: "SIG-220",
    corridor_id: "COR-101",
    compatibility_group: "CG-SNT-01",
    reason_code: "NO_BLOCK",
    reason: "No suitable signalling block window available.",
    status: "PENDING",
  },
  {
    task_id: "SNT-005",
    department: "S&T",
    asset_id: "AXLE-091",
    corridor_id: "COR-104",
    compatibility_group: "CG-SNT-02",
    reason_code: "COMPATIBILITY",
    reason: "Task is incompatible with other maintenance activities.",
    status: "IN_PROGRESS",
  },
  {
    task_id: "TD-004",
    department: "Traction Distribution",
    asset_id: "OHE-811",
    corridor_id: "COR-103",
    compatibility_group: "CG-TD-01",
    reason_code: "TRAFFIC_LOAD",
    reason: "Traffic load is too high during the requested maintenance window.",
    status: "PENDING",
  },
  {
    task_id: "TD-005",
    department: "Traction Distribution",
    asset_id: "TSS-230",
    corridor_id: "COR-107",
    compatibility_group: "CG-TD-02",
    reason_code: "BLOCK_LIMIT",
    reason: "Required maintenance duration exceeds available block duration.",
    status: "NOT_DONE",
  },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function ScheduleConfirmation() {
  const [scheduled, setScheduled] = useState(MOCK_SCHEDULED);
  const [unscheduled, setUnscheduled] = useState(MOCK_UNSCHEDULED);

  const [department, setDepartment] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ==========================================================
     LOAD BACKEND DATA
  ========================================================== */

  const loadConfirmedSchedule = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/schedule/confirmed`);

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const result = await response.json();

      if (
        result.success &&
        result.data &&
        (result.data.scheduled?.length > 0 ||
          result.data.unscheduled?.length > 0)
      ) {
        setScheduled(result.data.scheduled || []);
        setUnscheduled(result.data.unscheduled || []);

        setMessage("Live schedule data loaded from backend.");
      } else {
        setScheduled(MOCK_SCHEDULED);
        setUnscheduled(MOCK_UNSCHEDULED);

        setMessage("Showing demo schedule data.");
      }
    } catch (error) {
      console.log("Using mock data:", error.message);

      setScheduled(MOCK_SCHEDULED);
      setUnscheduled(MOCK_UNSCHEDULED);

      setMessage(
        "Backend data unavailable. Showing realistic demo schedule data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfirmedSchedule();
  }, []);

  /* ==========================================================
     FILTER FUNCTION
  ========================================================== */

  const filterTask = (task) => {
    const matchesDepartment =
      department === "ALL" || task.department === department;

    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      task.task_id?.toLowerCase().includes(searchText) ||
      task.asset_id?.toLowerCase().includes(searchText) ||
      task.corridor_id?.toLowerCase().includes(searchText);

    return matchesDepartment && matchesStatus && matchesSearch;
  };

  const filteredScheduled = useMemo(() => {
    return scheduled.filter(filterTask);
  }, [scheduled, department, statusFilter, search]);

  const filteredUnscheduled = useMemo(() => {
    return unscheduled.filter(filterTask);
  }, [unscheduled, department, statusFilter, search]);

  /* ==========================================================
     KPI
  ========================================================== */

  const pending = scheduled.filter((x) => x.status === "PENDING").length;

  const inProgress = scheduled.filter((x) => x.status === "IN_PROGRESS").length;

  const completed = scheduled.filter((x) => x.status === "DONE").length;

  const notDone = scheduled.filter((x) => x.status === "NOT_DONE").length;

  /* ==========================================================
     CONFIRM SCHEDULE
  ========================================================== */

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

  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

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

      setMessage(`Task ${taskId} status updated to ${status}.`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setDepartment("ALL");
    setStatusFilter("ALL");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

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

        <div className="flex gap-2">
          <button
            onClick={loadConfirmedSchedule}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

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
      </div>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending" value={pending} icon={Clock3} />

        <StatCard title="In Progress" value={inProgress} icon={RefreshCw} />

        <StatCard title="Completed" value={completed} icon={CheckCircle2} />

        <StatCard title="Not Done" value={notDone} icon={AlertTriangle} />
      </div>

      {/* =====================================================
          DEPARTMENT SUMMARY
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        <DepartmentCard
          icon={Wrench}
          title="Engineering"
          value={scheduled.filter((x) => x.department === "Engineering").length}
          active={department === "Engineering"}
          onClick={() => setDepartment("Engineering")}
        />

        <DepartmentCard
          icon={Radio}
          title="S&T"
          value={scheduled.filter((x) => x.department === "S&T").length}
          active={department === "S&T"}
          onClick={() => setDepartment("S&T")}
        />

        <DepartmentCard
          icon={Zap}
          title="Traction Distribution"
          value={
            scheduled.filter((x) => x.department === "Traction Distribution")
              .length
          }
          active={department === "Traction Distribution"}
          onClick={() => setDepartment("Traction Distribution")}
        />
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />

          <h2 className="font-bold text-slate-900">Schedule Filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search task, asset, corridor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* DEPARTMENT */}

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>

            <option value="Engineering">Engineering</option>

            <option value="S&T">S&T</option>

            <option value="Traction Distribution">Traction Distribution</option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="NOT_DONE">Not Done</option>
          </select>

          {/* RESET */}

          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw size={17} />
            Reset Filters
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-900">
            {filteredScheduled.length}
          </span>{" "}
          scheduled and{" "}
          <span className="font-bold text-slate-900">
            {filteredUnscheduled.length}
          </span>{" "}
          unscheduled tasks.
        </div>
      </div>

      {/* =====================================================
          SCHEDULED TASKS
      ===================================================== */}

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
              {filteredScheduled.length} Tasks
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Department</th>
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
              {filteredScheduled.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {task.task_id}
                  </td>

                  <td className="px-6 py-4">
                    <DepartmentBadge department={task.department} />
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

                  <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority_score} />
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

          {filteredScheduled.length === 0 && (
            <EmptyState text="No scheduled tasks match the selected filters." />
          )}
        </div>
      </div>

      {/* =====================================================
          UNSCHEDULED
      ===================================================== */}

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
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Corridor</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Reason Code</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUnscheduled.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold">{task.task_id}</td>

                  <td className="px-6 py-4">
                    <DepartmentBadge department={task.department} />
                  </td>

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

          {filteredUnscheduled.length === 0 && (
            <EmptyState text="No unscheduled tasks match the selected filters." />
          )}
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
   DEPARTMENT CARD
============================================================ */

function DepartmentCard({ icon: Icon, title, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition ${
        active
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-500">
            Scheduled maintenance tasks
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={21} />
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   DEPARTMENT BADGE
============================================================ */

function DepartmentBadge({ department }) {
  let className = "bg-slate-100 text-slate-700";

  if (department === "Engineering") {
    className = "bg-orange-50 text-orange-700";
  }

  if (department === "S&T") {
    className = "bg-purple-50 text-purple-700";
  }

  if (department === "Traction Distribution") {
    className = "bg-yellow-50 text-yellow-700";
  }

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {department || "Unknown"}
    </span>
  );
}

/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({ priority }) {
  const value = Number(priority || 0);

  let className = "bg-slate-100 text-slate-700";

  if (value >= 90) {
    className = "bg-red-50 text-red-700";
  } else if (value >= 75) {
    className = "bg-orange-50 text-orange-700";
  } else if (value >= 50) {
    className = "bg-yellow-50 text-yellow-700";
  } else {
    className = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {value}
    </span>
  );
}

/* ============================================================
   RISK BADGE
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
    className = "bg-yellow-50 text-yellow-700";
  }

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
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
      value={value || "PENDING"}
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

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Train size={35} className="mb-3 text-slate-300" />

      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
