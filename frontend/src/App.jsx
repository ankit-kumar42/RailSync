import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TrainOperations from "./pages/TrainOperations.jsx";
import CorridorNetworkPage from "./pages/CorridorNetworkPage.jsx";
import BlockSchedule from "./pages/BlockSchedule.jsx";
import DataCenter from "./pages/DataCenter.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import RiskPrediction from "./pages/RiskPrediction.jsx";
import MaintenancePriority from "./pages/MaintenancePriority.jsx";
import TaskCompatibility from "./pages/TaskCompatibility.jsx";
import ScheduleConfirmation from "./pages/ScheduleConfirmation.jsx";
function App() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <div className="lg:pl-72">
        <Header />

        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Train Operations */}
            <Route path="/train-operations" element={<TrainOperations />} />

            {/* Corridor Network */}
            <Route path="/corridor-network" element={<CorridorNetworkPage />} />

            {/* Block Schedule */}
            <Route path="/block-schedule" element={<BlockSchedule />} />

            {/* Data Center */}
            <Route path="/data-center" element={<DataCenter />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Risk Prediction */}
            <Route path="/risk-prediction" element={<RiskPrediction />} />

            {/* Maintenance Priority */}
            <Route
              path="/maintenance-priority"
              element={<MaintenancePriority />}
            />
            <Route path="/task-compatibility" element={<TaskCompatibility />} />
            <Route
              path="/schedule-confirmation"
              element={<ScheduleConfirmation />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
