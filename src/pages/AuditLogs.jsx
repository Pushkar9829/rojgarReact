import { useEffect, useState, useCallback } from 'react';
import { auditLogsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'SUBADMIN_CREATED', label: 'Subadmin Created' },
    { value: 'SUBADMIN_VERIFIED', label: 'Subadmin Verified' },
    { value: 'SUBADMIN_REJECTED', label: 'Subadmin Rejected' },
    { value: 'SUBADMIN_UPDATED', label: 'Subadmin Updated' },
    { value: 'SUBADMIN_DEACTIVATED', label: 'Subadmin Deactivated' },
    { value: 'SUBADMIN_ACTIVATED', label: 'Subadmin Activated' },
    { value: 'SUBADMIN_PERMISSIONS_UPDATED', label: 'Permissions Updated' },
  ];

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: 50,
      };
      if (filters.action) params.action = filters.action;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await auditLogsAPI.getAll(params);
      const logs = response.data?.data?.auditLogs ?? [];
      setAuditLogs(logs);
      setTotal(response.data?.total || 0);
      setPages(response.data?.pages || 1);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error('[AuditLogs] fetchAuditLogs error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.action, filters.status, filters.startDate, filters.endDate, filters.page]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const getActionBadge = (action) => {
    const badges = {
      SUBADMIN_CREATED: 'bg-blue-100 text-blue-800',
      SUBADMIN_VERIFIED: 'bg-green-100 text-green-800',
      SUBADMIN_REJECTED: 'bg-red-100 text-red-800',
      SUBADMIN_UPDATED: 'bg-yellow-100 text-yellow-800',
      SUBADMIN_DEACTIVATED: 'bg-orange-100 text-orange-800',
      SUBADMIN_ACTIVATED: 'bg-green-100 text-green-800',
      SUBADMIN_PERMISSIONS_UPDATED: 'bg-purple-100 text-purple-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action) => {
    const labels = {
      SUBADMIN_CREATED: 'Created',
      SUBADMIN_VERIFIED: 'Verified',
      SUBADMIN_REJECTED: 'Rejected',
      SUBADMIN_UPDATED: 'Updated',
      SUBADMIN_DEACTIVATED: 'Deactivated',
      SUBADMIN_ACTIVATED: 'Activated',
      SUBADMIN_PERMISSIONS_UPDATED: 'Permissions Updated',
    };
    return labels[action] || action;
  };

  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return 'N/A';
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <div className="text-sm text-gray-600">
          Total: {total} logs
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="input"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Performed By</th>
              <th>Target Subadmin</th>
              <th>Status</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div className="text-sm">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${getActionBadge(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {log.performedBy?.adminProfile?.name || log.performedBy?.mobileNumber || 'N/A'}
                    </div>
                    {log.performedBy?.mobileNumber && (
                      <div className="text-xs text-gray-500">
                        {log.performedBy.mobileNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {log.targetUser?.adminProfile?.name || log.targetUser?.mobileNumber || 'N/A'}
                    </div>
                    {log.targetUser?.mobileNumber && (
                      <div className="text-xs text-gray-500">
                        {log.targetUser.mobileNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                    {log.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">
                        {log.errorMessage}
                      </div>
                    )}
                  </td>
                  <td>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary-600 hover:text-primary-800">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-xs">
                        {formatDetails(log.details)}
                      </pre>
                    </details>
                  </td>
                  <td className="text-xs text-gray-500">
                    {log.ipAddress || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {filters.page} of {pages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(pages, filters.page + 1) })}
            disabled={filters.page === pages}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
