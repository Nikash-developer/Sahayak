import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceProvider } from './contexts/VoiceContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfileSetup1 from './pages/ProfileSetup1';
import ProfileSetup2 from './pages/ProfileSetup2';
import ProfileSetup3 from './pages/ProfileSetup3';
import Dashboard from './pages/Dashboard';
import RoutePlanning from './pages/RoutePlanning';
import HazardReports from './pages/HazardReports';
import AccessibilitySettings from './pages/AccessibilitySettings';
import Settings from './pages/Settings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import GlobalVoiceAssistant from './components/GlobalVoiceAssistant';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#006D6D]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/setup/1" element={<ProfileSetup1 />} />
        <Route path="/setup/2" element={<ProfileSetup2 />} />
        <Route path="/setup/3" element={<ProfileSetup3 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route-planning" element={<RoutePlanning />} />
        <Route path="/hazard-reports" element={<HazardReports />} />
        <Route path="/accessibility" element={<AccessibilitySettings />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VoiceProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <AppRoutes />
        </Router>
      </VoiceProvider>
    </AuthProvider>
  );
}
