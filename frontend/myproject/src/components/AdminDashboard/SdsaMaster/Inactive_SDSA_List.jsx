import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api';
// import "./styles/ActiveEmpList.css"; // Reuse the same CSS

function Inactive_SDSA_List() {
  const [sdsaUsers, setSdsaUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const limit = 50;
  const navigate = useNavigate();

  // Inject bootstrap-icons if not present
  useEffect(() => {
    const href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // Load current user info
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }

    fetchCurrentUser();
  }, [navigate]);

  // Fetch current user information
  const fetchCurrentUser = async () => {
    try {
      setMe({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch inactive SDSA users from your Django API
  useEffect(() => {
    fetchInactiveSdsaUsers(page);
  }, [page]);

  // Function to fetch inactive SDSA users using your API
  function fetchInactiveSdsaUsers(p = 1) {
    setLoading(true);

    // Try to fetch with backend filter first
    api.get(`sdsa-users/?page=${p}&limit=${limit}&status=0`)
      .then(response => {
        let sdsaData = response.data || [];

        if (response.data.results) {
          // If API supports filtering with status=0 (inactive)
          const filteredSDSA = response.data.results.filter(sdsa =>
            sdsa.status === 0 || sdsa.status === false
          );
          setSdsaUsers(filteredSDSA);

          // For pagination, we need to handle the filtered count
          const total = filteredSDSA.length;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));
        } else {
          // If response is an array
          const filteredSDSA = sdsaData.filter(sdsa =>
            sdsa.status === 0 || sdsa.status === false
          );
          setSdsaUsers(filteredSDSA);
          setTotalPages(Math.max(1, Math.ceil(filteredSDSA.length / limit)));
        }
      })
      .catch(error => {
        // If backend filter fails, fetch all and filter locally
        console.log('Backend filter not supported, filtering locally...');

        api.get(`sdsa-users/?page=${p}&limit=${limit}`)
          .then(response => {
            let sdsaData = response.data || [];

            if (response.data.results) {
              // Filter only inactive SDSA users locally (status = 0 or false)
              const inactiveSDSA = response.data.results.filter(sdsa =>
                sdsa.status === 0 || sdsa.status === false
              );

              setSdsaUsers(inactiveSDSA);
              const total = inactiveSDSA.length;
              setTotalPages(Math.max(1, Math.ceil(total / limit)));
            } else {
              // Filter only inactive SDSA users locally
              const inactiveSDSA = sdsaData.filter(sdsa =>
                sdsa.status === 0 || sdsa.status === false
              );

              setSdsaUsers(inactiveSDSA);
              setTotalPages(Math.max(1, Math.ceil(inactiveSDSA.length / limit)));
            }
          })
          .catch(error => {
            console.error('Error fetching SDSA users:', error);
            setSdsaUsers([]);
            setTotalPages(1);

            if (error.response?.status === 401) {
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              localStorage.removeItem('role');
              navigate('/');
            }
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Function to handle activating SDSA user (status to 1)
  async function handleActivate(id) {
    const sdsa = sdsaUsers.find(sdsa => sdsa.id === id);
    if (!sdsa) return;

    const sdsaName = getFullName(sdsa);

    if (!window.confirm(`Are you sure you want to activate "${sdsaName}"?`)) return;

    try {
      setLoading(true);

      // Update status to 1 (active)
      const updateData = {
        status: 1,
        updated_at: new Date().toISOString()
      };

      console.log(`Activating SDSA user ${id} with data:`, updateData);

      // Try PATCH first
      try {
        const response = await api.patch(`sdsa-users/${id}/`, updateData);
        console.log('SDSA user activated successfully:', response.data);
      } catch (patchError) {
        console.log('PATCH failed, trying PUT...');
        
        // If PATCH fails, try PUT with full data
        const currentResponse = await api.get(`sdsa-users/${id}/`);
        const currentData = currentResponse.data;
        
        const fullUpdateData = {
          ...currentData,
          status: 1,
          updated_at: new Date().toISOString()
        };
        
        // Remove password field if it exists
        if (fullUpdateData.password) {
          delete fullUpdateData.password;
        }
        
        const response = await api.put(`sdsa-users/${id}/`, fullUpdateData);
        console.log('SDSA user activated with PUT:', response.data);
      }

      // Remove the SDSA from the list immediately
      setSdsaUsers(prevSDSA =>
        prevSDSA.filter(sdsa => sdsa.id !== id)
      );

      alert(`✅ "${sdsaName}" has been activated and removed from this list.`);

      // Refresh the list after 1 second
      setTimeout(() => {
        fetchInactiveSdsaUsers(page);
      }, 1000);

    } catch (error) {
      console.error('Error activating SDSA user:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        if (error.response.status === 400) {
          const errorData = error.response.data;
          let errorMsg = 'Validation error:\n';
          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              errorMsg += `${key}: ${errorData[key].join(', ')}\n`;
            } else {
              errorMsg += `${key}: ${errorData[key]}\n`;
            }
          }
          alert(errorMsg);
        } else if (error.response.status === 403) {
          alert('Permission denied. You need admin rights.');
        } else if (error.response.status === 404) {
          alert('SDSA user not found.');
        } else {
          alert(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        alert('No response from server. Check your connection.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Function to view SDSA details
  function handleView(id) {
    navigate(`/admin-dashboard/sdsa/view/${id}`);
  }

  // Function to edit SDSA details
  function handleEdit(id) {
    navigate(`/admin-dashboard/sdsa/edit/${id}`);
  }

  // Function to show/hide password
  const togglePasswordVisibility = (id) => {
    setSdsaUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, showPassword: !user.showPassword } : user
      )
    );
  };

  // Render action buttons
  function renderActions(row) {
    return (
      <div className="table-actions">
        <button
          className="action-btn view-btn"
          onClick={() => handleView(row.id)}
          title="View Details"
          disabled={loading}
        >
          <i className="bi bi-eye"></i>
        </button>
        <button
          className="action-btn edit-btn"
          onClick={() => handleEdit(row.id)}
          title="Edit"
          disabled={loading}
        >
          <i className="bi bi-pencil"></i>
        </button>
        {me && me.role === 'admin' && (
          <button
            className="action-btn activate-btn"
            onClick={() => handleActivate(row.id)}
            title="Activate User"
            disabled={loading}
          >
            <i className="bi bi-person-check"></i>
          </button>
        )}
      </div>
    );
  }

  // Get reporting user name
  const getReportingToName = (reportingTo) => {
    if (!reportingTo) return 'N/A';
    
    // If reportingTo is an object with firstName/lastName
    if (typeof reportingTo === 'object') {
      return `${reportingTo.firstName || ''} ${reportingTo.lastName || ''}`.trim();
    }
    
    // If it's just an ID or name string
    return reportingTo;
  };

  // Get phone number - based on your logs, it's in "phone_number" field
  const getPhoneNumber = (sdsa) => {
    if (!sdsa) return 'N/A';
    
    // From your console log, the phone number is in "phone_number" field
    if (sdsa.phone_number) return sdsa.phone_number;
    if (sdsa.phoneNumber) return sdsa.phoneNumber;
    if (sdsa.phone) return sdsa.phone;
    if (sdsa.mobile) return sdsa.mobile;
    if (sdsa.contact) return sdsa.contact;
    
    return 'N/A';
  };

  // Get email - from your logs, it's in "email_id" field
  const getEmail = (sdsa) => {
    if (!sdsa) return 'N/A';
    
    // From your console log, the email is in "email_id" field
    if (sdsa.email_id) return sdsa.email_id;
    if (sdsa.email) return sdsa.email;
    if (sdsa.emailId) return sdsa.emailId;
    
    return 'N/A';
  };

  // Get full name - from your logs, first_name and last_name fields
  const getFullName = (sdsa) => {
    if (!sdsa) return 'N/A';
    
    const firstName = sdsa.first_name || sdsa.firstName || '';
    const lastName = sdsa.last_name || sdsa.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || sdsa.username || sdsa.alias_name || 'N/A';
  };

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <div className="header-left">
          <h1><i className="bi bi-person-x-fill"></i> Inactive SDSA Users</h1>
          <p className="subtitle">Total: {sdsaUsers.length} inactive SDSA users</p>
        </div>
        <div className="header-right">
          <Link to="/admin-dashboard/sdsa/active" className="add-new-btn">
            <i className="bi bi-person-check"></i> View Active SDSA
          </Link>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Password</th>
                <th>Reporting To</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading inactive SDSA users...</p>
                    </div>
                  </td>
                </tr>
              ) : sdsaUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="bi bi-person-x"></i>
                      <h3>No inactive SDSA users found</h3>
                      <p>There are no inactive SDSA users in the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sdsaUsers.map((sdsa, index) => (
                  <tr key={sdsa.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-name-details">
                          <div className="employee-full-name">
                            {getFullName(sdsa)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="contact-info">
                        <div className="phone-number">
                          <i className="bi bi-phone"></i> {getPhoneNumber(sdsa)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="employee-email">
                        {getEmail(sdsa)}
                      </div>
                    </td>

                    <td>
                      <div className="password-container">
                        {sdsa.showPassword ? (
                          <>
                            <span className="password-text">{sdsa.password || '••••••••'}</span>
                            <button
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility(sdsa.id)}
                              title="Hide Password"
                            >
                              <i className="bi bi-eye-slash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="password-mask">••••••••</span>
                            <button
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility(sdsa.id)}
                              title="Show Password"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="reporting-to-info">
                        <i className="bi bi-person-badge"></i> {getReportingToName(sdsa.reportingTo || sdsa.reportingToName) || 'N/A'}
                      </div>
                    </td>

                    <td>
                      {/* All SDSA users in this list are inactive (status = 0) */}
                      <span className="status-badge inactive">
                        <i className="bi bi-circle-fill"></i> Inactive
                      </span>
                    </td>

                    <td>
                      {renderActions(sdsa)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sdsaUsers.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn prev"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </button>

            <div className="page-info">
              Page {page} of {totalPages}
            </div>

            <button
              className="pagination-btn next"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inactive_SDSA_List;