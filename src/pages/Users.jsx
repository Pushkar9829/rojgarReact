import { useEffect, useState, useCallback } from 'react';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    role: '',
    state: '',
    isActive: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.state) params.state = filters.state;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      console.log('[Users] fetchUsers called, params:', params);

      const response = await usersAPI.getAll(params);
      const list = response.data?.data?.users ?? response.data?.users ?? [];
      console.log('[Users] Users received:', list.length, 'items');
      setUsers(list);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('[Users] fetchUsers error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.state, filters.isActive]);

  useEffect(() => {
    console.log('[Users] Component mounted or filters changed:', filters);
    fetchUsers();
    return () => console.log('[Users] fetchUsers effect cleanup');
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setLoading(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="USER">User</option>
              {user?.role === 'ADMIN' && (
                <>
                  <option value="ADMIN">Admin</option>
                  <option value="SUBADMIN">Subadmin</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="input"
              placeholder="Filter by state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Mobile Number</th>
              <th>Role</th>
              <th>Name</th>
              <th>State</th>
              <th>District</th>
              <th>Education</th>
              <th>Age</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.mobileNumber}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'SUBADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.profile?.fullName || user.adminProfile?.name || 'N/A'}
                  </td>
                  <td>
                    {user.profile?.state || (user.adminProfile?.assignedStates?.length > 0 
                      ? user.adminProfile.assignedStates.join(', ') 
                      : 'All States') || 'N/A'}
                  </td>
                  <td>{user.profile?.district || 'N/A'}</td>
                  <td>{user.profile?.education || 'N/A'}</td>
                  <td>{user.profile?.age || 'N/A'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total Users: {users.length}
      </div>
    </div>
  );
};

export default Users;