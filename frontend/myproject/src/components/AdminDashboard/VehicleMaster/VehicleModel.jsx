import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VehicleModel = () => {
  const [formData, setFormData] = useState({
    vehicle_make: '',  // This might be 'vehical_make' in API
    vehicle_model: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    vehicle_make: '',
    vehicle_model: ''
  });
  
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicleMakes();
    fetchVehicleModels();
  }, []);

  const fetchVehicleMakes = async () => {
    try {
      setLoadingMakes(true);
      const response = await api.get('vehicle-make/');
      console.log('Vehicle Makes API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter active vehicle makes
        const activeMakes = response.data.filter(item => 
          item.status === true || item.status === 1
        );
        console.log('Active Makes:', activeMakes);
        setVehicleMakes(activeMakes);
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      toast.error('Failed to load vehicle makes');
    } finally {
      setLoadingMakes(false);
    }
  };

  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      const response = await api.get('vehicle-model/');
      console.log('Vehicle Models API Response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setVehicleModels(response.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      toast.error('Failed to load vehicle models');
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
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    if (!data.vehicle_make) {
      newErrors.vehicle_make = 'Vehicle Make is required';
    }
    
    if (!data.vehicle_model?.trim()) {
      newErrors.vehicle_model = 'Vehicle Model is required';
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if vehicle model already exists
      const existingModel = vehicleModels.find(
        model => 
          model.vehicle_make === parseInt(formData.vehicle_make) &&
          model.vehicle_model.toLowerCase() === formData.vehicle_model.toLowerCase()
      );
      
      if (existingModel) {
        toast.error('Vehicle Model already exists for this make');
        return;
      }
      
      // Create new vehicle model - CORRECTED FIELD NAMES
      const payload = {
        vehicle_make: parseInt(formData.vehicle_make), // Foreign key ID
        vehicle_model: formData.vehicle_model, // Model name
        status: true
      };
      
      console.log('Creating model with payload:', payload);
      
      const response = await api.post('vehicle-model/', payload);
      console.log('Create response:', response.data);
      
      toast.success('Vehicle Model Added Successfully');
      setFormData({ vehicle_make: '', vehicle_model: '' });
      fetchVehicleModels();
      
    } catch (error) {
      console.error('Error adding vehicle model:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
        const errorData = error.response.data;
        
        // Handle different error formats
        if (errorData.vehicle_model) {
          const errorMsg = Array.isArray(errorData.vehicle_model) 
            ? errorData.vehicle_model[0] 
            : errorData.vehicle_model;
          toast.error(`Model: ${errorMsg}`);
        } else if (errorData.vehicle_make) {
          const errorMsg = Array.isArray(errorData.vehicle_make) 
            ? errorData.vehicle_make[0] 
            : errorData.vehicle_make;
          toast.error(`Make: ${errorMsg}`);
        } else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else if (typeof errorData === 'string') {
          toast.error(errorData);
        } else {
          toast.error('Failed to add vehicle model');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (model) => {
    setEditFormData({
      id: model.id,
      vehicle_make: model.vehicle_make,
      vehicle_model: model.vehicle_model
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm(editFormData);
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    try {
      setEditing(true);
      
      const response = await api.put(`vehicle-model/${editFormData.id}/`, {
        vehicle_make: parseInt(editFormData.vehicle_make),
        vehicle_model: editFormData.vehicle_model
      });
      
      console.log('Update response:', response.data);
      toast.success('Vehicle Model Updated Successfully');
      setShowEditModal(false);
      fetchVehicleModels();
      
    } catch (error) {
      console.error('Error updating vehicle model:', error);
      toast.error('Failed to update vehicle model');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle model?')) {
      return;
    }
    
    try {
      await api.delete(`vehicle-model/${id}/`);
      toast.success('Vehicle Model deleted successfully');
      fetchVehicleModels();
    } catch (error) {
      console.error('Error deleting vehicle model:', error);
      toast.error('Failed to delete vehicle model');
    }
  };

  const handleStatusToggle = async (model) => {
    try {
      const newStatus = !model.status;
      await api.patch(`vehicle-model/${model.id}/`, { status: newStatus });
      toast.success(`Vehicle Model ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchVehicleModels();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Get vehicle make name by ID
  const getVehicleMakeName = (makeId) => {
    if (!makeId) return 'Unknown';
    const make = vehicleMakes.find(item => item.id === makeId);
    return make ? make.vehical_make : 'Unknown'; // Using 'vehical_make' from API
  };

  // Filter models based on search
  const filteredModels = vehicleModels.filter(model => {
    if (!searchTerm.trim()) return true;
    
    const modelName = model.vehicle_model?.toLowerCase() || '';
    const makeName = getVehicleMakeName(model.vehicle_make)?.toLowerCase() || '';
    
    return modelName.includes(searchTerm.toLowerCase()) || 
           makeName.includes(searchTerm.toLowerCase());
  });

  console.log('Current state:', {
    makesCount: vehicleMakes.length,
    modelsCount: vehicleModels.length,
    formData
  });

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Vehicle Model Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Vehicle Model</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="vehicle_make" className="form-label">
                        <i class="bi bi-truck"></i>
                        Vehicle Make *
                      </label>
                      <select 
                        id="vehicle_make"
                        name="vehicle_make"
                        className={`form-select ${errors.vehicle_make ? 'is-invalid' : ''}`}
                        value={formData.vehicle_make}
                        onChange={handleInputChange}
                        disabled={loadingMakes}
                      >
                        <option value="">Select Vehicle Make</option>
                        {loadingMakes ? (
                          <option value="" disabled>Loading...</option>
                        ) : vehicleMakes.length === 0 ? (
                          <option value="" disabled>No makes available. Add makes first.</option>
                        ) : (
                          vehicleMakes.map((make) => (
                            <option key={make.id} value={make.id}>
                              {make.vehical_make} 
                            </option>
                          ))
                        )}
                      </select>
                      {errors.vehicle_make && (
                        <div className="invalid-feedback">{errors.vehicle_make}</div>
                      )}
                      <div className="form-text">
                        {loadingMakes ? 'Loading...' : `${vehicleMakes.length} makes available`}
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="vehicle_model" className="form-label">
                        Vehicle Model *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.vehicle_model ? 'is-invalid' : ''}`}
                        name="vehicle_model"
                        id="vehicle_model"
                        placeholder="Enter model name (e.g., Camry, Civic)"
                        value={formData.vehicle_model}
                        onChange={handleInputChange}
                      />
                      {errors.vehicle_model && (
                        <div className="invalid-feedback">{errors.vehicle_model}</div>
                      )}
                      <div className="form-text">Enter the model name</div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting || loadingMakes || vehicleMakes.length === 0}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Adding...
                        </>
                      ) : 'Add Model'}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setFormData({ vehicle_make: '', vehicle_model: '' })}
                    >
                      Clear
                    </button>
                  </div>
                  
                  {vehicleMakes.length === 0 && !loadingMakes && (
                    <div className="alert alert-warning mt-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      No vehicle makes found. Please add vehicle makes first.
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Vehicle Models List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Vehicle Models</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchVehicleModels}
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
                    <p className="mt-2">Loading models...</p>
                  </div>
                ) : filteredModels.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No models found matching your search' : 'No vehicle models found'}
                    </p>
                    {vehicleModels.length > 0 && searchTerm && (
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
                          <th>#</th>
                          <th>Model Name</th>
                          <th>Vehicle Make</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredModels.map((model, index) => (
                          <tr key={model.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{model.vehicle_model}</strong>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {getVehicleMakeName(model.vehicle_make)}
                              </span>
                            </td>
                            <td>
                              <span 
                                className={`badge ${model.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(model)}
                                title="Click to toggle"
                              >
                                {model.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              {model.created_at ? 
                                new Date(model.created_at).toLocaleDateString() : 
                                'N/A'}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(model)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(model.id)}
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
                
                {!loading && filteredModels.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {filteredModels.length} of {vehicleModels.length} models
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
                <h5 className="modal-title">Edit Vehicle Model</h5>
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
                    <label className="form-label">Vehicle Make *</label>
                    <select 
                      name="vehicle_make"
                      className="form-select"
                      value={editFormData.vehicle_make}
                      onChange={handleEditInputChange}
                      disabled={editing}
                    >
                      <option value="">Select Make</option>
                      {vehicleMakes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.vehical_make}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Vehicle Model *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="vehicle_model"
                      value={editFormData.vehicle_model}
                      onChange={handleEditInputChange}
                      placeholder="Model name"
                      disabled={editing}
                    />
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

export default VehicleModel;