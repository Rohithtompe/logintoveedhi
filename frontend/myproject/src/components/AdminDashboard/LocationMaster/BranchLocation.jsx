import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/BranchLocation.css";

function BranchLocation() {
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
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
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
        localStorage.removeItem('role');
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
        localStorage.removeItem('role');
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
        localStorage.removeItem('role');
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
        localStorage.removeItem('role');
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
        localStorage.removeItem('role');
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
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "black", fontSize: "2rem", fontWeight: "500" }}>Branch Location Management</h2>
              <p className="text-muted">Manage branch locations across states</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <i className="bx bx-map me-2"></i>
                <span className="fw-semibold">{allBranchLocations.length} Locations</span>
                <span className="mx-2">•</span>
                <span className="text-success fw-semibold">{branchStates.length} States</span>
              </div>
              <button 
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={handleRefresh}
                disabled={loading.initial}
              >
                <i className="bx bx-refresh me-2"></i>
                Refresh
              </button>
            </div>
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

      {/* Add Branch Location Form */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                {isEditing ? (
                  <>
                    <i className="bx bx-edit-alt text-warning me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Edit Branch Location</span>
                    <span className="badge bg-warning ms-3 px-3 py-2">
                      <i className="bx bx-hash me-1"></i>
                      ID: {editingId}
                    </span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-plus-circle text-primary me-3 fs-4"></i>
                    <span style={{ fontSize: '1.25rem' }}>Add New Branch Location</span>
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  {/* State Field */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-3">
                      Branch State <span className="text-danger">*</span>
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
                        disabled={loading.initial || loading.submitting}
                      >
                        <option value="">Select Branch State</option>
                        {branchStates.map(state => (
                          <option key={state.id} value={state.id}>
                            {state.name} {!state.status && '(Inactive)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Field */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-3">
                      Branch Location <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bx bx-map text-primary"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-start-0 ps-3" 
                        name="location"
                        placeholder="Enter location name" 
                        value={formData.location}
                        onChange={handleInputChange}
                        required 
                        disabled={loading.submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'} px-5 py-3 d-flex align-items-center gap-2 flex-grow-1`}
                        disabled={loading.submitting || !formData.location.trim() || !formData.state}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        {loading.submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            {isEditing ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          <>
                            <i className={`bx ${isEditing ? 'bx-save' : 'bx-plus'} fs-5`}></i>
                            {isEditing ? 'Update Branch Location' : 'Add Branch Location'}
                          </>
                        )}
                      </button>
                      
                      {isEditing && (
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary px-5 py-3 d-flex align-items-center gap-2"
                          onClick={handleClear}
                          disabled={loading.submitting}
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
                        disabled={loading.submitting}
                        style={{ fontSize: '1.1rem', fontWeight: '500' }}
                      >
                        <i className="bx bx-reset fs-5"></i>
                        {isEditing ? 'Cancel' : 'Clear Form'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Location List Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bx bx-list-ul text-primary me-3 fs-4"></i>
                <span style={{ fontSize: '1.25rem' }}>Branch Location List</span>
                <span className="badge bg-primary ms-3 px-3 py-2">
                  {displayedLocations.length} Records
                  {formData.state && (
                    <span className="ms-2">
                      (Filtered: {displayedLocations.length} of {allBranchLocations.length})
                    </span>
                  )}
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {loading.initial ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading branch locations...</p>
                </div>
              ) : displayedLocations.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '80px' }}>S.NO</th>
                        <th>BRANCH STATE</th>
                        <th>BRANCH LOCATION</th>
                        <th style={{ width: '120px' }}>STATUS</th>
                        <th style={{ width: '300px' }} className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedLocations.map((location, index) => (
                        <tr key={location.id} className={editingId === location.id ? 'table-warning' : ''}>
                          <td className="ps-4">
                            <div className="text-center">
                              <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{index + 1}</span>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                  {getBranchStateName(location.branch_inner_state || location.branch_inner_state_id)}
                                </h6>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                  {location.name || location.branch_location || 'Unnamed'}
                                </h6>
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className={`badge ${location.status ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-2 px-3 py-2`}
                                style={{ 
                                  cursor: 'pointer',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                                onClick={() => handleToggleStatus(location.id, location.status)}
                              >
                                <div className={`${location.status ? 'bg-white' : 'bg-light'} rounded-circle`} style={{ width: '10px', height: '10px' }}></div>
                                <span>{location.status ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                onClick={() => handleEdit(location)}
                                disabled={loading.action}
                                title="Edit"
                              >
                                <i className="bx bx-edit"></i>
                                <span>Edit</span>
                              </button>
                              
                              {/* <button
                                className={`btn d-flex align-items-center gap-2 px-3 py-2 ${location.status ? 'btn-warning text-white' : 'btn-success'}`}
                                onClick={() => handleToggleStatus(location.id, location.status)}
                                title={location.status ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`bx ${location.status ? 'bx-toggle-left' : 'bx-toggle-right'}`}></i>
                                <span>{location.status ? 'Deactivate' : 'Activate'}</span>
                              </button> */}
                              
                              <button
                                className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2"
                                onClick={() => handleDelete(location.id)}
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
                    <i className="bx bx-map text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  </div>
                  <h5 className="text-muted">No branch locations found</h5>
                  <p className="text-muted">
                    {formData.state 
                      ? 'No branch locations found for the selected state. Add a new location above.' 
                      : 'Add your first branch location above'}
                  </p>
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
              Showing {displayedLocations.length} of {allBranchLocations.length} locations • 
              {formData.state ? ' Filtered' : ' All states'} • 
              Active: {displayedLocations.filter(l => l.status).length} • 
              Inactive: {displayedLocations.filter(l => !l.status).length}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchLocation;