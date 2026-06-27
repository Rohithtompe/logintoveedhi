import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/Pincode.css";

function Pincode() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000';
  
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [allSubLocations, setAllSubLocations] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState({
    states: false,
    locations: false,
    sublocations: false,
    pincodes: false,
    submit: false,
    action: false,
    initial: true
  });
  const [formData, setFormData] = useState({
    state: '',
    location: '',
    sub_location: '',
    pin_code: ''
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState(null);

  const [stateMap, setStateMap] = useState({});
  const [locationMap, setLocationMap] = useState({});
  const [subLocationMap, setSubLocationMap] = useState({});

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    // Check authentication
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

    const newSubLocationMap = {};
    allSubLocations.forEach(subLoc => {
      newSubLocationMap[subLoc.id] = {
        name: subLoc.name,
        locationId: subLoc.branch_location
      };
    });
    setSubLocationMap(newSubLocationMap);
  }, [states, allLocations, allSubLocations]);

  const fetchInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);

      // Fetch states
      const statesResponse = await axios.get(`${API_BASE_URL}/api/branch-states/`, {
        headers: getAuthHeaders()
      });
      setStates(statesResponse.data || []);

      // Fetch locations
      const locationsResponse = await axios.get(`${API_BASE_URL}/api/branch-locations/`, {
        headers: getAuthHeaders()
      });
      setAllLocations(locationsResponse.data || []);

      // Fetch sublocations
      const sublocationsResponse = await axios.get(`${API_BASE_URL}/api/sublocations/`, {
        headers: getAuthHeaders()
      });
      setAllSubLocations(sublocationsResponse.data || []);

      await fetchPincodes();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to load initial data');
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

  const fetchSubLocationsForLocation = useCallback((locationId) => {
    if (!locationId) {
      setSubLocations([]);
      return;
    }
    const filteredSubLocations = allSubLocations.filter(subloc => subloc.branch_location == locationId);
    setSubLocations(filteredSubLocations);
  }, [allSubLocations]);

  const fetchPincodes = async () => {
    try {
      setLoading(prev => ({ ...prev, pincodes: true }));
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/pincodes/`, {
        headers: getAuthHeaders()
      });
      setPincodes(response.data || []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to fetch PIN codes');
      }
    } finally {
      setLoading(prev => ({ ...prev, pincodes: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'state') {
      fetchLocationsForState(value);
      setFormData({
        state: value,
        location: '',
        sub_location: '',
        pin_code: formData.pin_code
      });
    } else if (name === 'location') {
      fetchSubLocationsForLocation(value);
      setFormData({
        ...formData,
        location: value,
        sub_location: ''
      });
    } else if (name === 'pin_code') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setFormData(prevState => ({
          ...prevState,
          [name]: numericValue
        }));
      }
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.sub_location) newErrors.sub_location = 'Sub Location is required';
    if (!formData.pin_code) newErrors.pin_code = 'PIN Code is required';
    if (formData.pin_code && formData.pin_code.length !== 6) newErrors.pin_code = 'PIN Code must be 6 digits';
    
    if (!isEditMode) {
      const existingPincode = pincodes.find(p => 
        p.pincode === formData.pin_code && 
        p.branch_state == formData.state &&
        p.branch_location == formData.location &&
        p.sub_location == formData.sub_location
      );
      
      if (existingPincode) newErrors.pin_code = 'This PIN code combination already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      
      const payload = {
        pincode: formData.pin_code,
        branch_state: parseInt(formData.state),
        branch_location: parseInt(formData.location),
        sub_location: parseInt(formData.sub_location),
        status: true
      };

      let response;
      if (isEditMode && editingId) {
        response = await axios.put(`${API_BASE_URL}/api/pincodes/${editingId}/`, payload, {
          headers: getAuthHeaders()
        });
        alert('PIN Code updated successfully!');
      } else {
        response = await axios.post(`${API_BASE_URL}/api/pincodes/`, payload, {
          headers: getAuthHeaders()
        });
        alert('PIN Code added successfully!');
      }
      
      handleCancelEdit();
      await fetchInitialData();
      
    } catch (error) {
      console.error('Error saving pincode:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else if (error.response?.status === 400) {
        const backendErrors = error.response.data;
        Object.keys(backendErrors).forEach(key => {
          setErrors(prev => ({ 
            ...prev, 
            [key]: Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key]
          }));
        });
      } else {
        setError('Failed to save PIN Code. Please try again.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleClear = () => {
    if (isEditMode) {
      handleCancelEdit();
    } else {
      setFormData({ 
        state: '', 
        location: '', 
        sub_location: '', 
        pin_code: '' 
      });
      setLocations([]);
      setSubLocations([]);
      setErrors({});
    }
  };

  const handleEdit = (pincode) => {
    setIsEditMode(true);
    setEditingId(pincode.id);
    setFormData({
      state: pincode.branch_state.toString(),
      location: pincode.branch_location.toString(),
      sub_location: pincode.sub_location.toString(),
      pin_code: pincode.pincode
    });
    
    fetchLocationsForState(pincode.branch_state);
    fetchSubLocationsForLocation(pincode.branch_location);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ 
      state: '', 
      location: '', 
      sub_location: '', 
      pin_code: '' 
    });
    setLocations([]);
    setSubLocations([]);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PIN Code?')) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      await axios.delete(`${API_BASE_URL}/api/pincodes/${id}/`, {
        headers: getAuthHeaders()
      });
      alert('PIN Code deleted successfully!');
      
      if (editingId === id) {
        handleCancelEdit();
      }
      
      await fetchInitialData();
    } catch (error) {
      console.error('Error deleting pincode:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to delete PIN Code');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      const newStatus = !currentStatus;
      await axios.patch(`${API_BASE_URL}/api/pincodes/${id}/`, 
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      alert(`PIN Code ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchInitialData();
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
      } else {
        setError('Failed to update status');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const getStateName = (stateId) => {
    if (!stateId) return 'N/A';
    const state = states.find(s => s.id === stateId);
    return state ? `${state.name}${state.status === false ? ' (Inactive)' : ''}` : `State ID: ${stateId}`;
  };

  const getLocationName = (locationId) => {
    if (!locationId) return 'N/A';
    const location = allLocations.find(l => l.id === locationId);
    return location ? `${location.name}${location.status === false ? ' (Inactive)' : ''}` : `Location ID: ${locationId}`;
  };

  const getSubLocationName = (subLocationId) => {
    if (!subLocationId) return 'N/A';
    const subLocation = allSubLocations.find(sl => sl.id === subLocationId);
    return subLocation ? `${subLocation.name}${subLocation.status === false ? ' (Inactive)' : ''}` : `Sub-location ID: ${subLocationId}`;
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await fetchInitialData();
      alert('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1"style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>PIN Code Management</h2>
              <p className="text-muted">Manage PIN codes across locations</p>
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

      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bx bx-error-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit PIN Code Form */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                {isEditMode ? (
                  <>
                    <i className="bx bx-edit-alt text-warning me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Edit PIN Code</span>
                    <span className="badge bg-warning ms-3 px-3 py-2">
                      <i className="bx bx-hash me-1"></i>
                      ID: {editingId}
                    </span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-plus-circle text-primary me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Add New PIN Code</span>
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  {/* State Field */}
                  <div className="col-md-3">
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
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        disabled={loading.initial}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state.id} value={state.id}>
                            {state.name} {!state.status && '(Inactive)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.state && <div className="text-danger small mt-1">{errors.state}</div>}
                  </div>

                  {/* Location Field */}
                  <div className="col-md-3">
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
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.state || loading.initial}
                      >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name} {!location.status && '(Inactive)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.location && <div className="text-danger small mt-1">{errors.location}</div>}
                    {!formData.state && !errors.location && (
                      <small className="form-text text-muted mt-2">
                        <i className="bx bx-info-circle me-1"></i>
                        Please select a state first
                      </small>
                    )}
                  </div>

                  {/* Sub Location Field */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold mb-3">
                      Sub Location <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-map-pin text-primary"></i>
                      </span>
                      <select 
                        className="form-control border-start-0 ps-3" 
                        name="sub_location"
                        value={formData.sub_location}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.location || loading.initial}
                      >
                        <option value="">Select Sub Location</option>
                        {subLocations.map(subLocation => (
                          <option key={subLocation.id} value={subLocation.id}>
                            {subLocation.name} {!subLocation.status && '(Inactive)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.sub_location && <div className="text-danger small mt-1">{errors.sub_location}</div>}
                    {!formData.location && !errors.sub_location && (
                      <small className="form-text text-muted mt-2">
                        <i className="bx bx-info-circle me-1"></i>
                        Please select a location first
                      </small>
                    )}
                  </div>

                  {/* PIN Code Field */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold mb-3">
                      PIN Code <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-pin text-primary"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-start-0 ps-3" 
                        name="pin_code"
                        placeholder="6-digit PIN" 
                        value={formData.pin_code}
                        onChange={handleInputChange}
                        maxLength="6"
                        required
                      />
                    </div>
                    {errors.pin_code ? (
                      <div className="text-danger small mt-1">{errors.pin_code}</div>
                    ) : (
                      <small className="form-text text-muted mt-2">
                        <i className="bx bx-info-circle me-1"></i>
                        6-digit numeric PIN code
                      </small>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className={`btn ${isEditMode ? 'btn-warning' : 'btn-primary'} px-5 py-3 d-flex align-items-center gap-2`}
                        disabled={loading.submit || loading.initial}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        {loading.submit ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            {isEditMode ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          <>
                            <i className={`bx ${isEditMode ? 'bx-save' : 'bx-plus'} fs-5`}></i>
                            {isEditMode ? 'Update PIN Code' : 'Add PIN Code'}
                          </>
                        )}
                      </button>
                      
                      {isEditMode && (
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary px-5 py-3 d-flex align-items-center gap-2"
                          onClick={handleCancelEdit}
                          disabled={loading.submit}
                          style={{ fontSize: '1.1rem', fontWeight: '500' }}
                        >
                          <i className="bx bx-x fs-5"></i>
                          Cancel Edit
                        </button>
                      )}
                      
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary px-5 py-3 d-flex align-items-center gap-2"
                        onClick={handleClear}
                        disabled={loading.submit}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        <i className="bx bx-reset fs-5"></i>
                        {isEditMode ? 'Cancel' : 'Clear Form'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Code List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>PIN Code List</span>
                <span className="badge bg-primary ms-3 px-3 py-2">
                  {pincodes.length} Records
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {loading.initial ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading all data...</p>
                </div>
              ) : loading.pincodes && pincodes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading PIN codes...</p>
                </div>
              ) : pincodes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th style={{ width: '120px' }}>PIN CODE</th>
                        <th style={{ width: '200px' }}>STATE</th>
                        <th style={{ width: '200px' }}>LOCATION</th>
                        <th style={{ width: '200px' }}>SUB LOCATION</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '300px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pincodes.map((pincode, index) => (
                        <tr key={pincode.id} className={editingId === pincode.id ? 'table-warning' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                  {pincode.pincode}
                                </h6>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <div className="text-dark fw-medium" style={{ fontSize: '1rem' }}>
                                  {getStateName(pincode.branch_state)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <div className="text-dark fw-medium" style={{ fontSize: '1rem' }}>
                                  {getLocationName(pincode.branch_location)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <div className="text-dark fw-medium" style={{ fontSize: '1rem' }}>
                                  {getSubLocationName(pincode.sub_location)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${pincode.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(pincode.id, pincode.status)}
                              >
                                <div className={`${pincode.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{pincode.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                onClick={() => handleEdit(pincode)}
                                disabled={loading.action}
                                title="Edit"
                              >
                                <i className="bx bx-edit"></i>
                                <span>Edit</span>
                              </button>
                              
                              {/* <button
                                className={`btn d-flex align-items-center gap-2 px-3 py-2 ${pincode.status ? 'btn-warning text-white' : 'btn-success'}`}
                                onClick={() => handleToggleStatus(pincode.id, pincode.status)}
                                title={pincode.status ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`bx ${pincode.status ? 'bx-toggle-left' : 'bx-toggle-right'}`}></i>
                                <span>{pincode.status ? 'Deactivate' : 'Activate'}</span>
                              </button> */}
                              
                              <button
                                className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2"
                                onClick={() => handleDelete(pincode.id)}
                                title="Delete"
                              >
                                <i className="bx bx-trash"></i>
                                <span>Delete</span>
                              </button>
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
                    <i className="bx bx-pin text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No PIN codes found</h5>
                  <p className="text-muted">Add your first PIN code above</p>
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
              Showing {pincodes.length} PIN codes • {states.length} states • {allLocations.length} locations
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

export default Pincode;