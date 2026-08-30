import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Gauge,
  Map,
  ShieldCheck,
  Sparkles,
  TrainFront,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =====================================================
          ANIMATED BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-32 -top-32
            h-96 w-96 rounded-full
            bg-blue-600/20 blur-3xl
            animate-pulse
          "
        />

        <div
          className="
            absolute right-0 top-1/4
            h-80 w-80 rounded-full
            bg-cyan-500/10 blur-3xl
            animate-pulse
          "
          style={{ animationDelay: "1s" }}
        />

        <div
          className="
            absolute bottom-0 left-1/3
            h-96 w-96 rounded-full
            bg-indigo-600/10 blur-3xl
            animate-pulse
          "
          style={{ animationDelay: "2s" }}
        />

        {/* Grid */}
        <div
          className="
            absolute inset-0 opacity-[0.04]
            bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),
            linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
            bg-[size:50px_50px]
          "
        />

        {/* Floating particles */}
        <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-blue-400 animate-ping" />

        <div
          className="
            absolute left-[70%] top-[18%]
            h-1.5 w-1.5 rounded-full
            bg-cyan-400 animate-ping
          "
          style={{ animationDelay: "1s" }}
        />

        <div
          className="
            absolute left-[82%] top-[65%]
            h-2 w-2 rounded-full
            bg-indigo-400 animate-ping
          "
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10">
        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT */}
            <div>
              {/* Badge */}

              <div
                className="
                  mb-6 inline-flex items-center gap-2
                  rounded-full border border-blue-400/20
                  bg-blue-500/10 px-4 py-2
                  text-sm text-blue-300
                  backdrop-blur
                  animate-[fadeIn_0.8s_ease-out]
                "
              >
                <Sparkles size={16} />

                <span>AI-Powered Railway Maintenance</span>

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Heading */}

              <h1
                className="
                  max-w-3xl
                  text-5xl font-black
                  leading-[1.05]
                  tracking-tight
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                Smarter
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                  Railway Maintenance
                </span>
                Starts Here.
              </h1>

              {/* Description */}

              <p
                className="
                  mt-7 max-w-2xl
                  text-lg leading-8
                  text-slate-400
                "
              >
                RailSync helps railway teams transform maintenance data into
                intelligent schedules, risk-aware priorities, and efficient
                operational decisions.
              </p>

              {/* Buttons */}

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/confirmed-schedule"
                  className="
                    group flex items-center gap-3
                    rounded-xl
                    bg-blue-600
                    px-6 py-3.5
                    font-semibold
                    shadow-xl shadow-blue-900/30
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:bg-blue-500
                    hover:shadow-blue-500/20
                  "
                >
                  Scheduled Tasks
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/tasks"
                  className="
                    flex items-center gap-3
                    rounded-xl
                    border border-slate-700
                    bg-slate-900/60
                    px-6 py-3.5
                    font-semibold
                    text-slate-200
                    backdrop-blur
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-blue-500/50
                    hover:bg-slate-800
                  "
                >
                  <ClipboardList size={18} />
                  View Maintenance Tasks
                </Link>
              </div>

              {/* Trust indicators */}

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-400" />
                  Real-time maintenance data
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-400" />
                  AI-assisted scheduling
                </div>
              </div>
            </div>

            {/* RIGHT VISUAL */}

            <div className="relative flex min-h-[450px] items-center justify-center">
              {/* Glow */}

              <div
                className="
                  absolute
                  h-72 w-72
                  rounded-full
                  bg-blue-500/20
                  blur-3xl
                  animate-pulse
                "
              />

              {/* Main card */}

              <div
                className="
                  relative w-full max-w-md
                  rounded-3xl
                  border border-slate-700/70
                  bg-slate-900/80
                  p-6
                  shadow-2xl
                  shadow-blue-950/50
                  backdrop-blur-xl
                  transition-transform
                  duration-700
                  hover:rotate-1
                  hover:scale-[1.02]
                "
              >
                {/* Header */}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                      Operations Center
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Maintenance Overview
                    </h2>
                  </div>

                  <div
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl bg-blue-500/10
                      text-blue-400
                    "
                  >
                    <TrainFront size={23} />
                  </div>
                </div>

                {/* Stats */}

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <StatCard
                    icon={ClipboardList}
                    label="Tasks"
                    value="128"
                    trend="+12%"
                  />

                  <StatCard
                    icon={CalendarCheck}
                    label="Scheduled"
                    value="86"
                    trend="+8%"
                  />

                  <StatCard
                    icon={ShieldCheck}
                    label="Risk Managed"
                    value="94%"
                    trend="+5%"
                  />

                  <StatCard
                    icon={TrendingUp}
                    label="Efficiency"
                    value="91%"
                    trend="+14%"
                  />
                </div>

                {/* Progress */}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      Maintenance completion
                    </span>

                    <span className="text-sm font-bold text-blue-400">78%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="
                        h-full rounded-full
                        bg-gradient-to-r
                        from-blue-600 to-cyan-400
                        transition-all
                        duration-1000
                      "
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>

                {/* AI status */}

                <div
                  className="
                    mt-5 flex items-center gap-3
                    rounded-2xl
                    border border-emerald-500/10
                    bg-emerald-500/5
                    p-4
                  "
                >
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-emerald-500/10
                    "
                  >
                    <BrainCircuit size={20} className="text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">AI Planning Engine</p>

                    <p className="text-xs text-slate-500">
                      Ready to optimize maintenance schedules
                    </p>
                  </div>

                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
                </div>
              </div>

              {/* Floating card 1 */}

              <div
                className="
                  absolute -left-4 top-12
                  hidden rounded-2xl
                  border border-slate-700
                  bg-slate-900/90
                  px-4 py-3
                  shadow-xl
                  backdrop-blur
                  sm:block
                  animate-[float_4s_ease-in-out_infinite]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2">
                    <Gauge size={18} className="text-amber-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Risk Level</p>

                    <p className="text-sm font-bold text-amber-400">Medium</p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}

              <div
                className="
                  absolute -right-3 bottom-14
                  hidden rounded-2xl
                  border border-slate-700
                  bg-slate-900/90
                  px-4 py-3
                  shadow-xl
                  backdrop-blur
                  sm:block
                  animate-[float_5s_ease-in-out_infinite]
                "
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2">
                    <Wrench size={18} className="text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Active Tasks</p>

                    <p className="text-sm font-bold">24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FEATURES
        ==================================================== */}

        <section className="border-y border-slate-800/70 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                One intelligent platform
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Everything you need to plan maintenance
              </h2>

              <p className="mt-4 text-slate-400">
                From identifying maintenance risks to confirming schedules,
                RailSync brings the entire workflow together.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={BrainCircuit}
                title="AI Scheduling"
                description="Generate optimized maintenance schedules using operational constraints and task priorities."
              />

              <FeatureCard
                icon={ShieldCheck}
                title="Risk Prediction"
                description="Identify high-risk assets and prioritize maintenance before failures occur."
              />

              <FeatureCard
                icon={CalendarCheck}
                title="Schedule Management"
                description="Review, confirm, and manage scheduled and unscheduled maintenance tasks."
              />

              <FeatureCard
                icon={Map}
                title="Corridor Intelligence"
                description="Understand maintenance requirements across railway corridors and assets."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            WORKFLOW
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                Simple workflow
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                From maintenance data to action
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                OptimTrack connects maintenance tasks, risk analysis,
                scheduling, and operational planning into one streamlined
                workflow.
              </p>

              <Link
                to="/schedule-confirmation"
                className="
                  group mt-7 inline-flex
                  items-center gap-2
                  font-semibold text-blue-400
                  transition-colors
                  hover:text-blue-300
                "
              >
                Explore scheduling
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="space-y-4">
              <WorkflowStep
                number="01"
                title="Collect"
                description="Bring maintenance tasks and railway asset information into the platform."
              />

              <WorkflowStep
                number="02"
                title="Analyze"
                description="Evaluate severity, overdue days, risk, compatibility, and operational constraints."
              />

              <WorkflowStep
                number="03"
                title="Optimize"
                description="Generate an intelligent schedule that balances maintenance requirements and railway operations."
              />

              <WorkflowStep
                number="04"
                title="Confirm & Monitor"
                description="Confirm the schedule and track maintenance progress through completion."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            CTA
        ==================================================== */}

        <section className="px-6 pb-12 lg:px-10">
          <div
            className="
              mx-auto max-w-7xl
              overflow-hidden rounded-3xl
              border border-blue-500/20
              bg-gradient-to-br
              from-blue-600/20
              via-slate-900
              to-indigo-600/10
              p-8
              sm:p-12
            "
          >
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles size={18} />

                  <span className="text-sm font-semibold">
                    Ready to optimize?
                  </span>
                </div>

                <h2 className="mt-3 text-3xl font-bold">
                  Start managing your railway maintenance smarter.
                </h2>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Access your dashboard and begin turning maintenance data into
                  actionable decisions.
                </p>
              </div>

              <Link
                to="/confirmed-schedule"
                className="
                  group flex shrink-0
                  items-center gap-3
                  rounded-xl
                  bg-blue-600
                  px-6 py-3.5
                  font-semibold
                  shadow-lg shadow-blue-950/40
                  transition-all
                  hover:-translate-y-1
                  hover:bg-blue-500
                "
              >
                Get Started
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="border-t border-slate-800 px-6 py-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-600 sm:flex-row">
            <p>© {new Date().getFullYear()} OptimTrack</p>

            <p>Intelligent Block Planning & Railway Maintenance</p>
          </div>
        </footer>
      </div>

      {/* =====================================================
          CUSTOM ANIMATIONS
      ====================================================== */}

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(15px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ icon: Icon, label, value, trend }) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-800
        bg-slate-950/50
        p-4
        transition-all duration-300
        hover:-translate-y-1
        hover:border-blue-500/30
        hover:bg-slate-900
      "
    >
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-blue-400" />

        <span className="text-xs font-medium text-emerald-400">{trend}</span>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div
      className="
        group
        rounded-2xl
        border border-slate-800
        bg-slate-950/50
        p-6
        transition-all duration-500
        hover:-translate-y-2
        hover:border-blue-500/30
        hover:bg-slate-900
        hover:shadow-xl
        hover:shadow-blue-950/20
      "
    >
      <div
        className="
          flex h-12 w-12
          items-center justify-center
          rounded-xl
          bg-blue-500/10
          text-blue-400
          transition-all duration-300
          group-hover:scale-110
          group-hover:bg-blue-500/20
        "
      >
        <Icon size={23} />
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

/* ============================================================
   WORKFLOW STEP
============================================================ */

function WorkflowStep({ number, title, description }) {
  return (
    <div
      className="
        group
        flex gap-5
        rounded-2xl
        border border-slate-800
        bg-slate-900/40
        p-5
        transition-all duration-300
        hover:-translate-x-1
        hover:border-blue-500/30
        hover:bg-slate-900
      "
    >
      <div
        className="
          flex h-12 w-12 shrink-0
          items-center justify-center
          rounded-xl
          bg-blue-500/10
          text-sm font-bold
          text-blue-400
          transition-transform
          group-hover:scale-110
        "
      >
        {number}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
