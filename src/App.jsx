import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import ProductsPage from './pages/ProductsPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  const hasUser = localStorage.getItem('skinlab_current_user');
  
  if (!isLoggedIn && !hasUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/scan" element={
        <ProtectedRoute><ScanPage /></ProtectedRoute>
      } />
      <Route path="/analysis" element={
        <ProtectedRoute><AnalysisPage /></ProtectedRoute>
      } />
      <Route path="/report" element={
        <ProtectedRoute><ReportPage /></ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute><ProductsPage /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
