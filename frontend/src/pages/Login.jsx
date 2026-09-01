
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrainFront,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          username: form.username.trim(),
          password: form.password,
        }
      );

      const data = response.data;

      /*
       * Expected backend response:
       *
       * {
       *   access_token: "...",
       *   username: "admin",
       *   role: "admin"
       * }
       */

      if (data.access_token) {
        localStorage.setItem(
          "railsync_token",
          data.access_token
        );
      }

      localStorage.setItem(
        "railsync_user",
        JSON.stringify({
          username: data.username || form.username.trim(),
          role: data.role || "user",
        })
      );

      /*
       * Notify Sidebar/Header that authentication changed.
       */
      window.dispatchEvent(
        new Event("railsync-auth-change")
      );

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.detail ||
        "Unable to login. Please check your credentials.";

      setError(
        Array.isArray(message)
          ? message.map((item) => item.msg).join(", ")
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ==================================================
            LEFT — RAILWAY BRANDING
        ================================================== */}

        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <TrainFront size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  RailSync
                </h1>

                <p className="text-xs text-slate-500">
                  Intelligent Block Planning
                </p>
              </div>
            </div>

            <div className="max-w-lg">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400">
                <ShieldCheck size={15} />
                SECURE RAILWAY OPERATIONS
              </div>

              <h2 className="text-5xl font-bold leading-tight text-white">
                Smarter maintenance.
                <br />
                Safer railways.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                RailSync brings maintenance planning, asset risk,
                task priority and intelligent block scheduling
                together in one railway operations platform.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">

                <Feature
                  title="Risk"
                  text="AI asset analysis"
                />

                <Feature
                  title="Priority"
                  text="Maintenance ranking"
                />

                <Feature
                  title="Planning"
                  text="Smart block scheduling"
                />

              </div>
            </div>

            <p className="text-xs text-slate-600">
              RailSync Railway Maintenance Platform
            </p>
          </div>
        </div>

        {/* ==================================================
            RIGHT — LOGIN
        ================================================== */}

        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <TrainFront size={22} />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  RailSync
                </h1>

                <p className="text-xs text-slate-400">
                  Intelligent Block Planning
                </p>
              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Railway Operations
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your RailSync workspace.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">
                    {error}
                  </p>

                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* USERNAME */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Password
                    </label>

                  </div>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={17} />
                    </>
                  )}

                </button>

              </form>

              <div className="my-7 h-px bg-slate-100" />

              <p className="text-center text-sm text-slate-500">
                Don't have a RailSync account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-800"
                >
                  Create account
                </Link>
              </p>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Authorized railway personnel only.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-bold text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

