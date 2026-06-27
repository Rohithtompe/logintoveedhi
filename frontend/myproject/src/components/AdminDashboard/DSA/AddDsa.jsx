import React, { useState, useEffect } from 'react';
import api from '../../../api';

const AddDsa = () => {
  // State for form fields - now only inner fields are required
  const [formData, setFormData] = useState({
    vendor_bank: '',
    dsa_code: '',
    dsa_name: '',
    loan_type: '',
    branch_inner_state: '',
    branch_inner_location: ''
    // Note: branch_state and branch_location are omitted since they're optional
  });

  // State for edit mode
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for dropdown data
  const [vendorBanks, setVendorBanks] = useState([]);
  const [dsaNames, setDsaNames] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchDropdownData();
    } else {
      setMessage({ 
        type: 'danger', 
        text: 'You need to login first to access DSA Codes.' 
      });
    }
  }, []);

  // Fetch branch inner locations when branch inner state changes
  useEffect(() => {
    if (formData.branch_inner_state) {
      fetchBranchInnerLocations(formData.branch_inner_state);
    } else {
      setBranchInnerLocations([]);
      setFormData(prev => ({ ...prev, branch_inner_location: '' }));
    }
  }, [formData.branch_inner_state]);

  const fetchDropdownData = async () => {
    setLoading(true);
    
    try {
      const [
        vendorBanksRes,
        dsaNamesRes,
        loanTypesRes,
        branchInnerStatesRes
      ] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('dsa-names/'),
        api.get('loan-types/'),
        api.get('branch-inner-states/')
      ]);

      console.log('Vendor Banks:', vendorBanksRes.data);
      console.log('DSA Names:', dsaNamesRes.data);
      console.log('Loan Types:', loanTypesRes.data);
      console.log('Branch Inner States:', branchInnerStatesRes.data);

      setVendorBanks(vendorBanksRes.data || []);
      setDsaNames(dsaNamesRes.data || []);
      setLoanTypes(loanTypesRes.data || []);
      
      // Handle different response formats
      let statesData = [];
      if (Array.isArray(branchInnerStatesRes.data)) {
        statesData = branchInnerStatesRes.data;
      } else if (branchInnerStatesRes.data.results) {
        statesData = branchInnerStatesRes.data.results;
      }
      setBranchInnerStates(statesData);

    } catch (error) {
      console.error('Error fetching dropdowns:', error);
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'danger', 
          text: 'Session expired. Please login again.' 
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.error || 
                        'Failed to load dropdown data';
        setMessage({ type: 'danger', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchInnerLocations = async (stateId) => {
    try {
      console.log('Fetching branch inner locations for state ID:', stateId);
      const response = await api.get('branch-inner-locations/', {
        params: { branch_inner_state: stateId }
      });
      
      console.log('Branch inner locations response:', response.data);
      
      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }
      
      setBranchInnerLocations(locationsData);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to load branch locations' 
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values to integers for IDs
    const processedValue = ['vendor_bank', 'dsa_name', 'loan_type', 'branch_inner_state', 'branch_inner_location'].includes(name)
      ? value === '' ? '' : parseInt(value, 10)
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - only inner fields are required now
    const requiredFields = ['vendor_bank', 'dsa_code', 'dsa_name', 'loan_type', 'branch_inner_state', 'branch_inner_location'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setMessage({ 
        type: 'danger', 
        text: `Please fill all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}` 
      });
      return;
    }

    if (formData.dsa_code.trim() === '') {
      setMessage({ type: 'danger', text: 'DSA Code cannot be empty' });
      return;
    }

    // Prepare data for submission - send only the fields we have
    const submitData = {
      vendor_bank: parseInt(formData.vendor_bank, 10),
      dsa_code: formData.dsa_code.trim(),
      dsa_name: parseInt(formData.dsa_name, 10),
      loan_type: parseInt(formData.loan_type, 10),
      branch_inner_state: parseInt(formData.branch_inner_state, 10),
      branch_inner_location: parseInt(formData.branch_inner_location, 10)
      // branch_state and branch_location are not sent (they'll be NULL in DB)
    };

    console.log('Submitting DSA Code data:', submitData);

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isEditing && editId 
        ? `dsa-codes/${editId}/` 
        : 'dsa-codes/';
      
      const method = isEditing && editId ? 'put' : 'post';
      
      const response = await api[method](endpoint, submitData);
      
      console.log('Success response:', response.data);
      
      setMessage({ 
        type: 'success', 
        text: `DSA Code ${isEditing ? 'updated' : 'added'} successfully!` 
      });

      resetForm();
      
      // Trigger refresh in parent component if needed
      if (window.refreshDsaList) {
        window.refreshDsaList();
      }
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response);
      
      let errorMsg = 'Failed to save DSA Code';
      
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.status === 400) {
          const errorData = error.response.data;
          
          if (typeof errorData === 'object') {
            const errorMessages = [];
            Object.keys(errorData).forEach(field => {
              const fieldErrors = errorData[field];
              if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              errorMsg = errorMessages.join('; ');
            } else {
              errorMsg = 'Validation error. Please check your input.';
            }
          } else if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (errorData.detail) {
            errorMsg = errorData.detail;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }
        } else if (error.response.status === 401) {
          errorMsg = 'Session expired. Please login again.';
        } else {
          errorMsg = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMsg = 'No response from server. Check your network connection.';
      } else {
        errorMsg = error.message;
      }
      
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Update setEditData to handle the optional fields
  const setEditData = (dsaCode) => {
    console.log('Setting edit data:', dsaCode);
    
    setFormData({
      vendor_bank: dsaCode.vendor_bank || dsaCode.vendor_bank_id || '',
      dsa_code: dsaCode.dsa_code || '',
      dsa_name: dsaCode.dsa_name || dsaCode.dsa_name_id || '',
      loan_type: dsaCode.loan_type || dsaCode.loan_type_id || '',
      branch_inner_state: dsaCode.branch_inner_state || dsaCode.branch_inner_state_id || '',
      branch_inner_location: dsaCode.branch_inner_location || dsaCode.branch_inner_location_id || ''
    });
    
    setEditId(dsaCode.id);
    setIsEditing(true);
    setMessage({ type: '', text: '' });
    
    // If branch inner state exists, fetch locations for that state
    if (dsaCode.branch_inner_state || dsaCode.branch_inner_state_id) {
      fetchBranchInnerLocations(dsaCode.branch_inner_state || dsaCode.branch_inner_state_id);
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_bank: '',
      dsa_code: '',
      dsa_name: '',
      loan_type: '',
      branch_inner_state: '',
      branch_inner_location: ''
    });
    setEditId(null);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
    setBranchInnerLocations([]);
  };

  return (
    <div className="card shadow-sm border-0" style={{ border: '1px solid #dee2e6' }}>
      <div className="card-header bg-light border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
        <h5 className="mb-0 fw-semibold text-dark">
          <i className="bi bi-plus-circle me-2 text-primary"></i>
          {isEditing ? 'Edit DSA Code' : 'Add New DSA Code'}
        </h5>
      </div>
      <div className="card-body p-4">
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show mb-4 border-0 shadow-sm`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2 fs-5`}></i>
              <div className="fw-medium">{message.text}</div>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ type: '', text: '' })}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Vendor Bank */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="vendor_bank" className="form-label fw-semibold text-dark">
                  <i className="bi bi-bank me-1 text-muted"></i>
                  Vendor Bank <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select border py-3"
                  id="vendor_bank"
                  name="vendor_bank"
                  value={formData.vendor_bank}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  style={{ 
                    width: '100%', 
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Vendor Bank</option>
                  {vendorBanks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.vendor_name || bank.name || `Bank ${bank.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DSA Code */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="dsa_code" className="form-label fw-semibold text-dark">
                  <i className="bi bi-qr-code me-1 text-muted"></i>
                  DSA Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control border py-3"
                  id="dsa_code"
                  name="dsa_code"
                  value={formData.dsa_code}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter DSA Code"
                  required
                  maxLength="50"
                  style={{ 
                    width: '100%',
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* DSA Name */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="dsa_name" className="form-label fw-semibold text-dark">
                  <i className="bi bi-person-badge me-1 text-muted"></i>
                  DSA Name <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select border py-3"
                  id="dsa_name"
                  name="dsa_name"
                  value={formData.dsa_name}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  style={{ 
                    width: '100%', 
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select DSA Name</option>
                  {dsaNames.map(dsa => (
                    <option key={dsa.id} value={dsa.id}>
                      {dsa.dsa_name || dsa.name || `DSA ${dsa.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type of Loan */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="loan_type" className="form-label fw-semibold text-dark">
                  <i className="bi bi-cash-stack me-1 text-muted"></i>
                  Type Of Loan <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select border py-3"
                  id="loan_type"
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  style={{ 
                    width: '100%', 
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Loan Type</option>
                  {loanTypes.map(loan => (
                    <option key={loan.id} value={loan.id}>
                      {loan.loan_type || loan.name || `Loan ${loan.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch Inner State */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="branch_inner_state" className="form-label fw-semibold text-dark">
                  <i className="bi bi-geo-alt me-1 text-muted"></i>
                  Branch Inner State <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select border py-3"
                  id="branch_inner_state"
                  name="branch_inner_state"
                  value={formData.branch_inner_state}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  style={{ 
                    width: '100%', 
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Branch Inner State</option>
                  {branchInnerStates.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name || state.state_name || state.state || `State ${state.id}`}
                    </option>
                  ))}
                </select>
                {branchInnerStates.length === 0 && !loading && (
                  <div className="mt-1 text-muted small">
                    <i className="bi bi-info-circle"></i> No states available
                  </div>
                )}
              </div>
            </div>

            {/* Branch Inner Location */}
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="branch_inner_location" className="form-label fw-semibold text-dark">
                  <i className="bi bi-geo me-1 text-muted"></i>
                  Branch Inner Location <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select border py-3"
                  id="branch_inner_location"
                  name="branch_inner_location"
                  value={formData.branch_inner_location}
                  onChange={handleInputChange}
                  disabled={!formData.branch_inner_state || loading}
                  required
                  style={{ 
                    width: '100%', 
                    borderColor: '#ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">
                    {!formData.branch_inner_state 
                      ? 'Select State First'
                      : branchInnerLocations.length === 0
                      ? 'No locations available'
                      : 'Select Branch Inner Location'}
                  </option>
                  {branchInnerLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name || location.location_name || location.location || `Location ${location.id}`}
                    </option>
                  ))}
                </select>
                {formData.branch_inner_state && branchInnerLocations.length === 0 && !loading && (
                  <div className="mt-1 text-warning small">
                    <i className="bi bi-exclamation-triangle"></i> No locations found for this state
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-12 mt-2 pt-4 border-top">
              <div className="d-flex justify-content-end gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2 fw-semibold border"
                      onClick={resetForm}
                      disabled={loading}
                      style={{ 
                        borderColor: '#ced4da',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success px-4 py-2 fw-semibold border-0"
                      disabled={loading}
                      style={{ borderRadius: '0.375rem' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update DSA Code
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2 fw-semibold border"
                      onClick={resetForm}
                      disabled={loading}
                      style={{ 
                        borderColor: '#ced4da',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 fw-semibold border-0"
                      disabled={loading}
                      style={{ borderRadius: '0.375rem' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Add DSA Code
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDsa;