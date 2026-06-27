// // src/components/AdminDashboard/EmpMaster/AddEmployee.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../../../api';
// import { useNavigate } from 'react-router-dom';
// import {
//   UserPlus,
//   Building,
//   Briefcase,
//   User,
//   Key,
//   Mail,
//   Phone,
//   MapPin,
//   Home,
//   Calendar,
//   CreditCard,
//   FileText,
//   Image,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   AlertCircle,
//   Globe,
//   BanknoteIcon,
//   IdCard,
//   Smartphone,
//   Map
// } from 'lucide-react';

// const AddEmployee = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [usernameAvailable, setUsernameAvailable] = useState(null);
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [branchStates, setBranchStates] = useState([]);
//   const [branchLocations, setBranchLocations] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [accountTypes, setAccountTypes] = useState([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const [formData, setFormData] = useState({
//     // Login Credentials
//     username: '',
//     password: '',

//     // Basic Information
//     first_name: '',
//     last_name: '',
//     full_name: '',
//     date_of_birth: '',

//     // Contact Information
//     email: '',
//     office_email: '',
//     contact_info: '',
//     office_phone_number: '',

//     // Department & Designation
//     department: '',
//     designation: '',

//     // Address Information
//     present_address: '',
//     permanent_address: '',

//     // Branch Information
//     branch_state: '',
//     branch_location: '',

//     // Government Details
//     aadhar_number: '',
//     pan_number: '',

//     // Bank Details
//     account_number: '',
//     ifsc_code: '',
//     bank: '',
//     type_of_account: '',

//     // File Uploads (will be handled separately)
//     pan_card_upload: null,
//     aadhar_card_upload: null,
//     bank_proof_upload: null,
//     employee_image: null
//   });

//   // Check authentication on mount
//   useEffect(() => {
//     const token = localStorage.getItem('access');
//     if (!token) {
//       navigate('/');
//       return;
//     }
//     fetchInitialData();
//   }, [navigate]);

//   // Fetch all initial data
//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);

//       // Fetch all data in parallel
//       const [
//         deptResponse, 
//         statesResponse, 
//         banksResponse, 
//         accountTypesResponse
//       ] = await Promise.all([
//         api.get('departments-dropdown/', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
//         }),
//         api.get('branch-states/', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
//         }),
//         api.get('banks/', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
//         }),
//         api.get('typeofaccounts/', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
//         })
//       ]);

//       setDepartments(deptResponse.data);
//       setBranchStates(statesResponse.data);
//       setBanks(banksResponse.data);
//       setAccountTypes(accountTypesResponse.data);
//     } catch (err) {
//       console.error('Error fetching initial data:', err);
//       setError('Failed to load initial data. Please refresh the page and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch designations based on selected department
//   const fetchDesignations = async (departmentId) => {
//     if (!departmentId) {
//       setDesignations([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await api.get(`designations-by-department/${departmentId}/`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         }
//       });
//       setDesignations(response.data);
//     } catch (err) {
//       console.error('Error fetching designations:', err);
//       setError('Failed to load designations for this department.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch branch locations based on selected state
//   const fetchBranchLocations = async (stateId) => {
//     if (!stateId) {
//       setBranchLocations([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await api.get(`branch-locations/?branch_state=${stateId}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         }
//       });
//       setBranchLocations(response.data);
//     } catch (err) {
//       console.error('Error fetching branch locations:', err);
//       setError('Failed to load branch locations for this state.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Special handling for certain fields
//     if (name === 'username') {
//       setUsernameAvailable(null);
//     }

//     if (name === 'department') {
//       // Reset designation when department changes
//       setFormData(prev => ({
//         ...prev,
//         designation: ''
//       }));
//       fetchDesignations(value);
//     }

//     if (name === 'branch_state') {
//       // Reset location when state changes
//       setFormData(prev => ({
//         ...prev,
//         branch_location: ''
//       }));
//       fetchBranchLocations(value);
//     }

//     // Auto-generate full name from first and last name
//     if (name === 'first_name' || name === 'last_name') {
//       const firstName = name === 'first_name' ? value : formData.first_name;
//       const lastName = name === 'last_name' ? value : formData.last_name;
//       const fullName = `${firstName} ${lastName}`.trim();

//       setFormData(prev => ({
//         ...prev,
//         full_name: fullName
//       }));
//     }
//   };

//   // Handle file input changes
//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     if (files && files[0]) {
//       setFormData(prev => ({
//         ...prev,
//         [name]: files[0]
//       }));
//     }
//   };

//   // Check username availability
//   const checkUsername = async () => {
//     if (!formData.username.trim()) {
//       setUsernameAvailable(null);
//       return;
//     }

//     setCheckingUsername(true);
//     try {
//       const response = await api.post('check-username/', {
//         username: formData.username
//       }, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         }
//       });
//       setUsernameAvailable(!response.data.exists);
//     } catch (err) {
//       console.error('Error checking username:', err);
//       setUsernameAvailable(null);
//       setError('Failed to check username availability');
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   // Validate form data
//   const validateForm = () => {
//     // Required fields
//     const requiredFields = ['username', 'password', 'department', 'designation'];
//     for (let field of requiredFields) {
//       if (!formData[field]) {
//         setError(`Please fill in the ${field.replace('_', ' ')} field`);
//         return false;
//       }
//     }

//     // Check username availability
//     if (usernameAvailable === false) {
//       setError('Username is already taken. Please choose another.');
//       return false;
//     }

//     if (usernameAvailable === null) {
//       setError('Please check username availability first.');
//       return false;
//     }

//     // Validate Aadhar number (12 digits)
//     if (formData.aadhar_number && !/^\d{12}$/.test(formData.aadhar_number)) {
//       setError('Aadhar number must be 12 digits');
//       return false;
//     }

//     // Validate PAN number (10 characters)
//     if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
//       setError('Invalid PAN number format (e.g., ABCDE1234F)');
//       return false;
//     }

//     // Validate IFSC code (11 characters)
//     if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.toUpperCase())) {
//       setError('Invalid IFSC code format (e.g., SBIN0001234)');
//       return false;
//     }

//     // Validate phone numbers
//     const phoneRegex = /^\d{10}$/;
//     if (formData.contact_info && !phoneRegex.test(formData.contact_info.toString())) {
//       setError('Personal phone number must be 10 digits');
//       return false;
//     }

//     if (formData.office_phone_number && !phoneRegex.test(formData.office_phone_number)) {
//       setError('Office phone number must be 10 digits');
//       return false;
//     }

//     return true;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!validateForm()) {
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // Create FormData for file uploads
//       const formDataToSend = new FormData();

//       // Append all text fields
//       Object.keys(formData).forEach(key => {
//         const value = formData[key];

//         // Skip file fields (they'll be appended separately)
//         if (['pan_card_upload', 'aadhar_card_upload', 'bank_proof_upload', 'employee_image'].includes(key)) {
//           return;
//         }

//         if (value !== null && value !== undefined && value !== '') {
//           formDataToSend.append(key, value);
//         }
//       });

//       // Append file fields if they exist
//       if (formData.employee_image instanceof File) {
//         formDataToSend.append('employee_image', formData.employee_image);
//       }
//       if (formData.pan_card_upload instanceof File) {
//         formDataToSend.append('pan_card_upload', formData.pan_card_upload);
//       }
//       if (formData.aadhar_card_upload instanceof File) {
//         formDataToSend.append('aadhar_card_upload', formData.aadhar_card_upload);
//       }
//       if (formData.bank_proof_upload instanceof File) {
//         formDataToSend.append('bank_proof_upload', formData.bank_proof_upload);
//       }

//       // Send data to API
//       const response = await api.post('users/', formDataToSend, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access')}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       if (response.data) {
//         setSuccess('Employee added successfully!');
//         resetForm();
//         setTimeout(() => {
//           setSuccess('');
//           // Optional: Navigate to employee list
//           // navigate('/admin/employees');
//         }, 3000);
//       }
//     } catch (err) {
//       console.error('Error adding employee:', err);

//       // Handle validation errors from backend
//       if (err.response?.data) {
//         const errorData = err.response.data;

//         // Handle nested error objects
//         if (typeof errorData === 'object') {
//           const errorMessages = [];
//           Object.keys(errorData).forEach(key => {
//             if (Array.isArray(errorData[key])) {
//               errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
//             } else {
//               errorMessages.push(`${key}: ${errorData[key]}`);
//             }
//           });
//           setError(errorMessages.join('\n'));
//         } else if (typeof errorData === 'string') {
//           setError(errorData);
//         } else {
//           setError('Failed to add employee. Please check your input and try again.');
//         }
//       } else {
//         setError('Failed to add employee. Please try again.');
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       username: '',
//       password: '',
//       first_name: '',
//       last_name: '',
//       full_name: '',
//       date_of_birth: '',
//       email: '',
//       office_email: '',
//       contact_info: '',
//       office_phone_number: '',
//       department: '',
//       designation: '',
//       present_address: '',
//       permanent_address: '',
//       branch_state: '',
//       branch_location: '',
//       aadhar_number: '',
//       pan_number: '',
//       account_number: '',
//       ifsc_code: '',
//       bank: '',
//       type_of_account: '',
//       pan_card_upload: null,
//       aadhar_card_upload: null,
//       bank_proof_upload: null,
//       employee_image: null
//     });

//     setUsernameAvailable(null);
//     setDesignations([]);
//     setBranchLocations([]);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
//               <UserPlus className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Employee</h1>
//               <p className="text-gray-600 mt-1">Fill in the details below to add a new employee to the system</p>
//             </div>
//           </div>
//         </div>

//         {/* Status Messages */}
//         {error && (
//           <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
//             <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//             <p className="text-red-600 text-sm font-medium whitespace-pre-line">{error}</p>
//           </div>
//         )}

//         {success && (
//           <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
//             <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-green-600 text-sm font-medium">{success}</p>
//               <p className="text-green-500 text-xs mt-1">Employee has been added successfully to the database.</p>
//             </div>
//           </div>
//         )}

//         {/* Form Container */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//           {/* Form Header */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//               <h2 className="text-lg font-semibold text-gray-700">Employee Information</h2>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-6">
//             {/* Section 1: Login Credentials */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Key className="w-5 h-5" />
//                 Login Credentials
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Username */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <User className="w-4 h-4" />
//                     Username *
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleChange}
//                       onBlur={checkUsername}
//                       placeholder="Enter username"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                       required
//                       disabled={submitting}
//                     />
//                     {checkingUsername && (
//                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                         <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
//                       </div>
//                     )}
//                     {usernameAvailable !== null && !checkingUsername && (
//                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                         {usernameAvailable ? (
//                           <CheckCircle className="w-5 h-5 text-green-500" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-red-500" />
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {usernameAvailable !== null && !checkingUsername && (
//                     <p className={`text-xs ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
//                       {usernameAvailable ? '✓ Username is available' : '✗ Username is already taken'}
//                     </p>
//                   )}
//                 </div>

//                 {/* Password */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Key className="w-4 h-4" />
//                     Password *
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Set password"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 2: Basic Information */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5" />
//                 Basic Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* First Name */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     First Name
//                   </label>
//                   <input
//                     type="text"
//                     name="first_name"
//                     value={formData.first_name}
//                     onChange={handleChange}
//                     placeholder="First name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Last Name */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     name="last_name"
//                     value={formData.last_name}
//                     onChange={handleChange}
//                     placeholder="Last name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Full Name (Auto-generated) */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Full Name (Auto-generated)
//                   </label>
//                   <input
//                     type="text"
//                     name="full_name"
//                     value={formData.full_name}
//                     onChange={handleChange}
//                     placeholder="Full name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
//                     disabled
//                   />
//                 </div>

//                 {/* Date of Birth */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Calendar className="w-4 h-4" />
//                     Date of Birth
//                   </label>
//                   <input
//                     type="date"
//                     name="date_of_birth"
//                     value={formData.date_of_birth}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 3: Contact Information */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Phone className="w-5 h-5" />
//                 Contact Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Personal Email */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Mail className="w-4 h-4" />
//                     Personal Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="personal@example.com"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Office Email */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Mail className="w-4 h-4" />
//                     Office Email
//                   </label>
//                   <input
//                     type="email"
//                     name="office_email"
//                     value={formData.office_email}
//                     onChange={handleChange}
//                     placeholder="office@company.com"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Personal Phone */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Smartphone className="w-4 h-4" />
//                     Personal Phone *
//                   </label>
//                   <input
//                     type="tel"
//                     name="contact_info"
//                     value={formData.contact_info}
//                     onChange={handleChange}
//                     placeholder="10-digit phone number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Office Phone */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Phone className="w-4 h-4" />
//                     Office Phone
//                   </label>
//                   <input
//                     type="tel"
//                     name="office_phone_number"
//                     value={formData.office_phone_number}
//                     onChange={handleChange}
//                     placeholder="10-digit office phone"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 4: Department & Designation */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Briefcase className="w-5 h-5" />
//                 Department & Designation
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Department */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Building className="w-4 h-4" />
//                     Department *
//                   </label>
//                   <select
//                     name="department"
//                     value={formData.department}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     required
//                     disabled={submitting || loading}
//                   >
//                     <option value="">Select Department</option>
//                     {departments.map(dept => (
//                       <option key={dept.id} value={dept.id}>
//                         {dept.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Designation */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Briefcase className="w-4 h-4" />
//                     Designation *
//                   </label>
//                   <select
//                     name="designation"
//                     value={formData.designation}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     required
//                     disabled={submitting || !formData.department || designations.length === 0}
//                   >
//                     <option value="">Select Designation</option>
//                     {designations.map(des => (
//                       <option key={des.id} value={des.id}>
//                         {des.name}
//                       </option>
//                     ))}
//                   </select>
//                   {formData.department && designations.length === 0 && !loading && (
//                     <p className="text-xs text-yellow-600">No designations available for this department</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Section 5: Address Information */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Home className="w-5 h-5" />
//                 Address Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Present Address */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Present Address
//                   </label>
//                   <textarea
//                     name="present_address"
//                     value={formData.present_address}
//                     onChange={handleChange}
//                     placeholder="Current residential address"
//                     rows="3"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Permanent Address */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Permanent Address
//                   </label>
//                   <textarea
//                     name="permanent_address"
//                     value={formData.permanent_address}
//                     onChange={handleChange}
//                     placeholder="Permanent residential address"
//                     rows="3"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 6: Branch Information */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Map className="w-5 h-5" />
//                 Branch Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Branch State */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Globe className="w-4 h-4" />
//                     Branch State
//                   </label>
//                   <select
//                     name="branch_state"
//                     value={formData.branch_state}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     disabled={submitting || loading}
//                   >
//                     <option value="">Select State</option>
//                     {branchStates.map(state => (
//                       <option key={state.id} value={state.id}>
//                         {state.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Branch Location */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <MapPin className="w-4 h-4" />
//                     Branch Location
//                   </label>
//                   <select
//                     name="branch_location"
//                     value={formData.branch_location}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     disabled={submitting || !formData.branch_state || branchLocations.length === 0}
//                   >
//                     <option value="">Select Location</option>
//                     {branchLocations.map(location => (
//                       <option key={location.id} value={location.id}>
//                         {location.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Section 7: Government & Bank Details */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <CreditCard className="w-5 h-5" />
//                 Government & Bank Details
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Aadhar Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <IdCard className="w-4 h-4" />
//                     Aadhar Number
//                   </label>
//                   <input
//                     type="text"
//                     name="aadhar_number"
//                     value={formData.aadhar_number}
//                     onChange={handleChange}
//                     placeholder="12-digit Aadhar number"
//                     maxLength="12"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* PAN Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <IdCard className="w-4 h-4" />
//                     PAN Number
//                   </label>
//                   <input
//                     type="text"
//                     name="pan_number"
//                     value={formData.pan_number}
//                     onChange={handleChange}
//                     placeholder="10-character PAN (e.g., ABCDE1234F)"
//                     maxLength="10"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Bank Name */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <BanknoteIcon className="w-4 h-4" />
//                     Bank Name
//                   </label>
//                   <select
//                     name="bank"
//                     value={formData.bank}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     disabled={submitting || loading}
//                   >
//                     <option value="">Select Bank</option>
//                     {banks.map(bank => (
//                       <option key={bank.id} value={bank.id}>
//                         {bank.bank_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Account Type */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Account Type
//                   </label>
//                   <select
//                     name="type_of_account"
//                     value={formData.type_of_account}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
//                     disabled={submitting || loading}
//                   >
//                     <option value="">Select Account Type</option>
//                     {accountTypes.map(type => (
//                       <option key={type.id} value={type.id}>
//                         {type.account_type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Account Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Account Number
//                   </label>
//                   <input
//                     type="text"
//                     name="account_number"
//                     value={formData.account_number}
//                     onChange={handleChange}
//                     placeholder="Bank account number"
//                     maxLength="20"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* IFSC Code */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     IFSC Code
//                   </label>
//                   <input
//                     type="text"
//                     name="ifsc_code"
//                     value={formData.ifsc_code}
//                     onChange={handleChange}
//                     placeholder="11-character IFSC (e.g., SBIN0001234)"
//                     maxLength="11"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 8: Document Uploads */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <FileText className="w-5 h-5" />
//                 Document Uploads
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Employee Photo */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Image className="w-4 h-4" />
//                     Employee Photo
//                   </label>
//                   <input
//                     type="file"
//                     name="employee_image"
//                     onChange={handleFileChange}
//                     accept="image/*"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     disabled={submitting}
//                   />
//                   {formData.employee_image && (
//                     <p className="text-xs text-green-600">✓ Selected: {formData.employee_image.name}</p>
//                   )}
//                 </div>

//                 {/* PAN Card */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     PAN Card (PDF/Image)
//                   </label>
//                   <input
//                     type="file"
//                     name="pan_card_upload"
//                     onChange={handleFileChange}
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     disabled={submitting}
//                   />
//                   {formData.pan_card_upload && (
//                     <p className="text-xs text-green-600">✓ Selected: {formData.pan_card_upload.name}</p>
//                   )}
//                 </div>

//                 {/* Aadhar Card */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Aadhar Card (PDF/Image)
//                   </label>
//                   <input
//                     type="file"
//                     name="aadhar_card_upload"
//                     onChange={handleFileChange}
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     disabled={submitting}
//                   />
//                   {formData.aadhar_card_upload && (
//                     <p className="text-xs text-green-600">✓ Selected: {formData.aadhar_card_upload.name}</p>
//                   )}
//                 </div>

//                 {/* Bank Proof */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Bank Proof (PDF/Image)
//                   </label>
//                   <input
//                     type="file"
//                     name="bank_proof_upload"
//                     onChange={handleFileChange}
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     disabled={submitting}
//                   />
//                   {formData.bank_proof_upload && (
//                     <p className="text-xs text-green-600">✓ Selected: {formData.bank_proof_upload.name}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Form Actions */}
//             <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
//                 disabled={submitting}
//               >
//                 Clear Form
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting || loading || usernameAvailable === false}
//                 className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Adding Employee...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="w-4 h-4" />
//                     Add Employee
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Information Box */}
//         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
//           <div className="flex items-start gap-3">veedhi | kurakulas
//             {/* <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" /> */}
//             {/* <div>
//               <h3 className="font-medium text-blue-700">Important Notes:</h3>
//               <ul className="text-sm text-blue-600 mt-1 space-y-1">
//                 <li>• Fields marked with * are required</li>
//                 <li>• Employee will be created with "employee" role by default</li>
//                 <li>• Password will be encrypted before storing in the database</li>
//                 <li>• Username must be unique across the system</li>
//                 <li>• Aadhar number must be 12 digits</li>
//                 <li>• PAN number must be 10 characters (e.g., ABCDE1234F)</li>
//                 <li>• IFSC code must be 11 characters (e.g., SBIN0001234)</li>
//                 <li>• Phone numbers must be 10 digits</li>
//                 <li>• File uploads accept PDF, JPG, JPEG, PNG formats</li>
//                 <li>• Maximum file size: 5MB per file</li>
//               </ul>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddEmployee;





// src/components/AdminDashboard/EmpMaster/AddEmployee.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Building,
  Briefcase,
  User,
  Key,
  Mail,
  Phone,
  MapPin,
  Home,
  Calendar,
  CreditCard,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Globe,
  BanknoteIcon,
  IdCard,
  Smartphone,
  Map,
  Users
} from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchStates, setBranchStates] = useState([]);
  const [branchLocations, setBranchLocations] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [employees, setEmployees] = useState([]); // NEW: For Reporting To dropdown
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Login Credentials
    username: '',
    password: '',

    // Basic Information
    first_name: '',
    last_name: '',
    full_name: '',
    date_of_birth: '',

    // Contact Information
    email: '',
    office_email: '',
    contact_info: '',
    office_phone_number: '',

    // Department & Designation
    department: '',
    designation: '',

    // Reporting To
    reportingTo: '', // NEW: Reporting To field

    // Address Information
    present_address: '',
    permanent_address: '',

    // Branch Information
    branch_inner_state: '',
    branch_inner_location: '',

    // Government Details
    aadhar_number: '',
    pan_number: '',

    // Bank Details
    account_number: '',
    ifsc_code: '',
    bank: '',
    type_of_account: '',

    // File Uploads (will be handled separately)
    pan_card_upload: null,
    aadhar_card_upload: null,
    bank_proof_upload: null,
    employee_image: null
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }
    fetchInitialData();
  }, [navigate]);

  // Fetch all initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        deptResponse,
        statesResponse,
        banksResponse,
        accountTypesResponse,
        employeesResponse // NEW: Fetch employees for Reporting To
      ] = await Promise.all([
        api.get('departments-dropdown/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        }),
        api.get('branch-inner-states/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        }),
        api.get('banks/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        }),
        api.get('typeofaccounts/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        }),
        // NEW: Fetch employees for Reporting To dropdown
        api.get('users/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        })
      ]);

      setDepartments(deptResponse.data);
      setBranchStates(statesResponse.data);
      setBanks(banksResponse.data);
      setAccountTypes(accountTypesResponse.data);
      setEmployees(employeesResponse.data || []); // NEW: Set employees data
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch designations based on selected department
  const fetchDesignations = async (departmentId) => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`designations-by-department/${departmentId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      setDesignations(response.data);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError('Failed to load designations for this department.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branch locations based on selected state
  const fetchBranchLocations = async (stateId) => {
    if (!stateId) {
      setBranchLocations([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('branch-inner-locations/', {
        params: { branch_inner_state: stateId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      setBranchLocations(response.data);
    } catch (err) {
      console.error('Error fetching branch locations:', err);
      setError('Failed to load branch locations for this state.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Special handling for certain fields
    if (name === 'username') {
      setUsernameAvailable(null);
    }

    if (name === 'department') {
      // Reset designation when department changes
      setFormData(prev => ({
        ...prev,
        designation: ''
      }));
      fetchDesignations(value);
    }

    if (name === 'branch_inner_state') {
      // Reset location when state changes
      setFormData(prev => ({
        ...prev,
        branch_inner_location: ''
      }));
      fetchBranchLocations(value);
    }

    // Auto-generate full name from first and last name
    if (name === 'first_name' || name === 'last_name') {
      const firstName = name === 'first_name' ? value : formData.first_name;
      const lastName = name === 'last_name' ? value : formData.last_name;
      const fullName = `${firstName} ${lastName}`.trim();

      setFormData(prev => ({
        ...prev,
        full_name: fullName
      }));
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  // Check username availability
  const checkUsername = async () => {
    if (!formData.username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await api.post('check-username/', {
        username: formData.username
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      setUsernameAvailable(!response.data.exists);
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameAvailable(null);
      setError('Failed to check username availability');
    } finally {
      setCheckingUsername(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    // Required fields
    const requiredFields = ['username', 'password', 'department', 'designation'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    // Check username availability
    if (usernameAvailable === false) {
      setError('Username is already taken. Please choose another.');
      return false;
    }

    if (usernameAvailable === null) {
      setError('Please check username availability first.');
      return false;
    }

    // Validate Aadhar number (12 digits)
    if (formData.aadhar_number && !/^\d{12}$/.test(formData.aadhar_number)) {
      setError('Aadhar number must be 12 digits');
      return false;
    }

    // Validate PAN number (10 characters)
    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
      setError('Invalid PAN number format (e.g., ABCDE1234F)');
      return false;
    }

    // Validate IFSC code (11 characters)
    if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.toUpperCase())) {
      setError('Invalid IFSC code format (e.g., SBIN0001234)');
      return false;
    }

    // Validate phone numbers
    const phoneRegex = /^\d{10}$/;
    if (formData.contact_info && !phoneRegex.test(formData.contact_info.toString())) {
      setError('Personal phone number must be 10 digits');
      return false;
    }

    if (formData.office_phone_number && !phoneRegex.test(formData.office_phone_number)) {
      setError('Office phone number must be 10 digits');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];

        // Skip file fields (they'll be appended separately)
        if (['pan_card_upload', 'aadhar_card_upload', 'bank_proof_upload', 'employee_image'].includes(key)) {
          return;
        }

        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      // Append file fields if they exist
      if (formData.employee_image instanceof File) {
        formDataToSend.append('employee_image', formData.employee_image);
      }
      if (formData.pan_card_upload instanceof File) {
        formDataToSend.append('pan_card_upload', formData.pan_card_upload);
      }
      if (formData.aadhar_card_upload instanceof File) {
        formDataToSend.append('aadhar_card_upload', formData.aadhar_card_upload);
      }
      if (formData.bank_proof_upload instanceof File) {
        formDataToSend.append('bank_proof_upload', formData.bank_proof_upload);
      }

      // Send data to API
      const response = await api.post('users/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        localStorage.setItem("emp_password", formData.password); // Store password temporarily for display
        setSuccess('Employee added successfully!');
        resetForm();
        setTimeout(() => {
          setSuccess('');
          // Optional: Navigate to employee list
          // navigate('/admin/employees');
        }, 3000);
      }
    } catch (err) {
      console.error('Error adding employee:', err);

      // Handle validation errors from backend
      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle nested error objects
        if (typeof errorData === 'object') {
          const errorMessages = [];
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${errorData[key]}`);
            }
          });
          setError(errorMessages.join('\n'));
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Failed to add employee. Please check your input and try again.');
        }
      } else {
        setError('Failed to add employee. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      full_name: '',
      date_of_birth: '',
      email: '',
      office_email: '',
      contact_info: '',
      office_phone_number: '',
      department: '',
      designation: '',
      reportingTo: '', // NEW: Reset reportingTo field
      present_address: '',
      permanent_address: '',
      branch_inner_state: '',
      branch_inner_location: '',
      aadhar_number: '',
      pan_number: '',
      account_number: '',
      ifsc_code: '',
      bank: '',
      type_of_account: '',
      pan_card_upload: null,
      aadhar_card_upload: null,
      bank_proof_upload: null,
      employee_image: null
    });

    setUsernameAvailable(null);
    setDesignations([]);
    setBranchLocations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Employee</h1>
              <p className="text-gray-600 mt-1">Fill in the details below to add a new employee to the system</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm font-medium whitespace-pre-line">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-600 text-sm font-medium">{success}</p>
              <p className="text-green-500 text-xs mt-1">Employee has been added successfully to the database.</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-700">Employee Information</h2>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Section 1: Login Credentials */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={checkUsername}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      required
                      disabled={submitting}
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                    {usernameAvailable !== null && !checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {usernameAvailable !== null && !checkingUsername && (
                    <p className={`text-xs ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {usernameAvailable ? '✓ Username is available' : '✗ Username is already taken'}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Set password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Full Name (Auto-generated) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name (Auto-generated)
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    disabled
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
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Personal Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="personal@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Office Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Office Email
                  </label>
                  <input
                    type="email"
                    name="office_email"
                    value={formData.office_email}
                    onChange={handleChange}
                    placeholder="office@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Personal Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Personal Phone *
                  </label>
                  <input
                    type="tel"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Office Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Office Phone
                  </label>
                  <input
                    type="tel"
                    name="office_phone_number"
                    value={formData.office_phone_number}
                    onChange={handleChange}
                    placeholder="10-digit office phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Department & Designation */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Department & Designation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    required
                    disabled={submitting || loading}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    required
                    disabled={submitting || !formData.department || designations.length === 0}
                  >
                    <option value="">Select Designation</option>
                    {designations.map(des => (
                      <option key={des.id} value={des.id}>
                        {des.name}
                      </option>
                    ))}
                  </select>
                  {formData.department && designations.length === 0 && !loading && (
                    <p className="text-xs text-yellow-600">No designations available for this department</p>
                  )}
                </div>
              </div>
            </div>

            {/* NEW SECTION: Reporting To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Reporting To
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reporting To */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Reporting To
                  </label>
                  <select
                    name="reportingTo"
                    value={formData.reportingTo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || loading}
                  >
                    <option value="">Select Reporting Manager</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.username}>
                        {employee.full_name || employee.username} ({employee.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Present Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Present Address
                  </label>
                  <textarea
                    name="present_address"
                    value={formData.present_address}
                    onChange={handleChange}
                    placeholder="Current residential address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>

                {/* Permanent Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    placeholder="Permanent residential address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Branch Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5" />
                Branch Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch State */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Branch State
                  </label>
                  <select
                    name="branch_inner_state"
                    value={formData.branch_inner_state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || loading}
                  >
                    <option value="">Select Branch State</option>
                    {branchStates.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Branch Location
                  </label>
                  <select
                    name="branch_inner_location"
                    value={formData.branch_inner_location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || !formData.branch_inner_state || branchLocations.length === 0}
                  >
                    <option value="">Select Branch Location</option>
                    {branchLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 7: Government & Bank Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Government & Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhar Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    placeholder="12-digit Aadhar number"
                    maxLength="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    placeholder="10-character PAN (e.g., ABCDE1234F)"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BanknoteIcon className="w-4 h-4" />
                    Bank Name
                  </label>
                  <select
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || loading}
                  >
                    <option value="">Select Bank</option>
                    {banks.map(bank => (
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
                    name="type_of_account"
                    value={formData.type_of_account}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={submitting || loading}
                  >
                    <option value="">Select Account Type</option>
                    {accountTypes.map(type => (
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
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="Bank account number"
                    maxLength="20"
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
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="11-character IFSC (e.g., SBIN0001234)"
                    maxLength="11"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={submitting}
                  />
                </div>

              </div>
            </div>

            {/* Section 8: Document Uploads */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Uploads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Photo */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Employee Photo
                  </label>
                  <input
                    type="file"
                    name="employee_image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.employee_image && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.employee_image.name}</p>
                  )}
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    PAN Card (PDF/Image)
                  </label>
                  <input
                    type="file"
                    name="pan_card_upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.pan_card_upload && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.pan_card_upload.name}</p>
                  )}
                </div>

                {/* Aadhar Card */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aadhar Card (PDF/Image)
                  </label>
                  <input
                    type="file"
                    name="aadhar_card_upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.aadhar_card_upload && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.aadhar_card_upload.name}</p>
                  )}
                </div>

                {/* Bank Proof */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bank Proof (PDF/Image)
                  </label>
                  <input
                    type="file"
                    name="bank_proof_upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {formData.bank_proof_upload && (
                    <p className="text-xs text-green-600">✓ Selected: {formData.bank_proof_upload.name}</p>
                  )}
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
                disabled={submitting || loading || usernameAvailable === false}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Employee...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Employee
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

export default AddEmployee;