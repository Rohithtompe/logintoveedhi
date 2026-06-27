import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api';
import "../EmpMaster/styles/ActiveEmpList.css";

function PartnerActiveList() {
  const [partnerUsers, setPartnerUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const limit = 25;
  const navigate = useNavigate();

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Branch Inner State/Location States - CHANGED
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);

  // Complete form data matching AddPartner.jsx
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
    birth_date: '',

    // Company Information
    company_name: '',
    branch_inner_state: '',
    branch_inner_location: '',

    // Address Information
    office_address: '',
    residential_address: '',

    // Document Information
    aadhaar_number: '',
    pan_number: '',

    // Bank Information
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_type: '',

    // File Uploads
    pan_img: null,
    aadhaar_img: null,
    photo: null,
    bank_proof_img: null,
    company_logo: null,

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
    rank: '',

    // Status
    status: 1,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dropdown data states - CHANGED to branchInnerStates
  const [banks, setBanks] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [reportingToUsers, setReportingToUsers] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);

  // File preview states
  const [panPreview, setPanPreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [bankProofPreview, setBankProofPreview] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);

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

  // Fetch partner users and dropdown data
  useEffect(() => {
    fetchPartnerUsers(page);
    fetchDropdownData();
  }, [page]);

  // Debug effects
  useEffect(() => {
    console.log('Branch Inner States:', branchInnerStates);
  }, [branchInnerStates]);

  useEffect(() => {
    console.log('Branch Inner Locations:', branchInnerLocations);
    console.log('Filtered Locations:', filteredLocations);
  }, [branchInnerLocations, filteredLocations]);

  // Function to fetch partner users
  function fetchPartnerUsers(p = 1) {
    setLoading(true);

    api.get(`partner-users/?page=${p}&limit=${limit}&status=1`)
      .then(response => {
        let partnerData = response.data || [];

        if (response.data.results) {
          const filteredPartners = response.data.results.filter(partner =>
            partner.status === 1 || partner.status === true
          );
          setPartnerUsers(filteredPartners);
          setTotalPages(Math.max(1, Math.ceil(response.data.count / limit)));
        } else if (Array.isArray(response.data)) {
          const filteredPartners = response.data.filter(partner =>
            partner.status === 1 || partner.status === true
          );

          // Frontend Pagination
          const startIndex = (p - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filteredPartners.slice(startIndex, endIndex);

          setPartnerUsers(paginatedData);
          setTotalPages(Math.max(1, Math.ceil(filteredPartners.length / limit)));
        } else {
          setPartnerUsers([]);
          setTotalPages(1);
        }
      })
      .catch(error => {
        console.error('Error fetching partner users:', error);
        setPartnerUsers([]);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Fetch dropdown data - CHANGED to branch-inner-states
  const fetchDropdownData = async () => {
    try {
      // Fetch banks
      const banksResponse = await api.get('banks/');
      let banksData = [];

      if (banksResponse.data && banksResponse.data.results) {
        banksData = banksResponse.data.results;
      } else if (Array.isArray(banksResponse.data)) {
        banksData = banksResponse.data;
      }

      setBanks(banksData);

      // Fetch account types
      const accountTypesResponse = await api.get('typeofaccounts/');
      let accountTypesData = [];

      if (accountTypesResponse.data && accountTypesResponse.data.results) {
        accountTypesData = accountTypesResponse.data.results;
      } else if (Array.isArray(accountTypesResponse.data)) {
        accountTypesData = accountTypesResponse.data;
      }

      setAccountTypes(accountTypesData);

      // Fetch branch inner states - CHANGED from branch-states to branch-inner-states
      const statesResponse = await api.get('branch-inner-states/').catch(() => ({ data: [] }));
      let statesData = [];
      if (Array.isArray(statesResponse.data)) {
        statesData = statesResponse.data;
      } else if (statesResponse.data.results) {
        statesData = statesResponse.data.results;
      }
      setBranchInnerStates(statesData);

      // Fetch all branch inner locations - NEW
      fetchAllBranchInnerLocations();

      // Fetch reporting users
      const reportingResponse = await api.get('reporting-users/').catch(() => ({ data: [] }));
      setReportingToUsers(reportingResponse.data || []);

      // Fetch partner types
      const partnerTypesResponse = await api.get('partner-type/').catch(() => ({ data: [] }));
      setPartnerTypes(partnerTypesResponse.data || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setBanks([]);
      setAccountTypes([]);
    }
  };

  // Fetch all branch inner locations - NEW
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

  // Fetch branch inner locations based on selected state - CHANGED
  const fetchBranchInnerLocations = async (stateId) => {
    if (!stateId) {
      setFilteredLocations([]);
      return;
    }

    try {
      console.log('Fetching branch inner locations for state ID:', stateId);
      const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);

      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }

      setFilteredLocations(locationsData);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
      // Fallback: filter from all locations
      const filtered = branchInnerLocations.filter(location =>
        location.branch_inner_state == stateId ||
        location.state_id == stateId
      );
      setFilteredLocations(filtered);
    }
  };

  // Helper functions
  const getPhoneNumber = (partner) => {
    if (!partner) return 'N/A';
    if (partner.phone_number) return partner.phone_number;
    if (partner.phone) return partner.phone;
    if (partner.mobile) return partner.mobile;
    if (partner.contact) return partner.contact;
    return 'N/A';
  };

  const getEmail = (partner) => {
    if (!partner) return 'N/A';
    if (partner.email_id) return partner.email_id;
    if (partner.email) return partner.email;
    return 'N/A';
  };

  const getFullName = (partner) => {
    if (!partner) return 'N/A';
    const firstName = partner.first_name || partner.firstName || '';
    const lastName = partner.last_name || partner.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || partner.username || partner.alias_name || 'N/A';
  };

  // Handle inactivate
  async function handleInactivate(id) {
    const partner = partnerUsers.find(partner => partner.id === id);
    if (!partner) return;

    const partnerName = getFullName(partner);

    if (!window.confirm(`Are you sure you want to mark "${partnerName}" as inactive?`)) return;

    try {
      setLoading(true);

      await api.patch(`partner-users/${id}/`, { status: 0 });

      setPartnerUsers(prev => prev.filter(partner => partner.id !== id));
      alert(`✅ "${partnerName}" has been marked as inactive.`);

    } catch (error) {
      console.error('Error inactivating partner:', error);
      alert('Failed to inactivate partner user.');
    } finally {
      setLoading(false);
    }
  }

  // View details
  function handleView(id) {
    navigate(`/admin-dashboard/partner/view/${id}`);
  }

  // Edit details - UPDATED with branch inner state/location
  function handleEdit(id) {
    const partner = partnerUsers.find(partner => partner.id === id);
    if (!partner) return;

    console.log('Editing Partner:', partner);
    console.log('Branch Inner State ID:', partner.branch_inner_state);
    console.log('Branch Inner Location ID:', partner.branch_inner_location);

    setEditingPartner(partner);

    // Populate form fields
    setEditFormData({
      // Personal Information
      first_name: partner.first_name || '',
      last_name: partner.last_name || '',
      alias_name: partner.alias_name || '',
      phone_number: partner.phone_number || '',
      alternative_mobile_number: partner.alternative_mobile_number || '',
      email_id: partner.email_id || '',
      password: '',
      confirm_password: '',
      birth_date: partner.birth_date || partner.date_of_birth || '',

      // Company Information
      company_name: partner.company_name || '',
      branch_inner_state: partner.branch_inner_state || '',
      branch_inner_location: partner.branch_inner_location || '',

      // Address Information
      office_address: partner.office_address || '',
      residential_address: partner.residential_address || '',

      // Document Information
      aadhaar_number: partner.aadhaar_number || '',
      pan_number: partner.pan_number || '',

      // Bank Information
      account_number: partner.account_number || '',
      ifsc_code: partner.ifsc_code || '',
      bank_name: partner.bank || partner.bank_name || partner.bank_name_id || '',
      account_type: partner.type_of_account || partner.account_type || partner.account_type_id || '',

      // File Uploads
      pan_img: null,
      aadhaar_img: null,
      photo: null,
      bank_proof_img: null,
      company_logo: null,

      // Reference Information
      ref_name_1: partner.ref_name_1 || '',
      ref_relation_1: partner.ref_relation_1 || '',
      ref_mobile_1: partner.ref_mobile_1 || '',
      ref_address_1: partner.ref_address_1 || '',
      ref_name_2: partner.ref_name_2 || '',
      ref_relation_2: partner.ref_relation_2 || '',
      ref_mobile_2: partner.ref_mobile_2 || '',
      ref_address_2: partner.ref_address_2 || '',

      // Work Information
      reporting_to: partner.reporting_to || partner.reporting_to_id || '',
      rank: partner.rank || '',

      // Status
      status: partner.status || 1,
    });

    // If branch inner state exists, fetch locations for that state - CHANGED
    if (partner.branch_inner_state) {
      fetchBranchInnerLocations(partner.branch_inner_state);
    }

    // Set file previews if URLs exist
    if (partner.pan_img_url || partner.pan_card_url) setPanPreview(partner.pan_img_url || partner.pan_card_url);
    if (partner.aadhaar_img_url || partner.aadhaar_card_url) setAadhaarPreview(partner.aadhaar_img_url || partner.aadhaar_card_url);
    if (partner.photo_url || partner.photo_upload_url) setPhotoPreview(partner.photo_url || partner.photo_upload_url);
    if (partner.bank_proof_img_url) setBankProofPreview(partner.bank_proof_img_url);
    if (partner.company_logo_url || partner.company_logo_upload_url) setCompanyLogoPreview(partner.company_logo_url || partner.company_logo_upload_url);

    setShowEditModal(true);
  }

  // Handle edit form input changes - UPDATED with branch state change handler
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If branch inner state changes, fetch new locations and clear branch inner location
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

      setEditFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (name) {
          case 'pan_img':
            setPanPreview(reader.result);
            break;
          case 'aadhaar_img':
            setAadhaarPreview(reader.result);
            break;
          case 'photo':
            setPhotoPreview(reader.result);
            break;
          case 'bank_proof_img':
            setBankProofPreview(reader.result);
            break;
          case 'company_logo':
            setCompanyLogoPreview(reader.result);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for bank/account display
  const getBankDisplayName = (bank) => {
    if (!bank) return '';
    return bank.name || bank.bank_name || bank.title || bank.label || `Bank ID: ${bank.id}`;
  };

  const getAccountTypeDisplayName = (type) => {
    if (!type) return '';
    return type.name || type.account_type || type.title || type.label || `Type ID: ${type.id}`;
  };

  const getBankId = (bank) => {
    if (!bank) return null;
    return bank.id || bank.bank_id || bank.value;
  };

  const getAccountTypeId = (type) => {
    if (!type) return null;
    return type.id || type.type_id || type.value;
  };

  // Save edited partner data - UPDATED with branch fields
  const handleSaveEdit = async () => {
    if (!editingPartner) return;

    setEditLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();

      // Add text fields
      const textFields = [
        'first_name', 'last_name', 'alias_name', 'phone_number', 'alternative_mobile_number',
        'email_id', 'birth_date', 'company_name', 'branch_inner_state', 'branch_inner_location',
        'office_address', 'residential_address', 'aadhaar_number', 'pan_number',
        'account_number', 'ifsc_code', 'bank_name', 'account_type',
        'ref_name_1', 'ref_relation_1', 'ref_mobile_1', 'ref_address_1',
        'ref_name_2', 'ref_relation_2', 'ref_mobile_2', 'ref_address_2',
        'reporting_to', 'rank', 'status'
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
      }

      // Add files
      const fileFields = [
        'pan_img', 'aadhaar_img', 'photo',
        'bank_proof_img', 'company_logo'
      ];

      fileFields.forEach(field => {
        if (editFormData[field] instanceof File) {
          formData.append(field, editFormData[field]);
        }
      });

      console.log('Updating partner with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      const response = await api.patch(`partner-users/${editingPartner.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Partner updated successfully!');

        // Update the frontend state
        const updatedPartner = {
          ...editingPartner,
          ...response.data
        };

        setPartnerUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === editingPartner.id ? updatedPartner : user
          )
        );

        setEditingPartner(updatedPartner);

        // Clear file previews
        setPanPreview(null);
        setAadhaarPreview(null);
        setPhotoPreview(null);
        setBankProofPreview(null);
        setCompanyLogoPreview(null);
        setFilteredLocations([]);

        setTimeout(() => {
          fetchPartnerUsers(page);
        }, 500);

        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage('Failed to update partner. Please try again.');
      }
    } catch (error) {
      console.error('Error updating partner:', error);

      let errorMsg = 'Failed to update partner. ';
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
      {/* Enhanced Edit Modal - UPDATED with branch inner state/location */}
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
                  <i className="bi bi-pencil-square"></i> Edit Partner User
                </h2>
                <p className="employee-identifier">
                  {editingPartner &&
                    ` • ${getFullName(editingPartner)} • ${getPhoneNumber(editingPartner)}`
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
                      name="birth_date"
                      value={editFormData.birth_date}
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
                      <i className="bi bi-geo-alt"></i> Branch Inner State
                    </label>
                    <select
                      name="branch_inner_state"
                      value={editFormData.branch_inner_state || ''}
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
                      value={editFormData.branch_inner_location || ''}
                      onChange={handleEditFormChange}
                      disabled={editLoading || !editFormData.branch_inner_state}
                    >
                      <option value="">
                        {!editFormData.branch_inner_state
                          ? 'Select Inner State First'
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
                      <p className="text-xs text-amber-600 mt-1">
                        No branch inner locations found for this state
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-tag"></i> Rank
                    </label>
                    <input
                      type="text"
                      name="rank"
                      value={editFormData.rank || ''}
                      onChange={handleEditFormChange}
                      placeholder="Rank/Position"
                      disabled={editLoading}
                    />
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

              {/* Document Information Section - UPDATED field names */}
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
                      name="aadhaar_number"
                      value={editFormData.aadhaar_number}
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
                      placeholder="ABCDE1234F"
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
                        name="pan_img"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="pan-upload"
                        className="file-input"
                      />
                      <label htmlFor="pan-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {panPreview && (
                        <div className="file-preview">
                          <a href={panPreview} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-eye"></i> View Current
                          </a>
                        </div>
                      )}
                      {editFormData.pan_img instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.pan_img.name}
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
                        name="aadhaar_img"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={editLoading}
                        id="aadhaar-upload"
                        className="file-input"
                      />
                      <label htmlFor="aadhaar-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {aadhaarPreview && (
                        <div className="file-preview">
                          <a href={aadhaarPreview} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-eye"></i> View Current
                          </a>
                        </div>
                      )}
                      {editFormData.aadhaar_img instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.aadhaar_img.name}
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
                        name="photo"
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
                      {editFormData.photo instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.photo.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Information Section - UPDATED field names */}
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
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-file-earmark-pdf"></i> Bank Proof Upload
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="bank_proof_img"
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
                      {editFormData.bank_proof_img instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.bank_proof_img.name}
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
                      value={editFormData.reporting_to || ''}
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
                        name="company_logo"
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
                      {editFormData.company_logo instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.company_logo.name}
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
          <h1><i className="bi bi-handshake-fill"></i> Active Partner Users</h1>
          <p className="subtitle">Total: {partnerUsers.length} active Partner users</p>
        </div>
        <div className="header-right">
          <Link to="/admin-dashboard/partner/add" className="add-new-btn">
            <i className="bi bi-person-plus"></i> Add New Partner
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
                <th>Reporting To</th>
                <th>Company</th>
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
                      <p>Loading active partner users...</p>
                    </div>
                  </td>
                </tr>
              ) : partnerUsers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <i className="bi bi-handshake"></i>
                      <h3>No active partner users found</h3>
                      <p>There are no active partner users in the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                partnerUsers.map((partner, index) => (
                  <tr key={partner.id || index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    {/* Full Name Column */}
                    <td>
                      <div className="employee-info">
                        {partner.photo_url || partner.photo_upload_url || partner.profile_image ? (
                          <div className="employee-avatar">
                            <img
                              src={partner.photo_url || partner.photo_upload_url || partner.profile_image}
                              alt={getFullName(partner)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="employee-avatar-placeholder">

                          </div>
                        )}
                        <div className="employee-name-details">
                          <div className="employee-full-name">
                            {getFullName(partner)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number Column */}
                    <td>
                      <div className="contact-info">
                        {getPhoneNumber(partner)}
                      </div>
                    </td>

                    {/* Email Column */}
                    <td>
                      <div className="employee-email">
                        {getEmail(partner)}
                      </div>
                    </td>

                    {/* Reporting To Column */}
                    <td>
                      <div className="reporting-to-info">
                        {partner.reporting_to_name ? (
                          partner.reporting_to_name
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </div>
                    </td>

                    {/* Company Column */}
                    <td>
                      <div className="company-info">
                        {partner.company_name ? (
                          partner.company_name
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
                      {renderActions(partner)}
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
                              navigate(`/admin-dashboard/partner/work-permission?userId=${partner.id}`);
                            }
                            else if (selectedValue === 'payout') {
                              navigate(`/admin-dashboard/partner/payout-permission?userId=${partner.id}`);
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

        {partnerUsers.length > 0 && (
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

export default PartnerActiveList;