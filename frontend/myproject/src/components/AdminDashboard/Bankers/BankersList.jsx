import React, { useState, useEffect } from 'react';
import api from '../../../api';

const BankersList = () => {
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
        api.get('branch-inner-states/'),
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
        params: { branch_inner_state: stateId }
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
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            className="border"
          />
        </a>
      );
    } else if (isPDF) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger">
          <i className="bi bi-file-pdf"></i> PDF
        </a>
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-download"></i> Download
        </a>
      );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-primary mb-1">Bankers List</h1>
          <p className="text-muted mb-0">View and manage all bank officers and representatives</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-people me-2"></i>
            {bankers.length} Total Bankers
          </div>
        </div>
      </div>

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

      {/* Table Section */}
      <div className="card shadow-lg border-0">
        <div className="card-header bg-gradient-dark text-white border-0 rounded-top-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-list-ul me-2"></i>
              Bankers List
            </h5>
            <div>
              <button 
                className="btn btn-sm btn-outline-light fw-medium"
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
        </div>
        <div className="card-body p-0">
          {tableLoading && !saving ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-medium">Loading Bankers...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3 fw-semibold border-bottom-2">#</th>
                    <th className="py-3 fw-semibold border-bottom-2">Vendor Bank</th>
                    <th className="py-3 fw-semibold border-bottom-2">Banker Name</th>
                    <th className="py-3 fw-semibold border-bottom-2">Designation</th>
                    <th className="py-3 fw-semibold border-bottom-2">Mobile No</th>
                    <th className="py-3 fw-semibold border-bottom-2">Email</th>
                    <th className="py-3 fw-semibold border-bottom-2">Loan Type</th>
                    <th className="py-3 fw-semibold border-bottom-2">Branch State</th>
                    <th className="py-3 fw-semibold border-bottom-2">Branch Location</th>
                    <th className="py-3 fw-semibold border-bottom-2 text-center">Visiting Card</th>
                    <th className="text-center pe-4 py-3 fw-semibold border-bottom-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bankers.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center py-5">
                        <div className="text-muted">
                          <i className="bi bi-people fs-1 d-block mb-3 opacity-25"></i>
                          <p className="h5 fw-semibold mb-2">No Bankers found</p>
                          <p className="mb-0">Add your first banker using the "Add New Banker" button</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bankers.map((banker, index) => (
                      <tr key={banker.id} className="border-bottom">
                        <td className="ps-4 fw-semibold text-muted align-middle">{index + 1}</td>
                        
                        {/* Vendor Bank - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <select
                              name="vendor_bank"
                              value={editForm.vendor_bank || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '150px' }}
                            >
                              <option value="">Select Bank</option>
                              {vendorBanks.map(bank => (
                                <option key={bank.id} value={bank.id}>
                                  {bank.vendor_name || bank.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="d-flex align-items-center">
                              <span className="fw-medium">
                                {getNameById(banker.vendor_bank, vendorBanks, 'vendor_name')}
                              </span>
                            </div>
                          )}
                        </td>
                        
                        {/* Banker Name - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <input
                              type="text"
                              name="banker_name"
                              value={editForm.banker_name || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '150px' }}
                            />
                          ) : (
                            <div className="d-flex align-items-center">
                              <div>
                                <span className="fw-medium">{banker.banker_name}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        
                        {/* Banker Designation - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <select
                              name="banker_designation"
                              value={editForm.banker_designation || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '150px' }}
                            >
                              <option value="">Select Designation</option>
                              {designations.map(designation => (
                                <option key={designation.id} value={designation.id}>
                                  {designation.designation_name || designation.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-info">
                              {getNameById(banker.banker_designation, designations, 'designation_name')}
                            </span>
                          )}
                        </td>
                        
                        {/* Mobile No - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <input
                              type="tel"
                              name="phone_no"
                              value={editForm.phone_no || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '120px' }}
                            />
                          ) : (
                            <div className="d-flex align-items-center">
                              <div>
                                <a href={`tel:${banker.phone_no}`} className="text-decoration-none">
                                  {banker.phone_no}
                                </a>
                              </div>
                            </div>
                          )}
                        </td>
                        
                        {/* Email - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <input
                              type="email"
                              name="email"
                              value={editForm.email || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '180px' }}
                            />
                          ) : (
                            <div className="d-flex align-items-center">
                              <div>
                                <a href={`mailto:${banker.email}`} className="text-decoration-none">
                                  <small>{banker.email}</small>
                                </a>
                              </div>
                            </div>
                          )}
                        </td>
                        
                        {/* Loan Type - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <select
                              name="loan_type"
                              value={editForm.loan_type || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '120px' }}
                            >
                              <option value="">Select Loan Type</option>
                              {loanTypes.map(loan => (
                                <option key={loan.id} value={loan.id}>
                                  {loan.loan_type || loan.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-info">
                              {getNameById(banker.loan_type, loanTypes, 'loan_type')}
                            </span>
                          )}
                        </td>
                        
                        {/* Branch Inner State - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <select
                              name="branch_inner_state"
                              value={editForm.branch_inner_state || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={saving}
                              style={{ width: '150px' }}
                            >
                              <option value="">Select Inner State</option>
                              {branchInnerStates.map(state => (
                                <option key={state.id} value={state.id}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                              {getNameById(banker.branch_inner_state, branchInnerStates)}
                            </span>
                          )}
                        </td>
                        
                        {/* Branch Inner Location - Edit Mode */}
                        <td className="align-middle">
                          {editingId === banker.id ? (
                            <select
                              name="branch_inner_location"
                              value={editForm.branch_inner_location || ''}
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              disabled={!editForm.branch_inner_state || saving}
                              style={{ width: '150px' }}
                            >
                              <option value="">
                                {!editForm.branch_inner_state 
                                  ? 'Select State First'
                                  : filteredInnerLocations.length === 0
                                  ? 'No locations'
                                  : 'Select Inner Location'}
                              </option>
                              {filteredInnerLocations.map(location => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <span>{getNameById(banker.branch_inner_location, branchInnerLocations)}</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Visiting Card - Edit Mode */}
                        <td className="align-middle text-center">
                          {editingId === banker.id ? (
                            <div>
                              <input
                                type="file"
                                onChange={handleFileChange}
                                className="form-control form-control-sm"
                                disabled={saving}
                                accept=".jpg,.jpeg,.png,.gif,.pdf"
                                style={{ width: '150px' }}
                              />
                              {editForm.visiting_card && !(editForm.visiting_card instanceof File) && (
                                <small className="text-muted d-block mt-1">Current file will be kept</small>
                              )}
                            </div>
                          ) : (
                            banker.visiting_card ? (
                              getFilePreview(banker.visiting_card)
                            ) : (
                              <span className="text-muted">No File</span>
                            )
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td className="pe-4 align-middle">
                          <div className="d-flex justify-content-center gap-2">
                            {editingId === banker.id ? (
                              <>
                                <button
                                  className="btn btn-sm btn-success border-2 px-3 py-2"
                                  onClick={() => handleSaveEdit(banker.id)}
                                  disabled={saving}
                                  title="Save"
                                >
                                  {saving ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-check-lg me-1"></i>
                                  )}
                                  <span className="d-none d-md-inline">Save</span>
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary border-2 px-3 py-2"
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  title="Cancel"
                                >
                                  <i className="bi bi-x-lg me-1"></i>
                                  <span className="d-none d-md-inline">Cancel</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-warning border-2 px-3 py-2"
                                  onClick={() => handleEditClick(banker)}
                                  title="Edit"
                                  disabled={tableLoading}
                                >
                                  <i className="bi bi-pencil"></i>
                                  <span className="ms-1 d-none d-md-inline">Edit</span>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger border-2 px-3 py-2"
                                  onClick={() => handleDelete(banker.id, banker.banker_name)}
                                  title="Delete"
                                  disabled={tableLoading}
                                >
                                  <i className="bi bi-trash"></i>
                                  <span className="ms-1 d-none d-md-inline">Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankersList;