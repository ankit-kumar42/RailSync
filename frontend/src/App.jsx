import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import AIPlanner from "./pages/AIPlanner.jsx";
import BlockRequests from "./pages/BloackRequests.jsx";
import Defects from "./pages/Defects.jsx";
import TrainOperations from "./pages/TrainOperations.jsx";
import CorridorNetworkPage from "./pages/CorridorNetworkPage.jsx";
import BlockSchedule from "./pages/BlockSchedule.jsx";
import DataCenter from "./pages/DataCenter.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <div className="lg:pl-72">
        <Header />

        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai-planner" element={<AIPlanner />} />
            <Route path="/block-requests" element={<BlockRequests />} />
            <Route path="/defects" element={<Defects />} />
            <Route path="/train-operations" element={<TrainOperations />} />
            <Route path="/corridor-network" element={<CorridorNetworkPage />} />
            <Route path="/block-schedule" element={<BlockSchedule />} />
            <Route path="/data-center" element={<DataCenter />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
