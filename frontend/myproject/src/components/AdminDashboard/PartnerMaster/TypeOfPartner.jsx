import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TypeOfPartner = () => {
  const [formData, setFormData] = useState({
    partner_type: '',
    status: 1 // Default to Active
  });
  
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch all partner types on component mount
  useEffect(() => {
    fetchPartnerTypes();
  }, []);

  const fetchPartnerTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('partner-type/');
      // Ensure status is properly mapped (true/false to 1/0)
      const formattedData = response.data.map(item => ({
        ...item,
        status: item.status === true || item.status === 1 ? 1 : 0
      }));
      setPartnerTypes(formattedData);
    } catch (error) {
      console.error('Error fetching partner types:', error);
      toast.error('Failed to load partner types');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (value) => {
    const newErrors = {};
    
    if (!value?.trim()) {
      newErrors.partner_type = 'Partner Type is required';
    } else if (value.length < 2) {
      newErrors.partner_type = 'Partner Type must be at least 2 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(formData.partner_type);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      setSubmitting(true);
      // Send status as 1 (Active) by default
      const dataToSend = {
        partner_type: formData.partner_type,
        status: true // Send as boolean true for Active
      };
      
      await api.post('partner-type/', dataToSend);
      
      toast.success('Partner Type Added Successfully');
      
      // Reset form
      setFormData({ 
        partner_type: '',
        status: 1 
      });
      setErrors({});
      
      // Refresh the list
      fetchPartnerTypes();
      
    } catch (error) {
      console.error('Error adding partner type:', error);
      
      // Handle validation errors from server
      if (error.response?.data) {
        const serverErrors = error.response.data;
        
        if (serverErrors.partner_type) {
          toast.error(serverErrors.partner_type[0]);
        } else if (serverErrors.non_field_errors) {
          toast.error(serverErrors.non_field_errors[0]);
        } else {
          Object.keys(serverErrors).forEach(key => {
            if (Array.isArray(serverErrors[key])) {
              toast.error(`${key}: ${serverErrors[key][0]}`);
            } else {
              toast.error(`${key}: ${serverErrors[key]}`);
            }
          });
        }
      } else {
        toast.error('Failed to add partner type. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (partner) => {
    setEditingId(partner.id);
    setEditValue(partner.partner_type);
    setErrors({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
    setErrors({});
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
    if (errors.partner_type) {
      setErrors({});
    }
  };

  const handleUpdate = async (id) => {
    // Validate form
    const formErrors = validateForm(editValue);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      await api.put(`partner-type/${id}/`, {
        partner_type: editValue
      });
      
      toast.success('Partner Type Updated Successfully');
      setEditingId(null);
      setEditValue('');
      fetchPartnerTypes();
      
    } catch (error) {
      console.error('Error updating partner type:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        
        if (serverErrors.partner_type) {
          toast.error(serverErrors.partner_type[0]);
        } else if (serverErrors.non_field_errors) {
          toast.error(serverErrors.non_field_errors[0]);
        } else {
          Object.keys(serverErrors).forEach(key => {
            toast.error(`${key}: ${serverErrors[key]}`);
          });
        }
      } else {
        toast.error('Failed to update partner type');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner type?')) {
      return;
    }
    
    try {
      await api.delete(`partner-type/${id}/`);
      toast.success('Partner Type deleted successfully');
      fetchPartnerTypes();
    } catch (error) {
      console.error('Error deleting partner type:', error);
      
      if (error.response?.status === 404) {
        toast.error('Partner type not found');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to delete partner type');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      // Toggle between true and false
      const newStatus = !currentStatus;
      
      await api.patch(`partner-type/${id}/`, { 
        status: newStatus 
      });
      
      toast.success(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
      fetchPartnerTypes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Helper function to check if status is active
  const isActive = (status) => {
    // Handle different possible status values
    if (status === true || status === 1 || status === '1') {
      return true;
    }
    return false;
  };

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <div className="layout-page">
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                
                {/* Page Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="fw-bold py-3 mb-4">
                      <span className="text-muted fw-light">Settings /</span> Partner Types
                    </h4>
                  </div>
                </div>

                {/* Add Partner Type Form */}
                <div className="row mb-4">
                  <div className="col-xl-6">
                    <div className="card mb-4">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Add New Partner Type</h5>
                      </div>
                      <div className="card-body">
                        <form onSubmit={handleSubmit}>
                          <div className="mb-3">
                            <label htmlFor="partner_type" className="form-label">
                              Partner Type Name
                            </label>
                            <div className="input-group input-group-merge">
                              <span className="input-group-text">
                                <i className="bi bi-people-fill"></i>
                              </span>
                              <input
                                type="text"
                                className={`form-control ${errors.partner_type ? 'is-invalid' : ''}`}
                                id="partner_type"
                                name="partner_type"
                                placeholder="Enter partner type (e.g., Supplier, Distributor)"
                                value={formData.partner_type}
                                onChange={handleInputChange}
                                disabled={submitting}
                              />
                            </div>
                            {errors.partner_type && (
                              <div className="text-danger small mt-1">{errors.partner_type}</div>
                            )}
                          </div>
                          
                          <div className="d-flex justify-content-end">
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-plus-circle me-2"></i>
                                  Add Partner Type
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partner Type List */}
                <div className="row">
                  <div className="col-xl-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Partner Types List</h5>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={fetchPartnerTypes}
                          disabled={loading}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Refresh
                        </button>
                      </div>
                      <div className="card-body">
                        {loading ? (
                          <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading partner types...</p>
                          </div>
                        ) : partnerTypes.length === 0 ? (
                          <div className="text-center p-5">
                            <i className="bi bi-people-fill bi-lg text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <p className="text-muted">No partner types found. Add one to get started.</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                              
                                  <th>PARTNER TYPE</th>
                                  <th>STATUS</th>
                                  <th>ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {partnerTypes.map((partner) => {
                                  const active = isActive(partner.status);
                                  return (
                                    <tr key={partner.id}>
                              
                                      <td>
                                        {editingId === partner.id ? (
                                          <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 me-2">
                                              <input
                                                type="text"
                                                className={`form-control ${errors.partner_type ? 'is-invalid' : ''}`}
                                                value={editValue}
                                                onChange={handleEditChange}
                                                autoFocus
                                              />
                                              {errors.partner_type && (
                                                <div className="text-danger small mt-1">{errors.partner_type}</div>
                                              )}
                                            </div>
                                            <div className="btn-group">
                                              <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleUpdate(partner.id)}
                                              >
                                                <i className="bi bi-check me-1"></i>Save
                                              </button>
                                              <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleEditCancel}
                                              >
                                                <i className="bi bi-x me-1"></i>Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="fw-medium">{partner.partner_type}</span>
                                        )}
                                      </td>
                                      <td>
                                        <span 
                                          className={`badge ${active ? 'bg-success' : 'bg-danger'}`}
                                          style={{ 
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            padding: '0.4em 0.8em'
                                          }}
                                          onClick={() => handleStatusToggle(partner.id, partner.status)}
                                          title={`Click to ${active ? 'deactivate' : 'activate'}`}
                                        >
                                          <i className={`bi ${active ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                          {active ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td>
                                        {editingId === partner.id ? (
                                          <div className="text-muted small">Editing...</div>
                                        ) : (
                                          <div className="d-flex gap-2">
                                            <button
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => handleEditClick(partner)}
                                              title="Edit"
                                            >
                                              <i className="bi bi-pencil-square me-1"></i>
                                              Edit
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleDelete(partner.id)}
                                              title="Delete"
                                            >
                                              <i className="bi bi-trash me-1"></i>
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TypeOfPartner;