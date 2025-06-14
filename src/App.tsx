import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DashboardPage } from './components/DashboardPage';
import { ProjectsListPage } from './components/ProjectsListPage';
import { LeaseTrackerPage } from './components/LeaseTrackerPage';
import { PublicProjectPage } from './components/PublicProjectPage';
import { SettingsPage } from './components/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:id" element={<LeaseTrackerPage />} />
        <Route path="/share/:shareId" element={<PublicProjectPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;