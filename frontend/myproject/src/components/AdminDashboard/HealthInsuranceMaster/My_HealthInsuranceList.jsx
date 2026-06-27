import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

// Edit Modal Component
const EditHealthInsuranceModal = ({ 
    show, 
    onClose, 
    insuranceId, 
    onUpdate,
    initialData 
}) => {
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

    // Dropdown data states
    const [states, setStates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [pinCodes, setPinCodes] = useState([]);
    const [policyTypes, setPolicyTypes] = useState([]);
    const [individualAges, setIndividualAges] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);

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
        familyMembers: false
    });

    // Toast notification (for modal)
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Show toast notification
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 4000);
    };

    // Fetch initial data when modal opens
    useEffect(() => {
        if (show) {
            fetchInitialData();
            if (initialData) {
                loadInsuranceData(initialData);
            } else if (insuranceId) {
                fetchInsuranceData();
            }
        }
    }, [show, insuranceId, initialData]);

    const fetchInitialData = async () => {
        try {
            setDropdownLoading(prev => ({ 
                ...prev, 
                states: true,
                policyTypes: true
            }));
            
            // Fetch states
            const statesRes = await api.get('branch-states/');
            const statesData = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || [];
            setStates(statesData);

            // Fetch policy types (TypeOfPolicy)
            const policyTypesRes = await api.get('type-of-policy/');
            const policyTypesData = Array.isArray(policyTypesRes.data) ? policyTypesRes.data : policyTypesRes.data?.results || [];
            setPolicyTypes(policyTypesData.filter(policy => policy.status === true));

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

            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false,
                policyTypes: false
            }));

        } catch (error) {
            console.error('❌ Error fetching initial data:', error);
            showToast('error', 'Failed to load form data.');
            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false,
                policyTypes: false
            }));
        }
    };

    const fetchInsuranceData = async () => {
        if (!insuranceId) return;
        
        try {
            setLoading(true);
            const response = await api.get(`health-add-insurance/${insuranceId}/`);
            loadInsuranceData(response.data);
        } catch (error) {
            console.error('❌ Error fetching insurance data:', error);
            showToast('error', 'Failed to load insurance data.');
        } finally {
            setLoading(false);
        }
    };

    const loadInsuranceData = (data) => {
        // Set main form data
        setFormData({
            customer_name: data.customer_name || '',
            Phone_number: data.Phone_number || '',
            email_id: data.email_id || '',
            customer_age: data.customer_age || '',
            state: data.state || '',
            location: data.location || '',
            sub_location: data.sub_location || '',
            pincode: data.pincode || '',
            policy_name: data.policy_name || '',
            no_person: data.no_person || '',
            individual_age: data.individual_age || ''
        });

        // Load dependent dropdowns if state/location/sub_location exist
        if (data.state) {
            fetchLocations(data.state);
        }
        if (data.location) {
            fetchSubLocations(data.location);
        }
        if (data.sub_location) {
            fetchPinCodes(data.sub_location);
        }
    };

    const fetchLocations = async (stateId) => {
        try {
            setDropdownLoading(prev => ({ ...prev, locations: true }));
            const response = await api.get(`branch-locations/?branch_state=${stateId}`);
            const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setLocations(data);
            setDropdownLoading(prev => ({ ...prev, locations: false }));
        } catch (error) {
            console.error('❌ Error fetching locations:', error);
            setDropdownLoading(prev => ({ ...prev, locations: false }));
        }
    };

    const fetchSubLocations = async (locationId) => {
        try {
            setDropdownLoading(prev => ({ ...prev, subLocations: true }));
            const response = await api.get(`sublocations/?branch_location=${locationId}`);
            const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setSubLocations(data);
            setDropdownLoading(prev => ({ ...prev, subLocations: false }));
        } catch (error) {
            console.error('❌ Error fetching sub locations:', error);
            setDropdownLoading(prev => ({ ...prev, subLocations: false }));
        }
    };

    const fetchPinCodes = async (subLocationId) => {
        try {
            setDropdownLoading(prev => ({ ...prev, pincodes: true }));
            const response = await api.get(`pincodes/?sub_location=${subLocationId}`);
            const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setPinCodes(data);
            setDropdownLoading(prev => ({ ...prev, pincodes: false }));
        } catch (error) {
            console.error('❌ Error fetching PIN codes:', error);
            setDropdownLoading(prev => ({ ...prev, pincodes: false }));
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
                if (selectedPolicy.policy_name === 'Individual') {
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        individual_age: defaultIds.individualAge || '',
                        no_person: ''
                    }));
                } else if (selectedPolicy.policy_name === 'Family Float') {
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        no_person: defaultIds.noPerson || '',
                        individual_age: ''
                    }));
                } else {
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
            await fetchLocations(stateId);
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
            await fetchSubLocations(locationId);
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
            await fetchPinCodes(subLocationId);
        }
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

        if (formData.Phone_number.length !== 10) {
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

        setLoading(true);
        showToast('info', 'Updating health insurance...');

        try {
            // Prepare data for update
            const updateData = {
                customer_name: formData.customer_name,
                Phone_number: formData.Phone_number,
                email_id: formData.email_id || null,
                customer_age: formData.customer_age ? parseInt(formData.customer_age) : null,
                state: parseInt(formData.state),
                location: parseInt(formData.location),
                sub_location: parseInt(formData.sub_location),
                pincode: parseInt(formData.pincode),
                policy_name: parseInt(formData.policy_name),
                no_person: formData.no_person ? parseInt(formData.no_person) : (defaultIds.noPerson ? parseInt(defaultIds.noPerson) : null),
                individual_age: formData.individual_age ? parseInt(formData.individual_age) : (defaultIds.individualAge ? parseInt(defaultIds.individualAge) : null)
            };

            console.log('📤 PUT to health-add-insurance/:', updateData);
            
            const response = await api.put(`health-add-insurance/${insuranceId}/`, updateData);
            
            console.log('✅ Health insurance updated:', response.data);
            showToast('success', 'Health insurance updated successfully!');
            
            // Call parent callback to refresh list
            if (onUpdate) {
                onUpdate();
            }
            
            // Close modal after delay
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error('❌ Error updating health insurance:', error);
            
            let errorMessage = 'Update failed. ';
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage += 'Validation errors: ';
                    if (error.response.data) {
                        Object.keys(error.response.data).forEach(field => {
                            errorMessage += `\n• ${field}: ${error.response.data[field]}`;
                        });
                    }
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

    // Reset form when modal closes
    const handleClose = () => {
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
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Health Insurance</h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={handleClose}
                            disabled={loading}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        {/* Toast Notification for Modal */}
                        {toast.show && (
                            <div className="position-relative" style={{ zIndex: 9999 }}>
                                <div className={`toast show bg-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : 'info'} text-white mb-3`}>
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

                        <form onSubmit={handleSubmit}>
                            {/* Customer Name */}
                            <div className="row mt-2">
                                <div className="col-md-12">
                                    <label className="form-label" htmlFor="edit_customer_name">
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
                                            id="edit_customer_name"
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
                                    <label className="form-label" htmlFor="edit_Phone_number">
                                        Phone No <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-phone"></i>
                                        </span>
                                        <input
                                            type="text"
                                            id="edit_Phone_number"
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
                                    <label className="form-label" htmlFor="edit_email_id">
                                        Email
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            name="email_id"
                                            id="edit_email_id"
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
                                    <label className="form-label" htmlFor="edit_customer_age">
                                        Age
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-user"></i>
                                        </span>
                                        <input
                                            type="number"
                                            id="edit_customer_age"
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
                                    <label className="form-label" htmlFor="edit_state">
                                        State <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-map-alt"></i>
                                        </span>
                                        <select
                                            id="edit_state"
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
                                    <label className="form-label" htmlFor="edit_location">
                                        Location <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-map"></i>
                                        </span>
                                        <select
                                            id="edit_location"
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
                                    <label className="form-label" htmlFor="edit_sub_location">
                                        Sub Location <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-map-pin"></i>
                                        </span>
                                        <select
                                            id="edit_sub_location"
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
                                    <label className="form-label" htmlFor="edit_pincode">
                                        PIN Code <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-mail-send"></i>
                                        </span>
                                        <select
                                            id="edit_pincode"
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
                                    <label className="form-label" htmlFor="edit_policy_name">
                                        Type Of Policy <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-file"></i>
                                        </span>
                                        <select
                                            id="edit_policy_name"
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

                            {/* Individual Age and Family Members */}
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="edit_individual_age">
                                        Individual Age
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-user"></i>
                                        </span>
                                        <select
                                            id="edit_individual_age"
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
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="edit_no_person">
                                        Number Of Persons
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <span className="input-group-text">
                                            <i className="bx bx-group"></i>
                                        </span>
                                        <select
                                            id="edit_no_person"
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
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            <i className="bx bx-x me-1"></i> Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-check me-1"></i> Update Insurance
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const My_HealthInsuranceList = () => {
    const navigate = useNavigate();
    
    // State for storing health insurance data
    const [insuranceData, setInsuranceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    
    // Edit Modal state
    const [editModal, setEditModal] = useState({
        show: false,
        insuranceId: null,
        initialData: null
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

    // Fetch health insurance data
    useEffect(() => {
        fetchInsuranceData();
    }, []);

    // Filter data when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredData(insuranceData);
        } else {
            const filtered = insuranceData.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (item.customer_name && item.customer_name.toLowerCase().includes(searchLower)) ||
                    (item.policy_name_display && item.policy_name_display.toLowerCase().includes(searchLower)) ||
                    (item.Phone_number && item.Phone_number.includes(searchTerm)) ||
                    (item.state_display && item.state_display.toLowerCase().includes(searchLower)) ||
                    (item.location_display && item.location_display.toLowerCase().includes(searchLower))
                );
            });
            setFilteredData(filtered);
        }
    }, [searchTerm, insuranceData]);

    const fetchInsuranceData = async () => {
        try {
            setLoading(true);
            
            // Fetch main health insurance data
            const response = await api.get('health-add-insurance/');
            let data = Array.isArray(response.data) ? response.data : response.data?.results || [];
            
            console.log('📊 Raw insurance data:', data);
            
            // Fetch additional data for display names
            const enrichedData = await enrichInsuranceData(data);
            
            setInsuranceData(enrichedData);
            setFilteredData(enrichedData);
            
            console.log(`✅ Loaded ${enrichedData.length} health insurance records`);
            
        } catch (error) {
            console.error('❌ Error fetching health insurance data:', error);
            showToast('error', 'Failed to load health insurance data');
            setInsuranceData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    const enrichInsuranceData = async (data) => {
        try {
            // Fetch lookup data in parallel
            const [statesRes, locationsRes, policyTypesRes] = await Promise.all([
                api.get('branch-states/'),
                api.get('branch-locations/'),
                api.get('type-of-policy/')
            ]);

            const states = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || [];
            const locations = Array.isArray(locationsRes.data) ? locationsRes.data : locationsRes.data?.results || [];
            const policyTypes = Array.isArray(policyTypesRes.data) ? policyTypesRes.data : policyTypesRes.data?.results || [];

            // Enrich each insurance record with display names
            return data.map(item => ({
                ...item,
                // Get display names
                state_display: states.find(s => s.id === item.state)?.name || `State ID: ${item.state}`,
                location_display: locations.find(l => l.id === item.location)?.name || `Location ID: ${item.location}`,
                policy_name_display: policyTypes.find(p => p.id === item.policy_name)?.policy_name || `Policy ID: ${item.policy_name}`,
                // Format phone number
                phone_display: item.Phone_number ? 
                    `${item.Phone_number.slice(0, 5)} ${item.Phone_number.slice(5)}` : 
                    'N/A'
            }));
        } catch (error) {
            console.error('❌ Error enriching data:', error);
            return data.map(item => ({
                ...item,
                state_display: `State ID: ${item.state}`,
                location_display: `Location ID: ${item.location}`,
                policy_name_display: `Policy ID: ${item.policy_name}`,
                phone_display: item.Phone_number || 'N/A'
            }));
        }
    };

    // Handle edit action - opens modal
    const handleEdit = (insuranceId) => {
        const selectedData = insuranceData.find(item => item.id === insuranceId);
        setEditModal({
            show: true,
            insuranceId,
            initialData: selectedData
        });
        showToast('info', `Editing insurance record ID: ${insuranceId}`);
    };

    // Handle delete action
    const handleDelete = async (id, customerName) => {
        if (window.confirm(`Are you sure you want to delete the health insurance record for "${customerName}"?`)) {
            try {
                setLoading(true);
                await api.delete(`health-add-insurance/${id}/`);
                showToast('success', `Health insurance record for "${customerName}" deleted successfully`);
                // Refresh the list
                fetchInsuranceData();
            } catch (error) {
                console.error('❌ Error deleting health insurance:', error);
                showToast('error', 'Failed to delete health insurance record');
                setLoading(false);
            }
        }
    };

    // Handle view action
    const handleView = (id) => {
        navigate(`/admin-dashboard/health/view/${id}`);
        showToast('info', `Viewing insurance record ID: ${id}`);
    };

    // Handle add new insurance
    const handleAddNew = () => {
        navigate('/admin-dashboard/health/add-insurance');
    };

    // Handle modal close
    const handleCloseModal = () => {
        setEditModal({ show: false, insuranceId: null, initialData: null });
    };

    // Handle successful update
    const handleUpdateSuccess = () => {
        fetchInsuranceData(); // Refresh the list
        showToast('success', 'Health insurance updated successfully!');
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

                        {/* Edit Modal */}
                        <EditHealthInsuranceModal
                            show={editModal.show}
                            onClose={handleCloseModal}
                            insuranceId={editModal.insuranceId}
                            initialData={editModal.initialData}
                            onUpdate={handleUpdateSuccess}
                        />

                        <div className="container-xxl flex-grow-1 container-p-y">
                            <div className="row">
                                <div className="col-xl">
                                    <div className="card mb-6">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Health Insurance List</h5>
                                            <div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-primary"
                                                    onClick={handleAddNew}
                                                    disabled={loading}
                                                >
                                                    <i className="bx bx-plus me-1"></i> Add Health Insurance
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {/* Search Bar */}
                                            <div className="row mb-4">
                                                <div className="col-md-12">
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            <i className="bx bx-search"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search by Customer Name, Policy, Mobile, State, or Location..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            disabled={loading}
                                                        />
                                                        {searchTerm && (
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onClick={() => setSearchTerm('')}
                                                            >
                                                                <i className="bx bx-x"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Table */}
                                            <div className="table-responsive">
                                                {loading ? (
                                                    <div className="text-center py-5">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="mt-2">Loading health insurance data...</p>
                                                    </div>
                                                ) : filteredData.length === 0 ? (
                                                    <div className="text-center py-5">
                                                        {searchTerm ? (
                                                            <>
                                                                <i className="bx bx-search-alt bx-lg text-muted mb-3"></i>
                                                                <h5>No matching records found</h5>
                                                                <p className="text-muted">Try adjusting your search terms</p>
                                                                <button
                                                                    className="btn btn-outline-primary"
                                                                    onClick={() => setSearchTerm('')}
                                                                >
                                                                    Clear Search
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bx bx-health bx-lg text-muted mb-3"></i>
                                                                <h5>No health insurance records found</h5>
                                                                <p className="text-muted">Start by adding a new health insurance record</p>
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={handleAddNew}
                                                                >
                                                                    <i className="bx bx-plus me-1"></i> Add Health Insurance
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <table className="table table-hover">
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th>Customer Name</th>
                                                                <th>Policy Name</th>
                                                                <th>Mobile</th>
                                                                <th>State</th>
                                                                <th>Location</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredData.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div>
                                                                                <h6 className="mb-0">{item.customer_name || 'Unknown'}</h6>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-label-primary">
                                                                            {item.policy_name_display}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <i className="bx bx-phone text-muted me-2"></i>
                                                                            <div>
                                                                                <div>{item.phone_display}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>{item.state_display}</td>
                                                                    <td>{item.location_display}</td>
                                                                    <td>
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                className="btn btn-sm btn-outline-info"
                                                                                onClick={() => handleView(item.id)}
                                                                                title="View Details"
                                                                            >
                                                                                <i className="bx bx-show me-1"></i>View
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-warning"
                                                                                onClick={() => handleEdit(item.id)}
                                                                                title="Edit"
                                                                            >
                                                                                <i className="bx bx-edit me-1"></i>Edit
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => handleDelete(item.id, item.customer_name)}
                                                                                title="Delete"
                                                                            >
                                                                                <i className="bx bx-trash me-1"></i>Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Summary Stats */}
                                            {!loading && filteredData.length > 0 && (
                                                <div className="row mt-4">
                                                    <div className="col-md-12">
                                                        <div className="alert alert-light d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <i className="bx bx-info-circle me-2"></i>
                                                                Showing <strong>{filteredData.length}</strong> of <strong>{insuranceData.length}</strong> health insurance records
                                                                {searchTerm && (
                                                                    <span className="ms-2">matching "<strong>{searchTerm}</strong>"</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={fetchInsuranceData}
                                                                >
                                                                    <i className="bx bx-refresh me-1"></i> Refresh
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
        </div>
    );
};

export default My_HealthInsuranceList;