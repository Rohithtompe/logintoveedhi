import React, { useState } from 'react';
import MarketingHead_Sidebar from "../Sidebar/MarketingHead_Sidebar.jsx";
import "../Sidebar/MarketingHead_Sidebar.css";
import { 
  FaUserCircle, 
  FaListAlt,
  FaPlusCircle,
  FaFilter,
  FaRedo,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaBuilding,
  FaUserTag,
  FaCalendarAlt,
  FaUpload,
  FaLock
} from 'react-icons/fa';

const Add_Emp = () => {
  // Employees Data
  const [employeesData, setEmployeesData] = useState([
    {
      id: 1,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      employeeId: 'EMP001',
      personalPhone: '658 799 8941',
      officialPhone: '080 799 8941',
      branchState: 'Andhra Pradesh-AP',
      department: 'Sales',
      aadhaarNumber: '8147 8147 8147',
      accountNumber: '6581 7991 8941',
      branchLocation: 'Nellore-NEL',
      designation: 'Sales Executive',
      panNumber: 'ABCD1234A',
      ifscCode: 'HDFC0001111',
      bankName: 'HDFC Bank',
      reportingTo: 'Manager - Sales',
      accountType: 'Savings',
      presentAddress: '123 Main Street, Nellore',
      permanentAddress: '123 Main Street, Nellore',
      dateOfBirth: '15/05/1990',
      email: 'rajesh.k@company.com',
      status: 'Active'
    },
    {
      id: 2,
      firstName: 'Priya',
      lastName: 'Sharma',
      employeeId: 'EMP002',
      personalPhone: '987 654 3210',
      officialPhone: '080 654 3210',
      branchState: 'Maharashtra-MH',
      department: 'Marketing',
      aadhaarNumber: '1234 5678 9012',
      accountNumber: '9876 5432 1098',
      branchLocation: 'Mumbai-MUM',
      designation: 'Marketing Manager',
      panNumber: 'EFGH5678B',
      ifscCode: 'ICIC0001234',
      bankName: 'ICICI Bank',
      reportingTo: 'Director - Marketing',
      accountType: 'Current',
      presentAddress: '456 Business Avenue, Mumbai',
      permanentAddress: '456 Business Avenue, Mumbai',
      dateOfBirth: '22/08/1988',
      email: 'priya.s@company.com',
      status: 'Active'
    },
    {
      id: 3,
      firstName: 'Amit',
      lastName: 'Patel',
      employeeId: 'EMP003',
      personalPhone: '789 123 4567',
      officialPhone: '080 123 4567',
      branchState: 'Delhi-DL',
      department: 'IT',
      aadhaarNumber: '3456 7890 1234',
      accountNumber: '8765 4321 0987',
      branchLocation: 'New Delhi-ND',
      designation: 'IT Manager',
      panNumber: 'IJKL9012C',
      ifscCode: 'SBIN0004567',
      bankName: 'SBI Bank',
      reportingTo: 'CTO',
      accountType: 'Savings',
      presentAddress: '789 Tech Street, Delhi',
      permanentAddress: '789 Tech Street, Delhi',
      dateOfBirth: '10/12/1985',
      email: 'amit.p@company.com',
      status: 'Inactive'
    },
    {
      id: 4,
      firstName: 'Sneha',
      lastName: 'Reddy',
      employeeId: 'EMP004',
      personalPhone: '912 345 6789',
      officialPhone: '080 345 6789',
      branchState: 'Karnataka-KA',
      department: 'HR',
      aadhaarNumber: '5678 9012 3456',
      accountNumber: '7654 3210 9876',
      branchLocation: 'Bangalore-BLR',
      designation: 'HR Executive',
      panNumber: 'MNOP3456D',
      ifscCode: 'AXIS0007890',
      bankName: 'Axis Bank',
      reportingTo: 'HR Head',
      accountType: 'Savings',
      presentAddress: '101 Tech Park, Bangalore',
      permanentAddress: '101 Tech Park, Bangalore',
      dateOfBirth: '03/03/1992',
      email: 'sneha.r@company.com',
      status: 'Active'
    },
    {
      id: 5,
      firstName: 'Vikram',
      lastName: 'Singh',
      employeeId: 'EMP005',
      personalPhone: '876 543 2109',
      officialPhone: '080 543 2109',
      branchState: 'Tamil Nadu-TN',
      department: 'Finance',
      aadhaarNumber: '6789 0123 4567',
      accountNumber: '6543 2109 8765',
      branchLocation: 'Chennai-CHE',
      designation: 'Finance Manager',
      panNumber: 'QRST7890E',
      ifscCode: 'HDFC0002222',
      bankName: 'HDFC Bank',
      reportingTo: 'CFO',
      accountType: 'Current',
      presentAddress: '202 Marina Road, Chennai',
      permanentAddress: '202 Marina Road, Chennai',
      dateOfBirth: '18/11/1987',
      email: 'vikram.s@company.com',
      status: 'Active'
    },
  ]);

  // Form state for adding new employee
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    personalPhone: '',
    officialPhone: '',
    branchState: '',
    department: '',
    aadhaarNumber: '',
    accountNumber: '',
    branchLocation: '',
    designation: '',
    panNumber: '',
    ifscCode: '',
    bankName: '',
    reportingTo: '',
    accountType: '',
    presentAddress: '',
    permanentAddress: '',
    dateOfBirth: '',
    email: '',
    password: '',
    status: 'Active'
  });

  // File upload states
  const [panCardFile, setPanCardFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState(null);
  const [employeeImageFile, setEmployeeImageFile] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    designation: '',
    branchState: '',
    branchLocation: '',
    status: '',
    searchQuery: ''
  });

  // Available options for dropdowns
  const departments = ['All', 'Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Customer Service'];
  const designations = ['All', 'Sales Executive', 'Marketing Manager', 'IT Manager', 'HR Executive', 'Finance Manager', 'Operations Head', 'Customer Service Rep'];
  const states = ['All', 'Andhra Pradesh-AP', 'Maharashtra-MH', 'Delhi-DL', 'Karnataka-KA', 'Tamil Nadu-TN', 'Uttar Pradesh-UP', 'Gujarat-GJ'];
  const locations = ['All', 'Nellore-NEL', 'Mumbai-MUM', 'New Delhi-ND', 'Bangalore-BLR', 'Chennai-CHE', 'Lucknow-LKW', 'Ahmedabad-AHM'];
  const statuses = ['All', 'Active', 'Inactive'];
  const bankNames = ['All', 'HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank', 'Kotak Bank', 'Yes Bank'];
  const accountTypes = ['All', 'Savings', 'Current', 'Salary'];
  const reportingToOptions = ['All', 'Manager - Sales', 'Director - Marketing', 'CTO', 'HR Head', 'CFO', 'Operations Head'];

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
      branchState: '',
      branchLocation: '',
      status: '',
      searchQuery: ''
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file uploads
  const handleFileChange = (fileType, e) => {
    const file = e.target.files[0];
    switch (fileType) {
      case 'panCard':
        setPanCardFile(file);
        break;
      case 'bankProof':
        setBankProofFile(file);
        break;
      case 'aadhaarCard':
        setAadhaarCardFile(file);
        break;
      case 'employeeImage':
        setEmployeeImageFile(file);
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for required fields
    const requiredFields = ['firstName', 'lastName', 'employeeId', 'personalPhone', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !newEmployee[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill all required fields (*): ${missingFields.join(', ')}`);
      return;
    }

    const newId = employeesData.length + 1;
    setEmployeesData(prev => [...prev, { id: newId, ...newEmployee }]);
    
    alert('Employee added successfully!');
    
    // Reset form
    setNewEmployee({
      firstName: '',
      lastName: '',
      employeeId: '',
      personalPhone: '',
      officialPhone: '',
      branchState: '',
      department: '',
      aadhaarNumber: '',
      accountNumber: '',
      branchLocation: '',
      designation: '',
      panNumber: '',
      ifscCode: '',
      bankName: '',
      reportingTo: '',
      accountType: '',
      presentAddress: '',
      permanentAddress: '',
      dateOfBirth: '',
      email: '',
      password: '',
      status: 'Active'
    });

    // Reset file uploads
    setPanCardFile(null);
    setBankProofFile(null);
    setAadhaarCardFile(null);
    setEmployeeImageFile(null);
  };

  // Filter employees data
  const filteredData = employeesData.filter(item => {
    return (
      (filters.department === '' || item.department === filters.department) &&
      (filters.designation === '' || item.designation === filters.designation) &&
      (filters.branchState === '' || item.branchState === filters.branchState) &&
      (filters.branchLocation === '' || item.branchLocation === filters.branchLocation) &&
      (filters.status === '' || item.status === filters.status) &&
      (filters.searchQuery === '' || 
        item.firstName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.lastName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.employeeId.includes(filters.searchQuery) ||
        item.personalPhone.includes(filters.searchQuery) ||
        item.email.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    );
  });

  // Handle delete employee
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployeesData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle edit employee
  const handleEdit = (id) => {
    alert(`Edit employee with ID: ${id}`);
    // Implement edit logic here
  };

  // Handle view details
  const handleView = (id) => {
    alert(`View details for employee with ID: ${id}`);
    // Implement view logic here
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
 

        {/* Add New Employee Form */}
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
            <FaPlusCircle style={{ color: '#f59e0b' }} />
            Add Employee Details
          </h3>

          <form onSubmit={handleSubmit}>
            {/* First Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* First Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newEmployee.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="First Name"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newEmployee.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Last Name"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Employee ID */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Employee-Id *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={newEmployee.employeeId}
                  onChange={handleInputChange}
                  required
                  placeholder="Employee ID"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Second Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={newEmployee.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Password"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Personal Phone No */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Personal Phone No *
                </label>
                <input
                  type="tel"
                  name="personalPhone"
                  value={newEmployee.personalPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="658 799 8941"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Official Phone No */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Official Phone No
                </label>
                <input
                  type="tel"
                  name="officialPhone"
                  value={newEmployee.officialPhone}
                  onChange={handleInputChange}
                  placeholder="080 799 8941"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Third Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Branch State */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Branch State
                </label>
                <select
                  name="branchState"
                  value={newEmployee.branchState}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Branch State</option>
                  {states.filter(state => state !== 'All').map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Department
                </label>
                <select
                  name="department"
                  value={newEmployee.department}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.filter(dept => dept !== 'All').map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Designation
                </label>
                <select
                  name="designation"
                  value={newEmployee.designation}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Designation</option>
                  {designations.filter(des => des !== 'All').map((des, index) => (
                    <option key={index} value={des}>
                      {des}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fourth Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Aadhaar Number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={newEmployee.aadhaarNumber}
                  onChange={handleInputChange}
                  placeholder="8147 8147 8147"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Account number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Account number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={newEmployee.accountNumber}
                  onChange={handleInputChange}
                  placeholder="6581 7991 8941"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Branch Location */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Branch Location
                </label>
                <select
                  name="branchLocation"
                  value={newEmployee.branchLocation}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Branch Location</option>
                  {locations.filter(loc => loc !== 'All').map((loc, index) => (
                    <option key={index} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fifth Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Pan Number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Pan Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={newEmployee.panNumber}
                  onChange={handleInputChange}
                  placeholder="ABCD1234A"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={newEmployee.ifscCode}
                  onChange={handleInputChange}
                  placeholder="HDFC0001111"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  required
                  placeholder="employee@company.com"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Sixth Row - Bank Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Bank Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Bank Name
                </label>
                <select
                  name="bankName"
                  value={newEmployee.bankName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Bank name</option>
                  {bankNames.filter(bank => bank !== 'All').map((bank, index) => (
                    <option key={index} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Type */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={newEmployee.accountType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Account Type</option>
                  {accountTypes.filter(type => type !== 'All').map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporting To */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Reporting To
                </label>
                <select
                  name="reportingTo"
                  value={newEmployee.reportingTo}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="">Select Reporting To</option>
                  {reportingToOptions.filter(report => report !== 'All').map((report, index) => (
                    <option key={index} value={report}>
                      {report}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seventh Row - Date of Birth and File Uploads */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Date of Birth */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Date of Birth
                </label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={newEmployee.dateOfBirth}
                  onChange={handleInputChange}
                  placeholder="DD/MM/YYYY"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Pan Card Upload */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Pan Card Upload
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <label style={{
                    padding: '8px 15px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                    color: '#d97706',
                    border: '1px solid #f59e0b60',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaUpload />
                    Choose File
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('panCard', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{
                    color: '#78350f',
                    fontSize: '0.85rem'
                  }}>
                    {panCardFile ? panCardFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Eighth Row - Addresses */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Present Address */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Present Address
                </label>
                <textarea
                  name="presentAddress"
                  value={newEmployee.presentAddress}
                  onChange={handleInputChange}
                  placeholder="Present Address"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Permanent Address */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Permanent Address
                </label>
                <textarea
                  name="permanentAddress"
                  value={newEmployee.permanentAddress}
                  onChange={handleInputChange}
                  placeholder="Permanent Address"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Ninth Row - More File Uploads */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Bank Proof Upload */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Bank Proof Upload
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <label style={{
                    padding: '8px 15px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                    color: '#d97706',
                    border: '1px solid #f59e0b60',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaUpload />
                    Choose File
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('bankProof', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{
                    color: '#78350f',
                    fontSize: '0.85rem'
                  }}>
                    {bankProofFile ? bankProofFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Aadhaar Card Upload */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Aadhaar Card Upload
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <label style={{
                    padding: '8px 15px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                    color: '#d97706',
                    border: '1px solid #f59e0b60',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaUpload />
                    Choose File
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('aadhaarCard', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{
                    color: '#78350f',
                    fontSize: '0.85rem'
                  }}>
                    {aadhaarCardFile ? aadhaarCardFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Employee Image */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Employee Image
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <label style={{
                    padding: '8px 15px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                    color: '#d97706',
                    border: '1px solid #f59e0b60',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaUpload />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('employeeImage', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{
                    color: '#78350f',
                    fontSize: '0.85rem'
                  }}>
                    {employeeImageFile ? employeeImageFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  Status
                </label>
                <select
                  name="status"
                  value={newEmployee.status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setNewEmployee({
                    firstName: '',
                    lastName: '',
                    employeeId: '',
                    personalPhone: '',
                    officialPhone: '',
                    branchState: '',
                    department: '',
                    aadhaarNumber: '',
                    accountNumber: '',
                    branchLocation: '',
                    designation: '',
                    panNumber: '',
                    ifscCode: '',
                    bankName: '',
                    reportingTo: '',
                    accountType: '',
                    presentAddress: '',
                    permanentAddress: '',
                    dateOfBirth: '',
                    email: '',
                    password: '',
                    status: 'Active'
                  });
                  setPanCardFile(null);
                  setBankProofFile(null);
                  setAadhaarCardFile(null);
                  setEmployeeImageFile(null);
                }}
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
                Clear Form
              </button>
              <button
                type="submit"
                style={{
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <FaPlusCircle />
                Add Employee
              </button>
            </div>
          </form>
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
            <FaFilter style={{ color: '#f59e0b' }} />
            Filter Employees
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
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
                marginBottom: '8px'
              }}>
                Department
              </label>
              <select
                value={filters.department || 'All'}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
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
                marginBottom: '8px'
              }}>
                Designation
              </label>
              <select
                value={filters.designation || 'All'}
                onChange={(e) => handleFilterChange('designation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
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

            {/* State Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Branch State
              </label>
              <select
                value={filters.branchState || 'All'}
                onChange={(e) => handleFilterChange('branchState', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#78350f',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {states.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Branch Location
              </label>
              <select
                value={filters.branchLocation || 'All'}
                onChange={(e) => handleFilterChange('branchLocation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
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
                placeholder="Search by Name, ID, Phone or Email..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 50px',
                  borderRadius: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
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
                color: '#f59e0b'
              }} />
            </div>

            {/* Status Filter and Reset Button */}
            <div style={{
              display: 'flex',
              gap: '15px'
            }}>
              {/* Status Filter */}
              <div style={{ minWidth: '150px' }}>
                <select
                  value={filters.status || 'All'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#78350f',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                style={{
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <FaRedo />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employees List Table */}
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
              <FaListAlt style={{ color: '#f59e0b' }} />
              Employees List ({filteredData.length} records)
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
              Showing {filteredData.length} of {employeesData.length} Employees
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
              minWidth: '1400px'
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
                    minWidth: '100px'
                  }}>
                    EMP ID
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
                    EMPLOYEE NAME
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
                    PHONE NO
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '140px'
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
                    minWidth: '140px'
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
                    minWidth: '140px'
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
                    minWidth: '120px'
                  }}>
                    BRANCH
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '100px'
                  }}>
                    STATUS
                  </th>
                  <th style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#78350f',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    minWidth: '180px'
                  }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredData.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{
                      background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 230, 138, 0.1)',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        background: 'rgba(251, 191, 36, 0.15)'
                      }
                    }}
                  >
                    <td style={{
                      padding: '18px 20px',
                      color: '#92400e',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.employeeId}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.firstName} {item.lastName}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.personalPhone}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.department}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.designation}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.email}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      color: '#78350f',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      {item.branchLocation}
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        background: item.status === 'Active' 
                          ? 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)'
                          : 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                        color: item.status === 'Active' ? '#059669' : '#dc2626',
                        border: item.status === 'Active' 
                          ? '1px solid #10b98160' 
                          : '1px solid #ef444460'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '18px 20px',
                      borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <button
                          onClick={() => handleView(item.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #3b82f620 0%, #3b82f640 100%)',
                            color: '#1d4ed8',
                            border: '1px solid #3b82f660',
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
                          onClick={() => handleEdit(item.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                            color: '#d97706',
                            border: '1px solid #f59e0b60',
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
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
                            color: '#dc2626',
                            border: '1px solid #ef444460',
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
                      </div>
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
                👨‍💼
              </div>
              <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                No Employees Found
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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

          {/* Pagination (if needed) */}
          {filteredData.length > 0 && (
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
                Page 1 of 1
              </div>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button style={{
                  padding: '10px 20px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#92400e',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Previous
                </button>
                <button style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Add_Emp;