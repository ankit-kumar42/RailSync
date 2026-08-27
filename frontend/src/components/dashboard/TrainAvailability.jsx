import SectionCard from "../common/SectionCard";

export default function TrainAvailability() {
  const hours = ["00", "01", "02", "03", "04", "05", "06"];

  return (
    <SectionCard
      title="Corridor Availability"
      subtitle="SEC-0002 operational timeline"
    >
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          {hours.map((hour) => (
            <span key={hour}>{hour}:00</span>
          ))}
        </div>

        <div className="relative mt-4 h-20 rounded-xl bg-slate-100">
          {/* Train movements */}
          <div className="absolute left-[4%] top-3 h-4 w-[18%] rounded bg-slate-700" />
          <div className="absolute left-[42%] top-3 h-4 w-[14%] rounded bg-slate-700" />
          <div className="absolute left-[72%] top-3 h-4 w-[20%] rounded bg-slate-700" />

          {/* AI recommended maintenance window */}
          <div className="absolute left-[28%] top-11 h-5 w-[34%] rounded bg-blue-500" />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              AI Recommended Window
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Low train traffic period
            </p>
          </div>

          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-600">
            02:00 – 04:30
          </span>
        </div>

        <div className="mt-5 flex gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-700" />
            Train Movement
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-500" />
            Maintenance Window
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
