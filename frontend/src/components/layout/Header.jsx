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

    </header>
  );
}
