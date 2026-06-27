import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function LoanType() {
  const navigate = useNavigate();
  const [loanTypes, setLoanTypes] = useState([]);
  const [formData, setFormData] = useState({ loan_type: '' });
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
    
    fetchLoanTypes();
  }, [navigate]);

  const fetchLoanTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/loan-types/`, {
        headers: getAuthHeaders()
      });
      setLoanTypes(response.data);
    } catch (error) {
      console.error('Error fetching loan types:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load loan types. Please try again.');
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
    
    if (!formData.loan_type.trim()) {
      alert('Loan Type field is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/loan-types/`, {
        loan_type: formData.loan_type.trim(),
        status: true
      }, {
        headers: getAuthHeaders()
      });

      setLoanTypes([...loanTypes, response.data]);
      setFormData({ loan_type: '' });
      alert('Loan Type Added Successfully!');
    } catch (error) {
      console.error('Error adding loan type:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to add loan type.';
        
        if (typeof errorData === 'object') {
          if (errorData.loan_type) {
            errorMessage = errorData.loan_type[0] || 'Invalid loan type';
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
        alert('Failed to add loan type. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ loan_type: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan type?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/loan-types/${id}/`, {
        headers: getAuthHeaders()
      });
      setLoanTypes(loanTypes.filter(loanType => loanType.id !== id));
      alert('Loan Type deleted successfully!');
    } catch (error) {
      console.error('Error deleting loan type:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete loan type. Please try again.');
      }
    }
  };

  const startEdit = (id, loanTypeName) => {
    setEditingId(id);
    setEditValue(loanTypeName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      alert('Loan type cannot be empty');
      return;
    }

    try {
      const loanTypeToEdit = loanTypes.find(loanType => loanType.id === id);
      if (!loanTypeToEdit) return;

      const response = await axios.put(`${API_BASE_URL}/loan-types/${id}/`, {
        loan_type: editValue.trim(),
        status: loanTypeToEdit.status
      }, {
        headers: getAuthHeaders()
      });

      setLoanTypes(loanTypes.map(loanType => loanType.id === id ? response.data : loanType));
      setEditingId(null);
      setEditValue('');
      alert('Loan Type updated successfully!');
    } catch (error) {
      console.error('Error updating loan type:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update loan type.';
        
        if (typeof errorData === 'object') {
          if (errorData.loan_type) {
            errorMessage = errorData.loan_type[0] || 'Invalid loan type';
          } else if (errorData.name) {
            errorMessage = errorData.name[0] || 'Invalid name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to update loan type. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const loanTypeToUpdate = loanTypes.find(loanType => loanType.id === id);
    if (!loanTypeToUpdate) return;

    const newStatus = !loanTypeToUpdate.status;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this loan type?`)) {
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/loan-types/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });

      setLoanTypes(loanTypes.map(loanType => loanType.id === id ? response.data : loanType));
      alert(`Loan Type ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating loan type status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update loan type status. Please try again.');
      }
    }
  };

  const activeLoanTypesCount = loanTypes.filter(loanType => loanType.status === true).length;

  // Get display name for loan type
  const getDisplayName = (loanType) => {
    return loanType.loan_type || loanType.name || loanType.title || 'N/A';
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Loan Type Management</h2>
              <p className="text-muted">Manage different types of loans and their status</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-credit-card me-2"></i>
                <span className="fw-semibold">{loanTypes.length} Loan Types</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{activeLoanTypesCount} Active</span>
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

      {/* Add Loan Type Form */}
      <div className="row mb-5">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-2 fs-6"></i>
                Add New Loan Type
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Loan Type</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bx bx-credit-card-front text-primary"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      name="loan_type" 
                      placeholder="Enter loan type (e.g., Personal Loan, Home Loan, Business Loan)" 
                      value={formData.loan_type}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-text mt-2">
                    <i className="bx bx-info-circle me-1"></i>
                    Enter the type of loan product
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
                    disabled={isSubmitting || !formData.loan_type.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-plus me-2"></i>
                        Add Loan Type
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

      {/* Loan Type List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-2 fs-5"></i>
                Loan Type List
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading loan types...</p>
                </div>
              ) : loanTypes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-credit-card text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No loan types found</h5>
                  <p className="text-muted">Add your first loan type to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>LOAN TYPE</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '250px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanTypes.map((loanType, index) => (
                        <tr key={loanType.id} className={editingId === loanType.id ? 'bg-light' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === loanType.id ? (
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
                                    onClick={() => saveEdit(loanType.id)}
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
                                    {getDisplayName(loanType)}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${loanType.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(loanType.id)}
                              >
                                <div className={`${loanType.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{loanType.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              {editingId === loanType.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => startEdit(loanType.id, getDisplayName(loanType))}
                                    title="Edit Loan Type"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-edit fs-5"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-4 py-2 ${loanType.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(loanType.id)}
                                    title={loanType.status ? 'Deactivate Loan Type' : 'Activate Loan Type'}
                                    disabled={isSubmitting}
                                  >
                                    <i className={`bx ${loanType.status ? 'bx-toggle-left' : 'bx-toggle-right'} fs-5`}></i>
                                    <span>{loanType.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => handleDelete(loanType.id)}
                                    title="Delete Loan Type"
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
              Showing {loanTypes.length} loan types • {activeLoanTypesCount} active • {loanTypes.length - activeLoanTypesCount} inactive
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanType;