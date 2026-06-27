import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IndustryType = () => {
  const [formData, setFormData] = useState({
    customer_type: '', // This should be customer_type ID
    industry_name: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    customer_type: '', // This should be customer_type ID
    industry_name: ''
  });
  
  const [customerTypes, setCustomerTypes] = useState([]);
  const [industryTypes, setIndustryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCustomerTypes, setLoadingCustomerTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCustomerTypes();
    fetchIndustryTypes();
  }, []);

  const fetchCustomerTypes = async () => {
    try {
      setLoadingCustomerTypes(true);
      const response = await api.get('customer-type/'); // Changed to match customer type endpoint
      if (response.data && Array.isArray(response.data)) {
        // Filter active customer types
        const activeCustomerTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setCustomerTypes(activeCustomerTypes);
      }
    } catch (error) {
      console.error('Error fetching customer types:', error);
      toast.error('Failed to load customer types');
    } finally {
      setLoadingCustomerTypes(false);
    }
  };

  const fetchIndustryTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('industry-type/'); // Changed endpoint to match your API
      console.log('Industry types response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter active industry types
        const activeIndustryTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setIndustryTypes(activeIndustryTypes);
      }
    } catch (error) {
      console.error('Error fetching industry types:', error);
      toast.error('Failed to load industry types');
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
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    if (!data.customer_type) {
      newErrors.customer_type = 'Customer Type is required';
    }
    
    if (!data.industry_name?.trim()) {
      newErrors.industry_name = 'Industry Name is required';
    } else if (data.industry_name.trim().length < 2) {
      newErrors.industry_name = 'Industry Name must be at least 2 characters';
    } else if (data.industry_name.trim().length > 100) {
      newErrors.industry_name = 'Industry Name must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if industry type already exists for this customer type
      const existingIndustry = industryTypes.find(
        industry => 
          industry.customer_type.toString() === formData.customer_type.toString() &&
          industry.industry_name.toLowerCase() === formData.industry_name.trim().toLowerCase() &&
          (industry.status === true || industry.status === 1)
      );
      
      if (existingIndustry) {
        toast.error('Industry Type already exists for this customer type');
        return;
      }
      
      // Create new industry type - payload must match Django model
      const payload = {
        customer_type: parseInt(formData.customer_type), // This is the foreign key ID
        industry_name: formData.industry_name.trim(),
        status: true // Active by default
      };
      
      console.log('Creating industry type with payload:', payload);
      const response = await api.post('industry-type/', payload); // Changed endpoint
      console.log('Create response:', response.data);
      
      toast.success('Industry Type Added Successfully');
      setFormData({ customer_type: '', industry_name: '' });
      fetchIndustryTypes();
      
    } catch (error) {
      console.error('Error adding industry type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        // Check for specific field errors
        if (errorData.industry_name) {
          const errorMsg = Array.isArray(errorData.industry_name) 
            ? errorData.industry_name[0] 
            : errorData.industry_name;
          toast.error(`Industry Name: ${errorMsg}`);
        } 
        else if (errorData.customer_type) {
          const errorMsg = Array.isArray(errorData.customer_type) 
            ? errorData.customer_type[0] 
            : errorData.customer_type;
          toast.error(`Customer Type: ${errorMsg}`);
        }
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add industry type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (industry) => {
    setEditFormData({
      id: industry.id,
      customer_type: industry.customer_type.toString(), // This should be the ID
      industry_name: industry.industry_name
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editFormData)) {
      return;
    }
    
    try {
      setEditing(true);
      
      // Check if industry type already exists (excluding current one)
      const existingIndustry = industryTypes.find(
        industry => 
          industry.id !== editFormData.id &&
          industry.customer_type.toString() === editFormData.customer_type.toString() &&
          industry.industry_name.toLowerCase() === editFormData.industry_name.trim().toLowerCase() &&
          (industry.status === true || industry.status === 1)
      );
      
      if (existingIndustry) {
        toast.error('Industry Type already exists for this customer type');
        return;
      }
      
      const payload = {
        customer_type: parseInt(editFormData.customer_type),
        industry_name: editFormData.industry_name.trim()
      };
      
      console.log('Updating industry type with payload:', payload);
      const response = await api.put(`industry-type/${editFormData.id}/`, payload); // Changed endpoint
      console.log('Update response:', response.data);
      
      toast.success('Industry Type Updated Successfully');
      setShowEditModal(false);
      fetchIndustryTypes();
      
    } catch (error) {
      console.error('Error updating industry type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.industry_name) {
          const errorMsg = Array.isArray(errorData.industry_name) 
            ? errorData.industry_name[0] 
            : errorData.industry_name;
          toast.error(`Industry Name: ${errorMsg}`);
        } else {
          toast.error('Failed to update industry type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this industry type?')) {
      return;
    }
    
    try {
      await api.delete(`industry-type/${id}/`); // Changed endpoint
      toast.success('Industry Type deleted successfully');
      fetchIndustryTypes();
    } catch (error) {
      console.error('Error deleting industry type:', error);
      toast.error('Failed to delete industry type');
    }
  };

  const handleStatusToggle = async (industry) => {
    try {
      const newStatus = !industry.status;
      await api.patch(`industry-type/${industry.id}/`, { status: newStatus }); // Changed endpoint
      toast.success(`Industry type ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchIndustryTypes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Helper function to get customer type name by ID
  const getCustomerTypeName = (customerTypeId) => {
    const customerType = customerTypes.find(item => item.id.toString() === customerTypeId.toString());
    return customerType ? customerType.customer_type : 'Unknown';
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Industry Type Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Industry Type</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="customer_type" className="form-label">
                        <i class="bi bi-buildings-fill"></i>
                        Customer Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="customer_type"
                        name="customer_type"
                        className={`form-select ${errors.customer_type ? 'is-invalid' : ''}`}
                        value={formData.customer_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Customer Type</option>
                        {loadingCustomerTypes ? (
                          <option value="" disabled>Loading customer types...</option>
                        ) : (
                          customerTypes.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.customer_type}
                            </option>
                          ))
                        )}
                      </select>
                      {errors.customer_type && (
                        <div className="invalid-feedback">{errors.customer_type}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="industry_name" className="form-label">
                        <i class="bi bi-buildings-fill"></i>
                        Industry Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.industry_name ? 'is-invalid' : ''}`}
                        name="industry_name"
                        id="industry_name"
                        placeholder="Enter industry name"
                        value={formData.industry_name}
                        onChange={handleInputChange}
                      />
                      {errors.industry_name && (
                        <div className="invalid-feedback">{errors.industry_name}</div>
                      )}
                      <div className="form-text">
                        Enter the industry name (2-100 characters)
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-primary me-2"
                        disabled={submitting || loadingCustomerTypes}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : 'Add Industry Type'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ customer_type: '', industry_name: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Industry Types List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Industry Type List</h5>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={fetchIndustryTypes}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading industry types...</p>
                  </div>
                ) : industryTypes.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No industry types found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Customer Type</th>
                          <th>Industry Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {industryTypes.map((industry, index) => (
                          <tr key={industry.id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-info">
                                {getCustomerTypeName(industry.customer_type)}
                              </span>
                            </td>
                            <td>
                              <strong>{industry.industry_name}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${industry.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(industry)}
                                title="Click to toggle status"
                              >
                                {industry.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(industry)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(industry.id)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!loading && industryTypes.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {industryTypes.length} industry types
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Industry Type</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Customer Type <span className="text-danger">*</span></label>
                    <select
                      name="customer_type"
                      className={`form-select ${errors.customer_type ? 'is-invalid' : ''}`}
                      value={editFormData.customer_type}
                      onChange={handleEditInputChange}
                      disabled={editing}
                    >
                      <option value="">Select Customer Type</option>
                      {customerTypes.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.customer_type}
                        </option>
                      ))}
                    </select>
                    {errors.customer_type && (
                      <div className="invalid-feedback d-block">{errors.customer_type}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Industry Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.industry_name ? 'is-invalid' : ''}`}
                      name="industry_name"
                      value={editFormData.industry_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter industry name"
                      disabled={editing}
                    />
                    {errors.industry_name && (
                      <div className="invalid-feedback d-block">{errors.industry_name}</div>
                    )}
                    <div className="form-text">
                      Enter the industry name (2-100 characters)
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                      disabled={editing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={editing}
                    >
                      {editing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bootstrap Icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
      />
    </>
  );
};

export default IndustryType;