import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  BrainCircuit,
} from "lucide-react";

export default function Settings() {
  const settings = [
    {
      icon: BrainCircuit,
      title: "AI Planning Configuration",
      description:
        "Configure optimization priorities and AI scheduling parameters.",
    },
    {
      icon: Database,
      title: "Data Source Settings",
      description: "Manage TMS, SMMS, TDMS, BDMS and COA integrations.",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alerts for critical defects and block conflicts.",
    },
    {
      icon: Shield,
      title: "Access & Security",
      description: "Manage users, departments and system permissions.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>

        <p className="mt-2 text-slate-500">
          Configure RailSync AI and system integrations.
        </p>
      </div>

      <div className="space-y-4">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">{item.title}</h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <button className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
                Configure
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
