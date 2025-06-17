import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsListPage } from "./pages/ProjectsListPage";
import { LeaseTrackerPage } from "./pages/LeaseTrackerPage";
import { PublicProjectPage } from "./pages/PublicProjectPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AutomatedUpdatePage } from "./pages/AutomatedUpdatePage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/share/:shareId" element={<PublicProjectPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <LeaseTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automated-update"
            element={
              <ProtectedRoute>
                <AutomatedUpdatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
