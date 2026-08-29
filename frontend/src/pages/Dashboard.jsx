import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Cpu,
  Gauge,
  Layers3,
  Route,
  ShieldAlert,
  Sparkles,
  Train,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

// ============================================================
// MOCK DATA
// Replace these later with API data
// ============================================================

const dashboardData = {
  totalTasks: 128,
  scheduledTasks: 96,
  unscheduledTasks: 32,
  criticalTasks: 14,

  activeBlocks: 8,
  availableBlocks: 17,

  assetsAtRisk: 11,
  highRiskAssets: 7,

  trainsToday: 342,

  scheduleEfficiency: 87,

  departments: {
    Engineering: 54,
    "Signal & Telecom": 39,
    "Traction Distribution": 35,
  },
};

// ============================================================
// TODAY'S BLOCKS
// ============================================================

const todayBlocks = [
  {
    id: "BW-001",
    corridor: "COR-101",
    section: "NDLS - PWL",
    department: "Engineering",
    task: "Rail Track Inspection",
    start: "01:00",
    end: "03:00",
    status: "Confirmed",
  },
  {
    id: "BW-002",
    corridor: "COR-104",
    section: "BCT - ADI",
    department: "Signal & Telecom",
    task: "Signal Maintenance",
    start: "02:30",
    end: "04:00",
    status: "Confirmed",
  },
  {
    id: "BW-003",
    corridor: "COR-108",
    section: "HWH - BWN",
    department: "Traction Distribution",
    task: "OHE Inspection",
    start: "03:00",
    end: "05:00",
    status: "Pending",
  },
  {
    id: "BW-004",
    corridor: "COR-110",
    section: "MAS - AJJ",
    department: "Engineering",
    task: "Track Geometry Check",
    start: "11:00",
    end: "13:00",
    status: "Confirmed",
  },
];

// ============================================================
// HIGH RISK ASSETS
// ============================================================

const riskAssets = [
  {
    asset: "TRK-4521",
    type: "Track",
    department: "Engineering",
    risk: 86,
    reason: "Maintenance overdue by 18 days",
  },
  {
    asset: "SIG-220",
    type: "Signal",
    department: "Signal & Telecom",
    risk: 78,
    reason: "Repeated failure detected",
  },
  {
    asset: "OHE-784",
    type: "OHE",
    department: "Traction Distribution",
    risk: 71,
    reason: "High traffic load",
  },
  {
    asset: "TRK-4490",
    type: "Track",
    department: "Engineering",
    risk: 64,
    reason: "Inspection overdue",
  },
];

// ============================================================
// RECENT ACTIVITIES
// ============================================================

const activities = [
  {
    title: "AI schedule generated",
    description: "24 maintenance tasks optimized",
    time: "10 min ago",
    icon: Sparkles,
  },
  {
    title: "Block confirmed",
    description: "BW-001 confirmed for COR-101",
    time: "32 min ago",
    icon: CheckCircle2,
  },
  {
    title: "Critical asset detected",
    description: "TRK-4521 failure risk increased",
    time: "1 hour ago",
    icon: ShieldAlert,
  },
  {
    title: "Maintenance completed",
    description: "SIG-184 signal maintenance completed",
    time: "2 hours ago",
    icon: Wrench,
  },
];

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Train size={16} />

            <span>Indian Railways Maintenance Operations</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            RailSync AI Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            AI-powered block planning and maintenance coordination center.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/ai-planner"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Sparkles size={17} />
            AI Block Planner
          </Link>

          <Link
            to="/block-schedule"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CalendarDays size={17} />
            View Schedule
          </Link>
        </div>
      </div>

      {/* ======================================================
          SYSTEM STATUS
      ====================================================== */}

      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Activity size={20} />
          </div>

          <div>
            <p className="text-sm font-bold text-emerald-900">
              AI Planning System Operational
            </p>

            <p className="text-xs text-emerald-700">
              TMS, SMMS, TDMS and Control Office data sources are connected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          All Systems Online
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Maintenance Tasks"
          value={dashboardData.totalTasks}
          subtitle="+12 tasks this week"
          icon={Layers3}
          iconClass="bg-blue-50 text-blue-600"
          trend="up"
        />

        <KpiCard
          title="Scheduled Tasks"
          value={dashboardData.scheduledTasks}
          subtitle={`${Math.round(
            (dashboardData.scheduledTasks / dashboardData.totalTasks) * 100,
          )}% of total tasks`}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
          trend="up"
        />

        <KpiCard
          title="Unscheduled Tasks"
          value={dashboardData.unscheduledTasks}
          subtitle="Require block allocation"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <KpiCard
          title="Critical Tasks"
          value={dashboardData.criticalTasks}
          subtitle="Immediate attention required"
          icon={AlertTriangle}
          iconClass="bg-red-50 text-red-600"
          danger
        />
      </div>

      {/* ======================================================
          SECONDARY KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SmallMetric
          title="Active Blocks"
          value={dashboardData.activeBlocks}
          subtitle={`of ${dashboardData.availableBlocks} available`}
          icon={CalendarDays}
        />

        <SmallMetric
          title="Assets At Risk"
          value={dashboardData.assetsAtRisk}
          subtitle={`${dashboardData.highRiskAssets} high risk`}
          icon={ShieldAlert}
        />

        <SmallMetric
          title="Trains Today"
          value={dashboardData.trainsToday}
          subtitle="Expected operations"
          icon={Train}
        />

        <SmallMetric
          title="Schedule Efficiency"
          value={`${dashboardData.scheduleEfficiency}%`}
          subtitle="+6.4% improvement"
          icon={TrendingUp}
        />
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ================================================
            TODAY'S BLOCK SCHEDULE
        ================================================= */}

        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Today's Block Schedule
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Coordinated maintenance blocks across railway corridors.
              </p>
            </div>

            <Link
              to="/block-schedule"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Block</th>
                  <th className="px-6 py-4">Corridor</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {todayBlocks.map((block) => (
                  <tr key={block.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {block.id}
                      </div>

                      <div className="text-xs text-slate-500">{block.task}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {block.corridor}
                      </div>

                      <div className="text-xs text-slate-500">
                        {block.section}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <DepartmentBadge department={block.department} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock3 size={15} />
                        {block.start} - {block.end}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={block.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================================
            AI PERFORMANCE
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Cpu size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  AI Planner Performance
                </h2>

                <p className="text-xs text-slate-500">
                  Current optimization metrics
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <PerformanceBar label="Block Utilization" value={87} />

            <PerformanceBar label="Task Scheduling" value={92} />

            <PerformanceBar label="Conflict Avoidance" value={96} />

            <PerformanceBar label="Asset Availability" value={89} />

            <div className="rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                <Sparkles size={17} />
                AI Recommendation
              </div>

              <p className="mt-2 text-xs leading-5 text-blue-700">
                Consider grouping 5 Engineering tasks on COR-101 during the
                01:00–03:00 maintenance window.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          DEPARTMENT + RISK
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ================================================
            DEPARTMENT DISTRIBUTION
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Maintenance by Department
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current maintenance workload distribution.
            </p>
          </div>

          <div className="space-y-6">
            <DepartmentProgress
              name="Engineering"
              value={dashboardData.departments.Engineering}
              total={dashboardData.totalTasks}
            />

            <DepartmentProgress
              name="Signal & Telecom"
              value={dashboardData.departments["Signal & Telecom"]}
              total={dashboardData.totalTasks}
            />

            <DepartmentProgress
              name="Traction Distribution"
              value={dashboardData.departments["Traction Distribution"]}
              total={dashboardData.totalTasks}
            />
          </div>
        </div>

        {/* ================================================
            HIGH RISK ASSETS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                High Risk Assets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assets requiring maintenance attention.
              </p>
            </div>

            <Link
              to="/risk-prediction"
              className="text-sm font-semibold text-blue-600"
            >
              Risk Analysis
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {riskAssets.map((asset) => (
              <div
                key={asset.asset}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <ShieldAlert size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {asset.asset}
                    </p>

                    <p className="text-xs text-slate-500">
                      {asset.type} • {asset.department}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {asset.reason}
                    </p>
                  </div>
                </div>

                <RiskScore score={asset.risk} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          RECENT ACTIVITY + QUICK ACTIONS
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* RECENT ACTIVITY */}

        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest updates from the maintenance planning system.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div key={index} className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.title}
                    </p>

                    <p className="text-xs text-slate-500">
                      {activity.description}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently used operations.
          </p>

          <div className="mt-6 grid gap-3">
            <QuickAction
              to="/ai-planner"
              icon={Sparkles}
              title="Generate AI Plan"
              description="Optimize maintenance blocks"
            />

            <QuickAction
              to="/risk-prediction"
              icon={ShieldAlert}
              title="Predict Asset Risk"
              description="Analyze failure probability"
            />

            <QuickAction
              to="/maintenance-priority"
              icon={Gauge}
              title="Calculate Priority"
              description="Rank maintenance tasks"
            />

            <QuickAction
              to="/task-compatibility"
              icon={Route}
              title="Check Compatibility"
              description="Compare maintenance tasks"
            />

            <QuickAction
              to="/schedule-confirmation"
              icon={CalendarDays}
              title="Confirm Schedule"
              description="Review generated schedule"
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          FOOTER STATUS
      ====================================================== */}

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          OptimTrack AI Engine: Operational
        </div>

        <div>Last data synchronization: Today, 10:42 AM</div>
      </div>
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({ title, value, subtitle, icon: Icon, iconClass, danger }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        danger ? "border-red-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p
            className={`mt-2 text-3xl font-bold ${
              danger ? "text-red-600" : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SMALL METRIC
// ============================================================

function SmallMetric({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

// ============================================================
// DEPARTMENT BADGE
// ============================================================

function DepartmentBadge({ department }) {
  let classes = "bg-slate-100 text-slate-700";

  if (department === "Engineering") {
    classes = "bg-blue-50 text-blue-700";
  }

  if (department === "Signal & Telecom") {
    classes = "bg-purple-50 text-purple-700";
  }

  if (department === "Traction Distribution") {
    classes = "bg-orange-50 text-orange-700";
  }

  return (
    <span
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${classes}`}
    >
      {department}
    </span>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  if (status === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Confirmed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
        <Clock3 size={13} />
        Pending
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      {status}
    </span>
  );
}

// ============================================================
// PERFORMANCE BAR
// ============================================================

function PerformanceBar({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>

        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// DEPARTMENT PROGRESS
// ============================================================

function DepartmentProgress({ name, value, total }) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{name}</span>

        <span className="text-sm font-bold text-slate-900">{value} tasks</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-1 text-right text-xs text-slate-400">
        {percentage}% of total workload
      </div>
    </div>
  );
}

// ============================================================
// RISK SCORE
// ============================================================

function RiskScore({ score }) {
  let className = "bg-slate-100 text-slate-700";

  if (score >= 75) {
    className = "bg-red-50 text-red-700";
  } else if (score >= 50) {
    className = "bg-amber-50 text-amber-700";
  }

  return (
    <div className={`rounded-xl px-3 py-2 text-center ${className}`}>
      <div className="text-lg font-bold">{score}%</div>

      <div className="text-[10px] font-semibold uppercase">Risk</div>
    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="text-xs text-slate-500">{description}</p>
      </div>

      <ArrowUpRight
        size={16}
        className="text-slate-400 transition group-hover:text-blue-600"
      />
    </Link>
  );
}
