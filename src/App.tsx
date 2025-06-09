import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { ProjectsListPage } from './components/ProjectsListPage';
import { LeaseTrackerPage } from './components/LeaseTrackerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:id" element={<LeaseTrackerPage />} />
      </Routes>
    </Router>
  );
}

export default App;