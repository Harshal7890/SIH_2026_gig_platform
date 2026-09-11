import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import FederationDashboard from './pages/FederationDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Registration */}
        <Route path="/register/:role" element={<RegisterPage />} />

        {/* Login */}
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Dashboards */}
        <Route path="/dashboard/customer" element={<UserDashboard />} />
        <Route path="/dashboard/worker" element={<WorkerDashboard />} />
        <Route path="/dashboard/cooperative" element={<FederationDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
