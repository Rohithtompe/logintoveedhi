import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import CBO_Sidebar from "../../CBO/Sidebar/CBO_Sidebar.jsx";
import "../../CBO/Sidebar/CBO_Sidebar.css";

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Manager Sidebar */}
      <CBO_Sidebar />

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
        {/* Content Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          {/* Header with Create Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#78350f',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                Policy Management
              </h2>
      
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={fetchAllData}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: '#78350f',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
              {!showCreateForm && !editingPolicy && (
                <button
                  onClick={() => setShowCreateForm(true)}
                 
                >
                
                </button>
              )}
            </div>
          </div>

          {/* Content Preview Modal */}
          {contentPreview && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={closeContentPreview}>
              <div style={{
                background: 'white',
                borderRadius: '15px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '80vh',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  padding: '15px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#78350f',
                    margin: 0
                  }}>Policy Content</h3>
                  <button
                    onClick={closeContentPreview}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#78350f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div style={{
                  padding: '20px',
                  maxHeight: 'calc(80vh - 80px)',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '10px',
                    border: '1px solid #dee2e6'
                  }}>
                    {contentPreview}
                  </div>
                </div>
                <div style={{
                  padding: '15px 20px',
                  borderTop: '1px solid #dee2e6',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  backgroundColor: '#f8f9fa'
                }}>
                  <button
                    onClick={closeContentPreview}
                    style={{
                      padding: '8px 20px',
                      background: 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Form Section */}
          {(showCreateForm || editingPolicy) && (
            <div style={{
              marginBottom: '30px',
              padding: '20px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '15px',
              border: '2px solid rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#78350f',
                  margin: 0
                }}>
                  {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPolicy(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: '#78350f'
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              {/* Policy component placeholder - uncomment when Policy component is available */}
              {/* <Policy 
                policy={editingPolicy}
                onPolicySaved={handlePolicySaved}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingPolicy(null);
                }}
              /> */}
              <p style={{ color: '#92400e', fontStyle: 'italic' }}>
                Policy form will be displayed here
              </p>
            </div>
          )}

          {/* Policies List */}
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #fbbf24',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#78350f', fontSize: '1.1rem' }}>Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px'
            }}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: '4rem', color: '#92400e', opacity: 0.5 }}></i>
              <p style={{ color: '#78350f', fontSize: '1.2rem', marginTop: '20px' }}>
                No policies found
              </p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    padding: '12px 25px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#78350f',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  Waiting for Admin Approval
                </button>
              )}
            </div>
          ) : (
            <div style={{
              overflowX: 'auto',
              borderRadius: '15px',
              background: 'rgba(255, 255, 255, 0.8)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '900px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#78350f'
                  }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Vendor Bank</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Loan Type</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Content</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>File</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy, index) => {
                    console.log('Policy data:', {
                      id: policy.id,
                      vendor_bank: policy.vendor_bank,
                      vendor_bank_type: typeof policy.vendor_bank,
                      loan_type: policy.loan_type,
                      loan_type_type: typeof policy.loan_type
                    });
                    
                    return (
                      <tr key={policy.id} style={{
                        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(251, 191, 36, 0.05)',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(251, 191, 36, 0.05)'}
                      >
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: '#fbbf24',
                            color: '#78350f',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            #{policy.id}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div>
                            <strong style={{ color: '#78350f' }}>{getVendorBankName(policy.vendor_bank)}</strong>
                          </div>
                          <small style={{ color: '#92400e', fontSize: '0.75rem' }}>
                            {typeof policy.vendor_bank === 'object' 
                              ? `Object ID: ${policy.vendor_bank?.id}` 
                              : `ID: ${policy.vendor_bank}`}
                          </small>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            display: 'inline-block',
                            marginBottom: '5px'
                          }}>
                            {getLoanTypeName(policy.loan_type)}
                          </span>
                          <br />
                          <small style={{ color: '#92400e', fontSize: '0.75rem' }}>
                            {typeof policy.loan_type === 'object' 
                              ? `Object ID: ${policy.loan_type?.id}` 
                              : `ID: ${policy.loan_type}`}
                          </small>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {policy.content ? (
                            <button 
                              onClick={() => handleViewContent(policy.content)}
                              style={{
                                padding: '8px 15px',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="View Content"
                            >
                              <i className="bi bi-eye"></i>
                              View Content
                            </button>
                          ) : (
                            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No Content</span>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {policy.file ? (
                            <button 
                              onClick={() => handleDownloadFile(policy.file)}
                              style={{
                                padding: '8px 15px',
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Download File"
                            >
                              <i className="bi bi-download"></i>
                              Download
                            </button>
                          ) : (
                            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No File</span>
                          )}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{
                            background: policy.status ? '#10b981' : '#6b7280',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}>
                            {policy.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
             
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with stats */}
          {policies.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '15px 20px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ color: '#92400e' }}>
           
              </div>
              <button
                onClick={fetchAllData}
                disabled={loading}
                
              >
                
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add keyframe animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PolicyList;