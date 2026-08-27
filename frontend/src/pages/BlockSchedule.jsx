import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

export default function BlockSchedule() {
  const schedule = [
    {
      date: "Monday",
      section: "SEC-0002",
      time: "02:00 - 04:30",
      tasks: 7,
      status: "AI Recommended",
    },
    {
      date: "Tuesday",
      section: "SEC-0015",
      time: "01:30 - 03:30",
      tasks: 5,
      status: "Approved",
    },
    {
      date: "Wednesday",
      section: "SEC-0008",
      time: "03:00 - 05:00",
      tasks: 6,
      status: "Pending",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Block Schedule</h1>

        <p className="mt-2 text-slate-500">
          Weekly and monthly optimized maintenance block schedules.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
          Weekly Plan
        </button>

        <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600">
          Monthly Plan
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map((item) => (
          <div
            key={item.section}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {item.section}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.date} • {item.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-slate-400">Tasks</p>

                  <p className="mt-1 font-bold text-slate-800">{item.tasks}</p>
                </div>

                <ScheduleStatus value={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleStatus({ value }) {
  const styles = {
    "AI Recommended": "bg-blue-50 text-blue-600",
    Approved: "bg-emerald-50 text-emerald-600",
    Pending: "bg-amber-50 text-amber-600",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-bold ${styles[value]}`}
    >
      {value}
    </span>
  );
}
