import { Routes, Route, Navigate } from "react-router-dom";

// Login page
import Login from "./pages/Login";

// Layout
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";

// Protected pages
import Welcome from "./pages/Welcome.jsx";
import RiskPrediction from "./pages/RiskPrediction.jsx";
import MaintenancePriority from "./pages/MaintenancePriority.jsx";
import TaskCompatibility from "./pages/TaskCompatibility.jsx";
import ScheduleConfirmation from "./pages/ScheduleConfirmation.jsx";
import MaintenanceTasks from "./pages/MaintenanceTasks.jsx";
import ConfirmedSchedule from "./pages/ConfirmedSchedule";
import FAQs from "./pages/FAQs";
import Support from "./pages/Support";

/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

function isLoggedIn() {
  const token = localStorage.getItem("access_token");

  return Boolean(token);
}

/*
|--------------------------------------------------------------------------
| PROTECTED APPLICATION LAYOUT
|--------------------------------------------------------------------------
|
| Sidebar + Header are shown ONLY after login.
|
*/

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Application */}
      <div className="lg:pl-72">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* ======================================================
                WELCOME 
                ====================================================== */}
            <Route path="/welcome" element={<Welcome />} />

            {/* ======================================================
                RISK PREDICTION
                ====================================================== */}

            <Route path="/risk-prediction" element={<RiskPrediction />} />

            {/* ======================================================
                MAINTENANCE PRIORITY
                ====================================================== */}

            <Route
              path="/maintenance-priority"
              element={<MaintenancePriority />}
            />

            {/* ======================================================
                TASK COMPATIBILITY
                ====================================================== */}

            <Route path="/task-compatibility" element={<TaskCompatibility />} />

            {/* ======================================================
                SCHEDULE CONFIRMATION
                ====================================================== */}

            <Route
              path="/schedule-confirmation"
              element={<ScheduleConfirmation />}
            />

            {/* ======================================================
                MAINTENANCE TASKS
                ====================================================== */}

            <Route path="/tasks" element={<MaintenanceTasks />} />

            {/* ======================================================
                CONFIRMED SCHEDULE
                ====================================================== */}

            <Route path="/confirmed-schedule" element={<ConfirmedSchedule />} />

            {/* ======================================================
                FAQs
                ====================================================== */}

            <Route path="/faqs" element={<FAQs />} />

            {/* ======================================================
                SUPPORT
                ====================================================== */}

            <Route path="/support" element={<Support />} />

            {/* ======================================================
                UNKNOWN PROTECTED ROUTE
                ====================================================== */}

            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

export default function App() {
  const loggedIn = isLoggedIn();

  return (
    <Routes>
      {/* ==========================================================
          PUBLIC LOGIN PAGE
          ========================================================== */}

      <Route
        path="/"
        element={loggedIn ? <Navigate to="/welcome" replace /> : <Login />}
      />

      {/* ==========================================================
          PROTECTED APPLICATION
          ========================================================== */}

      <Route
        path="/*"
        element={loggedIn ? <ProtectedLayout /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}
