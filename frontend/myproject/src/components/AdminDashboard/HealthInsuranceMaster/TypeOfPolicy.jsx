import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TypeOfPolicy = () => {
  const [formData, setFormData] = useState({
    policy_name: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    policy_name: ''
  });
  
  const [policyTypes, setPolicyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolicyTypes();
  }, []);

  const fetchPolicyTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('type-of-policy/'); // Changed endpoint
      console.log('Policy types response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const activePolicyTypes = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setPolicyTypes(activePolicyTypes);
      }
    } catch (error) {
      console.error('Error fetching policy types:', error);
      toast.error('Failed to load policy types');
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
    
    if (!data.policy_name?.trim()) {
      newErrors.policy_name = 'Policy Type is required';
    } else if (data.policy_name.trim().length < 2) {
      newErrors.policy_name = 'Policy Type must be at least 2 characters';
    } else if (data.policy_name.trim().length > 100) {
      newErrors.policy_name = 'Policy Type must be less than 100 characters';
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
      
      // Check if policy type already exists
      const existingPolicy = policyTypes.find(
        policy => policy.policy_name.toLowerCase() === formData.policy_name.trim().toLowerCase() &&
                (policy.status === true || policy.status === 1)
      );
      
      if (existingPolicy) {
        toast.error('Policy Type already exists');
        return;
      }
      
      // Create new policy type
      const payload = {
        policy_name: formData.policy_name.trim(),
        status: true // Active by default
      };
      
      console.log('Creating policy type with payload:', payload);
      const response = await api.post('type-of-policy/', payload); // Changed endpoint
      console.log('Create response:', response.data);
      
      toast.success('Policy Type Added Successfully');
      setFormData({ policy_name: '' });
      fetchPolicyTypes();
      
    } catch (error) {
      console.error('Error adding policy type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        if (errorData.policy_name) {
          const errorMsg = Array.isArray(errorData.policy_name) 
            ? errorData.policy_name[0] 
            : errorData.policy_name;
          toast.error(`Policy Type: ${errorMsg}`);
        } 
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add policy type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (policy) => {
    setEditFormData({
      id: policy.id,
      policy_name: policy.policy_name
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
      
      // Check if policy type already exists (excluding current one)
      const existingPolicy = policyTypes.find(
        policy => policy.id !== editFormData.id &&
                policy.policy_name.toLowerCase() === editFormData.policy_name.trim().toLowerCase() &&
                (policy.status === true || policy.status === 1)
      );
      
      if (existingPolicy) {
        toast.error('Policy Type already exists');
        return;
      }
      
      const payload = {
        policy_name: editFormData.policy_name.trim()
      };
      
      console.log('Updating policy type with payload:', payload);
      const response = await api.put(`type-of-policy/${editFormData.id}/`, payload); // Changed endpoint
      console.log('Update response:', response.data);
      
      toast.success('Policy Type Updated Successfully');
      setShowEditModal(false);
      fetchPolicyTypes();
      
    } catch (error) {
      console.error('Error updating policy type:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.policy_name) {
          const errorMsg = Array.isArray(errorData.policy_name) 
            ? errorData.policy_name[0] 
            : errorData.policy_name;
          toast.error(`Policy Type: ${errorMsg}`);
        } else {
          toast.error('Failed to update policy type');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy type?')) {
      return;
    }
    
    try {
      await api.delete(`type-of-policy/${id}/`); // Changed endpoint
      toast.success('Policy Type deleted successfully');
      fetchPolicyTypes();
    } catch (error) {
      console.error('Error deleting policy type:', error);
      toast.error('Failed to delete policy type');
    }
  };

  const handleStatusToggle = async (policy) => {
    try {
      const newStatus = !policy.status;
      await api.patch(`type-of-policy/${policy.id}/`, { status: newStatus }); // Changed endpoint
      toast.success(`Policy Type ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPolicyTypes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter policy types based on search term
  const filteredPolicyTypes = policyTypes.filter(policy => {
    if (!searchTerm.trim()) return true;
    
    const policyName = policy.policy_name?.toLowerCase() || '';
    return policyName.includes(searchTerm.toLowerCase());
  });

  // Sort policy types alphabetically
  const sortedPolicyTypes = [...filteredPolicyTypes].sort((a, b) => 
    a.policy_name.localeCompare(b.policy_name)
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Policy Type Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Policy Type</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="policy_name" className="form-label">
                        <i class="bi bi-window-dock"></i>
                        Policy Type <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.policy_name ? 'is-invalid' : ''}`}
                        id="policy_name"
                        name="policy_name"
                        placeholder="Enter policy type"
                        value={formData.policy_name}
                        onChange={handleInputChange}
                      />
                      {errors.policy_name && (
                        <div className="invalid-feedback">{errors.policy_name}</div>
                      )}
                      <div className="form-text">
                        Enter the policy type (e.g., "Individual", "Family", "Group")
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
                        ) : 'Add Policy Type'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ policy_name: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Policy Types List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Policy Type List</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search policy type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchPolicyTypes}
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
                    <p className="mt-2">Loading policy types...</p>
                  </div>
                ) : sortedPolicyTypes.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No policy types found matching your search' : 'No policy types found'}
                    </p>
                    {policyTypes.length > 0 && searchTerm && (
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
                          <th>Policy Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedPolicyTypes.map((policy, index) => (
                          <tr key={policy.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{policy.policy_name}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${policy.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(policy)}
                                title="Click to toggle status"
                              >
                                {policy.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(policy)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(policy.id)}
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
                
                {!loading && sortedPolicyTypes.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedPolicyTypes.length} of {policyTypes.length} policy types
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
                <h5 className="modal-title">Edit Policy Type</h5>
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
                    <label className="form-label">Policy Type <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.policy_name ? 'is-invalid' : ''}`}
                      name="policy_name"
                      value={editFormData.policy_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter policy type"
                      disabled={editing}
                    />
                    {errors.policy_name && (
                      <div className="invalid-feedback d-block">{errors.policy_name}</div>
                    )}
                    <div className="form-text">
                      Enter the policy type (e.g., "Individual", "Family", "Group")
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

export default TypeOfPolicy;