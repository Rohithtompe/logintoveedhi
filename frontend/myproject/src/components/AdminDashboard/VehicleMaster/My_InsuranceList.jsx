import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

function My_InsuranceList() {
  const navigate = useNavigate();
  
  // State for insurance data
  const [insuranceList, setInsuranceList] = useState([]);
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state for modal
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '', 
    phone_number: '', 
    alternative_phone_number: '', 
    email_id: '',
    state: '', 
    location: '', 
    sub_location: '', 
    pincode: '', 
    customer_type: '', 
    industry_type: '', 
    business_type: '', 
    birth_date: '',
    address: ''
  });

  // Dropdown data for modal form
  const [modalStates, setModalStates] = useState([]);
  const [modalLocations, setModalLocations] = useState([]);
  const [modalSubLocations, setModalSubLocations] = useState([]);
  const [modalPinCodes, setModalPinCodes] = useState([]);
  const [modalCustomerTypes, setModalCustomerTypes] = useState([]);
  const [modalIndustryTypes, setModalIndustryTypes] = useState([]);
  const [modalBusinessTypes, setModalBusinessTypes] = useState([]);

  // Loading state for modal
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch all required data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch states and locations first
      await Promise.all([
        fetchStates(),
        fetchLocations(),
        fetchInsuranceData()
      ]);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load insurance data. Please try again.');
      showToast('Failed to load insurance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await api.get('branch-states/');
      if (Array.isArray(response.data)) {
        setStates(response.data);
        setModalStates(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setStates(response.data.results);
        setModalStates(response.data.results);
      }
    } catch (err) {
      console.warn('Could not fetch states:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('branch-locations/');
      if (Array.isArray(response.data)) {
        setLocations(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setLocations(response.data.results);
      }
    } catch (err) {
      console.warn('Could not fetch locations:', err);
    }
  };

  const fetchInsuranceData = async () => {
    try {
      const response = await api.get('vehicle-add-insurance/');
      
      // Handle both array and paginated responses
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Insurance data for debugging:', data);
      setInsuranceList(data);
    } catch (err) {
      console.error('Error fetching insurance data:', err);
      throw err;
    }
  };

  // Get state name from ID
  const getStateName = (insurance) => {
    if (!insurance) return 'N/A';
    
    // If state is an object with name property
    if (insurance.state && typeof insurance.state === 'object' && insurance.state.name) {
      return insurance.state.name;
    }
    
    // If state is an ID, find in states array
    if (insurance.state && typeof insurance.state === 'number') {
      const foundState = states.find(s => s.id === insurance.state);
      return foundState ? foundState.name : `State ID: ${insurance.state}`;
    }
    
    // If state_name is directly available
    if (insurance.state_name) {
      return insurance.state_name;
    }
    
    // If state is a string (might be the name already)
    if (typeof insurance.state === 'string') {
      return insurance.state;
    }
    
    return 'N/A';
  };

  // Get location name from ID
  const getLocationName = (insurance) => {
    if (!insurance) return 'N/A';
    
    // If location is an object with name property
    if (insurance.location && typeof insurance.location === 'object' && insurance.location.name) {
      return insurance.location.name;
    }
    
    // If location is an ID, find in locations array
    if (insurance.location && typeof insurance.location === 'number') {
      const foundLocation = locations.find(l => l.id === insurance.location);
      return foundLocation ? foundLocation.name : `Location ID: ${insurance.location}`;
    }
    
    // If location_name is directly available
    if (insurance.location_name) {
      return insurance.location_name;
    }
    
    // If location is a string (might be the name already)
    if (typeof insurance.location === 'string') {
      return insurance.location;
    }
    
    return 'N/A';
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    
    // Remove non-numeric characters
    const cleaned = phone.toString().replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    // Return as is if not 10 digits
    return phone;
  };

  // Filter insurance data based on search
  const filteredInsurance = insuranceList.filter(insurance => {
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (insurance.customer_name && insurance.customer_name.toLowerCase().includes(searchLower)) ||
      (insurance.company_name && insurance.company_name.toLowerCase().includes(searchLower)) ||
      (insurance.phone_number && insurance.phone_number.includes(searchTerm)) ||
      (getStateName(insurance).toLowerCase().includes(searchLower)) ||
      (getLocationName(insurance).toLowerCase().includes(searchLower))
    );
  });

  // Handle View Insurance - Navigate to Vehicle_View page
  const handleViewInsurance = (insurance) => {
    console.log('View insurance:', insurance);
    
    // You can pass the insurance data in state or navigate with ID
   navigate(`/admin-dashboard/vehicle/view/${insurance.id}`);
    
    // OR navigate with ID and fetch in Vehicle_View component
    // navigate(`/Vehicle_View/${insurance.id}`);
  };

  // Handle edit insurance - OPEN MODAL
  const handleEditInsurance = async (insurance) => {
    console.log('Edit insurance:', insurance);
    setSelectedInsurance(insurance);
    setIsEditMode(true);
    
    // Load insurance data into form
    try {
      setModalLoading(true);
      
      // Set main form data
      setFormData({
        customer_name: insurance.customer_name || '',
        company_name: insurance.company_name || '',
        phone_number: insurance.phone_number || '',
        alternative_phone_number: insurance.alternative_phone_number || '',
        email_id: insurance.email_id || '',
        state: insurance.state?.id || insurance.state || '',
        location: insurance.location?.id || insurance.location || '',
        sub_location: insurance.sub_location?.id || insurance.sub_location || '',
        pincode: insurance.pincode?.id || insurance.pincode || '',
        customer_type: insurance.customer_type?.id || insurance.customer_type || '',
        industry_type: insurance.industry_type?.id || insurance.industry_type || '',
        business_type: insurance.business_type?.id || insurance.business_type || '',
        birth_date: formatDateForDisplay(insurance.birth_date) || '',
        address: insurance.address || ''
      });

      // Load dependent dropdowns
      await fetchModalInitialData();
      
      if (insurance.state) {
        await fetchModalLocations(insurance.state?.id || insurance.state);
      }
      if (insurance.location) {
        await fetchModalSubLocations(insurance.location?.id || insurance.location);
      }
      if (insurance.sub_location) {
        await fetchModalPinCodes(insurance.sub_location?.id || insurance.sub_location);
      }
      if (insurance.customer_type) {
        await fetchModalIndustryTypes(insurance.customer_type?.id || insurance.customer_type);
      }
      if (insurance.industry_type) {
        await fetchModalBusinessTypes(insurance.industry_type?.id || insurance.industry_type);
      }

      setModalLoading(false);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading insurance data:', error);
      showToast('error', 'Failed to load insurance data for editing');
      setModalLoading(false);
    }
  };

  // Handle add new insurance - OPEN MODAL
  const handleAddInsurance = async () => {
    setSelectedInsurance(null);
    setIsEditMode(false);
    
    // Reset form
    setFormData({
      customer_name: '',
      company_name: '', 
      phone_number: '', 
      alternative_phone_number: '', 
      email_id: '',
      state: '', 
      location: '', 
      sub_location: '', 
      pincode: '', 
      customer_type: '', 
      industry_type: '', 
      business_type: '', 
      birth_date: '',
      address: ''
    });

    // Reset dependent dropdowns
    setModalLocations([]);
    setModalSubLocations([]);
    setModalPinCodes([]);
    setModalIndustryTypes([]);
    setModalBusinessTypes([]);
    
    // Load initial data
    try {
      setModalLoading(true);
      await fetchModalInitialData();
      setModalLoading(false);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading form data:', error);
      showToast('error', 'Failed to load form data');
      setModalLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInsurance(null);
    setIsEditMode(false);
    setModalSaving(false);
  };

  // Fetch initial data for modal
  const fetchModalInitialData = async () => {
    try {
      const [customerTypesRes] = await Promise.all([
        api.get('customer-type/')
      ]);

      // Set customer types
      const customerTypesData = Array.isArray(customerTypesRes.data) ? customerTypesRes.data : customerTypesRes.data?.results || [];
      setModalCustomerTypes(customerTypesData);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      throw error;
    }
  };

  // Fetch dependent dropdowns
  const fetchModalLocations = async (stateId) => {
    try {
      const response = await api.get(`branch-locations/?branch_state=${stateId}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setModalLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchModalSubLocations = async (locationId) => {
    try {
      const response = await api.get(`sublocations/?branch_location=${locationId}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setModalSubLocations(data);
    } catch (error) {
      console.error('Error fetching sub locations:', error);
    }
  };

  const fetchModalPinCodes = async (subLocationId) => {
    try {
      const response = await api.get(`pincodes/?sub_location=${subLocationId}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setModalPinCodes(data);
    } catch (error) {
      console.error('Error fetching PIN codes:', error);
    }
  };

  const fetchModalIndustryTypes = async (customerTypeId) => {
    try {
      const response = await api.get(`industry-type/?customer_type=${customerTypeId}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setModalIndustryTypes(data);
    } catch (error) {
      console.error('Error fetching industry types:', error);
    }
  };

  const fetchModalBusinessTypes = async (industryTypeId) => {
    try {
      const response = await api.get(`business-type/?industry_name=${industryTypeId}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setModalBusinessTypes(data);
    } catch (error) {
      console.error('Error fetching business types:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number input
    if (name === 'phone_number' || name === 'alternative_phone_number') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle state change
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      state: stateId,
      location: '',
      sub_location: '',
      pincode: ''
    }));
    
    setModalLocations([]);
    setModalSubLocations([]);
    setModalPinCodes([]);

    if (stateId) {
      await fetchModalLocations(stateId);
    }
  };

  // Handle location change
  const handleLocationChange = async (e) => {
    const locationId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      location: locationId,
      sub_location: '',
      pincode: ''
    }));
    
    setModalSubLocations([]);
    setModalPinCodes([]);

    if (locationId) {
      await fetchModalSubLocations(locationId);
    }
  };

  // Handle sub-location change
  const handleSubLocationChange = async (e) => {
    const subLocationId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      sub_location: subLocationId,
      pincode: ''
    }));
    
    setModalPinCodes([]);

    if (subLocationId) {
      await fetchModalPinCodes(subLocationId);
    }
  };

  // Handle customer type change
  const handleCustomerTypeChange = async (e) => {
    const customerTypeId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      customer_type: customerTypeId,
      industry_type: '',
      business_type: ''
    }));
    
    setModalIndustryTypes([]);
    setModalBusinessTypes([]);

    if (customerTypeId) {
      await fetchModalIndustryTypes(customerTypeId);
    }
  };

  // Handle industry type change
  const handleIndustryTypeChange = async (e) => {
    const industryTypeId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      industry_type: industryTypeId,
      business_type: ''
    }));
    
    setModalBusinessTypes([]);

    if (industryTypeId) {
      await fetchModalBusinessTypes(industryTypeId);
    }
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    if (date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date;
  };

  // Handle date input
  const handleDateInput = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '').substring(0, 10);
    
    // Auto-add slashes
    if (value.length === 2 || value.length === 5) {
      value += '/';
    }
    
    setFormData(prev => ({ ...prev, birth_date: value }));
  };

  // Convert date for submission
  const convertDateForSubmit = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return dateStr;
    }
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr;
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      'customer_name', 'company_name', 'phone_number', 
      'state', 'location', 'sub_location', 'pincode',
      'customer_type', 'industry_type', 'business_type'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        showToast('warning', `Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }

    if (formData.phone_number.length !== 10) {
      showToast('warning', 'Phone number must be 10 digits');
      return false;
    }

    if (formData.email_id && !/\S+@\S+\.\S+/.test(formData.email_id)) {
      showToast('warning', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setModalSaving(true);

    try {
      const submitData = {
        customer_name: formData.customer_name,
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        alternative_phone_number: formData.alternative_phone_number || "",
        email_id: formData.email_id || "",
        state: parseInt(formData.state),
        location: parseInt(formData.location),
        sub_location: parseInt(formData.sub_location),
        pincode: parseInt(formData.pincode),
        customer_type: parseInt(formData.customer_type),
        industry_type: parseInt(formData.industry_type),
        business_type: parseInt(formData.business_type),
        birth_date: convertDateForSubmit(formData.birth_date) || null,
        address: formData.address || ""
      };

      if (isEditMode && selectedInsurance) {
        // Update existing insurance
        await api.put(`vehicle-add-insurance/${selectedInsurance.id}/`, submitData);
        showToast('Insurance updated successfully!', 'success');
      } else {
        // Create new insurance
        await api.post('vehicle-add-insurance/', submitData);
        showToast('Insurance created successfully!', 'success');
      }

      // Close modal and refresh list
      handleCloseModal();
      fetchAllData();

    } catch (error) {
      console.error('Error saving insurance:', error);
      let errorMessage = 'Failed to save insurance. ';
      
      if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setModalSaving(false);
    }
  };

  // Handle delete insurance
  const handleDeleteInsurance = async (insuranceId, customerName) => {
    console.log('Delete insurance with ID:', insuranceId);
    if (window.confirm(`Are you sure you want to delete insurance for "${customerName}"?`)) {
      try {
        await api.delete(`vehicle-add-insurance/${insuranceId}/`);
        // Refresh the list
        fetchAllData();
        showToast(`Insurance for "${customerName}" deleted successfully!`, 'success');
      } catch (err) {
        console.error('Error deleting insurance:', err);
        showToast('Failed to delete insurance record', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <div className="layout-page">
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="row">
                  <div className="col-xl">
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5>Loading Insurance List...</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <div className="layout-page">
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="row">
                  <div className="col-xl">
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <i className="bx bx-error-circle text-danger mb-3" style={{fontSize: '48px'}}></i>
                        <h5 className="text-danger">Error Loading Data</h5>
                        <p className="text-muted">{error}</p>
                        <button 
                          className="btn btn-primary"
                          onClick={fetchAllData}
                        >
                          <i className="bx bx-refresh me-2"></i>
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Modal Form
  const renderModalForm = () => {
    if (modalLoading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading form data...</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        {/* Customer Name */}
        <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label" htmlFor="customer_name">
              Customer Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="customer_name"
              id="customer_name"
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              disabled={modalSaving}
            />
          </div>
        </div>

        {/* Company Name and Phone */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="company_name">
              Company Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="company_name"
              id="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
              disabled={modalSaving}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="phone_number">
              Phone No <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              className="form-control"
              placeholder="Enter 10-digit phone number"
              value={formData.phone_number}
              onChange={handleInputChange}
              maxLength="10"
              required
              disabled={modalSaving}
            />
          </div>
        </div>

        {/* Alternative Phone and Email */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="alternative_phone_number">
              Alternative Phone No
            </label>
            <input
              type="text"
              id="alternative_phone_number"
              name="alternative_phone_number"
              className="form-control"
              placeholder="Alternative phone number"
              value={formData.alternative_phone_number}
              onChange={handleInputChange}
              maxLength="10"
              disabled={modalSaving}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="email_id">
              Email
            </label>
            <input
              type="email"
              name="email_id"
              id="email_id"
              className="form-control"
              placeholder="user@example.com"
              value={formData.email_id}
              onChange={handleInputChange}
              disabled={modalSaving}
            />
          </div>
        </div>

        {/* State and Location */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="state">
              State <span className="text-danger">*</span>
            </label>
            <select
              id="state"
              name="state"
              className="form-select"
              value={formData.state}
              onChange={handleStateChange}
              required
              disabled={modalSaving}
            >
              <option value="">Select State</option>
              {modalStates.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="location">
              Location <span className="text-danger">*</span>
            </label>
            <select
              id="location"
              name="location"
              className="form-select"
              value={formData.location}
              onChange={handleLocationChange}
              disabled={!formData.state || modalSaving}
              required
            >
              <option value="">Select Location</option>
              {modalLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub Location and PIN Code */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="sub_location">
              Sub Location <span className="text-danger">*</span>
            </label>
            <select
              id="sub_location"
              name="sub_location"
              className="form-select"
              value={formData.sub_location}
              onChange={handleSubLocationChange}
              disabled={!formData.location || modalSaving}
              required
            >
              <option value="">Select Sub Location</option>
              {modalSubLocations.map(subLocation => (
                <option key={subLocation.id} value={subLocation.id}>
                  {subLocation.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pincode">
              PIN Code <span className="text-danger">*</span>
            </label>
            <select
              id="pincode"
              name="pincode"
              className="form-select"
              value={formData.pincode}
              onChange={handleInputChange}
              disabled={!formData.sub_location || modalSaving}
              required
            >
              <option value="">Select PIN Code</option>
              {modalPinCodes.map(pinCode => (
                <option key={pinCode.id} value={pinCode.id}>
                  {pinCode.pincode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Type and Industry Type */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="customer_type">
              Type Of Customer <span className="text-danger">*</span>
            </label>
            <select
              id="customer_type"
              name="customer_type"
              className="form-select"
              value={formData.customer_type}
              onChange={handleCustomerTypeChange}
              required
              disabled={modalSaving}
            >
              <option value="">Select Customer Type</option>
              {modalCustomerTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.customer_type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="industry_type">
              Industry Type <span className="text-danger">*</span>
            </label>
            <select
              id="industry_type"
              name="industry_type"
              className="form-select"
              value={formData.industry_type}
              onChange={handleIndustryTypeChange}
              disabled={!formData.customer_type || modalSaving}
              required
            >
              <option value="">Select Industry Type</option>
              {modalIndustryTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.industry_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Business Type and Date of Birth */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="business_type">
              Business Type <span className="text-danger">*</span>
            </label>
            <select
              id="business_type"
              name="business_type"
              className="form-select"
              value={formData.business_type}
              onChange={handleInputChange}
              disabled={!formData.industry_type || modalSaving}
              required
            >
              <option value="">Select Business Type</option>
              {modalBusinessTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.business_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="birth_date">
              Date of Birth
            </label>
            <input
              type="text"
              className="form-control"
              name="birth_date"
              id="birth_date"
              placeholder="DD/MM/YYYY"
              value={formData.birth_date}
              onChange={handleDateInput}
              disabled={modalSaving}
            />
            <small className="text-muted">Format: DD/MM/YYYY</small>
          </div>
        </div>

        {/* Address */}
        <div className="row mb-4">
          <div className="col-md-12">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <textarea
              name="address"
              id="address"
              className="form-control"
              placeholder="Full address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              disabled={modalSaving}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseModal}
            disabled={modalSaving}
          >
            <i className="bx bx-x me-1"></i> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={modalSaving}
          >
            {modalSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <i className="bx bx-check me-1"></i>
                {isEditMode ? 'Update Insurance' : 'Save Insurance'}
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="layout-wrapper layout-content-navbar">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast-container position-fixed top-0 end-0 p-3`}
          style={{ zIndex: 9999 }}
        >
          <div className={`toast align-items-center text-bg-${toast.type === 'error' ? 'danger' : 'success'} border-0`} role="alert">
            <div className="d-flex">
              <div className="toast-body">
                {toast.type === 'error' ? (
                  <i className="bx bx-error-circle me-2"></i>
                ) : (
                  <i className="bx bx-check-circle me-2"></i>
                )}
                {toast.message}
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast({ show: false, message: '', type: '' })}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Form Modal */}
      {showModal && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            style={{ zIndex: 1040 }}
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal */}
          <div 
            className="modal fade show d-block" 
            style={{ zIndex: 1050 }}
            tabIndex="-1"
            role="dialog"
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                handleCloseModal();
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
              <div className="modal-content" style={{ maxHeight: '85vh' }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bx bx-shield-alt me-2"></i>
                    {isEditMode ? 'Edit Insurance' : 'Add New Insurance'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4">
                  {renderModalForm()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="layout-container">
        <div className="layout-page">
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <div className="row">
                <div className="col-xl">
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center bg-primary bg-opacity-10 border-bottom">
                      <h5 className="mb-0 fw-bold text-primary">
                        <i className="bx bx-shield-alt me-2"></i>
                        Insurance List
                      </h5>
                      <div>
                        <button 
                          className="btn btn-primary"
                          onClick={handleAddInsurance}
                        >
                          <i className="bx bx-plus me-2"></i>
                          Add New Insurance
                        </button>
                      </div>
                    </div>
                    
                    {/* Search Box */}
                    <div className="card-body border-bottom">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="input-group input-group-merge">
                            <span className="input-group-text bg-white border-end-0">
                              <i className="bx bx-search text-muted"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="Search by customer, company, phone, state or location..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4 text-end">
                          <button 
                            className="btn btn-outline-secondary me-2"
                            onClick={() => setSearchTerm('')}
                            disabled={!searchTerm}
                            title="Clear Search"
                          >
                            <i className="bx bx-x"></i> Clear
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={fetchAllData}
                            title="Refresh"
                          >
                            <i className="bx bx-refresh"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Table */}
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th width="25%" className="ps-4">CUSTOMER NAME</th>
                            <th width="20%">COMPANY NAME</th>
                            <th width="15%">MOBILE</th>
                            <th width="15%">STATE</th>
                            <th width="15%">LOCATION</th>
                            <th width="10%" className="text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInsurance.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-5">
                                <div className="empty-state">
                                  <i className="bx bx-shield text-muted" style={{fontSize: '48px'}}></i>
                                  <h5 className="mt-3">No Insurance Found</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'No results match your search.' : 'No insurance records available.'}
                                  </p>
                                  {!searchTerm && (
                                    <button 
                                      className="btn btn-primary mt-2"
                                      onClick={handleAddInsurance}
                                    >
                                      <i className="bx bx-plus me-2"></i>
                                      Add Your First Insurance
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredInsurance.map((insurance) => (
                              <tr key={insurance.id} className="align-middle">
                                <td className="ps-4">
                                  <div className="d-flex align-items-center">
                                    <div className="d-flex text-center">
                                      <h6 className="mb-0 fw-medium">{insurance.customer_name || 'N/A'}</h6>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className="bx bx-building text-primary me-2"></i>
                                    <span className="fw-medium">{insurance.company_name || 'N/A'}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className="bx bx-phone text-success me-2"></i>
                                    <span className="fw-medium">
                                      {formatPhoneNumber(insurance.phone_number)}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2">
                                    <i className="bx bx-map me-1"></i>
                                    {getStateName(insurance)}
                                  </span>
                                </td>
                                <td>
                                  <span className="d-flex align-items-center">
                                    <i className="bx bx-map-pin text-warning me-2"></i>
                                    <span className="fw-medium">
                                      {getLocationName(insurance)}
                                    </span>
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info border rounded"
                                      onClick={() => handleViewInsurance(insurance)}
                                      title="View Details"
                                      style={{ minWidth: '36px' }}
                                    >
                                      <i className="bx bx-show">view</i>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning border rounded"
                                      onClick={() => handleEditInsurance(insurance)}
                                      title="Edit"
                                      style={{ minWidth: '36px' }}
                                    >
                                      <i className="bx bx-edit">edit</i>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger border rounded"
                                      onClick={() => handleDeleteInsurance(insurance.id, insurance.customer_name || 'this record')}
                                      title="Delete"
                                      style={{ minWidth: '36px' }}
                                    >
                                      <i className="bx bx-trash">delete</i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer */}
                    {filteredInsurance.length > 0 && (
                      <div className="card-footer">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <p className="mb-0">
                              <i className="bx bx-info-circle me-2"></i>
                              Showing <strong>{filteredInsurance.length}</strong> of{' '}
                              <strong>{insuranceList.length}</strong> insurance records
                            </p>
                          </div>
                          <div className="col-md-6 text-end">
                            <div className="btn-group" role="group">
                              <button type="button" className="btn btn-outline-success">
                                <i className="bx bx-check-circle me-1"></i>
                                Active: {insuranceList.filter(i => i.status === true || i.status === 'active').length}
                              </button>
                              <button type="button" className="btn btn-outline-secondary">
                                <i className="bx bx-x-circle me-1"></i>
                                Inactive: {insuranceList.filter(i => i.status === false || i.status === 'inactive').length}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default My_InsuranceList;