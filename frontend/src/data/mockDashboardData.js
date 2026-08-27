export const dashboardData = {
  summary: {
    totalRequests: 300,
    criticalDefects: 142,
    pendingBlocks: 87,
    assetAvailability: 94.2,
  },

  criticalSections: [
    {
      id: "SEC-0002",
      risk: "CRITICAL",
      score: 92,
      defects: 8,
      blocks: 5,
    },
    {
      id: "SEC-0015",
      risk: "HIGH",
      score: 84,
      defects: 6,
      blocks: 3,
    },
    {
      id: "SEC-0023",
      risk: "HIGH",
      score: 78,
      defects: 4,
      blocks: 4,
    },
    {
      id: "SEC-0008",
      risk: "MEDIUM",
      score: 62,
      defects: 3,
      blocks: 2,
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
      tasks: 128,
      percentage: 100,
    },
    {
      name: "S&T",
      tasks: 104,
      percentage: 81,
    },
    {
      name: "TRD",
      tasks: 68,
      percentage: 53,
    },
  ],

  dataSources: [
    "BDMS Block Requests",
    "Corridor Master",
    "All Department Defects",
    "Goods Train Forecast",
    "Historical Block Records",
    "Section Adjacency",
    "Train Timetable",
  ],
};
