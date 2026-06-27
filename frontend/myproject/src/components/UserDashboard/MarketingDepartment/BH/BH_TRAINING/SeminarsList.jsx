import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import BH_Sidebar from "../../BH/Sidebar/BH_Sidebar.jsx";
import "../../BH/Sidebar/BH_Sidebar.css";

const SeminarsList = () => {
  const [seminars, setSeminars] = useState([]);
  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      // Fetch seminars
      const seminarsRes = await api.get('seminars/');
      console.log('Seminars raw data:', seminarsRes.data);
      
      // Fetch vendor banks
      const vendorBanksRes = await api.get('vendor-banks/');
      console.log('Vendor banks raw data:', vendorBanksRes.data);
      
      // Fetch loan types
      const loanTypesRes = await api.get('loan-types/');
      console.log('Loan types raw data:', loanTypesRes.data);
      
      // Process seminars data
      let seminarsData = [];
      if (Array.isArray(seminarsRes.data)) {
        seminarsData = seminarsRes.data;
      } else if (seminarsRes.data && seminarsRes.data.results) {
        seminarsData = seminarsRes.data.results;
      } else if (seminarsRes.data && seminarsRes.data.data) {
        seminarsData = seminarsRes.data.data;
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
      
      console.log('Processed seminars:', seminarsData);
      console.log('Processed vendor banks:', vendorData);
      console.log('Processed loan types:', loanData);
      
      setSeminars(seminarsData);
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

  const handleEdit = (seminar) => {
    console.log('Editing seminar:', seminar);
    setEditingSeminar(seminar);
    setShowCreateForm(false);
  };

  const handleDelete = async (seminarId) => {
    if (!window.confirm('Are you sure you want to delete this seminar?')) {
      return;
    }

    try {
      await api.delete(`seminars/${seminarId}/`);
      fetchAllData();
      alert('Seminar deleted successfully!');
    } catch (error) {
      console.error('Error deleting seminar:', error);
      alert('Error deleting seminar');
    }
  };

  const handleSeminarSaved = () => {
    fetchAllData();
    setEditingSeminar(null);
    setShowCreateForm(false);
  };

  const handleViewVideo = (videoUrl) => {
    if (videoUrl) {
      const fullUrl = videoUrl.startsWith('http') ? videoUrl : `http://127.0.0.1:8000${videoUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Manager Sidebar */}
      <BH_Sidebar />

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
                Seminar Management
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
              {!showCreateForm && !editingSeminar && (
                <button
                  onClick={() => setShowCreateForm(true)}
    
                >
            
                </button>
              )}
            </div>
          </div>

          {/* Create/Edit Form Section */}
          {(showCreateForm || editingSeminar) && (
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
                  {editingSeminar ? 'Edit Seminar' : 'Create New Seminar'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSeminar(null);
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
              {/* Seminar component placeholder - uncomment when Seminar component is available */}
              {/* <Seminar 
                seminar={editingSeminar}
                onSeminarSaved={handleSeminarSaved}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingSeminar(null);
                }}
              /> */}
              <p style={{ color: '#92400e', fontStyle: 'italic' }}>
                Seminar form will be displayed here
              </p>
            </div>
          )}

          {/* Seminars List */}
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
              <p style={{ color: '#78350f', fontSize: '1.1rem' }}>Loading seminars...</p>
            </div>
          ) : seminars.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px'
            }}>
              <i className="bi bi-film" style={{ fontSize: '4rem', color: '#92400e', opacity: 0.5 }}></i>
              <p style={{ color: '#78350f', fontSize: '1.2rem', marginTop: '20px' }}>
                No seminars found
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
                minWidth: '1000px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#78350f'
                  }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Vendor Bank</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Loan Type</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Video</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                   
                    
                  </tr>
                </thead>
                <tbody>
                  {seminars.map((seminar, index) => {
                    console.log('Seminar data:', {
                      id: seminar.id,
                      name: seminar.name,
                      vendor_bank: seminar.vendor_bank,
                      vendor_bank_type: typeof seminar.vendor_bank,
                      loan_type: seminar.loan_type,
                      loan_type_type: typeof seminar.loan_type
                    });
                    
                    return (
                      <tr key={seminar.id} style={{
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
                            #{seminar.id}
                          </span>
                        </td>
                        <td style={{ padding: '15px', fontWeight: '500', color: '#78350f' }}>
                          {seminar.name || 'N/A'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div>
                            <strong style={{ color: '#78350f' }}>{getVendorBankName(seminar.vendor_bank)}</strong>
                          </div>
                          <small style={{ color: '#92400e', fontSize: '0.75rem' }}>
                            {typeof seminar.vendor_bank === 'object' 
                              ? `Object ID: ${seminar.vendor_bank?.id}` 
                              : `ID: ${seminar.vendor_bank}`}
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
                            {getLoanTypeName(seminar.loan_type)}
                          </span>
                          <br />
                          <small style={{ color: '#92400e', fontSize: '0.75rem' }}>
                            {typeof seminar.loan_type === 'object' 
                              ? `Object ID: ${seminar.loan_type?.id}` 
                              : `ID: ${seminar.loan_type}`}
                          </small>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {seminar.video ? (
                            <button 
                              onClick={() => handleViewVideo(seminar.video)}
                              style={{
                                padding: '8px 15px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className="bi bi-play-circle"></i>
                              Watch Video
                            </button>
                          ) : (
                            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No Video</span>
                          )}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{
                            background: seminar.status ? '#10b981' : '#6b7280',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}>
                            {seminar.status ? 'Active' : 'Inactive'}
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
          {seminars.length > 0 && (
            <div >
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

export default SeminarsList;