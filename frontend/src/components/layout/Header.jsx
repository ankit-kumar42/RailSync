import { Bell, Search, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <header
      className="
        sticky top-0 z-30 flex h-20 items-center
        justify-between border-b border-slate-200
        bg-white/90 px-4 backdrop-blur
        sm:px-6 lg:px-8
      "
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Railway Operations Command Center
        </p>

        <h2 className="mt-1 text-lg font-bold text-slate-800">
          Operations Overview
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="
            hidden items-center gap-2 rounded-xl border
            border-slate-200 bg-slate-50 px-4 py-2.5
            text-sm text-slate-500 md:flex
          "
        >
          <Search size={17} />
          Search system...
        </button>

        <button
          className="
            relative flex h-10 w-10 items-center
            justify-center rounded-xl border border-slate-200
            text-slate-500 hover:bg-slate-50
          "
        >
          <Bell size={18} />

          <span
            className="
              absolute right-2 top-2 h-2 w-2
              rounded-full bg-red-500
            "
          />
        </button>

        <div
          className="
            flex items-center gap-2 rounded-xl
            border border-slate-200 px-3 py-2
          "
        >
          <CircleUserRound size={24} className="text-blue-600" />

          <div className="hidden sm:block">
            <p className="text-xs font-bold">Control Officer</p>

            <p className="text-[10px] text-slate-400">Operations Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
