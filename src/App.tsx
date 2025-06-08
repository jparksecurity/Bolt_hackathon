import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LeaseTrackerPage } from './components/LeaseTrackerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lease-tracker" element={<LeaseTrackerPage />} />
      </Routes>
    </Router>
  );
}

export default App;