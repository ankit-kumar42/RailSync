import {
  LayoutDashboard,
  Sparkles,
  ClipboardList,
  TriangleAlert,
  Train,
  Route,
  CalendarDays,
  Database,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "AI Block Planner",
    icon: Sparkles,
    path: "/ai-planner",
  },
  {
    title: "Block Requests",
    icon: ClipboardList,
    path: "/block-requests",
  },
  {
    title: "Defects & Maintenance",
    icon: TriangleAlert,
    path: "/defects",
  },
  {
    title: "Train Operations",
    icon: Train,
    path: "/train-operations",
  },
  {
    title: "Corridor Network",
    icon: Route,
    path: "/corridor-network",
  },
  {
    title: "Block Schedule",
    icon: CalendarDays,
    path: "/block-schedule",
  },
];

const secondaryNavigation = [
  {
    title: "Data Center",
    icon: Database,
    path: "/data-center",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function SidebarLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `
        flex items-center justify-between rounded-xl px-4 py-3
        text-sm font-medium transition-all
        ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }
        `
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={19} />
        <span>{item.title}</span>
      </div>

      <ChevronRight size={15} />
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40 hidden w-72
        flex-col bg-slate-950 px-4 py-6 text-white
        lg:flex
      "
    >
      {/* LOGO */}

      <div className="mb-10 px-3">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl bg-blue-600 text-xl shadow-lg
            "
          >
            🚆
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">OptimTrack</h1>

            <p className="text-xs text-slate-500">Intelligent Block Planning</p>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}

      <nav className="space-y-2">
        {navigation.map((item) => (
          <SidebarLink key={item.path} item={item} />
        ))}
      </nav>

      {/* SECONDARY */}

      <div className="mt-8">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
          System
        </p>

        <nav className="space-y-2">
          {secondaryNavigation.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>
      </div>

      {/* SYSTEM STATUS */}

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

          <span className="text-sm font-semibold">System Online</span>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          AI planning engine ready. Railway data sources connected.
        </p>
      </div>
    </aside>
  );
}
