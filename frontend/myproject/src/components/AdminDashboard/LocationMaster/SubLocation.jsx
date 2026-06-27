import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/SubLocation.css";

function SubLocation() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000';
  
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [loading, setLoading] = useState({
    initial: false,
    states: false,
    locations: false,
    sublocations: false,
    submit: false,
    action: false
  });
  const [formData, setFormData] = useState({
    state: '',
    location: '',
    sub_location: ''
  });
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    state: '',
    location: '',
    sub_location: ''
  });

  const [stateMap, setStateMap] = useState({});
  const [locationMap, setLocationMap] = useState({});

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchInitialData();
  }, [navigate]);

  useEffect(() => {
    const newStateMap = {};
    states.forEach(state => {
      newStateMap[state.id] = state.name;
    });
    setStateMap(newStateMap);

    const newLocationMap = {};
    allLocations.forEach(location => {
      newLocationMap[location.id] = {
        name: location.name,
        stateId: location.branch_state
      };
    });
    setLocationMap(newLocationMap);
  }, [states, allLocations]);

  const fetchInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      
      // Fetch states
      const statesResponse = await axios.get(`${API_BASE_URL}/api/branch-states/`, {
        headers: getAuthHeaders()
      });
      const activeStates = statesResponse.data.filter(state => state.status === true);
      setStates(activeStates);

      // Fetch locations
      const locationsResponse = await axios.get(`${API_BASE_URL}/api/branch-locations/`, {
        headers: getAuthHeaders()
      });
      const activeLocations = locationsResponse.data.filter(loc => loc.status === true);
      setAllLocations(activeLocations);

      // Fetch sub-locations
      await fetchSubLocations();
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to load initial data');
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const fetchLocationsForState = useCallback((stateId) => {
    if (!stateId) {
      setLocations([]);
      return;
    }
    const filteredLocations = allLocations.filter(loc => loc.branch_state == stateId);
    setLocations(filteredLocations);
  }, [allLocations]);

  const fetchSubLocations = async () => {
    try {
      setLoading(prev => ({ ...prev, sublocations: true }));
      const response = await axios.get(`${API_BASE_URL}/api/sublocations/`, {
        headers: getAuthHeaders()
      });
      setSubLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching sub-locations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setSubLocations([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, sublocations: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      fetchLocationsForState(value);
      setFormData({
        ...formData,
        state: value,
        location: ''
      });
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      fetchLocationsForState(value);
      setEditData({
        ...editData,
        state: value,
        location: ''
      });
    } else {
      setEditData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.state || !formData.location || !formData.sub_location.trim()) {
      alert('All fields are required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const payload = {
        name: formData.sub_location.trim(),
        branch_state: parseInt(formData.state),
        branch_location: parseInt(formData.location),
        status: true
      };

      console.log('Creating sub-location with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/sublocations/`, payload, {
        headers: getAuthHeaders()
      });
      
      alert('Sub Location added successfully!');
      
      setFormData({ 
        state: '', 
        location: '', 
        sub_location: '' 
      });
      setLocations([]);
      
      await fetchSubLocations();
      
    } catch (error) {
      console.error('Error saving sub-location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert(error.response.data.name?.[0] || 'Sub-location already exists');
      } else {
        alert('Failed to save sub-location');
      }
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const startEdit = (subLocation) => {
    setEditingId(subLocation.id);
    setEditData({
      state: subLocation.branch_state.toString(),
      location: subLocation.branch_location.toString(),
      sub_location: subLocation.name || subLocation.sub_location
    });
    
    fetchLocationsForState(subLocation.branch_state);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      state: '',
      location: '',
      sub_location: ''
    });
    setLocations([]);
  };

  const saveEdit = async (id) => {
    if (!editData.state || !editData.location || !editData.sub_location.trim()) {
      alert('All fields are required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, action: true }));
      
      const payload = {
        name: editData.sub_location.trim(),
        branch_state: parseInt(editData.state),
        branch_location: parseInt(editData.location)
      };

      await axios.put(`${API_BASE_URL}/api/sublocations/${id}/`, payload, {
        headers: getAuthHeaders()
      });
      
      alert('Sub Location updated successfully!');
      
      setEditingId(null);
      setEditData({
        state: '',
        location: '',
        sub_location: ''
      });
      setLocations([]);
      
      await fetchSubLocations();
      
    } catch (error) {
      console.error('Error updating sub-location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert(error.response.data.name?.[0] || 'Sub-location already exists');
      } else {
        alert('Failed to update sub-location');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-location?')) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await axios.delete(`${API_BASE_URL}/api/sublocations/${id}/`, {
        headers: getAuthHeaders()
      });
      alert('Sub Location deleted successfully!');
      
      await fetchSubLocations();
    } catch (error) {
      console.error('Error deleting sub-location:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        alert('Failed to delete sub-location');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const newStatus = !currentStatus;
      await axios.patch(`${API_BASE_URL}/api/sublocations/${id}/`, 
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      alert('Status updated successfully!');
      await fetchSubLocations();
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
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const getStateName = (stateId) => {
    if (!stateId) return 'N/A';
    return stateMap[stateId] || `State ID: ${stateId}`;
  };

  const getLocationName = (locationId) => {
    if (!locationId) return 'N/A';
    const location = locationMap[locationId];
    return location ? location.name : `Location ID: ${locationId}`;
  };

  const handleRefresh = async () => {
    try {
      await fetchInitialData();
      alert('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Failed to refresh data');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 "style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Sub Location Management</h2>
              <p className="text-muted">Manage sub locations across states and locations</p>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              disabled={loading.initial}
            >
              <i className="bx bx-refresh"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                {editingId ? (
                  <>
                    <i className="bx bx-edit-alt text-warning me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Edit Sub Location</span>
                    <span className="badge bg-warning ms-3 px-3 py-2">
                      <i className="bx bx-hash me-1"></i>
                      ID: {editingId}
                    </span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-plus-circle text-primary me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Add New Sub Location</span>
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  {/* State Field */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold mb-3">
                      State <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-map-alt text-primary"></i>
                      </span>
                      <select 
                        className="form-control border-start-0 ps-3" 
                        name="state"
                        value={editingId ? editData.state : formData.state}
                        onChange={editingId ? handleEditInputChange : handleInputChange}
                        required
                        disabled={loading.initial || loading.submit}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Field */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold mb-3">
                      Location <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-map text-primary"></i>
                      </span>
                      <select 
                        className="form-control border-start-0 ps-3" 
                        name="location"
                        value={editingId ? editData.location : formData.location}
                        onChange={editingId ? handleEditInputChange : handleInputChange}
                        required
                        disabled={(!formData.state && !editingId) || loading.initial || loading.submit}
                      >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(!formData.state && !editingId) && (
                      <small className="form-text text-muted mt-2">
                        <i className="bx bx-info-circle me-1"></i>
                        Please select a state first
                      </small>
                    )}
                  </div>

                  {/* Sub Location Field */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold mb-3">
                      Sub Location <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-map-pin text-primary"></i>
                      </span>
                      {editingId ? (
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-3" 
                          name="sub_location"
                          placeholder="Enter sub location name" 
                          value={editData.sub_location}
                          onChange={handleEditInputChange}
                          disabled={loading.action}
                          required
                        />
                      ) : (
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-3" 
                          name="sub_location"
                          placeholder="Enter sub location name" 
                          value={formData.sub_location}
                          onChange={handleInputChange}
                          disabled={loading.submit}
                          required
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-3">
                      {editingId ? (
                        <>
                          <button 
                            type="button" 
                            className="btn btn-warning px-5 py-3 d-flex align-items-center gap-2"
                            onClick={() => saveEdit(editingId)}
                            disabled={loading.action || !editData.state || !editData.location || !editData.sub_location.trim()}
                            style={{ fontSize: '1.1rem', fontWeight: '500' }}
                          >
                            {loading.action ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bx bx-save fs-5"></i>
                                Save Changes
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary px-5 py-3 d-flex align-items-center gap-2"
                            onClick={cancelEdit}
                            disabled={loading.action}
                            style={{ fontSize: '1.1rem', fontWeight: '500' }}
                          >
                            <i className="bx bx-x fs-5"></i>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="submit" 
                            className="btn btn-primary px-5 py-3 d-flex align-items-center gap-2 flex-grow-1"
                            disabled={loading.submit || !formData.state || !formData.location || !formData.sub_location.trim()}
                            style={{ fontSize: '1.1rem', fontWeight: '500' }}
                          >
                            {loading.submit ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                Adding...
                              </>
                            ) : (
                              <>
                                <i className="bx bx-plus fs-5"></i>
                                Add Sub Location
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary px-5 py-3 d-flex align-items-center gap-2"
                            onClick={() => {
                              setFormData({ state: '', location: '', sub_location: '' });
                              setLocations([]);
                            }}
                            disabled={loading.submit}
                            style={{ fontSize: '1.1rem', fontWeight: '500' }}
                          >
                            <i className="bx bx-reset fs-5"></i>
                            Clear Form
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Location List Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Sub Location List</span>
                <span className="badge bg-primary ms-3 px-3 py-2">
                  {subLocations.length} Records
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {error && (
                <div className="alert alert-danger mx-4 mt-4" role="alert">
                  <i className="bx bx-error-circle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {loading.initial ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading all data...</p>
                </div>
              ) : loading.sublocations && subLocations.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading sub-locations...</p>
                </div>
              ) : subLocations.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>SUB LOCATION</th>
                        <th>STATE</th>
                        <th>LOCATION</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '300px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subLocations.map((subLocation, index) => (
                        <tr key={subLocation.id} className={editingId === subLocation.id ? 'table-warning' : ''}>
                          <td className="ps-4">
                            <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                          </td>
                          
                          <td>
                            {editingId === subLocation.id ? (
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="sub_location"
                                  value={editData.sub_location}
                                  onChange={handleEditInputChange}
                                  disabled={loading.action}
                                />
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                    {subLocation.name || subLocation.sub_location}
                                  </h6>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            {editingId === subLocation.id ? (
                              <select
                                className="form-select"
                                name="state"
                                value={editData.state}
                                onChange={handleEditInputChange}
                                disabled={loading.action}
                              >
                                <option value="">Select State</option>
                                {states.map(state => (
                                  <option key={state.id} value={state.id}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                </div>
                                <div>
                                  <span className="fw-semibold">{getStateName(subLocation.branch_state)}</span>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            {editingId === subLocation.id ? (
                              <select
                                className="form-select"
                                name="location"
                                value={editData.location}
                                onChange={handleEditInputChange}
                                disabled={loading.action || !editData.state}
                              >
                                <option value="">Select Location</option>
                                {locations.map(location => (
                                  <option key={location.id} value={location.id}>
                                    {location.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                </div>
                                <div>
                                  <span className="fw-semibold">{getLocationName(subLocation.branch_location)}</span>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${subLocation.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(subLocation.id, subLocation.status)}
                              >
                                <div className={`${subLocation.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{subLocation.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              {editingId === subLocation.id ? (
                                <>
                                  <button
                                    className="btn btn-success d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => saveEdit(subLocation.id)}
                                    disabled={loading.action || !editData.state || !editData.location || !editData.sub_location.trim()}
                                  >
                                    <i className="bx bx-check fs-5"></i>
                                    <span>Save</span>
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={cancelEdit}
                                    disabled={loading.action}
                                  >
                                    <i className="bx bx-x fs-5"></i>
                                    <span>Cancel</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => startEdit(subLocation)}
                                    disabled={loading.action}
                                    title="Edit"
                                  >
                                    <i className="bx bx-edit"></i>
                                    <span>Edit</span>
                                  </button>
                                  
                                  {/* <button
                                    className={`btn d-flex align-items-center gap-2 px-3 py-2 ${subLocation.status ? 'btn-warning text-white' : 'btn-success'}`}
                                    onClick={() => handleToggleStatus(subLocation.id, subLocation.status)}
                                    title={subLocation.status ? 'Deactivate' : 'Activate'}
                                  >
                                    <i className={`bx ${subLocation.status ? 'bx-toggle-left' : 'bx-toggle-right'}`}></i>
                                    <span>{subLocation.status ? 'Deactivate' : 'Activate'}</span>
                                  </button> */}
                                  
                                  <button
                                    className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2"
                                    onClick={() => handleDelete(subLocation.id)}
                                    title="Delete"
                                  >
                                    <i className="bx bx-trash"></i>
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-map-pin text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No sub locations found</h5>
                  <p className="text-muted">Add your first sub location above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center text-muted">
            <small>
              <i className="bx bx-info-circle me-1"></i>
              Showing {subLocations.length} sub locations • {states.length} states • {allLocations.length} locations
            </small>
            <button
              onClick={handleRefresh}
              className="btn btn-sm btn-outline-secondary"
              disabled={loading.initial}
            >
              <i className="bx bx-refresh me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubLocation;