import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CustomerPage } from './pages/CustomerPage';
import { AdminPage } from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} replace /> : <LandingPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="customer"><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
