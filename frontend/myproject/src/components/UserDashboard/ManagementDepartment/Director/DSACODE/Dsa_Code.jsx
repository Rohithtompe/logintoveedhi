import React, { useState, useEffect } from 'react';
import api from '../../../../../api.js';
import Director_Sidebar from "../../Director/Sidebar/Director_Sidebar.jsx";
import "../../Director/Sidebar/Director_Sidebar.css";
import { 
  FaFilter, 
  FaRedo, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaPlusCircle,
  FaListAlt,
  FaTag,
  FaBuilding,
  FaUserTie,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCity
} from 'react-icons/fa';

const Dsa_Code = ({ onEdit }) => {
  // State for table data
  const [dsaCodes, setDsaCodes] = useState([]);
  
  // State for dropdown data (for displaying names)
  const [vendorBanks, setVendorBanks] = useState([]);
  const [dsaNames, setDsaNames] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);

  // State for dynamic filter options
  const [filterOptions, setFilterOptions] = useState({
    vendorBanks: [],
    loanTypes: [],
    states: [],
    locations: []
  });

  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State for loading and messages
  const [tableLoading, setTableLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for filtered locations
  const [filteredLocations, setFilteredLocations] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    vendorBank: '',
    loanType: '',
    state: '',
    location: '',
    searchQuery: ''
  });

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

  // Fetch branch inner locations when branch state changes in edit mode
  useEffect(() => {
    if (editingId && editFormData.branch_state) {
      fetchBranchInnerLocations(editFormData.branch_state);
    } else if (editingId && !editFormData.branch_state) {
      setFilteredLocations([]);
    }
  }, [editFormData.branch_state, editingId]);

  // Update filter options when dropdown data changes
  useEffect(() => {
    if (vendorBanks.length > 0 || loanTypes.length > 0 || branchInnerStates.length > 0 || branchInnerLocations.length > 0) {
      generateFilterOptions();
    }
  }, [vendorBanks, loanTypes, branchInnerStates, branchInnerLocations]);

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

  // Generate dynamic filter options from the fetched data
  const generateFilterOptions = () => {
    const options = {
      vendorBanks: [],
      loanTypes: [],
      states: [],
      locations: []
    };

    // Extract unique vendor bank names
    if (vendorBanks.length > 0) {
      options.vendorBanks = [...new Set(vendorBanks.map(item => 
        item.vendor_name || item.name || item.bank_name
      ).filter(Boolean))].sort();
    }

    // Extract unique loan type names
    if (loanTypes.length > 0) {
      options.loanTypes = [...new Set(loanTypes.map(item => 
        item.loan_type || item.name
      ).filter(Boolean))].sort();
    }

    // Extract unique state names
    if (branchInnerStates.length > 0) {
      options.states = [...new Set(branchInnerStates.map(item => 
        item.name || item.state_name || item.state
      ).filter(Boolean))].sort();
    }

    // Extract unique location names
    if (branchInnerLocations.length > 0) {
      options.locations = [...new Set(branchInnerLocations.map(item => 
        item.name || item.location_name || item.location
      ).filter(Boolean))].sort();
    }

    setFilterOptions(options);
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
      // Try to get filtered locations from API
      const response = await api.get(`branch-inner-locations/?branch_state=${stateId}`);
      
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
          // Merge with existing locations to avoid duplicates
          const existingIds = new Set(prev.map(l => l.id));
          const newLocations = locationsData.filter(l => !existingIds.has(l.id));
          return [...prev, ...newLocations];
        });
      }
    } catch (error) {
      console.error('Error fetching filtered locations:', error);
      // Fallback: filter from all locations
      const filtered = branchInnerLocations.filter(location => 
        location.branch_state == stateId || 
        location.state_id == stateId
      );
      setFilteredLocations(filtered);
    }
  };

  const fetchDsaCodes = async () => {
    setTableLoading(true);
    try {
      const response = await api.get('dsa-codes/');
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
      vendorBank: '',
      loanType: '',
      state: '',
      location: '',
      searchQuery: ''
    });
  };

  // Filter DSA data based on search and filters
  const getFilteredData = () => {
    return dsaCodes.filter(item => {
      const vendorBankName = getNameById(item.vendor_bank, vendorBanks);
      const loanTypeName = getNameById(item.loan_type, loanTypes);
      const stateName = getNameById(item.branch_state, branchInnerStates);
      const locationName = getNameById(item.branch_location, branchInnerLocations);
      const dsaName = getNameById(item.dsa_name, dsaNames);
      
      return (
        (filters.vendorBank === '' || vendorBankName === filters.vendorBank) &&
        (filters.loanType === '' || loanTypeName === filters.loanType) &&
        (filters.state === '' || stateName === filters.state) &&
        (filters.location === '' || locationName === filters.location) &&
        (filters.searchQuery === '' || 
          item.dsa_code?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          dsaName?.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    });
  };

  // Start inline editing
  const handleEditClick = (dsaCode) => {
    setEditingId(dsaCode.id);
    
    const formData = {
      vendor_bank: dsaCode.vendor_bank || '',
      dsa_name: dsaCode.dsa_name || '',
      dsa_code: dsaCode.dsa_code || '',
      loan_type: dsaCode.loan_type || '',
      branch_state: dsaCode.branch_state || '',
      branch_location: dsaCode.branch_location || ''
    };
    
    setEditFormData(formData);
    
    // If branch state exists, fetch locations for that state
    if (dsaCode.branch_state) {
      fetchBranchInnerLocations(dsaCode.branch_state);
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
      await api.put(`dsa-codes/${editingId}/`, editFormData);
      
      // Update local state
      setDsaCodes(dsaCodes.map(item => 
        item.id === editingId ? { ...item, ...editFormData } : item
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



  // Handle view details
  const handleView = (id) => {
    alert(`View details for DSA with ID: ${id}`);
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

  const filteredData = getFilteredData();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Manager Sidebar */}
      <Director_Sidebar />

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
                DIRECTOR - DSA MANAGEMENT
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
                DSA Code Management
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Manage Direct Selling Agent codes, banks, and loan distribution networks
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
                {dsaCodes.length}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Total DSA Codes
              </div>
            </div>
          </div>
        </div>

        {/* Display Messages */}
        {message.text && (
          <div style={{
            background: message.type === 'success' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : message.type === 'danger' 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(59, 130, 246, 0.1)',
            border: message.type === 'success' 
              ? '2px solid #10b981' 
              : message.type === 'danger' 
              ? '2px solid #ef4444' 
              : '2px solid #3b82f6',
            color: message.type === 'success' 
              ? '#065f46' 
              : message.type === 'danger' 
              ? '#b91c1c' 
              : '#1e40af',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '500'
          }}>
            <span>
              {message.type === 'success' ? '✅ ' : message.type === 'danger' ? '⚠️ ' : 'ℹ️ '}
              {message.text}
            </span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              style={{
                background: 'none',
                border: 'none',
                color: message.type === 'success' ? '#065f46' : message.type === 'danger' ? '#b91c1c' : '#1e40af',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>
        )}

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
            Filter DSA Codes
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {/* Vendor Bank Filter - Dynamic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Select Vendor Bank
              </label>
              <select
                value={filters.vendorBank || 'All'}
                onChange={(e) => handleFilterChange('vendorBank', e.target.value)}
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
                <option value="All">All Vendor Banks</option>
                {filterOptions.vendorBanks.map((bank, index) => (
                  <option key={index} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Type Filter - Dynamic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Select Loan Type
              </label>
              <select
                value={filters.loanType || 'All'}
                onChange={(e) => handleFilterChange('loanType', e.target.value)}
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
                <option value="All">All Loan Types</option>
                {filterOptions.loanTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter - Dynamic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Select State
              </label>
              <select
                value={filters.state || 'All'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
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
                <option value="All">All States</option>
                {filterOptions.states.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter - Dynamic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                Select Location
              </label>
              <select
                value={filters.location || 'All'}
                onChange={(e) => handleFilterChange('location', e.target.value)}
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
                <option value="All">All Locations</option>
                {filterOptions.locations.map((location, index) => (
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
                placeholder="Search by DSA Code or Name..."
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

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px'
            }}>

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

        {/* DSA Code List Table */}
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
              DSA Code List ({filteredData.length} records)
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
              Showing {filteredData.length} of {dsaCodes.length} DSA Codes
            </div>
          </div>

          {/* Table */}
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid rgba(251, 191, 36, 0.2)'
          }}>
            {tableLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px',
                  border: '5px solid #fde68a',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
                <p style={{ color: '#92400e', fontSize: '1.2rem', fontWeight: '500' }}>
                  Loading DSA Codes...
                </p>
              </div>
            ) : (
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
                      minWidth: '50px'
                    }}>
                      S.No
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      minWidth: '180px'
                    }}>
                      VENDOR BANK
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
                      DSA CODE
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
                      DSA NAME
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
                      LOAN TYPE
                    </th>
                    <th style={{
                      padding: '18px 20px',
                      textAlign: 'left',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                      minWidth: '160px'
                    }}>
                      STATE
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
                      LOCATION
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
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#92400e'
                      }}>
                        <div style={{
                          fontSize: '4rem',
                          marginBottom: '20px',
                          opacity: 0.3
                        }}>
                          📊
                        </div>
                        <h4 style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          marginBottom: '10px'
                        }}>
                          No DSA Codes Found
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
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((dsaCode, index) => (
                      <tr 
                        key={dsaCode.id}
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
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {index + 1}
                        </td>
                        
                        {/* Vendor Bank */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="vendor_bank"
                              value={editFormData.vendor_bank || ''}
                              onChange={handleEditChange}
                              style={{
                                width: '100%',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <option value="">Select Vendor Bank</option>
                              {vendorBanks.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.vendor_name || vendor.name || vendor.bank_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaBuilding style={{ color: '#f59e0b' }} />
                              {getNameById(dsaCode.vendor_bank, vendorBanks)}
                            </div>
                          )}
                        </td>
                        
                        {/* DSA Code */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#92400e',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="dsa_code"
                              value={editFormData.dsa_code || ''}
                              onChange={handleEditChange}
                              style={{
                                width: '100%',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                              }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaTag style={{ color: '#f59e0b' }} />
                              {dsaCode.dsa_code}
                            </div>
                          )}
                        </td>
                        
                        {/* DSA Name */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="dsa_name"
                              value={editFormData.dsa_name || ''}
                              onChange={handleEditChange}
                              style={{
                                width: '100%',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <option value="">Select DSA Name</option>
                              {dsaNames.map(dsa => (
                                <option key={dsa.id} value={dsa.id}>
                                  {dsa.dsa_name || dsa.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaUserTie style={{ color: '#f59e0b' }} />
                              {getNameById(dsaCode.dsa_name, dsaNames)}
                            </div>
                          )}
                        </td>
                        
                        {/* Loan Type */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="loan_type"
                              value={editFormData.loan_type || ''}
                              onChange={handleEditChange}
                              style={{
                                width: '100%',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <option value="">Select Loan Type</option>
                              {loanTypes.map(loan => (
                                <option key={loan.id} value={loan.id}>
                                  {loan.loan_type || loan.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaMoneyBillWave style={{ color: '#f59e0b' }} />
                              {getNameById(dsaCode.loan_type, loanTypes)}
                            </div>
                          )}
                        </td>
                        
                        {/* Branch Inner State */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <select
                              className="form-select form-select-sm"
                              name="branch_state"
                              value={editFormData.branch_inner_state || ''}
                              onChange={handleEditChange}
                              style={{
                                width: '100%',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <option value="">Select Branch Inner State</option>
                              {branchInnerStates.map(state => (
                                <option key={state.id} value={state.id}>
                                  {state.name || state.state_name || state.state}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaMapMarkerAlt style={{ color: '#f59e0b' }} />
                              {getNameById(dsaCode.branch_inner_state, branchInnerStates)}
                            </div>
                          )}
                        </td>
                        
                        {/* Branch Inner Location */}
                        <td style={{
                          padding: '18px 20px',
                          color: '#78350f',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderRight: '2px solid rgba(251, 191, 36, 0.1)',
                          borderBottom: '2px solid rgba(251, 191, 36, 0.1)'
                        }}>
                          {editingId === dsaCode.id ? (
                            <>
                              <select
                                className="form-select form-select-sm"
                                name="branch_location"
                                value={editFormData.branch_location || ''}
                                onChange={handleEditChange}
                                disabled={!editFormData.branch_inner_state}
                                style={{
                                  width: '100%',
                                  border: '2px solid #f59e0b',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.9rem',
                                  background: !editFormData.branch_inner_state ? '#f3f4f6' : 'white'
                                }}
                              >
                                <option value="">
                                  {!editFormData.branch_state 
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
                                <div style={{
                                  marginTop: '5px',
                                  color: '#d97706',
                                  fontSize: '0.8rem'
                                }}>
                                  <i className="bi bi-exclamation-triangle"></i> No locations found
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaCity style={{ color: '#f59e0b' }} />
                              {getNameById(dsaCode.branch_inner_location, branchInnerLocations)}
                            </div>
                          )}
                        </td>
                        
                        {/* Status */}
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
                            background: 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)',
                            color: '#059669',
                            border: '1px solid #10b98160'
                          }}>
                            Active
                          </span>
                        </td>
                        

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

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
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
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

export default Dsa_Code;