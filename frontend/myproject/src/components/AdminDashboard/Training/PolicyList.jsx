import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Policy from './Policy';

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [contentPreview, setContentPreview] = useState(null);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      // Fetch policies
      const policiesRes = await api.get('policies/');
      console.log('Policies raw data:', policiesRes.data);
      
      // Fetch vendor banks
      const vendorBanksRes = await api.get('vendor-banks/');
      console.log('Vendor banks raw data:', vendorBanksRes.data);
      
      // Fetch loan types
      const loanTypesRes = await api.get('loan-types/');
      console.log('Loan types raw data:', loanTypesRes.data);
      
      // Process policies data
      let policiesData = [];
      if (Array.isArray(policiesRes.data)) {
        policiesData = policiesRes.data;
      } else if (policiesRes.data && policiesRes.data.results) {
        policiesData = policiesRes.data.results;
      } else if (policiesRes.data && policiesRes.data.data) {
        policiesData = policiesRes.data.data;
      }
      
      // Process vendor banks data
      let vendorData = [];
      if (Array.isArray(vendorBanksRes.data)) {
        vendorData = vendorBanksRes.data;
      } else if (vendorBanksRes.data && vendorBanksRes.data.results) {
        vendorData = vendorBanksRes.data.results;
      } else if (vendorBanksRes.data && vendorBanksRes.data.data) {
        vendorData = vendorBanksRes.data.data;
      }
      
      // Process loan types data
      let loanData = [];
      if (Array.isArray(loanTypesRes.data)) {
        loanData = loanTypesRes.data;
      } else if (loanTypesRes.data && loanTypesRes.data.results) {
        loanData = loanTypesRes.data.results;
      } else if (loanTypesRes.data && loanTypesRes.data.data) {
        loanData = loanTypesRes.data.data;
      }
      
      console.log('Processed policies:', policiesData);
      console.log('Processed vendor banks:', vendorData);
      console.log('Processed loan types:', loanData);
      
      setPolicies(policiesData);
      setVendorBanks(vendorData);
      setLoanTypes(loanData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get name by ID
  const getNameById = (id, array, nameField = 'name') => {
    if (!id || !array || array.length === 0) return 'N/A';
    
    console.log(`Looking for ID ${id} in array:`, array);
    
    // Try different ways to find the item
    const item = array.find(item => {
      // Check if item has the ID
      return item.id === id || 
             item.id === parseInt(id) ||
             String(item.id) === String(id);
    });
    
    console.log(`Found item for ID ${id}:`, item);
    
    if (!item) {
      console.log(`No item found for ID ${id}`);
      return `ID: ${id}`;
    }
    
    // Try different property names for vendor banks
    if (array === vendorBanks) {
      return item.vendor_name || item.name || item.bank_name || `Vendor ${item.id}`;
    }
    
    // For loan types
    if (array === loanTypes) {
      return item.name || item.loan_type || item.loan_type_name || `Loan Type ${item.id}`;
    }
    
    // Default fallback
    return item[nameField] || `ID: ${item.id}`;
  };

  // Get vendor bank name
  const getVendorBankName = (vendorBankId) => {
    console.log('Getting vendor bank name for ID:', vendorBankId);
    console.log('Available vendor banks:', vendorBanks);
    
    // Check if vendorBankId is an object (nested in API response)
    if (vendorBankId && typeof vendorBankId === 'object') {
      console.log('vendorBankId is an object:', vendorBankId);
      return vendorBankId.vendor_name || vendorBankId.name || vendorBankId.bank_name || `Vendor ${vendorBankId.id}`;
    }
    
    // If it's an ID, use getNameById
    const name = getNameById(vendorBankId, vendorBanks, 'vendor_name');
    console.log('Result:', name);
    return name;
  };

  // Get loan type name
  const getLoanTypeName = (loanTypeId) => {
    console.log('Getting loan type name for ID:', loanTypeId);
    
    // Check if loanTypeId is an object
    if (loanTypeId && typeof loanTypeId === 'object') {
      console.log('loanTypeId is an object:', loanTypeId);
      return loanTypeId.name || loanTypeId.loan_type || loanTypeId.loan_type_name || `Loan Type ${loanTypeId.id}`;
    }
    
    // If it's an ID, use getNameById
    const name = getNameById(loanTypeId, loanTypes, 'name');
    console.log('Result:', name);
    return name;
  };

  const handleEdit = (policy) => {
    console.log('Editing policy:', policy);
    setEditingPolicy(policy);
    setShowCreateForm(false);
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await api.delete(`policies/${policyId}/`);
      fetchAllData();
      alert('Policy deleted successfully!');
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert('Error deleting policy');
    }
  };

  const handlePolicySaved = () => {
    fetchAllData();
    setEditingPolicy(null);
    setShowCreateForm(false);
    setContentPreview(null);
  };

  const handleViewContent = (content) => {
    if (content) {
      setContentPreview(content);
    }
  };

  const handleDownloadFile = (fileUrl) => {
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://127.0.0.1:8000${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  const closeContentPreview = () => {
    setContentPreview(null);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">Policy Management</h1>
 
          </div>
        </div>
      </div>

      {/* Content Preview Modal */}
      {contentPreview && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Policy Content</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeContentPreview}
                ></button>
              </div>
              <div className="modal-body">
                <div className="p-3 bg-light rounded">
                  {contentPreview}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeContentPreview}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Section */}
      {(showCreateForm || editingPolicy) && (
        <div className="row mb-4">
          <div className="col-12">
            <Policy 
              policy={editingPolicy}
              onPolicySaved={handlePolicySaved}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingPolicy(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Policies List Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Policies List</h5>
              <span className="badge bg-light text-dark">
                Total: {policies.length}
              </span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading policies...</p>
                </div>
              ) : policies.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 text-muted">No policies found</p>
                  {!showCreateForm && (
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create Your First Policy
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Vendor Bank</th>
                        <th>Loan Type</th>
                        <th>Content</th>
                        <th>File</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map((policy) => {
                        console.log('Policy data:', {
                          id: policy.id,
                          vendor_bank: policy.vendor_bank,
                          vendor_bank_type: typeof policy.vendor_bank,
                          loan_type: policy.loan_type,
                          loan_type_type: typeof policy.loan_type
                        });
                        
                        return (
                          <tr key={policy.id} className="align-middle">
                            <td>
                              <span className="badge bg-light text-dark">{policy.id}</span>
                            </td>
                            <td>
                              <strong>{getVendorBankName(policy.vendor_bank)}</strong>
                              <br />
                              <small className="text-muted">
                                {typeof policy.vendor_bank === 'object' 
                                  ? `Object ID: ${policy.vendor_bank?.id}` 
                                  : `ID: ${policy.vendor_bank}`}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {getLoanTypeName(policy.loan_type)}
                              </span>
                              <br />
                              <small className="text-muted">
                                {typeof policy.loan_type === 'object' 
                                  ? `Object ID: ${policy.loan_type?.id}` 
                                  : `ID: ${policy.loan_type}`}
                              </small>
                            </td>
                            <td>
                              {policy.content ? (
                                <button 
                                  className="btn btn-sm btn-outline-info d-flex align-items-center"
                                  onClick={() => handleViewContent(policy.content)}
                                  title="View Content"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  <small>View</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No Content</span>
                              )}
                            </td>
                            <td>
                              {policy.file ? (
                                <button 
                                  className="btn btn-sm btn-outline-success d-flex align-items-center"
                                  onClick={() => handleDownloadFile(policy.file)}
                                  title="Download File"
                                >
                                  <i className="bi bi-download me-1"></i>
                                  <small>Download</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No File</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${policy.status ? 'bg-success' : 'bg-secondary'}`}>
                                {policy.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleEdit(policy)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(policy.id)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {policies.length > 0 && (
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing <strong>{policies.length}</strong> policy{policies.length !== 1 ? 'ies' : ''}
                    <br />
                    <small>
                      Vendor Banks: {vendorBanks.length}, 
                      Loan Types: {loanTypes.length}
                    </small>
                  </small>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchAllData}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyList;