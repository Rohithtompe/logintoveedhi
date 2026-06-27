import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarketingHead_Sidebar from "../../MarketingManager/Sidebar/MarketingManager_Sidebar.jsx";
import "../../MarketingManager/Sidebar/MarketingManager_Sidebar.css";
// import "./styles/Location.css";

function Location_L() {
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
    const designation = localStorage.getItem('designation');
    
    if (!token) {
      navigate('/');
      return;
    }

    if (designation !== 'Marketing Manager') {
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
        localStorage.removeItem('designation');
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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#fef3c7'
    }}>
      {/* Marketing Head Sidebar */}
      <MarketingHead_Sidebar />

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
                MARKETING MANAGER - LOCATION
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
                Location Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Add and manage branch locations
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
                {locations.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Total Locations
              </div>
            </div>
          </div>
        </div>

        {/* Add Location Form */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#78350f',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>➕</span>
            Add New Location
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
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
                  name="branch_state"
                  value={formData.branch_state}
                  onChange={handleInputChange}
                  required
                  disabled={loading || submitting}
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
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Location Name *
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter location name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
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
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="submit" 
                disabled={submitting || !formData.name || !formData.branch_state}
                style={{
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: submitting || !formData.name || !formData.branch_state ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  opacity: submitting || !formData.name || !formData.branch_state ? 0.7 : 1
                }}
              >
                {submitting ? 'Adding...' : 'Add Location'}
              </button>
              <button 
                type="button" 
                onClick={handleClear}
                disabled={submitting}
                style={{
                  padding: '14px 30px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#92400e',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Location List Table */}
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
              Location List ({locations.length} records)
            </h3>
            <button 
              onClick={fetchLocations}
              disabled={loading}
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
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid rgba(251, 191, 36, 0.2)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '900px'
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
                    width: '60px'
                  }}>
                    ID
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
                    LOCATION NAME
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    width: '150px'
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
                    width: '100px'
                  }}>
                    STATUS
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    width: '250px'
                  }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && locations.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#92400e'
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
                        Loading locations...
                      </p>
                    </td>
                  </tr>
                ) : locations.length > 0 ? (
                  locations.map((location, index) => (
                    <tr 
                      key={location.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)',
                        textAlign: 'center'
                      }}>
                        {location.id}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#92400e',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === location.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditInputChange}
                            disabled={loading}
                            style={{
                              width: '100%',
                              border: '2px solid #f59e0b',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.9rem'
                            }}
                          />
                        ) : (
                          location.name
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
                        {editingId === location.id ? (
                          <select
                            name="branch_state"
                            value={editData.branch_state}
                            onChange={handleEditInputChange}
                            disabled={loading}
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
                          getStateName(location.branch_state)
                        )}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          background: location.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                          color: location.status ? '#059669' : '#b91c1c',
                          border: location.status ? '1px solid #10b98160' : '1px solid #ef444460'
                        }}>
                          {location.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === location.id ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => saveEdit(location.id)}
                              disabled={loading || !editData.name || !editData.branch_state}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading || !editData.name || !editData.branch_state ? 'not-allowed' : 'pointer',
                                opacity: loading || !editData.name || !editData.branch_state ? 0.7 : 1
                              }}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              onClick={cancelEdit}
                              disabled={loading}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => startEdit(location)}
                              disabled={loading}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            {/* <button 
                              onClick={() => handleToggleStatus(location.id, location.status)}
                              disabled={loading}
                              style={{
                                padding: '8px 16px',
                                background: location.status ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {location.status ? '🔴 Deactivate' : '🟢 Activate'}
                            </button> */}
                            <button 
                              onClick={() => handleDelete(location.id)}
                              disabled={loading}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{
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
                        No Locations Found
                      </h4>
                      <p style={{
                        fontSize: '1rem',
                        opacity: 0.8
                      }}>
                        Add your first location using the form above
                      </p>
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

export default Location_L;