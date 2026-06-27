import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import './styles/EmpView.css';

function EmpView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allEmployees, setAllEmployees] = useState([]);

    // Separate password visibility states - but we won't show actual password
    const [showProfilePassword, setShowProfilePassword] = useState(false);
    const [showCompanyPassword, setShowCompanyPassword] = useState(false);
    const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [settingPassword, setSettingPassword] = useState(false);

    const [activeTab, setActiveTab] = useState('profile');

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        office_email: '',
        contact_info: '',
        office_phone_number: '',
        branch_inner_state: '',
        branch_inner_location: '',
        aadhar_number: '',
        pan_number: '',
        present_address: '',
        permanent_address: '',
        date_of_birth: '',
        employee_image: null,

        // Reference fields
        ref_name_1: '',
        ref_relation_1: '',
        ref_mobile_1: '',
        ref_address_1: '',
        ref_name_2: '',
        ref_relation_2: '',
        ref_mobile_2: '',
        ref_address_2: '',
    });
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [branchInnerStates, setBranchInnerStates] = useState([]);
    const [branchInnerLocations, setBranchInnerLocations] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // New states for related data
    const [banks, setBanks] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [loadingRelatedData, setLoadingRelatedData] = useState(true);

    // Company Information states
    const [companyFormData, setCompanyFormData] = useState({
        department_id: '',
        designation_id: '',
        reporting_to_id: '',
        password: ''
    });
    const [savingCompanyInfo, setSavingCompanyInfo] = useState(false);

    // Bank Edit Modal States
    const [showBankEditModal, setShowBankEditModal] = useState(false);
    const [bankEditLoading, setBankEditLoading] = useState(false);
    const [bankFormData, setBankFormData] = useState({
        account_holder_name: '',
        bank: '',
        type_of_account: '',
        bank_branch_name: '',
        account_number: '',
        ifsc_code: ''
    });

    // Attachment Edit Modal States
    const [showAttachmentEditModal, setShowAttachmentEditModal] = useState(false);
    const [attachmentEditLoading, setAttachmentEditLoading] = useState(false);
    const [attachmentFormData, setAttachmentFormData] = useState({
        aadhar_card_upload: null,
        pan_card_upload: null,
        bank_proof_upload: null,
        employee_image: null
    });

    useEffect(() => {
        fetchAllEmployees();
    }, [id]);

    useEffect(() => {
        if (employee) {
            console.log('=== EMPLOYEE DATA DEBUG ===');
            console.log('Full employee object:', employee);

            // Initialize company form data
            setCompanyFormData({
                department_id: employee.department_id || employee.department || '',
                designation_id: employee.designation_id || employee.designation || '',
                reporting_to_id: employee.reporting_to_id || employee.reporting_to || '',
                password: ''
            });

            // Initialize bank form data
            setBankFormData({
                account_holder_name: employee.account_holder_name || '',
                bank: employee.bank || '',
                type_of_account: employee.type_of_account || '',
                bank_branch_name: employee.bank_branch_name || '',
                account_number: employee.account_number || '',
                ifsc_code: employee.ifsc_code || ''
            });

            fetchRelatedData();
        }
    }, [employee]);

    const fetchAllEmployees = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching all employees from /api/users/');

            const response = await api.get('users/');

            let employeesList = [];

            if (response.data && response.data.results) {
                employeesList = response.data.results;
            } else if (Array.isArray(response.data)) {
                employeesList = response.data;
            } else if (typeof response.data === 'object') {
                employeesList = Object.values(response.data);
            }

            console.log('Processed employees list:', employeesList);
            setAllEmployees(employeesList);

            const foundEmployee = employeesList.find(emp => {
                return (
                    (emp.id && emp.id.toString() === id) ||
                    (emp.employee_id && emp.employee_id.toString() === id) ||
                    emp.username === id ||
                    emp.email === id
                );
            });

            if (foundEmployee) {
                console.log('Employee found:', foundEmployee);
                setEmployee(foundEmployee);
            } else {
                console.log('Employee not found with ID:', id);
                setError(`Employee with ID "${id}" not found.`);
            }

        } catch (err) {
            console.error('Error fetching employees:', err);
            let errorMessage = 'Failed to load employee data';
            if (err.response?.status === 500) {
                errorMessage = 'Server error. Please check the Django server logs.';
            } else if (err.response?.status === 401) {
                errorMessage = 'Unauthorized. Please login again.';
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                setTimeout(() => navigate('/'), 1000);
            } else if (err.response?.status === 403) {
                errorMessage = 'Access forbidden. You do not have permission.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedData = async () => {
        try {
            setLoadingRelatedData(true);

            const [
                innerStatesResponse,
                banksResponse,
                accountTypesResponse,
                deptResponse,
                designationsResponse
            ] = await Promise.all([
                api.get('branch-inner-states/').catch(() => ({ data: [] })),
                api.get('banks/').catch(() => ({ data: [] })),
                api.get('typeofaccounts/').catch(() => ({ data: [] })),
                api.get('departments-dropdown/').catch(() => ({ data: [] })),
                api.get('designations-dropdown/').catch(() => ({ data: [] }))
            ]);

            setBranchInnerStates(innerStatesResponse.data || []);
            setBanks(banksResponse.data || []);
            setAccountTypes(accountTypesResponse.data || []);
            setDepartments(deptResponse.data || []);
            setDesignations(designationsResponse.data || []);

            if (employee?.branch_inner_state) {
                await fetchBranchInnerLocations(employee.branch_inner_state);
            }

        } catch (err) {
            console.error('Error fetching related data:', err);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    const fetchBranchInnerLocations = async (stateId) => {
        if (!stateId) {
            setBranchInnerLocations([]);
            return;
        }

        try {
            console.log('Fetching branch inner locations for state ID:', stateId);
            const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);
            console.log('Branch inner locations response:', response.data);
            setBranchInnerLocations(response.data || []);
        } catch (error) {
            console.error('Error fetching branch inner locations:', error);
            setBranchInnerLocations([]);
        }
    };

    // Helper functions to get names from IDs
    const getBranchInnerStateName = (stateId) => {
        if (!stateId) return 'N/A';
        if (stateId === -1 || stateId === "-1") return 'N/A';

        const state = branchInnerStates.find(s =>
            s.id === stateId ||
            s.id?.toString() === stateId?.toString() ||
            s.state_id === stateId ||
            s.pk === stateId
        );

        if (state) {
            return state.name || state.state_name || state.state || `State ${stateId}`;
        }

        return `State ID: ${stateId}`;
    };

    const getBranchInnerLocationName = (locationId) => {
        if (!locationId) return 'N/A';
        if (locationId === -1 || locationId === "-1") return 'N/A';

        const location = branchInnerLocations.find(l =>
            l.id === locationId ||
            l.id?.toString() === locationId?.toString() ||
            l.location_id === locationId ||
            l.pk === locationId
        );

        if (location) {
            return location.name || location.location_name || location.location || `Location ${locationId}`;
        }

        return `Location ID: ${locationId}`;
    };

    const getBankName = (bankId) => {
        if (!bankId) return 'N/A';
        if (bankId === -1 || bankId === "-1") return 'N/A';

        const bank = banks.find(b =>
            b.id === bankId ||
            b.id?.toString() === bankId?.toString() ||
            b.bank_id === bankId ||
            b.pk === bankId
        );
        return bank ? (bank.name || bank.bank_name || bank.bank || `Bank ${bankId}`) : `Bank ID: ${bankId}`;
    };

    const getAccountTypeName = (accountTypeId) => {
        if (!accountTypeId) return 'N/A';
        if (accountTypeId === -1 || accountTypeId === "-1") return 'N/A';

        let accountType = null;

        accountType = accountTypes.find(a =>
            a.id === accountTypeId ||
            a.id?.toString() === accountTypeId?.toString()
        );

        if (!accountType) {
            accountType = accountTypes.find(a =>
                a.type_id === accountTypeId ||
                a.type_id?.toString() === accountTypeId?.toString()
            );
        }

        if (accountType) {
            return accountType.name || accountType.type_name || accountType.account_type || accountType.type || `Type ${accountTypeId}`;
        }

        if (accountTypeId === 1 || accountTypeId === "1") {
            return 'Savings';
        }

        if (!isNaN(accountTypeId) && accountTypeId > 0) {
            return `Type ${accountTypeId}`;
        }

        return 'N/A';
    };

    // Helper function to construct full URL for images
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        if (imagePath.startsWith('/media/')) {
            return `http://localhost:8000${imagePath}`;
        }

        if (imagePath && !imagePath.includes('/')) {
            return `http://localhost:8000/media/employees/${imagePath}`;
        }

        return `http://localhost:8000/media/${imagePath}`;
    };

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setEmployee(null);
        fetchAllEmployees();
    };

    // Toggle functions for password visibility - these now just toggle between showing asterisks and "Set Password" message
    const toggleProfilePassword = () => {
        setShowProfilePassword(!showProfilePassword);
    };

    const toggleCompanyPassword = () => {
        setShowCompanyPassword(!showCompanyPassword);
    };

    // Handle opening the set password modal
    const handleSetPassword = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setSuccessMessage('');
        setShowSetPasswordModal(true);
    };

    // Handle saving the new password
    const handleSavePassword = async () => {
        if (!employee) return;

        if (!newPassword) {
            setErrorMessage('Password is required');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setSettingPassword(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Setting password for employee ID:', employee.id);

            const response = await api.patch(`users/${employee.id}/`, {
                password: newPassword
            });

            if (response.status === 200) {
                setSuccessMessage('Password updated successfully!');

                setTimeout(() => {
                    setShowSetPasswordModal(false);
                    setSuccessMessage('');
                    // Refresh employee data
                    fetchAllEmployees();
                }, 1500);
            }
        } catch (error) {
            console.error('Error setting password:', error);
            let errorMsg = 'Failed to set password. ';
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        } else {
                            errors.push(`${key}: ${error.response.data[key]}`);
                        }
                    }
                    errorMsg += errors.join('; ');
                } else {
                    errorMsg += error.response.data;
                }
            }
            setErrorMessage(errorMsg);
        } finally {
            setSettingPassword(false);

            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    };

    // Handle company field changes
    const handleCompanyFieldChange = (field, value) => {
        setCompanyFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save company information
    const handleSaveCompanyInfo = async () => {
        if (!employee) return;

        if (!companyFormData.department_id || !companyFormData.designation_id || !companyFormData.reporting_to_id) {
            setErrorMessage('Please fill all required fields (Department, Designation, Reporting To)');
            return;
        }

        setSavingCompanyInfo(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updateData = {
                department: companyFormData.department_id,
                designation: companyFormData.designation_id,
                reporting_to: companyFormData.reporting_to_id
            };

            // Only update password if provided
            if (companyFormData.password && companyFormData.password.trim() !== '') {
                updateData.password = companyFormData.password;
            }

            console.log('Updating company info:', updateData);

            const response = await api.patch(`users/${employee.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('Company information updated successfully!');

                const updatedEmployee = {
                    ...employee,
                    ...response.data,
                    department_id: companyFormData.department_id,
                    designation_id: companyFormData.designation_id,
                    reporting_to_id: companyFormData.reporting_to_id,
                    department_name: departments.find(d => d.id == companyFormData.department_id)?.name || '',
                    designation_name: designations.find(d => d.id == companyFormData.designation_id)?.name || '',
                    reporting_to_name: allEmployees.find(e => e.id == companyFormData.reporting_to_id)?.first_name + ' ' +
                        allEmployees.find(e => e.id == companyFormData.reporting_to_id)?.last_name || ''
                };

                setEmployee(updatedEmployee);

                setCompanyFormData(prev => ({
                    ...prev,
                    password: ''
                }));

                setTimeout(() => {
                    fetchAllEmployees();
                }, 1000);
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            let errorMsg = 'Failed to update company information. ';

            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        } else {
                            errors.push(`${key}: ${error.response.data[key]}`);
                        }
                    }
                    errorMsg += errors.join('; ');
                } else {
                    errorMsg += error.response.data;
                }
            }
            setErrorMessage(errorMsg);
        } finally {
            setSavingCompanyInfo(false);

            setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000);
        }
    };

    // Handle profile edit button click
    const handleEdit = () => {
        if (!employee) return;

        setEditingEmployee(employee);
        setEditFormData({
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            email: employee.email || '',
            office_email: employee.office_email || '',
            contact_info: employee.contact_info || '',
            office_phone_number: employee.office_phone_number || '',
            branch_inner_state: employee.branch_inner_state || '',
            branch_inner_location: employee.branch_inner_location || '',
            aadhar_number: employee.aadhar_number || '',
            pan_number: employee.pan_number || '',
            present_address: employee.present_address || '',
            permanent_address: employee.permanent_address || '',
            date_of_birth: employee.date_of_birth || '',
            employee_image: null,

            ref_name_1: employee.ref_name_1 || '',
            ref_relation_1: employee.ref_relation_1 || '',
            ref_mobile_1: employee.ref_mobile_1 || '',
            ref_address_1: employee.ref_address_1 || '',
            ref_name_2: employee.ref_name_2 || '',
            ref_relation_2: employee.ref_relation_2 || '',
            ref_mobile_2: employee.ref_mobile_2 || '',
            ref_address_2: employee.ref_address_2 || '',
        });

        if (employee.branch_inner_state) {
            fetchBranchInnerLocations(employee.branch_inner_state);
        }

        setShowEditModal(true);
    };

    // Handle bank edit button click
    const handleBankEdit = () => {
        if (!employee) return;

        setBankFormData({
            account_holder_name: employee.account_holder_name || '',
            bank: employee.bank || '',
            type_of_account: employee.type_of_account || '',
            bank_branch_name: employee.bank_branch_name || '',
            account_number: employee.account_number || '',
            ifsc_code: employee.ifsc_code || ''
        });

        setShowBankEditModal(true);
    };

    // Handle attachment edit button click
    const handleAttachmentEdit = () => {
        if (!employee) return;

        setAttachmentFormData({
            aadhar_card_upload: null,
            pan_card_upload: null,
            bank_proof_upload: null,
            employee_image: null
        });

        setShowAttachmentEditModal(true);
    };

    // Handle edit form input changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;

        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'branch_inner_state') {
            setEditFormData(prev => ({
                ...prev,
                branch_inner_location: ''
            }));
            fetchBranchInnerLocations(value);
        }
    };

    // Handle bank form changes
    const handleBankFormChange = (e) => {
        const { name, value } = e.target;
        setBankFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle attachment file changes
    const handleAttachmentFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setAttachmentFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    // Handle file upload in edit form
    const handleEditFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setEditFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    // Save bank information
    const handleSaveBank = async () => {
        if (!employee) return;

        setBankEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating bank info for employee ID:', employee.id);

            const updateData = {
                account_holder_name: bankFormData.account_holder_name,
                bank: bankFormData.bank || null,
                type_of_account: bankFormData.type_of_account || null,
                bank_branch_name: bankFormData.bank_branch_name,
                account_number: bankFormData.account_number,
                ifsc_code: bankFormData.ifsc_code
            };

            console.log('Bank update data:', updateData);

            const response = await api.patch(`users/${employee.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('Bank information updated successfully!');

                const updatedEmployee = {
                    ...employee,
                    ...response.data
                };

                setEmployee(updatedEmployee);

                setTimeout(() => {
                    fetchAllEmployees();
                }, 500);

                setTimeout(() => {
                    setShowBankEditModal(false);
                    setSuccessMessage('');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating bank info:', error);

            let errorMsg = 'Failed to update bank information. ';

            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        } else {
                            errors.push(`${key}: ${error.response.data[key]}`);
                        }
                    }
                    errorMsg += errors.join('; ');
                } else {
                    errorMsg += error.response.data;
                }
            }
            setErrorMessage(errorMsg);
        } finally {
            setBankEditLoading(false);

            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    };

    // Save attachment information
    const handleSaveAttachment = async () => {
        if (!employee) return;

        setAttachmentEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating attachments for employee ID:', employee.id);

            const formData = new FormData();

            if (attachmentFormData.aadhar_card_upload instanceof File) {
                formData.append('aadhar_card_upload', attachmentFormData.aadhar_card_upload);
            }
            if (attachmentFormData.pan_card_upload instanceof File) {
                formData.append('pan_card_upload', attachmentFormData.pan_card_upload);
            }
            if (attachmentFormData.bank_proof_upload instanceof File) {
                formData.append('bank_proof_upload', attachmentFormData.bank_proof_upload);
            }
            if (attachmentFormData.employee_image instanceof File) {
                formData.append('employee_image', attachmentFormData.employee_image);
            }

            if (Array.from(formData.entries()).length === 0) {
                setErrorMessage('Please select at least one file to upload.');
                setAttachmentEditLoading(false);
                return;
            }

            const response = await api.patch(`users/${employee.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setSuccessMessage('Attachments updated successfully!');

                const updatedEmployee = {
                    ...employee,
                    ...response.data
                };

                setEmployee(updatedEmployee);

                setTimeout(() => {
                    fetchAllEmployees();
                }, 500);

                setTimeout(() => {
                    setShowAttachmentEditModal(false);
                    setSuccessMessage('');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating attachments:', error);

            let errorMsg = 'Failed to update attachments. ';

            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        } else {
                            errors.push(`${key}: ${error.response.data[key]}`);
                        }
                    }
                    errorMsg += errors.join('; ');
                } else {
                    errorMsg += error.response.data;
                }
            }
            setErrorMessage(errorMsg);
        } finally {
            setAttachmentEditLoading(false);

            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    };

    // Save profile edit
    const handleSaveEdit = async () => {
        if (!editingEmployee) return;

        setEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Editing employee ID:', editingEmployee.id);

            const currentUserResponse = await api.get(`users/${editingEmployee.id}/`);
            const currentUserData = currentUserResponse.data;

            console.log('Current user data:', currentUserData);

            const updateData = {
                ...currentUserData,
                first_name: editFormData.first_name.trim(),
                last_name: editFormData.last_name.trim(),
                email: editFormData.email || '',
                office_email: editFormData.office_email || '',
                contact_info: editFormData.contact_info || '',
                office_phone_number: editFormData.office_phone_number || '',
                branch_inner_state: editFormData.branch_inner_state || null,
                branch_inner_location: editFormData.branch_inner_location || null,
                aadhar_number: editFormData.aadhar_number || '',
                pan_number: editFormData.pan_number || '',
                present_address: editFormData.present_address || '',
                permanent_address: editFormData.permanent_address || '',
                date_of_birth: editFormData.date_of_birth || null,

                ref_name_1: editFormData.ref_name_1 || '',
                ref_relation_1: editFormData.ref_relation_1 || '',
                ref_mobile_1: editFormData.ref_mobile_1 || '',
                ref_address_1: editFormData.ref_address_1 || '',
                ref_name_2: editFormData.ref_name_2 || '',
                ref_relation_2: editFormData.ref_relation_2 || '',
                ref_mobile_2: editFormData.ref_mobile_2 || '',
                ref_address_2: editFormData.ref_address_2 || '',
            };

            // Remove password from update data - we don't want to accidentally clear it
            delete updateData.password;

            if (updateData.work_icons && Array.isArray(updateData.work_icons)) {
                updateData.work_icons = JSON.stringify(updateData.work_icons);
            }

            console.log('Update data:', updateData);

            const patchData = {};
            if (editFormData.first_name !== currentUserData.first_name) patchData.first_name = editFormData.first_name.trim();
            if (editFormData.last_name !== currentUserData.last_name) patchData.last_name = editFormData.last_name.trim();
            if (editFormData.email !== currentUserData.email) patchData.email = editFormData.email;
            if (editFormData.office_email !== currentUserData.office_email) patchData.office_email = editFormData.office_email;
            if (editFormData.contact_info !== currentUserData.contact_info) patchData.contact_info = editFormData.contact_info;
            if (editFormData.office_phone_number !== currentUserData.office_phone_number) patchData.office_phone_number = editFormData.office_phone_number;
            if (editFormData.branch_inner_state !== currentUserData.branch_inner_state) patchData.branch_inner_state = editFormData.branch_inner_state;
            if (editFormData.branch_inner_location !== currentUserData.branch_inner_location) patchData.branch_inner_location = editFormData.branch_inner_location;
            if (editFormData.aadhar_number !== currentUserData.aadhar_number) patchData.aadhar_number = editFormData.aadhar_number;
            if (editFormData.pan_number !== currentUserData.pan_number) patchData.pan_number = editFormData.pan_number;
            if (editFormData.present_address !== currentUserData.present_address) patchData.present_address = editFormData.present_address;
            if (editFormData.permanent_address !== currentUserData.permanent_address) patchData.permanent_address = editFormData.permanent_address;
            if (editFormData.date_of_birth !== currentUserData.date_of_birth) patchData.date_of_birth = editFormData.date_of_birth;

            if (editFormData.ref_name_1 !== currentUserData.ref_name_1) patchData.ref_name_1 = editFormData.ref_name_1;
            if (editFormData.ref_relation_1 !== currentUserData.ref_relation_1) patchData.ref_relation_1 = editFormData.ref_relation_1;
            if (editFormData.ref_mobile_1 !== currentUserData.ref_mobile_1) patchData.ref_mobile_1 = editFormData.ref_mobile_1;
            if (editFormData.ref_address_1 !== currentUserData.ref_address_1) patchData.ref_address_1 = editFormData.ref_address_1;
            if (editFormData.ref_name_2 !== currentUserData.ref_name_2) patchData.ref_name_2 = editFormData.ref_name_2;
            if (editFormData.ref_relation_2 !== currentUserData.ref_relation_2) patchData.ref_relation_2 = editFormData.ref_relation_2;
            if (editFormData.ref_mobile_2 !== currentUserData.ref_mobile_2) patchData.ref_mobile_2 = editFormData.ref_mobile_2;
            if (editFormData.ref_address_2 !== currentUserData.ref_address_2) patchData.ref_address_2 = editFormData.ref_address_2;

            let response;
            try {
                console.log('Trying PATCH request with data:', patchData);
                response = await api.patch(`users/${editingEmployee.id}/`, patchData);
                console.log('Update successful with PATCH:', response.data);
            } catch (patchError) {
                if (patchError.response?.status === 405 || patchError.response?.status === 400) {
                    console.log('PATCH failed, trying PUT...');

                    if (editFormData.employee_image instanceof File) {
                        const putFormData = new FormData();
                        Object.keys(updateData).forEach(key => {
                            if (updateData[key] !== null && updateData[key] !== undefined) {
                                putFormData.append(key, updateData[key]);
                            }
                        });
                        putFormData.append('employee_image', editFormData.employee_image);

                        response = await api.put(`users/${editingEmployee.id}/`, putFormData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });
                    } else {
                        response = await api.put(`users/${editingEmployee.id}/`, updateData);
                    }

                    console.log('Update successful with PUT:', response.data);
                } else {
                    throw patchError;
                }
            }

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('Employee updated successfully!');

                const updatedEmployee = {
                    ...editingEmployee,
                    ...response.data
                };

                setEmployee(updatedEmployee);
                setEditingEmployee(updatedEmployee);

                setTimeout(() => {
                    fetchAllEmployees();
                }, 500);

                setTimeout(() => {
                    setShowEditModal(false);
                    setSuccessMessage('');
                }, 1500);
            } else {
                setErrorMessage('Failed to update employee. Please try again.');
            }
        } catch (error) {
            console.error('Error updating employee:', error);

            let errorMsg = 'Failed to update employee. ';

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

    // Get the actual image URL
    const getEmployeeImageUrl = () => {
        if (!employee) return null;

        if (employee.employee_image_url) {
            return employee.employee_image_url;
        }

        if (employee.employee_image) {
            return getFullImageUrl(employee.employee_image);
        }

        return null;
    };

    const employeeImageUrl = employee ? getEmployeeImageUrl() : null;

    // Loading state
    if (loading) {
        return (
            <div className="emp-loading-container">
                <div className="emp-loading-content">
                    <div className="emp-loading-spinner">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <h3 className="emp-loading-title">Loading Employee Details</h3>
                    <p className="emp-loading-text">ID: {id} • Fetching from API...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="emp-error-container">
                <div className="emp-error-header">
                    <h1 className="emp-error-title">
                        <i className="bi bi-exclamation-triangle"></i> Error Loading Employee
                    </h1>
                </div>
                <div className="emp-error-card">
                    <div className="emp-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                    <h2 className="emp-error-message-title">Error Loading Employee</h2>
                    <p className="emp-error-message">{error}</p>

                    <div className="emp-debug-info">
                        <h6 className="emp-debug-title">Debug Information</h6>
                        <div className="emp-debug-content">
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Requested ID:</span>
                                <span className="emp-debug-value">{id}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Total employees fetched:</span>
                                <span className="emp-debug-value">{allEmployees.length}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">API Endpoint:</span>
                                <span className="emp-debug-value">/api/users/</span>
                            </div>
                        </div>
                    </div>

                    <div className="emp-error-actions">
                        <button className="emp-retry-btn" onClick={handleRetry}>
                            <i className="bi bi-arrow-clockwise"></i> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No employee found
    if (!employee) {
        return (
            <div className="emp-notfound-container">
                <div className="emp-notfound-header">
                    <h1 className="emp-notfound-title">
                        <i className="bi bi-person-x"></i> Employee Not Found
                    </h1>
                </div>
                <div className="emp-notfound-card">
                    <div className="emp-notfound-icon">
                        <i className="bi bi-search"></i>
                    </div>
                    <h2 className="emp-notfound-message">Employee Not Found</h2>
                    <p>No employee found with ID: <strong>{id}</strong></p>
                    <p className="emp-notfound-info">
                        Total employees in system: {allEmployees.length}
                    </p>
                </div>
            </div>
        );
    }

    // Navigation tabs
    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'bi-person' },
        { id: 'reference', label: 'Reference', icon: 'bi-person-lines-fill' },
        { id: 'bank', label: 'Bank', icon: 'bi-bank' },
        { id: 'attachment', label: 'Attachment', icon: 'bi-paperclip' },
        { id: 'company', label: 'Company Info', icon: 'bi-building' },
    ];

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <div className="emp-tab-grid">
                                {/* Left Column - Basic Info */}
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <h5 className="emp-section-title">
                                            <i className="bi bi-person-circle"></i>
                                            Personal Information
                                        </h5>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">First Name</label>
                                                <p className="emp-info-value">{employee.first_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Last Name</label>
                                                <p className="emp-info-value">{employee.last_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Employee ID</label>
                                                <p className="emp-info-value">{employee.username || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Password</label>
                                                <div className="emp-password-field">
                                                    <input
                                                        type="password"
                                                        className="emp-password-input"
                                                        value="********"
                                                        readOnly
                                                        disabled
                                                    />
                                                    <button
                                                        className="emp-password-toggle"
                                                        type="button"
                                                        onClick={toggleProfilePassword}
                                                        title={showProfilePassword ? "Hide" : "Show Set Password"}
                                                    >
                                                        <i className={`bi ${showProfilePassword ? 'bi-eye-slash' : 'bi-key'}`}></i>
                                                    </button>
                                                </div>
                                                {showProfilePassword && (
                                                    <div className="emp-password-actions">
                                                        <button
                                                            className="emp-set-password-btn"
                                                            onClick={handleSetPassword}
                                                        >
                                                            <i className="bi bi-shield-lock"></i> Set/Reset Password
                                                        </button>
                                                        <small className="emp-password-note">
                                                            Password cannot be viewed for security reasons
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Rank</label>
                                                <p className="emp-info-value">{employee.role || 'User'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Personal Mobile</label>
                                                <p className="emp-info-value">{employee.personal_mobile || employee.contact_info || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Personal Email</label>
                                                <p className="emp-info-value">{employee.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Work Info */}
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="work-header">
                                            <h5 className="emp-section-title">
                                                <i className="bi bi-briefcase"></i>
                                                Work Information
                                            </h5>

                                            <button
                                                className="emp-edit-btn"
                                                onClick={handleEdit}
                                                title="Edit Employee"
                                            >
                                                <i className="bi bi-pencil"></i> Edit Profile
                                            </button>
                                        </div>

                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Department Name</label>
                                                <p className="emp-info-value">{employee.department_name || employee.department || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Designation Name</label>
                                                <p className="emp-info-value">{employee.designation_name || employee.designation || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Present Address</label>
                                                <p className="emp-info-value">{employee.present_address || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Permanent Address</label>
                                                <p className="emp-info-value">{employee.permanent_address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="emp-section">
                                        <h5 className="emp-section-title">
                                            <i className="bi bi-diagram-3"></i>
                                            Reporting & Contact
                                        </h5>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Reporting To</label>
                                                <p className="emp-info-value">{employee.reporting_to || employee.reportingTo || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Date of Birth</label>
                                                <p className="emp-info-value">{employee.date_of_birth || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Office Mobile</label>
                                                <p className="emp-info-value">{employee.office_mobile || employee.office_phone_number || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Office Email</label>
                                                <p className="emp-info-value">{employee.office_email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="emp-section">
                                        <h5 className="emp-section-title">
                                            <i className="bi bi-folder"></i>
                                            Documents & Branch
                                        </h5>
                                        <div className="emp-info-grid-two">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Aadhar Number</label>
                                                <p className="emp-info-value">{employee.aadhar_number || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">PAN Number</label>
                                                <p className="emp-info-value">{employee.pan_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch State</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBranchInnerStateName(employee.branch_inner_state)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Location</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBranchInnerLocationName(employee.branch_inner_location)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'reference':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <h5 className="emp-tab-title">Reference Information</h5>
                            <div className="emp-tab-grid">
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <h6 className="emp-subtitle">Reference 1</h6>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Name</label>
                                                <p className="emp-info-value">{employee.ref_name_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{employee.ref_relation_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{employee.ref_mobile_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{employee.ref_address_1 || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <h6 className="emp-subtitle">Reference 2</h6>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Name</label>
                                                <p className="emp-info-value">{employee.ref_name_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{employee.ref_relation_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{employee.ref_mobile_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{employee.ref_address_2 || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bank':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <div className="emp-tab-header">
                                <h5 className="emp-tab-title">
                                    <i className="bi bi-bank"></i> Bank Information
                                </h5>
                                <button
                                    className="emp-edit-btn"
                                    onClick={handleBankEdit}
                                    title="Edit Bank Information"
                                >
                                    <i className="bi bi-pencil"></i> Edit Bank Info
                                </button>
                            </div>
                            <div className="emp-tab-grid">
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Account Holder Name</label>
                                                <p className="emp-info-value">{employee.account_holder_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Bank Name</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBankName(employee.bank)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Account Type</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getAccountTypeName(employee.type_of_account)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Name</label>
                                                <p className="emp-info-value">{employee.bank_branch_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Account Number</label>
                                                <p className="emp-info-value">{employee.account_number || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">IFSC Code</label>
                                                <p className="emp-info-value">{employee.ifsc_code || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'attachment':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <div className="emp-tab-header">
                                <h5 className="emp-tab-title">
                                    <i className="bi bi-paperclip"></i> Attachments
                                </h5>
                                <button
                                    className="emp-edit-btn"
                                    onClick={handleAttachmentEdit}
                                    title="Edit Attachments"
                                >
                                    <i className="bi bi-pencil"></i> Edit Attachments
                                </button>
                            </div>
                            <div className="emp-tab-grid">
                                {/* Column 1: Identity Documents */}
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">AADHAR CARD *</label>
                                                {employee.aadhar_card_upload_url ? (
                                                    <a href={employee.aadhar_card_upload_url} target="_blank" rel="noopener noreferrer" className="emp-doc-link">
                                                        <i className="bi bi-file-earmark-pdf"></i> View Aadhar Card
                                                    </a>
                                                ) : employee.aadhar_card_upload ? (
                                                    <a href={getFullImageUrl(employee.aadhar_card_upload)} target="_blank" rel="noopener noreferrer" className="emp-doc-link">
                                                        <i className="bi bi-file-earmark-pdf"></i> View Aadhar Card
                                                    </a>
                                                ) : (
                                                    <p className="emp-no-attachment">No attachment</p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">PAN CARD *</label>
                                                {employee.pan_card_upload_url ? (
                                                    <a href={employee.pan_card_upload_url} target="_blank" rel="noopener noreferrer" className="emp-doc-link">
                                                        <i className="bi bi-file-earmark-pdf"></i> View PAN Card
                                                    </a>
                                                ) : employee.pan_card_upload ? (
                                                    <a href={getFullImageUrl(employee.pan_card_upload)} target="_blank" rel="noopener noreferrer" className="emp-doc-link">
                                                        <i className="bi bi-file-earmark-pdf"></i> View PAN Card
                                                    </a>
                                                ) : (
                                                    <p className="emp-no-attachment">No attachment</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Employee Documents */}
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">EMPLOYEE PHOTO</label>
                                                {employeeImageUrl ? (
                                                    <a
                                                        href={employeeImageUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="emp-doc-link"
                                                    >
                                                        <i className="bi bi-file-earmark-image"></i> View Employee Photo
                                                    </a>
                                                ) : (
                                                    <p className="emp-no-attachment">No photo available</p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">BANK PROOF</label>
                                                {employee.bank_proof_upload_url ? (
                                                    <a
                                                        href={employee.bank_proof_upload_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="emp-doc-link"
                                                    >
                                                        <i className="bi bi-file-earmark-pdf"></i> View Bank Proof
                                                    </a>
                                                ) : employee.bank_proof_upload ? (
                                                    <a
                                                        href={getFullImageUrl(employee.bank_proof_upload)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="emp-doc-link"
                                                    >
                                                        <i className="bi bi-file-earmark-pdf"></i> View Bank Proof
                                                    </a>
                                                ) : (
                                                    <p className="emp-no-attachment">No attachment</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'company':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <h5 className="emp-tab-title">Company Information</h5>

                            {/* Success/Error Messages */}
                            {successMessage && (
                                <div className="emp-success-message">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <div>
                                        <strong>Success!</strong>
                                        <p>{successMessage}</p>
                                    </div>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="emp-error-message">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <div>
                                        <strong>Error!</strong>
                                        <p>{errorMessage}</p>
                                    </div>
                                </div>
                            )}

                            <div className="emp-tab-grid">
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Employee ID *</label>
                                                <p className="emp-info-value">{employee.username || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Department *</label>
                                                <select
                                                    className="emp-company-select"
                                                    value={companyFormData.department_id}
                                                    onChange={(e) => handleCompanyFieldChange('department_id', e.target.value)}
                                                    disabled={loadingRelatedData || savingCompanyInfo}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.name || dept.department_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Reporting To *</label>
                                                <select
                                                    className="emp-company-select"
                                                    value={companyFormData.reporting_to_id}
                                                    onChange={(e) => handleCompanyFieldChange('reporting_to_id', e.target.value)}
                                                    disabled={savingCompanyInfo}
                                                >
                                                    <option value="">Select Reporting To</option>
                                                    {allEmployees
                                                        .filter(emp => emp.id !== employee.id)
                                                        .map(emp => (
                                                            <option key={emp.id} value={emp.id}>
                                                                {emp.first_name} {emp.last_name} ({emp.username})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Password</label>
                                                <div className="emp-password-field">
                                                    <input
                                                        type="password"
                                                        className="emp-password-input"
                                                        value={companyFormData.password}
                                                        onChange={(e) => handleCompanyFieldChange('password', e.target.value)}
                                                        placeholder="Enter new password to reset"
                                                        disabled={savingCompanyInfo}
                                                    />
                                                    <button
                                                        className="emp-password-toggle"
                                                        type="button"
                                                        onClick={toggleCompanyPassword}
                                                        title={showCompanyPassword ? "Hide" : "Show password field"}
                                                        disabled={savingCompanyInfo}
                                                    >
                                                        <i className={`bi ${showCompanyPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                                    </button>
                                                </div>
                                                <small className="emp-field-note">Leave blank to keep current password</small>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Designation *</label>
                                                <select
                                                    className="emp-company-select"
                                                    value={companyFormData.designation_id}
                                                    onChange={(e) => handleCompanyFieldChange('designation_id', e.target.value)}
                                                    disabled={loadingRelatedData || savingCompanyInfo}
                                                >
                                                    <option value="">Select Designation</option>
                                                    {designations.map(designation => (
                                                        <option key={designation.id} value={designation.id}>
                                                            {designation.name || designation.designation_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label"></label>
                                                <button
                                                    className="emp-save-company-btn"
                                                    onClick={handleSaveCompanyInfo}
                                                    disabled={savingCompanyInfo}
                                                >
                                                    {savingCompanyInfo ? (
                                                        <>
                                                            <i className="bi bi-hourglass-split"></i> Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-save"></i> Submit
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Main render
    return (
        <div className="emp-view-container">
            {/* Set Password Modal */}
            {showSetPasswordModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget && !settingPassword) {
                        setShowSetPasswordModal(false);
                    }
                }}>
                    <div className="modal-content modal-sm">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-shield-lock"></i> Set/Reset Password
                                </h2>
                                <p className="employee-identifier">
                                    {employee?.first_name && employee?.last_name &&
                                        ` • ${employee.first_name} ${employee.last_name}`
                                    }
                                    {employee?.username && ` • ${employee.username}`}
                                </p>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowSetPasswordModal(false)}
                                disabled={settingPassword}
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

                            <div className="form-section">
                                <div className="edit-form-grid">
                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-lock"></i> New Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min. 8 characters)"
                                            disabled={settingPassword}
                                            className="password-input"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-lock-fill"></i> Confirm Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            disabled={settingPassword}
                                            className="password-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="password-requirements">
                                <h6>Password Requirements:</h6>
                                <ul>
                                    <li className={newPassword.length >= 8 ? 'requirement-met' : ''}>
                                        <i className={`bi ${newPassword.length >= 8 ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                        At least 8 characters
                                    </li>
                                    <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'requirement-met' : ''}>
                                        <i className={`bi ${newPassword === confirmPassword && newPassword.length > 0 ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                        Passwords match
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowSetPasswordModal(false)}
                                disabled={settingPassword}
                            >
                                <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleSavePassword}
                                disabled={settingPassword || !newPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                            >
                                {settingPassword ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i> Setting Password...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check"></i> Set Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget && !editLoading) {
                        setShowEditModal(false);
                    }
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-pencil-square"></i> Edit Employee
                                </h2>
                                <p className="employee-identifier">
                                    {editingEmployee?.first_name && editingEmployee?.last_name &&
                                        ` • ${editingEmployee.first_name} ${editingEmployee.last_name}`
                                    }
                                    {editingEmployee?.username && ` • ${editingEmployee.username}`}
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
                                            <i className="bi bi-telephone"></i> Personal Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="contact_info"
                                            value={editFormData.contact_info}
                                            onChange={handleEditFormChange}
                                            placeholder="10-digit phone number"
                                            required
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-phone"></i> Office Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="office_phone_number"
                                            value={editFormData.office_phone_number}
                                            onChange={handleEditFormChange}
                                            placeholder="10-digit office phone"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-envelope"></i> Personal Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editFormData.email}
                                            onChange={handleEditFormChange}
                                            placeholder="personal@example.com"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-envelope-at"></i> Office Email
                                        </label>
                                        <input
                                            type="email"
                                            name="office_email"
                                            value={editFormData.office_email}
                                            onChange={handleEditFormChange}
                                            placeholder="office@company.com"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group full-width">
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

                            {/* Address Information Section */}
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-geo-alt"></i> Address Information
                                </h3>
                                <div className="edit-form-grid">
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-building"></i> Branch State
                                        </label>
                                        <select
                                            name="branch_inner_state"
                                            value={editFormData.branch_inner_state}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading}
                                        >
                                            <option value="">Select State</option>
                                            {branchInnerStates.map(state => (
                                                <option key={state.id} value={state.id}>
                                                    {state.name || state.state_name || state.state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-geo"></i> Branch Location
                                        </label>
                                        <select
                                            name="branch_inner_location"
                                            value={editFormData.branch_inner_location}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading || !editFormData.branch_inner_state}
                                        >
                                            <option value="">Select Location</option>
                                            {branchInnerLocations.map(location => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name || location.location_name || location.location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-house"></i> Present Address
                                        </label>
                                        <textarea
                                            name="present_address"
                                            value={editFormData.present_address}
                                            onChange={handleEditFormChange}
                                            placeholder="Current address"
                                            rows="3"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-house-door"></i> Permanent Address
                                        </label>
                                        <textarea
                                            name="permanent_address"
                                            value={editFormData.permanent_address}
                                            onChange={handleEditFormChange}
                                            placeholder="Permanent address"
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
                                            <i className="bi bi-card-text"></i> Aadhar Number
                                        </label>
                                        <input
                                            type="text"
                                            name="aadhar_number"
                                            value={editFormData.aadhar_number}
                                            onChange={handleEditFormChange}
                                            placeholder="12-digit Aadhar"
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
                                            <i className="bi bi-image"></i> Employee Photo
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="employee_image"
                                                onChange={handleEditFileChange}
                                                accept="image/*"
                                                disabled={editLoading}
                                                id="employee-image-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="employee-image-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {editFormData.employee_image instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {editFormData.employee_image.name}
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

            {/* Bank Edit Modal */}
            {showBankEditModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget && !bankEditLoading) {
                        setShowBankEditModal(false);
                    }
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-pencil-square"></i> Edit Bank Information
                                </h2>
                                <p className="employee-identifier">
                                    {employee?.first_name && employee?.last_name &&
                                        ` • ${employee.first_name} ${employee.last_name}`
                                    }
                                    {employee?.username && ` • ${employee.username}`}
                                </p>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowBankEditModal(false)}
                                disabled={bankEditLoading}
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

                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-bank"></i> Bank Account Details
                                </h3>
                                <div className="edit-form-grid">
                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-person"></i> Account Holder Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="account_holder_name"
                                            value={bankFormData.account_holder_name}
                                            onChange={handleBankFormChange}
                                            placeholder="Enter account holder name"
                                            required
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-building"></i> Bank Name *
                                        </label>
                                        <select
                                            name="bank"
                                            value={bankFormData.bank}
                                            onChange={handleBankFormChange}
                                            disabled={bankEditLoading}
                                            required
                                        >
                                            <option value="">Select Bank</option>
                                            {banks.map(bank => (
                                                <option key={bank.id} value={bank.id}>
                                                    {bank.name || bank.bank_name || bank.bank}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-tag"></i> Account Type *
                                        </label>
                                        <select
                                            name="type_of_account"
                                            value={bankFormData.type_of_account}
                                            onChange={handleBankFormChange}
                                            disabled={bankEditLoading}
                                            required
                                        >
                                            <option value="">Select Account Type</option>
                                            {accountTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name || type.type_name || type.account_type || type.type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-geo-alt"></i> Branch Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="bank_branch_name"
                                            value={bankFormData.bank_branch_name}
                                            onChange={handleBankFormChange}
                                            placeholder="Enter branch name"
                                            required
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-credit-card"></i> Account Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="account_number"
                                            value={bankFormData.account_number}
                                            onChange={handleBankFormChange}
                                            placeholder="Enter account number"
                                            required
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-upc-scan"></i> IFSC Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            value={bankFormData.ifsc_code}
                                            onChange={handleBankFormChange}
                                            placeholder="Enter IFSC code"
                                            required
                                            disabled={bankEditLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowBankEditModal(false)}
                                disabled={bankEditLoading}
                            >
                                <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleSaveBank}
                                disabled={bankEditLoading}
                            >
                                {bankEditLoading ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i> Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save"></i> Save Bank Details
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attachment Edit Modal */}
            {showAttachmentEditModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget && !attachmentEditLoading) {
                        setShowAttachmentEditModal(false);
                    }
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-pencil-square"></i> Edit Attachments
                                </h2>
                                <p className="employee-identifier">
                                    {employee?.first_name && employee?.last_name &&
                                        ` • ${employee.first_name} ${employee.last_name}`
                                    }
                                    {employee?.username && ` • ${employee.username}`}
                                </p>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowAttachmentEditModal(false)}
                                disabled={attachmentEditLoading}
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

                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-files"></i> Document Uploads
                                </h3>
                                <div className="edit-form-grid">
                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-file-earmark-pdf"></i> AADHAR CARD
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="aadhar_card_upload"
                                                onChange={handleAttachmentFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="aadhar-card-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="aadhar-card-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentFormData.aadhar_card_upload instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentFormData.aadhar_card_upload.name}
                                                </div>
                                            )}
                                            {employee.aadhar_card_upload && !attachmentFormData.aadhar_card_upload && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getFullImageUrl(employee.aadhar_card_upload)} target="_blank" rel="noopener noreferrer" className="view-link">
                                                        <i className="bi bi-eye"></i> View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-file-earmark-pdf"></i> PAN CARD
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="pan_card_upload"
                                                onChange={handleAttachmentFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="pan-card-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="pan-card-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentFormData.pan_card_upload instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentFormData.pan_card_upload.name}
                                                </div>
                                            )}
                                            {employee.pan_card_upload && !attachmentFormData.pan_card_upload && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getFullImageUrl(employee.pan_card_upload)} target="_blank" rel="noopener noreferrer" className="view-link">
                                                        <i className="bi bi-eye"></i> View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-file-earmark-pdf"></i> BANK PROOF
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="bank_proof_upload"
                                                onChange={handleAttachmentFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="bank-proof-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="bank-proof-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentFormData.bank_proof_upload instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentFormData.bank_proof_upload.name}
                                                </div>
                                            )}
                                            {employee.bank_proof_upload && !attachmentFormData.bank_proof_upload && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getFullImageUrl(employee.bank_proof_upload)} target="_blank" rel="noopener noreferrer" className="view-link">
                                                        <i className="bi bi-eye"></i> View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-image"></i> EMPLOYEE PHOTO
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="employee_image"
                                                onChange={handleAttachmentFileChange}
                                                accept="image/*"
                                                disabled={attachmentEditLoading}
                                                id="employee-photo-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="employee-photo-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentFormData.employee_image instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentFormData.employee_image.name}
                                                </div>
                                            )}
                                            {employee.employee_image && !attachmentFormData.employee_image && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark-image"></i> Current photo exists
                                                    <a href={getFullImageUrl(employee.employee_image)} target="_blank" rel="noopener noreferrer" className="view-link">
                                                        <i className="bi bi-eye"></i> View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-info">
                                <i className="bi bi-info-circle"></i>
                                <small>Upload new files to replace existing ones. Leave blank to keep current files.</small>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowAttachmentEditModal(false)}
                                disabled={attachmentEditLoading}
                            >
                                <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleSaveAttachment}
                                disabled={attachmentEditLoading}
                            >
                                {attachmentEditLoading ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-cloud-upload"></i> Upload Files
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Edit Button */}
            <div className="emp-header">
                <div className="emp-header-left">
                    <h1 className="emp-title">
                        <i className="bi bi-person-badge"></i> Employee Details
                    </h1>
                </div>
                <div className="emp-header-right">
                    <div className="emp-status">
                        <span className={`emp-status-badge ${employee.is_active ? 'emp-status-active' : 'emp-status-inactive'}`}>
                            <i className="bi bi-circle-fill"></i>
                            {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Header */}
            <div className="emp-profile-card">
                <div className="emp-profile-content">
                    <div className="emp-profile-avatar">
                        {employeeImageUrl ? (
                            <img
                                src={employeeImageUrl}
                                alt={`${employee.first_name} ${employee.last_name}`}
                                className="emp-profile-img"
                                onError={(e) => {
                                    console.error('Image failed to load:', employeeImageUrl);
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : null}
                        {(!employeeImageUrl || !employeeImageUrl.includes('http')) && (
                            <div className="emp-profile-placeholder">
                                <i className="bi bi-person-circle"></i>
                            </div>
                        )}
                    </div>
                    <div className="emp-profile-info">
                        <h1 className="emp-profile-name">
                            {employee.first_name || 'Unknown'} {employee.last_name || ''}
                        </h1>
                        <div className="emp-profile-details">
                            <div className="emp-profile-detail">
                                <i className="bi bi-person-workspace"></i>
                                <span>Employee ID: <strong>{employee.username}</strong></span>
                            </div>
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Email: <strong>{employee.email || 'N/A'}</strong></span>
                            </div>
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Password: <strong>{localStorage.getItem("emp_password") || 'N/A'}</strong></span>
                            </div>
                        </div>
                        <div className="emp-profile-tags">
                            <span className="emp-profile-tag emp-tag-department">
                                Department: {employee.department_name || employee.department || 'N/A'}
                            </span>
                            <span className="emp-profile-tag emp-tag-designation">
                                Designation: {employee.designation_name || employee.designation || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="emp-tabs-container">
                <nav className="emp-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`emp-tab ${activeTab === tab.id ? 'emp-tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            type="button"
                        >
                            <i className={`${tab.icon} emp-tab-icon`}></i>
                            <span className="emp-tab-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Security Warning */}
            {activeTab === 'profile' && (
                <div className="emp-security-warning" role="alert">
                    <i className="bi bi-shield-check"></i>
                    <small>
                        Passwords are hashed and cannot be viewed for security reasons.
                        Click the key icon to set or reset the password.
                    </small>
                </div>
            )}
        </div>
    );
}

export default EmpView;