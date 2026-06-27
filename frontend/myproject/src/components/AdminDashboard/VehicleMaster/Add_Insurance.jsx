import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const Add_Insurance = () => {
    const navigate = useNavigate();
    
    // Main form state
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

    // Document rows
    const [documentRows, setDocumentRows] = useState([
        { document_name: '', upload_file: null }
    ]);

    // Vehicle rows
    const [vehicleRows, setVehicleRows] = useState([
        {
            owner_name: '',
            vehicle_number: '',
            engine_number: '',
            chassis_number: '',
            vehicle_make: '',
            vehicle_model: '',
            manufacture_year: '',
            ins_company_name: '',
            idv_value: '0.00',
            ins_start_date: '',
            ins_last_date: '',
            premium: ''
        }
    ]);

    // Dropdown data states
    const [states, setStates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [pinCodes, setPinCodes] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [industryTypes, setIndustryTypes] = useState([]);
    const [businessTypes, setBusinessTypes] = useState([]);
    const [vehicleMakes, setVehicleMakes] = useState([]);
    const [vehicleModels, setVehicleModels] = useState([]);
    const [manufactureYears, setManufactureYears] = useState([]);
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);

    // Store vehicle models by make ID
    const [vehicleModelsByMake, setVehicleModelsByMake] = useState({});

    // Loading states
    const [loading, setLoading] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState({
        states: false,
        locations: false,
        subLocations: false,
        pincodes: false,
        customerTypes: false,
        industryTypes: false,
        businessTypes: false,
        vehicleModels: false
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
                customerTypes: true 
            }));
            
            const [
                statesRes, 
                customerTypesRes,
                vehicleMakesRes,
                manufactureYearsRes,
                insuranceCompaniesRes
            ] = await Promise.all([
                api.get('branch-states/'),
                api.get('customer-type/'),
                api.get('vehicle-make/'),
                api.get('manufacture-year/'),
                api.get('company-name/')
            ]);

            // Set states
            const statesData = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || [];
            setStates(statesData);

            // Set customer types
            const customerTypesData = Array.isArray(customerTypesRes.data) ? customerTypesRes.data : customerTypesRes.data?.results || [];
            setCustomerTypes(customerTypesData);

            // Set other dropdowns
            const vehicleMakesData = Array.isArray(vehicleMakesRes.data) ? vehicleMakesRes.data : vehicleMakesRes.data?.results || [];
            setVehicleMakes(vehicleMakesData);

            const manufactureYearsData = Array.isArray(manufactureYearsRes.data) ? manufactureYearsRes.data : manufactureYearsRes.data?.results || [];
            setManufactureYears(manufactureYearsData);

            const insuranceCompaniesData = Array.isArray(insuranceCompaniesRes.data) ? insuranceCompaniesRes.data : insuranceCompaniesRes.data?.results || [];
            setInsuranceCompanies(insuranceCompaniesData);

            console.log('✅ Loaded initial data:', {
                states: statesData.length,
                customerTypes: customerTypesData.length,
                vehicleMakes: vehicleMakesData.length,
                manufactureYears: manufactureYearsData.length,
                insuranceCompanies: insuranceCompaniesData.length
            });

            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false, 
                customerTypes: false
            }));

        } catch (error) {
            console.error('❌ Error fetching initial data:', error);
            showToast('error', 'Failed to load form data. Please refresh the page.');
            setDropdownLoading(prev => ({ 
                ...prev, 
                states: false, 
                customerTypes: false
            }));
        }
    };

    // Fetch vehicle models by make ID
    const fetchVehicleModels = async (makeId) => {
        if (!makeId) return;
        
        // Check if we already have models for this make
        if (vehicleModelsByMake[makeId]) {
            console.log(`✅ Using cached models for make ID: ${makeId}`);
            return;
        }
        
        try {
            setDropdownLoading(prev => ({ ...prev, vehicleModels: true }));
            
            // Try different query parameter formats
            const endpoints = [
                `vehicle-model/?vehicle_make=${makeId}`,
                `vehicle-model/?vehicle_make__id=${makeId}`,
                `vehicle-model/?vehicle_make_id=${makeId}`,
                `vehicle-model/`
            ];
            
            let response = null;
            
            for (const endpoint of endpoints) {
                try {
                    response = await api.get(endpoint);
                    console.log(`🔍 Trying endpoint: ${endpoint}`, response.data);
                    if (response.data && (Array.isArray(response.data) || response.data?.results)) {
                        break;
                    }
                } catch (err) {
                    console.log(`Endpoint ${endpoint} failed:`, err.message);
                    continue;
                }
            }
            
            if (!response) {
                console.warn('⚠️ No valid response for vehicle models');
                return;
            }
            
            // Extract data based on response format
            let modelsData = [];
            if (Array.isArray(response.data)) {
                modelsData = response.data;
            } else if (response.data?.results && Array.isArray(response.data.results)) {
                modelsData = response.data.results;
            }
            
            // Filter by make ID if needed (in case we got all models)
            const filteredModels = modelsData.filter(model => {
                const modelMakeId = model.vehicle_make?.id || model.vehicle_make;
                return String(modelMakeId) === String(makeId);
            });
            
            console.log(`✅ Loaded ${filteredModels.length} models for make ID: ${makeId}`, filteredModels);
            
            // Update vehicle models by make
            setVehicleModelsByMake(prev => ({
                ...prev,
                [makeId]: filteredModels
            }));
            
            // Also update general vehicle models list
            setVehicleModels(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const newModels = filteredModels.filter(m => !existingIds.has(m.id));
                return [...prev, ...newModels];
            });
            
        } catch (error) {
            console.error('❌ Error fetching vehicle models:', error);
            showToast('error', `Failed to load vehicle models for make ID: ${makeId}`);
        } finally {
            setDropdownLoading(prev => ({ ...prev, vehicleModels: false }));
        }
    };

    // Handle form input changes
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

    // Handle document rows
    const handleDocumentRowChange = (index, field, value) => {
        const updatedRows = [...documentRows];
        updatedRows[index][field] = value;
        setDocumentRows(updatedRows);
    };

    const addDocumentRow = () => {
        setDocumentRows([...documentRows, { document_name: '', upload_file: null }]);
    };

    const removeDocumentRow = (index) => {
        if (documentRows.length > 1) {
            const updatedRows = documentRows.filter((_, i) => i !== index);
            setDocumentRows(updatedRows);
        }
    };

    // Handle vehicle rows
    const handleVehicleRowChange = async (index, field, value) => {
        const updatedRows = [...vehicleRows];
        updatedRows[index][field] = value;
        
        // If vehicle make changes, fetch vehicle models
        if (field === 'vehicle_make') {
            updatedRows[index].vehicle_model = '';
            
            if (value) {
                // Fetch models for this make
                await fetchVehicleModels(value);
            }
        }
        
        setVehicleRows(updatedRows);
    };

    // Get vehicle models for a specific make
    const getVehicleModelsForMake = (makeId) => {
        if (!makeId) return [];
        
        // First check the cached models by make
        if (vehicleModelsByMake[makeId]) {
            return vehicleModelsByMake[makeId];
        }
        
        // Fallback: filter from all vehicle models
        return vehicleModels.filter(model => {
            const modelMakeId = model.vehicle_make?.id || model.vehicle_make;
            return String(modelMakeId) === String(makeId);
        });
    };

    const addVehicleRow = () => {
        setVehicleRows([...vehicleRows, {
            owner_name: '',
            vehicle_number: '',
            engine_number: '',
            chassis_number: '',
            vehicle_make: '',
            vehicle_model: '',
            manufacture_year: '',
            ins_company_name: '',
            idv_value: '0.00',
            ins_start_date: '',
            ins_last_date: '',
            premium: ''
        }]);
    };

    const removeVehicleRow = (index) => {
        if (vehicleRows.length > 1) {
            const updatedRows = vehicleRows.filter((_, i) => i !== index);
            setVehicleRows(updatedRows);
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

    // Customer type change handler
    const handleCustomerTypeChange = async (e) => {
        const customerTypeId = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            customer_type: customerTypeId,
            industry_type: '',
            business_type: ''
        }));
        
        setIndustryTypes([]);
        setBusinessTypes([]);

        if (customerTypeId) {
            try {
                setDropdownLoading(prev => ({ ...prev, industryTypes: true }));
                const response = await api.get(`industry-type/?customer_type=${customerTypeId}`);
                const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
                setIndustryTypes(data);
                console.log(`✅ Loaded ${data.length} industry types for customer type ID: ${customerTypeId}`);
                setDropdownLoading(prev => ({ ...prev, industryTypes: false }));
            } catch (error) {
                console.error('❌ Error fetching industry types:', error);
                showToast('error', 'Failed to load industry types');
                setDropdownLoading(prev => ({ ...prev, industryTypes: false }));
            }
        }
    };

    // Industry type change handler
    const handleIndustryTypeChange = async (e) => {
        const industryTypeId = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            industry_type: industryTypeId,
            business_type: ''
        }));
        
        setBusinessTypes([]);

        if (industryTypeId) {
            try {
                setDropdownLoading(prev => ({ ...prev, businessTypes: true }));
                const response = await api.get(`business-type/?industry_name=${industryTypeId}`);
                const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
                setBusinessTypes(data);
                console.log(`✅ Loaded ${data.length} business types for industry type ID: ${industryTypeId}`);
                setDropdownLoading(prev => ({ ...prev, businessTypes: false }));
            } catch (error) {
                console.error('❌ Error fetching business types:', error);
                showToast('error', 'Failed to load business types');
                setDropdownLoading(prev => ({ ...prev, businessTypes: false }));
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

        // Validate phone number
        if (formData.phone_number.length !== 10) {
            showToast('warning', 'Phone number must be 10 digits');
            return false;
        }

        // Validate email if provided
        if (formData.email_id && !/\S+@\S+\.\S+/.test(formData.email_id)) {
            showToast('warning', 'Please enter a valid email address');
            return false;
        }

        return true;
    };

    // Validate vehicle data
    const validateVehicleData = () => {
        let hasValidVehicle = false;
        
        for (const vehicle of vehicleRows) {
            if (vehicle.owner_name && vehicle.vehicle_number) {
                hasValidVehicle = true;
                
                // Validate required fields for each vehicle
                if (!vehicle.vehicle_make) {
                    showToast('warning', 'Please select vehicle make for all vehicles');
                    return false;
                }
                if (!vehicle.vehicle_model) {
                    showToast('warning', 'Please select vehicle model for all vehicles');
                    return false;
                }
                if (!vehicle.manufacture_year) {
                    showToast('warning', 'Please select manufacture year for all vehicles');
                    return false;
                }
                if (!vehicle.ins_company_name) {
                    showToast('warning', 'Please select insurance company for all vehicles');
                    return false;
                }
            }
        }
        
        if (!hasValidVehicle) {
            showToast('warning', 'Please add at least one vehicle with owner name and vehicle number');
            return false;
        }
        
        return true;
    };

    // ✅ NEW: Test if backend endpoints are working
    const testBackendEndpoints = async () => {
        showToast('info', 'Testing backend endpoints...');
        console.log('🧪 Testing backend endpoints...');
        
        try {
            // 1. Test authentication
            const authTest = await api.get('users/');
            console.log('✅ Authentication test passed');
            
            // 2. Test main insurance endpoint
            const insuranceTest = await api.get('vehicle-add-insurance/');
            console.log('✅ Insurance endpoint test passed');
            
            // 3. Test with a simple POST
            const testData = {
                customer_name: "Test Customer",
                company_name: "Test Company",
                phone_number: "9876543210",
                state: 1, // Make sure this ID exists
                location: 1, // Make sure this ID exists
                sub_location: 1, // Make sure this ID exists
                pincode: 1, // Make sure this ID exists
                customer_type: 1, // Make sure this ID exists
                industry_type: 1, // Make sure this ID exists
                business_type: 1 // Make sure this ID exists
            };
            
            console.log('📤 Testing POST with data:', testData);
            const postResponse = await api.post('vehicle-add-insurance/', testData);
            console.log('✅ POST test successful, ID:', postResponse.data.id);
            
            // Clean up test data
            await api.delete(`vehicle-add-insurance/${postResponse.data.id}/`);
            console.log('🗑️ Test data cleaned up');
            
            showToast('success', 'Backend endpoints are working correctly!');
            
        } catch (error) {
            console.error('❌ Backend test failed:', error);
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                
                let errorMsg = 'Backend test failed: ';
                if (error.response.status === 400) {
                    errorMsg += 'Validation error. Check if dropdown IDs exist.';
                } else if (error.response.status === 401) {
                    errorMsg += 'Authentication failed. Please login again.';
                } else if (error.response.status === 404) {
                    errorMsg += 'Endpoint not found. Check URLs.';
                } else {
                    errorMsg += `Status: ${error.response.status}`;
                }
                
                showToast('error', errorMsg);
            } else {
                showToast('error', 'Network error. Check if Django server is running.');
            }
        }
    };

    // ✅ MAIN SUBMISSION FUNCTION - SUBMIT SEQUENTIALLY
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (!validateVehicleData()) {
            return;
        }

        setLoading(true);
        showToast('info', 'Starting submission process...');

        try {
            // STEP 1: Submit main VehicleInsurance data
            console.log('🚀 STEP 1: Submitting main insurance data...');
            
            const mainFormData = {
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

            console.log('📤 POST to vehicle-add-insurance/:', mainFormData);
            
            const mainResponse = await api.post('vehicle-add-insurance/', mainFormData);
            const insuranceId = mainResponse.data.id;
            
            console.log('✅ Main insurance created with ID:', insuranceId);
            showToast('success', `Main insurance saved (ID: ${insuranceId})`);

            // STEP 2: Submit documents with foreign key reference
            const validDocuments = documentRows.filter(doc => 
                doc.document_name && doc.upload_file
            );
            
            if (validDocuments.length > 0) {
                console.log(`🚀 STEP 2: Submitting ${validDocuments.length} documents...`);
                showToast('info', `Uploading ${validDocuments.length} document(s)...`);
                
                let docCount = 0;
                for (const doc of validDocuments) {
                    try {
                        const docFormData = new FormData();
                        docFormData.append('vehicle', insuranceId); // Foreign key
                        docFormData.append('document_name', doc.document_name);
                        docFormData.append('upload_file', doc.upload_file);
                        
                        await api.post('vehicle-documents/', docFormData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        docCount++;
                        console.log(`✅ Document ${docCount} uploaded: ${doc.document_name}`);
                    } catch (docError) {
                        console.error(`❌ Failed to upload document: ${doc.document_name}`, docError);
                    }
                }
                
                if (docCount > 0) {
                    showToast('success', `${docCount} document(s) uploaded successfully`);
                }
            } else {
                console.log('ℹ️ No documents to upload');
            }

            // STEP 3: Submit vehicle details with foreign key reference
            console.log(`🚀 STEP 3: Submitting ${vehicleRows.length} vehicle(s)...`);
            showToast('info', `Saving vehicle details...`);
            
            let vehicleCount = 0;
            for (const vehicle of vehicleRows) {
                if (vehicle.owner_name && vehicle.vehicle_number) {
                    try {
                        const vehicleData = {
                            vehicle: insuranceId, // Foreign key
                            owner_name: vehicle.owner_name,
                            vehicle_number: vehicle.vehicle_number,
                            engine_number: vehicle.engine_number || "",
                            chassis_number: vehicle.chassis_number || "",
                            vehicle_make: parseInt(vehicle.vehicle_make),
                            vehicle_model: parseInt(vehicle.vehicle_model),
                            manufacture_year: parseInt(vehicle.manufacture_year),
                            ins_company_name: parseInt(vehicle.ins_company_name),
                            idv_value: vehicle.idv_value || "0.00",
                            ins_start_date: vehicle.ins_start_date || null,
                            ins_last_date: vehicle.ins_last_date || null,
                            premium: vehicle.premium || ""
                        };

                        console.log(`📤 Submitting vehicle:`, vehicleData);
                        await api.post('vehicle-insurance-details/', vehicleData);
                        vehicleCount++;
                        console.log(`✅ Vehicle ${vehicleCount} saved: ${vehicle.owner_name}`);
                    } catch (vehicleError) {
                        console.error(`❌ Failed to save vehicle: ${vehicle.owner_name}`, vehicleError);
                    }
                }
            }
            
            // FINAL SUCCESS MESSAGE
            const successMessage = `
✅ Insurance Application Submitted Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Summary:
• Insurance ID: ${insuranceId}
• Customer: ${formData.customer_name}
• Documents: ${validDocuments.length} uploaded
• Vehicles: ${vehicleCount} saved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All data has been saved to the database.
            `;
            
            console.log('🎉 SUBMISSION COMPLETE!');
            showToast('success', successMessage);

            // Reset form after 3 seconds
            setTimeout(() => {
                resetForm();
                navigate('/admin-dashboard/vehicle/insurance-list');
            }, 3000);

        } catch (error) {
            console.error('❌ SUBMISSION FAILED:', error);
            
            let errorMessage = 'Submission failed. ';
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                
                if (error.response.status === 400) {
                    errorMessage += 'Validation errors: ';
                    // Show specific field errors
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
                    errorMessage += 'Endpoint not found.';
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
        
        setDocumentRows([{ document_name: '', upload_file: null }]);
        setVehicleRows([{
            owner_name: '',
            vehicle_number: '',
            engine_number: '',
            chassis_number: '',
            vehicle_make: '',
            vehicle_model: '',
            manufacture_year: '',
            ins_company_name: '',
            idv_value: '0.00',
            ins_start_date: '',
            ins_last_date: '',
            premium: ''
        }]);
        
        setLocations([]);
        setSubLocations([]);
        setPinCodes([]);
        setIndustryTypes([]);
        setBusinessTypes([]);
        setVehicleModelsByMake({});
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
                                        <button type="button" className="btn-close" onClick={() => setToast({ show: false, type: '', message: '' })}></button>
                                    </div>
                                    <div className="toast-body" style={{ whiteSpace: 'pre-line' }}>{toast.message}</div>
                                </div>
                            </div>
                        )}

                        <div className="container-xxl flex-grow-1 container-p-y">
                            <div className="row">
                                <div className="col-xl">
                                    <div className="card mb-6">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Add Vehicle Insurance</h5>
                                            <div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate('/admin-dashboard/vehicle/insurance-list')}
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

                                                {/* Company Name and Phone */}
                                                <div className="row mt-2">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="company_name">
                                                            Company Name <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-building"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="company_name"
                                                                id="company_name"
                                                                placeholder="Company Name"
                                                                value={formData.company_name}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="phone_number">
                                                            Phone No <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-phone"></i>
                                                            </span>
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
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Alternative Phone and Email */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="alternative_phone_number">
                                                            Alternative Phone No
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-mobile-alt"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                id="alternative_phone_number"
                                                                name="alternative_phone_number"
                                                                className="form-control"
                                                                placeholder="Alternative phone number"
                                                                value={formData.alternative_phone_number}
                                                                onChange={handleInputChange}
                                                                maxLength="10"
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

                                                {/* State and Location */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="state">
                                                            State <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-map"></i>
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
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="location">
                                                            Location <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-current-location"></i>
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
                                                </div>

                                                {/* Sub Location and PIN Code */}
                                                <div className="row mt-3">
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
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="pincode">
                                                            PIN Code <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-hash"></i>
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
                                                </div>

                                                {/* Customer Type and Industry Type */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="customer_type">
                                                            Type Of Customer <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-group"></i>
                                                            </span>
                                                            <select
                                                                id="customer_type"
                                                                name="customer_type"
                                                                className="form-select"
                                                                value={formData.customer_type}
                                                                onChange={handleCustomerTypeChange}
                                                                required
                                                                disabled={loading || dropdownLoading.customerTypes}
                                                            >
                                                                <option value="">Select Customer Type</option>
                                                                {customerTypes.map(type => (
                                                                    <option key={type.id} value={type.id}>
                                                                        {type.customer_type}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="industry_type">
                                                            Industry Type <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-factory"></i>
                                                            </span>
                                                            <select
                                                                id="industry_type"
                                                                name="industry_type"
                                                                className="form-select"
                                                                value={formData.industry_type}
                                                                onChange={handleIndustryTypeChange}
                                                                disabled={!formData.customer_type || loading || dropdownLoading.industryTypes}
                                                                required
                                                            >
                                                                <option value="">Select Industry Type</option>
                                                                {industryTypes.map(type => (
                                                                    <option key={type.id} value={type.id}>
                                                                        {type.industry_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Business Type and Date of Birth */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="business_type">
                                                            Business Type <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-briefcase"></i>
                                                            </span>
                                                            <select
                                                                id="business_type"
                                                                name="business_type"
                                                                className="form-select"
                                                                value={formData.business_type}
                                                                onChange={handleInputChange}
                                                                disabled={!formData.industry_type || loading || dropdownLoading.businessTypes}
                                                                required
                                                            >
                                                                <option value="">Select Business Type</option>
                                                                {businessTypes.map(type => (
                                                                    <option key={type.id} value={type.id}>
                                                                        {type.business_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="birth_date">
                                                            Date of Birth
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-calendar"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="birth_date"
                                                                id="birth_date"
                                                                placeholder="DD/MM/YYYY"
                                                                value={formatDateForDisplay(formData.birth_date)}
                                                                onChange={handleDateInput}
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                        <small className="text-muted">Format: DD/MM/YYYY</small>
                                                    </div>
                                                </div>

                                                {/* Address */}
                                                <div className="row mt-3">
                                                    <div className="col-md-12">
                                                        <label className="form-label" htmlFor="address">
                                                            Address
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <span className="input-group-text">
                                                                <i className="bx bx-home"></i>
                                                            </span>
                                                            <textarea
                                                                name="address"
                                                                id="address"
                                                                className="form-control"
                                                                placeholder="Full address"
                                                                value={formData.address}
                                                                onChange={handleInputChange}
                                                                rows="3"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Document Details Table */}
                                                <div className="row mt-5">
                                                    <h5>Document Details</h5>
                                                    <p className="text-muted">Will be linked to this insurance application</p>
                                                    <div className="col-md-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered">
                                                                <thead className="table-dark">
                                                                    <tr>
                                                                        <th>Document Name</th>
                                                                        <th>File Upload</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {documentRows.map((row, index) => (
                                                                        <tr key={`doc-${index}`}>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="e.g., Aadhar Card, RC Book"
                                                                                    value={row.document_name}
                                                                                    onChange={(e) => handleDocumentRowChange(index, 'document_name', e.target.value)}
                                                                                    disabled={loading}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="file"
                                                                                    className="form-control"
                                                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                                                    onChange={(e) => handleDocumentRowChange(index, 'upload_file', e.target.files[0])}
                                                                                    disabled={loading}
                                                                                />
                                                                                {row.upload_file && (
                                                                                    <small className="text-muted">
                                                                                        Selected: {row.upload_file.name}
                                                                                    </small>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {index === documentRows.length - 1 ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-primary btn-sm"
                                                                                        onClick={addDocumentRow}
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <i className="bx bx-plus me-1"></i> Add
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-danger btn-sm"
                                                                                        onClick={() => removeDocumentRow(index)}
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

                                                {/* Vehicle Details Table */}
                                                <div className="row mt-5">
                                                    <h5>Vehicle Details</h5>
                                                    <p className="text-muted">Will be linked to this insurance application</p>
                                                    <div className="col-md-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered">
                                                                <thead className="table-dark">
                                                                    <tr>
                                                                        <th>Vehicle Owner Name</th>
                                                                        <th>Vehicle Number</th>
                                                                        <th>Engine Number</th>
                                                                        <th>Chassis Number</th>
                                                                        <th>Vehicle Make</th>
                                                                        <th>Vehicle Model</th>
                                                                        <th>Manufacture Year</th>
                                                                        <th>Company Name</th>
                                                                        <th>IDV Value</th>
                                                                        <th>Insurance Start Date</th>
                                                                        <th>Insurance End Date</th>
                                                                        <th>Premium</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {vehicleRows.map((row, index) => {
                                                                        const modelsForMake = getVehicleModelsForMake(row.vehicle_make);
                                                                        
                                                                        return (
                                                                            <tr key={`vehicle-${index}`}>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="Owner Name"
                                                                                        value={row.owner_name}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'owner_name', e.target.value)}
                                                                                        required
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="e.g., MH12AB1234"
                                                                                        value={row.vehicle_number}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'vehicle_number', e.target.value)}
                                                                                        required
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="Engine Number"
                                                                                        value={row.engine_number}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'engine_number', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="Chassis Number"
                                                                                        value={row.chassis_number}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'chassis_number', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        value={row.vehicle_make}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'vehicle_make', e.target.value)}
                                                                                        required
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <option value="">Select Vehicle Make</option>
                                                                                        {vehicleMakes.map(make => (
                                                                                            <option key={make.id} value={make.id}>
                                                                                                {make.vehical_make}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        value={row.vehicle_model}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'vehicle_model', e.target.value)}
                                                                                        disabled={!row.vehicle_make || loading || dropdownLoading.vehicleModels}
                                                                                        required
                                                                                    >
                                                                                        <option value="">Select Vehicle Model</option>
                                                                                        {modelsForMake.length > 0 ? (
                                                                                            modelsForMake.map(model => (
                                                                                                <option key={model.id} value={model.id}>
                                                                                                    {model.vehicle_model}
                                                                                                </option>
                                                                                            ))
                                                                                        ) : (
                                                                                            <option value="" disabled>
                                                                                                {row.vehicle_make ? 'Loading models...' : 'Select vehicle make first'}
                                                                                            </option>
                                                                                        )}
                                                                                    </select>
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        value={row.manufacture_year}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'manufacture_year', e.target.value)}
                                                                                        required
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <option value="">Select Manufacture Year</option>
                                                                                        {manufactureYears.map(year => (
                                                                                            <option key={year.id} value={year.id}>
                                                                                                {year.manufacture_year}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        value={row.ins_company_name}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'ins_company_name', e.target.value)}
                                                                                        required
                                                                                        disabled={loading}
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
                                                                                        placeholder="e.g., 500000"
                                                                                        value={row.idv_value}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'idv_value', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="date"
                                                                                        className="form-control"
                                                                                        value={row.ins_start_date}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'ins_start_date', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="date"
                                                                                        className="form-control"
                                                                                        value={row.ins_last_date}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'ins_last_date', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="Premium amount"
                                                                                        value={row.premium}
                                                                                        onChange={(e) => handleVehicleRowChange(index, 'premium', e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    {index === vehicleRows.length - 1 ? (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-primary btn-sm"
                                                                                            onClick={addVehicleRow}
                                                                                            disabled={loading}
                                                                                        >
                                                                                            <i className="bx bx-plus me-1"></i> Add
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-danger btn-sm"
                                                                                            onClick={() => removeVehicleRow(index)}
                                                                                            disabled={loading}
                                                                                        >
                                                                                            <i className="bx bx-trash me-1"></i> Delete
                                                                                        </button>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
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
                                                        onClick={() => navigate('/admin-dashboard/vehicle/insurance-list')}
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
                                                                <i className="bx bx-check me-1"></i> Submit All Data
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

export default Add_Insurance;