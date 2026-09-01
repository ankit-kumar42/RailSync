import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  ChevronRight,
  ShieldAlert,
  Gauge,
  GitCompare,
  CalendarCheck,
  CircleHelp,
  Headphones,
  LogIn,
  UserPlus,
  LogOut,
  User,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import logo from "./logo/logo.png";

/* ============================================================
   MAIN NAVIGATION
============================================================ */

const navigation = [
  {
    title: "Home",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Maintenance Tasks",
    icon: ClipboardList,
    path: "/tasks",
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

/* ============================================================
   SECONDARY NAVIGATION
============================================================ */

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

/* ============================================================
   SIDEBAR LINK
============================================================ */

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

/* ============================================================
   AUTH STORAGE KEY
============================================================ */

const AUTH_STORAGE_KEY = "railsync_user";

/* ============================================================
   SIDEBAR
============================================================ */

export default function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Unable to read logged-in user:", error);

      return null;
    }
  });

  /* ==========================================================
     LISTEN FOR LOGIN / LOGOUT
  ========================================================== */

  useEffect(() => {
    const updateUser = () => {
      try {
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);

        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (error) {
        console.error("Unable to update authentication state:", error);

        setUser(null);
      }
    };

    /*
     * Works when localStorage changes from
     * another browser tab.
     */
    window.addEventListener("storage", updateUser);

    /*
     * Custom event works immediately
     * inside the same React application.
     */
    window.addEventListener("railsync-auth-change", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);

      window.removeEventListener("railsync-auth-change", updateUser);
    };
  }, []);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);

    setUser(null);

    window.dispatchEvent(new Event("railsync-auth-change"));

    navigate("/login");
  };

  /* ==========================================================
     USERNAME
  ========================================================== */

  const username = user?.username || user?.name || user?.email || "User";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40 hidden w-72
        flex-col bg-slate-950 text-white
        lg:flex
      "
    >
      {/* ======================================================
          LOGO
      ====================================================== */}

      <div className="shrink-0 px-4 py-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              overflow-hidden rounded-xl
              bg-blue-600
              shadow-lg
            "
          >
            <img
              src={logo}
              alt="RailSync"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">RailSync</h1>

            <p className="text-xs text-slate-500">Intelligent Block Planning</p>
          </div>
        </div>
      </div>

      {/* ======================================================
          SCROLLABLE CONTENT
      ====================================================== */}

      <div className="sidebar-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* ====================================================
            MAIN NAVIGATION
        ==================================================== */}

        <nav className="space-y-2">
          {navigation.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        {/* ====================================================
            SECONDARY NAVIGATION
        ==================================================== */}

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

      {/* ======================================================
          AUTH SECTION
      ====================================================== */}

      <div className="shrink-0 border-t border-slate-800 p-4">
        {!user ? (
          /* ==================================================
             NOT LOGGED IN
          ================================================== */

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                flex w-full items-center justify-center
                gap-2 rounded-xl
                border border-slate-700
                bg-slate-900
                px-4 py-3
                text-sm font-bold
                text-slate-300
                transition
                hover:border-blue-500
                hover:bg-slate-800
                hover:text-white
              "
            >
              <LogIn size={17} />

              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="
                flex w-full items-center justify-center
                gap-2 rounded-xl
                bg-blue-600
                px-4 py-3
                text-sm font-bold
                text-white
                shadow-lg shadow-blue-900/20
                transition
                hover:bg-blue-700
              "
            >
              <UserPlus size={17} />

              <span>Register</span>
            </button>
          </div>
        ) : (
          /* ==================================================
             LOGGED IN
          ================================================== */

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center gap-3">
              {/* USER AVATAR */}

              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-blue-600
                  text-white
                "
              >
                <User size={19} />
              </div>

              {/* USER INFO */}

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Logged in as
                </p>

                <p className="truncate text-sm font-bold text-white">
                  {username}
                </p>
              </div>
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                mt-3 flex w-full
                items-center justify-center
                gap-2 rounded-xl
                border border-red-500/20
                bg-red-500/10
                px-3 py-2.5
                text-xs font-bold
                text-red-400
                transition
                hover:bg-red-500/20
                hover:text-red-300
              "
            >
              <LogOut size={15} />

              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
