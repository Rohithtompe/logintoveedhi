import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/BranchState.css";

function BranchState() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000';
  
  const [branchStates, setBranchStates] = useState([]);
  const [loading, setLoading] = useState({
    initial: false,
    submitting: false,
    action: false
  });
  const [formData, setFormData] = useState({
    name: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: ''
  });
  const [error, setError] = useState(null);

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchBranchStates();
  }, [navigate]);

  const fetchBranchStates = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/branch-inner-states/`, {
        headers: getAuthHeaders()
      });
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        setBranchStates(response.data);
      } else if (response.data && response.data.data) {
        setBranchStates(response.data.data);
      } else {
        setBranchStates([]);
      }
    } catch (error) {
      console.error('Error fetching branch states:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to fetch branch states');
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Branch State name is required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      setError(null);
      
      // Create the branch state with auth headers
      const response = await axios.post(`${API_BASE_URL}/api/branch-inner-states/`, {
        name: formData.name.trim(),
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.id || response.data.data) {
        alert('Branch State added successfully');
      } else {
        alert('Added successfully');
      }
      
      setFormData({ name: '' });
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error creating branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        if (error.response.data.name) {
          alert(error.response.data.name[0]);
        } else if (error.response.data.detail) {
          alert(error.response.data.detail);
        } else if (error.response.data.message) {
          alert(error.response.data.message);
        } else if (error.response.data.error) {
          alert(error.response.data.error);
        } else {
          setError('Failed to create branch state');
        }
      } else {
        setError('Failed to create branch state. Please check your connection.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleClear = () => {
    setFormData({ name: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch state?')) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}/api/branch-inner-states/${id}/`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert('Branch State deleted successfully');
      }
      
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error deleting branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to delete branch state');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleEdit = (state) => {
    setEditingId(state.id);
    setEditFormData({
      name: state.name
    });
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      alert('Branch State name is required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const response = await axios.put(`${API_BASE_URL}/api/branch-inner-states/${editingId}/`, {
        name: editFormData.name.trim()
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.id || response.data.data) {
        alert('Branch State updated successfully');
      } else {
        alert('Updated successfully');
      }
      
      setEditingId(null);
      setEditFormData({ name: '' });
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error updating branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        if (error.response.data.name) {
          alert(error.response.data.name[0]);
        } else if (error.response.data.detail) {
          alert(error.response.data.detail);
        } else {
          setError('Failed to update branch state');
        }
      } else {
        setError('Failed to update branch state');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '' });
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      // First get current state to know what status to set
      const currentState = branchStates.find(state => state.id === id);
      const newStatus = currentState ? !currentState.status : true;
      
      const response = await axios.patch(`${API_BASE_URL}/api/branch-inner-states/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.data) {
        alert('Status updated successfully');
      } else {
        alert('Status updated');
      }
      
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error toggling status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to toggle status');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Branch State Management</h2>
              <p className="text-muted">Add and manage branch states</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-map-alt me-2"></i>
                <span className="fw-semibold">{branchStates.length} States</span>
              </div>
              <button 
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={fetchBranchStates}
                disabled={loading.initial}
              >
                <i className="bx bx-refresh me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bx bx-error-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Add Branch State Form */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Add New Branch State</span>
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-6 col-md-8">
                    <div className="mb-4">
                      <label className="form-label fw-semibold mb-3">
                        Branch State Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bx bx-map-alt text-primary"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-3" 
                          name="name"
                          placeholder="Enter branch state name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={loading.submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-lg-6 col-md-8">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading.submitting || !formData.name.trim()}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        {loading.submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <i className="bx bx-plus fs-5"></i>
                            Add Branch State
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary py-3 px-4 d-flex align-items-center gap-2"
                        onClick={handleClear}
                        disabled={loading.submitting}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        <i className="bx bx-reset fs-5"></i>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Branch State List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Branch State List</span>
                <span className="badge bg-primary ms-3 px-3 py-2">
                  {branchStates.length} Records
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {loading.initial ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading branch states...</p>
                </div>
              ) : branchStates.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>BRANCH STATE DETAILS</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '300px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchStates.map((state, index) => (
                        <tr key={state.id} className={editingId === state.id ? 'table-warning' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === state.id ? (
                              <div className="d-flex align-items-center gap-3">
                                <div className="flex-grow-1">
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="name"
                                      value={editFormData.name}
                                      onChange={handleEditInputChange}
                                      disabled={loading.action}
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={handleSaveEdit}
                                    disabled={loading.action || !editFormData.name.trim()}
                                  >
                                    <i className="bx bx-check fs-5"></i>
                                    <span>Save</span>
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={handleCancelEdit}
                                    disabled={loading.action}
                                  >
                                    <i className="bx bx-x fs-5"></i>
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                  </div>
                                </div>
                                <div>
                                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                    {state.name}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${state.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => toggleStatus(state.id)}
                              >
                                <div className={`${state.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{state.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              {editingId === state.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => handleEdit(state)}
                                    disabled={loading.action}
                                    title="Edit"
                                  >
                                    <i className="bx bx-edit"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-3 py-2 ${state.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => toggleStatus(state.id)}
                                    title={state.status ? 'Deactivate' : 'Activate'}
                                  >
                                    <i className={`bx ${state.status ? 'bx-toggle-left' : 'bx-toggle-right'}`}></i>
                                    <span>{state.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => handleDelete(state.id)}
                                    title="Delete"
                                  >
                                    <i className="bx bx-trash"></i>
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-map-alt text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No branch states found</h5>
                  <p className="text-muted">Add your first branch state above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center text-muted">
            <small>
              <i className="bx bx-info-circle me-1"></i>
              Showing {branchStates.length} branch states • {branchStates.filter(s => s.status).length} active • {branchStates.filter(s => !s.status).length} inactive
            </small>
            <small>
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchState;