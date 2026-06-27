import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/State.css';

const State = () => {
  const navigate = useNavigate();
  const [stateName, setStateName] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Create axios instance with auth interceptor
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add request interceptor to attach token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          navigate('/');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate('/');
      return;
    }

    if (role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchStates();
  }, []);

  const showToast = (message, type = 'success') => {
    alert(message);
  };

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/branch-states/');
      console.log('States response:', response.data); // Debug log
      // REMOVE the filter line below - show ALL states
      // const activeStates = response.data.filter(state => state.status === true);
      setStates(response.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      showToast('Failed to fetch states', 'error');

      if (error.response?.status === 401) {
        // Already handled by interceptor
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stateName.trim()) {
      showToast('State field is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: stateName.trim(),
        status: true  // Add status field
      };

      await api.post('/api/branch-states/', payload);
      showToast('State Added Successfully');
      setStateName('');
      fetchStates();
    } catch (error) {
      console.error('Error creating state:', error);
      if (error.response?.status === 400) {
        showToast(error.response.data.name?.[0] || 'State already exists', 'error');
      } else if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Something went wrong', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this state?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/branch-states/${id}/`);
      showToast('State Deleted Successfully');
      fetchStates();
    } catch (error) {
      console.error('Error deleting state:', error);
      showToast('Failed to delete state', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      await api.patch(`/api/branch-states/${id}/`, { status: newStatus });
      showToast('Status Updated');
      fetchStates();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a state
  const startEdit = (state) => {
    setEditingId(state.id);
    setEditName(state.name);
    setEditStatus(state.status);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStatus(true);
  };

  // Save edited state
  const saveEdit = async (id) => {
    if (!editName.trim()) {
      showToast('State name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: editName.trim(),
        status: editStatus
      };

      await api.put(`/api/branch-states/${id}/`, payload);
      showToast('State Updated Successfully');

      // Reset editing state and refresh
      setEditingId(null);
      fetchStates();
    } catch (error) {
      console.error('Error updating state:', error);
      if (error.response?.status === 400) {
        showToast(error.response.data.name?.[0] || 'State already exists', 'error');
      } else {
        showToast('Something went wrong', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-page-container">
      <div className="location-header">
        <h2>State Management</h2>
        <p>Add and manage states</p>
      </div>
      <div className="state-page container-xxl">
        <div className="card state-card">
          <div className="card-header">
            <h5 className="card-title">Add State</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">State Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter state name"
                  disabled={submitting}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !stateName.trim()}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">State List</h5>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={fetchStates}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : states.length === 0 ? (
              <p className="text-center text-muted">No states found</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>State Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {states.map((state) => (
                      <tr key={state.id}>
                        <td>{state.id}</td>
                        <td>
                          {editingId === state.id ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={loading}
                            />
                          ) : (
                            state.name
                          )}
                        </td>
                        <td>
                          {editingId === state.id ? (
                            <select
                              className="form-select form-select-sm"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value === 'true')}
                              disabled={loading}
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span className={`badge ${state.status ? 'bg-success' : 'bg-warning'}`}>
                              {state.status ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingId === state.id ? (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => saveEdit(state.id)}
                                disabled={loading || !editName.trim()}
                              >
                                {loading ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={cancelEdit}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-warning"
                                onClick={() => startEdit(state)}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              {/* <button
                              className="btn btn-info"
                              onClick={() => handleToggleStatus(state.id, state.status)}
                              disabled={loading}
                            >
                              {state.status ? 'Deactivate' : 'Activate'}
                            </button> */}
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(state.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      );
};

      export default State;