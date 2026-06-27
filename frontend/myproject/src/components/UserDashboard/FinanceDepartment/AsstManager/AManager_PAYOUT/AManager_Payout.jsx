import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AsstManager_Sidebar from "../Sidebar/AsstManager_Sidebar.jsx";
import "../Sidebar/AsstManager_Sidebar.css";
import api from '../../../../../api.js';

const AManager_Payout = () => {
  const navigate = useNavigate();
  const [payoutData, setPayoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [selectedBank, setSelectedBank] = useState('All Vendor Banks');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableBanks, setAvailableBanks] = useState([]);
  const [userPermissions, setUserPermissions] = useState({
    has_permissions: false,
    payout_icons: [],
    message: ''
  });
  
  // New state for payout type cards
  const [selectedPayoutType, setSelectedPayoutType] = useState(null);
  const [availablePayoutTypes, setAvailablePayoutTypes] = useState([]);

  // Fetch payout data based on user permissions
  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        setLoading(true);
        
        // Fetch filtered payouts based on user permissions
        const response = await api.get('filtered-payouts/');
        const data = response.data;
        
        setPayoutData(data.payouts);
        setFilteredPayouts(data.payouts);
        setUserPermissions(data.user_permissions);
        
        // Extract unique banks from payouts
        const banks = ['All Vendor Banks'];
        const payoutTypes = new Set();
        
        data.payouts.forEach(payout => {
          if (payout.vendor_bank_name && !banks.includes(payout.vendor_bank_name)) {
            banks.push(payout.vendor_bank_name);
          }
          if (payout.payout_name_value) {
            payoutTypes.add(payout.payout_name_value);
          }
        });
        
        setAvailableBanks(banks);
        setAvailablePayoutTypes(Array.from(payoutTypes));
        
        // Get current user info
        try {
          const userResponse = await api.get('users/current/');
          setUserInfo(userResponse.data);
        } catch (userError) {
          console.log('User info not available');
        }
        
      } catch (error) {
        console.error('Error fetching payout data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayoutData();
  }, []);

  // Filter payouts based on selected payout type, bank, and search term
  useEffect(() => {
    if (payoutData.length === 0) return;
    
    let filtered = [...payoutData];
    
    // Apply payout type filter if selected
    if (selectedPayoutType) {
      filtered = filtered.filter(payout => payout.payout_name_value === selectedPayoutType);
    }
    
    // Apply bank filter
    if (selectedBank !== 'All Vendor Banks') {
      filtered = filtered.filter(payout => payout.vendor_bank_name === selectedBank);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payout => 
        (payout.payout_name_value && payout.payout_name_value.toLowerCase().includes(term)) ||
        (payout.vendor_bank_name && payout.vendor_bank_name.toLowerCase().includes(term)) ||
        (payout.loan_type_name && payout.loan_type_name.toLowerCase().includes(term)) ||
        (payout.category_name_value && payout.category_name_value.toLowerCase().includes(term)) ||
        (payout.payout && String(payout.payout).toLowerCase().includes(term))
      );
    }
    
    setFilteredPayouts(filtered);
  }, [selectedPayoutType, selectedBank, searchTerm, payoutData]);

  // Handle payout type card click
  const handlePayoutTypeClick = (payoutType) => {
    if (selectedPayoutType === payoutType) {
      setSelectedPayoutType(null); // Deselect if already selected
    } else {
      setSelectedPayoutType(payoutType);
    }
  };

  // Handle bank filter change
  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle reset filters
  const handleReset = () => {
    setSelectedPayoutType(null);
    setSelectedBank('All Vendor Banks');
    setSearchTerm('');
  };

  // If user has no payout permissions, show the message
  if (!loading && (!userPermissions.has_permissions)) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#fef3c7'
      }}>
        <AsstManager_Sidebar />
        <div style={{
          flex: 1,
          marginLeft: '280px',
          padding: '30px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          minHeight: '100vh',
          overflowX: 'hidden',
          color: '#78350f'
        }}>
          <div style={{
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              padding: '0 10px'
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
                  Payout Management
                </h2>
                <div style={{
                  color: '#92400e',
                  fontSize: '1.1rem',
                  padding: '20px',
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  borderRadius: '10px',
                  border: '1px solid #f59e0b',
                  marginTop: '20px'
                }}>
                  <p style={{ margin: 0 }}>
                    <strong>You don't have any payout permissions yet.</strong>
                  </p>
                  <p style={{ margin: '10px 0 0 0' }}>
                    Please contact your administrator to get access to payout management features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      <AsstManager_Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '280px',
        padding: '30px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        minHeight: '100vh',
        overflowX: 'hidden',
        color: '#78350f'
      }}>
        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            padding: '0 10px'
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
                Payout Management
              </h2>
              <p style={{
                color: '#92400e',
                fontSize: '1.1rem'
              }}>
                {userInfo && `Welcome, ${userInfo.first_name || userInfo.username}!`} 
                You have access to {filteredPayouts.length} payout(s).
                {userPermissions.message && ` ${userPermissions.message}`}
              </p>
            </div>
          </div>

          {/* Payout Type Cards Section */}
          {availablePayoutTypes.length > 0 && (
            <div style={{
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#78350f',
                marginBottom: '15px',
                padding: '0 10px'
              }}>
                Select Payout Type
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                padding: '0 10px'
              }}>
                {availablePayoutTypes.map((payoutType, index) => (
                  <div
                    key={index}
                    onClick={() => handlePayoutTypeClick(payoutType)}
                    style={{
                      flex: '0 0 auto',
                      width: '200px',
                      height: '100px',
                      backgroundColor: selectedPayoutType === payoutType 
                        ? 'rgba(245, 158, 11, 0.9)' 
                        : 'rgba(255, 255, 255, 0.9)',
                      border: selectedPayoutType === payoutType 
                        ? '3px solid #78350f' 
                        : '2px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedPayoutType === payoutType 
                        ? '0 6px 12px rgba(120, 53, 15, 0.3)' 
                        : '0 4px 6px rgba(120, 53, 15, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: selectedPayoutType === payoutType ? 'white' : '#78350f',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(120, 53, 15, 0.2)',
                        backgroundColor: selectedPayoutType === payoutType 
                          ? 'rgba(245, 158, 11, 0.95)' 
                          : 'rgba(251, 191, 36, 0.2)'
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}>
                      {payoutType}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      textAlign: 'center'
                    }}>
                      {payoutData.filter(p => p.payout_name_value === payoutType).length} items
                    </div>
                  </div>
                ))}
                
                {/* "All Payouts" card */}
                <div
                  onClick={() => handlePayoutTypeClick(null)}
                  style={{
                    flex: '0 0 auto',
                    width: '200px',
                    height: '100px',
                    backgroundColor: !selectedPayoutType 
                      ? 'rgba(245, 158, 11, 0.9)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    border: !selectedPayoutType 
                      ? '3px solid #78350f' 
                      : '2px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: !selectedPayoutType 
                      ? '0 6px 12px rgba(120, 53, 15, 0.3)' 
                      : '0 4px 6px rgba(120, 53, 15, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: !selectedPayoutType ? 'white' : '#78350f',
                    ':hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(120, 53, 15, 0.2)',
                      backgroundColor: !selectedPayoutType 
                        ? 'rgba(245, 158, 11, 0.95)' 
                        : 'rgba(251, 191, 36, 0.2)'
                    }
                  }}
                >
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '8px'
                  }}>
                    All Payouts
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    textAlign: 'center'
                  }}>
                    {payoutData.length} items
                  </div>
                </div>
              </div>
              
              {/* Selected payout type indicator */}
              {selectedPayoutType && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px 15px',
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginLeft: '10px'
                }}>
                  <span style={{
                    fontWeight: '500'
                  }}>
                    Showing: 
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: '#78350f'
                  }}>
                    {selectedPayoutType}
                  </span>
                  <button 
                    onClick={() => setSelectedPayoutType(null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#92400e',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0 5px'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filters Section */}
          {payoutData.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)'
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
                  color: '#78350f'
                }}>
                  Filters
                </h3>
                <button 
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: '#78350f',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                >
                  Reset Filters
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                {/* Bank Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#92400e'
                  }}>
                    Vendor Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={handleBankChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#78350f',
                      fontSize: '1rem'
                    }}
                  >
                    {availableBanks.map((bank, index) => (
                      <option key={index} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#92400e'
                  }}>
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search payouts..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#78350f',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payouts Table */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              backgroundColor: '#78350f',
              color: 'white',
              padding: '15px 20px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              <div>PAYOUT TYPE</div>
              <div>VENDOR BANK</div>
              <div>LOAN TYPE</div>
              <div>CATEGORY</div>
              <div>PAYOUT</div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 15px'
                }}></div>
                <p>Loading payout data...</p>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#92400e'
              }}>
                <p>No payouts found matching your criteria.</p>
              </div>
            ) : (
              /* Payouts List */
              <div>
                {filteredPayouts.map((payout, index) => (
                  <div 
                    key={payout.id || index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                      alignItems: 'center',
                      padding: '15px 20px',
                      borderBottom: '1px solid #fde68a',
                      backgroundColor: index % 2 === 0 ? 'rgba(254, 243, 199, 0.5)' : 'white',
                      textAlign: 'center'
                    }}
                  >
                    <div>{payout.payout_name_value || `Payout Type-${payout.payout_name}`}</div>
                    <div>{payout.vendor_bank_name || 'N/A'}</div>
                    <div>{payout.loan_type_name || 'N/A'}</div>
                    <div>{payout.category_name_value || 'N/A'}</div>
                    <div>{payout.payout || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div style={{
              padding: '15px 20px',
              backgroundColor: '#fef3c7',
              borderTop: '1px solid #fde68a',
              fontSize: '0.9rem',
              color: '#92400e',
              textAlign: 'right'
            }}>
              Showing {filteredPayouts.length} of {payoutData.length} payout(s)
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default AManager_Payout;