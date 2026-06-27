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
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Smartphone,
  Shield,
  Tag
} from 'lucide-react';

const AddPartner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [branchInnerStates, setBranchInnerStates] = useState([]); // CHANGED
  const [branchInnerLocations, setBranchInnerLocations] = useState([]); // CHANGED
  const [banks, setBanks] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [reportingUsers, setReportingUsers] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailExistsIn, setEmailExistsIn] = useState([]);

  // State for form fields
  const [formData, setFormData] = useState({
    // Login Credentials
    email: '',
    password: '',
    confirmPassword: '',

    // Personal Details
    firstName: '',
    lastName: '',
    aliasName: '',
    phoneNumber: '',
    alternativePhoneNumber: '',
    companyName: '',
    birthDate: '',
    partnerType: '',

    // Branch Details
    branch_inner_state: '',
    branch_inner_location: '',
    reportingTo: '',

    // Address Information
    officeAddress: '',
    residentialAddress: '',

    // Government ID Details
    aadhaarNumber: '',
    panNumber: '',

    // Bank Details
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountType: '',

    // Professional Details
    rank: '',

    // File uploads
    panCard: null,
    aadhaarCard: null,
    photo: null,
    bankProof: null,
    companyLogo: null,

    // References 1
    referenceName1: '',
    referenceRelation1: '',
    referenceMobile1: '',
    referenceAddress1: '',

    // References 2
    referenceName2: '',
    referenceRelation2: '',
    referenceMobile2: '',
    referenceAddress2: ''
  });

  // Debug effects
  useEffect(() => {
    console.log('Branch Inner States:', branchInnerStates);
  }, [branchInnerStates]);

  useEffect(() => {
    console.log('Branch Inner Locations:', branchInnerLocations);
  }, [branchInnerLocations]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }
    fetchDropdownData();
  }, [navigate]);

  // Fetch dropdown data - CHANGED to branch-inner-states
  const fetchDropdownData = async () => {
    try {
      setLoading(true);

      const [
        statesResponse,
        banksResponse,
        accountTypesResponse,
        reportingResponse,
        partnerTypesResponse
      ] = await Promise.all([
        api.get('branch-inner-states/'), // CHANGED from branch-states to branch-inner-states
        api.get('banks/'),
        api.get('typeofaccounts/'),
        api.get('users/'),
        api.get('partner-type/')
      ]);

      // Handle different response formats for branch inner states
      let statesData = [];
      if (Array.isArray(statesResponse.data)) {
        statesData = statesResponse.data;
      } else if (statesResponse.data.results) {
        statesData = statesResponse.data.results;
      }
      setBranchInnerStates(statesData);

      setBanks(banksResponse.data || []);
      setAccountTypes(accountTypesResponse.data || []);
      setReportingUsers(reportingResponse.data || []);
      setPartnerTypes(partnerTypesResponse.data || []);

      // Fetch all branch inner locations
      fetchAllBranchInnerLocations();

    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load form data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all branch inner locations
  const fetchAllBranchInnerLocations = async () => {
    try {
      const response = await api.get('branch-inner-locations/'); // CHANGED from branch-locations to branch-inner-locations

      let locationsData = [];
      if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.results) {
        locationsData = response.data.results;
      }

      setBranchInnerLocations(locationsData);
    } catch (err) {
      console.error('Error fetching branch inner locations:', err);
    }
  };

  // Fetch branch inner locations when branch state changes - CHANGED
  useEffect(() => {
    const fetchBranchInnerLocations = async () => {
      if (formData.branch_inner_state) {
        try {
          const response = await api.get(`branch-inner-locations/?branch_inner_state=${formData.branch_inner_state}`);
          let locationsData = [];
          if (Array.isArray(response.data)) {
            locationsData = response.data;
          } else if (response.data.results) {
            locationsData = response.data.results;
          }
          setBranchInnerLocations(locationsData);
        } catch (err) {
          console.error('Error fetching branch inner locations:', err);
          // Fallback: filter from all locations
          const filtered = branchInnerLocations.filter(location =>
            location.branch_inner_state == formData.branch_inner_state ||
            location.state_id == formData.branch_inner_state
          );
          setBranchInnerLocations(filtered);
        }
      } else {
        setBranchInnerLocations([]);
      }
    };

    fetchBranchInnerLocations();
  }, [formData.branch_inner_state]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      return;
    }

    // Format phone numbers to remove non-digits
    if (['phoneNumber', 'alternativePhoneNumber', 'aadhaarNumber', 'accountNumber', 'referenceMobile1', 'referenceMobile2'].includes(name)) {
      const numericValue = value.replace(/\D/g, '').slice(0, name === 'aadhaarNumber' ? 12 : 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'panNumber') {
      const panValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: panValue
      }));
    } else if (name === 'ifscCode') {
      const ifscValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
      setFormData(prev => ({
        ...prev,
        [name]: ifscValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Reset email availability check when email changes
    if (name === 'email') {
      setEmailAvailable(null);
      setEmailExistsIn([]);
    }
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`${name} file is too large. Maximum size is 5MB.`);
        return;
      }

      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const allowedDocumentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

      if (['companyLogo', 'photo'].includes(name)) {
        if (!allowedImageTypes.includes(file.type)) {
          setError(`Invalid file type for ${name}. Please upload JPG, PNG, or GIF files.`);
          return;
        }
      } else if (['panCard', 'aadhaarCard', 'bankProof'].includes(name)) {
        if (!allowedDocumentTypes.includes(file.type)) {
          setError(`Invalid file type for ${name}. Please upload JPG, PNG, or PDF files.`);
          return;
        }
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      setError('');
    }
  };

  // Check email availability across ALL user types
  const checkEmailAvailability = async () => {
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setEmailAvailable(null);
      setEmailExistsIn([]);
      return;
    }

    setCheckingEmail(true);
    try {
      const [partnerResponse, sdsaResponse] = await Promise.all([
        api.post('check-partner-email/', { email_id: formData.email }).catch(() => ({ data: { exists: false } })),
        api.post('check-sdsa-email/', { email_id: formData.email }).catch(() => ({ data: { exists: false } }))
      ]);

      const existsInPartner = partnerResponse.data.exists;
      const existsInSDSA = sdsaResponse.data.exists;
      const existsAnywhere = existsInPartner || existsInSDSA;

      setEmailAvailable(!existsAnywhere);

      const existsIn = [];
      if (existsInPartner) existsIn.push('Partner');
      if (existsInSDSA) existsIn.push('SDSA');
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
    return re.test(pan);
  };

  // Validate Aadhaar format
  const validateAadhaar = (aadhaar) => {
    const re = /^\d{12}$/;
    return re.test(aadhaar);
  };

  // Validate IFSC format
  const validateIFSC = (ifsc) => {
    const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return re.test(ifsc);
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

    // Validation
    if (!validateEmail(formData.email)) {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.aliasName) {
      setError('Please fill in all name fields');
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.alternativePhoneNumber && !validatePhone(formData.alternativePhoneNumber)) {
      setError('Please enter a valid 10-digit alternative phone number');
      return;
    }

    if (!formData.partnerType) {
      setError('Please select a partner type');
      return;
    }

    if (formData.aadhaarNumber && !validateAadhaar(formData.aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (formData.panNumber && !validatePAN(formData.panNumber)) {
      setError('Please enter a valid PAN number (format: ABCDE1234F)');
      return;
    }

    if (formData.ifscCode && !validateIFSC(formData.ifscCode)) {
      setError('Please enter a valid IFSC code');
      return;
    }

    const formDataToSend = new FormData();

    const fieldMapping = {
      email: 'email_id',
      password: 'password',
      confirmPassword: 'confirm_password',
      firstName: 'first_name',
      lastName: 'last_name',
      aliasName: 'alias_name',
      phoneNumber: 'phone_number',
      alternativePhoneNumber: 'alternative_mobile_number',
      companyName: 'company_name',
      birthDate: 'birth_date',
      partnerType: 'partner_type',
      branchState: 'branch_inner_state',
      branchLocation: 'branch_inner_location',
      reportingTo: 'reportingTo',
      officeAddress: 'office_address',
      residentialAddress: 'residential_address',
      aadhaarNumber: 'aadhaar_number',
      panNumber: 'pan_number',
      accountNumber: 'account_number',
      ifscCode: 'ifsc_code',
      bankName: 'bank',
      accountType: 'type_of_account',
      rank: 'rank',
      panCard: 'pan_img',
      aadhaarCard: 'aadhaar_img',
      photo: 'photo',
      bankProof: 'bank_proof_img',
      companyLogo: 'company_logo',
      referenceName1: 'ref_name_1',
      referenceRelation1: 'ref_relation_1',
      referenceMobile1: 'ref_mobile_1',
      referenceAddress1: 'ref_address_1',
      referenceName2: 'ref_name_2',
      referenceRelation2: 'ref_relation_2',
      referenceMobile2: 'ref_mobile_2',
      referenceAddress2: 'ref_address_2'
    };

    Object.keys(fieldMapping).forEach(key => {
      const value = formData[key];
      const apiField = fieldMapping[key];

      if (value !== null && value !== '' && value !== undefined) {
        if (['panCard', 'aadhaarCard', 'photo', 'bankProof', 'companyLogo'].includes(key)) {
          if (value instanceof File) {
            formDataToSend.append(apiField, value);
          }
        } else {
          formDataToSend.append(apiField, value);
        }
      }
    });

    formDataToSend.append('status', 'true');
    formDataToSend.append('is_active', 'true');

    try {
      setSubmitting(true);

      console.log('Submitting partner form data:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      const response = await api.post('partner-users/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        localStorage.setItem("partner_password", formData.password); // Store password temporarily
        setSuccess('Partner User Added Successfully!');
        resetForm();

        setTimeout(() => {
          navigate('/admin-dashboard/partner/active');
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      console.error('Error response:', err.response?.data);

      const errorMsg = err.response?.data;
      if (typeof errorMsg === 'object') {
        const errors = [];
        for (const [field, messages] of Object.entries(errorMsg)) {
          if (Array.isArray(messages)) {
            errors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errors.push(`${field}: ${messages}`);
          } else if (typeof messages === 'object') {
            for (const [nestedField, nestedMessages] of Object.entries(messages)) {
              errors.push(`${field}.${nestedField}: ${Array.isArray(nestedMessages) ? nestedMessages.join(', ') : nestedMessages}`);
            }
          }
        }
        setError(errors.join('\n'));
      } else if (typeof errorMsg === 'string') {
        setError(errorMsg);
      } else {
        setError(err.message || 'Failed to submit form. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      aliasName: '',
      phoneNumber: '',
      alternativePhoneNumber: '',
      companyName: '',
      birthDate: '',
      partnerType: '',
      branch_inner_state: '',
      branch_inner_location: '',
      reportingTo: '',
      officeAddress: '',
      residentialAddress: '',
      aadhaarNumber: '',
      panNumber: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountType: '',
      rank: '',
      panCard: null,
      aadhaarCard: null,
      photo: null,
      bankProof: null,
      companyLogo: null,
      referenceName1: '',
      referenceRelation1: '',
      referenceMobile1: '',
      referenceAddress1: '',
      referenceName2: '',
      referenceRelation2: '',
      referenceMobile2: '',
      referenceAddress2: ''
    });

    setEmailAvailable(null);
    setEmailExistsIn([]);
    setError('');
    setSuccess('');
    setBranchInnerLocations([]);
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add Partner Details</h1>
              <p className="text-gray-600 mt-1">Fill in the details below to add a new partner user</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 text-sm font-medium">Error:</p>
              <p className="text-red-600 text-xs mt-1 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-600 text-sm font-medium">{success}</p>
              <p className="text-green-500 text-xs mt-1">Redirecting to active partner list...</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-700">Partner Information</h2>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Section 1: Login Credentials */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
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
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    minLength="6"
                    disabled={submitting}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Alias Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Alias Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aliasName"
                    value={formData.aliasName}
                    onChange={handleInputChange}
                    placeholder="Alias name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Alternative Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    name="alternativePhoneNumber"
                    value={formData.alternativePhoneNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Partner Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Partner Type</option>
                    {partnerTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.partner_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Rank */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rank
                  </label>
                  <input
                    type="text"
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    placeholder="Rank"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    max={formatDateForInput(new Date())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Branch & Reporting Details - UPDATED */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Branch & Reporting Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Branch Inner State - CHANGED */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
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
                        {state.name || state.state_name || state.state}
                      </option>
                    ))}
                  </select>
                  {branchInnerStates.length === 0 && !loading && (
                    <p className="text-xs text-amber-600 mt-1">
                      No branch inner states available
                    </p>
                  )}
                </div>

                {/* Branch Inner Location - CHANGED */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Branch Inner Location
                  </label>
                  <select
                    name="branch_inner_location"
                    value={formData.branch_inner_location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || !formData.branch_inner_state}
                  >
                    <option value="">
                      {!formData.branch_inner_state
                        ? 'Select Inner State First'
                        : branchInnerLocations.length === 0
                          ? 'No locations available'
                          : 'Select Branch Inner Location'}
                    </option>
                    {branchInnerLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name || location.location_name || location.location}
                      </option>
                    ))}
                  </select>
                  {formData.branchState && branchInnerLocations.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No branch inner locations found for this state
                    </p>
                  )}
                </div>

                {/* Reporting To */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
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
                      <option key={user.id} value={user.username || user.id}>
                        {user.full_name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Office Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Office Address
                  </label>
                  <textarea
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleInputChange}
                    placeholder="Office address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>

                {/* Residential Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Residential Address
                  </label>
                  <textarea
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleInputChange}
                    placeholder="Residential address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Government ID Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Government ID Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    placeholder="12-digit Aadhaar"
                    maxLength="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Bank Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bank Name
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bank_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting}
                  >
                    <option value="">Select Account Type</option>
                    {accountTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.account_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Account number"
                    maxLength="18"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="11-character IFSC"
                    maxLength="11"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 7: Document Uploads */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Uploads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    name="companyLogo"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, GIF (Max: 5MB)</p>
                  {formData.companyLogo && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.companyLogo.name}</p>
                  )}
                </div>

                {/* Photo */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, GIF (Max: 5MB)</p>
                  {formData.photo && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.photo.name}</p>
                  )}
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAN Card
                  </label>
                  <input
                    type="file"
                    name="panCard"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, PDF (Max: 5MB)</p>
                  {formData.panCard && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.panCard.name}</p>
                  )}
                </div>

                {/* Aadhaar Card */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhaar Card
                  </label>
                  <input
                    type="file"
                    name="aadhaarCard"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, PDF (Max: 5MB)</p>
                  {formData.aadhaarCard && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.aadhaarCard.name}</p>
                  )}
                </div>

                {/* Bank Proof */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bank Proof
                  </label>
                  <input
                    type="file"
                    name="bankProof"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, PDF (Max: 5MB)</p>
                  {formData.bankProof && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.bankProof.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 8: References */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                References
              </h3>

              {/* Reference 1 */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      name="referenceName1"
                      value={formData.referenceName1}
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
                      name="referenceRelation1"
                      value={formData.referenceRelation1}
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
                      name="referenceMobile1"
                      value={formData.referenceMobile1}
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
                      name="referenceAddress1"
                      value={formData.referenceAddress1}
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
                      name="referenceName2"
                      value={formData.referenceName2}
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
                      name="referenceRelation2"
                      value={formData.referenceRelation2}
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
                      name="referenceMobile2"
                      value={formData.referenceMobile2}
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
                      name="referenceAddress2"
                      value={formData.referenceAddress2}
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
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={submitting || emailAvailable === false || checkingEmail}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Partner...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Partner
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> indicates required fields
          </p>
          <p className="text-xs text-gray-400 mt-1">
            All uploaded documents should be clear and legible
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddPartner;