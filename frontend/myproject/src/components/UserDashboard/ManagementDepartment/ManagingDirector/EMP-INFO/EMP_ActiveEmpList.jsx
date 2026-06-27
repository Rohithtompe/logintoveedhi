import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../api';
// import "./styles/ActiveEmpList.css";

import ManagingDirector_Sidebar from '../../ManagingDirector/Sidebar/ManagingDirector_Sidebar.jsx';
import '../../ManagingDirector/Sidebar/ManagingDirector_Sidebar.css';

function EMP_ActiveEmpList() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  // const limit = 50;
  const limit = 25;
  const navigate = useNavigate();

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    office_email: '',
    contact_info: '',
    office_phone_number: '',
    branch_inner_state: '',
    branch_inner_location: '',
    aadhar_number: '',
    pan_number: '',
    present_address: '',
    permanent_address: '',
    date_of_birth: '',
    employee_image: null,
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  // Fetch employees from your Django API
  useEffect(() => {
    fetchEmployees(page);
    fetchDropdownData();
  }, [page]);

  // Function to fetch employees using your API
  function fetchEmployees(p = 1) {
    setLoading(true);

    // Try to fetch with backend filter first
    api.get(`users/?page=${p}&limit=${limit}&is_active=true`)
      .then(response => {
        let employeesData = response.data || [];

        if (response.data.results) {
          // If API supports filtering with is_active=true
          const filteredEmployees = response.data.results.filter(emp =>
            emp.is_active === true || emp.is_active === undefined
          );
          const total = filteredEmployees.length;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));

          // Pagination slice
          const startIndex = (p - 1) * limit;
          const endIndex = startIndex + limit;

          setEmployees(filteredEmployees.slice(startIndex, endIndex));
        } else {
          // If response is an array
          const filteredEmployees = employeesData.filter(emp =>
            emp.is_active === true || emp.is_active === undefined
          );

          const total = filteredEmployees.length;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));

          const startIndex = (p - 1) * limit;
          const endIndex = startIndex + limit;

          setEmployees(filteredEmployees.slice(startIndex, endIndex));
        }
      })
      .catch(error => {
        // If backend filter fails (parameter not supported), fetch all and filter locally
        console.log('Backend filter not supported, filtering locally...');

        api.get(`users/?page=${p}&limit=${limit}`)
          .then(response => {
            let employeesData = response.data || [];

            if (response.data.results) {
              // Filter only active employees locally
              const activeEmployees = response.data.results.filter(emp =>
                emp.is_active === true || emp.is_active === undefined
              );

              const total = activeEmployees.length;
              setTotalPages(Math.max(1, Math.ceil(total / limit)));

              const startIndex = (p - 1) * limit;
              const endIndex = startIndex + limit;

              setEmployees(activeEmployees.slice(startIndex, endIndex));
            } else {
              // Filter only active employees locally
              const activeEmployees = employeesData.filter(emp =>
                emp.is_active === true || emp.is_active === undefined
              );

              const total = activeEmployees.length;
              setTotalPages(Math.max(1, Math.ceil(total / limit)));

              const startIndex = (p - 1) * limit;
              const endIndex = startIndex + limit;

              setEmployees(activeEmployees.slice(startIndex, endIndex));
            }
          })
          .catch(error => {
            console.error('Error fetching employees:', error);
            setEmployees([]);
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

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      // Fetch departments
      const deptResponse = await api.get('departments-dropdown/');
      setDepartments(deptResponse.data || []);

      // Fetch branch inner states
      const statesResponse = await api.get('branch-inner-states/');
      setBranchInnerStates(statesResponse.data || []);

      const locationsResponse = await api.get('branch-inner-locations/');
      setBranchInnerLocations(locationsResponse.data || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Fetch branch locations based on state
  const fetchBranchInnerLocations = async (stateId) => {
    if (!stateId) {
      setBranchInnerLocations([]);
      return;
    }

    try {
      const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);
      setBranchInnerLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      <ManagingDirector_Sidebar />

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
        {/* Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.9) 0%, rgba(251, 191, 36, 0.8) 100%)',
          borderRadius: '20px',
          padding: '35px',
          marginBottom: '40px',
          color: '#451a03',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#92400e',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  width: '30px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                MANAGING DIRECTOR - EMPLOYEE MANAGEMENT
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                marginBottom: '15px',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Active Employees
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Manage and view all active employees in the system
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              minWidth: '130px',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {employees.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Active Employees
              </div>
            </div>
          </div>
        </div>

        {/* Employee List Table */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <i className="bi bi-people-fill" style={{ color: '#f59e0b' }}></i>
              Employee List ({employees.length} records)
            </h3>
            <div style={{
              fontSize: '0.9rem',
              color: '#92400e',
              fontWeight: '600',
              padding: '8px 16px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              Page {page} of {totalPages}
            </div>
          </div>

          {/* Table */}
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid rgba(251, 191, 36, 0.2)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1200px'
            }}>
              {/* Table Head */}
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                }}>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '200px'
                  }}>
                    FULL NAME
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '120px'
                  }}>
                    EMPLOYEE ID
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '120px'
                  }}>
                    MOBILE
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '200px'
                  }}>
                    EMAIL
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '150px'
                  }}>
                    DESIGNATION
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '150px'
                  }}>
                    DEPARTMENT
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '150px'
                  }}>
                    BRANCH STATE
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    minWidth: '150px'
                  }}>
                    BRANCH LOCATION
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{
                          border: '3px solid #f3f3f3',
                          borderTop: '3px solid #f59e0b',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 20px'
                        }}></div>
                        <p style={{ color: '#92400e', fontSize: '1.1rem' }}>Loading active employees...</p>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#92400e'
                      }}>
                        <div style={{
                          fontSize: '4rem',
                          marginBottom: '20px',
                          opacity: 0.3
                        }}>
                          👥
                        </div>
                        <h4 style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          marginBottom: '10px'
                        }}>
                          No Active Employees Found
                        </h4>
                        <p style={{
                          fontSize: '1rem',
                          opacity: 0.8
                        }}>
                          There are no active employees in the system
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <td style={{
                        padding: '18px 20px',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {employee.profile_image ? (
                            <img
                              src={employee.profile_image}
                              alt={`${employee.first_name || ''} ${employee.last_name || ''}`}
                              style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #f59e0b'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/35';
                              }}
                            />
                          ) : (
                            <></>
                          )}
                          <span style={{
                            color: '#78350f',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                          }}>
                            {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#92400e',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {employee.employee_id || employee.username || 'N/A'}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontSize: '0.95rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {employee.contact_info || 'N/A'}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontSize: '0.95rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {employee.email || 'N/A'}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#d97706',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {employee.designation && typeof employee.designation === 'object'
                          ? employee.designation.name
                          : employee.designation_name || 'N/A'}
                      </td>
                      <td style={{
                        padding: '18px 20px',
                        color: '#78350f',
                        fontSize: '0.95rem',
                        borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                        borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                      }}>
                        {employee.department && typeof employee.department === 'object'
                          ? employee.department.name
                          : employee.department_name || 'N/A'}
                      </td>
                      <td
                        style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontSize: '0.95rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}
                      >
                        {branchInnerStates.find(
                          s => s.id === employee.branch_inner_state
                        )?.name || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontSize: '0.95rem',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}
                      >
                        {branchInnerLocations.find(
                          l => l.id === employee.branch_inner_location
                        )?.name || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {employees.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '2px solid rgba(251, 191, 36, 0.2)'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#92400e',
                fontWeight: '600'
              }}>
                Page {page} of {totalPages}
              </div>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  style={{
                    padding: '10px 20px',
                    background: page === 1 ? 'rgba(251, 191, 36, 0.1)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: page === 1 ? '#92400e' : 'white',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  style={{
                    padding: '10px 20px',
                    background: page === totalPages ? 'rgba(251, 191, 36, 0.1)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: page === totalPages ? '#92400e' : 'white',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default EMP_ActiveEmpList;