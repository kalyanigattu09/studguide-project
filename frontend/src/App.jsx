import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2, GraduationCap } from 'lucide-react';

// Components & Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Career from './pages/Career';
import Placement from './pages/Placement';
import MockTest from './pages/MockTest';
import Leaderboard from './pages/Leaderboard';
import Planner from './pages/Planner';
import Habits from './pages/Habits';
import Forum from './pages/Forum';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import Resources from './pages/Resources';
import Reports from './pages/Reports';

// Route Guard for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="bg-mesh" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center glow-indigo animate-float">
            <GraduationCap size={32} className="text-white" />
          </div>
          <div className="text-xl font-bold gradient-text">STUGUIDE X</div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-indigo-400" />
            <span>Loading intelligence layer...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected System Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="career" element={<Career />} />
          <Route path="placement" element={<Placement />} />
          <Route path="mocktest" element={<MockTest />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="planner" element={<Planner />} />
          <Route path="habits" element={<Habits />} />
          <Route path="forum" element={<Forum />} />
          <Route path="resources" element={<Resources />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
