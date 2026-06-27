import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function VendorBank() {
  const navigate = useNavigate();
  const [vendorBanks, setVendorBanks] = useState([]);
  const [formData, setFormData] = useState({ vendor_name: '' }); // Corrected field name
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
    
    fetchVendorBanks();
  }, [navigate]);

  const fetchVendorBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/vendor-banks/`, {
        headers: getAuthHeaders()
      });
      setVendorBanks(response.data);
    } catch (error) {
      console.error('Error fetching vendor banks:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load vendor banks. Please try again.');
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
    
    if (!formData.vendor_name.trim()) {
      alert('Vendor Bank field is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/vendor-banks/`, {
        vendor_name: formData.vendor_name.trim(), // Corrected field name
        status: true
      }, {
        headers: getAuthHeaders()
      });

      setVendorBanks([...vendorBanks, response.data]);
      setFormData({ vendor_name: '' });
      alert('Vendor Bank Added Successfully!');
    } catch (error) {
      console.error('Error adding vendor bank:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to add vendor bank.';
        
        if (typeof errorData === 'object') {
          if (errorData.vendor_name) {
            errorMessage = errorData.vendor_name[0] || 'Invalid vendor bank name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to add vendor bank. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ vendor_name: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor bank?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/vendor-banks/${id}/`, {
        headers: getAuthHeaders()
      });
      setVendorBanks(vendorBanks.filter(vendorBank => vendorBank.id !== id));
      alert('Vendor Bank deleted successfully!');
    } catch (error) {
      console.error('Error deleting vendor bank:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete vendor bank. Please try again.');
      }
    }
  };

  const startEdit = (id, vendorBankName) => {
    setEditingId(id);
    setEditValue(vendorBankName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      alert('Vendor Bank name cannot be empty');
      return;
    }

    try {
      const vendorBankToEdit = vendorBanks.find(vendorBank => vendorBank.id === id);
      if (!vendorBankToEdit) return;

      const response = await axios.put(`${API_BASE_URL}/vendor-banks/${id}/`, {
        vendor_name: editValue.trim(), // Corrected field name
        status: vendorBankToEdit.status
      }, {
        headers: getAuthHeaders()
      });

      setVendorBanks(vendorBanks.map(vendorBank => vendorBank.id === id ? response.data : vendorBank));
      setEditingId(null);
      setEditValue('');
      alert('Vendor Bank updated successfully!');
    } catch (error) {
      console.error('Error updating vendor bank:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update vendor bank.';
        
        if (typeof errorData === 'object') {
          if (errorData.vendor_name) {
            errorMessage = errorData.vendor_name[0] || 'Invalid vendor bank name';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to update vendor bank. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const vendorBankToUpdate = vendorBanks.find(vendorBank => vendorBank.id === id);
    if (!vendorBankToUpdate) return;

    const newStatus = !vendorBankToUpdate.status;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this vendor bank?`)) {
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/vendor-banks/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });

      setVendorBanks(vendorBanks.map(vendorBank => vendorBank.id === id ? response.data : vendorBank));
      alert(`Vendor Bank ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating vendor bank status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update vendor bank status. Please try again.');
      }
    }
  };

  const activeVendorBanksCount = vendorBanks.filter(vendorBank => vendorBank.status === true).length;

  // Check what field name the API returns for display
  const getDisplayName = (vendorBank) => {
    return vendorBank.vendor_name || vendorBank.name || vendorBank.bank_name || 'N/A';
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Vendor Bank Management</h2>
              <p className="text-muted">Manage vendor banks and their status</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-bank me-2"></i>
                <span className="fw-semibold">{vendorBanks.length} Vendor Banks</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{activeVendorBanksCount} Active</span>
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

      {/* Add Vendor Bank Form */}
      <div className="row mb-5">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-plus-circle text-primary me-2 fs-6"></i>
                Add New Vendor Bank
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Vendor Bank Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bx bx-bank text-primary">🏙</i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      name="vendor_name" 
                      placeholder="Enter vendor bank name" 
                      value={formData.vendor_name}
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
                    disabled={isSubmitting || !formData.vendor_name.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-plus me-2"></i>
                        Add Vendor Bank
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

      {/* Vendor Bank List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-2 fs-5"></i>
                Vendor Bank List
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading vendor banks...</p>
                </div>
              ) : vendorBanks.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-bank text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No vendor banks found</h5>
                  <p className="text-muted">Add your first vendor bank to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>VENDOR BANK</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '300px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorBanks.map((vendorBank, index) => (
                        <tr key={vendorBank.id} className={editingId === vendorBank.id ? 'bg-light' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            {editingId === vendorBank.id ? (
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
                                    onClick={() => saveEdit(vendorBank.id)}
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
                                    <i className="bx bx-bank fs-4 text-primary"></i>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                    {getDisplayName(vendorBank)}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${vendorBank.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(vendorBank.id)}
                              >
                                <div className={`${vendorBank.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{vendorBank.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              {editingId === vendorBank.id ? null : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => startEdit(vendorBank.id, getDisplayName(vendorBank))}
                                    title="Edit Vendor Bank"
                                    disabled={isSubmitting}
                                  >
                                    <i className="bx bx-edit fs-5"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-4 py-2 ${vendorBank.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(vendorBank.id)}
                                    title={vendorBank.status ? 'Deactivate Vendor Bank' : 'Activate Vendor Bank'}
                                    disabled={isSubmitting}
                                  >
                                    <i className={`bx ${vendorBank.status ? 'bx-toggle-left' : 'bx-toggle-right'} fs-5`}></i>
                                    <span>{vendorBank.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-4 py-2"
                                    onClick={() => handleDelete(vendorBank.id)}
                                    title="Delete Vendor Bank"
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
              Showing {vendorBanks.length} vendor banks • {activeVendorBanksCount} active • {vendorBanks.length - activeVendorBanksCount} inactive
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorBank;