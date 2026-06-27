import React, { useState, useEffect } from 'react';
import api from '../../../api';

const DsaList = ({ onEdit, refreshTrigger }) => {
  // State for table data
  const [dsaCodes, setDsaCodes] = useState([]);
  
  // State for dropdown data (for displaying names)
  const [vendorBanks, setVendorBanks] = useState([]);
  const [dsaNames, setDsaNames] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);

  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State for loading and messages
  const [tableLoading, setTableLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for filtered locations
  const [filteredLocations, setFilteredLocations] = useState([]);

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchDropdownData();
      fetchDsaCodes();
    } else {
      setMessage({ 
        type: 'danger', 
        text: 'You need to login first to access DSA Codes.' 
      });
    }
  }, []);

  // Refresh when new item is added (if refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger) {
      fetchDsaCodes();
    }
  }, [refreshTrigger]);

  // Fetch branch inner locations when branch inner state changes in edit mode
  useEffect(() => {
    if (editingId && editFormData.branch_inner_state) {
      fetchBranchInnerLocations(editFormData.branch_inner_state);
    } else if (editingId && !editFormData.branch_inner_state) {
      setFilteredLocations([]);
    }
  }, [editFormData.branch_inner_state, editingId]);

  const fetchDropdownData = async () => {
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

      setVendorBanks(vendorBanksRes.data || []);
      setDsaNames(dsaNamesRes.data || []);
      setLoanTypes(loanTypesRes.data || []);
      
      // Handle different response formats for branch inner states
      let statesData = [];
      if (Array.isArray(branchInnerStatesRes.data)) {
        statesData = branchInnerStatesRes.data;
      } else if (branchInnerStatesRes.data.results) {
        statesData = branchInnerStatesRes.data.results;
      }
      setBranchInnerStates(statesData);

      // Fetch all branch inner locations initially
      fetchAllBranchInnerLocations();

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to load dropdown data. Please refresh the page.' 
      });
    }
  };

  // Fetch all branch inner locations
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

  // Fetch branch inner locations by state ID
  const fetchBranchInnerLocations = async (stateId) => {
    if (!stateId) {
      setFilteredLocations([]);
      return;
    }

    try {
      const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);
      
      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }
      
      setFilteredLocations(locationsData);
      
      // Also update the main locations state
      if (locationsData.length > 0) {
        setBranchInnerLocations(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newLocations = locationsData.filter(l => !existingIds.has(l.id));
          return [...prev, ...newLocations];
        });
      }
    } catch (error) {
      console.error('Error fetching filtered locations:', error);
      // Fallback: filter from all locations
      const filtered = branchInnerLocations.filter(location => 
        location.branch_inner_state == stateId
      );
      setFilteredLocations(filtered);
    }
  };

  const fetchDsaCodes = async () => {
    setTableLoading(true);
    try {
      const response = await api.get('dsa-codes/');
      console.log('Fetched DSA Codes:', response.data);
      setDsaCodes(response.data || []);
    } catch (error) {
      console.error('Error fetching DSA codes:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to load DSA codes' 
      });
    } finally {
      setTableLoading(false);
    }
  };

  // Start inline editing
  const handleEditClick = (dsaCode) => {
    setEditingId(dsaCode.id);
    
    const formData = {
      vendor_bank: dsaCode.vendor_bank || '',
      dsa_name: dsaCode.dsa_name || '',
      dsa_code: dsaCode.dsa_code || '',
      loan_type: dsaCode.loan_type || '',
      branch_inner_state: dsaCode.branch_inner_state || '',
      branch_inner_location: dsaCode.branch_inner_location || ''
    };
    
    setEditFormData(formData);
    
    // If branch inner state exists, fetch locations for that state
    if (dsaCode.branch_inner_state) {
      fetchBranchInnerLocations(dsaCode.branch_inner_state);
    }
  };

  // Handle input changes during inline editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save inline edits
  const handleSaveClick = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      // Prepare data for submission
      const submitData = {
        vendor_bank: parseInt(editFormData.vendor_bank, 10),
        dsa_name: parseInt(editFormData.dsa_name, 10),
        dsa_code: editFormData.dsa_code,
        loan_type: parseInt(editFormData.loan_type, 10),
        branch_inner_state: parseInt(editFormData.branch_inner_state, 10),
        branch_inner_location: parseInt(editFormData.branch_inner_location, 10)
      };

      console.log('Submitting edit:', submitData);
      
      await api.put(`dsa-codes/${editingId}/`, submitData);
      
      // Update local state
      setDsaCodes(dsaCodes.map(item => 
        item.id === editingId ? { ...item, ...submitData } : item
      ));
      
      setMessage({ type: 'success', text: 'DSA Code updated successfully!' });
      setEditingId(null);
      setFilteredLocations([]);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating DSA code:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.error || 
                      'Failed to update DSA Code';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel inline editing
  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
    setFilteredLocations([]);
  };

  // Handle delete with browser confirmation
  const handleDeleteClick = async (dsaCode) => {
    const dsaName = getNameById(dsaCode.dsa_name, dsaNames);
    
    const isConfirmed = window.confirm(`Are you sure you want to delete ${dsaName}?\n\nDSA Code: ${dsaCode.dsa_code}`);
    
    if (!isConfirmed) {
      return;
    }

    try {
      setTableLoading(true);
      await api.delete(`dsa-codes/${dsaCode.id}/`);
      
      setMessage({ type: 'success', text: 'DSA Code deleted successfully!' });
      fetchDsaCodes();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error deleting DSA code:', error);
      setMessage({ type: 'danger', text: 'Failed to delete DSA Code' });
      setTableLoading(false);
    }
  };

  // Helper function to get name by ID
  const getNameById = (id, array) => {
    if (!id || !array || array.length === 0) return 'N/A';
    
    const idNum = parseInt(id);
    
    const item = array.find(item => 
      item.id === id || 
      item.id === idNum || 
      item.id?.toString() === id?.toString()
    );
    
    if (!item) return 'N/A';
    
    return item.name || 
           item.vendor_name || 
           item.dsa_name || 
           item.loan_type || 
           item.state_name || 
           item.location_name || 
           item.bank_name ||
           'N/A';
  };

  return (
    <>
      {/* Display Messages */}
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show mb-3`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi bi-${
              message.type === 'success' ? 'check-circle' :
              message.type === 'danger' ? 'exclamation-circle' :
              'info-circle'
            }-fill me-2`}></i>
            <span>{message.text}</span>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      <div className="card shadow-lg border-0 mt-4">
        <div className="card-header bg-dark text-white border-0 rounded-top-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-list-ul me-2"></i>
              DSA Codes List
            </h5>
            <div>
              <button 
                className="btn btn-sm btn-outline-light fw-medium"
                onClick={() => {
                  fetchDropdownData();
                  fetchDsaCodes();
                }}
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
          {tableLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-medium">Loading DSA Codes...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3 fw-semibold border-bottom-2">S.no</th>
                    <th className="py-3 fw-semibold border-bottom-2">VENDOR BANK</th>
                    <th className="py-3 fw-semibold border-bottom-2">DSA CODE</th>
                    <th className="py-3 fw-semibold border-bottom-2">DSA NAME</th>
                    <th className="py-3 fw-semibold border-bottom-2">LOAN TYPE</th>
                    <th className="py-3 fw-semibold border-bottom-2">BRANCH INNER STATE</th>
                    <th className="py-3 fw-semibold border-bottom-2">BRANCH INNER LOCATION</th>
                    <th className="text-center pe-4 py-3 fw-semibold border-bottom-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dsaCodes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                          <p className="h5 fw-semibold mb-2">No DSA Codes found</p>
                          <p className="mb-0">Add your first DSA Code using the form above</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dsaCodes.map((dsaCode, index) => (
                      <tr key={dsaCode.id} className="border-bottom">
                        <td className="ps-4 fw-semibold text-muted align-middle">{index + 1}</td>
                        
                        {/* Vendor Bank */}
                        <td className="align-middle fw-medium">
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="vendor_bank"
                              value={editFormData.vendor_bank || ''}
                              onChange={handleEditChange}
                              style={{ minWidth: '150px' }}
                            >
                              <option value="">Select Vendor Bank</option>
                              {vendorBanks.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.vendor_name || vendor.name || vendor.bank_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getNameById(dsaCode.vendor_bank, vendorBanks)
                          )}
                        </td>
                        
                        {/* DSA Code */}
                        <td className="align-middle">
                          {editingId === dsaCode.id ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="dsa_code"
                              value={editFormData.dsa_code || ''}
                              onChange={handleEditChange}
                              style={{ minWidth: '100px' }}
                            />
                          ) : (
                            <span className="text-primary fw-medium">
                              {dsaCode.dsa_code}
                            </span>
                          )}
                        </td>
                        
                        {/* DSA Name */}
                        <td className="align-middle">
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="dsa_name"
                              value={editFormData.dsa_name || ''}
                              onChange={handleEditChange}
                              style={{ minWidth: '150px' }}
                            >
                              <option value="">Select DSA Name</option>
                              {dsaNames.map(dsa => (
                                <option key={dsa.id} value={dsa.id}>
                                  {dsa.dsa_name || dsa.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getNameById(dsaCode.dsa_name, dsaNames)
                          )}
                        </td>
                        
                        {/* Loan Type */}
                        <td className="align-middle">
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="loan_type"
                              value={editFormData.loan_type || ''}
                              onChange={handleEditChange}
                              style={{ minWidth: '150px' }}
                            >
                              <option value="">Select Loan Type</option>
                              {loanTypes.map(loan => (
                                <option key={loan.id} value={loan.id}>
                                  {loan.loan_type || loan.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getNameById(dsaCode.loan_type, loanTypes)
                          )}
                        </td>
                        
                        {/* Branch Inner State */}
                        <td className="align-middle">
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="branch_inner_state"
                              value={editFormData.branch_inner_state || ''}
                              onChange={handleEditChange}
                              style={{ minWidth: '150px' }}
                            >
                              <option value="">Select Branch Inner State</option>
                              {branchInnerStates.map(state => (
                                <option key={state.id} value={state.id}>
                                  {state.name || state.state_name || state.state}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-info">
                              {getNameById(dsaCode.branch_inner_state, branchInnerStates)}
                            </span>
                          )}
                        </td>
                        
                        {/* Branch Inner Location */}
                        <td className="align-middle">
                          {editingId === dsaCode.id ? (
                            <>
                              <select
                                className="form-select form-select-sm"
                                name="branch_inner_location"
                                value={editFormData.branch_inner_location || ''}
                                onChange={handleEditChange}
                                disabled={!editFormData.branch_inner_state}
                                style={{ minWidth: '150px' }}
                              >
                                <option value="">
                                  {!editFormData.branch_inner_state 
                                    ? 'Select State First'
                                    : filteredLocations.length === 0
                                    ? 'No locations available'
                                    : 'Select Branch Inner Location'}
                                </option>
                                {filteredLocations.map(location => (
                                  <option key={location.id} value={location.id}>
                                    {location.name || location.location_name || location.location}
                                  </option>
                                ))}
                              </select>
                              {editFormData.branch_inner_state && filteredLocations.length === 0 && (
                                <div className="mt-1 text-warning small">
                                  <i className="bi bi-exclamation-triangle"></i> No locations found
                                </div>
                              )}
                            </>
                          ) : (
                            getNameById(dsaCode.branch_inner_location, branchInnerLocations)
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td className="pe-4 align-middle">
                          <div className="d-flex justify-content-center gap-2">
                            {editingId === dsaCode.id ? (
                              <>
                                <button
                                  className="btn btn-sm btn-success px-3 py-2"
                                  onClick={handleSaveClick}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-check me-1"></i>
                                  )}
                                  Save
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary px-3 py-2"
                                  onClick={handleCancelClick}
                                  disabled={isSaving}
                                >
                                  <i className="bi bi-x"></i>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-warning px-3 py-2"
                                  onClick={() => handleEditClick(dsaCode)}
                                  title="Edit"
                                  disabled={editingId !== null}
                                >
                                  <i className="bi bi-pencil"></i>
                                  <span className="ms-1 d-none d-md-inline">Edit</span>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger px-3 py-2"
                                  onClick={() => handleDeleteClick(dsaCode)}
                                  title="Delete"
                                  disabled={editingId !== null}
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
    </>
  );
};

export default DsaList;