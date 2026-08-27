import { AlertTriangle, Search, CircleAlert } from "lucide-react";

export default function Defects() {
  const defects = [
    {
      id: "DEF-101",
      department: "Engineering",
      asset: "Track Section",
      section: "SEC-0002",
      severity: "Critical",
      overdue: "5 Days",
    },
    {
      id: "DEF-102",
      department: "Signal & Telecom",
      asset: "Signal System",
      section: "SEC-0015",
      severity: "High",
      overdue: "2 Days",
    },
    {
      id: "DEF-103",
      department: "TRD",
      asset: "Overhead Equipment",
      section: "SEC-0008",
      severity: "Medium",
      overdue: "Today",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Defects & Maintenance
        </h1>

        <p className="mt-2 text-slate-500">
          Centralized maintenance defects from TMS, SMMS and TDMS.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Summary
          icon={<AlertTriangle />}
          title="Critical Defects"
          value="142"
        />

        <Summary icon={<CircleAlert />} title="Overdue Tasks" value="58" />

        <Summary
          icon={<AlertTriangle />}
          title="Total Active Defects"
          value="367"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search defects..."
          />
        </div>

        <div className="mt-6 space-y-4">
          {defects.map((defect) => (
            <div
              key={defect.id}
              className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 p-5 lg:flex-row lg:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    {defect.id} — {defect.asset}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {defect.department} • {defect.section}
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-slate-400">Severity</p>
                  <p className="mt-1 font-semibold text-red-600">
                    {defect.severity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Overdue</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {defect.overdue}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Summary({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-red-600">{icon}</div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
