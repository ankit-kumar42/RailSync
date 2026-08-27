import { TrendingUp, Activity, Clock, Target } from "lucide-react";

export default function Analytics() {
  const metrics = [
    {
      title: "Asset Availability",
      value: "94.2%",
      change: "+2.4%",
      icon: Activity,
    },
    {
      title: "Downtime Reduction",
      value: "32%",
      change: "+8.2%",
      icon: TrendingUp,
    },
    {
      title: "Average Block Time",
      value: "2.8 hrs",
      change: "-0.4 hrs",
      icon: Clock,
    },
    {
      title: "Plan Accuracy",
      value: "96.8%",
      change: "+1.8%",
      icon: Target,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>

        <p className="mt-2 text-slate-500">
          Analyze block utilization, maintenance performance and AI planning
          impact.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>

                <span className="text-xs font-bold text-emerald-600">
                  {metric.change}
                </span>
              </div>

              <p className="mt-5 text-sm text-slate-500">{metric.title}</p>

              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {metric.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Block Utilization Trend"
          values={[40, 65, 52, 80, 72, 90, 85]}
        />

        <ChartCard
          title="Asset Availability Trend"
          values={[70, 75, 68, 82, 88, 91, 94]}
        />
      </div>
    </div>
  );
}

function ChartCard({ title, values }) {
  const max = Math.max(...values);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-800">{title}</h2>

      <div className="mt-8 flex h-56 items-end justify-between gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-lg bg-blue-500"
              style={{
                height: `${(value / max) * 180}px`,
              }}
            />

            <span className="mt-3 text-xs text-slate-400">W{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
