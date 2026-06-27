import React, { useState } from 'react';
import MarketingHead_Sidebar from "../Sidebar/MarketingHead_Sidebar.jsx";
import "../Sidebar/MarketingHead_Sidebar.css";
import { 
  FaUserCircle, 
  FaListAlt,
  FaFilter,
  FaRedo,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaUserTag,
  FaIdCard,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserSlash
} from 'react-icons/fa';

const Inactive_EmpList = () => {
  // Inactive Employees Data (Only Inactive Status)
  const [employeesData, setEmployeesData] = useState([
    {
      id: 1,
      fullName: 'Amit Shah',
      employeeId: 'EMP010',
      mobile: '912 345 6780',
      email: 'amit.shah@company.com',
      reportingTo: 'Former Manager - Sales',
      department: 'Sales',
      designation: 'Former Sales Executive',
      branchLocation: 'Nellore-NEL',
      status: 'Inactive',
      terminationDate: '2024-01-15',
      reason: 'Resigned'
    },
    {
      id: 2,
      fullName: 'Kavita Nair',
      employeeId: 'EMP011',
      mobile: '876 543 2100',
      email: 'kavita.n@company.com',
      reportingTo: 'Former Director - Marketing',
      department: 'Marketing',
      designation: 'Former Marketing Manager',
      branchLocation: 'Mumbai-MUM',
      status: 'Inactive',
      terminationDate: '2024-02-20',
      reason: 'Contract Ended'
    },
    {
      id: 3,
      fullName: 'Rohan Desai',
      employeeId: 'EMP012',
      mobile: '765 432 1090',
      email: 'rohan.d@company.com',
      reportingTo: 'Former HR Head',
      department: 'HR',
      designation: 'Former HR Executive',
      branchLocation: 'Bangalore-BLR',
      status: 'Inactive',
      terminationDate: '2023-12-10',
      reason: 'Retired'
    },
    {
      id: 4,
      fullName: 'Meena Kapoor',
      employeeId: 'EMP013',
      mobile: '654 321 0980',
      email: 'meena.k@company.com',
      reportingTo: 'Former CFO',
      department: 'Finance',
      designation: 'Former Finance Manager',
      branchLocation: 'Chennai-CHE',
      status: 'Inactive',
      terminationDate: '2024-01-30',
      reason: 'Resigned'
    },
    {
      id: 5,
      fullName: 'Suresh Iyer',
      employeeId: 'EMP014',
      mobile: '543 210 9870',
      email: 'suresh.i@company.com',
      reportingTo: 'Former Operations Head',
      department: 'Operations',
      designation: 'Former Operations Manager',
      branchLocation: 'Delhi-DEL',
      status: 'Inactive',
      terminationDate: '2023-11-25',
      reason: 'Terminated'
    },
    {
      id: 6,
      fullName: 'Divya Menon',
      employeeId: 'EMP015',
      mobile: '432 109 8760',
      email: 'divya.m@company.com',
      reportingTo: 'Former CTO',
      department: 'IT',
      designation: 'Former Software Engineer',
      branchLocation: 'Hyderabad-HYD',
      status: 'Inactive',
      terminationDate: '2024-02-05',
      reason: 'Resigned'
    },
    {
      id: 7,
      fullName: 'Prakash Joshi',
      employeeId: 'EMP016',
      mobile: '321 098 7650',
      email: 'prakash.j@company.com',
      reportingTo: 'Former Customer Service Head',
      department: 'Customer Service',
      designation: 'Former Customer Service Rep',
      branchLocation: 'Pune-PUN',
      status: 'Inactive',
      terminationDate: '2024-01-10',
      reason: 'Contract Ended'
    },
    {
      id: 8,
      fullName: 'Lata Singh',
      employeeId: 'EMP017',
      mobile: '210 987 6540',
      email: 'lata.s@company.com',
      reportingTo: 'Former Sales Head',
      department: 'Sales',
      designation: 'Former Senior Sales Executive',
      branchLocation: 'Ahmedabad-AHM',
      status: 'Inactive',
      terminationDate: '2023-12-28',
      reason: 'Resigned'
    }
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    designation: '',
    branchLocation: '',
    terminationReason: '',
    searchQuery: ''
  });

  // Available options for dropdowns
  const departments = ['All', 'Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Customer Service'];
  const designations = ['All', 'Former Sales Executive', 'Former Marketing Manager', 'Former IT Manager', 'Former HR Executive', 'Former Finance Manager', 'Former Operations Head', 'Former Customer Service Rep', 'Former Software Engineer', 'Former Senior Sales Executive'];
  const locations = ['All', 'Nellore-NEL', 'Mumbai-MUM', 'Bangalore-BLR', 'Chennai-CHE', 'Delhi-DEL', 'Hyderabad-HYD', 'Pune-PUN', 'Ahmedabad-AHM'];
  const terminationReasons = ['All', 'Resigned', 'Terminated', 'Retired', 'Contract Ended', 'Other'];
  const reportingToOptions = ['All', 'Former Manager - Sales', 'Former Director - Marketing', 'Former CTO', 'Former HR Head', 'Former CFO', 'Former Operations Head', 'Former Customer Service Head', 'Former Sales Head'];

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === 'All' ? '' : value
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      department: '',
      designation: '',
      branchLocation: '',
      terminationReason: '',
      searchQuery: ''
    });
  };

  // Filter employees data
  const filteredData = employeesData.filter(item => {
    return (
      (filters.department === '' || item.department === filters.department) &&
      (filters.designation === '' || item.designation === filters.designation) &&
      (filters.branchLocation === '' || item.branchLocation === filters.branchLocation) &&
      (filters.terminationReason === '' || item.reason === filters.terminationReason) &&
      (filters.searchQuery === '' || 
        item.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.employeeId.includes(filters.searchQuery) ||
        item.mobile.includes(filters.searchQuery) ||
        item.email.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    );
  });

  // Handle delete employee
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this inactive employee record?')) {
      setEmployeesData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle restore employee
  const handleRestore = (id) => {
    if (window.confirm('Do you want to restore this employee to active status?')) {
      alert(`Employee with ID: ${id} restored to active status`);
      // Implement restore logic here
    }
  };

  // Handle view details
  const handleView = (id) => {
    alert(`View details for inactive employee with ID: ${id}`);
    // Implement view logic here
  };

  // Handle export inactive employees
  const handleExport = () => {
    alert('Exporting inactive employees list...');
    // Implement export logic here
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Marketing Manager Sidebar */}
      <MarketingHead_Sidebar />

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
        {/* Header Section */}
        <div style={{
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#78350f',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <FaUserSlash style={{ color: '#ef4444' }} />
            Inactive Employees List
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#92400e',
            opacity: 0.8,
            marginLeft: '55px'
          }}>
            View and manage all inactive/former employees in the organization
          </p>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#78350f',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaFilter style={{ color: '#ef4444' }} />
            Filter Inactive Employees
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {/* Department Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaBuilding style={{ color: '#ef4444', fontSize: '0.8rem' }} />
                Department
              </label>
              <select
                value={filters.department || 'All'}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaUserTag style={{ color: '#ef4444', fontSize: '0.8rem' }} />
                Designation
              </label>
              <select
                value={filters.designation || 'All'}
                onChange={(e) => handleFilterChange('designation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {designations.map((des, index) => (
                  <option key={index} value={des}>
                    {des}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Location Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: '0.8rem' }} />
                Branch Location
              </label>
              <select
                value={filters.branchLocation || 'All'}
                onChange={(e) => handleFilterChange('branchLocation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Termination Reason Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaUserSlash style={{ color: '#ef4444', fontSize: '0.8rem' }} />
                Termination Reason
              </label>
              <select
                value={filters.terminationReason || 'All'}
                onChange={(e) => handleFilterChange('terminationReason', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {terminationReasons.map((reason, index) => (
                  <option key={index} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporting To Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaIdCard style={{ color: '#ef4444', fontSize: '0.8rem' }} />
                Reporting To
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {reportingToOptions.map((report, index) => (
                  <option key={index} value={report}>
                    {report}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Search Box */}
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Search inactive employees by Name, Employee ID, Mobile or Email..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 50px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ef4444'
              }} />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              style={{
                padding: '14px 30px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FaRedo />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Inactive Employees List Table */}
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
              <FaListAlt style={{ color: '#ef4444' }} />
              Inactive Employees List ({filteredData.length} records)
            </h3>
            <div style={{
              fontSize: '0.9rem',
              color: '#ef4444',
              fontWeight: '600',
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444'
              }} />
              All Inactive Employees
            </div>
          </div>

          {/* Table */}
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid rgba(239, 68, 68, 0.2)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1200px'
            }}>
              {/* Table Head */}
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '120px'
                  }}>
                    FULL NAME
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '100px'
                  }}>
                    EMPLOYEE ID
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: 'white',
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
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '180px'
                  }}>
                    EMAIL
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '150px'
                  }}>
                    TERMINATION DATE
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    minWidth: '200px'
                  }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredData.map((employee) => (
                  <tr key={employee.id} style={{
                    borderBottom: '2px solid rgba(239, 68, 68, 0.1)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease'
                  }}>
                    <td style={{
                      padding: '20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(239, 68, 68, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUserCircle style={{ color: '#ef4444', fontSize: '1.2rem' }} />
                        {employee.fullName}
                      </div>
                    </td>
                    <td style={{
                      padding: '20px',
                      color: '#92400e',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(239, 68, 68, 0.1)'
                    }}>
                      {employee.employeeId}
                    </td>
                    <td style={{
                      padding: '20px',
                      color: '#92400e',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaPhone style={{ color: '#ef4444', fontSize: '0.9rem' }} />
                      {employee.mobile}
                    </td>
                    <td style={{
                      padding: '20px',
                      color: '#92400e',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaEnvelope style={{ color: '#ef4444', fontSize: '0.9rem' }} />
                      {employee.email}
                    </td>
                    <td style={{
                      padding: '20px',
                      color: '#92400e',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(239, 68, 68, 0.1)',
                      fontWeight: '600'
                    }}>
                      {employee.terminationDate}
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#ef4444',
                        marginTop: '4px'
                      }}>
                        {employee.reason}
                      </div>
                    </td>
                    <td style={{
                      padding: '20px',
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <button
                        onClick={() => handleView(employee.id)}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        onClick={() => handleRestore(employee.id)}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FaRedo />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
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
                👤
              </div>
              <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                No Inactive Employees Found
              </h4>
              <p style={{
                fontSize: '1rem',
                opacity: 0.8,
                marginBottom: '30px'
              }}>
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaRedo />
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '2px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#92400e',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Showing <span style={{ color: '#ef4444', fontWeight: '700' }}>{filteredData.length}</span> of {employeesData.length} Inactive Employees
              </div>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button style={{
                  padding: '10px 20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#92400e',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ← Previous
                </button>
                <div style={{
                  display: 'flex',
                  gap: '5px'
                }}>
                  <button style={{
                    padding: '10px 15px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    1
                  </button>
                  <button style={{
                    padding: '10px 15px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#92400e',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    2
                  </button>
                  <button style={{
                    padding: '10px 15px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#92400e',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    3
                  </button>
                </div>
                <button style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inactive_EmpList;