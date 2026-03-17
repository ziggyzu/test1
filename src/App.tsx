import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Routine from './pages/Routine';
import ClassTests from './pages/ClassTests';
import GradeCalculator from './pages/GradeCalculator';
import Deadlines from './pages/Deadlines';
import StudentDirectory from './pages/StudentDirectory';
import Events from './pages/Events';
import TeammateFinder from './pages/TeammateFinder';
import Resources from './pages/Resources';
import AdminRoute from './components/layout/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import WakeUpCall from './pages/WakeUpCall';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: false },
  },
});

function ProtectedRoutes() {
  const { user } = useAuth();

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no batch assigned yet → go to setup
  if (!user.batchId) return <Navigate to="/setup" replace />;

  return (
    <AppShell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="routine" element={<Routine />} />
        <Route path="class-tests" element={<ClassTests />} />
        <Route path="grade-calculator" element={<GradeCalculator />} />
        <Route path="deadlines" element={<Deadlines />} />
        <Route path="directory" element={<StudentDirectory />} />
        <Route path="events" element={<Events />} />
        <Route path="teammates" element={<TeammateFinder />} />
        <Route path="resources" element={<Resources />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wakeup" element={<WakeUpCall />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
