import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarketingManager_Sidebar from "../../MarketingManager/Sidebar/MarketingManager_Sidebar.jsx";
import "../../MarketingManager/Sidebar/MarketingManager_Sidebar.css";
// import "./styles/Pincode.css";

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
    const designation = localStorage.getItem('designation');
    
    if (!token) {
      navigate('/');
      return;
    }

    if (designation !== 'Marketing Manager') {
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#fef3c7'
    }}>
      {/* Marketing Head Sidebar */}
      <MarketingManager_Sidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        padding: '30px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        minHeight: '100vh',
        overflowX: 'hidden',
        color: '#78350f'
      }}>
        {/* Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.9) 0%, rgba(251, 191, 36, 0.8) 100%)',
          borderRadius: '20px',
          padding: '35px',
          marginBottom: '40px',
          color: '#451a03',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#92400e',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  width: '30px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                MARKETING MANAGER - PINCODE
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                PIN Code Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Manage PIN codes across states, locations, and sub-locations
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              minWidth: '130px',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {pincodes.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Total PIN Codes
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            color: '#b91c1c',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '500'
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Add/Edit PIN Code Form */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {isEditMode ? (
                <>
                  <span>✏️</span>
                  Edit PIN Code
                  <span style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    marginLeft: '10px'
                  }}>
                    ID: {editingId}
                  </span>
                </>
              ) : (
                <>
                  <span>➕</span>
                  Add New PIN Code
                </>
              )}
            </h3>
            <button
              onClick={handleRefresh}
              style={{
                padding: '10px 20px',
                background: 'rgba(251, 191, 36, 0.1)',
                color: '#92400e',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>🔄</span>
              Refresh Data
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* State Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  State *
                </label>
                <select 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  disabled={loading.initial}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: errors.state ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name} {!state.status && '(Inactive)'}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.state}
                  </small>
                )}
              </div>

              {/* Location Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Location *
                </label>
                <select 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.state || loading.initial}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: errors.location ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} {!location.status && '(Inactive)'}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.location}
                  </small>
                )}
                {!formData.state && !errors.location && (
                  <small style={{
                    display: 'block',
                    marginTop: '8px',
                    color: '#92400e',
                    fontSize: '0.8rem'
                  }}>
                    <span>ℹ️</span> Select a state first
                  </small>
                )}
              </div>

              {/* Sub Location Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Sub Location *
                </label>
                <select 
                  name="sub_location"
                  value={formData.sub_location}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.location || loading.initial}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: errors.sub_location ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Sub Location</option>
                  {subLocations.map(subLocation => (
                    <option key={subLocation.id} value={subLocation.id}>
                      {subLocation.name} {!subLocation.status && '(Inactive)'}
                    </option>
                  ))}
                </select>
                {errors.sub_location && (
                  <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.sub_location}
                  </small>
                )}
                {!formData.location && !errors.sub_location && (
                  <small style={{
                    display: 'block',
                    marginTop: '8px',
                    color: '#92400e',
                    fontSize: '0.8rem'
                  }}>
                    <span>ℹ️</span> Select a location first
                  </small>
                )}
              </div>

              {/* PIN Code Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  PIN Code *
                </label>
                <input 
                  type="text" 
                  name="pin_code"
                  placeholder="6-digit PIN" 
                  value={formData.pin_code}
                  onChange={handleInputChange}
                  maxLength="6"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: errors.pin_code ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                {errors.pin_code ? (
                  <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.pin_code}
                  </small>
                ) : (
                  <small style={{
                    display: 'block',
                    marginTop: '8px',
                    color: '#92400e',
                    fontSize: '0.8rem'
                  }}>
                    <span>ℹ️</span> 6-digit numeric PIN code
                  </small>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="submit" 
                disabled={loading.submit || loading.initial}
                style={{
                  padding: '14px 30px',
                  background: isEditMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading.submit || loading.initial ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  opacity: loading.submit || loading.initial ? 0.7 : 1
                }}
              >
                {loading.submit ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? '💾 Update PIN Code' : '➕ Add PIN Code'}
                  </>
                )}
              </button>
              
              {isEditMode && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  disabled={loading.submit}
                  style={{
                    padding: '14px 30px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    color: '#92400e',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: loading.submit ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    opacity: loading.submit ? 0.7 : 1
                  }}
                >
                  ✕ Cancel Edit
                </button>
              )}
              
              <button 
                type="button" 
                onClick={handleClear}
                disabled={loading.submit}
                style={{
                  padding: '14px 30px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#92400e',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading.submit ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  opacity: loading.submit ? 0.7 : 1
                }}
              >
                {isEditMode ? '✕ Cancel' : '🔄 Clear Form'}
              </button>
            </div>
          </form>
        </div>

        {/* PIN Code List Table */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>📋</span>
              PIN Code List ({pincodes.length} records)
            </h3>
          </div>
          
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid rgba(251, 191, 36, 0.2)'
          }}>
            {loading.initial ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px',
                  border: '5px solid #fde68a',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
                <p style={{ color: '#92400e', fontSize: '1.2rem', fontWeight: '500' }}>
                  Loading all data...
                </p>
              </div>
            ) : loading.pincodes && pincodes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px',
                  border: '5px solid #fde68a',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#92400e', fontSize: '1.2rem', fontWeight: '500' }}>
                  Loading PIN codes...
                </p>
              </div>
            ) : pincodes.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1400px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  }}>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '80px'
                    }}>
                      S.NO
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '120px'
                    }}>
                      PIN CODE
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '200px'
                    }}>
                      STATE
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '200px'
                    }}>
                      LOCATION
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '200px'
                    }}>
                      SUB LOCATION
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      width: '120px'
                    }}>
                      STATUS
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      width: '350px'
                    }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pincodes.map((pincode, index) => (
                    <tr 
                      key={pincode.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease',
                        ...(editingId === pincode.id && {
                          background: 'rgba(251, 191, 36, 0.2)',
                          borderLeft: '4px solid #f59e0b'
                        })
                      }}
                    >
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <span style={{ fontWeight: '700', color: '#f59e0b' }}>{index + 1}</span>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#92400e',
                        fontWeight: '700',
                        fontSize: '1rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>📌</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                              {pincode.pincode}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>🗺️</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {getStateName(pincode.branch_state)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {getLocationName(pincode.branch_location)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {getSubLocationName(pincode.sub_location)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          background: pincode.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                          color: pincode.status ? '#059669' : '#b91c1c',
                          border: pincode.status ? '1px solid #10b98160' : '1px solid #ef444460',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggleStatus(pincode.id, pincode.status)}
                        >
                          {pincode.status ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleEdit(pincode)}
                            disabled={loading.action}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: loading.action ? 'not-allowed' : 'pointer',
                              opacity: loading.action ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {/* <button
                            onClick={() => handleToggleStatus(pincode.id, pincode.status)}
                            disabled={loading.action}
                            style={{
                              padding: '8px 16px',
                              background: pincode.status ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: loading.action ? 'not-allowed' : 'pointer',
                              opacity: loading.action ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {pincode.status ? '🔴 Deactivate' : '🟢 Activate'}
                          </button> */}
                          <button
                            onClick={() => handleDelete(pincode.id)}
                            disabled={loading.action}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: loading.action ? 'not-allowed' : 'pointer',
                              opacity: loading.action ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#92400e'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '20px',
                  opacity: 0.3
                }}>
                  📌
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  No PIN Codes Found
                </h4>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.8
                }}>
                  Add your first PIN code using the form above
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '12px',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#92400e',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>
              <span style={{ fontWeight: '700' }}>📌 {pincodes.length}</span> PIN Codes
            </span>
            <span>
              <span style={{ fontWeight: '700' }}>🗺️ {states.length}</span> States
            </span>
            <span>
              <span style={{ fontWeight: '700' }}>📍 {allLocations.length}</span> Locations
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading.initial}
            style={{
              padding: '8px 16px',
              background: 'rgba(251, 191, 36, 0.1)',
              color: '#92400e',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pincode;