import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/Location.css";

function Location() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://127.0.0.1:8000';
  
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    branch_state: '',
    name: ''
  });

  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    branch_state: '',
    name: ''
  });

  // Get authentication headers function
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchStates();
    fetchLocations();
  }, [navigate]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/branch-states/`, {
        headers: getAuthHeaders()
      });
      setStates(response.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to fetch states');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/branch-locations/`, {
        headers: getAuthHeaders()
      });
      setLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to fetch locations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.branch_state) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        name: formData.name.trim(),
        branch_state: parseInt(formData.branch_state),
        status: true
      };

      await axios.post(`${API_BASE_URL}/api/branch-locations/`, payload, {
        headers: getAuthHeaders()
      });
      
      alert('Location added successfully!');
      setFormData({ branch_state: '', name: '' });
      fetchLocations();
      
    } catch (error) {
      console.error('Error saving location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert(error.response.data.name?.[0] || 'Location already exists');
      } else {
        alert('Failed to save location');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ branch_state: '', name: '' });
  };

  // Start editing a location
  const startEdit = (location) => {
    setEditingId(location.id);
    setEditData({
      branch_state: location.branch_state.toString(),
      name: location.name
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ branch_state: '', name: '' });
  };

  // Save edited location
  const saveEdit = async (id) => {
    if (!editData.name || !editData.branch_state) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: editData.name.trim(),
        branch_state: parseInt(editData.branch_state)
      };

      await axios.put(`${API_BASE_URL}/api/branch-locations/${id}/`, payload, {
        headers: getAuthHeaders()
      });
      
      alert('Location updated successfully!');
      setEditingId(null);
      setEditData({ branch_state: '', name: '' });
      fetchLocations();
      
    } catch (error) {
      console.error('Error updating location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert(error.response.data.name?.[0] || 'Location already exists');
      } else {
        alert('Failed to update location');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/branch-locations/${id}/`, {
        headers: getAuthHeaders()
      });
      alert('Location deleted successfully!');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete location');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      await axios.patch(`${API_BASE_URL}/api/branch-locations/${id}/`, 
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      alert('Status updated successfully!');
      fetchLocations();
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to update status');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get state name by ID
  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : 'Unknown';
  };

  return (
    <div className="location-page-container">
      <div className="location-header">
        <h2>Location Management</h2>
        <p>Add and manage branch locations</p>
      </div>
      
      <div className="location-content">
        {/* Add Location Form */}
        <div className="location-form-section">
          <h3>Add New Location</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="branch_state">State *</label>
                <select 
                  id="branch_state" 
                  name="branch_state"
                  value={formData.branch_state}
                  onChange={handleInputChange}
                  required
                  disabled={loading || submitting}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Location Name *</label>
                <input 
                  id="name" 
                  type="text" 
                  name="name"
                  placeholder="Enter location name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  required 
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !formData.name || !formData.branch_state}
              >
                {submitting ? 'Adding...' : 'Add Location'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={submitting}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Location List Table */}
        <div className="location-table-section">
          <div className="table-header">
            <h3>Location List</h3>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={fetchLocations}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="location-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '200px' }}>Location Name</th>
                  <th style={{ width: '150px' }}>State</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && locations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-2">Loading locations...</span>
                    </td>
                  </tr>
                ) : locations.length > 0 ? (
                  locations.map(location => (
                    <tr key={location.id}>
                      <td style={{ textAlign: 'center' }}>{location.id}</td>
                      <td>
                        {editingId === location.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            name="name"
                            value={editData.name}
                            onChange={handleEditInputChange}
                            disabled={loading}
                            style={{ width: '180px' }}
                          />
                        ) : (
                          location.name
                        )}
                      </td>
                      <td>
                        {editingId === location.id ? (
                          <select
                            className="form-select form-select-sm"
                            name="branch_state"
                            value={editData.branch_state}
                            onChange={handleEditInputChange}
                            disabled={loading}
                            style={{ width: '120px' }}
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getStateName(location.branch_state)
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`status-badge ${location.status ? 'active' : 'inactive'}`}>
                          {location.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {editingId === location.id ? (
                          <div className="action-buttons">
                            <button 
                              className="btn btn-success me-2"
                              onClick={() => saveEdit(location.id)}
                              disabled={loading || !editData.name || !editData.branch_state}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={cancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button 
                              className="btn btn-warning me-2"
                              onClick={() => startEdit(location)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            {/* <button 
                              className="btn btn-info me-2"
                              onClick={() => handleToggleStatus(location.id, location.status)}
                              disabled={loading}
                            >
                              {location.status ? 'Deactivate' : 'Activate'}
                            </button> */}
                            <button 
                              onClick={() => handleDelete(location.id)}
                              className="btn btn-danger"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No locations found. Add your first location above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Location;