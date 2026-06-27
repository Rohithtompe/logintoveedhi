import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarketingManager_Sidebar from "../../MarketingManager/Sidebar/MarketingManager_Sidebar.jsx";
import "../../MarketingManager/Sidebar/MarketingManager_Sidebar.css";
// import "./styles/BranchState.css";

function Branch_State() {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000';
  
  const [branchStates, setBranchStates] = useState([]);
  const [loading, setLoading] = useState({
    initial: false,
    submitting: false,
    action: false
  });
  const [formData, setFormData] = useState({
    name: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: ''
  });
  const [error, setError] = useState(null);

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
  }, [navigate]);

  const fetchBranchStates = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/branch-inner-states/`, {
        headers: getAuthHeaders()
      });
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        setBranchStates(response.data);
      } else if (response.data && response.data.data) {
        setBranchStates(response.data.data);
      } else {
        setBranchStates([]);
      }
    } catch (error) {
      console.error('Error fetching branch states:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else {
        setError('Failed to fetch branch states');
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
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
    setEditFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Branch State name is required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      setError(null);
      
      // Create the branch state with auth headers
      const response = await axios.post(`${API_BASE_URL}/api/branch-inner-states/`, {
        name: formData.name.trim(),
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.id || response.data.data) {
        alert('Branch State added successfully');
      } else {
        alert('Added successfully');
      }
      
      setFormData({ name: '' });
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error creating branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data) {
        if (error.response.data.name) {
          alert(error.response.data.name[0]);
        } else if (error.response.data.detail) {
          alert(error.response.data.detail);
        } else if (error.response.data.message) {
          alert(error.response.data.message);
        } else if (error.response.data.error) {
          alert(error.response.data.error);
        } else {
          setError('Failed to create branch state');
        }
      } else {
        setError('Failed to create branch state. Please check your connection.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleClear = () => {
    setFormData({ name: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch state?')) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}/api/branch-inner-states/${id}/`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert('Branch State deleted successfully');
      }
      
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error deleting branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to delete branch state');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleEdit = (state) => {
    setEditingId(state.id);
    setEditFormData({
      name: state.name
    });
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      alert('Branch State name is required');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const response = await axios.put(`${API_BASE_URL}/api/branch-inner-states/${editingId}/`, {
        name: editFormData.name.trim()
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.id || response.data.data) {
        alert('Branch State updated successfully');
      } else {
        alert('Updated successfully');
      }
      
      setEditingId(null);
      setEditFormData({ name: '' });
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error updating branch state:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data) {
        if (error.response.data.name) {
          alert(error.response.data.name[0]);
        } else if (error.response.data.detail) {
          alert(error.response.data.detail);
        } else {
          setError('Failed to update branch state');
        }
      } else {
        setError('Failed to update branch state');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '' });
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      // First get current state to know what status to set
      const currentState = branchStates.find(state => state.id === id);
      const newStatus = currentState ? !currentState.status : true;
      
      const response = await axios.patch(`${API_BASE_URL}/api/branch-inner-states/${id}/`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        alert(response.data.message);
      } else if (response.data.data) {
        alert('Status updated successfully');
      } else {
        alert('Status updated');
      }
      
      fetchBranchStates(); // Refresh the list
      
    } catch (error) {
      console.error('Error toggling status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('designation');
        navigate('/');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to toggle status');
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
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
                MARKETING MANAGER - BRANCH STATE
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
                Branch State Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Add and manage branch inner states
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
                {branchStates.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Total States
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

        {/* Add Branch State Form */}
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
              <span>➕</span>
              Add New Branch State
            </h3>
            <button
              onClick={fetchBranchStates}
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
              gridTemplateColumns: '1fr',
              gap: '20px',
              marginBottom: '25px',
              maxWidth: '600px'
            }}>
              {/* Branch State Name Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Branch State Name *
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter branch state name" 
                  value={formData.name}
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
                disabled={loading.submitting || !formData.name.trim()}
                style={{
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading.submitting || !formData.name.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  opacity: loading.submitting || !formData.name.trim() ? 0.7 : 1
                }}
              >
                {loading.submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    ➕ Add Branch State
                  </>
                )}
              </button>
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
                🔄 Clear
              </button>
            </div>
          </form>
        </div>

        {/* Branch State List Table */}
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
              Branch State List ({branchStates.length} records)
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
                  Loading branch states...
                </p>
              </div>
            ) : branchStates.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '800px'
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
                      width: '400px'
                    }}>
                      BRANCH STATE DETAILS
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
                  {branchStates.map((state, index) => (
                    <tr 
                      key={state.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease',
                        ...(editingId === state.id && {
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
                        {editingId === state.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditInputChange}
                                disabled={loading.action}
                                autoFocus
                                style={{
                                  width: '100%',
                                  border: '2px solid #f59e0b',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={handleSaveEdit}
                                disabled={loading.action || !editFormData.name.trim()}
                                style={{
                                  padding: '8px 16px',
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: loading.action || !editFormData.name.trim() ? 'not-allowed' : 'pointer',
                                  opacity: loading.action || !editFormData.name.trim() ? 0.7 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
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
                          </div>
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
                              <span style={{ fontSize: '1.2rem' }}>🗺️</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                                {state.name}
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
                          background: state.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                          color: state.status ? '#059669' : '#b91c1c',
                          border: state.status ? '1px solid #10b98160' : '1px solid #ef444460',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleStatus(state.id)}
                        >
                          {state.status ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === state.id ? null : (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleEdit(state)}
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
{/*                             
                            <button
                              onClick={() => toggleStatus(state.id)}
                              disabled={loading.action}
                              style={{
                                padding: '8px 16px',
                                background: state.status ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                              {state.status ? '🔴 Deactivate' : '🟢 Activate'}
                            </button> */}
                            
                            <button
                              onClick={() => handleDelete(state.id)}
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
                  🗺️
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  No Branch States Found
                </h4>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.8
                }}>
                  Add your first branch state using the form above
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
              <span style={{ fontWeight: '700' }}>🗺️ {branchStates.length}</span> Total States
            </span>
            <span>
              <span style={{ fontWeight: '700', color: '#10b981' }}>● {branchStates.filter(s => s.status).length}</span> Active
            </span>
            <span>
              <span style={{ fontWeight: '700', color: '#ef4444' }}>○ {branchStates.filter(s => !s.status).length}</span> Inactive
            </span>
          </div>
          <small>
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </small>
        </div>
      </div>
    </div>
  );
}

export default Branch_State;