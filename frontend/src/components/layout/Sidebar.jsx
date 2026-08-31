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
  ShieldAlert,
  Gauge,
  GitCompare,
  CalendarCheck,
  CircleHelp,
  Headphones,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import logo from "./logo/logo.png";

const navigation = [
  // {
  //   title: "Home",
  //   icon: LayoutDashboard,
  //   path: "/",
  // },
  {
    title: "Block Schedule",
    icon: ClipboardList,
    path: "/block-schedule",
  },
  {
    title: "Schedule Confirmation",
    icon: CalendarCheck,
    path: "/schedule-confirmation",
  },
  {
    title: "Confirmed Schedule",
    icon: CalendarCheck,
    path: "/confirmed-schedule",
  },
  {
    title: "Maintenance Tasks",
    icon: ClipboardList,
    path: "/tasks",
  },
  {
    title: "Asset Risk Prediction",
    icon: ShieldAlert,
    path: "/risk-prediction",
  },
  {
    title: "Maintenance Priority",
    icon: Gauge,
    path: "/maintenance-priority",
  },
  {
    title: "Task Compatibility",
    icon: GitCompare,
    path: "/task-compatibility",
  },
];

const secondaryNavigation = [
  {
    title: "FAQs",
    icon: CircleHelp,
    path: "/faqs",
  },
  {
    title: "Support",
    icon: Headphones,
    path: "/support",
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
        flex-col bg-slate-950 text-white
        lg:flex
      "
    >
      {/* ================================
          LOGO
      ================================= */}

      <div className="shrink-0 px-4 py-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-blue-600
              text-xl
              shadow-lg
            "
            
          >
            <img src={logo} alt="RailSync"/>
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">RailSync</h1>

            <p className="text-xs text-slate-500">Intelligent Block Planning</p>
          </div>
        </div>
      </div>

      {/* ================================
          SCROLLABLE CONTENT
      ================================= */}

      <div className="sidebar-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* MAIN NAVIGATION */}

        <nav className="space-y-2">
          {navigation.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        {/* ================================
            SECONDARY NAVIGATION
        ================================= */}

        <div className="mt-8">
          <p
            className="
              mb-3 px-3
              text-[11px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-600
            "
          >
            System
          </p>

          <nav className="space-y-2">
            {secondaryNavigation.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </nav>
        </div>
      </div>

    </aside>
  );
}