import { Database, CheckCircle2, RefreshCw } from "lucide-react";

export default function DataCenter() {
  const sources = [
    {
      name: "TMS",
      description: "Track Management System",
      records: "12,480",
    },
    {
      name: "SMMS",
      description: "Signalling Maintenance Management System",
      records: "8,920",
    },
    {
      name: "TDMS",
      description: "Traction Distribution Management System",
      records: "6,730",
    },
    {
      name: "BDMS",
      description: "Block & Disconnection Management System",
      records: "4,210",
    },
    {
      name: "COA",
      description: "Control Office Application",
      records: "18,650",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Data Integration Center
        </h1>

        <p className="mt-2 text-slate-500">
          Manage and monitor railway data sources connected to RailSync AI.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {sources.map((source) => (
          <div
            key={source.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Database />
              </div>

              <CheckCircle2 className="text-emerald-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">
              {source.name}
            </h3>

            <p className="mt-2 min-h-10 text-sm text-slate-500">
              {source.description}
            </p>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">Available Records</p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {source.records}
              </p>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600">
              <RefreshCw size={16} />
              Sync Data
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
