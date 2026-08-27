import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Route,
  Wrench,
} from "lucide-react";

export default function AIPlanner() {
  const recommendations = [
    {
      id: 1,
      section: "SEC-0002",
      time: "02:00 AM - 04:30 AM",
      tasks: 7,
      departments: "Engineering, S&T, TRD",
      score: "98%",
      status: "Recommended",
    },
    {
      id: 2,
      section: "SEC-0015",
      time: "01:30 AM - 03:30 AM",
      tasks: 5,
      departments: "Engineering, S&T",
      score: "92%",
      status: "Alternative",
    },
    {
      id: 3,
      section: "SEC-0008",
      time: "03:00 AM - 05:00 AM",
      tasks: 6,
      departments: "S&T, TRD",
      score: "88%",
      status: "Alternative",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-100">
              <Sparkles size={20} />
              <span className="text-sm font-semibold">
                ARTIFICIAL INTELLIGENCE ENGINE
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold">AI Block Planner</h1>

            <p className="mt-3 max-w-2xl text-blue-100">
              Automatically analyze maintenance tasks, train schedules, corridor
              availability and department requirements to generate optimized
              maintenance block plans.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50">
            <Play size={18} />
            Generate New Plan
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Clock className="text-blue-600" />

          <p className="mt-4 text-sm text-slate-500">Planning Horizon</p>

          <h3 className="mt-1 text-xl font-bold text-slate-800">
            Weekly + Monthly
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Route className="text-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Corridors Analyzed</p>

          <h3 className="mt-1 text-xl font-bold text-slate-800">24 Sections</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Wrench className="text-orange-500" />

          <p className="mt-4 text-sm text-slate-500">Maintenance Tasks</p>

          <h3 className="mt-1 text-xl font-bold text-slate-800">300 Tasks</h3>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            AI Recommended Block Plans
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ranked according to operational impact and maintenance priority.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {recommendations.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col gap-5 rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">{plan.section}</h3>

                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">
                      {plan.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">{plan.time}</p>

                  <p className="mt-1 text-xs text-slate-400">
                    {plan.tasks} tasks • {plan.departments}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-xs text-slate-400">AI Score</p>

                  <p className="text-xl font-bold text-emerald-600">
                    {plan.score}
                  </p>
                </div>

                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
