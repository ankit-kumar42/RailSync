import { useState } from "react";
import { LockKeyhole, User, LogIn, TrainFront } from "lucide-react";
import logo from "../components/layout/logo/logo.png"
import train from "../components/layout/logo/train.jpeg"
export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8002/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: userId.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      /*
      |--------------------------------------------------------------------------
      | Login failed
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(data.detail || "Invalid user ID or password");
      }

      /*
      |--------------------------------------------------------------------------
      | Save authentication information
      |--------------------------------------------------------------------------
      */

      localStorage.setItem("access_token", data.access_token);

      localStorage.setItem("user_id", data.user_id);

      localStorage.setItem("department", data.department);

      localStorage.setItem("role", data.role);

      /*
      |--------------------------------------------------------------------------
      | Login successful
      |--------------------------------------------------------------------------
      | Redirect to protected application
      |--------------------------------------------------------------------------
      */

      window.location.href = "/welcome";
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =========================================================
          HEADER
          ========================================================= */}

      <header className="bg-slate-950 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            
            <img src={logo} alt="" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              RailSync
            </h1>

            <p className="text-xs text-slate-400">
              Intelligent Railway Maintenance Planning
            </p>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
          ========================================================= */}

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          {/* =====================================================
              LEFT INFORMATION
              ===================================================== */}

          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Railway Maintenance Platform
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Smarter Railway
              <span className="block text-blue-600">Maintenance Planning</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              RailSync is a railway maintenance management platform that helps
              maintenance teams manage tasks, assess risks, prioritize work, and
              plan maintenance schedules efficiently.
            </p>

            {/* Project Points */}

            <div className="mt-8 space-y-5">
              <ProjectPoint
                icon={<TrainFront size={20} />}
                title="Railway Maintenance"
                text="Manage railway maintenance activities in one platform."
              />

              <ProjectPoint
                icon={<LockKeyhole size={20} />}
                title="Secure Access"
                text="Authorized railway personnel can access the system securely."
              />

              <ProjectPoint
                icon={<LogIn size={20} />}
                title="Intelligent Planning"
                text="Support maintenance planning, prioritization and scheduling."
              />
            </div>
          </section>

          {/* =====================================================
              LOGIN CARD
              ===================================================== */}

          <section className="w-full max-w-md mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              {/* Login Icon */}

              <div className="text-center">
                <div style={{display:"flex"}}>
                  <img src={train} alt="" style={{width:"70%"}} />
                  <img
                    src={logo}
                    alt=""
                    style={{ height: "5rem", width: "5rem", marginLeft:"3rem" , marginTop:"0.5rem"}}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Login
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access RailSync
                </p>
              </div>

              {/* =================================================
                  LOGIN FORM
                  ================================================= */}

              <form onSubmit={handleLogin} className="mt-7 space-y-5">
                {/* User ID */}

                <div>
                  <label
                    htmlFor="userId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    User ID
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="userId"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter User ID"
                      required
                      minLength={3}
                      maxLength={50}
                      autoComplete="username"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Login Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Login
                    </>
                  )}
                </button>
              </form>

              {/* Login Notice */}

              <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                <p className="text-xs text-slate-400">
                  Authorized Railway Personnel Only
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================
          FOOTER
          ========================================================= */}

      <footer className="border-t border-slate-200 bg-white px-6 py-4">
        <p className="text-center text-xs text-slate-400">
          © 2026 RailSync — Railway Maintenance Management System
        </p>
      </footer>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Project Point Component
|--------------------------------------------------------------------------
*/

function ProjectPoint({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
