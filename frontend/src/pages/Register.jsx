
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrainFront,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.username.trim().length < 3) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      );

      console.log(
        "Registration response:",
        response.data
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.detail ||
        "Unable to create your account.";

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
            LEFT BRANDING
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

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                <ShieldCheck size={15} />
                RAILWAY OPERATIONS PLATFORM
              </div>

              <h2 className="text-5xl font-bold leading-tight text-white">
                Join the future of
                <br />
                railway maintenance.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                Create your RailSync account and access intelligent
                maintenance planning, risk prediction, priority
                analysis and task compatibility tools.
              </p>

              <div className="mt-8 space-y-3">

                <Benefit text="Centralized maintenance task management" />

                <Benefit text="AI-powered asset risk prediction" />

                <Benefit text="Intelligent maintenance priority calculation" />

                <Benefit text="Railway block planning and scheduling" />

              </div>

            </div>

            <p className="text-xs text-slate-600">
              RailSync Railway Maintenance Platform
            </p>

          </div>
        </div>

        {/* ==================================================
            RIGHT REGISTER FORM
        ================================================== */}

        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

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
                  Create account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Register to access the RailSync platform.
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

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">
                    {success}
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
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="operator@railsync.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Password
                  </label>

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
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* REGISTER */}

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
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create RailSync Account
                    </>
                  )}

                </button>

              </form>

              <div className="my-7 h-px bg-slate-100" />

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-800"
                >
                  Sign in
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

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 size={15} />
      </div>

      <span className="text-xs text-slate-400">
        {text}
      </span>

    </div>
  );
}

