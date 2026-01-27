import { useEffect, useState, useCallback } from 'react';
import { subadminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Subadmins = () => {
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verificationStatus: '',
    isActive: '',
    search: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubadmin, setSelectedSubadmin] = useState(null);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    name: '',
    email: '',
    permissions: [],
    assignedStates: [],
  });
  const [rejectReason, setRejectReason] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');

  const availablePermissions = [
    'CREATE_JOBS',
    'EDIT_JOBS',
    'DELETE_JOBS',
    'CREATE_SCHEMES',
    'EDIT_SCHEMES',
    'DELETE_SCHEMES',
    'VIEW_USERS',
    'MANAGE_ADMINS',
  ];

  const fetchSubadmins = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.search) params.search = filters.search;

      const response = await subadminAPI.getAll(params);
      const list = response.data?.data?.subadmins ?? [];
      setSubadmins(list);
    } catch (error) {
      toast.error('Failed to load subadmins');
      console.error('[Subadmins] fetchSubadmins error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.verificationStatus, filters.isActive, filters.search]);

  useEffect(() => {
    fetchSubadmins();
  }, [fetchSubadmins]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleOpenModal = (subadmin = null) => {
    if (subadmin) {
      setSelectedSubadmin(subadmin);
      setFormData({
        mobileNumber: subadmin.mobileNumber,
        name: subadmin.adminProfile?.name || '',
        email: subadmin.adminProfile?.email || '',
        permissions: subadmin.adminProfile?.permissions || [],
        assignedStates: subadmin.adminProfile?.assignedStates || [],
      });
    } else {
      setSelectedSubadmin(null);
      setFormData({
        mobileNumber: '',
        name: '',
        email: '',
        permissions: [],
        assignedStates: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubadmin(null);
    setFormData({
      mobileNumber: '',
      name: '',
      email: '',
      permissions: [],
      assignedStates: [],
    });
  };

  const handleOpenVerifyModal = (subadmin) => {
    setSelectedSubadmin(subadmin);
    setVerifyNotes('');
    setShowVerifyModal(true);
  };

  const handleOpenRejectModal = (subadmin) => {
    setSelectedSubadmin(subadmin);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSubadmin) {
        await subadminAPI.update(selectedSubadmin._id, formData);
        toast.success('Subadmin updated successfully');
      } else {
        await subadminAPI.create(formData);
        toast.success('Subadmin onboarding request created successfully');
      }
      fetchSubadmins();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subadmin');
    }
  };

  const handleVerify = async () => {
    try {
      await subadminAPI.verify(selectedSubadmin._id, verifyNotes);
      toast.success('Subadmin verified successfully');
      setShowVerifyModal(false);
      setSelectedSubadmin(null);
      setVerifyNotes('');
      fetchSubadmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify subadmin');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await subadminAPI.reject(selectedSubadmin._id, rejectReason);
      toast.success('Subadmin rejected successfully');
      setShowRejectModal(false);
      setSelectedSubadmin(null);
      setRejectReason('');
      fetchSubadmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject subadmin');
    }
  };

  const handleToggleActive = async (subadmin) => {
    try {
      if (subadmin.isActive) {
        await subadminAPI.deactivate(subadmin._id);
        toast.success('Subadmin deactivated successfully');
      } else {
        await subadminAPI.activate(subadmin._id);
        toast.success('Subadmin activated successfully');
      }
      fetchSubadmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subadmin status');
    }
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subadmin Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add New Subadmin
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Verification Status</label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
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
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input"
              placeholder="Search by name, mobile, email..."
            />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Mobile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Verification Status</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Assigned States</th>
              <th>Verified By</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subadmins.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-500">
                  No subadmins found
                </td>
              </tr>
            ) : (
              subadmins.map((subadmin) => (
                <tr key={subadmin._id}>
                  <td className="font-medium">{subadmin.mobileNumber}</td>
                  <td>{subadmin.adminProfile?.name || 'N/A'}</td>
                  <td>{subadmin.adminProfile?.email || 'N/A'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(subadmin.adminProfile?.verificationStatus)}`}>
                      {subadmin.adminProfile?.verificationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      subadmin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subadmin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {subadmin.adminProfile?.permissions?.slice(0, 2).map((p) => (
                        <span key={p} className="text-xs text-gray-600">{p}</span>
                      ))}
                      {subadmin.adminProfile?.permissions?.length > 2 && (
                        <span className="text-xs text-gray-500">+{subadmin.adminProfile.permissions.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {subadmin.adminProfile?.assignedStates?.length > 0
                      ? subadmin.adminProfile.assignedStates.join(', ')
                      : 'All States'}
                  </td>
                  <td>
                    {subadmin.adminProfile?.verifiedBy?.adminProfile?.name || 
                     subadmin.adminProfile?.verifiedBy?.mobileNumber || 
                     'N/A'}
                  </td>
                  <td>{new Date(subadmin.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      {subadmin.adminProfile?.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenVerifyModal(subadmin)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(subadmin)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleOpenModal(subadmin)}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(subadmin)}
                        className={`text-sm ${
                          subadmin.isActive
                            ? 'text-orange-600 hover:text-orange-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {subadmin.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {selectedSubadmin ? 'Edit Subadmin' : 'Create New Subadmin'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="input"
                      required
                      disabled={!!selectedSubadmin}
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assigned States (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.assignedStates.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        assignedStates: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                      })}
                      className="input"
                      placeholder="Leave empty for all states"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="mr-2"
                        />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedSubadmin ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedSubadmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Verify Subadmin</h2>
              <p className="mb-4">
                Are you sure you want to verify <strong>{selectedSubadmin.adminProfile?.name}</strong> ({selectedSubadmin.mobileNumber})?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Add any verification notes..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedSubadmin(null);
                    setVerifyNotes('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleVerify} className="btn btn-primary">
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSubadmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Reject Subadmin</h2>
              <p className="mb-4">
                Are you sure you want to reject <strong>{selectedSubadmin.adminProfile?.name}</strong> ({selectedSubadmin.mobileNumber})?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedSubadmin(null);
                    setRejectReason('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleReject} className="btn btn-danger">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subadmins;
