import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TalentDetailPage from './pages/TalentDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfileEditPage from './pages/ProfileEditPage';
import InboxPage from './pages/InboxPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import BookingEditPage from './pages/BookingEditPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-content container"><div className="skeleton skeleton-card" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (staffOnly && !user.is_staff) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

          <Route path="/freelancer/:id" element={<TalentDetailPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
          <Route path="/messages/:username" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/booking/:id/edit" element={<ProtectedRoute><BookingEditPage /></ProtectedRoute>} />

          <Route path="/admin-dashboard" element={<ProtectedRoute staffOnly><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={
            <div className="container empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>Page Not Found</h3>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
