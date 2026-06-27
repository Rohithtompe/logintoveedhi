import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Age = () => {
  const [formData, setFormData] = useState({
    individual_age: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    individual_age: ''
  });
  
  const [ages, setAges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAges();
  }, []);

  const fetchAges = async () => {
    try {
      setLoading(true);
      const response = await api.get('health-insurance-age/'); // Changed endpoint
      console.log('Ages response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const activeAges = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        
        // Sort ages as strings, but try to sort numerically if possible
        activeAges.sort((a, b) => {
          const ageA = parseInt(a.individual_age) || 0;
          const ageB = parseInt(b.individual_age) || 0;
          return ageA - ageB;
        });
        
        setAges(activeAges);
      }
    } catch (error) {
      console.error('Error fetching ages:', error);
      toast.error('Failed to load ages');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Since individual_age is CharField, we'll store as string but validate as number
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
    
    if (!data.individual_age?.trim()) {
      newErrors.individual_age = 'Age is required';
    } else {
      // Try to parse as number for validation
      const ageNum = parseInt(data.individual_age.trim());
      if (isNaN(ageNum)) {
        newErrors.individual_age = 'Age must be a valid number';
      } else if (ageNum < 1) {
        newErrors.individual_age = 'Age must be 1 or above';
      } else if (ageNum > 120) {
        newErrors.individual_age = 'Age must be 120 or below';
      }
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
      
      // Check if age already exists
      const existingAge = ages.find(
        age => age.individual_age === formData.individual_age.trim() &&
              (age.status === true || age.status === 1)
      );
      
      if (existingAge) {
        toast.error('Age already exists');
        return;
      }
      
      // Create new age - individual_age is CharField in Django
      const payload = {
        individual_age: formData.individual_age.trim(), // Store as string
        status: true // Active by default
      };
      
      console.log('Creating age with payload:', payload);
      const response = await api.post('health-insurance-age/', payload); // Changed endpoint
      console.log('Create response:', response.data);
      
      toast.success('Age Added Successfully');
      setFormData({ individual_age: '' });
      fetchAges();
      
    } catch (error) {
      console.error('Error adding age:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        if (errorData.individual_age) {
          const errorMsg = Array.isArray(errorData.individual_age) 
            ? errorData.individual_age[0] 
            : errorData.individual_age;
          toast.error(`Age: ${errorMsg}`);
        } 
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add age');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (age) => {
    setEditFormData({
      id: age.id,
      individual_age: age.individual_age
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
      
      // Check if age already exists (excluding current one)
      const existingAge = ages.find(
        age => age.id !== editFormData.id &&
              age.individual_age === editFormData.individual_age.trim() &&
              (age.status === true || age.status === 1)
      );
      
      if (existingAge) {
        toast.error('Age already exists');
        return;
      }
      
      const payload = {
        individual_age: editFormData.individual_age.trim()
      };
      
      console.log('Updating age with payload:', payload);
      const response = await api.put(`health-insurance-age/${editFormData.id}/`, payload); // Changed endpoint
      console.log('Update response:', response.data);
      
      toast.success('Age Updated Successfully');
      setShowEditModal(false);
      fetchAges();
      
    } catch (error) {
      console.error('Error updating age:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.individual_age) {
          const errorMsg = Array.isArray(errorData.individual_age) 
            ? errorData.individual_age[0] 
            : errorData.individual_age;
          toast.error(`Age: ${errorMsg}`);
        } else {
          toast.error('Failed to update age');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this age?')) {
      return;
    }
    
    try {
      await api.delete(`health-insurance-age/${id}/`); // Changed endpoint
      toast.success('Age deleted successfully');
      fetchAges();
    } catch (error) {
      console.error('Error deleting age:', error);
      toast.error('Failed to delete age');
    }
  };

  const handleStatusToggle = async (age) => {
    try {
      const newStatus = !age.status;
      await api.patch(`health-insurance-age/${age.id}/`, { status: newStatus }); // Changed endpoint
      toast.success(`Age ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAges();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter ages based on search term
  const filteredAges = ages.filter(age => {
    if (!searchTerm.trim()) return true;
    
    const ageValue = age.individual_age?.toLowerCase() || '';
    return ageValue.includes(searchTerm.toLowerCase());
  });

  // Sort ages numerically
  const sortedAges = [...filteredAges].sort((a, b) => {
    const ageA = parseInt(a.individual_age) || 0;
    const ageB = parseInt(b.individual_age) || 0;
    return ageA - ageB;
  });

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Age Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Insurance Age</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="individual_age" className="form-label">
                        <i class="bi bi-backpack2"></i>
                        Age <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text" // Changed to text since Django model is CharField
                        className={`form-control ${errors.individual_age ? 'is-invalid' : ''}`}
                        id="individual_age"
                        name="individual_age"
                        placeholder="Enter age (e.g., 25, 30, 35+)"
                        value={formData.individual_age}
                        onChange={handleInputChange}
                        pattern="[0-9+]*" // Allow numbers and plus sign
                      />
                      {errors.individual_age && (
                        <div className="invalid-feedback">{errors.individual_age}</div>
                      )}
                      <div className="form-text">
                        Enter age as a number (1-120) or range (e.g., "25", "30+", "18-25")
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
                        ) : 'Add Age'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ individual_age: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Age List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Insurance Age List</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search age..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchAges}
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
                    <p className="mt-2">Loading ages...</p>
                  </div>
                ) : sortedAges.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No ages found matching your search' : 'No ages found'}
                    </p>
                    {ages.length > 0 && searchTerm && (
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
                          <th>Age</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedAges.map((age, index) => (
                          <tr key={age.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{age.individual_age}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${age.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(age)}
                                title="Click to toggle status"
                              >
                                {age.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(age)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(age.id)}
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
                
                {!loading && sortedAges.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedAges.length} of {ages.length} ages
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
                <h5 className="modal-title">Edit Insurance Age</h5>
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
                    <label className="form-label">Age <span className="text-danger">*</span></label>
                    <input
                      type="text" // Changed to text since Django model is CharField
                      className={`form-control ${errors.individual_age ? 'is-invalid' : ''}`}
                      name="individual_age"
                      value={editFormData.individual_age}
                      onChange={handleEditInputChange}
                      placeholder="Enter age (e.g., 25, 30, 35+)"
                      disabled={editing}
                      pattern="[0-9+]*"
                    />
                    {errors.individual_age && (
                      <div className="invalid-feedback d-block">{errors.individual_age}</div>
                    )}
                    <div className="form-text">
                      Enter age as a number (1-120) or range (e.g., "25", "30+", "18-25")
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

export default Age;