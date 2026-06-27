import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api';
import "../EmpMaster/styles/ActiveEmpList.css";

function Active_SDSA_List() {
  const [sdsaUsers, setSdsaUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const limit = 25;
  const navigate = useNavigate();

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSdsa, setEditingSdsa] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Complete form data matching Add_SDSA.jsx
  const [editFormData, setEditFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    alias_name: '',
    phone_number: '',
    alternative_mobile_number: '',
    email_id: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',

    // Company Information
    company_name: '',
    branch_inner_state: '',
    branch_inner_location: '',

    // Address Information
    office_address: '',
    residential_address: '',

    // Document Information
    aadhar_number: '',
    pan_number: '',

    // Bank Information
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_type: '',

    // File Uploads
    pancard_upload: null,
    aadharcard_upload: null,
    photo_upload: null,
    bank_proof_upload: null,
    company_logo_upload: null,

    // Reference Information
    ref_name_1: '',
    ref_relation_1: '',
    ref_mobile_1: '',
    ref_address_1: '',
    ref_name_2: '',
    ref_relation_2: '',
    ref_mobile_2: '',
    ref_address_2: '',

    // Work Information
    reporting_to: '',

    // Status
    status: 1,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dropdown data states - UPDATED to branchInnerStates and branchInnerLocations
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [reportingToUsers, setReportingToUsers] = useState([]);

  // File preview states
  const [pancardPreview, setPancardPreview] = useState(null);
  const [aadharcardPreview, setAadharcardPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [bankProofPreview, setBankProofPreview] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);

  // Debug states
  const [debugInfo, setDebugInfo] = useState({
    banksLoaded: false,
    accountTypesLoaded: false,
    banksData: [],
    accountTypesData: []
  });

  // Inject bootstrap-icons
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

  const fetchCurrentUser = async () => {
    try {
      setMe({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch SDSA users and dropdown data
  useEffect(() => {
    fetchSdsaUsers(page);
    fetchDropdownData();
  }, [page]);

  // Debug effects for branch inner data
  useEffect(() => {
    console.log('branchInnerStates updated:', branchInnerStates);
    console.log('Number of states:', branchInnerStates.length);
  }, [branchInnerStates]);

  useEffect(() => {
    console.log('branchInnerLocations updated:', branchInnerLocations);
    console.log('Number of locations:', branchInnerLocations.length);
  }, [branchInnerLocations]);

  // Function to fetch SDSA users
  function fetchSdsaUsers(p = 1) {
    setLoading(true);

    api.get(`sdsa-users/?page=${p}&limit=${limit}&status=1`)
      .then(response => {
        let sdsaData = response.data || [];

        if (response.data.results) {
          const filteredSDSA = response.data.results.filter(sdsa =>
            sdsa.status === 1 || sdsa.status === true
          );
          setSdsaUsers(filteredSDSA);
          setTotalPages(Math.max(1, Math.ceil(response.data.count / limit)));
        } else if (Array.isArray(response.data)) {
          const filteredSDSA = response.data.filter(sdsa =>
            sdsa.status === 1 || sdsa.status === true
          );

          // Frontend pagination
          const start = (p - 1) * limit;
          const end = start + limit;
          const paginatedData = filteredSDSA.slice(start, end);

          setSdsaUsers(paginatedData);
          setTotalPages(Math.max(1, Math.ceil(filteredSDSA.length / limit)));
        } else {
          setSdsaUsers([]);
          setTotalPages(1);
        }
      })
      .catch(error => {
        console.error('Error fetching SDSA users:', error);
        setSdsaUsers([]);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Fetch dropdown data with improved error handling - UPDATED to branch-inner-states
  const fetchDropdownData = async () => {
    try {
      console.log('Fetching dropdown data...');

      // Fetch banks
      const banksResponse = await api.get('banks/');
      console.log('Banks API Response:', banksResponse);

      let banksData = [];

      if (banksResponse.data && banksResponse.data.results) {
        banksData = banksResponse.data.results;
      } else if (Array.isArray(banksResponse.data)) {
        banksData = banksResponse.data;
      }

      setBanks(banksData);
      console.log('Set banks data:', banksData);

      // Fetch account types
      const accountTypesResponse = await api.get('typeofaccounts/');
      console.log('Account Types API Response:', accountTypesResponse);

      let accountTypesData = [];

      if (accountTypesResponse.data && accountTypesResponse.data.results) {
        accountTypesData = accountTypesResponse.data.results;
      } else if (Array.isArray(accountTypesResponse.data)) {
        accountTypesData = accountTypesResponse.data;
      }

      setAccountTypes(accountTypesData);
      console.log('Set account types data:', accountTypesData);

      // Fetch branch inner states - CHANGED from branch-states to branch-inner-states
      const statesResponse = await api.get('branch-inner-states/').catch(() => ({ data: [] }));
      console.log('Branch Inner States Response:', statesResponse.data);

      let statesData = [];
      if (Array.isArray(statesResponse.data)) {
        statesData = statesResponse.data;
      } else if (statesResponse.data.results) {
        statesData = statesResponse.data.results;
      }
      setBranchInnerStates(statesData);

      // Fetch reporting users
      const reportingResponse = await api.get('reporting-users/').catch(() => ({ data: [] }));
      setReportingToUsers(reportingResponse.data || []);

      // Update debug info
      setDebugInfo({
        banksLoaded: banksData.length > 0,
        accountTypesLoaded: accountTypesData.length > 0,
        banksData: banksData.slice(0, 3),
        accountTypesData: accountTypesData.slice(0, 3)
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setBanks([]);
      setAccountTypes([]);
    }
  };

  // Fetch branch inner locations based on selected state - UPDATED to branch-inner-locations
  const fetchBranchInnerLocations = async (stateId) => {
    if (!stateId) {
      setBranchInnerLocations([]);
      return;
    }

    try {
      console.log('Fetching branch inner locations for state ID:', stateId);
      const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);
      console.log('Branch inner locations response:', response.data);

      let locations = [];
      if (Array.isArray(response.data)) {
        locations = response.data;
      } else if (response.data.results) {
        locations = response.data.results;
      }

      setBranchInnerLocations(locations);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
      setBranchInnerLocations([]);
    }
  };

  // Helper functions
  const getPhoneNumber = (sdsa) => {
    if (!sdsa) return 'N/A';
    if (sdsa.phone_number) return sdsa.phone_number;
    if (sdsa.phone) return sdsa.phone;
    if (sdsa.mobile) return sdsa.mobile;
    if (sdsa.contact) return sdsa.contact;
    return 'N/A';
  };

  const getEmail = (sdsa) => {
    if (!sdsa) return 'N/A';
    if (sdsa.email_id) return sdsa.email_id;
    if (sdsa.email) return sdsa.email;
    return 'N/A';
  };

  const getFullName = (sdsa) => {
    if (!sdsa) return 'N/A';
    const firstName = sdsa.first_name || sdsa.firstName || '';
    const lastName = sdsa.last_name || sdsa.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || sdsa.username || sdsa.alias_name || 'N/A';
  };

  // Handle inactivate
  async function handleInactivate(id) {
    const sdsa = sdsaUsers.find(sdsa => sdsa.id === id);
    if (!sdsa) return;

    const sdsaName = getFullName(sdsa);

    if (!window.confirm(`Are you sure you want to mark "${sdsaName}" as inactive?`)) return;

    try {
      setLoading(true);

      await api.patch(`sdsa-users/${id}/`, { status: 0 });

      setSdsaUsers(prev => prev.filter(sdsa => sdsa.id !== id));
      alert(`✅ "${sdsaName}" has been marked as inactive.`);

    } catch (error) {
      console.error('Error inactivating SDSA:', error);
      alert('Failed to inactivate SDSA user.');
    } finally {
      setLoading(false);
    }
  }

  // View details
  function handleView(id) {
    navigate(`/admin-dashboard/sdsa/view/${id}`);
  }

  // Edit details - opens modal with all Add_SDSA.jsx fields
  function handleEdit(id) {
    const sdsa = sdsaUsers.find(sdsa => sdsa.id === id);
    if (!sdsa) return;

    console.log('Editing SDSA:', sdsa);
    console.log('Current banks state:', banks);
    console.log('Current accountTypes state:', accountTypes);
    console.log('SDSA bank_name:', sdsa.bank_name, 'Type:', typeof sdsa.bank_name);
    console.log('SDSA account_type:', sdsa.account_type, 'Type:', typeof sdsa.account_type);

    // Check if we need to fetch dropdown data
    if (banks.length === 0 || accountTypes.length === 0) {
      console.log('Dropdown data empty, fetching...');
      fetchDropdownData();
    }

    setEditingSdsa(sdsa);

    // Populate all form fields from SDSA data with proper bank/account type handling
    setEditFormData({
      // Personal Information
      first_name: sdsa.first_name || '',
      last_name: sdsa.last_name || '',
      alias_name: sdsa.alias_name || '',
      phone_number: sdsa.phone_number || '',
      alternative_mobile_number: sdsa.alternative_mobile_number || '',
      email_id: sdsa.email_id || '',
      password: '',
      confirm_password: '',
      date_of_birth: sdsa.date_of_birth || '',

      // Company Information
      company_name: sdsa.company_name || '',
      branch_inner_state: sdsa.branch_inner_state || '',
      branch_inner_location: sdsa.branch_inner_location || '',

      // Address Information
      office_address: sdsa.office_address || '',
      residential_address: sdsa.residential_address || '',

      // Document Information
      aadhar_number: sdsa.aadhar_number || '',
      pan_number: sdsa.pan_number || '',

      // Bank Information
      account_number: sdsa.account_number || '',
      ifsc_code: sdsa.ifsc_code || '',
      bank_name: sdsa.bank_name?.id || sdsa.bank_name_id || sdsa.bank_name || '',
      account_type: sdsa.account_type?.id || sdsa.account_type_id || sdsa.account_type || '',

      // File Uploads
      pancard_upload: null,
      aadharcard_upload: null,
      photo_upload: null,
      bank_proof_upload: null,
      company_logo_upload: null,

      // Reference Information
      ref_name_1: sdsa.ref_name_1 || '',
      ref_relation_1: sdsa.ref_relation_1 || '',
      ref_mobile_1: sdsa.ref_mobile_1 || '',
      ref_address_1: sdsa.ref_address_1 || '',
      ref_name_2: sdsa.ref_name_2 || '',
      ref_relation_2: sdsa.ref_relation_2 || '',
      ref_mobile_2: sdsa.ref_mobile_2 || '',
      ref_address_2: sdsa.ref_address_2 || '',

      // Work Information
      reporting_to: sdsa.reporting_to || '',

      // Status
      status: sdsa.status || 1,
    });

    // If branch inner state exists, fetch inner locations for that state - UPDATED
    if (sdsa.branch_inner_state) {
      fetchBranchInnerLocations(sdsa.branch_inner_state);
    }

    // Set file previews if URLs exist
    if (sdsa.pancard_upload_url) setPancardPreview(sdsa.pancard_upload_url);
    if (sdsa.aadharcard_upload_url) setAadharcardPreview(sdsa.aadharcard_upload_url);
    if (sdsa.photo_upload_url) setPhotoPreview(sdsa.photo_upload_url);
    if (sdsa.bank_proof_upload_url) setBankProofPreview(sdsa.bank_proof_upload_url);
    if (sdsa.company_logo_upload_url) setCompanyLogoPreview(sdsa.company_logo_upload_url);

    setShowEditModal(true);
  }

  // Toggle password visibility in table
  const togglePasswordVisibility = (id) => {
    setSdsaUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, showPassword: !user.showPassword } : user
      )
    );
  };

  // Handle edit form input changes - UPDATED with fetchBranchInnerLocations
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If branch inner state changes, fetch new inner locations
    if (name === 'branch_inner_state') {
      setEditFormData(prev => ({
        ...prev,
        branch_inner_location: ''
      }));
      fetchBranchInnerLocations(value);
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Update form data
      setEditFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (name) {
          case 'pancard_upload':
            setPancardPreview(reader.result);
            break;
          case 'aadharcard_upload':
            setAadharcardPreview(reader.result);
            break;
          case 'photo_upload':
            setPhotoPreview(reader.result);
            break;
          case 'bank_proof_upload':
            setBankProofPreview(reader.result);
            break;
          case 'company_logo_upload':
            setCompanyLogoPreview(reader.result);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to get full URL for existing files
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Helper function to extract bank display name
  const getBankDisplayName = (bank) => {
    if (!bank) return '';
    return bank.name || bank.bank_name || bank.title || bank.label || `Bank ID: ${bank.id}`;
  };

  // Helper function to extract account type display name
  const getAccountTypeDisplayName = (type) => {
    if (!type) return '';
    return type.name || type.account_type || type.title || type.label || `Type ID: ${type.id}`;
  };

  // Helper function to get bank ID
  const getBankId = (bank) => {
    if (!bank) return null;
    return bank.id || bank.bank_id || bank.value;
  };

  // Helper function to get account type ID
  const getAccountTypeId = (type) => {
    if (!type) return null;
    return type.id || type.type_id || type.value;
  };

  // Save edited SDSA data
  const handleSaveEdit = async () => {
    if (!editingSdsa) return;

    setEditLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Editing SDSA user ID:', editingSdsa.id);
      console.log('Form data before save:', editFormData);

      // Create FormData for file uploads
      const formData = new FormData();

      // Add all text fields
      const textFields = [
        'first_name', 'last_name', 'alias_name', 'phone_number', 'alternative_mobile_number',
        'email_id', 'date_of_birth', 'company_name', 'branch_inner_state', 'branch_inner_location',
        'office_address', 'residential_address', 'aadhar_number', 'pan_number',
        'account_number', 'ifsc_code', 'bank_name', 'account_type',
        'ref_name_1', 'ref_relation_1', 'ref_mobile_1', 'ref_address_1',
        'ref_name_2', 'ref_relation_2', 'ref_mobile_2', 'ref_address_2',
        'reporting_to', 'status'
      ];

      textFields.forEach(field => {
        if (editFormData[field] !== undefined && editFormData[field] !== null && editFormData[field] !== '') {
          formData.append(field, editFormData[field]);
        }
      });

      // Only include password if it's not empty
      if (editFormData.password && editFormData.password.trim() !== '') {
        formData.append('password', editFormData.password);
        formData.append('confirm_password', editFormData.password);
        console.log('Including password and confirm_password in update');
      }

      // Add files if they were selected
      const fileFields = [
        'pancard_upload', 'aadharcard_upload', 'photo_upload',
        'bank_proof_upload', 'company_logo_upload'
      ];

      fileFields.forEach(field => {
        if (editFormData[field] instanceof File) {
          formData.append(field, editFormData[field]);
        }
      });

      console.log('Updating SDSA user with FormData');

      // Use PATCH request with FormData
      const response = await api.patch(`sdsa-users/${editingSdsa.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('SDSA user updated successfully!');

        // Update the frontend state
        const updatedSdsa = {
          ...editingSdsa,
          ...response.data
        };

        console.log('Updated SDSA user for frontend:', updatedSdsa);

        // Update the SDSA users state
        setSdsaUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === editingSdsa.id ? updatedSdsa : user
          )
        );

        // Update editingSdsa as well
        setEditingSdsa(updatedSdsa);

        // Clear file previews
        setPancardPreview(null);
        setAadharcardPreview(null);
        setPhotoPreview(null);
        setBankProofPreview(null);
        setCompanyLogoPreview(null);

        // Refresh the list after 0.5 seconds
        setTimeout(() => {
          fetchSdsaUsers(page);
        }, 500);

        // Close modal after 1.5 seconds
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage('Failed to update SDSA user. Please try again.');
      }
    } catch (error) {
      console.error('Error updating SDSA user:', error);

      let errorMsg = 'Failed to update SDSA user. ';

      if (error.response?.data) {
        console.error('Error response data:', error.response.data);

        if (typeof error.response.data === 'object') {
          const errors = [];
          for (const key in error.response.data) {
            if (Array.isArray(error.response.data[key])) {
              errors.push(`${key}: ${error.response.data[key].join(', ')}`);
            } else {
              errors.push(`${key}: ${error.response.data[key]}`);
            }
          }
          if (errors.length > 0) {
            errorMsg += 'Validation errors: ' + errors.join('; ');
          } else {
            errorMsg += JSON.stringify(error.response.data);
          }
        } else {
          errorMsg += error.response.data;
        }
      } else if (error.message) {
        errorMsg += error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  // Render action buttons
  function renderActions(row) {
    return (
      <div className="table-actions">
        <button
          className="action-btn view-btn"
          onClick={() => handleView(row.id)}
          title="View"
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
            className="action-btn inactivate-btn"
            onClick={() => handleInactivate(row.id)}
            title="Mark as Inactive"
            disabled={loading}
          >
            <i className="bi bi-shield-lock"></i>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="employee-list-container">
      {/* Enhanced Edit Modal with ALL Add_SDSA.jsx fields - UPDATED with branch inner state/location */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget && !editLoading) {
            setShowEditModal(false);
          }
        }}>
          <div className="modal-content" style={{ maxWidth: '950px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h2>
                  <i className="bi bi-pencil-square"></i> Edit SDSA User
                </h2>
                <p className="employee-identifier">
                  {editingSdsa &&
                    ` • ${getFullName(editingSdsa)} • ${getPhoneNumber(editingSdsa)}`
                  }
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              {successMessage && (
                <div className="success-message">
                  <i className="bi bi-check-circle-fill"></i>
                  <div>
                    <strong>Success!</strong>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="error-message">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <div>
                    <strong>Error!</strong>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-person-badge"></i> Personal Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-person"></i> First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditFormChange}
                      placeholder="First Name"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-person"></i> Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditFormChange}
                      placeholder="Last Name"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-tag"></i> Alias Name
                    </label>
                    <input
                      type="text"
                      name="alias_name"
                      value={editFormData.alias_name}
                      onChange={handleEditFormChange}
                      placeholder="Alias Name"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-telephone"></i> Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editFormData.phone_number}
                      onChange={handleEditFormChange}
                      placeholder="10-digit phone number"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-phone"></i> Alternative Mobile
                    </label>
                    <input
                      type="tel"
                      name="alternative_mobile_number"
                      value={editFormData.alternative_mobile_number}
                      onChange={handleEditFormChange}
                      placeholder="Alternative mobile number"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-envelope"></i> Email *
                    </label>
                    <input
                      type="email"
                      name="email_id"
                      value={editFormData.email_id}
                      onChange={handleEditFormChange}
                      placeholder="email@example.com"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-key"></i> Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditFormChange}
                      placeholder="Leave empty to keep current"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-calendar"></i> Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editFormData.date_of_birth}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Company Information Section - UPDATED with branch inner state/location */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-building"></i> Company Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-buildings"></i> Company Name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={editFormData.company_name}
                      onChange={handleEditFormChange}
                      placeholder="Company Name"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-geo"></i> Branch Inner State
                    </label>
                    <select
                      name="branch_inner_state"
                      value={editFormData.branch_inner_state}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    >
                      <option value="">Select Branch Inner State</option>
                      {branchInnerStates.map(state => (
                        <option key={state.id} value={state.id}>
                          {state.name || state.state_name || state.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-pin-map"></i> Branch Inner Location
                    </label>
                    <select
                      name="branch_inner_location"
                      value={editFormData.branch_inner_location}
                      onChange={handleEditFormChange}
                      disabled={editLoading || !editFormData.branch_inner_state}
                    >
                      <option value="">Select Branch Inner Location</option>
                      {branchInnerLocations && branchInnerLocations.length > 0 ? (
                        branchInnerLocations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name || location.location_name || location.location}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No locations available for this state</option>
                      )}
                    </select>
                    {editFormData.branch_state && branchInnerLocations.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No branch inner locations found for this state
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-geo-alt"></i> Address Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-briefcase"></i> Office Address
                    </label>
                    <textarea
                      name="office_address"
                      value={editFormData.office_address}
                      onChange={handleEditFormChange}
                      placeholder="Office address"
                      rows="3"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-house-door"></i> Residential Address
                    </label>
                    <textarea
                      name="residential_address"
                      value={editFormData.residential_address}
                      onChange={handleEditFormChange}
                      placeholder="Residential address"
                      rows="3"
                      disabled={editLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Document Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-files"></i> Document Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-card-text"></i> Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={editFormData.aadhar_number}
                      onChange={handleEditFormChange}
                      placeholder="12-digit Aadhaar"
                      maxLength="12"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-credit-card"></i> PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={editFormData.pan_number}
                      onChange={handleEditFormChange}
                      placeholder="10-character PAN"
                      maxLength="10"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-file-earmark-pdf"></i> PAN Card Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="pancard_upload"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="pancard-upload"
                        className="file-input"
                      />
                      <label htmlFor="pancard-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {pancardPreview && (
                        <div className="file-preview">
                          <a href={pancardPreview} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-eye"></i> View Current
                          </a>
                        </div>
                      )}
                      {editFormData.pancard_upload instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.pancard_upload.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-file-earmark-pdf"></i> Aadhaar Card Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="aadharcard_upload"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="aadharcard-upload"
                        className="file-input"
                      />
                      <label htmlFor="aadharcard-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {aadharcardPreview && (
                        <div className="file-preview">
                          <a href={aadharcardPreview} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-eye"></i> View Current
                          </a>
                        </div>
                      )}
                      {editFormData.aadharcard_upload instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.aadharcard_upload.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-image"></i> Photo Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="photo_upload"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="photo-upload"
                        className="file-input"
                      />
                      <label htmlFor="photo-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {photoPreview && (
                        <div className="file-preview">
                          <img src={photoPreview} alt="Current Photo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        </div>
                      )}
                      {editFormData.photo_upload instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.photo_upload.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-bank"></i> Bank Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-credit-card-2-front"></i> Account Number
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={editFormData.account_number}
                      onChange={handleEditFormChange}
                      placeholder="Account Number"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-code"></i> IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifsc_code"
                      value={editFormData.ifsc_code}
                      onChange={handleEditFormChange}
                      placeholder="IFSC Code"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-building"></i> Bank Name
                    </label>
                    <select
                      name="bank_name"
                      value={editFormData.bank_name || ''}
                      onChange={handleEditFormChange}
                      disabled={editLoading || banks.length === 0}
                    >
                      <option value="">{banks.length === 0 ? 'Loading banks...' : 'Select Bank'}</option>
                      {banks.map((bank, index) => {
                        const bankId = getBankId(bank) || index;
                        const bankName = getBankDisplayName(bank);
                        return (
                          <option key={bankId} value={bankId}>
                            {bankName}
                          </option>
                        );
                      })}
                    </select>
                    {banks.length === 0 && (
                      <div className="loading-indicator">
                        <small><i className="bi bi-hourglass-split"></i> Loading banks...</small>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-wallet2"></i> Account Type
                    </label>
                    <select
                      name="account_type"
                      value={editFormData.account_type || ''}
                      onChange={handleEditFormChange}
                      disabled={editLoading || accountTypes.length === 0}
                    >
                      <option value="">{accountTypes.length === 0 ? 'Loading account types...' : 'Select Account Type'}</option>
                      {accountTypes.map((type, index) => {
                        const typeId = getAccountTypeId(type) || index;
                        const typeName = getAccountTypeDisplayName(type);
                        return (
                          <option key={typeId} value={typeId}>
                            {typeName}
                          </option>
                        );
                      })}
                    </select>
                    {accountTypes.length === 0 && (
                      <div className="loading-indicator">
                        <small><i className="bi bi-hourglass-split"></i> Loading account types...</small>
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-file-earmark-pdf"></i> Bank Proof Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="bank_proof_upload"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="bank-proof-upload"
                        className="file-input"
                      />
                      <label htmlFor="bank-proof-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {bankProofPreview && (
                        <div className="file-preview">
                          <a href={bankProofPreview} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-eye"></i> View Current
                          </a>
                        </div>
                      )}
                      {editFormData.bank_proof_upload instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.bank_proof_upload.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-person-lines-fill"></i> Reference Information
                </h3>

                {/* Reference 1 */}
                <div className="reference-section">
                  <h4 className="reference-subtitle">Reference 1</h4>
                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-person"></i> Name
                      </label>
                      <input
                        type="text"
                        name="ref_name_1"
                        value={editFormData.ref_name_1}
                        onChange={handleEditFormChange}
                        placeholder="Reference Name"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-diagram-3"></i> Relation
                      </label>
                      <input
                        type="text"
                        name="ref_relation_1"
                        value={editFormData.ref_relation_1}
                        onChange={handleEditFormChange}
                        placeholder="Relation"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-phone"></i> Mobile No
                      </label>
                      <input
                        type="tel"
                        name="ref_mobile_1"
                        value={editFormData.ref_mobile_1}
                        onChange={handleEditFormChange}
                        placeholder="10-digit mobile"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>
                        <i className="bi bi-geo-alt"></i> Address
                      </label>
                      <textarea
                        name="ref_address_1"
                        value={editFormData.ref_address_1}
                        onChange={handleEditFormChange}
                        placeholder="Reference Address"
                        rows="2"
                        disabled={editLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Reference 2 */}
                <div className="reference-section">
                  <h4 className="reference-subtitle">Reference 2</h4>
                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-person"></i> Name
                      </label>
                      <input
                        type="text"
                        name="ref_name_2"
                        value={editFormData.ref_name_2}
                        onChange={handleEditFormChange}
                        placeholder="Reference Name"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-diagram-3"></i> Relation
                      </label>
                      <input
                        type="text"
                        name="ref_relation_2"
                        value={editFormData.ref_relation_2}
                        onChange={handleEditFormChange}
                        placeholder="Relation"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-phone"></i> Mobile No
                      </label>
                      <input
                        type="tel"
                        name="ref_mobile_2"
                        value={editFormData.ref_mobile_2}
                        onChange={handleEditFormChange}
                        placeholder="10-digit mobile"
                        disabled={editLoading}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>
                        <i className="bi bi-geo-alt"></i> Address
                      </label>
                      <textarea
                        name="ref_address_2"
                        value={editFormData.ref_address_2}
                        onChange={handleEditFormChange}
                        placeholder="Reference Address"
                        rows="2"
                        disabled={editLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Information & Company Logo Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-briefcase"></i> Work Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-person-badge"></i> Reporting To
                    </label>
                    <select
                      name="reporting_to"
                      value={editFormData.reporting_to}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    >
                      <option value="">Select Reporting To</option>
                      {reportingToUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-toggle-on"></i> Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-image"></i> Company Logo Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="company_logo_upload"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="company-logo-upload"
                        className="file-input"
                      />
                      <label htmlFor="company-logo-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {companyLogoPreview && (
                        <div className="file-preview">
                          <img src={companyLogoPreview} alt="Current Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        </div>
                      )}
                      {editFormData.company_logo_upload instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.company_logo_upload.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <i className="bi bi-hourglass-split"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="employee-list-header">
        <div className="header-left">
          <h1><i className="bi bi-person-badge-fill"></i> Active SDSA Users</h1>
          <p className="subtitle">Total: {sdsaUsers.length} active SDSA users</p>
        </div>
        <div className="header-right">
          <Link to="/admin-dashboard/sdsa/add" className="add-new-btn">
            <i className="bi bi-person-plus"></i> Add New SDSA
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
                <th>ReportingTo</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Permission</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading active SDSA users...</p>
                    </div>
                  </td>
                </tr>
              ) : sdsaUsers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <i className="bi bi-person-badge"></i>
                      <h3>No active SDSA users found</h3>
                      <p>There are no active SDSA users in the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sdsaUsers.map((sdsa, index) => (
                  <tr key={sdsa.id || index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    {/* Full Name Column */}
                    <td>
                      <div className="employee-info">
                        {sdsa.photo_upload_url || sdsa.profile_image ? (
                          <div className="employee-avatar">
                            <img
                              src={sdsa.photo_upload_url || sdsa.profile_image}
                              alt={getFullName(sdsa)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="employee-avatar-placeholder"></div>
                        )}
                        <div className="employee-name-details">
                          <div className="employee-full-name">
                            {getFullName(sdsa)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number Column */}
                    <td>
                      <div className="contact-info">
                        {getPhoneNumber(sdsa)}
                      </div>
                    </td>

                    {/* Email Column */}
                    <td>
                      <div className="employee-email">
                        {getEmail(sdsa)}
                      </div>
                    </td>

                    {/* Reporting To Column */}
                    <td>
                      <div className="reporting-to-info">
                        {sdsa.reporting_to_name ? (
                          <>
                            {sdsa.reporting_to_name}
                          </>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td>
                      <span
                        style={{
                          color: "#198754",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i
                          className="bi bi-circle-fill"
                          style={{ color: "#198754", fontSize: "8px" }}
                        ></i>
                        Active
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td>
                      {renderActions(sdsa)}
                    </td>

                    {/* Permission Column */}
                    <td>
                      <div className="permission-dropdown-container">
                        <select
                          className="permission-select-dropdown"
                          defaultValue=""
                          onChange={(e) => {
                            const selectedValue = e.target.value;

                            if (selectedValue === 'work') {
                              navigate(`/admin-dashboard/sdsa/work-permission?userId=${sdsa.id}`);
                            }
                            else if (selectedValue === 'payout') {
                              navigate(`/admin-dashboard/sdsa/payout-permission?userId=${sdsa.id}`);
                            }

                            e.target.value = '';
                          }}
                        >
                          <option value="">Permissions</option>
                          <option value="work">Work Permissions</option>
                          <option value="payout">Payout Permission</option>
                        </select>
                      </div>
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
            <div className="page-info">Page {page} of {totalPages}</div>
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

export default Active_SDSA_List;