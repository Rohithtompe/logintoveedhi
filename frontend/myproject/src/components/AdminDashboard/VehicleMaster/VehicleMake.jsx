import React, { useState, useEffect } from 'react';
import api from '../../../api';

const VehicleMake = () => {
  // State for vehicle makes
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for form
  const [vehicalMake, setVehicalMake] = useState(''); // Note: field name is 'vehical_make' in API
  const [status, setStatus] = useState(true); // Boolean field
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // State for alerts
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch vehicle makes on component mount
  useEffect(() => {
    fetchVehicleMakes();
  }, []);

  // Function to fetch all vehicle makes
  const fetchVehicleMakes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicle-make/');
      setVehicleMakes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load vehicle makes. Please try again.');
      showAlert('danger', 'Failed to load vehicle makes.');
    } finally {
      setLoading(false);
    }
  };

  // Function to show alert messages
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!vehicalMake.trim()) {
      errors.vehicalMake = 'Vehicle make name is required';
    }
    
    // Status is boolean, so no validation needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const makeData = {
      vehical_make: vehicalMake.trim(), // Correct field name for API
      status: status // Boolean value
    };
    
    try {
      if (editingId) {
        // Update existing vehicle make
        await api.put(`/vehicle-make/${editingId}/`, makeData);
        showAlert('success', 'Vehicle make updated successfully!');
      } else {
        // Create new vehicle make
        await api.post('/vehicle-make/', makeData);
        showAlert('success', 'Vehicle make added successfully!');
      }
      
      // Reset form
      setVehicalMake('');
      setStatus(true);
      setEditingId(null);
      setFormErrors({});
      
      // Refresh the list
      fetchVehicleMakes();
      
    } catch (err) {
      console.error('API Error:', err.response?.data);
      
      // Handle different error response formats
      let errorMsg = 'Failed to save vehicle make. Please try again.';
      
      if (err.response?.data) {
        // Try to extract error message from different possible field names
        if (err.response.data.vehical_make) {
          errorMsg = `Vehicle make: ${err.response.data.vehical_make.join(' ')}`;
        } else if (err.response.data.vehical_make) {
          errorMsg = `Vehicle make: ${err.response.data.vehical_make.join(' ')}`;
        } else if (err.response.data.status) {
          errorMsg = `Status: ${err.response.data.status.join(' ')}`;
        } else if (err.response.data.non_field_errors) {
          errorMsg = err.response.data.non_field_errors.join(' ');
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
      }
      
      showAlert('danger', errorMsg);
    }
  };

  // Handle edit action
  const handleEdit = (make) => {
    setVehicalMake(make.vehical_make); // Use the correct field name
    setStatus(make.status);
    setEditingId(make.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle make?')) {
      return;
    }
    
    try {
      await api.delete(`/vehicle-make/${id}/`);
      showAlert('success', 'Vehicle make deleted successfully!');
      fetchVehicleMakes();
    } catch (err) {
      showAlert('danger', 'Failed to delete vehicle make. Please try again.');
    }
  };

  // Handle form reset
  const handleReset = () => {
    setVehicalMake('');
    setStatus(true);
    setEditingId(null);
    setFormErrors({});
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Vehicle Make Management</h1>
      
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })}></button>
        </div>
      )}
      
      {/* Add/Edit Vehicle Make Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">{editingId ? 'Edit Vehicle Make' : 'Add New Vehicle Make'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="vehicalMake" className="form-label">
                  <i class="bi bi-truck"></i>
                  Vehicle Make Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.vehicalMake ? 'is-invalid' : ''}`}
                  id="vehicalMake"
                  value={vehicalMake}
                  onChange={(e) => setVehicalMake(e.target.value)}
                  placeholder="Enter vehicle make name"
                />
                {formErrors.vehicalMake && (
                  <div className="invalid-feedback">{formErrors.vehicalMake}</div>
                )}
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="status" className="form-label">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${formErrors.status ? 'is-invalid' : ''}`}
                  id="status"
                  value={status ? 'true' : 'false'}
                  onChange={(e) => setStatus(e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <small className="form-text text-muted">Must be a valid boolean.</small>
                {formErrors.status && (
                  <div className="invalid-feedback">{formErrors.status}</div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Vehicle Make' : 'Add Vehicle Make'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Vehicle Makes List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Vehicle Make List</h5>
          <div>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={fetchVehicleMakes}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i> {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading vehicle makes...</p>
            </div>
          ) : vehicleMakes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No vehicle makes found. Add your first vehicle make above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover text-center">
                <thead className="table-dark ">
                  <tr>
                    <th scope="col">S.no</th>
                    <th scope="col">Vehicle Make Name</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleMakes.map((make, index) => (
                    <tr key={make.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{make.vehical_make}</td>
                      <td>
                        <span className={`badge ${make.status ? 'bg-success' : 'bg-secondary'}`}>
                          {make.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(make)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(make.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer text-muted">
          Total Vehicle Makes: {vehicleMakes.length}
        </div>
      </div>
      
      {/* Bootstrap Icons CDN for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
      />
      
      {/* Bootstrap JS for components */}
      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" 
        crossOrigin="anonymous"
      ></script>
    </div>
  );
};

export default VehicleMake;