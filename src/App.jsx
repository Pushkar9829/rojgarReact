import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubadminDashboard from './pages/SubadminDashboard';
import Jobs from './pages/Jobs';
import Schemes from './pages/Schemes';
import Users from './pages/Users';
import Subadmins from './pages/Subadmins';
import AuditLogs from './pages/AuditLogs';

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Determine redirect path based on role
  const getDefaultPath = () => {
    if (!user) return '/login';
    if (user.role === 'SUBADMIN') return '/subadmin-dashboard';
    return '/dashboard';
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultPath()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to={getDefaultPath()} replace />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Admin-only routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subadmins"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <Subadmins />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AuditLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Subadmin-only routes */}
      <Route
        path="/subadmin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUBADMIN']}>
            <Layout>
              <SubadminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Shared routes (both ADMIN and SUBADMIN) */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUBADMIN']}>
            <Layout>
              <Jobs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schemes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUBADMIN']}>
            <Layout>
              <Schemes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUBADMIN']}>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={getDefaultPath()} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;