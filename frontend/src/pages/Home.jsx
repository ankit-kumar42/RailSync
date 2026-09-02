import {
  BrainCircuit,
  CalendarCheck,
  ShieldAlert,
  Gauge,
  GitCompare,
  TrainFront,
  Route,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Railway Track Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-20">
          <div className="absolute bottom-8 left-0 right-0 border-t-4 border-slate-400" />
          <div className="absolute bottom-2 left-0 right-0 border-t-4 border-slate-400" />

          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="h-14 w-2 rounded bg-slate-500" />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-4xl">
            {/* Heading */}
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Welcome to <span className="text-blue-500">RailSync</span>
            </h1>

            <p className="mt-6 text-xl font-medium text-slate-300 sm:text-2xl">
              Intelligent Block Planning
            </p>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
              A smart railway maintenance management platform designed to help
              maintenance teams plan, prioritize, coordinate, and schedule
              railway maintenance activities efficiently.
            </p>

            {/* Project Purpose */}
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Maintenance Management
                  </p>
                  <p className="text-xs text-slate-500">
                    Organize railway maintenance work
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    AI-Assisted Decisions
                  </p>
                  <p className="text-xs text-slate-500">
                    Smarter maintenance planning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Intelligent Scheduling
                  </p>
                  <p className="text-xs text-slate-500">
                    Plan maintenance blocks efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              About the Project
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Smarter railway maintenance planning
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              RailSync brings railway maintenance activities, asset information,
              operational risk and scheduling together in one platform. Its goal
              is to support maintenance teams in making better decisions while
              reducing conflicts with railway operations.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <InfoCard
              icon={<Wrench size={22} />}
              title="Maintenance Management"
              text="Manage and organize scheduled and unscheduled railway maintenance activities."
            />

            <InfoCard
              icon={<BrainCircuit size={22} />}
              title="AI Decision Support"
              text="Use AI-based models to assist with failure risk and maintenance priority assessment."
            />

            <InfoCard
              icon={<CalendarCheck size={22} />}
              title="Intelligent Scheduling"
              text="Identify suitable maintenance windows while considering railway operational constraints."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CAPABILITIES
      ===================================================== */}

      <section className="border-y border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Core Capabilities
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              What RailSync provides
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              The platform combines maintenance information with AI-assisted
              analysis to support railway maintenance planning.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Wrench />}
              title="Maintenance Tasks"
              text="Create, manage and track railway maintenance tasks."
            />

            <Feature
              icon={<ShieldAlert />}
              title="Asset Risk Prediction"
              text="Estimate asset failure risk using maintenance and asset information."
            />

            <Feature
              icon={<Gauge />}
              title="Maintenance Priority"
              text="Calculate an explainable priority score for maintenance activities."
            />

            <Feature
              icon={<GitCompare />}
              title="Task Compatibility"
              text="Evaluate whether two maintenance tasks can be performed together."
            />

            <Feature
              icon={<CalendarCheck />}
              title="Schedule Confirmation"
              text="Review and confirm proposed maintenance schedules."
            />

            <Feature
              icon={<Route />}
              title="Corridor Awareness"
              text="Consider railway corridors and operational criticality during planning."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                From maintenance task to planned block
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                RailSync follows a structured process to help maintenance teams
                move from task identification to an informed schedule.
              </p>
            </div>

            <div className="space-y-4">
              <Step
                number="01"
                title="Create Maintenance Task"
                text="Record the task, asset, corridor, severity and maintenance requirements."
              />

              <Step
                number="02"
                title="Analyze Risk & Priority"
                text="AI-assisted models evaluate asset failure risk and maintenance priority."
              />

              <Step
                number="03"
                title="Check Compatibility"
                text="Identify whether maintenance activities can safely be grouped together."
              />

              <Step
                number="04"
                title="Plan & Confirm"
                text="Use the generated information to select and confirm suitable maintenance windows."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER CTA
      ===================================================== */}

      <section className="bg-blue-700 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Intelligent maintenance for modern railways.
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              RailSync — bringing maintenance planning and AI together.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700">
            Explore RailSync
            <ArrowRight size={17} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-slate-800">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   FEATURE
============================================================ */

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({ number, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-blue-600" />

          <h3 className="font-bold text-slate-800">
            {title}
          </h3>
        </div>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

