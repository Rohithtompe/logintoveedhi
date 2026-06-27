import React, { useState, useEffect } from 'react';
import api from '../../../api';

const AddBanker = () => {
  // State for form fields - ONLY inner state and location
  const [form, setForm] = useState({
    vendor_bank: '',
    banker_designation: '',
    branch_inner_state: '',   // Required
    branch_inner_location: '', // Required
    loan_type: '',
    banker_name: '',
    phone_no: '',
    email: '',
    address: '',
    visiting_card: null,
  });

  // State for dropdown data
  const [vendorBanks, setVendorBanks] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});

  // Load dropdowns
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch branch inner locations when branch inner state changes
  useEffect(() => {
    if (form.branch_inner_state) {
      fetchBranchInnerLocations(form.branch_inner_state);
    } else {
      setBranchInnerLocations([]);
      setForm(prev => ({ ...prev, branch_inner_location: '' }));
    }
  }, [form.branch_inner_state]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      // Fetch only required dropdowns
      const [
        vendorBanksRes,
        designationsRes,
        branchInnerStatesRes,
        loanTypesRes
      ] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('vendor-bank-designations/'),
        api.get('branch-inner-states/'),    // Only inner states
        api.get('loan-types/')
      ]);

      setVendorBanks(vendorBanksRes.data || []);
      setDesignations(designationsRes.data || []);
      
      // Handle different response formats for branch inner states
      let innerStatesData = [];
      if (Array.isArray(branchInnerStatesRes.data)) {
        innerStatesData = branchInnerStatesRes.data;
      } else if (branchInnerStatesRes.data.results) {
        innerStatesData = branchInnerStatesRes.data.results;
      }
      setBranchInnerStates(innerStatesData);

      setLoanTypes(loanTypesRes.data || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'danger', 
          text: 'Session expired. Please login again.' 
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ 
          type: 'danger', 
          text: 'Failed to load dropdown data. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchInnerLocations = async (stateId) => {
    try {
      const response = await api.get('branch-inner-locations/', {
        params: { branch_inner_state: stateId }
      });
      
      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }
      setBranchInnerLocations(locationsData);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'visiting_card') {
      setForm({
        ...form,
        [name]: files ? files[0] : null
      });
    } else {
      // Convert numeric IDs
      const processedValue = [
        'vendor_bank', 'banker_designation', 
        'branch_inner_state', 'branch_inner_location',
        'loan_type'
      ].includes(name)
        ? value === '' ? '' : parseInt(value, 10)
        : value;
      
      setForm({
        ...form,
        [name]: processedValue
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validation - only inner fields are required
    const requiredFields = [
      'vendor_bank', 'banker_designation', 
      'branch_inner_state', 'branch_inner_location',
      'loan_type', 'banker_name', 
      'phone_no', 'email', 'address'
    ];
    
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setMessage({ 
        type: 'danger', 
        text: `Please fill all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}` 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ type: 'danger', text: 'Please enter a valid email address' });
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone_no)) {
      setMessage({ type: 'danger', text: 'Please enter a valid 10-digit phone number' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      
      // Append all required fields
      formData.append('vendor_bank', form.vendor_bank);
      formData.append('banker_designation', form.banker_designation);
      formData.append('branch_inner_state', form.branch_inner_state);
      formData.append('branch_inner_location', form.branch_inner_location);
      formData.append('loan_type', form.loan_type);
      formData.append('banker_name', form.banker_name);
      formData.append('phone_no', form.phone_no);
      formData.append('email', form.email);
      formData.append('address', form.address);
      
      // Note: branch_state and branch_location are NOT sent at all
      // They will be NULL in the database
      
      // Append visiting card if selected
      if (form.visiting_card instanceof File) {
        formData.append('visiting_card', form.visiting_card);
      }

      console.log('Submitting form data:', Object.fromEntries(formData));

      await api.post('bankers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Banker added successfully!' 
      });

      // Reset form
      setForm({
        vendor_bank: '',
        banker_designation: '',
        branch_inner_state: '',
        branch_inner_location: '',
        loan_type: '',
        banker_name: '',
        phone_no: '',
        email: '',
        address: '',
        visiting_card: null,
      });
      setBranchInnerLocations([]);

      // Reset file input
      const fileInput = document.getElementById('visiting_card');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error adding banker:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMsg = 'Failed to add banker';
      
      if (error.response) {
        if (error.response.status === 400) {
          const errorData = error.response.data;
          
          if (typeof errorData === 'object') {
            // Set field-specific validation errors
            setValidationErrors(errorData);
            
            // Create a readable error message
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
            }
          } else if (errorData.detail) {
            errorMsg = errorData.detail;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }
        } else if (error.response.status === 401) {
          errorMsg = 'Session expired. Please login again.';
        }
      }
      
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      vendor_bank: '',
      banker_designation: '',
      branch_inner_state: '',
      branch_inner_location: '',
      loan_type: '',
      banker_name: '',
      phone_no: '',
      email: '',
      address: '',
      visiting_card: null,
    });
    setBranchInnerLocations([]);
    setValidationErrors({});
    // Reset file input
    const fileInput = document.getElementById('visiting_card');
    if (fileInput) fileInput.value = '';
    setMessage({ type: '', text: '' });
  };

  // Helper function to get field error
  const getFieldError = (fieldName) => {
    if (validationErrors[fieldName]) {
      const error = validationErrors[fieldName];
      if (Array.isArray(error)) {
        return error[0];
      }
      return error;
    }
    return null;
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-primary mb-1">Add Banker</h1>
          <p className="text-muted mb-0">Add new bank officers and representatives</p>
        </div>
        <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
          <i className="bi bi-person-plus me-2"></i>
          Add New
        </div>
      </div>

      {/* Form Section */}
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white border-0 rounded-top-3 py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-person-plus me-2"></i>
            Add New Banker
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
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="vendor_bank" className="form-label fw-semibold text-dark">
                    <i className="bi bi-bank me-1 text-muted"></i>
                    Vendor Bank <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select form-select-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('vendor_bank') ? 'is-invalid' : ''}`}
                    id="vendor_bank"
                    name="vendor_bank"
                    value={form.vendor_bank}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="">Select Vendor Bank</option>
                    {vendorBanks.map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.vendor_name || `Bank ${bank.id}`}
                      </option>
                    ))}
                  </select>
                  {getFieldError('vendor_bank') && (
                    <div className="invalid-feedback d-block">{getFieldError('vendor_bank')}</div>
                  )}
                </div>
              </div>

              {/* Banker Designation */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="banker_designation" className="form-label fw-semibold text-dark">
                    <i className="bi bi-award me-1 text-muted"></i>
                    Banker Designation <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select form-select-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('banker_designation') ? 'is-invalid' : ''}`}
                    id="banker_designation"
                    name="banker_designation"
                    value={form.banker_designation}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="">Select Designation</option>
                    {designations.map(designation => (
                      <option key={designation.id} value={designation.id}>
                        {designation.designation_name || `Designation ${designation.id}`}
                      </option>
                    ))}
                  </select>
                  {getFieldError('banker_designation') && (
                    <div className="invalid-feedback d-block">{getFieldError('banker_designation')}</div>
                  )}
                </div>
              </div>

              {/* Banker Name */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="banker_name" className="form-label fw-semibold text-dark">
                    <i className="bi bi-person-badge me-1 text-muted"></i>
                    Banker Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('banker_name') ? 'is-invalid' : ''}`}
                    id="banker_name"
                    name="banker_name"
                    value={form.banker_name}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter full name"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {getFieldError('banker_name') && (
                    <div className="invalid-feedback d-block">{getFieldError('banker_name')}</div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="phone_no" className="form-label fw-semibold text-dark">
                    <i className="bi bi-telephone me-1 text-muted"></i>
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control form-control-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('phone_no') ? 'is-invalid' : ''}`}
                    id="phone_no"
                    name="phone_no"
                    value={form.phone_no}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {getFieldError('phone_no') && (
                    <div className="invalid-feedback d-block">{getFieldError('phone_no')}</div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold text-dark">
                    <i className="bi bi-envelope me-1 text-muted"></i>
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('email') ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter email address"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {getFieldError('email') && (
                    <div className="invalid-feedback d-block">{getFieldError('email')}</div>
                  )}
                </div>
              </div>

              {/* Branch Inner State (Required) */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="branch_inner_state" className="form-label fw-semibold text-dark">
                    <i className="bi bi-geo-alt-fill me-1 text-muted"></i>
                    Branch Inner State <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select form-select-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('branch_inner_state') ? 'is-invalid' : ''}`}
                    id="branch_inner_state"
                    name="branch_inner_state"
                    value={form.branch_inner_state}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="">Select Branch Inner State</option>
                    {branchInnerStates.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name || `Inner State ${state.id}`}
                      </option>
                    ))}
                  </select>
                  {getFieldError('branch_inner_state') && (
                    <div className="invalid-feedback d-block">{getFieldError('branch_inner_state')}</div>
                  )}
                </div>
              </div>

              {/* Branch Inner Location (Required) */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="branch_inner_location" className="form-label fw-semibold text-dark">
                    <i className="bi bi-geo-fill me-1 text-muted"></i>
                    Branch Inner Location <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select form-select-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('branch_inner_location') ? 'is-invalid' : ''}`}
                    id="branch_inner_location"
                    name="branch_inner_location"
                    value={form.branch_inner_location}
                    onChange={handleChange}
                    disabled={!form.branch_inner_state || loading}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: !form.branch_inner_state ? '#e9ecef' : '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      opacity: !form.branch_inner_state ? 0.65 : 1,
                      width: '100%'
                    }}
                  >
                    <option value="">
                      {!form.branch_inner_state 
                        ? 'Select Inner State First'
                        : branchInnerLocations.length === 0
                        ? 'No locations available'
                        : 'Select Branch Inner Location'}
                    </option>
                    {branchInnerLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name || `Inner Location ${location.id}`}
                      </option>
                    ))}
                  </select>
                  {getFieldError('branch_inner_location') && (
                    <div className="invalid-feedback d-block">{getFieldError('branch_inner_location')}</div>
                  )}
                </div>
              </div>

              {/* Loan Type */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="mb-3">
                  <label htmlFor="loan_type" className="form-label fw-semibold text-dark">
                    <i className="bi bi-cash-stack me-1 text-muted"></i>
                    Loan Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select form-select-lg border-0 bg-light shadow-sm rounded-3 ${getFieldError('loan_type') ? 'is-invalid' : ''}`}
                    id="loan_type"
                    name="loan_type"
                    value={form.loan_type}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="">Select Loan Type</option>
                    {loanTypes.map(loan => (
                      <option key={loan.id} value={loan.id}>
                        {loan.loan_type || `Loan ${loan.id}`}
                      </option>
                    ))}
                  </select>
                  {getFieldError('loan_type') && (
                    <div className="invalid-feedback d-block">{getFieldError('loan_type')}</div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="col-12">
                <div className="mb-3">
                  <label htmlFor="address" className="form-label fw-semibold text-dark">
                    <i className="bi bi-house-door me-1 text-muted"></i>
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control border-0 bg-light shadow-sm rounded-3 ${getFieldError('address') ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter complete address"
                    rows="3"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem',
                      resize: 'vertical'
                    }}
                  />
                  {getFieldError('address') && (
                    <div className="invalid-feedback d-block">{getFieldError('address')}</div>
                  )}
                </div>
              </div>

              {/* Visiting Card */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label htmlFor="visiting_card" className="form-label fw-semibold text-dark">
                    <i className="bi bi-card-image me-1 text-muted"></i>
                    Visiting Card (Optional)
                  </label>
                  <input
                    type="file"
                    className={`form-control border-0 bg-light shadow-sm rounded-3 ${getFieldError('visiting_card') ? 'is-invalid' : ''}`}
                    id="visiting_card"
                    name="visiting_card"
                    onChange={handleChange}
                    disabled={loading}
                    accept="image/*,.pdf"
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {getFieldError('visiting_card') && (
                    <div className="invalid-feedback d-block">{getFieldError('visiting_card')}</div>
                  )}
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Upload visiting card image or PDF (Max: 5MB)
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-12 mt-2 pt-4 border-top">
                <div className="d-flex justify-content-end gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3"
                    onClick={resetForm}
                    disabled={loading}
                    style={{
                      padding: '12px 24px'
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 fw-semibold rounded-3"
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(45deg, #0d6efd, #0b5ed7)',
                      border: 'none'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Banker
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBanker;