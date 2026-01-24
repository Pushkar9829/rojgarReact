import { useEffect, useState, useCallback } from 'react';
import { schemesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAdminRealtime } from '../hooks/useAdminSocket';

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CENTRAL',
    target: '',
    benefit: 'Money',
    state: '',
    ageMin: '',
    ageMax: '',
    description: '',
    applicationLink: '',
    eligibilityCriteria: '',
    documentsRequired: [],
    benefitAmount: { amount: '', currency: 'INR', type: 'Fixed' },
    isActive: true,
    isFeatured: false,
  });

  const fetchSchemes = useCallback(async () => {
    try {
      console.log('[Schemes] fetchSchemes called');
      const response = await schemesAPI.getAll({ limit: 100 });
      const list = response.data?.data?.schemes ?? response.data?.schemes ?? [];
      console.log('[Schemes] Schemes received:', list.length, 'items');
      setSchemes(list);
    } catch (error) {
      toast.error('Failed to load schemes');
      console.error('[Schemes] fetchSchemes error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[Schemes] Component mounted, fetching schemes');
    fetchSchemes();
    return () => console.log('[Schemes] Component unmounted');
  }, [fetchSchemes]);

  useAdminRealtime({
    onSchemeEvent: () => {
      console.log('[Schemes] Realtime scheme event, refetching schemes');
      fetchSchemes();
    },
  });

  const handleOpenModal = (scheme = null) => {
    if (scheme) {
      setEditingScheme(scheme);
      setFormData({
        ...scheme,
        benefitAmount: scheme.benefitAmount || { amount: '', currency: 'INR', type: 'Fixed' },
      });
    } else {
      setEditingScheme(null);
      setFormData({
        name: '',
        type: 'CENTRAL',
        target: '',
        benefit: 'Money',
        state: '',
        ageMin: '',
        ageMax: '',
        description: '',
        applicationLink: '',
        eligibilityCriteria: '',
        documentsRequired: [],
        benefitAmount: { amount: '', currency: 'INR', type: 'Fixed' },
        isActive: true,
        isFeatured: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingScheme(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : undefined,
        benefitAmount: formData.benefitAmount.amount ? {
          ...formData.benefitAmount,
          amount: parseInt(formData.benefitAmount.amount),
        } : undefined,
      };
      console.log('[Schemes] handleSubmit:', editingScheme ? 'update' : 'create', { id: editingScheme?._id, name: data.name });

      if (editingScheme) {
        await schemesAPI.update(editingScheme._id, data);
        toast.success('Scheme updated successfully');
        console.log('[Schemes] Scheme updated:', editingScheme._id);
      } else {
        await schemesAPI.create(data);
        toast.success('Scheme created successfully');
        console.log('[Schemes] Scheme created');
      }
      fetchSchemes();
      handleCloseModal();
    } catch (error) {
      console.error('[Schemes] handleSubmit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save scheme');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      console.log('[Schemes] handleDelete:', id);
      await schemesAPI.delete(id);
      toast.success('Scheme deleted successfully');
      console.log('[Schemes] Scheme deleted:', id);
      fetchSchemes();
    } catch (error) {
      console.error('[Schemes] handleDelete error:', error);
      toast.error('Failed to delete scheme');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schemes Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add New Scheme
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Target</th>
              <th>Benefit</th>
              <th>State</th>
              <th>Age Range</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schemes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No schemes found
                </td>
              </tr>
            ) : (
              schemes.map((scheme) => (
                <tr key={scheme._id}>
                  <td className="font-medium">{scheme.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      scheme.type === 'CENTRAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {scheme.type}
                    </span>
                  </td>
                  <td>{scheme.target}</td>
                  <td>{scheme.benefit}</td>
                  <td>{scheme.state}</td>
                  <td>
                    {scheme.ageMin && scheme.ageMax
                      ? `${scheme.ageMin}-${scheme.ageMax} years`
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {scheme.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {scheme.isFeatured && (
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(scheme)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(scheme._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="CENTRAL">Central</option>
                      <option value="STATE">State</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Audience *</label>
                    <input
                      type="text"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      className="input"
                      placeholder="e.g., Unemployed Youth, Entrepreneurs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Benefit Type *</label>
                    <select
                      value={formData.benefit}
                      onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="Money">Money</option>
                      <option value="Training">Training</option>
                      <option value="Subsidy">Subsidy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input"
                      placeholder="All India or State name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Age Range (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.ageMin}
                        onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                        className="input"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={formData.ageMax}
                        onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                        className="input"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Application Link</label>
                    <input
                      type="url"
                      value={formData.applicationLink}
                      onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Benefit Amount</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.benefitAmount.amount}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefitAmount: { ...formData.benefitAmount, amount: e.target.value },
                        })}
                        className="input"
                        placeholder="Amount"
                      />
                      <select
                        value={formData.benefitAmount.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          benefitAmount: { ...formData.benefitAmount, type: e.target.value },
                        })}
                        className="input"
                      >
                        <option value="Fixed">Fixed</option>
                        <option value="Variable">Variable</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Eligibility Criteria</label>
                  <textarea
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    className="input"
                    rows="2"
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    Active
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured
                  </label>
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
                    {editingScheme ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;