import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const AddHealthInsurance = () => {
    const navigate = useNavigate();
    
    // Main form state
    const [formData, setFormData] = useState({
        customer_name: '',
        Phone_number: '',
        email_id: '',
        customer_age: '',
        state: '',
        location: '',
        sub_location: '',
        pincode: '',
        policy_name: '',
        no_person: '',
        individual_age: ''
    });

    // Policy details rows
    const [policyRows, setPolicyRows] = useState([
        {
            company_name: '',
            sum_assured: '',
            policy_premium: '',
            ins_start_date: '',
            ins_end_date: '',
            policy_no: ''
        }
    ]);

    // Dropdown data states
    const [states, setStates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [pinCodes, setPinCodes] = useState([]);
    const [policyTypes, setPolicyTypes] = useState([]);
    const [individualAges, setIndividualAges] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);

    // Store first available IDs for defaults
    const [defaultIds, setDefaultIds] = useState({
        individualAge: null,
        noPerson: null
    });

    // Loading states
    const [loading, setLoading] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState({
        states: false,
        locations: false,
        subLocations: false,
        pincodes: false,
        policyTypes: false,
        individualAges: false,
        familyMembers: false,
        insuranceCompanies: false
    });

    // Toast notification
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Show toast notification
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 4000);
    };

    // Fetch initial dropdown data
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setDropdownLoading(prev => ({ 
                ...prev, 
                states: true,
                policyTypes: true,
                insuranceCompanies: true
            }));
            
            // Fetch states
            const statesRes = await api.get('branch-states/');
            const statesData = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || [];
            setStates(statesData);

            // Fetch policy types (TypeOfPolicy)
            const policyTypesRes = await api.get('type-of-policy/');
            const policyTypesData = Array.isArray(policyTypesRes.data) ? policyTypesRes.data : policyTypesRes.data?.results || [];
            setPolicyTypes(policyTypesData.filter(policy => policy.status === true));

            // Fetch insurance companies
            const companiesRes = await api.get('insurance-company/');
            const companiesData = Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.results || [];
            setInsuranceCompanies(companiesData.filter(company => company.status === true));

            // Fetch individual ages
            const individualAgesRes = await api.get('health-insurance-age/');
            const individualAgesData = Array.isArray(individualAgesRes.data) ? individualAgesRes.data : individualAgesRes.data?.results || [];
            const activeIndividualAges = individualAgesData.filter(age => age.status === true);
            setIndividualAges(activeIndividualAges);
            
            // Store first individual age ID as default
            if (activeIndividualAges.length > 0) {
                setDefaultIds(prev => ({ ...prev, individualAge: activeIndividualAges[0].id }));
            }

            // Fetch family members (NumberOfPerson)
            const familyMembersRes = await api.get('number-of-person/');
            const familyMembersData = Array.isArray(familyMembersRes.data) ? familyMembersRes.data : familyMembersRes.data?.results || [];
            const activeFamilyMembers = familyMembersData.filter(member => member.status === true);
            setFamilyMembers(activeFamilyMembers);
            
            // Store first no person ID as default
            if (activeFamilyMembers.length > 0) {
                setDefaultIds(prev => ({ ...prev, noPerson: activeFamilyMembers[0].id }));
            }

            console.log('✅ Loaded initial data:', {
                states: statesData.length,
                policyTypes: policyTypesData.length,
                insuranceCompanies: companiesData.length,
                individualAges: activeIndividualAges.length,
                familyMembers: activeFamilyMembers.length,
                defaultIds
            });

            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false,
                policyTypes: false,
                insuranceCompanies: false
            }));

        } catch (error) {
            console.error('❌ Error fetching initial data:', error);
            showToast('error', 'Failed to load form data. Please refresh the page.');
            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false,
                policyTypes: false,
                insuranceCompanies: false
            }));
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format phone number input
        if (name === 'Phone_number') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        // Clear dependent fields when policy type changes
        if (name === 'policy_name') {
            const selectedPolicy = policyTypes.find(p => p.id == value);
            
            if (selectedPolicy) {
                // Auto-select appropriate default values based on policy type
                if (selectedPolicy.policy_name === 'Individual') {
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        individual_age: defaultIds.individualAge || '',
                        no_person: '' // Clear no_person for Individual policy
                    }));
                } else if (selectedPolicy.policy_name === 'Family Float') {
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        no_person: defaultIds.noPerson || '',
                        individual_age: '' // Clear individual_age for Family Float policy
                    }));
                } else {
                    // For other policy types, set both with defaults
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        individual_age: defaultIds.individualAge || '',
                        no_person: defaultIds.noPerson || ''
                    }));
                }
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle policy row changes
    const handlePolicyRowChange = (index, field, value) => {
        const updatedRows = [...policyRows];
        updatedRows[index][field] = value;
        
        // Convert date format for display
        if (field === 'ins_start_date' || field === 'ins_end_date') {
            if (value.includes('-')) {
                const [year, month, day] = value.split('-');
                updatedRows[index][field] = `${day}/${month}/${year}`;
            }
        }
        
        setPolicyRows(updatedRows);
    };

    // Add new policy row
    const addPolicyRow = () => {
        setPolicyRows([...policyRows, {
            company_name: '',
            sum_assured: '',
            policy_premium: '',
            ins_start_date: '',
            ins_end_date: '',
            policy_no: ''
        }]);
    };

    // Remove policy row
    const removePolicyRow = (index) => {
        if (policyRows.length > 1) {
            const updatedRows = policyRows.filter((_, i) => i !== index);
            setPolicyRows(updatedRows);
        }
    };

    // State change handler
    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            state: stateId,
            location: '',
            sub_location: '',
            pincode: ''
        }));
        
        setLocations([]);
        setSubLocations([]);
        setPinCodes([]);

        if (stateId) {
            try {
                setDropdownLoading(prev => ({ ...prev, locations: true }));
                const response = await api.get(`branch-locations/?branch_state=${stateId}`);
                const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
                setLocations(data);
                console.log(`✅ Loaded ${data.length} locations for state ID: ${stateId}`);
                setDropdownLoading(prev => ({ ...prev, locations: false }));
            } catch (error) {
                console.error('❌ Error fetching locations:', error);
                showToast('error', 'Failed to load locations');
                setDropdownLoading(prev => ({ ...prev, locations: false }));
            }
        }
    };

    // Location change handler
    const handleLocationChange = async (e) => {
        const locationId = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            location: locationId,
            sub_location: '',
            pincode: ''
        }));
        
        setSubLocations([]);
        setPinCodes([]);

        if (locationId) {
            try {
                setDropdownLoading(prev => ({ ...prev, subLocations: true }));
                const response = await api.get(`sublocations/?branch_location=${locationId}`);
                const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
                setSubLocations(data);
                console.log(`✅ Loaded ${data.length} sub-locations for location ID: ${locationId}`);
                setDropdownLoading(prev => ({ ...prev, subLocations: false }));
            } catch (error) {
                console.error('❌ Error fetching sub locations:', error);
                showToast('error', 'Failed to load sub locations');
                setDropdownLoading(prev => ({ ...prev, subLocations: false }));
            }
        }
    };

    // Sub-location change handler
    const handleSubLocationChange = async (e) => {
        const subLocationId = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            sub_location: subLocationId,
            pincode: ''
        }));
        
        setPinCodes([]);

        if (subLocationId) {
            try {
                setDropdownLoading(prev => ({ ...prev, pincodes: true }));
                const response = await api.get(`pincodes/?sub_location=${subLocationId}`);
                const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
                setPinCodes(data);
                console.log(`✅ Loaded ${data.length} pincodes for sub-location ID: ${subLocationId}`);
                setDropdownLoading(prev => ({ ...prev, pincodes: false }));
            } catch (error) {
                console.error('❌ Error fetching PIN codes:', error);
                showToast('error', 'Failed to load PIN codes');
                setDropdownLoading(prev => ({ ...prev, pincodes: false }));
            }
        }
    };

    // Convert date format for submission
    const convertDateForSubmit = (dateStr) => {
        if (!dateStr) return null;
        
        // If already in YYYY-MM-DD format
        if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
            return dateStr;
        }
        
        // Convert from DD/MM/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const fullYear = year.length === 2 ? `20${year}` : year;
            return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return dateStr;
    };

    // Handle date input for policy rows
    const handleDateInput = (e, index, field) => {
        let value = e.target.value.replace(/[^0-9/]/g, '').substring(0, 10);
        
        // Auto-add slashes
        if (value.length === 2 || value.length === 5) {
            value += '/';
        }
        
        handlePolicyRowChange(index, field, value);
    };

    // Form validation
    const validateForm = () => {
        const requiredFields = [
            'customer_name', 'Phone_number', 'state', 
            'location', 'sub_location', 'pincode', 'policy_name'
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                showToast('warning', `Please fill in ${field.replace(/_/g, ' ')}`);
                return false;
            }
        }

        // Validate phone number
        if (formData.Phone_number.length !== 10) {
            showToast('warning', 'Phone number must be 10 digits');
            return false;
        }

        // Validate email if provided
        if (formData.email_id && !/\S+@\S+\.\S+/.test(formData.email_id)) {
            showToast('warning', 'Please enter a valid email address');
            return false;
        }

        // Validate customer age if provided
        if (formData.customer_age) {
            const age = parseInt(formData.customer_age);
            if (isNaN(age) || age < 0) {
                showToast('warning', 'Customer age must be a positive number');
                return false;
            }
        }

        // FRONTEND-ONLY LOGIC: Always ensure we have values for required backend fields
        const selectedPolicy = policyTypes.find(p => p.id == formData.policy_name);
        if (selectedPolicy) {
            if (selectedPolicy.policy_name === 'Individual' && !formData.individual_age) {
                // Auto-select first available individual age
                if (defaultIds.individualAge) {
                    setFormData(prev => ({ ...prev, individual_age: defaultIds.individualAge }));
                    console.log('✅ Auto-selected individual age:', defaultIds.individualAge);
                } else {
                    showToast('warning', 'Please select individual age');
                    return false;
                }
            }
            
            if (selectedPolicy.policy_name === 'Family Float' && !formData.no_person) {
                // Auto-select first available number of persons
                if (defaultIds.noPerson) {
                    setFormData(prev => ({ ...prev, no_person: defaultIds.noPerson }));
                    console.log('✅ Auto-selected number of persons:', defaultIds.noPerson);
                } else {
                    showToast('warning', 'Please select number of persons');
                    return false;
                }
            }
        }

        return true;
    };

    // Validate policy data
    const validatePolicyData = () => {
        let hasValidPolicy = false;
        
        for (const policy of policyRows) {
            // All fields are required for each policy row
            const requiredFields = ['company_name', 'sum_assured', 'policy_premium', 'ins_start_date', 'ins_end_date', 'policy_no'];
            
            for (const field of requiredFields) {
                if (!policy[field]) {
                    showToast('warning', `Please fill in ${field.replace(/_/g, ' ')} for all policies`);
                    return false;
                }
            }
            
            hasValidPolicy = true;
        }
        
        if (!hasValidPolicy) {
            showToast('warning', 'Please add at least one policy');
            return false;
        }
        
        return true;
    };

    // Get selected policy name
    const getSelectedPolicyName = () => {
        const policy = policyTypes.find(p => p.id == formData.policy_name);
        return policy ? policy.policy_name : '';
    };

    // Get smart default values for backend requirements
    const getSmartDefaults = () => {
        const selectedPolicy = policyTypes.find(p => p.id == formData.policy_name);
        let smartNoPerson = formData.no_person;
        let smartIndividualAge = formData.individual_age;
        
        if (selectedPolicy) {
            if (selectedPolicy.policy_name === 'Individual') {
                // For Individual policy, use a meaningful no_person value
                smartNoPerson = defaultIds.noPerson || '1';
            } else if (selectedPolicy.policy_name === 'Family Float') {
                // For Family Float policy, use a meaningful individual_age value
                smartIndividualAge = defaultIds.individualAge || '1';
            }
        }
        
        // Ensure both fields have values
        if (!smartNoPerson && defaultIds.noPerson) {
            smartNoPerson = defaultIds.noPerson;
        }
        
        if (!smartIndividualAge && defaultIds.individualAge) {
            smartIndividualAge = defaultIds.individualAge;
        }
        
        return { smartNoPerson, smartIndividualAge };
    };

    // Main submission function - FRONTEND-ONLY SOLUTION
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (!validatePolicyData()) {
            return;
        }

        setLoading(true);
        showToast('info', 'Starting submission process...');

        try {
            // STEP 1: Submit main Health Insurance data
            console.log('🚀 STEP 1: Submitting main health insurance data...');
            
            // Get smart defaults for backend requirements
            const { smartNoPerson, smartIndividualAge } = getSmartDefaults();
            
            // Prepare data for backend - always include both required fields
            const mainFormData = {
                customer_name: formData.customer_name,
                Phone_number: formData.Phone_number,
                email_id: formData.email_id || null,
                customer_age: formData.customer_age ? parseInt(formData.customer_age) : null,
                state: parseInt(formData.state),
                location: parseInt(formData.location),
                sub_location: parseInt(formData.sub_location),
                pincode: parseInt(formData.pincode),
                policy_name: parseInt(formData.policy_name),
                // Always send both required fields with meaningful values
                no_person: parseInt(smartNoPerson),
                individual_age: parseInt(smartIndividualAge)
            };

            console.log('📤 POST to health-add-insurance/:', mainFormData);
            console.log('📝 Smart defaults used:', { 
                no_person: smartNoPerson, 
                individual_age: smartIndividualAge,
                policy_type: getSelectedPolicyName()
            });
            
            const mainResponse = await api.post('health-add-insurance/', mainFormData);
            const insuranceId = mainResponse.data.id;
            
            console.log('✅ Main health insurance created with ID:', insuranceId);
            showToast('success', `Main insurance saved (ID: ${insuranceId})`);

            // STEP 2: Submit policy details with foreign key reference
            console.log(`🚀 STEP 2: Submitting ${policyRows.length} policy detail(s)...`);
            showToast('info', `Saving policy details...`);
            
            let policyCount = 0;
            for (const policy of policyRows) {
                try {
                    const policyData = {
                        health: insuranceId, // Foreign key to HealthInsurance
                        company_name: parseInt(policy.company_name),
                        sum_assured: policy.sum_assured,
                        policy_premium: policy.policy_premium,
                        ins_start_date: convertDateForSubmit(policy.ins_start_date),
                        ins_last_date: convertDateForSubmit(policy.ins_end_date),
                        policy_no: policy.policy_no
                    };

                    console.log(`📤 Submitting policy detail:`, policyData);
                    await api.post('health-insurance-details/', policyData);
                    policyCount++;
                    console.log(`✅ Policy ${policyCount} saved`);
                } catch (policyError) {
                    console.error(`❌ Failed to save policy:`, policyError);
                    if (policyError.response?.data) {
                        console.error('Validation errors:', policyError.response.data);
                    }
                    showToast('error', `Failed to save policy ${policyCount + 1}`);
                }
            }
            
            // FINAL SUCCESS MESSAGE
            const successMessage = `
✅ Health Insurance Application Submitted Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Summary:
• Insurance ID: ${insuranceId}
• Customer: ${formData.customer_name}
• Policy Type: ${getSelectedPolicyName()}
• Policies: ${policyCount} saved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All data has been saved to the database.
            `;
            
            console.log('🎉 SUBMISSION COMPLETE!');
            showToast('success', successMessage);

            // Reset form after 3 seconds and navigate
            setTimeout(() => {
                resetForm();
                navigate('/admin-dashboard/health/insurance-list');
            }, 3000);

        } catch (error) {
            console.error('❌ SUBMISSION FAILED:', error);
            
            let errorMessage = 'Submission failed. ';
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                
                if (error.response.status === 400) {
                    errorMessage += 'Validation errors: ';
                    if (error.response.data) {
                        Object.keys(error.response.data).forEach(field => {
                            errorMessage += `\n• ${field}: ${error.response.data[field]}`;
                        });
                    }
                } else if (error.response.status === 401) {
                    errorMessage += 'Authentication failed. Please login again.';
                } else if (error.response.status === 403) {
                    errorMessage += 'Permission denied.';
                } else if (error.response.status === 404) {
                    errorMessage += 'Endpoint not found. Check if health insurance endpoints exist.';
                } else if (error.response.status === 500) {
                    errorMessage += 'Server error. Please try again.';
                } else {
                    errorMessage += `Error ${error.response.status}`;
                }
            } else {
                errorMessage += 'Network error. Please check your connection.';
            }
            
            showToast('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            customer_name: '',
            Phone_number: '',
            email_id: '',
            customer_age: '',
            state: '',
            location: '',
            sub_location: '',
            pincode: '',
            policy_name: '',
            no_person: '',
            individual_age: ''
        });
        
        setPolicyRows([{
            company_name: '',
            sum_assured: '',
            policy_premium: '',
            ins_start_date: '',
            ins_end_date: '',
            policy_no: ''
        }]);
        
        setLocations([]);
        setSubLocations([]);
        setPinCodes([]);
    };

    // Get display text for dropdowns
    const getDisplayValue = (id, options, fieldName = 'name') => {
        if (!id) return '';
        const option = options.find(opt => opt.id == id);
        return option ? option[fieldName] || option.policy_name || option.company_name || option.individual_age || option.no_person : '';
    };

    return (
        <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
                <div className="layout-page">
                    <div className="content-wrapper">
                        {/* Toast Notification */}
                        {toast.show && (
                            <div className={`toast-container position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999 }}>
                                <div className={`toast show bg-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : 'info'} text-white`}>
                                    <div className="toast-header">
                                        <strong className="me-auto text-capitalize">{toast.type}</strong>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setToast({ show: false, type: '', message: '' })}
                                        ></button>
                                    </div>
                                    <div className="toast-body" style={{ whiteSpace: 'pre-line' }}>
                                        {toast.message}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="container-xxl flex-grow-1 container-p-y">
                            <div className="row">
                                <div className="col-xl">
                                    <div className="card mb-6">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Add Health Insurance</h5>
                                            <div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate('/admin-dashboard/health/insurance-list')}
                                                    disabled={loading}
                                                >
                                                    <i className="bx bx-arrow-back me-1"></i> Back to List
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleSubmit}>
                                                {/* Customer Name */}
                                                <div className="row mt-2">
                                                    <div className="col-md-12">
                                                        <label className="form-label" htmlFor="customer_name">
                                                            Customer Name <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-user"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="customer_name"
                                                                id="customer_name"
                                                                placeholder="Customer Name"
                                                                value={formData.customer_name}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phone and Email */}
                                                <div className="row mt-2">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="Phone_number">
                                                            Phone No <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-phone"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                id="Phone_number"
                                                                name="Phone_number"
                                                                className="form-control"
                                                                placeholder="658 799 8941"
                                                                value={formData.Phone_number}
                                                                onChange={handleInputChange}
                                                                maxLength="10"
                                                                pattern="[0-9]{10}"
                                                                required
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="email_id">
                                                            Email
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-envelope"></i>
                                                            </span>
                                                            <input
                                                                type="email"
                                                                name="email_id"
                                                                id="email_id"
                                                                className="form-control"
                                                                placeholder="user@example.com"
                                                                value={formData.email_id}
                                                                onChange={handleInputChange}
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Age and State */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="customer_age">
                                                            Age
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-user"></i>
                                                            </span>
                                                            <input
                                                                type="number"
                                                                id="customer_age"
                                                                name="customer_age"
                                                                className="form-control"
                                                                min="0"
                                                                placeholder="Enter age"
                                                                value={formData.customer_age}
                                                                onChange={handleInputChange}
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="state">
                                                            State <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-map-alt"></i>
                                                            </span>
                                                            <select
                                                                id="state"
                                                                name="state"
                                                                className="form-select"
                                                                value={formData.state}
                                                                onChange={handleStateChange}
                                                                required
                                                                disabled={loading || dropdownLoading.states}
                                                            >
                                                                <option value="">Select State</option>
                                                                {states.map(state => (
                                                                    <option key={state.id} value={state.id}>
                                                                        {state.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location and Sub Location */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="location">
                                                            Location <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-map"></i>
                                                            </span>
                                                            <select
                                                                id="location"
                                                                name="location"
                                                                className="form-select"
                                                                value={formData.location}
                                                                onChange={handleLocationChange}
                                                                disabled={!formData.state || loading || dropdownLoading.locations}
                                                                required
                                                            >
                                                                <option value="">Select Location</option>
                                                                {locations.map(location => (
                                                                    <option key={location.id} value={location.id}>
                                                                        {location.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="sub_location">
                                                            Sub Location <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-map-pin"></i>
                                                            </span>
                                                            <select
                                                                id="sub_location"
                                                                name="sub_location"
                                                                className="form-select"
                                                                value={formData.sub_location}
                                                                onChange={handleSubLocationChange}
                                                                disabled={!formData.location || loading || dropdownLoading.subLocations}
                                                                required
                                                            >
                                                                <option value="">Select Sub Location</option>
                                                                {subLocations.map(subLocation => (
                                                                    <option key={subLocation.id} value={subLocation.id}>
                                                                        {subLocation.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* PIN Code and Policy Type */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="pincode">
                                                            PIN Code <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-mail-send"></i>
                                                            </span>
                                                            <select
                                                                id="pincode"
                                                                name="pincode"
                                                                className="form-select"
                                                                value={formData.pincode}
                                                                onChange={handleInputChange}
                                                                disabled={!formData.sub_location || loading || dropdownLoading.pincodes}
                                                                required
                                                            >
                                                                <option value="">Select PIN Code</option>
                                                                {pinCodes.map(pinCode => (
                                                                    <option key={pinCode.id} value={pinCode.id}>
                                                                        {pinCode.pincode}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="policy_name">
                                                            Type Of Policy <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-file"></i>
                                                            </span>
                                                            <select
                                                                id="policy_name"
                                                                name="policy_name"
                                                                className="form-select"
                                                                value={formData.policy_name}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={loading || dropdownLoading.policyTypes}
                                                            >
                                                                <option value="">Select Type Of Policy</option>
                                                                {policyTypes.map(policy => (
                                                                    <option key={policy.id} value={policy.id}>
                                                                        {policy.policy_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Individual Age and Family Members - Auto-filled based on policy type */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="individual_age">
                                                            Individual Age {getSelectedPolicyName() === 'Individual' && <span className="text-danger">*</span>}
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-user"></i>
                                                            </span>
                                                            <select
                                                                id="individual_age"
                                                                name="individual_age"
                                                                className="form-select"
                                                                value={formData.individual_age}
                                                                onChange={handleInputChange}
                                                                disabled={loading || dropdownLoading.individualAges}
                                                            >
                                                                <option value="">Select Individual Age</option>
                                                                {individualAges.map(age => (
                                                                    <option key={age.id} value={age.id}>
                                                                        {age.individual_age}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {getSelectedPolicyName() === 'Individual' && !formData.individual_age && (
                                                            <small className="text-warning">
                                                                Will auto-select default value for Individual policy
                                                            </small>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="no_person">
                                                            Number Of Persons {getSelectedPolicyName() === 'Family Float' && <span className="text-danger">*</span>}
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-group"></i>
                                                            </span>
                                                            <select
                                                                id="no_person"
                                                                name="no_person"
                                                                className="form-select"
                                                                value={formData.no_person}
                                                                onChange={handleInputChange}
                                                                disabled={loading || dropdownLoading.familyMembers}
                                                            >
                                                                <option value="">Select Number Of Person</option>
                                                                {familyMembers.map(member => (
                                                                    <option key={member.id} value={member.id}>
                                                                        {member.no_person}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {getSelectedPolicyName() === 'Family Float' && !formData.no_person && (
                                                            <small className="text-warning">
                                                                Will auto-select default value for Family Float policy
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hidden field info - Show what will be submitted */}
                                                {(formData.policy_name && (!formData.individual_age || !formData.no_person)) && (
                                                    <div className="row mt-2">
                                                        <div className="col-md-12">
                                                            <div className="alert alert-info">
                                                                <small>
                                                                    <i className="bx bx-info-circle me-1"></i>
                                                                    <strong>Note:</strong> Backend requires both fields. {!formData.individual_age && "Individual Age"} {!formData.individual_age && !formData.no_person && "and "} {!formData.no_person && "Number of Persons"} will be auto-filled with default values for submission.
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Policy Details Table */}
                                                <div className="row mt-5">
                                                    <h5>Policy Details</h5>
                                                    <p className="text-muted">Will be linked to this health insurance application</p>
                                                    <div className="col-md-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered">
                                                                <thead className="table-dark">
                                                                    <tr>
                                                                        <th>Company Name <span className="text-danger">*</span></th>
                                                                        <th>Sum Assured <span className="text-danger">*</span></th>
                                                                        <th>Policy Premium <span className="text-danger">*</span></th>
                                                                        <th>Insurance Start Date <span className="text-danger">*</span></th>
                                                                        <th>Insurance End Date <span className="text-danger">*</span></th>
                                                                        <th>Policy No <span className="text-danger">*</span></th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {policyRows.map((row, index) => (
                                                                        <tr key={`policy-${index}`}>
                                                                            <td>
                                                                                <select
                                                                                    className="form-select"
                                                                                    value={row.company_name}
                                                                                    onChange={(e) => handlePolicyRowChange(index, 'company_name', e.target.value)}
                                                                                    required
                                                                                    disabled={loading || dropdownLoading.insuranceCompanies}
                                                                                >
                                                                                    <option value="">Select Company Name</option>
                                                                                    {insuranceCompanies.map(company => (
                                                                                        <option key={company.id} value={company.id}>
                                                                                            {company.company_name}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="Sum Assured"
                                                                                    value={row.sum_assured}
                                                                                    onChange={(e) => handlePolicyRowChange(index, 'sum_assured', e.target.value)}
                                                                                    required
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="Policy Premium"
                                                                                    value={row.policy_premium}
                                                                                    onChange={(e) => handlePolicyRowChange(index, 'policy_premium', e.target.value)}
                                                                                    required
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="DD/MM/YYYY"
                                                                                    value={row.ins_start_date}
                                                                                    onChange={(e) => handleDateInput(e, index, 'ins_start_date')}
                                                                                    maxLength="10"
                                                                                    required
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="DD/MM/YYYY"
                                                                                    value={row.ins_end_date}
                                                                                    onChange={(e) => handleDateInput(e, index, 'ins_end_date')}
                                                                                    maxLength="10"
                                                                                    required
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="Policy Number"
                                                                                    value={row.policy_no}
                                                                                    onChange={(e) => handlePolicyRowChange(index, 'policy_no', e.target.value)}
                                                                                    required
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                {index === policyRows.length - 1 ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-primary btn-sm"
                                                                                        onClick={addPolicyRow}
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <i className="bx bx-plus me-1"></i> Add
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-danger btn-sm"
                                                                                        onClick={() => removePolicyRow(index)}
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <i className="bx bx-trash me-1"></i> Delete
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="text-end mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary me-2"
                                                        onClick={() => navigate('/admin-dashboard/health/insurance-list')}
                                                        disabled={loading}
                                                    >
                                                        <i className="bx bx-arrow-back me-1"></i> Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bx bx-check me-1"></i> Submit Health Insurance
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
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
};

export default AddHealthInsurance;