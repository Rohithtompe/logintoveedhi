import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function DsaName() {
  const navigate = useNavigate();
  const [dsaNames, setDsaNames] = useState([]);
  const [formData, setFormData] = useState({ dsa_name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

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
    
    fetchDsaNames();
  }, [navigate]);

  const fetchDsaNames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/dsa-names/`, {
        headers: getAuthHeaders()
      });
      setDsaNames(response.data);
    } catch (error) {
      console.error('Error fetching DSA names:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load DSA names. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.dsa_name.trim()) {
      alert('DSA Name field is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/dsa-names/`, {
        dsa_name: formData.dsa_name.trim(),
        status: true
      }, {
        headers: getAuthHeaders()
      });

      setDsaNames([...dsaNames, response.data]);
      setFormData({ dsa_name: '' });
      alert('DSA Name Added Successfully!');
    } catch (error) {
      console.error('Error adding DSA name:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to add DSA name.';
        
        if (typeof errorData === 'object') {
          if (errorData.dsa_name) {
            errorMessage = errorData.dsa_name[0] || 'Invalid DSA name';
          } else if (errorData.name) {
            errorMessage = errorData.name[0] || 'Invalid name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to add DSA name. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ dsa_name: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this DSA name?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/dsa-names/${id}/`, {
        headers: getAuthHeaders()
      });
      setDsaNames(dsaNames.filter(dsaName => dsaName.id !== id));
      alert('DSA Name deleted successfully!');
    } catch (error) {
      console.error('Error deleting DSA name:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete DSA name. Please try again.');
      }
    }
  };

  const startEdit = (id, dsaName) => {
    setEditingId(id);
    setEditValue(dsaName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      alert('DSA name cannot be empty');
      return;
    }

    try {
      const dsaToEdit = dsaNames.find(dsaName => dsaName.id === id);
      if (!dsaToEdit) return;

      const response = await axios.put(`${API_BASE_URL}/dsa-names/${id}/`, {
        dsa_name: editValue.trim(),
        status: dsaToEdit.status
      }, {
        headers: getAuthHeaders()
      });

      setDsaNames(dsaNames.map(dsaName => dsaName.id === id ? response.data : dsaName));
      setEditingId(null);
      setEditValue('');
      alert('DSA Name updated successfully!');
    } catch (error) {
      console.error('Error updating DSA name:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update DSA name.';
        
        if (typeof errorData === 'object') {
          if (errorData.dsa_name) {
            errorMessage = errorData.dsa_name[0] || 'Invalid DSA name';
          } else if (errorData.name) {
            errorMessage = errorData.name[0] || 'Invalid name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to update DSA name. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const dsaToUpdate = dsaNames.find(dsaName => dsaName.id === id);
    if (!dsaToUpdate) return;

    const newStatus = !dsaToUpdate.status;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this DSA name?`)) {
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/dsa-names/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });

      setDsaNames(dsaNames.map(dsaName => dsaName.id === id ? response.data : dsaName));
      alert(`DSA Name ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating DSA name status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update DSA name status. Please try again.');
      }
    }
  };

  const activeDsaNamesCount = dsaNames.filter(dsaName => dsaName.status === true).length;

  // Get display name for DSA
  const getDisplayName = (dsaName) => {
    return dsaName.dsa_name || dsaName.name || dsaName.title || 'N/A';
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">DSA Name Management</h2>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-user-circle me-2"></i>
                <span className="fw-semibold">{dsaNames.length} DSA Names</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{activeDsaNamesCount} Active</span>
              </div>
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

      {/* Add DSA Name Form */}
      <div className="row mb-5">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-2 fs-6"></i>
                Add New DSA Name
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">DSA Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bx bx-user text-primary"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      name="dsa_name" 
                      placeholder="Enter DSA name" 
                      value={formData.dsa_name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-text mt-2">
                    <i className="bx bx-info-circle me-1"></i>
                    Enter the name of the Direct Selling Agent
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
                    disabled={isSubmitting || !formData.dsa_name.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-plus me-2"></i>
                        Add DSA Name
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={handleClear}
                    disabled={isSubmitting}
                  >
                    <i className="bx bx-x me-2"></i>
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* DSA Name List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-2 fs-5"></i>
                DSA Name List
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading DSA names...</p>
                </div>
              ) : dsaNames.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-user-circle text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No DSA names found</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>DSA NAME</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '250px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsaNames.map((dsaName, index) => (
                        <tr key={dsaName.id} className={editingId === dsaName.id ? 'bg-light' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === dsaName.id ? (
                              <div className="d-flex align-items-center gap-3">
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control form-control-lg border-primary"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                    style={{ minWidth: '300px', fontSize: '1rem', padding: '0.75rem' }}
                                  />
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => saveEdit(dsaName.id)}
                                    title="Save Changes"
                                  >
                                    <i className="bx bx-check fs-5"></i>
                                    <span>Save</span>
                                  </button>
                                  <button
                                    className="btn btn-secondary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={cancelEdit}
                                    title="Cancel Edit"
                                  >
                                    <i className="bx bx-x fs-5"></i>
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                  </div>
                                </div>
                                <div>
                                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                    {getDisplayName(dsaName)}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${dsaName.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(dsaName.id)}
                              >
                                <div className={`${dsaName.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{dsaName.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              {editingId === dsaName.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => startEdit(dsaName.id, getDisplayName(dsaName))}
                                    title="Edit DSA Name"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-edit fs-5"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-4 py-2 ${dsaName.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(dsaName.id)}
                                    title={dsaName.status ? 'Deactivate DSA Name' : 'Activate DSA Name'}
                                    disabled={isSubmitting}
                                  >
                                    <i className={`bx ${dsaName.status ? 'bx-toggle-left' : 'bx-toggle-right'} fs-5`}></i>
                                    <span>{dsaName.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => handleDelete(dsaName.id)}
                                    title="Delete DSA Name"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-trash fs-5"></i>
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
              Showing {dsaNames.length} DSA names • {activeDsaNamesCount} active • {dsaNames.length - activeDsaNamesCount} inactive
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DsaName;