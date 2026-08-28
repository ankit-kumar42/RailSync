import { useState } from "react";
import {
  CalendarDays,
  BrainCircuit,
  Clock3,
  Train,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { generateSchedule } from "../services/api";

export default function BlockSchedule() {
  const [startDate, setStartDate] = useState("2026-08-28");
  const [endDate, setEndDate] = useState("2026-09-03");

  const [tasksText, setTasksText] = useState("");

  const [schedule, setSchedule] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const tasks = tasksText
        .split("\n")
        .map((task) => task.trim())
        .filter(Boolean);

      const payload = {
        tasks,
        planning_start_date: startDate,
        planning_end_date: endDate,
      };

      console.log("Sending request:", payload);

      const result = await generateSchedule(payload);

      console.log("Backend response:", result);

      setSchedule(result.data);
    } catch (error) {
      console.error(error);

      setError(error.message || "Unable to generate schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                  <BrainCircuit size={16} />
                  AI Maintenance Planning
                </div>

                <h1 className="text-3xl font-bold">Block Schedule</h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  AI-powered coordination of railway maintenance blocks across
                  Engineering, S&T and Traction Distribution departments.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    AI ENGINE ONLINE
                  </p>

                  <p className="text-xs text-slate-400">Ready for scheduling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* PLANNING CONTROLS */}
        {/* ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">Planning Period</h2>

              <p className="text-xs text-slate-500">
                Select the period for AI block optimization.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* START DATE */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* END DATE */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* BUTTON */}

            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={18} />
                    Generate AI Schedule
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TASK INPUT */}

          <div className="mt-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Maintenance Tasks
            </label>

            <textarea
              rows={10}
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder={`Enter maintenance tasks...

Example:

Track repair SEC-0002
Signal inspection SEC-0015
OHE maintenance SEC-0008
Track geometry inspection SEC-0012`}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle size={18} />

              <div>
                <p className="text-sm font-bold">Schedule Generation Failed</p>

                <p className="mt-1 text-xs">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        {schedule && <ScheduleResults schedule={schedule} />}
      </div>
    </div>
  );
}

/* ============================================================
   RESULTS
============================================================ */

function ScheduleResults({ schedule }) {
  const rows = extractRows(schedule);

  return (
    <div className="space-y-6">
      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Wrench size={20} />}
          title="Scheduled Tasks"
          value={rows.length}
          subtitle="AI generated"
        />

        <Metric
          icon={<CalendarDays size={20} />}
          title="Planning Window"
          value="7 Days"
          subtitle="Selected period"
        />

        <Metric
          icon={<Clock3 size={20} />}
          title="Block Windows"
          value={countBlocks(rows)}
          subtitle="Recommended"
        />

        <Metric
          icon={<CheckCircle2 size={20} />}
          title="Status"
          value="OPTIMIZED"
          subtitle="AI generated"
        />
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <CalendarDays size={19} className="text-blue-600" />
              AI Generated Block Schedule
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Optimized maintenance windows generated by the scheduling engine.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Block Window
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Corridor
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Maintenance
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {row.date || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock3 size={14} className="text-blue-500" />

                        <span className="text-sm font-bold">
                          {row.time ||
                            row.block_window ||
                            `${row.start_time || ""} - ${row.end_time || ""}` ||
                            "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold">
                        {row.corridor || row.section || row.asset || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Department
                        department={row.department || row.dept || "Multi"}
                      />
                    </td>

                    <td className="max-w-[300px] px-5 py-4">
                      <div className="flex items-start gap-2">
                        <Wrench size={15} className="mt-0.5 text-slate-400" />

                        <span className="text-sm font-semibold text-slate-700">
                          {row.task ||
                            row.activity ||
                            row.maintenance_task ||
                            row.description ||
                            "Maintenance activity"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        SCHEDULED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Train size={42} className="mx-auto text-slate-300" />

            <p className="mt-4 font-semibold text-slate-700">
              Schedule Generated
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Backend response received, but no schedule rows were detected.
            </p>

            <details className="mx-auto mt-5 max-w-3xl text-left">
              <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                View backend response
              </summary>

              <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-white">
                {JSON.stringify(schedule, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   METRIC
============================================================ */

function Metric({ icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

/* ============================================================
   DEPARTMENT
============================================================ */

function Department({ department }) {
  return (
    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
      {department}
    </span>
  );
}

/* ============================================================
   RESPONSE NORMALIZER
============================================================ */

function extractRows(schedule) {
  if (!schedule) return [];

  if (Array.isArray(schedule)) {
    return schedule;
  }

  if (Array.isArray(schedule.schedule)) {
    return schedule.schedule;
  }

  if (Array.isArray(schedule.scheduled_tasks)) {
    return schedule.scheduled_tasks;
  }

  if (Array.isArray(schedule.blocks)) {
    return schedule.blocks;
  }

  if (Array.isArray(schedule.tasks)) {
    return schedule.tasks;
  }

  if (Array.isArray(schedule.result)) {
    return schedule.result;
  }

  if (Array.isArray(schedule.data)) {
    return schedule.data;
  }

  return [];
}

/* ============================================================
   BLOCK COUNTER
============================================================ */

function countBlocks(rows) {
  if (!rows.length) return "—";

  const blocks = new Set();

  rows.forEach((row) => {
    const block = row.block_id || row.block_window || `${row.date}-${row.time}`;

    blocks.add(block);
  });

  return blocks.size;
}
