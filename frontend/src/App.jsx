import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";
import BlockSchedule from "./pages/BlockSchedule.jsx";
import DataCenter from "./pages/DataCenter.jsx";
import RiskPrediction from "./pages/RiskPrediction.jsx";
import MaintenancePriority from "./pages/MaintenancePriority.jsx";
import TaskCompatibility from "./pages/TaskCompatibility.jsx";
import ScheduleConfirmation from "./pages/ScheduleConfirmation.jsx";
import MaintenanceTasks from "./pages/MaintenanceTasks.jsx";
import ConfirmedSchedule from "./pages/ConfirmedSchedule";
import FAQs from "./pages/FAQs";
import Support from "./pages/Support";
function App() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <div className="lg:pl-72">
        <Header />

        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* HOME */}
            <Route path="/" element={<Home />} />

            {/* Block Schedule */}
            <Route path="/block-schedule" element={<BlockSchedule />} />

            {/* Data Center */}
            <Route path="/data-center" element={<DataCenter />} />

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
            <Route
              path="/schedule-confirmation"
              element={<ScheduleConfirmation />}
            />
            <Route path="/tasks" element={<MaintenanceTasks />} />
            <Route path="/confirmed-schedule" element={<ConfirmedSchedule />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
