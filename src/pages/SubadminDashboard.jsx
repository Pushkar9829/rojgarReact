import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAdminRealtime } from '../hooks/useAdminSocket';
import { useAuth } from '../context/AuthContext';

const SubadminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      console.log('[SubadminDashboard] fetchStats called');
      console.log('[SubadminDashboard] User:', user?.role, user?.adminProfile?.assignedStates);
      const response = await adminAPI.getStats();
      const data = response.data?.data ?? response.data;
      console.log('[SubadminDashboard] Stats received:', {
        users: data?.users,
        jobs: data?.jobs,
        schemes: data?.schemes,
        recent: data?.recent,
      });
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('[SubadminDashboard] fetchStats error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('[SubadminDashboard] Component mounted, fetching stats');
    fetchStats();
    return () => console.log('[SubadminDashboard] Component unmounted');
  }, [fetchStats]);

  useAdminRealtime({
    onJobEvent: () => {
      console.log('[SubadminDashboard] Realtime job event, refetching stats');
      fetchStats();
    },
    onSchemeEvent: () => {
      console.log('[SubadminDashboard] Realtime scheme event, refetching stats');
      fetchStats();
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load statistics</div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <span className={`text-${color}-600 text-2xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );

  const assignedStates = user?.adminProfile?.assignedStates || [];
  const permissions = user?.adminProfile?.permissions || [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Subadmin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.adminProfile?.name || user?.mobileNumber}
        </p>
        {assignedStates.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Assigned States: {assignedStates.join(', ')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={assignedStates.length > 0 ? `Users (${assignedStates.length} States)` : 'Total Users'}
          value={stats.users.total}
          subtitle={`${stats.users.active} active`}
          icon="👥"
          color="blue"
        />
        <StatCard
          title={assignedStates.length > 0 ? `Jobs (Filtered)` : 'Total Jobs'}
          value={stats.jobs.total}
          subtitle={`${stats.jobs.active} active, ${stats.jobs.featured} featured`}
          icon="💼"
          color="green"
        />
        <StatCard
          title={assignedStates.length > 0 ? `Schemes (Filtered)` : 'Total Schemes'}
          value={stats.schemes.total}
          subtitle={`${stats.schemes.active} active, ${stats.schemes.featured} featured`}
          icon="📋"
          color="purple"
        />
        <StatCard
          title="My Permissions"
          value={permissions.length}
          subtitle={`${permissions.length} permissions granted`}
          icon="🔐"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Jobs Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Central Jobs</span>
              <span className="font-semibold text-gray-900">{stats.jobs.central}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">State Jobs</span>
              <span className="font-semibold text-gray-900">{stats.jobs.state}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Jobs</span>
              <span className="font-semibold text-green-600">{stats.jobs.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Featured Jobs</span>
              <span className="font-semibold text-primary-600">{stats.jobs.featured}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schemes Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Central Schemes</span>
              <span className="font-semibold text-gray-900">{stats.schemes.central}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">State Schemes</span>
              <span className="font-semibold text-gray-900">{stats.schemes.state}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Schemes</span>
              <span className="font-semibold text-green-600">{stats.schemes.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Featured Schemes</span>
              <span className="font-semibold text-primary-600">{stats.schemes.featured}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.recent.jobs}</p>
            <p className="text-sm text-gray-600 mt-1">New Jobs</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.recent.schemes}</p>
            <p className="text-sm text-gray-600 mt-1">New Schemes</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.recent.users}</p>
            <p className="text-sm text-gray-600 mt-1">New Users</p>
          </div>
        </div>
      </div>

      {permissions.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Permissions</h2>
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <span
                key={permission}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {permission.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubadminDashboard;
