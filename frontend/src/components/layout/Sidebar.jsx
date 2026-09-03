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
  LogOut,
  User,
  Home
} from "lucide-react";

import { NavLink } from "react-router-dom";

import logo from "./logo/logo.png";

/* ================================================================
   MAIN NAVIGATION
   ================================================================ */

const navigation = [
  {
    title: "Home",
    icon: Home,
    path: "/welcome",
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

/* ================================================================
   SECONDARY NAVIGATION
   ================================================================ */

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

/* ================================================================
   SIDEBAR LINK
   ================================================================ */

function SidebarLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `
        flex items-center justify-between
        rounded-xl px-4 py-3
        text-sm font-medium
        transition-all

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

/* ================================================================
   SIDEBAR
   ================================================================ */

export default function Sidebar() {
  /* ==============================================================
     USER STATE
     ============================================================== */

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return null;
    }

    return {
      user_id: localStorage.getItem("user_id"),
      department: localStorage.getItem("department"),
      role: localStorage.getItem("role"),
    };
  });

  /* ==============================================================
     AUTH STATE LISTENER
     ============================================================== */

  useEffect(() => {
    const updateUser = () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setUser(null);
        return;
      }

      setUser({
        user_id: localStorage.getItem("user_id"),

        department: localStorage.getItem("department"),

        role: localStorage.getItem("role"),
      });
    };

    window.addEventListener("storage", updateUser);

    window.addEventListener("railsync-auth-change", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);

      window.removeEventListener("railsync-auth-change", updateUser);
    };
  }, []);

  /* ==============================================================
     LOGOUT
     ============================================================== */

  const handleLogout = () => {
    /*
     * Remove authentication token.
     */
    localStorage.removeItem("access_token");

    /*
     * Remove user information.
     */
    localStorage.removeItem("user_id");

    localStorage.removeItem("department");

    localStorage.removeItem("role");

    /*
     * Clear local sidebar state.
     */
    setUser(null);

    /*
     * Tell other components that
     * authentication has changed.
     */
    window.dispatchEvent(new Event("railsync-auth-change"));

    /*
     * IMPORTANT:
     *
     * Reload the application and go to "/".
     *
     * This makes App.jsx execute again.
     * Since access_token has been removed,
     * App.jsx will render Login.jsx.
     */
    window.location.replace("/");
  };

  /* ================================================================
     USER INFORMATION
     ================================================================ */

  const username = user?.user_id || "User";

  const department = user?.department || "";

  const role = user?.role || "";

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40
        hidden w-72
        flex-col
        bg-slate-950
        text-white
        lg:flex
      "
    >
      {/* ==========================================================
          LOGO
          ========================================================== */}

      <div className="shrink-0 px-4 py-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-12 w-12
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              bg-white
              shadow-lg
            "
          >
            <img
              src={logo}
              alt="RailSync"
              className="
                h-full
                w-full
                object-contain
              "
            />
          </div>

          <div>
            <h1
              className="
                text-lg
                font-bold
                tracking-tight
              "
            >
              RailSYnc
             
            </h1>

            <p className="text-xs text-slate-500">Intelligent Block Planning</p>
          </div>
        </div>
      </div>

      {/* ==========================================================
          NAVIGATION
          ========================================================== */}

      <div
        className="
          sidebar-scroll
          flex-1
          overflow-y-auto
          px-4
          pb-4
        "
      >
        <nav className="space-y-2">
          {navigation.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        {/* ========================================================
            SYSTEM
            ======================================================== */}

        <div className="mt-8">
          <p
            className="
              mb-3
              px-3
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

      {/* ==========================================================
          USER SECTION
          ========================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-800
          p-4
        "
      >
        {user && (
          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-3
            "
          >
            {/* ====================================================
                USER INFO
                ==================================================== */}

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600
                  text-white
                "
              >
                <User size={19} />
              </div>

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Logged in as
                </p>

                <p
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {username}
                </p>

                {department && (
                  <p
                    className="
                      truncate
                      text-[11px]
                      text-slate-500
                    "
                  >
                    {department}
                  </p>
                )}
              </div>
            </div>



            {/* ====================================================
                LOGOUT BUTTON
                ==================================================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-3
                py-2.5
                text-xs
                font-bold
                text-red-400
                transition

                hover:bg-red-500/20
                hover:text-red-300

                active:scale-[0.98]
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
