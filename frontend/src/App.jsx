import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsentBanner from './components/CookieConsentBanner';
import PaperGrainOverlay from './components/PaperGrainOverlay';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import NotFoundPage from './pages/NotFoundPage';

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
      <PaperGrainOverlay />
      <Navbar />
      <main className="page-content" id="main-content">
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

          {/* Legal and Compliance Routes */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
          <Route path="/cookies" element={<CookiesPolicyPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsentBanner />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
