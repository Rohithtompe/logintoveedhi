import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  FileText,
  Image,
  Calendar,
  Users,
  Map,
  Home,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Smartphone
} from 'lucide-react';

const Add_SDSA = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [reportingUsers, setReportingUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailExistsIn, setEmailExistsIn] = useState([]);

  // State for form fields
  const [formData, setFormData] = useState({
    // Login Details
    email_id: '',
    password: '',

    // Personal Details
    first_name: '',
    last_name: '',
    alias_name: '',
    phone_number: '',
    alternative_mobile_number: '',
    company_name: '',
    birth_date: '',
    rank: '',

    // Branch Details
    // Branch Details
    branch_inner_state: '',
    branch_inner_location: '',

    // Address Details
    office_address: '',
    residential_address: '',

    // Government IDs
    aadhaar_number: '',
    pan_number: '',

    // Bank Details
    account_number: '',
    ifsc_code: '',
    bank: '',
    type_of_account: '',

    // Professional Details
    reportingTo: '',

    // File uploads
    pan_img: null,
    aadhaar_img: null,
    photo: null,
    bank_proof_img: null,
    company_logo: null,

    // References 1
    ref_name_1: '',
    ref_relation_1: '',
    ref_mobile_1: '',
    ref_address_1: '',

    // References 2
    ref_name_2: '',
    ref_relation_2: '',
    ref_mobile_2: '',
    ref_address_2: ''
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }
    fetchDropdownData();
  }, [navigate]);

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      setLoading(true);

      const [
        statesResponse,
        banksResponse,
        accountTypesResponse,
        usersResponse
      ] = await Promise.all([
        api.get('branch-inner-states/'),
        api.get('banks/'),
        api.get('typeofaccounts/'),
        api.get('users/')
      ]);

      console.log('Branch Inner States Response:', statesResponse.data);
      setBranchInnerStates(statesResponse.data || []);

      console.log('Banks Response:', banksResponse.data);
      setBanks(banksResponse.data || []);

      console.log('Account Types Response:', accountTypesResponse.data);
      setAccountTypes(accountTypesResponse.data || []);

      // Filter active users for reporting
      if (usersResponse.data) {
        console.log('Users Response:', usersResponse.data);
        let usersList = [];
        if (Array.isArray(usersResponse.data)) {
          usersList = usersResponse.data;
        } else if (usersResponse.data.results) {
          usersList = usersResponse.data.results;
        }

        const filteredUsers = usersList.filter(user =>
          (user.role === 'employee' || user.role === 'admin') && user.is_active !== false
        );
        setReportingUsers(filteredUsers);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load form data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branch inner locations when branch state changes
  useEffect(() => {
    const fetchBranchInnerLocations = async () => {
      if (formData.branch_inner_state) {
        try {
          console.log('Fetching branch inner locations for state ID:', formData.branch_inner_state);

          // Try different approaches
          let response;
          try {
            // Approach 1: With query parameter
            response = await api.get(`branch-inner-locations/?branch_inner_state=${formData.branch_inner_state}`);
          } catch (err) {
            console.log('First approach failed, trying without query param');
            // Approach 2: Get all and filter
            response = await api.get('branch-inner-locations/');
          }

          console.log('Branch Inner Locations Raw Response:', response);
          console.log('Branch Inner Locations Data:', response.data);

          let locations = [];

          // Handle different response formats
          if (Array.isArray(response.data)) {
            locations = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            locations = response.data.results;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            locations = response.data.data;
          }

          // If we got all locations, filter them
          if (!response.config.url.includes('?') && locations.length > 0) {
            locations = locations.filter(loc =>
              loc.branch_inner_state == formData.branch_inner_state ||
              loc.state_id == formData.branch_inner_state ||
              loc.state == formData.branch_inner_state
            );
          }

          console.log('Processed Branch Inner Locations:', locations);
          setBranchInnerLocations(locations);

        } catch (err) {
          console.error('Error fetching branch inner locations:', err);
          setBranchInnerLocations([]);
        }
      } else {
        setBranchInnerLocations([]);
      }
    };

    fetchBranchInnerLocations();
  }, [formData.branch_inner_state]);

  // Debug effect to log when branchInnerLocations changes
  useEffect(() => {
    console.log('branchInnerLocations state updated:', branchInnerLocations);
    console.log('Number of locations:', branchInnerLocations.length);
  }, [branchInnerLocations]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format phone numbers to remove non-digits
    if (['phone_number', 'alternative_mobile_number', 'aadhaar_number', 'account_number', 'ref_mobile_1', 'ref_mobile_2'].includes(name)) {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Reset email availability check when email changes
    if (name === 'email_id') {
      setEmailAvailable(null);
      setEmailExistsIn([]);
    }
  };

  // Handle confirm password
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  // Check email availability across ALL user types
  const checkEmailAvailability = async () => {
    if (!formData.email_id.trim() || !validateEmail(formData.email_id)) {
      setEmailAvailable(null);
      setEmailExistsIn([]);
      return;
    }

    setCheckingEmail(true);
    try {
      const [sdsaResponse, partnerResponse] = await Promise.all([
        api.post('check-sdsa-email/', { email_id: formData.email_id }).catch(() => ({ data: { exists: false } })),
        api.post('check-partner-email/', { email_id: formData.email_id }).catch(() => ({ data: { exists: false } }))
      ]);

      const existsInSDSA = sdsaResponse.data.exists;
      const existsInPartner = partnerResponse.data.exists;
      const existsAnywhere = existsInSDSA || existsInPartner;

      setEmailAvailable(!existsAnywhere);

      const existsIn = [];
      if (existsInSDSA) existsIn.push('SDSA');
      if (existsInPartner) existsIn.push('Partner');
      setEmailExistsIn(existsIn);

    } catch (err) {
      console.error('Error checking email:', err);
      setEmailAvailable(null);
      setEmailExistsIn([]);
      setError('Failed to check email availability across all user types');
    } finally {
      setCheckingEmail(false);
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate PAN format
  const validatePAN = (pan) => {
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(pan.toUpperCase());
  };

  // Validate Aadhaar format
  const validateAadhaar = (aadhaar) => {
    const re = /^\d{12}$/;
    return re.test(aadhaar);
  };

  // Validate IFSC format
  const validateIFSC = (ifsc) => {
    const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return re.test(ifsc.toUpperCase());
  };

  // Validate phone number
  const validatePhone = (phone) => {
    const re = /^\d{10}$/;
    return re.test(phone);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(formData.email_id)) {
      setError('Please enter a valid email address');
      return;
    }

    if (emailAvailable === false) {
      const existsMessage = emailExistsIn.length > 0
        ? `Email already exists in ${emailExistsIn.join(' and ')} users`
        : 'Email already exists in system';
      setError(`${existsMessage}. Please use a different email.`);
      return;
    }

    if (emailAvailable === null) {
      setError('Please check email availability first.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.first_name || !formData.last_name) {
      setError('Please fill in first and last name');
      return;
    }

    if (!validatePhone(formData.phone_number)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('confirm_password', confirmPassword);

    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== '' && value !== undefined) {
        if (['pan_img', 'aadhaar_img', 'photo', 'bank_proof_img', 'company_logo'].includes(key)) {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else {
          formDataToSend.append(key, value);
        }
      }
    });

    formDataToSend.append('status', 'true');

    try {
      setSubmitting(true);
      const response = await api.post('sdsa-users/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        // PASSWORD SAVE HOGA
        localStorage.setItem("sdsa_password", formData.password);
        setSuccess('SDSA User created successfully!');
        resetForm();
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/admin-dashboard/sdsa/active');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating SDSA user:', err);

      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = [];
          Object.keys(err.response.data).forEach(field => {
            if (Array.isArray(err.response.data[field])) {
              errors.push(`${field}: ${err.response.data[field].join(', ')}`);
            } else {
              errors.push(`${field}: ${err.response.data[field]}`);
            }
          });
          setError(errors.join(' | '));
        } else {
          setError(err.response.data);
        }
      } else {
        setError('Failed to create SDSA user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email_id: '',
      password: '',
      first_name: '',
      last_name: '',
      alias_name: '',
      phone_number: '',
      alternative_mobile_number: '',
      company_name: '',
      birth_date: '',
      rank: '',
      branch_inner_state: '',
      branch_inner_location: '',
      office_address: '',
      residential_address: '',
      aadhaar_number: '',
      pan_number: '',
      account_number: '',
      ifsc_code: '',
      bank: '',
      type_of_account: '',
      reportingTo: '',
      pan_img: null,
      aadhaar_img: null,
      photo: null,
      bank_proof_img: null,
      company_logo: null,
      ref_name_1: '',
      ref_relation_1: '',
      ref_mobile_1: '',
      ref_address_1: '',
      ref_name_2: '',
      ref_relation_2: '',
      ref_mobile_2: '',
      ref_address_2: ''
    });
    setEmailAvailable(null);
    setEmailExistsIn([]);
    setConfirmPassword('');
  };

  if (loading && !branchInnerStates.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add SDSA Users</h1>
              <p className="text-gray-600 mt-1">Fill in the details below to add a new SDSA user</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-600 text-sm font-medium">{success}</p>
              <p className="text-green-500 text-xs mt-1">Redirecting to SDSA list...</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-700">SDSA Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Login Credentials */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email_id"
                      value={formData.email_id}
                      onChange={handleInputChange}
                      onBlur={checkEmailAvailability}
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      required
                      disabled={submitting}
                    />
                    {checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                    {emailAvailable !== null && !checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {emailAvailable !== null && !checkingEmail && (
                    <div>
                      <p className={`text-xs ${emailAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {emailAvailable ? '✓ Email is available' : '✗ Email already exists'}
                      </p>
                      {emailExistsIn.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          Exists in: {emailExistsIn.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Alias Name
                  </label>
                  <input
                    type="text"
                    name="alias_name"
                    value={formData.alias_name}
                    onChange={handleInputChange}
                    placeholder="Alias name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    name="alternative_mobile_number"
                    value={formData.alternative_mobile_number}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Company & Branch Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company & Branch Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rank
                  </label>
                  <input
                    type="text"
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    placeholder="Rank/Position"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Branch Inner State
                  </label>
                  <select
                    name="branch_inner_state"
                    value={formData.branch_inner_state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Branch Inner State</option>
                    {branchInnerStates.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name || state.state_name || state.state || `State ${state.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Branch Inner Location
                  </label>
                  <select
                    name="branch_inner_location"
                    value={formData.branch_inner_location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || !formData.branch_inner_state}
                  >
                    <option value="">Select Branch Inner Location</option>
                    {branchInnerLocations && branchInnerLocations.length > 0 ? (
                      branchInnerLocations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name || location.location_name || location.location || `Location ${location.id}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No locations available for this state</option>
                    )}
                  </select>
                  {formData.branch_state && branchInnerLocations.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No branch inner locations found for this state
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reporting To
                  </label>
                  <select
                    name="reportingTo"
                    value={formData.reportingTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Reporting To</option>
                    {reportingUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username || user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Office Address
                  </label>
                  <textarea
                    name="office_address"
                    value={formData.office_address}
                    onChange={handleInputChange}
                    placeholder="Office address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Residential Address
                  </label>
                  <textarea
                    name="residential_address"
                    value={formData.residential_address}
                    onChange={handleInputChange}
                    placeholder="Residential address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Government ID Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Government ID Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="aadhaar_number"
                    value={formData.aadhaar_number}
                    onChange={handleInputChange}
                    placeholder="12-digit Aadhaar"
                    maxLength="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bank
                  </label>
                  <select
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bank_name || bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Type
                  </label>
                  <select
                    name="type_of_account"
                    value={formData.type_of_account}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Account Type</option>
                    {accountTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.account_type || type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    placeholder="Account number"
                    maxLength="18"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    placeholder="11-character IFSC"
                    maxLength="11"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Uploads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    name="company_logo"
                    onChange={handleFileChange}
                    accept=".jpeg,.jpg,.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.company_logo && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.company_logo.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept=".jpeg,.jpg,.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.photo && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.photo.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAN Card
                  </label>
                  <input
                    type="file"
                    name="pan_img"
                    onChange={handleFileChange}
                    accept=".jpeg,.jpg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.pan_img && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.pan_img.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhaar Card
                  </label>
                  <input
                    type="file"
                    name="aadhaar_img"
                    onChange={handleFileChange}
                    accept=".jpeg,.jpg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.aadhaar_img && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.aadhaar_img.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bank Proof
                  </label>
                  <input
                    type="file"
                    name="bank_proof_img"
                    onChange={handleFileChange}
                    accept=".jpeg,.jpg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.bank_proof_img && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.bank_proof_img.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reference Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Reference Details
              </h3>

              {/* Reference 1 */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      name="ref_name_1"
                      value={formData.ref_name_1}
                      onChange={handleInputChange}
                      placeholder="Reference name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Relation</label>
                    <input
                      type="text"
                      name="ref_relation_1"
                      value={formData.ref_relation_1}
                      onChange={handleInputChange}
                      placeholder="Relation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mobile No</label>
                    <input
                      type="tel"
                      name="ref_mobile_1"
                      value={formData.ref_mobile_1}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      maxLength="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <input
                      type="text"
                      name="ref_address_1"
                      value={formData.ref_address_1}
                      onChange={handleInputChange}
                      placeholder="Reference address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Reference 2 */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Reference 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      name="ref_name_2"
                      value={formData.ref_name_2}
                      onChange={handleInputChange}
                      placeholder="Reference name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Relation</label>
                    <input
                      type="text"
                      name="ref_relation_2"
                      value={formData.ref_relation_2}
                      onChange={handleInputChange}
                      placeholder="Relation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mobile No</label>
                    <input
                      type="tel"
                      name="ref_mobile_2"
                      value={formData.ref_mobile_2}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      maxLength="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <input
                      type="text"
                      name="ref_address_2"
                      value={formData.ref_address_2}
                      onChange={handleInputChange}
                      placeholder="Reference address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                disabled={submitting}
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={submitting || emailAvailable === false}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding SDSA...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add SDSA
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add_SDSA;