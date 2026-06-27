import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import { useNavigate } from 'react-router-dom';
import AsstManager_Sidebar from "../Sidebar/AsstManager_Sidebar.jsx";
import "../Sidebar/AsstManager_Sidebar.css";

const AManager_Add = () => {
  const navigate = useNavigate();

  // State for form fields
  const [form, setForm] = useState({
    vendor_bank: '',
    banker_designation: '',
    branch_state: '',
    branch_location: '',
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
  const [branchStates, setBranchStates] = useState([]);
  const [branchLocations, setBranchLocations] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load dropdowns
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch branch locations when branch state changes
  useEffect(() => {
    if (form.branch_state) {
      fetchBranchLocations(form.branch_state);
    } else {
      setBranchLocations([]);
      setForm(prev => ({ ...prev, branch_location: '' }));
    }
  }, [form.branch_state]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      // Fetch all dropdowns in parallel
      const [
        vendorBanksRes,
        designationsRes,
        branchStatesRes,
        loanTypesRes
      ] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('vendor-bank-designations/'),
        api.get('branch-inner-states/'),
        api.get('loan-types/')
      ]);

      setVendorBanks(vendorBanksRes.data || []);
      setDesignations(designationsRes.data || []);
      setBranchStates(branchStatesRes.data || []);
      setLoanTypes(loanTypesRes.data || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);

      if (error.response?.status === 401) {
        setMessage({
          type: 'danger',
          text: 'Session expired. Please login again.'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        setMessage({
          type: 'warning',
          text: 'API endpoint not found. Please check the endpoint URLs.'
        });
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

  const fetchBranchLocations = async (stateId) => {
    try {
      const response = await api.get('branch-inner-locations/', {
        params: { branch_state: stateId }
      });
      setBranchLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching branch locations:', error);
      setMessage({
        type: 'danger',
        text: 'Failed to load branch locations'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'visiting_card') {
      setForm({
        ...form,
        [name]: files ? files[0] : null
      });
    } else {
      // Convert numeric IDs
      const processedValue = ['vendor_bank', 'banker_designation', 'branch_state', 'branch_location', 'loan_type'].includes(name)
        ? value === '' ? '' : parseInt(value)
        : value;

      setForm({
        ...form,
        [name]: processedValue
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = [
      'vendor_bank', 'banker_designation', 'branch_state',
      'branch_location', 'loan_type', 'banker_name',
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
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

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
        branch_state: '',
        branch_location: '',
        loan_type: '',
        banker_name: '',
        phone_no: '',
        email: '',
        address: '',
        visiting_card: null,
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error adding banker:', error);
      console.error('Error details:', error.response?.data);

      let errorMsg = 'Failed to add banker';

      if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again.';
      } else if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object') {
          // Try to extract error messages
          const errors = [];
          Object.entries(data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages[0]}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          });
          errorMsg = errors.length > 0 ? errors.join(', ') : JSON.stringify(data);
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
      branch_state: '',
      branch_location: '',
      loan_type: '',
      banker_name: '',
      phone_no: '',
      email: '',
      address: '',
      visiting_card: null,
    });
    setMessage({ type: '', text: '' });
  };

  // Golden yellow/amber color palette
  const amberColors = {
    primary: '#fbbf24', // amber-400
    primaryDark: '#f59e0b', // amber-500
    primaryLight: '#fcd34d', // amber-300
    accent: '#d97706', // amber-600
    background: '#fffbeb', // amber-50
    border: '#fde68a', // amber-200
    text: '#92400e', // amber-800
    textLight: '#b45309', // amber-700
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      <AsstManager_Sidebar />
      {/* Main Content Area - Add marginLeft to account for sidebar width */}
      <div style={{
        flex: 1,
        marginLeft: '280px', // Adjust this value based on your sidebar width
        width: 'calc(100% - 280px)',
        backgroundColor: amberColors.background,
        minHeight: '100vh'
      }}>
        <div className="container-fluid py-4">
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold mb-1" style={{ color: amberColors.accent }}>Add Banker</h1>
              <p className="mb-0" style={{ color: amberColors.textLight }}>Add new bank officers and representatives</p>
            </div>
            <div
              className="badge px-3 py-2 rounded-pill fw-semibold"
              style={{
                backgroundColor: amberColors.primaryLight,
                color: amberColors.accent
              }}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add New Banker
            </div>
          </div>

          {/* Form Section */}
          <div className="card shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div
              className="card-header border-0"
              style={{
                background: `linear-gradient(135deg, ${amberColors.primary} 0%, ${amberColors.accent} 100%)`,
                padding: '1.25rem 1.5rem'
              }}
            >
              <h5 className="mb-0 fw-semibold text-white">
                <i className="bi bi-person-plus me-2"></i>
                Banker Information Form
              </h5>
            </div>
            <div className="card-body p-4">
              {message.text && (
                <div
                  className={`alert alert-${message.type} alert-dismissible fade show mb-4 border-0 shadow-sm`}
                  role="alert"
                  style={{
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    borderLeft: `4px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-2 fs-5`}></i>
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
                      <label htmlFor="vendor_bank" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-bank me-1" style={{ color: amberColors.primaryDark }}></i>
                        Vendor Bank <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border w-100"
                        id="vendor_bank"
                        name="vendor_bank"
                        value={form.vendor_bank}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      >
                        <option value="">Select Vendor Bank</option>
                        {vendorBanks.map(bank => (
                          <option key={bank.id} value={bank.id}>
                            {bank.vendor_name || `Bank ${bank.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Banker Designation */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="banker_designation" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-award me-1" style={{ color: amberColors.primaryDark }}></i>
                        Banker Designation <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border w-100"
                        id="banker_designation"
                        name="banker_designation"
                        value={form.banker_designation}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      >
                        <option value="">Select Designation</option>
                        {designations.map(designation => (
                          <option key={designation.id} value={designation.id}>
                            {designation.designation_name || `Designation ${designation.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Banker Name */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="banker_name" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-person-badge me-1" style={{ color: amberColors.primaryDark }}></i>
                        Banker Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control border w-100"
                        id="banker_name"
                        name="banker_name"
                        value={form.banker_name}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter full name"
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="phone_no" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-telephone me-1" style={{ color: amberColors.primaryDark }}></i>
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control border w-100"
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
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-envelope me-1" style={{ color: amberColors.primaryDark }}></i>
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control border w-100"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter email address"
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Branch State */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="branch_state" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-geo-alt me-1" style={{ color: amberColors.primaryDark }}></i>
                        Branch State <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border w-100"
                        id="branch_state"
                        name="branch_state"
                        value={form.branch_state}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      >
                        <option value="">Select Branch State</option>
                        {branchStates.map(state => (
                          <option key={state.id} value={state.id}>
                            {state.name || `State ${state.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Branch Location */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="branch_location" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-geo me-1" style={{ color: amberColors.primaryDark }}></i>
                        Branch Location <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border w-100"
                        id="branch_location"
                        name="branch_location"
                        value={form.branch_location}
                        onChange={handleChange}
                        disabled={!form.branch_state || loading}
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      >
                        <option value="">
                          {!form.branch_state
                            ? 'Select State First'
                            : 'Select Branch Location'}
                        </option>
                        {branchLocations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name || `Location ${location.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Loan Type */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="mb-3">
                      <label htmlFor="loan_type" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-cash-stack me-1" style={{ color: amberColors.primaryDark }}></i>
                        Loan Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border w-100"
                        id="loan_type"
                        name="loan_type"
                        value={form.loan_type}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      >
                        <option value="">Select Loan Type</option>
                        {loanTypes.map(loan => (
                          <option key={loan.id} value={loan.id}>
                            {loan.loan_type || `Loan ${loan.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-house-door me-1" style={{ color: amberColors.primaryDark }}></i>
                        Address <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control border w-100"
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter complete address"
                        rows="3"
                        required
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.625rem 1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Visiting Card */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label htmlFor="visiting_card" className="form-label fw-semibold" style={{ color: amberColors.text }}>
                        <i className="bi bi-card-image me-1" style={{ color: amberColors.primaryDark }}></i>
                        Visiting Card (Optional)
                      </label>
                      <input
                        type="file"
                        className="form-control border w-100"
                        id="visiting_card"
                        name="visiting_card"
                        onChange={handleChange}
                        disabled={loading}
                        accept="image/*,.pdf"
                        style={{
                          borderColor: amberColors.border,
                          borderRadius: '8px',
                          padding: '0.5rem 1rem'
                        }}
                      />
                      <small className="text-muted" style={{ color: amberColors.textLight }}>Upload visiting card image or PDF (Max: 5MB)</small>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-12 mt-2 pt-4 border-top" style={{ borderColor: amberColors.border }}>
                    <div className="d-flex justify-content-end gap-3">
                      <button
                        type="button"
                        className="btn px-4 py-2 fw-semibold border"
                        onClick={resetForm}
                        disabled={loading}
                        style={{
                          borderColor: amberColors.border,
                          color: amberColors.text,
                          borderRadius: '8px',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fef3c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="btn px-4 py-2 fw-semibold border-0 text-white"
                        disabled={loading}
                        style={{
                          background: `linear-gradient(135deg, ${amberColors.primary} 0%, ${amberColors.accent} 100%)`,
                          borderRadius: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = `linear-gradient(135deg, ${amberColors.primaryDark} 0%, ${amberColors.accent} 100%)`}
                        onMouseLeave={(e) => e.target.style.background = `linear-gradient(135deg, ${amberColors.primary} 0%, ${amberColors.accent} 100%)`}
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
      </div>
    </div>
  );
};

export default AManager_Add;