import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppShell from './AppShell';
import type { ReactNode } from 'react';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If not logged in, to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If not admin, to home
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Allowed! Render within the shell
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
