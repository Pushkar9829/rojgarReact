import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAdminRealtime } from '../hooks/useAdminSocket';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    jobType: 'CENTRAL',
    domain: 'Police',
    state: '',
    education: '10th',
    ageMin: 18,
    ageMax: 35,
    lastDate: '',
    description: '',
    applicationLink: '',
    vacancyCount: '',
    salaryRange: { min: '', max: '', currency: 'INR' },
    requirements: [],
    isActive: true,
    isFeatured: false,
  });
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    try {
      console.log('[Jobs] fetchJobs called');
      const response = await jobsAPI.getAll({ limit: 100 });
      const list = response.data?.data?.jobs ?? response.data?.jobs ?? [];
      console.log('[Jobs] Jobs received:', list.length, 'items');
      setJobs(list);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error('[Jobs] fetchJobs error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[Jobs] Component mounted, fetching jobs');
    fetchJobs();
    return () => console.log('[Jobs] Component unmounted');
  }, [fetchJobs]);

  useAdminRealtime({
    onJobEvent: () => {
      console.log('[Jobs] Realtime job event, refetching jobs');
      fetchJobs();
    },
  });

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        ...job,
        lastDate: job.lastDate ? new Date(job.lastDate).toISOString().split('T')[0] : '',
        salaryRange: job.salaryRange || { min: '', max: '', currency: 'INR' },
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        jobType: 'CENTRAL',
        domain: 'Police',
        state: '',
        education: '10th',
        ageMin: 18,
        ageMax: 35,
        lastDate: '',
        description: '',
        applicationLink: '',
        vacancyCount: '',
        salaryRange: { min: '', max: '', currency: 'INR' },
        requirements: [],
        isActive: true,
        isFeatured: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        ageMin: parseInt(formData.ageMin),
        ageMax: parseInt(formData.ageMax),
        vacancyCount: formData.vacancyCount ? parseInt(formData.vacancyCount) : undefined,
        salaryRange: formData.salaryRange.min ? {
          ...formData.salaryRange,
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max),
        } : undefined,
      };
      console.log('[Jobs] handleSubmit:', editingJob ? 'update' : 'create', { id: editingJob?._id, title: data.title });

      if (editingJob) {
        await jobsAPI.update(editingJob._id, data);
        toast.success('Job updated successfully');
        console.log('[Jobs] Job updated:', editingJob._id);
      } else {
        await jobsAPI.create(data);
        toast.success('Job created successfully');
        console.log('[Jobs] Job created');
      }
      fetchJobs();
      handleCloseModal();
    } catch (error) {
      console.error('[Jobs] handleSubmit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      console.log('[Jobs] handleDelete:', id);
      await jobsAPI.delete(id);
      toast.success('Job deleted successfully');
      console.log('[Jobs] Job deleted:', id);
      fetchJobs();
    } catch (error) {
      console.error('[Jobs] handleDelete error:', error);
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add New Job
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Domain</th>
              <th>State</th>
              <th>Education</th>
              <th>Age</th>
              <th>Last Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td className="font-medium">{job.title}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.jobType === 'CENTRAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {job.jobType}
                    </span>
                  </td>
                  <td>{job.domain}</td>
                  <td>{job.state}</td>
                  <td>{job.education}</td>
                  <td>{job.ageMin}-{job.ageMax}</td>
                  <td>{new Date(job.lastDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {job.isFeatured && (
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(job)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
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
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Type *</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="CENTRAL">Central</option>
                      <option value="STATE">State</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Domain *</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="Police">Police</option>
                      <option value="Defence">Defence</option>
                      <option value="Railway">Railway</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Health">Health</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Technical">Technical</option>
                      <option value="Apprentice">Apprentice</option>
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
                    <label className="block text-sm font-medium mb-1">Education *</label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="ITI">ITI</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Age Range *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.ageMin}
                        onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                        className="input"
                        placeholder="Min"
                        min="17"
                        required
                      />
                      <input
                        type="number"
                        value={formData.ageMax}
                        onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                        className="input"
                        placeholder="Max"
                        max="60"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Date *</label>
                    <input
                      type="date"
                      value={formData.lastDate}
                      onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vacancy Count</label>
                    <input
                      type="number"
                      value={formData.vacancyCount}
                      onChange={(e) => setFormData({ ...formData, vacancyCount: e.target.value })}
                      className="input"
                    />
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
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="4"
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
                    {editingJob ? 'Update' : 'Create'}
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

export default Jobs;