import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../lib/auth';
import type { Role } from '../types';

export function ProtectedRoute({ children, role }: { children: ReactElement; role: Role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading your session...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} replace />;
  }

  return children;
}
