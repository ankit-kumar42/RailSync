import { Map, Route, AlertTriangle } from "lucide-react";

export default function CorridorNetworkPage() {
  const sections = [
    { id: "SEC-0001", status: "Normal", availability: "98%" },
    { id: "SEC-0002", status: "Critical", availability: "82%" },
    { id: "SEC-0003", status: "High Risk", availability: "87%" },
    { id: "SEC-0004", status: "Normal", availability: "96%" },
    { id: "SEC-0005", status: "Normal", availability: "99%" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Corridor Network</h1>

        <p className="mt-2 text-slate-500">
          Monitor corridor sections, operational health and infrastructure
          availability.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Map className="text-blue-600" />

          <h2 className="text-xl font-bold text-slate-800">
            Network Visualization
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center">
              <div className="w-40 rounded-2xl border border-slate-200 p-5 text-center">
                <div className="flex justify-center">
                  <Route className={getColor(section.status)} />
                </div>

                <h3 className="mt-3 font-bold text-slate-800">{section.id}</h3>

                <p className="mt-2 text-sm text-slate-500">
                  {section.availability} Available
                </p>

                <p
                  className={`mt-2 text-xs font-bold ${getColor(section.status)}`}
                >
                  {section.status}
                </p>
              </div>

              {index < sections.length - 1 && (
                <div className="mx-3 hidden h-1 w-10 bg-slate-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <NetworkStat title="Total Sections" value="24" icon={<Route />} />

        <NetworkStat
          title="Critical Sections"
          value="3"
          icon={<AlertTriangle />}
        />

        <NetworkStat
          title="Network Availability"
          value="94.2%"
          icon={<Map />}
        />
      </div>
    </div>
  );
}

function getColor(status) {
  if (status === "Critical") return "text-red-600";
  if (status === "High Risk") return "text-orange-500";
  return "text-emerald-600";
}

function NetworkStat({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-blue-600">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
