import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MarketingHead_Sidebar from "../../MarketingHead/Sidebar/MarketingHead_Sidebar.jsx"; // Import sidebar
import "../../MarketingHead/Sidebar/MarketingHead_Sidebar.css"; // Import sidebar CSS

const State = () => {
  const navigate = useNavigate();
  const [stateName, setStateName] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Create axios instance with auth interceptor
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add request interceptor to attach token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          navigate('/');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('access');
    const designation = localStorage.getItem('designation');

    if (!token) {
      navigate('/');
      return;
    }

    if (designation !== 'Marketing Head') {
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchStates();
  }, []);

  const showToast = (message, type = 'success') => {
    alert(message);
  };

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/branch-states/');
      console.log('States response:', response.data); // Debug log
      // REMOVE the filter line below - show ALL states
      // const activeStates = response.data.filter(state => state.status === true);
      setStates(response.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      showToast('Failed to fetch states', 'error');
      
      if (error.response?.status === 401) {
        // Already handled by interceptor
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stateName.trim()) {
      showToast('State field is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { 
        name: stateName.trim(),
        status: true  // Add status field
      };

      await api.post('/api/branch-states/', payload);
      showToast('State Added Successfully');
      setStateName('');
      fetchStates();
    } catch (error) {
      console.error('Error creating state:', error);
      if (error.response?.status === 400) {
        showToast(error.response.data.name?.[0] || 'State already exists', 'error');
      } else if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Something went wrong', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this state?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/branch-states/${id}/`);
      showToast('State Deleted Successfully');
      fetchStates();
    } catch (error) {
      console.error('Error deleting state:', error);
      showToast('Failed to delete state', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      await api.patch(`/api/branch-states/${id}/`, { status: newStatus });
      showToast('Status Updated');
      fetchStates();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a state
  const startEdit = (state) => {
    setEditingId(state.id);
    setEditName(state.name);
    setEditStatus(state.status);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStatus(true);
  };

  // Save edited state
  const saveEdit = async (id) => {
    if (!editName.trim()) {
      showToast('State name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: editName.trim(),
        status: editStatus
      };

      await api.put(`/api/branch-states/${id}/`, payload);
      showToast('State Updated Successfully');

      // Reset editing state and refresh
      setEditingId(null);
      fetchStates();
    } catch (error) {
      console.error('Error updating state:', error);
      if (error.response?.status === 400) {
        showToast(error.response.data.name?.[0] || 'State already exists', 'error');
      } else {
        showToast('Something went wrong', 'error');
      }
    } finally {
      setLoading(false);
    }
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
                MARKETING HEAD - LOCATION MASTER
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
                State Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Add, edit, and manage states for branch locations
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
                {states.length}
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

        {/* Add State Card */}
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
            Add New State
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                State Name
              </label>
              <input
                type="text"
                className="form-control"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Enter state name"
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
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !stateName.trim()}
              style={{
                padding: '14px 30px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: submitting || !stateName.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                opacity: submitting || !stateName.trim() ? 0.7 : 1
              }}
            >
              {submitting ? 'Saving...' : 'Save State'}
            </button>
          </form>
        </div>

        {/* State List Card */}
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
              State List ({states.length} records)
            </h3>
            <button
              onClick={fetchStates}
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
              Refresh
            </button>
          </div>

          {loading ? (
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
                Loading States...
              </p>
            </div>
          ) : states.length === 0 ? (
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
                No States Found
              </h4>
              <p style={{
                fontSize: '1rem',
                opacity: 0.8
              }}>
                Add your first state using the form above
              </p>
            </div>
          ) : (
            <div style={{
              overflowX: 'auto',
              borderRadius: '12px',
              border: '2px solid rgba(251, 191, 36, 0.2)'
            }}>
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
                      minWidth: '50px'
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
                      minWidth: '250px'
                    }}>
                      STATE NAME
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      minWidth: '100px'
                    }}>
                      STATUS
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      minWidth: '300px'
                    }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state, index) => (
                    <tr 
                      key={state.id}
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
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {state.id}
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
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
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
                          state.name
                        )}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === state.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value === 'true')}
                            disabled={loading}
                            style={{
                              width: '100%',
                              border: '2px solid #f59e0b',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            background: state.status ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)' : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                            color: state.status ? '#059669' : '#b91c1c',
                            border: state.status ? '1px solid #10b98160' : '1px solid #ef444460'
                          }}>
                            {state.status ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {editingId === state.id ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => saveEdit(state.id)}
                              disabled={loading || !editName.trim()}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: loading || !editName.trim() ? 'not-allowed' : 'pointer',
                                opacity: loading || !editName.trim() ? 0.7 : 1
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
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => startEdit(state)}
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
                            <button
                              onClick={() => handleDelete(state.id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default State;