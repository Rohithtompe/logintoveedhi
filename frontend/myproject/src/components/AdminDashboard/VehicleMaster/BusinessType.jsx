import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessType = () => {
  const [formData, setFormData] = useState({
    customer_type: '', // This should be customer_type ID
    industry_name: '', // This should be industry_name ID (but field name is confusing - should be industry_type)
    business_name: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    customer_type: '',
    industry_name: '', // This should be industry_name ID
    business_name: ''
  });
  
  const [customerTypes, setCustomerTypes] = useState([]);
  const [industryTypes, setIndustryTypes] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [filteredIndustryTypes, setFilteredIndustryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCustomerTypes, setLoadingCustomerTypes] = useState(true);
  const [loadingIndustryTypes, setLoadingIndustryTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCustomerTypes();
    fetchIndustryTypes();
    fetchBusinessTypes();
  }, []);

  const fetchCustomerTypes = async () => {
    try {
      setLoadingCustomerTypes(true);
      const response = await api.get('customer-type/'); // Changed endpoint
      if (response.data && Array.isArray(response.data)) {
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
      setLoadingIndustryTypes(true);
      const response = await api.get('industry-type/'); // Changed endpoint
      if (response.data && Array.isArray(response.data)) {
        const activeIndustryTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setIndustryTypes(activeIndustryTypes);
      }
    } catch (error) {
      console.error('Error fetching industry types:', error);
      toast.error('Failed to load industry types');
    } finally {
      setLoadingIndustryTypes(false);
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('business-type/'); // Changed endpoint
      console.log('Business types response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const activeBusinessTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setBusinessTypes(activeBusinessTypes);
      }
    } catch (error) {
      console.error('Error fetching business types:', error);
      toast.error('Failed to load business types');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerTypeChange = (customerId) => {
    setFormData({
      ...formData,
      customer_type: customerId,
      industry_name: '' // Reset industry when customer changes
    });
    
    if (customerId) {
      // Filter industry types based on selected customer type
      const filtered = industryTypes.filter(item => 
        item.customer_type && item.customer_type.toString() === customerId.toString()
      );
      setFilteredIndustryTypes(filtered);
    } else {
      setFilteredIndustryTypes([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'customer_type') {
      handleCustomerTypeChange(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'customer_type') {
      setEditFormData({
        ...editFormData,
        [name]: value,
        industry_name: '' // Reset industry when customer changes in edit
      });
      
      // Filter industry types for edit
      if (value) {
        const filtered = industryTypes.filter(item => 
          item.customer_type && item.customer_type.toString() === value.toString()
        );
        setFilteredIndustryTypes(filtered);
      } else {
        setFilteredIndustryTypes([]);
      }
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
    
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
    
    if (!data.industry_name) {
      newErrors.industry_name = 'Industry Type is required';
    }
    
    if (!data.business_name?.trim()) {
      newErrors.business_name = 'Business Name is required';
    } else if (data.business_name.trim().length < 2) {
      newErrors.business_name = 'Business Name must be at least 2 characters';
    } else if (data.business_name.trim().length > 100) {
      newErrors.business_name = 'Business Name must be less than 100 characters';
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
      
      // Check if business type already exists for this combination
      const existingBusiness = businessTypes.find(
        business => 
          business.customer_type.toString() === formData.customer_type.toString() &&
          business.industry_name.toString() === formData.industry_name.toString() &&
          business.business_name.toLowerCase() === formData.business_name.trim().toLowerCase() &&
          (business.status === true || business.status === 1)
      );
      
      if (existingBusiness) {
        toast.error('Business Type already exists for this combination');
        return;
      }
      
      // Create new business type - payload must match Django model
      const payload = {
        customer_type: parseInt(formData.customer_type), // ForeignKey ID
        industry_name: parseInt(formData.industry_name), // ForeignKey ID (note: confusing field name - should be industry_type)
        business_name: formData.business_name.trim(),
        status: true // Active by default
      };
      
      console.log('Creating business type with payload:', payload);
      const response = await api.post('business-type/', payload);
      console.log('Create response:', response.data);
      
      toast.success('Business Type Added Successfully');
      setFormData({ customer_type: '', industry_name: '', business_name: '' });
      setFilteredIndustryTypes([]);
      fetchBusinessTypes();
      
    } catch (error) {
      console.error('Error adding business type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        if (errorData.business_name) {
          const errorMsg = Array.isArray(errorData.business_name) 
            ? errorData.business_name[0] 
            : errorData.business_name;
          toast.error(`Business Name: ${errorMsg}`);
        } 
        else if (errorData.customer_type) {
          const errorMsg = Array.isArray(errorData.customer_type) 
            ? errorData.customer_type[0] 
            : errorData.customer_type;
          toast.error(`Customer Type: ${errorMsg}`);
        }
        else if (errorData.industry_name) {
          const errorMsg = Array.isArray(errorData.industry_name) 
            ? errorData.industry_name[0] 
            : errorData.industry_name;
          toast.error(`Industry Type: ${errorMsg}`);
        }
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add business type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (business) => {
    setEditFormData({
      id: business.id,
      customer_type: business.customer_type ? business.customer_type.toString() : '',
      industry_name: business.industry_name ? business.industry_name.toString() : '',
      business_name: business.business_name
    });
    
    // Filter industry types for the selected customer
    if (business.customer_type) {
      const filtered = industryTypes.filter(item => 
        item.customer_type && item.customer_type.toString() === business.customer_type.toString()
      );
      setFilteredIndustryTypes(filtered);
    } else {
      setFilteredIndustryTypes([]);
    }
    
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editFormData)) {
      return;
    }
    
    try {
      setEditing(true);
      
      // Check if business type already exists (excluding current one)
      const existingBusiness = businessTypes.find(
        business => 
          business.id !== editFormData.id &&
          business.customer_type.toString() === editFormData.customer_type.toString() &&
          business.industry_name.toString() === editFormData.industry_name.toString() &&
          business.business_name.toLowerCase() === editFormData.business_name.trim().toLowerCase() &&
          (business.status === true || business.status === 1)
      );
      
      if (existingBusiness) {
        toast.error('Business Type already exists for this combination');
        return;
      }
      
      const payload = {
        customer_type: parseInt(editFormData.customer_type),
        industry_name: parseInt(editFormData.industry_name),
        business_name: editFormData.business_name.trim()
      };
      
      console.log('Updating business type with payload:', payload);
      const response = await api.put(`business-type/${editFormData.id}/`, payload);
      console.log('Update response:', response.data);
      
      toast.success('Business Type Updated Successfully');
      setShowEditModal(false);
      fetchBusinessTypes();
      
    } catch (error) {
      console.error('Error updating business type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.business_name) {
          const errorMsg = Array.isArray(errorData.business_name) 
            ? errorData.business_name[0] 
            : errorData.business_name;
          toast.error(`Business Name: ${errorMsg}`);
        } else {
          toast.error('Failed to update business type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business type?')) {
      return;
    }
    
    try {
      await api.delete(`business-type/${id}/`);
      toast.success('Business Type deleted successfully');
      fetchBusinessTypes();
    } catch (error) {
      console.error('Error deleting business type:', error);
      toast.error('Failed to delete business type');
    }
  };

  const handleStatusToggle = async (business) => {
    try {
      const newStatus = !business.status;
      await api.patch(`business-type/${business.id}/`, { status: newStatus });
      toast.success(`Business type ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchBusinessTypes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Helper functions
  const getCustomerTypeName = (customerTypeId) => {
    const customerType = customerTypes.find(item => 
      item.id && item.id.toString() === customerTypeId.toString()
    );
    return customerType ? customerType.customer_type : 'Unknown';
  };

  const getIndustryTypeName = (industryTypeId) => {
    const industryType = industryTypes.find(item => 
      item.id && item.id.toString() === industryTypeId.toString()
    );
    return industryType ? industryType.industry_name : 'Unknown';
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Business Type Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Business Type</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="customer_type" className="form-label">
                        <i class="bi bi-building"></i>
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
                    
                    <div className="col-md-4 mb-3">
                      <label htmlFor="industry_name" className="form-label">
                        <i class="bi bi-buildings"></i>
                        Industry Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="industry_name"
                        name="industry_name"
                        className={`form-select ${errors.industry_name ? 'is-invalid' : ''}`}
                        value={formData.industry_name}
                        onChange={handleInputChange}
                        disabled={!formData.customer_type}
                      >
                        <option value="">Select Industry Type</option>
                        {filteredIndustryTypes.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.industry_name}
                          </option>
                        ))}
                      </select>
                      {errors.industry_name && (
                        <div className="invalid-feedback">{errors.industry_name}</div>
                      )}
                      {formData.customer_type && filteredIndustryTypes.length === 0 && (
                        <div className="form-text text-warning">
                          No industry types found for selected customer type
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label htmlFor="business_name" className="form-label">
                        <i class="bi bi-briefcase-fill"></i>
                        Business Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.business_name ? 'is-invalid' : ''}`}
                        name="business_name"
                        id="business_name"
                        placeholder="Enter business name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                      />
                      {errors.business_name && (
                        <div className="invalid-feedback">{errors.business_name}</div>
                      )}
                      <div className="form-text">
                        Enter the business name (2-100 characters)
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-primary me-2"
                        disabled={submitting || loadingCustomerTypes || loadingIndustryTypes}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : 'Add Business Type'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setFormData({ customer_type: '', industry_name: '', business_name: '' });
                          setFilteredIndustryTypes([]);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Business Types List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Business Type List</h5>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={fetchBusinessTypes}
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
                    <p className="mt-2">Loading business types...</p>
                  </div>
                ) : businessTypes.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No business types found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Customer Type</th>
                          <th>Industry Type</th>
                          <th>Business Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {businessTypes.map((business, index) => (
                          <tr key={business.id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-info">
                                {getCustomerTypeName(business.customer_type)}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-warning">
                                {getIndustryTypeName(business.industry_name)}
                              </span>
                            </td>
                            <td>
                              <strong>{business.business_name}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${business.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(business)}
                                title="Click to toggle status"
                              >
                                {business.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(business)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(business.id)}
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
                
                {!loading && businessTypes.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {businessTypes.length} business types
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Business Type</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
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
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Industry Type <span className="text-danger">*</span></label>
                      <select
                        name="industry_name"
                        className={`form-select ${errors.industry_name ? 'is-invalid' : ''}`}
                        value={editFormData.industry_name}
                        onChange={handleEditInputChange}
                        disabled={editing || !editFormData.customer_type}
                      >
                        <option value="">Select Industry Type</option>
                        {filteredIndustryTypes.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.industry_name}
                          </option>
                        ))}
                      </select>
                      {errors.industry_name && (
                        <div className="invalid-feedback d-block">{errors.industry_name}</div>
                      )}
                      {editFormData.customer_type && filteredIndustryTypes.length === 0 && (
                        <div className="form-text text-warning">
                          No industry types found for selected customer type
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Business Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.business_name ? 'is-invalid' : ''}`}
                      name="business_name"
                      value={editFormData.business_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter business name"
                      disabled={editing}
                    />
                    {errors.business_name && (
                      <div className="invalid-feedback d-block">{errors.business_name}</div>
                    )}
                    <div className="form-text">
                      Enter the business name (2-100 characters)
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

export default BusinessType;