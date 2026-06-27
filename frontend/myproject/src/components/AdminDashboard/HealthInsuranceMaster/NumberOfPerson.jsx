import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NumberOfPerson = () => {
  const [formData, setFormData] = useState({
    no_person: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    no_person: ''
  });
  
  const [personsList, setPersonsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await api.get('number-of-person/'); // Changed endpoint
      console.log('Number of persons response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const activePersons = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        
        // Try to sort numerically if possible, otherwise sort as strings
        activePersons.sort((a, b) => {
          const numA = parseInt(a.no_person) || 0;
          const numB = parseInt(b.no_person) || 0;
          if (numA !== 0 && numB !== 0) {
            return numA - numB;
          }
          return (a.no_person || '').localeCompare(b.no_person || '');
        });
        
        setPersonsList(activePersons);
      }
    } catch (error) {
      console.error('Error fetching number of persons:', error);
      toast.error('Failed to load number of persons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Since no_person is CharField, we'll store as string but validate as number
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
    
    if (!data.no_person?.trim()) {
      newErrors.no_person = 'Number of persons is required';
    } else {
      // Try to parse as number for validation
      const num = parseInt(data.no_person.trim());
      if (isNaN(num)) {
        newErrors.no_person = 'Number of persons must be a valid number';
      } else if (num < 1) {
        newErrors.no_person = 'Number of persons must be 1 or more';
      } else if (num > 100) {
        newErrors.no_person = 'Number of persons must be 100 or less';
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
      
      // Check if number of persons already exists
      const existingPerson = personsList.find(
        person => person.no_person === formData.no_person.trim() &&
                (person.status === true || person.status === 1)
      );
      
      if (existingPerson) {
        toast.error('Number of persons already exists');
        return;
      }
      
      // Create new number of persons - no_person is CharField in Django
      const payload = {
        no_person: formData.no_person.trim(), // Store as string
        status: true // Active by default
      };
      
      console.log('Creating number of persons with payload:', payload);
      const response = await api.post('number-of-person/', payload); // Changed endpoint
      console.log('Create response:', response.data);
      
      toast.success('Number of Persons Added Successfully');
      setFormData({ no_person: '' });
      fetchPersons();
      
    } catch (error) {
      console.error('Error adding number of persons:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        if (errorData.no_person) {
          const errorMsg = Array.isArray(errorData.no_person) 
            ? errorData.no_person[0] 
            : errorData.no_person;
          toast.error(`Number of Persons: ${errorMsg}`);
        } 
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add number of persons');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (person) => {
    setEditFormData({
      id: person.id,
      no_person: person.no_person
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
      
      // Check if number of persons already exists (excluding current one)
      const existingPerson = personsList.find(
        person => person.id !== editFormData.id &&
                person.no_person === editFormData.no_person.trim() &&
                (person.status === true || person.status === 1)
      );
      
      if (existingPerson) {
        toast.error('Number of persons already exists');
        return;
      }
      
      const payload = {
        no_person: editFormData.no_person.trim()
      };
      
      console.log('Updating number of persons with payload:', payload);
      const response = await api.put(`number-of-person/${editFormData.id}/`, payload); // Changed endpoint
      console.log('Update response:', response.data);
      
      toast.success('Number of Persons Updated Successfully');
      setShowEditModal(false);
      fetchPersons();
      
    } catch (error) {
      console.error('Error updating number of persons:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.no_person) {
          const errorMsg = Array.isArray(errorData.no_person) 
            ? errorData.no_person[0] 
            : errorData.no_person;
          toast.error(`Number of Persons: ${errorMsg}`);
        } else {
          toast.error('Failed to update number of persons');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      await api.delete(`number-of-person/${id}/`); // Changed endpoint
      toast.success('Number of persons deleted successfully');
      fetchPersons();
    } catch (error) {
      console.error('Error deleting number of persons:', error);
      toast.error('Failed to delete number of persons');
    }
  };

  const handleStatusToggle = async (person) => {
    try {
      const newStatus = !person.status;
      await api.patch(`number-of-person/${person.id}/`, { status: newStatus }); // Changed endpoint
      toast.success(`Number of persons ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPersons();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter persons based on search term
  const filteredPersons = personsList.filter(person => {
    if (!searchTerm.trim()) return true;
    
    const personCount = person.no_person?.toLowerCase() || '';
    return personCount.includes(searchTerm.toLowerCase());
  });

  // Sort persons numerically
  const sortedPersons = [...filteredPersons].sort((a, b) => {
    const numA = parseInt(a.no_person) || 0;
    const numB = parseInt(b.no_person) || 0;
    if (numA !== 0 && numB !== 0) {
      return numA - numB;
    }
    return (a.no_person || '').localeCompare(b.no_person || '');
  });

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Number of Persons Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Number of Persons</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="no_person" className="form-label">
                        <i class="bi bi-list-ol"></i>
                        Number of Persons <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text" // Changed to text since Django model is CharField
                        className={`form-control ${errors.no_person ? 'is-invalid' : ''}`}
                        id="no_person"
                        name="no_person"
                        placeholder="Enter number of persons (e.g., 1, 2, 3, 4)"
                        value={formData.no_person}
                        onChange={handleInputChange}
                        pattern="[0-9]*" // Only allow numbers
                      />
                      {errors.no_person && (
                        <div className="invalid-feedback">{errors.no_person}</div>
                      )}
                      <div className="form-text">
                        Enter the number of persons (1-100)
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
                        ) : 'Add Number of Persons'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ no_person: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Number of Persons List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Number of Persons List</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchPersons}
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
                    <p className="mt-2">Loading number of persons...</p>
                  </div>
                ) : sortedPersons.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No entries found matching your search' : 'No number of persons found'}
                    </p>
                    {personsList.length > 0 && searchTerm && (
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
                          <th>Number of Persons</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedPersons.map((person, index) => (
                          <tr key={person.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{person.no_person}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${person.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(person)}
                                title="Click to toggle status"
                              >
                                {person.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(person)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(person.id)}
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
                
                {!loading && sortedPersons.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedPersons.length} of {personsList.length} entries
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
                <h5 className="modal-title">Edit Number of Persons</h5>
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
                    <label className="form-label">Number of Persons <span className="text-danger">*</span></label>
                    <input
                      type="text" // Changed to text since Django model is CharField
                      className={`form-control ${errors.no_person ? 'is-invalid' : ''}`}
                      name="no_person"
                      value={editFormData.no_person}
                      onChange={handleEditInputChange}
                      placeholder="Enter number of persons (e.g., 1, 2, 3, 4)"
                      disabled={editing}
                      pattern="[0-9]*"
                    />
                    {errors.no_person && (
                      <div className="invalid-feedback d-block">{errors.no_person}</div>
                    )}
                    <div className="form-text">
                      Enter the number of persons (1-100)
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

export default NumberOfPerson;