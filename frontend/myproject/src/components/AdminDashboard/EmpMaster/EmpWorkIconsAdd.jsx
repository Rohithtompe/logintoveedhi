import React, { useState, useEffect } from 'react';
import api from '../../../api';

const EmpWorkIconsAdd = () => {
  const [workIcons, setWorkIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    icon_name: '',
    icon_url: '',
    icon_description: '',
    username: '',
    password: '',
    icon_image: null
  });

  // Fetch existing work icons
  const fetchWorkIcons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/work-icon/');
      setWorkIcons(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch work icons. Please try again.');
      console.error('Error fetching work icons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkIcons();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      icon_image: e.target.files[0]
    });
  };

  // Handle form submission for both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('icon_name', formData.icon_name);
      submitData.append('icon_url', formData.icon_url);
      submitData.append('icon_description', formData.icon_description);
      submitData.append('username', formData.username);
      submitData.append('password', formData.password);
      
      if (formData.icon_image) {
        submitData.append('icon_image', formData.icon_image);
      }

      let response;
      
      if (isEditing && editingId) {
        // Update existing work icon
        response = await api.put(`/work-icon/${editingId}/`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        setSuccess('Work icon updated successfully!');
      } else {
        // Create new work icon
        response = await api.post('/work-icon/', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        setSuccess('Work icon added successfully!');
      }

      // Reset form and state
      resetForm();
      
      // Refresh the list
      fetchWorkIcons();

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          'Failed to process work icon. Please try again.';
      setError(errorMessage);
      console.error('Error processing work icon:', err);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      icon_name: '',
      icon_url: '',
      icon_description: '',
      username: '',
      password: '',
      icon_image: null
    });
    setIsEditing(false);
    setEditingId(null);
    
    // Clear file input
    const fileInput = document.getElementById('icon_image');
    if (fileInput) fileInput.value = '';
  };

  // Handle delete with proper error handling
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work icon?')) {
      return;
    }

    try {
      await api.delete(`/work-icon/${id}/`);
      setSuccess('Work icon deleted successfully!');
      fetchWorkIcons();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          'Failed to delete work icon. Please try again.';
      setError(errorMessage);
      console.error('Error deleting work icon:', err);
    }
  };

  // Handle edit - prefills form and sets edit mode
  const handleEdit = (icon) => {
    setFormData({
      icon_name: icon.icon_name,
      icon_url: icon.icon_url || '',
      icon_description: icon.icon_description || '',
      username: icon.username,
      password: icon.password,
      icon_image: null // File cannot be pre-filled
    });
    
    setIsEditing(true);
    setEditingId(icon.id);
    
    // Scroll to form and focus
    document.getElementById('icon_name').focus();
  };

  // Cancel edit mode
  const cancelEdit = () => {
    resetForm();
    setSuccess('Edit cancelled.');
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Work Icon Management</h2>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Add/Edit Work Icon Form */}
      <div className="card mb-4">
        <div className={`card-header ${isEditing ? 'bg-warning text-dark' : 'bg-success text-dark'}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              {isEditing ? `Edit Work Icon: ${formData.icon_name}` : 'Add New Work Icon'}
            </h4>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-sm btn-outline-light"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="icon_name" className="form-label">
                  <i class="bi bi-person"></i>
                  Icon Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="icon_name"
                  name="icon_name"
                  value={formData.icon_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter icon name"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="icon_url" className="form-label">
                  <i class="bi bi-link"></i>
                  Icon URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="icon_url"
                  name="icon_url"
                  value={formData.icon_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="col-12 mb-3">
                <label htmlFor="icon_description" className="form-label">
                  <i class="bi bi-card-text"></i>
                  Icon Description
                </label>
                <textarea
                  className="form-control"
                  id="icon_description"
                  name="icon_description"
                  rows="3"
                  value={formData.icon_description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                ></textarea>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="username" className="form-label">
                  <i class="bi bi-person-circle"></i>
                  Username *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="password" className="form-label">
                  <i class="bi bi-shield-lock"></i>
                  Password *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                />
              </div>

              <div className="col-12 mb-4">
                <label htmlFor="icon_image" className="form-label">
                  <i class="bi bi-card-image"></i>
                  Icon Image {isEditing && <small className="text-muted">(Leave empty to keep current image)</small>}
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="icon_image"
                  name="icon_image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <small className="text-muted">
                  Upload an image file (JPG, PNG, GIF, etc.)
                </small>
              </div>

              <div className="col-12">
                <button 
                  type="submit" 
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Update Work Icon' : 'Add Work Icon'
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary ms-2"
                  onClick={resetForm}
                  disabled={loading}
                >
                  {isEditing ? 'Cancel & Clear' : 'Clear Form'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Work Icons List Table */}
      <div className="card">
        <div className="card-header bg-primary text-dark d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Work Icon List</h4>
          <div>
            <button 
              className="btn btn-sm btn-light me-2"
              onClick={fetchWorkIcons}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <span className="badge bg-light text-dark">
              Total: {workIcons.length} icons
            </span>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : workIcons.length === 0 ? (
            <div className="text-center text-muted">
              No work icons found. Add your first work icon above.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Icon Name</th>
                    <th>UserName</th>
                    <th>Password</th>
                    <th>Icon Description</th>
                    <th>Icon Image</th>
                    <th>Icon URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workIcons.map((icon, index) => (
                    <tr key={icon.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{icon.icon_name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">{icon.username}</span>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {icon.password}
                        </span>
                      </td>
                      <td>
                        {icon.icon_description ? (
                          <small>{icon.icon_description}</small>
                        ) : (
                          <span className="text-muted">No description</span>
                        )}
                      </td>
                      <td>
                        {icon.icon_image ? (
                          <img 
                            src={icon.icon_image} 
                            alt={icon.icon_name}
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                            className="border rounded"
                            title={icon.icon_name}
                          />
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>
                      <td>
                        {icon.icon_url ? (
                          <a 
                            href={icon.icon_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                            title={icon.icon_url}
                          >
                            <i className="bi bi-link-45deg"></i> Link
                          </a>
                        ) : (
                          <span className="text-muted">No URL</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(icon)}
                          title="Edit"
                          disabled={isEditing && editingId === icon.id}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(icon.id)}
                          title="Delete"
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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
  );
};

export default EmpWorkIconsAdd;