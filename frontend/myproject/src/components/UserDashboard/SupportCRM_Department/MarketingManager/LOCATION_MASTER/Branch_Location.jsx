import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarketingManager_Sidebar from "../../MarketingManager/Sidebar/MarketingManager_Sidebar.jsx";
import "../../MarketingManager/Sidebar/MarketingManager_Sidebar.css";
// import "./styles/BranchLocation.css";

function Branch_Location() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000';
  
  const [branchStates, setBranchStates] = useState([]);
  const [allBranchLocations, setAllBranchLocations] = useState([]);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [loading, setLoading] = useState({
    initial: false,
    submitting: false,
    action: false
  });
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    state: '',
    location: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    
    fetchBranchStates();
    fetchAllBranchLocations();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Filter locations based on selected state
    if (name === 'state') {
      if (value) {
        const filtered = allBranchLocations.filter(loc => 
          loc.branch_inner_state === parseInt(value) ||
          loc.branch_inner_state_id === parseInt(value) ||
          (loc.branch_inner_state && loc.branch_inner_state.id === parseInt(value))
        );
        setDisplayedLocations(filtered);
      } else {
        setDisplayedLocations(allBranchLocations);
      }
    }
  };

  const fetchBranchStates = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/branch-inner-states/`, {
        headers: getAuthHeaders()
      });
      
      let statesData = [];
      if (Array.isArray(res.data)) {
        statesData = res.data;
      } else if (res.data && res.data.data) {
        statesData = res.data.data;
      }
      
      const activeStates = statesData.filter(state => state.status === true || state.status === 1);
      setBranchStates(activeStates);
    } catch (err) {
      console.error('Failed to fetch branch states', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else {
        setError('Failed to load branch states');
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const normalizeLocation = (loc) => {
    if (!loc) return loc;
    const copy = { ...loc };
    if (copy.branch_inner_state && typeof copy.branch_inner_state === 'object') {
      copy.branch_inner_state_id = copy.branch_inner_state.id || copy.branch_inner_state.pk || copy.branch_inner_state_id;
    }
    if (copy.branch_inner_state_id === undefined && (copy.branch_inner_state !== undefined)) {
      if (typeof copy.branch_inner_state !== 'object') {
        copy.branch_inner_state_id = parseInt(copy.branch_inner_state);
      }
    }
    if ((copy.branch_inner_state_id === undefined || Number.isNaN(copy.branch_inner_state_id)) && (copy.branch_state !== undefined || copy.branch_state_id !== undefined)) {
      const candidate = copy.branch_state_id || copy.branch_state;
      copy.branch_inner_state_id = candidate ? parseInt(candidate) : undefined;
      if (copy.branch_inner_state === undefined) copy.branch_inner_state = copy.branch_inner_state_id;
    }
    return copy;
  };

  const fetchAllBranchLocations = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/branch-inner-locations/`, {
        headers: getAuthHeaders()
      });
      
      let locationsData = [];
      if (Array.isArray(res.data)) {
        locationsData = res.data;
      } else if (res.data && res.data.data) {
        locationsData = res.data.data;
      }
      
      const normalized = locationsData.map(normalizeLocation);
      setAllBranchLocations(normalized);
      setDisplayedLocations(normalized);
    } catch (err) {
      console.error('Failed to fetch branch locations', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else {
        setError('Failed to load branch locations');
        setAllBranchLocations([]);
        setDisplayedLocations([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.trim() || !formData.state) {
      alert('All fields are required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      setError(null);

      const requestData = {
        name: formData.location.trim(),
        branch_inner_state: parseInt(formData.state),
        status: true
      };

      let response;
      if (isEditing && editingId) {
        response = await axios.patch(`${API_BASE_URL}/api/branch-inner-locations/${editingId}/`, requestData, {
          headers: getAuthHeaders()
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/branch-inner-locations/`, requestData, {
          headers: getAuthHeaders()
        });
      }

      let resultLocation;
      if (response.data && (response.data.id || response.data.pk)) {
        resultLocation = response.data;
      } else if (response.data && response.data.data && (response.data.data.id || response.data.data.pk)) {
        resultLocation = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        resultLocation = response.data;
      } else {
        resultLocation = {
          id: isEditing && editingId ? editingId : Date.now(),
          name: formData.location.trim(),
          branch_inner_state: parseInt(formData.state),
          status: true
        };
        if (response.data && typeof response.data === 'object') {
          const responseId = response.data.id || response.data.ID || response.data.Id || response.data.pk;
          if (responseId) resultLocation.id = responseId;
        }
      }

      const normalizedResult = normalizeLocation(resultLocation);

      if (isEditing && editingId) {
        setAllBranchLocations(prev => prev.map(loc => loc.id === normalizedResult.id ? normalizedResult : loc));
        setDisplayedLocations(prev => prev.map(loc => loc.id === normalizedResult.id ? normalizedResult : loc));
      } else {
        const updatedAllLocations = [normalizedResult, ...allBranchLocations];
        setAllBranchLocations(updatedAllLocations);
        if (!formData.state || formData.state === '') {
          setDisplayedLocations(updatedAllLocations);
        } else {
          const filtered = updatedAllLocations.filter(loc => 
            loc.branch_inner_state_id === parseInt(formData.state) || 
            (loc.branch_inner_state && loc.branch_inner_state.id === parseInt(formData.state))
          );
          setDisplayedLocations(filtered);
        }
      }

      setFormData({ state: '', location: '' });
      setEditingId(null);
      setIsEditing(false);

      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert(isEditing ? 'Branch Location Updated Successfully!' : 'Branch Location Added Successfully!');
      }
      
    } catch (error) {
      console.error('Full error creating branch location:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data) {
        if (error.response.data.name) {
          setError(`Error: ${error.response.data.name[0]}`);
        } else if (error.response.data.detail) {
          setError(`Error: ${error.response.data.detail}`);
        } else if (error.response.data.error) {
          setError(`Error: ${error.response.data.error}`);
        } else if (error.response.data.message) {
          setError(`Error: ${error.response.data.message}`);
        } else if (typeof error.response.data === 'string') {
          setError(`Error: ${error.response.data}`);
        } else if (typeof error.response.data === 'object') {
          const errorMsg = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          setError(`Error:\n${errorMsg}`);
        } else {
          setError('Failed to create branch location. Please check the console for details.');
        }
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Failed to create branch location. Please check your connection.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleClear = () => {
    setFormData({ state: '', location: '' });
    setEditingId(null);
    setIsEditing(false);
    setDisplayedLocations(allBranchLocations);
  };

  const handleEdit = (location) => {
    const stateId = location.branch_inner_state_id || (location.branch_inner_state && location.branch_inner_state.id) || location.branch_inner_state;
    setFormData({ state: stateId ? String(stateId) : '', location: location.name || location.branch_location || '' });
    setEditingId(location.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch location?')) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      console.log('Deleting location ID:', id);
      const response = await axios.delete(`${API_BASE_URL}/api/branch-inner-locations/${id}/`, {
        headers: getAuthHeaders()
      });
      
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.message) {
        alert(response.data.message);
      } else {
        alert('Branch Location deleted successfully!');
      }
      
      const updatedAll = allBranchLocations.filter(loc => loc.id !== id);
      setAllBranchLocations(updatedAll);
      setDisplayedLocations(updatedAll.filter(loc => 
        !formData.state || 
        formData.state === '' || 
        loc.branch_inner_state_id === parseInt(formData.state) ||
        (loc.branch_inner_state && loc.branch_inner_state.id === parseInt(formData.state))
      ));
      if (editingId === id) {
        setFormData({ state: '', location: '' });
        setEditingId(null);
        setIsEditing(false);
      }
      
    } catch (error) {
      console.error('Error deleting branch location:', error);
      console.error('Delete error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data?.error) {
        setError(`Error: ${error.response.data.error}`);
      } else if (error.response?.data?.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else if (error.response?.data?.message) {
        setError(`Error: ${error.response.data.message}`);
      } else {
        setError('Failed to delete branch location');
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
      console.log('Toggling status for ID:', id, 'New status:', newStatus);
      
      const response = await axios.patch(`${API_BASE_URL}/api/branch-inner-locations/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });
      
      console.log('Status toggle response:', response.data);
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.message) {
        alert(response.data.message);
      } else {
        alert('Status updated successfully!');
      }
      
      setAllBranchLocations(prev => 
        prev.map(loc => 
          loc.id === id ? { ...loc, status: newStatus } : loc
        )
      );
      
      setDisplayedLocations(prev => 
        prev.map(loc => 
          loc.id === id ? { ...loc, status: newStatus } : loc
        )
      );
      
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Status error response:', error.response?.data);
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

  const getBranchStateName = (stateId) => {
    if (stateId === null || stateId === undefined) return 'Unknown';
    let id = stateId;
    if (typeof stateId === 'object') {
      id = stateId.id || stateId.pk || stateId;
    }
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return 'Unknown';
    const state = branchStates.find(s => s.id === parsed);
    return state ? state.name : 'Unknown';
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await fetchBranchStates();
      await fetchAllBranchLocations();
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
                MARKETING MANAGER - BRANCH LOCATION 
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
                Branch Location Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Manage branch locations across inner states
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
                {allBranchLocations.length}
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

        {/* Add Branch Location Form */}
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
              {isEditing ? (
                <>
                  <span>✏️</span>
                  Edit Branch Location
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
                  Add New Branch Location
                </>
              )}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={loading.initial}
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
              Refresh
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
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
                  Branch State *
                </label>
                <select 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  disabled={loading.initial || loading.submitting}
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
                  <option value="">Select Branch State</option>
                  {branchStates.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name} {!state.status && '(Inactive)'}
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
                  Branch Location *
                </label>
                <input 
                  type="text" 
                  name="location"
                  placeholder="Enter location name" 
                  value={formData.location}
                  onChange={handleInputChange}
                  required 
                  disabled={loading.submitting}
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
              <button 
                type="submit" 
                disabled={loading.submitting || !formData.location.trim() || !formData.state}
                style={{
                  padding: '14px 30px',
                  background: isEditing ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading.submitting || !formData.location.trim() || !formData.state ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  opacity: loading.submitting || !formData.location.trim() || !formData.state ? 0.7 : 1
                }}
              >
                {loading.submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {isEditing ? '💾 Update Branch Location' : '➕ Add Branch Location'}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={handleClear}
                  disabled={loading.submitting}
                  style={{
                    padding: '14px 30px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    color: '#92400e',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: loading.submitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    opacity: loading.submitting ? 0.7 : 1
                  }}
                >
                  ✕ Cancel Edit
                </button>
              )}
              
              <button 
                type="button" 
                onClick={handleClear}
                disabled={loading.submitting}
                style={{
                  padding: '14px 30px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#92400e',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading.submitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  opacity: loading.submitting ? 0.7 : 1
                }}
              >
                {isEditing ? '✕ Cancel' : '🔄 Clear Form'}
              </button>
            </div>
          </form>
        </div>

        {/* Branch Location List Table */}
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
              Branch Location List 
              <span style={{
                fontSize: '1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '5px 12px',
                borderRadius: '20px',
                marginLeft: '10px'
              }}>
                {displayedLocations.length} records
                {formData.state && (
                  <span style={{ marginLeft: '8px', color: '#92400e' }}>
                    (Filtered: {displayedLocations.length} of {allBranchLocations.length})
                  </span>
                )}
              </span>
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
                  Loading branch locations...
                </p>
              </div>
            ) : displayedLocations.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1000px'
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
                      BRANCH STATE
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
                      BRANCH LOCATION
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
                  {displayedLocations.map((location, index) => (
                    <tr 
                      key={location.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease',
                        ...(editingId === location.id && {
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
                              {getBranchStateName(location.branch_inner_state || location.branch_inner_state_id)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        color: '#92400e',
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
                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                              {location.name || location.branch_location || 'Unnamed'}
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
                          background: location.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                          color: location.status ? '#059669' : '#b91c1c',
                          border: location.status ? '1px solid #10b98160' : '1px solid #ef444460',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggleStatus(location.id, location.status)}
                        >
                          {location.status ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleEdit(location)}
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
                            onClick={() => handleToggleStatus(location.id, location.status)}
                            disabled={loading.action}
                            style={{
                              padding: '8px 16px',
                              background: location.status ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                            {location.status ? '🔴 Deactivate' : '🟢 Activate'}
                          </button> */}
                          
                          <button
                            onClick={() => handleDelete(location.id)}
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
                  📍
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  No Branch Locations Found
                </h4>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.8
                }}>
                  {formData.state 
                    ? 'No branch locations found for the selected state. Add a new location above.' 
                    : 'Add your first branch location using the form above'}
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
              <span style={{ fontWeight: '700' }}>📍 {displayedLocations.length}</span> Displayed
            </span>
            <span>
              <span style={{ fontWeight: '700' }}>📌 {allBranchLocations.length}</span> Total
            </span>
            <span>
              <span style={{ fontWeight: '700', color: '#10b981' }}>● {displayedLocations.filter(l => l.status).length}</span> Active
            </span>
            <span>
              <span style={{ fontWeight: '700', color: '#ef4444' }}>○ {displayedLocations.filter(l => !l.status).length}</span> Inactive
            </span>
          </div>
          {formData.state && (
            <span style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
              Filtered by selected state
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Branch_Location;