import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function BankDesignation() {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState({ designation_name: '' });
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
    
    fetchDesignations();
  }, [navigate]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/vendor-bank-designations/`, {
        headers: getAuthHeaders()
      });
      setDesignations(response.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load designations. Please try again.');
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
    
    if (!formData.designation_name.trim()) {
      alert('Designation Name field is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/vendor-bank-designations/`, {
        designation_name: formData.designation_name.trim(),
        status: true
      }, {
        headers: getAuthHeaders()
      });

      setDesignations([...designations, response.data]);
      setFormData({ designation_name: '' });
      alert('Designation Added Successfully!');
    } catch (error) {
      console.error('Error adding designation:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to add designation.';
        
        if (typeof errorData === 'object') {
          if (errorData.designation_name) {
            errorMessage = errorData.designation_name[0] || 'Invalid designation name';
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
        alert('Failed to add designation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ designation_name: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/vendor-bank-designations/${id}/`, {
        headers: getAuthHeaders()
      });
      setDesignations(designations.filter(designation => designation.id !== id));
      alert('Designation deleted successfully!');
    } catch (error) {
      console.error('Error deleting designation:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete designation. Please try again.');
      }
    }
  };

  const startEdit = (id, designationName) => {
    setEditingId(id);
    setEditValue(designationName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      alert('Designation name cannot be empty');
      return;
    }

    try {
      const designationToEdit = designations.find(designation => designation.id === id);
      if (!designationToEdit) return;

      const response = await axios.put(`${API_BASE_URL}/vendor-bank-designations/${id}/`, {
        designation_name: editValue.trim(),
        status: designationToEdit.status
      }, {
        headers: getAuthHeaders()
      });

      setDesignations(designations.map(designation => designation.id === id ? response.data : designation));
      setEditingId(null);
      setEditValue('');
      alert('Designation updated successfully!');
    } catch (error) {
      console.error('Error updating designation:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update designation.';
        
        if (typeof errorData === 'object') {
          if (errorData.designation_name) {
            errorMessage = errorData.designation_name[0] || 'Invalid designation name';
          } else if (errorData.name) {
            errorMessage = errorData.name[0] || 'Invalid name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to update designation. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const designationToUpdate = designations.find(designation => designation.id === id);
    if (!designationToUpdate) return;

    const newStatus = !designationToUpdate.status;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this designation?`)) {
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/vendor-bank-designations/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });

      setDesignations(designations.map(designation => designation.id === id ? response.data : designation));
      alert(`Designation ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating designation status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update designation status. Please try again.');
      }
    }
  };

  const activeDesignationsCount = designations.filter(designation => designation.status === true).length;

  // Get display name for designation
  const getDisplayName = (designation) => {
    return designation.designation_name || designation.name || designation.title || 'N/A';
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Banker Designation Management</h2>
              <p className="text-muted">Manage banker designations and their status</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-briefcase me-2"></i>
                <span className="fw-semibold">{designations.length} Designations</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{activeDesignationsCount} Active</span>
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

      {/* Add Designation Form */}
      <div className="row mb-5">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-2 fs-6"></i>
                Add New Banker Designation
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Designation Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bx bx-briefcase text-primary"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      name="designation_name" 
                      placeholder="Enter designation name (e.g., Relationship Manager, Branch Manager)" 
                      value={formData.designation_name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
                    disabled={isSubmitting || !formData.designation_name.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-plus me-2"></i>
                        Add Designation
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

      {/* Designation List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-2 fs-5"></i>
                Designation List
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading designations...</p>
                </div>
              ) : designations.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-briefcase text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No designations found</h5>
                  <p className="text-muted">Add your first banker designation to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>BANKER DESIGNATION NAME</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '250px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {designations.map((designation, index) => (
                        <tr key={designation.id} className={editingId === designation.id ? 'bg-light' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === designation.id ? (
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
                                    onClick={() => saveEdit(designation.id)}
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
                                    {getDisplayName(designation)}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${designation.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(designation.id)}
                              >
                                <div className={`${designation.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{designation.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              {editingId === designation.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => startEdit(designation.id, getDisplayName(designation))}
                                    title="Edit Designation"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-edit fs-5"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-4 py-2 ${designation.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(designation.id)}
                                    title={designation.status ? 'Deactivate Designation' : 'Activate Designation'}
                                    disabled={isSubmitting}
                                  >
                                    <i className={`bx ${designation.status ? 'bx-toggle-left' : 'bx-toggle-right'} fs-5`}></i>
                                    <span>{designation.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => handleDelete(designation.id)}
                                    title="Delete Designation"
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
              Showing {designations.length} designations • {activeDesignationsCount} active • {designations.length - activeDesignationsCount} inactive
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankDesignation;