import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerType = () => {
  const [formData, setFormData] = useState({
    customer_type: '' // Changed to match Django model
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    customer_type: '' // Changed to match Django model
  });
  
  const [customerTypes, setCustomerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const fetchCustomerTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('customer-type/');
      console.log('Customer types GET response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter active records
        const activeCustomerTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setCustomerTypes(activeCustomerTypes);
      }
    } catch (error) {
      console.error('Error fetching customer types:', error);
      toast.error('Failed to load customer types');
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
    
    // Clear error for this field if user starts typing
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
    
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    // Field name changed to customer_type
    if (!data.customer_type?.trim()) {
      newErrors.customer_type = 'Customer Type is required';
    } else if (data.customer_type.trim().length < 2) {
      newErrors.customer_type = 'Customer Type must be at least 2 characters';
    } else if (data.customer_type.trim().length > 100) {
      newErrors.customer_type = 'Customer Type must be less than 100 characters';
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
      
      // Check if customer type already exists
      const existingCustomerType = customerTypes.find(
        ct => ct.customer_type.toLowerCase() === formData.customer_type.trim().toLowerCase() &&
              (ct.status === true || ct.status === 1)
      );
      
      if (existingCustomerType) {
        toast.error('Customer Type already exists');
        return;
      }
      
      // Create new customer type - field name must match Django model (customer_type)
      const payload = {
        customer_type: formData.customer_type.trim(), // This must match Django model field name
        status: true // Active by default
      };
      
      console.log('Creating customer type with payload:', payload);
      const response = await api.post('customer-type/', payload);
      console.log('Create response:', response.data);
      
      toast.success('Customer Type Added Successfully');
      setFormData({ customer_type: '' });
      fetchCustomerTypes();
      
    } catch (error) {
      console.error('Error adding customer type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        // Check for customer_type field errors
        if (errorData.customer_type) {
          const errorMsg = Array.isArray(errorData.customer_type) 
            ? errorData.customer_type[0] 
            : errorData.customer_type;
          toast.error(`Customer Type: ${errorMsg}`);
        } 
        // Check for other common field errors
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          // Show the first error if available
          const firstErrorKey = Object.keys(errorData)[0];
          if (firstErrorKey) {
            const firstError = Array.isArray(errorData[firstErrorKey]) 
              ? errorData[firstErrorKey][0] 
              : errorData[firstErrorKey];
            toast.error(`${firstErrorKey}: ${firstError}`);
          } else {
            toast.error('Failed to add customer type');
          }
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customerType) => {
    setEditFormData({
      id: customerType.id,
      customer_type: customerType.customer_type // Field name changed
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
      
      // Check if customer type already exists (excluding current one)
      const existingCustomerType = customerTypes.find(
        ct => ct.id !== editFormData.id &&
              ct.customer_type.toLowerCase() === editFormData.customer_type.trim().toLowerCase() &&
              (ct.status === true || ct.status === 1)
      );
      
      if (existingCustomerType) {
        toast.error('Customer Type already exists');
        return;
      }
      
      const payload = {
        customer_type: editFormData.customer_type.trim() // Field name changed
      };
      
      console.log('Updating customer type with payload:', payload);
      const response = await api.put(`customer-type/${editFormData.id}/`, payload);
      console.log('Update response:', response.data);
      
      toast.success('Customer Type Updated Successfully');
      setShowEditModal(false);
      fetchCustomerTypes();
      
    } catch (error) {
      console.error('Error updating customer type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.customer_type) {
          const errorMsg = Array.isArray(errorData.customer_type) 
            ? errorData.customer_type[0] 
            : errorData.customer_type;
          toast.error(`Customer Type: ${errorMsg}`);
        } else {
          toast.error('Failed to update customer type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer type?')) {
      return;
    }
    
    try {
      await api.delete(`customer-type/${id}/`);
      toast.success('Customer type deleted successfully');
      fetchCustomerTypes();
    } catch (error) {
      console.error('Error deleting customer type:', error);
      toast.error('Failed to delete customer type');
    }
  };

  const handleStatusToggle = async (customerType) => {
    try {
      const newStatus = !customerType.status;
      await api.patch(`customer-type/${customerType.id}/`, { status: newStatus });
      toast.success(`Customer type ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCustomerTypes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter customer types based on search term
  const filteredCustomerTypes = customerTypes.filter(customerType => {
    if (!searchTerm.trim()) return true;
    
    const typeName = customerType.customer_type?.toLowerCase() || '';
    return typeName.includes(searchTerm.toLowerCase());
  });

  // Sort customer types alphabetically
  const sortedCustomerTypes = [...filteredCustomerTypes].sort((a, b) => 
    a.customer_type.localeCompare(b.customer_type)
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Customer Type Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Customer Type</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="customer_type" className="form-label">
                        <i class="bi bi-shop"></i>
                        Customer Type <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.customer_type ? 'is-invalid' : ''}`}
                        id="customer_type"
                        name="customer_type" // Changed to match Django model
                        placeholder="Enter customer type"
                        value={formData.customer_type} // Changed to match Django model
                        onChange={handleInputChange}
                      />
                      {errors.customer_type && (
                        <div className="invalid-feedback">{errors.customer_type}</div>
                      )}
                      <div className="form-text">
                        Enter the customer type (e.g., "Individual", "Corporate", "VIP")
                      </div>
                    </div>
                    
                    <div className="col-md-4 mb-3 d-flex align-items-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : 'Add Customer Type'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ customer_type: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Customer Types List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Customer Type List</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search customer type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchCustomerTypes}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading customer types...</p>
                  </div>
                ) : sortedCustomerTypes.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No customer types found matching your search' : 'No customer types found'}
                    </p>
                    {customerTypes.length > 0 && searchTerm && (
                      <button 
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Customer Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedCustomerTypes.map((customerType, index) => (
                          <tr key={customerType.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{customerType.customer_type}</strong> {/* Field name changed */}
                            </td>
                            <td>
                              <span 
                                className={`badge ${customerType.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(customerType)}
                                title="Click to toggle status"
                              >
                                {customerType.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(customerType)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(customerType.id)}
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
                
                {!loading && sortedCustomerTypes.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedCustomerTypes.length} of {customerTypes.length} customer types
                    {searchTerm && ` (filtered)`}
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
                <h5 className="modal-title">Edit Customer Type</h5>
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
                    <input
                      type="text"
                      className={`form-control ${errors.customer_type ? 'is-invalid' : ''}`}
                      name="customer_type" // Changed to match Django model
                      value={editFormData.customer_type} // Changed to match Django model
                      onChange={handleEditInputChange}
                      placeholder="Enter customer type"
                      disabled={editing}
                    />
                    {errors.customer_type && (
                      <div className="invalid-feedback d-block">{errors.customer_type}</div>
                    )}
                    <div className="form-text">
                      Enter the customer type (e.g., "Individual", "Corporate", "VIP")
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

export default CustomerType;