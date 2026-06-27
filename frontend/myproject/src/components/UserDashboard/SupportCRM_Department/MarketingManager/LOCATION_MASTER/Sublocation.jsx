import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarketingManager_Sidebar from "../../MarketingManager/Sidebar/MarketingManager_Sidebar.jsx";
import "../../MarketingManager/Sidebar/MarketingManager_Sidebar.css";
// import "./styles/SubLocation.css";

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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
                MARKETING MANAGER - SUBLOCATION 
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
                Sub Location Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Manage sub locations across states and locations
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
                {subLocations.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Total Sub Locations
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Section */}
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
              {editingId ? (
                <>
                  <span>✏️</span>
                  Edit Sub Location
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
                  Add New Sub Location
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

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
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
                  value={editingId ? editData.state : formData.state}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                  disabled={loading.initial || loading.submit}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
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
                  value={editingId ? editData.location : formData.location}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                  disabled={(!formData.state && !editData.state) || loading.initial || loading.submit}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {(!formData.state && !editingId) && (
                  <small style={{
                    display: 'block',
                    marginTop: '8px',
                    color: '#92400e',
                    fontSize: '0.8rem'
                  }}>
                    <span>ℹ️</span> Please select a state first
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
                <input 
                  type="text" 
                  name="sub_location"
                  placeholder="Enter sub location name" 
                  value={editingId ? editData.sub_location : formData.sub_location}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  disabled={loading.submit || loading.action}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {editingId ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => saveEdit(editingId)}
                    disabled={loading.action || !editData.state || !editData.location || !editData.sub_location.trim()}
                    style={{
                      padding: '14px 30px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: loading.action || !editData.state || !editData.location || !editData.sub_location.trim() ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                      opacity: loading.action || !editData.state || !editData.location || !editData.sub_location.trim() ? 0.7 : 1
                    }}
                  >
                    {loading.action ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    disabled={loading.action}
                    style={{
                      padding: '14px 30px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: '#92400e',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: loading.action ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      opacity: loading.action ? 0.7 : 1
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="submit" 
                    disabled={loading.submit || !formData.state || !formData.location || !formData.sub_location.trim()}
                    style={{
                      padding: '14px 30px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: loading.submit || !formData.state || !formData.location || !formData.sub_location.trim() ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                      opacity: loading.submit || !formData.state || !formData.location || !formData.sub_location.trim() ? 0.7 : 1
                    }}
                  >
                    {loading.submit ? 'Adding...' : 'Add Sub Location'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({ state: '', location: '', sub_location: '' });
                      setLocations([]);
                    }}
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
                    Clear Form
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Sub Location List Table */}
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
              Sub Location List ({subLocations.length} records)
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
            ) : loading.sublocations && subLocations.length === 0 ? (
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
                  Loading sub-locations...
                </p>
              </div>
            ) : subLocations.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1200px'
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
                      width: '250px'
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
                  {subLocations.map((subLocation, index) => (
                    <tr 
                      key={subLocation.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease',
                        ...(editingId === subLocation.id && {
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
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === subLocation.id ? (
                          <input
                            type="text"
                            name="sub_location"
                            value={editData.sub_location}
                            onChange={handleEditInputChange}
                            disabled={loading.action}
                            style={{
                              width: '100%',
                              border: '2px solid #f59e0b',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.9rem'
                            }}
                          />
                        ) : (
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
                              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                                {subLocation.name || subLocation.sub_location}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === subLocation.id ? (
                          <select
                            name="state"
                            value={editData.state}
                            onChange={handleEditInputChange}
                            disabled={loading.action}
                            style={{
                              width: '100%',
                              border: '2px solid #f59e0b',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        ) : (
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
                                {getStateName(subLocation.branch_state)}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === subLocation.id ? (
                          <select
                            name="location"
                            value={editData.location}
                            onChange={handleEditInputChange}
                            disabled={loading.action || !editData.state}
                            style={{
                              width: '100%',
                              border: '2px solid #f59e0b',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="">Select Location</option>
                            {locations.map(location => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        ) : (
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
                                {getLocationName(subLocation.branch_location)}
                              </div>
                            </div>
                          </div>
                        )}
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
                          background: subLocation.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                          color: subLocation.status ? '#059669' : '#b91c1c',
                          border: subLocation.status ? '1px solid #10b98160' : '1px solid #ef444460',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggleStatus(subLocation.id, subLocation.status)}
                      >
                        {subLocation.status ? '● Active' : '○ Inactive'}
                      </span>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === subLocation.id ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => saveEdit(subLocation.id)}
                              disabled={loading.action || !editData.state || !editData.location || !editData.sub_location.trim()}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading.action || !editData.state || !editData.location || !editData.sub_location.trim() ? 'not-allowed' : 'pointer',
                                opacity: loading.action || !editData.state || !editData.location || !editData.sub_location.trim() ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {loading.action ? 'Saving...' : '💾 Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={loading.action}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
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
                              ✕ Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => startEdit(subLocation)}
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
                              onClick={() => handleToggleStatus(subLocation.id, subLocation.status)}
                              disabled={loading.action}
                              style={{
                                padding: '8px 16px',
                                background: subLocation.status ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                              {subLocation.status ? '🔴 Deactivate' : '🟢 Activate'}
                            </button> */}
                            <button
                              onClick={() => handleDelete(subLocation.id)}
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
                        )}
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
                  📍
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  No Sub Locations Found
                </h4>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.8
                }}>
                  Add your first sub location using the form above
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
              <span style={{ fontWeight: '700' }}>📍 {subLocations.length}</span> Sub Locations
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

export default SubLocation;