import { ClipboardList, AlertTriangle, Clock3, Activity } from "lucide-react";
import HeroSection from "../components/dashboard/HeroSection.jsx";
import KPICard from "../components/dashboard/KPICard.jsx";
import CriticalSections from "../components/dashboard/CriticalSections.jsx";
import AIRecommendation from "../components/dashboard/AIRecommendation.jsx";
import CorridorNetwork from "../components/dashboard/CorridorNetwork.jsx";
import TrainAvailability from "../components/dashboard/TrainAvailability.jsx";
import DepartmentWorkload from "../components/dashboard/DepartmentWorkload.jsx";
import DataIntegration from "../components/dashboard/DataIntegration.jsx";
import HistoricalPerformance from "../components/dashboard/HistoricalPerformance.jsx";

export default function Dashboard() {
  const dashboardData = {
    summary: {
      totalRequests: 300,
      criticalDefects: 142,
      pendingBlocks: 87,
      assetAvailability: 94.2,
    },

    criticalSections: [
      {
        id: "SEC-0002",
        defects: 24,
        blocks: 12,
        risk: "CRITICAL",
        score: 95,
      },
      {
        id: "SEC-0015",
        defects: 18,
        blocks: 9,
        risk: "HIGH",
        score: 82,
      },
      {
        id: "SEC-0008",
        defects: 13,
        blocks: 7,
        risk: "HIGH",
        score: 74,
      },
      {
        id: "SEC-0021",
        defects: 8,
        blocks: 5,
        risk: "MEDIUM",
        score: 58,
      },
    ],

    aiRecommendation: {
      section: "SEC-0002",
      start: "02:00 AM",
      end: "04:30 AM",
      engineeringTasks: 2,
      signalTasks: 3,
      trdTasks: 2,
      totalTasks: 7,
      conflicts: 0,
      downtimeReduction: 32,
    },

    departments: [
      {
        name: "Engineering",
        tasks: 42,
        percentage: 78,
      },
      {
        name: "Signal & Telecommunication",
        tasks: 35,
        percentage: 65,
      },
      {
        name: "Traction Distribution",
        tasks: 28,
        percentage: 52,
      },
    ],

    dataSources: ["TMS", "SMMS", "TDMS", "BDMS", "COA", "Train Time Table"],
  };

  const { summary } = dashboardData;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Welcome / AI Hero */}
      <HeroSection />

      {/* KPI Cards */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Block Requests"
          value={summary.totalRequests}
          subtitle="Integrated maintenance requests"
          icon={<ClipboardList size={22} />}
          accent="blue"
        />

        <KPICard
          title="Critical Defects"
          value={summary.criticalDefects}
          subtitle="Require priority maintenance"
          icon={<AlertTriangle size={22} />}
          accent="red"
        />

        <KPICard
          title="Pending Blocks"
          value={summary.pendingBlocks}
          subtitle="Awaiting optimized scheduling"
          icon={<Clock3 size={22} />}
          accent="amber"
        />

        <KPICard
          title="Asset Availability"
          value={`${summary.assetAvailability}%`}
          subtitle="Current infrastructure availability"
          icon={<Activity size={22} />}
          accent="green"
        />
      </section>

      {/* Critical Sections + AI Recommendation */}
      <section className="grid gap-6 xl:grid-cols-2">
        <CriticalSections sections={dashboardData.criticalSections} />

        <AIRecommendation data={dashboardData.aiRecommendation} />
      </section>

      {/* Railway Corridor */}
      <CorridorNetwork />

      {/* Availability + Department Workload */}
      <section className="grid gap-6 xl:grid-cols-2">
        <TrainAvailability />

        <DepartmentWorkload departments={dashboardData.departments} />
      </section>

      {/* Historical Performance */}
      <HistoricalPerformance />

      {/* Data Sources */}
      <DataIntegration sources={dashboardData.dataSources} />
    </div>
  );
}
