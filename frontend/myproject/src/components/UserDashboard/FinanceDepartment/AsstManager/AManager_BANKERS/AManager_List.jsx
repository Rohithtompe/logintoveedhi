import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import { useNavigate } from 'react-router-dom';
import AsstManager_Sidebar from "../Sidebar/AsstManager_Sidebar.jsx";
import "../Sidebar/AsstManager_Sidebar.css";

const AManager_List = () => {
  const navigate = useNavigate();
  const [bankers, setBankers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Dropdown data for display
  const [vendorBanks, setVendorBanks] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchStates, setBranchStates] = useState([]);
  const [branchLocations, setBranchLocations] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Golden yellow/amber color palette
  const amberColors = {
    primary: '#fbbf24',
    primaryDark: '#f59e0b',
  
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

  const fetchDropdownData = async () => {
    try {
      const [
        vendorBanksRes,
        designationsRes,
        branchStatesRes,
        branchLocationsRes,
        loanTypesRes
      ] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('vendor-bank-designations/'),
        api.get('branch-states/'),
        api.get('branch-locations/'),
        api.get('loan-types/')
      ]);

      setVendorBanks(vendorBanksRes.data || []);
      setDesignations(designationsRes.data || []);
      setBranchStates(branchStatesRes.data || []);
      setBranchLocations(branchLocationsRes.data || []);
      setLoanTypes(loanTypesRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
      branch_state: banker.branch_state || '',
      branch_location: banker.branch_location || '',
      visiting_card: banker.visiting_card || null
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save edited data
  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      Object.keys(editForm).forEach(key => {
        if (key !== 'visiting_card') {
          formData.append(key, editForm[key] || '');
        }
      });

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
    setEditForm(prev => ({
      ...prev,
      [name]: value
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
    if (!id) return 'N/A';
    if (!array || array.length === 0) return `ID: ${id}`;
    
    // Try to find by id (could be string or number)
    const item = array.find(item => 
      item.id === id || 
      item.id === parseInt(id) ||
      item.id === Number(id)
    );
    
    if (!item) return `ID: ${id}`;
    
    // Handle different field names for different arrays
    if (array === vendorBanks) {
      return item.vendor_name || item.name || `Bank ${id}`;
    }
    
    if (array === designations) {
      return item.designation_name || item.name || `Designation ${id}`;
    }
    
    if (array === branchStates) {
      return item.name || item.state_name || `State ${id}`;
    }
    
    if (array === branchLocations) {
      return item.branch_location || item.location_name || item.name || `Location ${id}`;
    }
    
    if (array === loanTypes) {
      return item.loan_type || item.name || `Loan ${id}`;
    }
    
    return item[nameField] || `Item ${id}`;
  };

  // Function to get file URL or preview
  const getFilePreview = (fileUrl) => {
    if (!fileUrl) return null;
    
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileUrl);
    
    if (isImage) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={fileUrl} 
            alt="Visiting Card" 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </a>
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: amberColors.primaryLight, color: amberColors.accent, padding: '4px 8px', fontSize: '12px' }}>
          <i className="bi bi-file-earmark"></i> View
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
      <AsstManager_Sidebar />
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
          {/* Page Header - Fixed to use amber color instead of blue */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div style={{ color:'yellow' }}>
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
                  <table className="table table-hover mb-0" style={{ minWidth: '1200px' }}>
                    <thead style={{ backgroundColor: '#fef3c7' }}>
                      <tr>
                        <th className="ps-4 py-3 fw-semibold" style={{ color: 'white', width: '5%' }}>s.no</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '12%' }}>Vendor Bank</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '12%' }}>Banker Name</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '12%' }}>Designation</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '10%' }}>Mobile No</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '15%' }}>Email</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '10%' }}>Loan Type</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '8%' }}>State</th>
                        <th className="py-3 fw-semibold" style={{ color: 'white', width: '8%' }}>Location</th>
                        <th className="py-3 fw-semibold text-center" style={{ color: 'white', width: '8%' }}>Card</th>
                        <th className="text-center pe-4 py-3 fw-semibold" style={{ color: 'white', width: '8%' }}>Actions</th>
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
                          const stateName = getNameById(banker.branch_state, branchStates);
                          const locationName = getNameById(banker.branch_location, branchLocations);
                          
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
                                    style={{ borderColor: amberColors.border }}
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
                                    style={{ borderColor: amberColors.border }}
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
                                    style={{ borderColor: amberColors.border }}
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
                                    style={{ borderColor: amberColors.border }}
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
                                    style={{ borderColor: amberColors.border }}
                                  />
                                ) : (
                                  <span style={{ color: amberColors.textLight, fontSize: '14px', fontWeight: '500' }}>
                                    {email}
                                  </span>
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
                                    style={{ borderColor: amberColors.border }}
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
                              
                              {/* State */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="branch_state"
                                    value={editForm.branch_state || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border }}
                                  >
                                    <option value="">Select State</option>
                                    {branchStates.map(state => (
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
                              
                              {/* Location */}
                              <td className="align-middle">
                                {editingId === banker.id ? (
                                  <select
                                    name="branch_location"
                                    value={editForm.branch_location || ''}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                    disabled={saving}
                                    style={{ borderColor: amberColors.border }}
                                  >
                                    <option value="">Select Location</option>
                                    {branchLocations.map(location => (
                                      <option key={location.id} value={location.id}>
                                        {location.branch_location || location.location_name || location.name}
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
                                      style={{ borderColor: amberColors.border, fontSize: '12px' }}
                                    />
                                  </div>
                                ) : (
                                  banker.visiting_card ? (
                                    getFilePreview(banker.visiting_card)
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '12px', fontWeight: '500' }}>No File</span>
                                  )
                                )}
                              </td>
                              
                              {/* Actions - Only Edit Button */}
                              <td className="pe-4 align-middle">
                                <div className="d-flex justify-content-center">
                                  {editingId === banker.id ? (
                                    <div className="d-flex gap-2">
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
                                    </div>
                                  ) : (
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

export default AManager_List;