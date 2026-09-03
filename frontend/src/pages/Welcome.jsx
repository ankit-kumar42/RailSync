import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Gauge,
  GitCompare,
  ShieldAlert,
  TrainFront,
  Wrench,
  BrainCircuit,
  Route,
  BarChart3,
  Clock3,
  Settings2,
  Target,
  Layers3,
} from "lucide-react";

import { Link } from "react-router-dom";
import logo from "../components/layout/logo/logo.png"

export default function Welcome() {
  const userId =
    localStorage.getItem("user_id") || "Railway Officer";

  const department =
    localStorage.getItem("department") || "Maintenance Department";

  const role =
    localStorage.getItem("role") || "USER";


  return (
    <div className="space-y-8">
      {/* =========================================================
          HERO
          ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
        {/* Background decoration */}

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.4fr_0.6fr] lg:px-14 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <TrainFront size={15} />
              Railway Maintenance Intelligence
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Welcome to <span className="text-blue-400">RailSync</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              An intelligent railway maintenance planning and management
              platform designed to help railway teams assess risks, prioritize
              maintenance activities, evaluate task compatibility, and create
              effective maintenance schedules.
            </p>

            {/* User information */}

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  User
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {userId}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Department
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {department}
                </p>
              </div>

            </div>
          </div>

          {/* Hero visual */}

          <div className="hidden justify-center lg:flex">
            <div className="relative flex h-72 w-72 items-center justify-center">
              <div className="absolute inset-4 rounded-full border border-blue-500/20" />

              <div className="absolute inset-10 rounded-full border border-blue-500/20" />

              <div className="absolute inset-16 rounded-full border border-blue-500/20" />

              <div>
                <img
                  src={logo}
                  alt=""
                  style={{
                    height: "15em",
                    width: "15rem",
                    borderRadius: "100%",
                  }}
                />
              </div>

              <div className="absolute right-1 top-14 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800 shadow-lg">
                <ShieldAlert size={21} className="text-red-400" />
              </div>

              <div className="absolute bottom-8 left-2 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800 shadow-lg">
                <CalendarCheck size={21} className="text-emerald-400" />
              </div>

              <div className="absolute bottom-1 right-10 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800 shadow-lg">
                <Gauge size={21} className="text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECT INTRODUCTION
          ========================================================= */}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BrainCircuit size={22} />
            </div>

            <div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                What is RailSync?
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-600">
            RailSync is an intelligent railway maintenance planning and
            management system that brings important maintenance activities
            together in a single platform.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            The platform supports railway maintenance teams by providing
            structured tools for asset risk prediction, maintenance
            prioritization, task compatibility analysis, schedule planning, and
            schedule confirmation.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Instead of treating maintenance activities as isolated tasks,
            RailSync connects them into a coordinated workflow so that
            maintenance decisions can be made more systematically and
            efficiently.
          </p>
        </div>

        <div className="rounded-2xl  bg-white p-7 text-slate-900">
        
          <h2 className="mt-5 text-xl font-bold">Project Goal</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            To support safer and more efficient railway maintenance planning by
            connecting risk assessment, task prioritization, compatibility
            analysis, and schedule management within one integrated system.
          </p>

          <div className="mt-7 border-t border-slate-500 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Core Principle
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Right maintenance activity, right priority, right time.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECT OBJECTIVES
          ========================================================= */}

      <section>
        <SectionHeading
          title="What RailSync is designed to achieve"
          description="The platform brings several maintenance planning objectives together into one coordinated environment."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ObjectiveCard
            icon={ShieldAlert}
            title="Identify Risk"
            text="Support identification and assessment of potentially high-risk railway assets."
            iconClass="bg-red-50 text-red-600"
          />

          <ObjectiveCard
            icon={Gauge}
            title="Prioritize Work"
            text="Help maintenance teams determine which activities should receive greater attention."
            iconClass="bg-amber-50 text-amber-600"
          />

          <ObjectiveCard
            icon={GitCompare}
            title="Evaluate Compatibility"
            text="Analyze whether maintenance activities can be coordinated or performed together."
            iconClass="bg-purple-50 text-purple-600"
          />

          <ObjectiveCard
            icon={CalendarCheck}
            title="Plan Schedules"
            text="Support the creation, review, and confirmation of suitable maintenance schedules."
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
          ========================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionHeading
          eyebrow="How RailSync Works"
          title="From asset risk to maintenance execution"
          description="RailSync follows a connected maintenance planning workflow."
        />

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <WorkflowCard
            number="01"
            icon={ShieldAlert}
            title="Risk Prediction"
            text="Identify and assess asset risk."
          />

          <WorkflowCard
            number="02"
            icon={Gauge}
            title="Prioritization"
            text="Determine maintenance priority."
          />

          <WorkflowCard
            number="03"
            icon={GitCompare}
            title="Compatibility"
            text="Evaluate compatible maintenance tasks."
          />

          <WorkflowCard
            number="04"
            icon={CalendarCheck}
            title="Scheduling"
            text="Develop a suitable maintenance schedule."
          />

          <WorkflowCard
            number="05"
            icon={CheckCircle2}
            title="Confirmation"
            text="Confirm the final maintenance schedule."
          />
        </div>
      </section>

      {/* =========================================================
          KEY BENEFITS
          ========================================================= */}

      <section>
        <SectionHeading
          eyebrow="Why RailSync"
          title="Designed for smarter maintenance planning"
          description="The platform focuses on improving how railway maintenance information is organized and used."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={Activity}
            title="Centralized Planning"
            text="Bring important maintenance planning activities together in one system."
          />

          <BenefitCard
            icon={Clock3}
            title="Efficient Scheduling"
            text="Support better coordination of maintenance activities and schedules."
          />

          <BenefitCard
            icon={BarChart3}
            title="Data-Driven Decisions"
            text="Use structured maintenance and risk information to support decisions."
          />

          <BenefitCard
            icon={Wrench}
            title="Maintenance Focus"
            text="Keep railway asset condition and maintenance requirements at the center of planning."
          />
        </div>
      </section>

      {/* =========================================================
          EXPLORE PLATFORM
          ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center shadow-lg sm:p-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-blue-950/20 blur-2xl" />

        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Settings2 size={27} className="text-white" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
            Explore the RailSync Platform
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Use the navigation panel to explore railway maintenance tasks, asset
            risk prediction, priority analysis, task compatibility, and schedule
            management.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Open Maintenance Tasks
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/schedule-confirmation"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              View Scheduling
              <CalendarCheck size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
          ========================================================= */}

      <footer className="pb-2 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <TrainFront size={17} />

          <span className="text-sm font-bold">
            Rail<span className="text-blue-600">Sync</span>
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Intelligent Railway Maintenance Planning and Management System
        </p>
      </footer>
    </div>
  );
}


/* ================================================================
   SECTION HEADING
   ================================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ================================================================
   OBJECTIVE CARD
   ================================================================ */

function ObjectiveCard({
  icon: Icon,
  title,
  text,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* ================================================================
   MODULE CARD
   ================================================================ */

function ModuleCard({
  number,
  icon: Icon,
  title,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >

      <span className="absolute right-5 top-5 text-4xl font-black text-slate-100 transition group-hover:text-blue-50">
        {number}
      </span>


      <div className="relative">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
          <Icon size={22} />
        </div>


        <h3 className="mt-5 text-base font-bold text-slate-900">
          {title}
        </h3>


        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>


        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-600">
          Open module
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-1"
          />
        </div>

      </div>

    </Link>
  );
}


/* ================================================================
   WORKFLOW CARD
   ================================================================ */

function WorkflowCard({
  number,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
        <Icon size={21} />
      </div>


      <p className="mt-4 text-[10px] font-black tracking-[0.2em] text-blue-600">
        STEP {number}
      </p>


      <h3 className="mt-1 text-sm font-bold text-slate-900">
        {title}
      </h3>


      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* ================================================================
   BENEFIT CARD
   ================================================================ */

function BenefitCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
        <Icon size={21} />
      </div>


      <h3 className="mt-5 text-base font-bold text-slate-900">
        {title}
      </h3>


      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* ================================================================
   FOCUS ITEM
   ================================================================ */

function FocusItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>


      <div>

        <h4 className="text-sm font-bold text-slate-800">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ================================================================
   MINI FLOW
   ================================================================ */

function MiniFlow({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
        <Icon size={16} />
      </div>


      <span className="text-sm font-semibold text-slate-300">
        {text}
      </span>

    </div>
  );
}
