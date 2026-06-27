import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import { useNavigate } from 'react-router-dom';
import Director_Sidebar from "../../Director/Sidebar/Director_Sidebar.jsx";
import "../../Director/Sidebar/Director_Sidebar.css";

const Listbank = () => {
  const navigate = useNavigate();
  const [bankers, setBankers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Dropdown data for display
  const [vendorBanks, setVendorBanks] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [filteredInnerLocations, setFilteredInnerLocations] = useState([]);

  // Golden yellow/amber color palette
  const amberColors = {
    primary: '#fbbf24',
    primaryDark: '#f59e0b',
    primaryLight: '#fcd34d',
    accent: '#d97706',
    background: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    textLight: '#b45309',
  };

  // Load bankers and dropdown data
  useEffect(() => {
    fetchBankers();
    fetchDropdownData();
  }, []);

  // Fetch inner locations when inner state changes in edit mode
  useEffect(() => {
    if (editingId && editForm.branch_inner_state) {
      fetchBranchInnerLocations(editForm.branch_inner_state);
    } else if (editingId && !editForm.branch_inner_state) {
      setFilteredInnerLocations([]);
    }
  }, [editForm.branch_inner_state, editingId]);

  const fetchDropdownData = async () => {
    try {
      const [
        vendorBanksRes,
        designationsRes,
        branchInnerStatesRes,
        loanTypesRes
      ] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('vendor-bank-designations/'),
        api.get('branch-inner-states/'), // Changed to inner states
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
      
      // Fetch all inner locations
      fetchAllBranchInnerLocations();
      
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to load dropdown data' 
      });
    }
  };

  const fetchAllBranchInnerLocations = async () => {
    try {
      const response = await api.get('branch-inner-locations/');
      
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

  const fetchBranchInnerLocations = async (stateId) => {
    try {
      const response = await api.get('branch-inner-locations/', {
        params: { branch_inner_state: stateId } // Changed parameter name
      });
      
      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }
      setFilteredInnerLocations(locationsData);
    } catch (error) {
      console.error('Error fetching filtered inner locations:', error);
    }
  };

  const fetchBankers = async () => {
    setTableLoading(true);
    try {
      const response = await api.get('bankers/');
      setBankers(response.data || []);
    } catch (error) {
      console.error('Error fetching bankers:', error);
      
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'danger', 
          text: 'Session expired. Please login again.' 
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ 
          type: 'danger', 
          text: 'Failed to load bankers list' 
        });
      }
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete banker "${name}"? This action cannot be undone.`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      setTableLoading(true);
      await api.delete(`bankers/${id}/`);
      
      setMessage({ type: 'success', text: 'Banker deleted successfully!' });
      fetchBankers();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error deleting banker:', error);
      let errorMsg = 'Failed to delete banker';
      
      if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again.';
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setTableLoading(false);
    }
  };

  // Start inline editing
  const handleEditClick = (banker) => {
    setEditingId(banker.id);
    setEditForm({
      banker_name: banker.banker_name || '',
      phone_no: banker.phone_no || '',
      email: banker.email || '',
      vendor_bank: banker.vendor_bank || '',
      banker_designation: banker.banker_designation || '',
      loan_type: banker.loan_type || '',
      branch_inner_state: banker.branch_inner_state || '',
      branch_inner_location: banker.branch_inner_location || '',
      visiting_card: banker.visiting_card || null
    });
    
    // If inner state exists, fetch locations for that state
    if (banker.branch_inner_state) {
      fetchBranchInnerLocations(banker.branch_inner_state);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setFilteredInnerLocations([]);
  };

  // Save edited data
  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Add all fields to formData
      Object.keys(editForm).forEach(key => {
        if (key !== 'visiting_card') {
          formData.append(key, editForm[key] || '');
        }
      });

      // If visiting_card is a file, append it
      if (editForm.visiting_card && editForm.visiting_card instanceof File) {
        formData.append('visiting_card', editForm.visiting_card);
      }

      await api.patch(`bankers/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage({ type: 'success', text: 'Banker updated successfully!' });
      setEditingId(null);
      setEditForm({});
      setFilteredInnerLocations([]);
      fetchBankers();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating banker:', error);
      let errorMsg = 'Failed to update banker';
      
      if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again.';
      } else if (error.response?.data) {
        const errors = Object.values(error.response.data).flat().join(', ');
        errorMsg = errors || errorMsg;
      }
      
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric IDs
    const processedValue = [
      'vendor_bank', 'banker_designation', 
      'branch_inner_state', 'branch_inner_location',
      'loan_type'
    ].includes(name)
      ? value === '' ? '' : parseInt(value, 10)
      : value;
    
    setEditForm(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm(prev => ({
      ...prev,
      visiting_card: file
    }));
  };

  // Helper function to get name by ID
  const getNameById = (id, array, nameField = 'name') => {
    if (!id || !array || array.length === 0) return 'N/A';
    
    const item = array.find(item => 
      item.id === id || 
      item.id === parseInt(id)
    );
    
    if (!item) return 'N/A';
    
    if (nameField === 'vendor_name') {
      return item.vendor_name || item.name || 'N/A';
    } else if (nameField === 'designation_name') {
      return item.designation_name || item.name || 'N/A';
    } else if (nameField === 'loan_type') {
      return item.loan_type || item.name || 'N/A';
    } else {
      return item.name || item[nameField] || 'N/A';
    }
  };

  // Function to get file URL or preview
  const getFilePreview = (fileUrl) => {
    if (!fileUrl) return null;
    
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileUrl);
    const isPDF = /\.pdf$/i.test(fileUrl);
    
    if (isImage) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={fileUrl} 
            alt="Visiting Card" 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            className="border"
          />
        </a>
      );
    } else if (isPDF) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: amberColors.primaryLight, color: amberColors.accent, padding: '4px 8px', fontSize: '12px' }}>
          <i className="bi bi-file-pdf"></i> PDF
        </a>
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: amberColors.primaryLight, color: amberColors.accent, padding: '4px 8px', fontSize: '12px' }}>
          <i className="bi bi-download"></i> Download
        </a>
      );
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      <Director_Sidebar />
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        width: 'calc(100% - 280px)',
        backgroundColor: amberColors.background,
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="container-fluid py-4">
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold mb-1" style={{ color: amberColors.accent }}>Bankers List</h1>
              <p className="mb-0" style={{ color: amberColors.textLight }}>View and manage all bank officers and representatives</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="badge px-3 py-2 rounded-pill fw-semibold"
                style={{ 
                  backgroundColor: amberColors.primaryLight,
                  color: amberColors.accent
                }}
              >
                <i className="bi bi-people me-2"></i>
                {bankers.length} Total Bankers
              </div>
            </div>
          </div>

          {/* Message Alert */}
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

          {/* Table Section */}
          <div className="card shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div 
              className="card-header border-0"
              style={{ 
                background: `linear-gradient(135deg, ${amberColors.primary} 0%, ${amberColors.accent} 100%)`,
                padding: '1rem 1.5rem'
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold text-white">
                  <i className="bi bi-list-ul me-2"></i>
                  All Bankers
                </h5>
                <button 
                  className="btn btn-sm fw-medium text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  onClick={fetchBankers}
                  disabled={tableLoading}
                >
                  {tableLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-arrow-clockwise me-2"></i>
                  )}
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="card-body p-0">
              {tableLoading && !saving ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: amberColors.accent, width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 fw-medium" style={{ color: amberColors.textLight }}>Loading Bankers...</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0" style={{ minWidth: '1400px' }}>
                    <thead style={{ backgroundColor: '#fef3c7' }}>
                      <tr>
                        <th className="ps-4 py-3 fw-semibold" style={{ color: amberColors.accent, width: '5%' }}>S.No</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '10%' }}>Vendor Bank</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '10%' }}>Banker Name</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '10%' }}>Designation</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '8%' }}>Mobile No</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '12%' }}>Email</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '8%' }}>Loan Type</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '8%' }}>Inner State</th>
                        <th className="py-3 fw-semibold" style={{ color: amberColors.accent, width: '8%' }}>Inner Location</th>
                        <th className="py-3 fw-semibold text-center" style={{ color: amberColors.accent, width: '8%' }}>Card</th>
                        <th className="text-center pe-4 py-3 fw-semibold" style={{ color: amberColors.accent, width: '13%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankers.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="text-center py-5">
                            <div style={{ color: amberColors.textLight }}>
                              <i className="bi bi-people fs-1 d-block mb-3 opacity-25"></i>
                              <p className="h5 fw-semibold mb-2">No Bankers found</p>
                              <p className="mb-0">Add your first banker using the "Add New Banker" button</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bankers.map((banker, index) => {
                          // Get display values
                          const vendorBankName = getNameById(banker.vendor_bank, vendorBanks, 'vendor_name');
                          const bankerName = banker.banker_name || 'N/A';
                          const designationName = getNameById(banker.banker_designation, designations, 'designation_name');
                          const phoneNo = banker.phone_no || 'N/A';
                          const email = banker.email || 'N/A';
                          const loanTypeName = getNameById(banker.loan_type, loanTypes, 'loan_type');
                          const stateName = getNameById(banker.branch_inner_state, branchInnerStates);
                          const locationName = getNameById(banker.branch_inner_location, branchInnerLocations);
                          
                          return (
                            <tr key={banker.id} className="border-bottom" style={{ borderColor: amberColors.border }}>
                              <td className="ps-4 fw-semibold align-middle" style={{ color: amberColors.textLight }}>{index + 1}</td>
                              
                              {/* Vendor Bank */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="vendor_bank"
                                    value={editForm.vendor_bank || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '140px' }}
                                  >
                                    <option value="">Select Bank</option>
                                    {vendorBanks.map(bank => (
                                      <option key={bank.id} value={bank.id}>
                                        {bank.vendor_name || bank.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="fw-medium" style={{ color: amberColors.text, fontWeight: '500' }}>
                                    {vendorBankName}
                                  </span>
                                )}
                              </td>
                              
                              {/* Banker Name */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <input
                                    type="text"
                                    name="banker_name"
                                    value={editForm.banker_name || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '140px' }}
                                  />
                                ) : (
                                  <span style={{ color: amberColors.accent, fontWeight: '500' }}>{bankerName}</span>
                                )}
                              </td>
                              
                              {/* Designation */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="banker_designation"
                                    value={editForm.banker_designation || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '140px' }}
                                  >
                                    <option value="">Select Designation</option>
                                    {designations.map(designation => (
                                      <option key={designation.id} value={designation.id}>
                                        {designation.designation_name || designation.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span style={{ color: amberColors.primaryDark, fontWeight: '500' }}>
                                    {designationName}
                                  </span>
                                )}
                              </td>
                              
                              {/* Mobile No */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <input
                                    type="tel"
                                    name="phone_no"
                                    value={editForm.phone_no || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '120px' }}
                                  />
                                ) : (
                                  <a href={`tel:${phoneNo}`} style={{ color: amberColors.text, textDecoration: 'none', fontWeight: '500' }}>
                                    {phoneNo}
                                  </a>
                                )}
                              </td>
                              
                              {/* Email */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <input
                                    type="email"
                                    name="email"
                                    value={editForm.email || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '160px' }}
                                  />
                                ) : (
                                  <a href={`mailto:${email}`} style={{ color: amberColors.textLight, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                                    {email}
                                  </a>
                                )}
                              </td>
                              
                              {/* Loan Type */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="loan_type"
                                    value={editForm.loan_type || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '120px' }}
                                  >
                                    <option value="">Select Loan Type</option>
                                    {loanTypes.map(loan => (
                                      <option key={loan.id} value={loan.id}>
                                        {loan.loan_type || loan.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span style={{ color: amberColors.primaryDark, fontWeight: '500' }}>
                                    {loanTypeName}
                                  </span>
                                )}
                              </td>
                              
                              {/* Branch Inner State */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="branch_inner_state"
                                    value={editForm.branch_inner_state || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border, width: '120px' }}
                                  >
                                    <option value="">Select State</option>
                                    {branchInnerStates.map(state => (
                                      <option key={state.id} value={state.id}>
                                        {state.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="badge" style={{ backgroundColor: amberColors.primaryLight, color: amberColors.accent, padding: '4px 8px', fontWeight: '500' }}>
                                    {stateName}
                                  </span>
                                )}
                              </td>
                              
                              {/* Branch Inner Location */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="branch_inner_location"
                                    value={editForm.branch_inner_location || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={!editForm.branch_inner_state || saving}
                                    style={{ borderColor: amberColors.border, width: '120px' }}
                                  >
                                    <option value="">
                                      {!editForm.branch_inner_state 
                                        ? 'Select State First'
                                        : filteredInnerLocations.length === 0
                                        ? 'No locations'
                                        : 'Select Location'}
                                    </option>
                                    {filteredInnerLocations.map(location => (
                                      <option key={location.id} value={location.id}>
                                        {location.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span style={{ color: amberColors.text, fontWeight: '500' }}>
                                    {locationName}
                                  </span>
                                )}
                              </td>
                              
                              {/* Visiting Card */}
                              <td className="align-middle text-center">
                                {editingId === banker.id ? (
                                  <div>
                                    <input
                                      type="file"
                                      onChange={handleFileChange}
                                      className="form-control form-control-sm"
                                      disabled={saving}
                                      accept=".jpg,.jpeg,.png,.gif,.pdf"
                                      style={{ borderColor: amberColors.border, fontSize: '12px', width: '120px' }}
                                    />
                                    {editForm.visiting_card && !(editForm.visiting_card instanceof File) && (
                                      <small className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>Current file kept</small>
                                    )}
                                  </div>
                                ) : (
                                  banker.visiting_card ? (
                                    getFilePreview(banker.visiting_card)
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '12px', fontWeight: '500' }}>No File</span>
                                  )
                                )}
                              </td>
                              
                              {/* Actions - Edit and Delete Buttons */}
                              <td className="pe-4 align-middle">
                                <div className="d-flex justify-content-center gap-2">
                                  {editingId === banker.id ? (
                                    <>
                                      <button
                                        className="btn btn-sm px-3 py-2 border-0 text-white"
                                        style={{ backgroundColor: '#10b981' }}
                                        onClick={() => handleSaveEdit(banker.id)}
                                        disabled={saving}
                                        title="Save"
                                      >
                                        {saving ? (
                                          <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                          <i className="bi bi-check-lg me-1"></i>
                                        )}
                                        Save
                                      </button>
                                      <button
                                        className="btn btn-sm px-3 py-2"
                                        style={{ backgroundColor: '#6b7280', color: 'white' }}
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        title="Cancel"
                                      >
                                        <i className="bi bi-x-lg me-1"></i>
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-sm px-3 py-2 border-0"
                                        style={{ backgroundColor: amberColors.primary, color: amberColors.accent }}
                                        onClick={() => handleEditClick(banker)}
                                        title="Edit"
                                        disabled={tableLoading}
                                      >
                                        <i className="bi bi-pencil me-1"></i>
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-sm px-3 py-2 border-0"
                                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                                        onClick={() => handleDelete(banker.id, banker.banker_name)}
                                        title="Delete"
                                        disabled={tableLoading}
                                      >
                                        <i className="bi bi-trash me-1"></i>
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Footer with summary */}
            {bankers.length > 0 && (
              <div className="card-footer bg-white border-0 py-3 px-4" style={{ borderTop: `1px solid ${amberColors.border}` }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: amberColors.textLight, fontWeight: '500' }}>
                    Showing {bankers.length} {bankers.length === 1 ? 'banker' : 'bankers'}
                  </span>
                  <span style={{ color: amberColors.textLight, fontWeight: '500' }}>
                    <i className="bi bi-clock me-1"></i>
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listbank;