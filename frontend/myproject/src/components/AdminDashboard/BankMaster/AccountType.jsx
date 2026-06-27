import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function AccountType() {
  const navigate = useNavigate();
  const [accountTypes, setAccountTypes] = useState([]);
  const [formData, setFormData] = useState({ account_type: '' });
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
    
    fetchAccountTypes();
  }, [navigate]);

  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/typeofaccounts/`, {
        headers: getAuthHeaders()
      });
      setAccountTypes(response.data);
    } catch (error) {
      console.error('Error fetching account types:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load account types. Please try again.');
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
    
    if (!formData.account_type.trim()) {
      alert('Account Type field is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/typeofaccounts/`, {
        account_type: formData.account_type,
        status: true
      }, {
        headers: getAuthHeaders()
      });

      setAccountTypes([...accountTypes, response.data]);
      setFormData({ account_type: '' });
      alert('Type Of Account Added Successfully!');
    } catch (error) {
      console.error('Error adding account type:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data?.account_type?.[0]) {
        alert(error.response.data.account_type[0]);
      } else {
        alert('Failed to add account type. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ account_type: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account type?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/typeofaccounts/${id}/`, {
        headers: getAuthHeaders()
      });
      setAccountTypes(accountTypes.filter(type => type.id !== id));
      alert('Account type deleted successfully!');
    } catch (error) {
      console.error('Error deleting account type:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete account type. Please try again.');
      }
    }
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      alert('Account type cannot be empty');
      return;
    }

    try {
      const accountTypeToEdit = accountTypes.find(type => type.id === id);
      if (!accountTypeToEdit) return;

      const response = await axios.put(`${API_BASE_URL}/typeofaccounts/${id}/`, {
        account_type: editValue.trim(),
        status: accountTypeToEdit.status
      }, {
        headers: getAuthHeaders()
      });

      setAccountTypes(accountTypes.map(type => type.id === id ? response.data : type));
      setEditingId(null);
      setEditValue('');
      alert('Account type updated successfully!');
    } catch (error) {
      console.error('Error updating account type:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data?.account_type?.[0]) {
        alert(error.response.data.account_type[0]);
      } else {
        alert('Failed to update account type. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const accountTypeToUpdate = accountTypes.find(type => type.id === id);
    if (!accountTypeToUpdate) return;

    const newStatus = !accountTypeToUpdate.status;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this account type?`)) {
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/typeofaccounts/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });

      setAccountTypes(accountTypes.map(type => type.id === id ? response.data : type));
      alert(`Account type ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating account type status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update account type status. Please try again.');
      }
    }
  };

  const activeAccountTypesCount = accountTypes.filter(type => type.status === true).length;

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Account Type Management</h2>
              <p className="text-muted">Manage different types of bank accounts</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-credit-card me-2"></i>
                <span className="fw-semibold">{accountTypes.length} Types</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{activeAccountTypesCount} Active</span>
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

      {/* Add Account Type Form - Full width above table */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Add New Account Type</span>
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-8 col-md-10">
                    <div className="mb-4">
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bx bx-credit-card text-primary fs-5"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-3" 
                          name="account_type" 
                          placeholder="e.g., Savings Account, Current Account" 
                          value={formData.account_type}
                          onChange={handleInputChange}
                          required
                          style={{ fontSize: '1rem', padding: '1rem 0.75rem' }}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="form-text text-muted mt-2">
                        <i className="bx bx-info-circle me-1"></i>
                        Enter the type of account (e.g., Savings, Current, Salary, etc.)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-lg-8 col-md-10">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-grow-1 py-3"
                        disabled={isSubmitting || !formData.account_type.trim()}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <i className="bx bx-plus me-2 fs-5"></i>
                            Add Account Type
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary py-3 px-4"
                        onClick={handleClear}
                        disabled={isSubmitting}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        <i className="bx bx-x me-2 fs-5"></i>
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

      {/* Account Type List Table - Below the form */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Account Type List</span>
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading account types...</p>
                </div>
              ) : accountTypes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-credit-card text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No account types found</h5>
                  <p className="text-muted">Add your first account type to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>TYPE OF ACCOUNT</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '350px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountTypes.map((type, index) => (
                        <tr key={type.id} className={editingId === type.id ? 'bg-light' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === type.id ? (
                              <div className="d-flex align-items-center gap-3">
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control border-primary"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                    disabled={isSubmitting}
                                  />
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => saveEdit(type.id)}
                                    title="Save Changes"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-check fs-5"></i>
                                    <span>Save</span>
                                  </button>
                                  <button
                                    className="btn btn-secondary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={cancelEdit}
                                    title="Cancel Edit"
                                    disabled={isSubmitting}
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
                                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{type.account_type}</h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${type.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(type.id)}
                              >
                                <div className={`${type.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{type.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              {editingId === type.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => startEdit(type.id, type.account_type)}
                                    title="Edit Account Type"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-edit"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-3 py-2 ${type.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(type.id)}
                                    title={type.status ? 'Deactivate Account Type' : 'Activate Account Type'}
                                    disabled={isSubmitting}
                                  >
                                    <i className={`bx ${type.status ? 'bx-toggle-left' : 'bx-toggle-right'}`}></i>
                                    <span>{type.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => handleDelete(type.id)}
                                    title="Delete Account Type"
                                    disabled={isSubmitting}
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
              Showing {accountTypes.length} account types • {activeAccountTypesCount} active • {accountTypes.length - activeAccountTypesCount} inactive
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountType;