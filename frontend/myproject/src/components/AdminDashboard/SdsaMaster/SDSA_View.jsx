import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
// Create a new CSS file for SDSA View or reuse EmpView.css
import './SDSAView.css';

function SDSA_View() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const attachmentInputRef = useRef(null);
    const [sdsaUser, setSdsaUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allSdsaUsers, setAllSdsaUsers] = useState([]);

    // Separate password visibility states
    const [showProfilePassword, setShowProfilePassword] = useState(false);
    const [showCompanyPassword, setShowCompanyPassword] = useState(false);
    const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [settingPassword, setSettingPassword] = useState(false);

    const [activeTab, setActiveTab] = useState('profile');
    const [branchInnerStates, setBranchInnerStates] = useState([]);
    const [branchInnerLocations, setBranchInnerLocations] = useState([]);

    // Image States
    const [profileImage, setProfileImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imageSuccess, setImageSuccess] = useState('');

    // Attachment States
    const [attachments, setAttachments] = useState([]);
    const [attachmentLoading, setAttachmentLoading] = useState(false);
    const [attachmentError, setAttachmentError] = useState('');
    const [attachmentSuccess, setAttachmentSuccess] = useState('');
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [attachmentFormData, setAttachmentFormData] = useState({
        title: '',
        file: null,
        file_type: 'other',
        description: ''
    });

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSdsa, setEditingSdsa] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
        phone_number: '',
        password: '',
        alias_name: '',
        branch_inner_state: '',
        branch_inner_location: '',
        office_address: '',
        residential_address: '',
        company_name: '',
        rank: '',
        // Bank fields
        bank: '',
        account_number: '',
        ifsc_code: '',
        bank_branch_name: '',
        type_of_account: '',
        account_type: '',
        pan_number: '',
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

    // Bank Edit Modal States
    const [showBankEditModal, setShowBankEditModal] = useState(false);
    const [bankEditLoading, setBankEditLoading] = useState(false);
    const [bankFormData, setBankFormData] = useState({
        bank: '',
        account_number: '',
        ifsc_code: '',
        bank_branch_name: '',
        type_of_account: '',
        account_type: '',
        pan_number: ''
    });

    // Attachment Edit Modal States
    const [showAttachmentEditModal, setShowAttachmentEditModal] = useState(false);
    const [attachmentEditLoading, setAttachmentEditLoading] = useState(false);
    const [attachmentEditFormData, setAttachmentEditFormData] = useState({
        aadhaar_img: null,
        pan_img: null,
        photo: null,
        bank_proof_img: null,
        company_logo: null
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // New states for related data
    const [banks, setBanks] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [loadingRelatedData, setLoadingRelatedData] = useState(true);

    // Company Information states
    const [companyFormData, setCompanyFormData] = useState({
        reporting_to_id: '',
        password: ''
    });
    const [savingCompanyInfo, setSavingCompanyInfo] = useState(false);

    // Helper functions to get data from SDSA user
    const getFullName = (sdsa) => {
        if (!sdsa) return 'N/A';
        const firstName = sdsa.first_name || sdsa.firstName || '';
        const lastName = sdsa.last_name || sdsa.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || sdsa.username || sdsa.alias_name || 'N/A';
    };

    const getPhoneNumber = (sdsa) => {
        if (!sdsa) return 'N/A';
        if (sdsa.phone_number) return sdsa.phone_number;
        if (sdsa.phone) return sdsa.phone;
        if (sdsa.contact) return sdsa.contact;
        if (sdsa.mobile) return sdsa.mobile;
        return 'N/A';
    };

    const getEmail = (sdsa) => {
        if (!sdsa) return 'N/A';
        if (sdsa.email_id) return sdsa.email_id;
        if (sdsa.email) return sdsa.email;
        if (sdsa.emailId) return sdsa.emailId;
        return 'N/A';
    };

    // Get profile image URL
    const getProfileImageUrl = (sdsa) => {
        if (!sdsa) return null;

        const imageField = sdsa.profile_image || sdsa.profile_pic || sdsa.avatar || sdsa.image || sdsa.photo;

        if (!imageField) return null;

        if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
            return imageField;
        }

        if (typeof imageField === 'string') {
            if (imageField.startsWith('/media/') || imageField.startsWith('/uploads/')) {
                return `${api.defaults.baseURL || 'http://localhost:8000'}${imageField}`;
            }
            return `${api.defaults.baseURL || 'http://localhost:8000'}/media/sdsa_images/${imageField}`;
        }

        return null;
    };

    // Get attachment URL
    const getAttachmentUrl = (attachment) => {
        if (!attachment) return null;

        const fileField = attachment.file || attachment.attachment || attachment.document;

        if (!fileField) return null;

        if (typeof fileField === 'string' && (fileField.startsWith('http://') || fileField.startsWith('https://'))) {
            return fileField;
        }

        if (typeof fileField === 'string') {
            if (fileField.startsWith('/media/') || fileField.startsWith('/uploads/')) {
                return `${api.defaults.baseURL || 'http://localhost:8000'}${fileField}`;
            }
            return `${api.defaults.baseURL || 'http://localhost:8000'}/media/sdsa_attachments/${fileField}`;
        }

        return null;
    };

    // Get document URL from SDSA user fields
    const getDocumentUrl = (docPath) => {
        if (!docPath) return null;

        if (typeof docPath === 'string' && (docPath.startsWith('http://') || docPath.startsWith('https://'))) {
            return docPath;
        }

        if (typeof docPath === 'string') {
            if (docPath.startsWith('/media/') || docPath.startsWith('/uploads/')) {
                return `${api.defaults.baseURL || 'http://localhost:8000'}${docPath}`;
            }
            return `${api.defaults.baseURL || 'http://localhost:8000'}/media/sdsa/${docPath}`;
        }

        return null;
    };

    // Fetch attachments
    const fetchAttachments = async () => {
        if (!sdsaUser) return;

        try {
            setAttachmentLoading(true);
            const response = await api.get(`sdsa-attachments/?sdsa=${sdsaUser.id}`);

            let attachmentsList = [];
            if (Array.isArray(response.data)) {
                attachmentsList = response.data;
            } else if (response.data.results) {
                attachmentsList = response.data.results;
            }

            setAttachments(attachmentsList);
        } catch (error) {
            console.error('Error fetching attachments:', error);
            setAttachments([]);
        } finally {
            setAttachmentLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSdsaUsers();
    }, [id]);

    useEffect(() => {
        if (sdsaUser) {
            console.log('=== SDSA USER DATA DEBUG ===');
            console.log('Full SDSA object:', sdsaUser);
            console.log('All fields:', Object.keys(sdsaUser));
            console.log('Bank fields:', {
                type_of_account: sdsaUser.type_of_account,
                account_type: sdsaUser.account_type,
                bank: sdsaUser.bank,
                account_number: sdsaUser.account_number,
                ifsc_code: sdsaUser.ifsc_code,
                bank_branch_name: sdsaUser.bank_branch_name,
                pan_number: sdsaUser.pan_number
            });

            // Load profile image
            const imageUrl = getProfileImageUrl(sdsaUser);
            if (imageUrl) {
                setProfileImage(imageUrl);
            }

            // Initialize company form data
            setCompanyFormData({
                reporting_to_id: sdsaUser.reporting_to_id || sdsaUser.reporting_to || '',
                password: ''
            });

            // Initialize bank form data
            setBankFormData({
                bank: sdsaUser.bank || '',
                account_number: sdsaUser.account_number || '',
                ifsc_code: sdsaUser.ifsc_code || '',
                bank_branch_name: sdsaUser.bank_branch_name || '',
                type_of_account: sdsaUser.type_of_account || sdsaUser.account_type || '',
                account_type: sdsaUser.account_type || sdsaUser.type_of_account || '',
                pan_number: sdsaUser.pan_number || ''
            });

            fetchRelatedData();
            fetchAttachments();
        }
    }, [sdsaUser]);

    const fetchAllSdsaUsers = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching all SDSA users from /api/sdsa-users/');

            const response = await api.get('sdsa-users/');
            console.log('API Response structure:', {
                dataType: typeof response.data,
                isArray: Array.isArray(response.data),
                hasResults: !!response.data?.results,
                data: response.data
            });

            let sdsaUsersList = [];

            if (response.data && response.data.results) {
                sdsaUsersList = response.data.results;
            } else if (Array.isArray(response.data)) {
                sdsaUsersList = response.data;
            } else if (typeof response.data === 'object') {
                sdsaUsersList = Object.values(response.data);
            }

            console.log('Processed SDSA users list:', sdsaUsersList);
            console.log('Number of SDSA users:', sdsaUsersList.length);
            setAllSdsaUsers(sdsaUsersList);

            const foundSdsa = sdsaUsersList.find(sdsa => {
                return (
                    (sdsa.id && sdsa.id.toString() === id) ||
                    (sdsa.sdsa_id && sdsa.sdsa_id.toString() === id) ||
                    sdsa.username === id ||
                    sdsa.email_id === id ||
                    sdsa.phone_number === id
                );
            });

            if (foundSdsa) {
                console.log('SDSA user found:', foundSdsa);
                console.log('SDSA ID match:', {
                    requestedId: id,
                    foundId: foundSdsa.id,
                    foundSdsaId: foundSdsa.sdsa_id,
                    foundUsername: foundSdsa.username,
                    foundPhone: foundSdsa.phone_number
                });
                setSdsaUser(foundSdsa);
            } else {
                console.log('SDSA user not found with ID:', id);
                setError(`SDSA user with ID "${id}" not found.`);
            }

        } catch (err) {
            console.error('Error fetching SDSA users:', err);
            console.error('Error details:', err.response?.data);

            let errorMessage = 'Failed to load SDSA user data';

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

    // Fetch branch inner locations when branch state changes
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

    const fetchRelatedData = async () => {
        try {
            setLoadingRelatedData(true);

            const [
                banksResponse,
                accountTypesResponse,
                branchStatesResponse
            ] = await Promise.all([
                api.get('banks/').catch(() => ({ data: [] })),
                api.get('typeofaccounts/').catch(() => ({ data: [] })),
                api.get('branch-inner-states/').catch(() => ({ data: [] }))
            ]);

            setBanks(banksResponse.data || []);
            setAccountTypes(accountTypesResponse.data || []);

            let statesData = [];
            if (Array.isArray(branchStatesResponse.data)) {
                statesData = branchStatesResponse.data;
            } else if (branchStatesResponse.data.results) {
                statesData = branchStatesResponse.data.results;
            }
            setBranchInnerStates(statesData);

            if (sdsaUser?.branch_inner_state) {
                await fetchBranchInnerLocations(sdsaUser.branch_inner_state);
            }

        } catch (err) {
            console.error('Error fetching related data:', err);
        } finally {
            setLoadingRelatedData(false);
        }
    };

    // Password Set/Reset Functions
    const handleSetPassword = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setSuccessMessage('');
        setShowSetPasswordModal(true);
    };

    const handleSavePassword = async () => {
        if (!sdsaUser) return;

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
            console.log('Setting password for SDSA ID:', sdsaUser.id);

            // FIX: Send both password and confirm_password
            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, {
                password: newPassword,
                confirm_password: confirmPassword  // ← ADD THIS LINE
            });

            if (response.status === 200) {
                setSuccessMessage('Password updated successfully!');

                setTimeout(() => {
                    setShowSetPasswordModal(false);
                    setSuccessMessage('');
                    // Refresh user data
                    fetchAllSdsaUsers();
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

    // Toggle functions for password visibility
    const toggleProfilePassword = () => {
        setShowProfilePassword(!showProfilePassword);
    };

    const toggleCompanyPassword = () => {
        setShowCompanyPassword(!showCompanyPassword);
    };

    // Image Upload Handlers
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setImageError('Please select a valid image file (JPEG, PNG, GIF)');
            setTimeout(() => setImageError(''), 3000);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageError('Image size should be less than 5MB');
            setTimeout(() => setImageError(''), 3000);
            return;
        }

        setImageLoading(true);
        setImageError('');
        setImageSuccess('');

        try {
            const formData = new FormData();
            formData.append('profile_image', file);

            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                const updatedSdsa = {
                    ...sdsaUser,
                    ...response.data
                };
                setSdsaUser(updatedSdsa);

                const imageUrl = getProfileImageUrl(updatedSdsa);
                if (imageUrl) {
                    setProfileImage(imageUrl);
                }

                setImageSuccess('Profile image updated successfully!');
                e.target.value = '';

                setTimeout(() => {
                    fetchAllSdsaUsers();
                }, 1000);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setImageError('Failed to upload image. Please try again.');

            if (error.response?.data) {
                console.error('Error details:', error.response.data);
                if (error.response.data.profile_image) {
                    setImageError(error.response.data.profile_image.join(', '));
                }
            }
        } finally {
            setImageLoading(false);

            setTimeout(() => {
                setImageSuccess('');
                setImageError('');
            }, 3000);
        }
    };

    const handleRemoveImage = async () => {
        if (!sdsaUser) return;

        setImageLoading(true);
        setImageError('');
        setImageSuccess('');

        try {
            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, {
                profile_image: null
            });

            if (response.status === 200 || response.status === 201) {
                const updatedSdsa = {
                    ...sdsaUser,
                    ...response.data
                };
                setSdsaUser(updatedSdsa);
                setProfileImage(null);
                setImageSuccess('Profile image removed successfully!');

                setTimeout(() => {
                    fetchAllSdsaUsers();
                }, 1000);
            }
        } catch (error) {
            console.error('Error removing image:', error);
            setImageError('Failed to remove image. Please try again.');
        } finally {
            setImageLoading(false);

            setTimeout(() => {
                setImageSuccess('');
                setImageError('');
            }, 3000);
        }
    };

    // Attachment Handlers
    const handleAttachmentClick = () => {
        attachmentInputRef.current.click();
    };

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAttachmentFormData(prev => ({
            ...prev,
            file: file
        }));

        if (!attachmentFormData.title) {
            const fileName = file.name.split('.')[0];
            setAttachmentFormData(prev => ({
                ...prev,
                title: fileName
            }));
        }

        setShowAttachmentModal(true);
        e.target.value = '';
    };

    const handleAttachmentFormChange = (e) => {
        const { name, value } = e.target;
        setAttachmentFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUploadAttachment = async () => {
        if (!attachmentFormData.file) {
            setAttachmentError('Please select a file');
            return;
        }

        if (!attachmentFormData.title.trim()) {
            setAttachmentError('Please enter a title');
            return;
        }

        setAttachmentLoading(true);
        setAttachmentError('');
        setAttachmentSuccess('');

        try {
            const formData = new FormData();
            formData.append('sdsa', sdsaUser.id);
            formData.append('title', attachmentFormData.title);
            formData.append('file', attachmentFormData.file);
            formData.append('file_type', attachmentFormData.file_type);
            formData.append('description', attachmentFormData.description);

            const response = await api.post('sdsa-attachments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201 || response.status === 200) {
                setAttachmentSuccess('Attachment uploaded successfully!');

                setAttachmentFormData({
                    title: '',
                    file: null,
                    file_type: 'other',
                    description: ''
                });

                setShowAttachmentModal(false);
                fetchAttachments();
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            setAttachmentError('Failed to upload attachment. Please try again.');

            if (error.response?.data) {
                console.error('Error details:', error.response.data);
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        }
                    }
                    if (errors.length > 0) {
                        setAttachmentError(errors.join('; '));
                    }
                }
            }
        } finally {
            setAttachmentLoading(false);

            setTimeout(() => {
                setAttachmentSuccess('');
                setAttachmentError('');
            }, 3000);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        setAttachmentLoading(true);
        setAttachmentError('');
        setAttachmentSuccess('');

        try {
            const response = await api.delete(`sdsa-attachments/${attachmentId}/`);

            if (response.status === 204 || response.status === 200) {
                setAttachmentSuccess('Attachment deleted successfully!');
                fetchAttachments();

                if (selectedAttachment && selectedAttachment.id === attachmentId) {
                    setSelectedAttachment(null);
                }
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setAttachmentError('Failed to delete attachment. Please try again.');
        } finally {
            setAttachmentLoading(false);

            setTimeout(() => {
                setAttachmentSuccess('');
                setAttachmentError('');
            }, 3000);
        }
    };

    const handleDownloadAttachment = (attachment) => {
        const url = getAttachmentUrl(attachment);
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Bank Edit Handlers
    const handleBankEdit = () => {
        if (!sdsaUser) return;

        setBankFormData({
            bank: sdsaUser.bank || '',
            account_number: sdsaUser.account_number || '',
            ifsc_code: sdsaUser.ifsc_code || '',
            bank_branch_name: sdsaUser.bank_branch_name || '',
            type_of_account: sdsaUser.type_of_account || sdsaUser.account_type || '',
            account_type: sdsaUser.account_type || sdsaUser.type_of_account || '',
            pan_number: sdsaUser.pan_number || ''
        });

        setShowBankEditModal(true);
    };

    const handleBankFormChange = (e) => {
        const { name, value } = e.target;

        setBankFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Sync type_of_account and account_type
        if (name === 'type_of_account') {
            setBankFormData(prev => ({
                ...prev,
                account_type: value
            }));
        }

        if (name === 'account_type') {
            setBankFormData(prev => ({
                ...prev,
                type_of_account: value
            }));
        }
    };

    const handleSaveBank = async () => {
        if (!sdsaUser) return;

        setBankEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating bank info for SDSA ID:', sdsaUser.id);

            const updateData = {
                bank: bankFormData.bank || null,
                account_number: bankFormData.account_number || '',
                ifsc_code: bankFormData.ifsc_code || '',
                bank_branch_name: bankFormData.bank_branch_name || '',
                type_of_account: bankFormData.type_of_account || bankFormData.account_type || null,
                pan_number: bankFormData.pan_number || ''
            };

            console.log('Bank update data:', updateData);

            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('Bank information updated successfully!');

                const updatedSdsa = {
                    ...sdsaUser,
                    ...response.data
                };

                setSdsaUser(updatedSdsa);

                setTimeout(() => {
                    fetchAllSdsaUsers();
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

    // Attachment Edit Handlers
    const handleAttachmentEdit = () => {
        if (!sdsaUser) return;

        setAttachmentEditFormData({
            aadhaar_img: null,
            pan_img: null,
            photo: null,
            bank_proof_img: null,
            company_logo: null
        });

        setShowAttachmentEditModal(true);
    };

    const handleAttachmentEditFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setAttachmentEditFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSaveAttachmentEdit = async () => {
        if (!sdsaUser) return;

        setAttachmentEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating attachments for SDSA ID:', sdsaUser.id);

            const formData = new FormData();

            if (attachmentEditFormData.aadhaar_img instanceof File) {
                formData.append('aadhaar_img', attachmentEditFormData.aadhaar_img);
            }
            if (attachmentEditFormData.pan_img instanceof File) {
                formData.append('pan_img', attachmentEditFormData.pan_img);
            }
            if (attachmentEditFormData.photo instanceof File) {
                formData.append('photo', attachmentEditFormData.photo);
            }
            if (attachmentEditFormData.bank_proof_img instanceof File) {
                formData.append('bank_proof_img', attachmentEditFormData.bank_proof_img);
            }
            if (attachmentEditFormData.company_logo instanceof File) {
                formData.append('company_logo', attachmentEditFormData.company_logo);
            }

            // Check if any files were selected
            if (Array.from(formData.entries()).length === 0) {
                setErrorMessage('Please select at least one file to upload.');
                setAttachmentEditLoading(false);
                return;
            }

            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setSuccessMessage('Attachments updated successfully!');

                const updatedSdsa = {
                    ...sdsaUser,
                    ...response.data
                };

                setSdsaUser(updatedSdsa);

                setTimeout(() => {
                    fetchAllSdsaUsers();
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

    const getFileIcon = (fileType) => {
        const type = fileType?.toLowerCase() || 'other';

        if (type.includes('image')) return 'bi-file-image';
        if (type.includes('pdf')) return 'bi-file-pdf';
        if (type.includes('word') || type.includes('doc')) return 'bi-file-word';
        if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return 'bi-file-excel';
        if (type.includes('text') || type.includes('txt')) return 'bi-file-text';
        if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'bi-file-zip';
        if (type.includes('audio')) return 'bi-file-music';
        if (type.includes('video')) return 'bi-file-play';

        return 'bi-file-earmark';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getAccountTypeName = (accountTypeId) => {
        if (!accountTypeId) return 'N/A';

        let accountType = accountTypes.find(a =>
            a.id === accountTypeId ||
            a.id?.toString() === accountTypeId?.toString()
        );

        if (!accountType) {
            accountType = accountTypes.find(a =>
                a.type_id === accountTypeId ||
                a.type_id?.toString() === accountTypeId?.toString()
            );
        }

        if (!accountType) {
            accountType = accountTypes.find(a =>
                a.name?.toLowerCase() === accountTypeId?.toString()?.toLowerCase()
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

    const getBankName = (bankId) => {
        if (!bankId) return 'N/A';
        const bank = banks.find(b =>
            b.id === bankId ||
            b.bank_id === bankId ||
            b.pk === bankId
        );
        return bank ? (bank.name || bank.bank_name || bank.bank) : `Bank ${bankId}`;
    };

    const getBranchInnerStateName = (stateId) => {
        if (!stateId) return 'N/A';
        if (stateId === -1 || stateId === "-1") return 'N/A';

        const state = branchInnerStates.find(s =>
            s.id === stateId ||
            s.id?.toString() === stateId?.toString() ||
            s.state_id === stateId ||
            s.pk === stateId
        );

        return state ? (state.name || state.state_name || state.state || `State ${stateId}`) : `State ID: ${stateId}`;
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

        return location ? (location.name || location.location_name || location.location || `Location ${locationId}`) : `Location ID: ${locationId}`;
    };

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setSdsaUser(null);
        fetchAllSdsaUsers();
    };

    const handleCompanyFieldChange = (field, value) => {
        setCompanyFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveCompanyInfo = async () => {
        if (!sdsaUser) return;

        setSavingCompanyInfo(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updateData = {};

            if (companyFormData.reporting_to_id) {
                updateData.reporting_to = companyFormData.reporting_to_id;
            }

            // Only update password if provided
            if (companyFormData.password && companyFormData.password.trim() !== '') {
                updateData.password = companyFormData.password;
            }

            console.log('Updating SDSA info:', updateData);

            const response = await api.patch(`sdsa-users/${sdsaUser.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('SDSA information updated successfully!');

                const updatedSdsa = {
                    ...sdsaUser,
                    ...response.data,
                    reporting_to_id: companyFormData.reporting_to_id || sdsaUser.reporting_to_id
                };

                setSdsaUser(updatedSdsa);

                setCompanyFormData(prev => ({
                    ...prev,
                    password: ''
                }));

                setTimeout(() => {
                    fetchAllSdsaUsers();
                }, 1000);
            }
        } catch (error) {
            console.error('Error updating SDSA info:', error);
            let errorMsg = 'Failed to update SDSA information. ';

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

    const handleEdit = () => {
        if (!sdsaUser) return;

        setEditingSdsa(sdsaUser);
        setEditFormData({
            first_name: sdsaUser.first_name || '',
            last_name: sdsaUser.last_name || '',
            email_id: sdsaUser.email_id || '',
            phone_number: sdsaUser.phone_number || '',
            password: '',
            alias_name: sdsaUser.alias_name || '',
            branch_inner_state: sdsaUser.branch_inner_state || '',
            branch_inner_location: sdsaUser.branch_inner_location || '',
            office_address: sdsaUser.office_address || '',
            residential_address: sdsaUser.residential_address || '',
            company_name: sdsaUser.company_name || '',
            rank: sdsaUser.rank || '',
            // Bank fields
            bank: sdsaUser.bank || '',
            account_number: sdsaUser.account_number || '',
            ifsc_code: sdsaUser.ifsc_code || '',
            bank_branch_name: sdsaUser.bank_branch_name || '',
            type_of_account: sdsaUser.type_of_account || sdsaUser.account_type || '',
            account_type: sdsaUser.account_type || sdsaUser.type_of_account || '',
            pan_number: sdsaUser.pan_number || '',
            // Reference fields
            ref_name_1: sdsaUser.ref_name_1 || '',
            ref_relation_1: sdsaUser.ref_relation_1 || '',
            ref_mobile_1: sdsaUser.ref_mobile_1 || '',
            ref_address_1: sdsaUser.ref_address_1 || '',
            ref_name_2: sdsaUser.ref_name_2 || '',
            ref_relation_2: sdsaUser.ref_relation_2 || '',
            ref_mobile_2: sdsaUser.ref_mobile_2 || '',
            ref_address_2: sdsaUser.ref_address_2 || '',
        });

        if (sdsaUser.branch_inner_state) {
            fetchBranchInnerLocations(sdsaUser.branch_inner_state);
        }

        setShowEditModal(true);
    };

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

        // Sync type_of_account and account_type
        if (name === 'type_of_account') {
            setEditFormData(prev => ({
                ...prev,
                account_type: value
            }));
        }

        if (name === 'account_type') {
            setEditFormData(prev => ({
                ...prev,
                type_of_account: value
            }));
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSdsa) return;

        setEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Editing SDSA user ID:', editingSdsa.id);

            const updateData = {
                first_name: editFormData.first_name.trim(),
                last_name: editFormData.last_name.trim(),
                email_id: editFormData.email_id || '',
                phone_number: editFormData.phone_number || '',
                alias_name: editFormData.alias_name || '',
                branch_inner_state: editFormData.branch_inner_state || null,
                branch_inner_location: editFormData.branch_inner_location || null,
                office_address: editFormData.office_address || '',
                residential_address: editFormData.residential_address || '',
                company_name: editFormData.company_name || '',
                rank: editFormData.rank || '',
                // Bank fields
                bank: editFormData.bank || null,
                account_number: editFormData.account_number || '',
                ifsc_code: editFormData.ifsc_code || '',
                bank_branch_name: editFormData.bank_branch_name || '',
                type_of_account: editFormData.type_of_account || editFormData.account_type || null,
                pan_number: editFormData.pan_number || '',
                // Reference fields
                ref_name_1: editFormData.ref_name_1 || '',
                ref_relation_1: editFormData.ref_relation_1 || '',
                ref_mobile_1: editFormData.ref_mobile_1 || '',
                ref_address_1: editFormData.ref_address_1 || '',
                ref_name_2: editFormData.ref_name_2 || '',
                ref_relation_2: editFormData.ref_relation_2 || '',
                ref_mobile_2: editFormData.ref_mobile_2 || '',
                ref_address_2: editFormData.ref_address_2 || '',
            };

            // Only include password if it's provided and not empty
            if (editFormData.password && editFormData.password.trim() !== '') {
                updateData.password = editFormData.password;
            }

            console.log('Update data for SDSA:', updateData);

            const response = await api.patch(`sdsa-users/${editingSdsa.id}/`, updateData);

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('SDSA user updated successfully!');

                const updatedSdsa = {
                    ...editingSdsa,
                    ...response.data
                };

                console.log('Updated SDSA user for frontend:', updatedSdsa);

                setSdsaUser(updatedSdsa);
                setEditingSdsa(updatedSdsa);

                setTimeout(() => {
                    fetchAllSdsaUsers();
                }, 500);

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
                    <h3 className="emp-loading-title">Loading SDSA Details</h3>
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
                        <i className="bi bi-exclamation-triangle"></i> Error Loading SDSA User
                    </h1>
                </div>
                <div className="emp-error-card">
                    <div className="emp-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                    <h2 className="emp-error-message-title">Error Loading SDSA User</h2>
                    <p className="emp-error-message">{error}</p>

                    <div className="emp-debug-info">
                        <h6 className="emp-debug-title">Debug Information</h6>
                        <div className="emp-debug-content">
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Requested ID:</span>
                                <span className="emp-debug-value">{id}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Total SDSA users fetched:</span>
                                <span className="emp-debug-value">{allSdsaUsers.length}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">API Endpoint:</span>
                                <span className="emp-debug-value">/api/sdsa-users/</span>
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

    // No SDSA user found
    if (!sdsaUser) {
        return (
            <div className="emp-notfound-container">
                <div className="emp-notfound-header">
                    <h1 className="emp-notfound-title">
                        <i className="bi bi-person-x"></i> SDSA User Not Found
                    </h1>
                </div>
                <div className="emp-notfound-card">
                    <div className="emp-notfound-icon">
                        <i className="bi bi-search"></i>
                    </div>
                    <h2 className="emp-notfound-message">SDSA User Not Found</h2>
                    <p>No SDSA user found with ID: <strong>{id}</strong></p>
                    <p className="emp-notfound-info">
                        Total SDSA users in system: {allSdsaUsers.length}
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
        { id: 'company', label: 'Company Info', icon: 'bi-building' },
        { id: 'attachments', label: 'Attachments', icon: 'bi-paperclip' },
    ];

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <div className="emp-tab-grid">
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <h5 className="emp-section-title">
                                            <i className="bi bi-person-circle"></i>
                                            Personal Information
                                        </h5>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">First Name</label>
                                                <p className="emp-info-value">{sdsaUser.first_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Last Name</label>
                                                <p className="emp-info-value">{sdsaUser.last_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Alias Name</label>
                                                <p className="emp-info-value">{sdsaUser.alias_name || 'N/A'}</p>
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
                                                <label className="emp-info-label">Phone Number</label>
                                                <p className="emp-info-value">{getPhoneNumber(sdsaUser) || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Email</label>
                                                <p className="emp-info-value">{getEmail(sdsaUser) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="work-header">
                                            <h5 className="emp-section-title">
                                                <i className="bi bi-briefcase"></i>
                                                Additional Information
                                            </h5>

                                            <button
                                                className="emp-edit-btn"
                                                onClick={handleEdit}
                                                title="Edit SDSA User"
                                            >
                                                <i className="bi bi-pencil"></i> Edit Profile
                                            </button>
                                        </div>

                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Company Name</label>
                                                <p className="emp-info-value">{sdsaUser.company_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Rank</label>
                                                <p className="emp-info-value">{sdsaUser.rank || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Status</label>
                                                <p className="emp-info-value">
                                                    <span className={`status-badge ${sdsaUser.status === 1 || sdsaUser.status === true ? 'active' : 'inactive'}`}>
                                                        {sdsaUser.status === 1 || sdsaUser.status === true ? 'Active' : 'Inactive'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Created Date</label>
                                                <p className="emp-info-value">
                                                    {sdsaUser.created_at ? new Date(sdsaUser.created_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Last Updated</label>
                                                <p className="emp-info-value">
                                                    {sdsaUser.updated_at ? new Date(sdsaUser.updated_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="emp-section mt-4">
                                        <h5 className="emp-section-title">
                                            <i className="bi bi-building"></i>
                                            Branch Information
                                        </h5>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Office Address</label>
                                                <p className="emp-info-value">{sdsaUser.office_address || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Residential Address</label>
                                                <p className="emp-info-value">{sdsaUser.residential_address || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Inner State</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBranchInnerStateName(sdsaUser.branch_inner_state)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Inner Location</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBranchInnerLocationName(sdsaUser.branch_inner_location)}
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
                                                <p className="emp-info-value">{sdsaUser.ref_name_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{sdsaUser.ref_relation_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{sdsaUser.ref_mobile_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{sdsaUser.ref_address_1 || 'N/A'}</p>
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
                                                <p className="emp-info-value">{sdsaUser.ref_name_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{sdsaUser.ref_relation_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{sdsaUser.ref_mobile_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{sdsaUser.ref_address_2 || 'N/A'}</p>
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
                                                <label className="emp-info-label">Bank Name</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getBankName(sdsaUser.bank) || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Account Number</label>
                                                <p className="emp-info-value">{sdsaUser.account_number || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">IFSC Code</label>
                                                <p className="emp-info-value">{sdsaUser.ifsc_code || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Name</label>
                                                <p className="emp-info-value">{sdsaUser.bank_branch_name || 'N/A'}</p>
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
                                                        {getAccountTypeName(sdsaUser.type_of_account || sdsaUser.account_type) || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">PAN Card Number</label>
                                                <p className="emp-info-value">{sdsaUser.pan_number || 'N/A'}</p>
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
                                                <label className="emp-info-label">SDSA ID</label>
                                                <p className="emp-info-value">{sdsaUser.sdsa_id || sdsaUser.id || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Reporting To</label>
                                                <select
                                                    className="emp-company-select"
                                                    value={companyFormData.reporting_to_id}
                                                    onChange={(e) => handleCompanyFieldChange('reporting_to_id', e.target.value)}
                                                    disabled={savingCompanyInfo}
                                                >
                                                    <option value="">Select Reporting To</option>
                                                    {allSdsaUsers
                                                        .filter(sdsa => sdsa.id !== sdsaUser.id)
                                                        .map(sdsa => (
                                                            <option key={sdsa.id} value={sdsa.id}>
                                                                {getFullName(sdsa)} ({sdsa.phone_number || sdsa.email_id})
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
                                                        type={showCompanyPassword ? "text" : "password"}
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

            case 'attachments':
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

                            <input
                                type="file"
                                ref={attachmentInputRef}
                                style={{ display: 'none' }}
                                onChange={handleAttachmentChange}
                            />

                            {attachmentSuccess && (
                                <div className="emp-success-message">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <div>
                                        <strong>Success!</strong>
                                        <p>{attachmentSuccess}</p>
                                    </div>
                                </div>
                            )}

                            {attachmentError && (
                                <div className="emp-error-message">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <div>
                                        <strong>Error!</strong>
                                        <p>{attachmentError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="emp-attachments-list">
                                {attachmentLoading ? (
                                    <div className="emp-attachments-loading">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p>Loading attachments...</p>
                                    </div>
                                ) : (
                                    <div className="emp-attachments-container">
                                        {sdsaUser?.aadhaar_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">AADHAR CARD *</span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(sdsaUser.aadhaar_img),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Aadhar Card
                                                </button>
                                            </div>
                                        )}

                                        {sdsaUser?.pan_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">PAN CARD *</span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(sdsaUser.pan_img),
                                                        '_blank'
                                                    )}
                                                >
                                                    View PAN Card
                                                </button>
                                            </div>
                                        )}

                                        {sdsaUser?.photo && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">EMPLOYEE PHOTO</span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(sdsaUser.photo),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Employee Photo
                                                </button>
                                            </div>
                                        )}

                                        {sdsaUser?.bank_proof_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">BANK PROOF</span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(sdsaUser.bank_proof_img),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Bank Proof
                                                </button>
                                            </div>
                                        )}

                                        {sdsaUser?.company_logo && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">COMPANY LOGO</span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(sdsaUser.company_logo),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Company Logo
                                                </button>
                                            </div>
                                        )}

                                        {attachments.map((attachment) => (
                                            <div key={attachment.id} className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    {attachment.title?.toUpperCase() || 'ATTACHMENT'}
                                                </span>
                                                <div className="emp-attachment-actions">
                                                    <button
                                                        className="emp-attachment-view"
                                                        onClick={() => handleDownloadAttachment(attachment)}
                                                    >
                                                        View {attachment.title || 'Attachment'}
                                                    </button>
                                                    <button
                                                        className="emp-attachment-delete"
                                                        onClick={() => handleDeleteAttachment(attachment.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}


                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="emp-view-container">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
            />

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
                                    {sdsaUser?.first_name && sdsaUser?.last_name &&
                                        ` • ${sdsaUser.first_name} ${sdsaUser.last_name}`
                                    }
                                    {sdsaUser?.phone_number && ` • ${sdsaUser.phone_number}`}
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
                                            <i className="bi bi-person"></i> First Name
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
                                            <i className="bi bi-person"></i> Last Name
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
                                            <i className="bi bi-telephone"></i> Phone Number
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
                                            <i className="bi bi-envelope"></i> Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email_id"
                                            value={editFormData.email_id}
                                            onChange={handleEditFormChange}
                                            placeholder="email@example.com"
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
                                </div>
                            </div>

                            {/* Branch & Address Information Section */}
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-building"></i> Branch & Address Information
                                </h3>
                                <div className="edit-form-grid">
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-building"></i> Branch Inner State
                                        </label>
                                        <select
                                            name="branch_inner_state"
                                            value={editFormData.branch_inner_state}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading}
                                        >
                                            <option value="">Select Branch Inner State</option>
                                            {branchInnerStates.map((state) => (
                                                <option key={state.id} value={state.id}>
                                                    {state.name || state.state_name || state.state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-geo"></i> Branch Inner Location
                                        </label>
                                        <select
                                            name="branch_inner_location"
                                            value={editFormData.branch_inner_location}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading || !editFormData.branch_inner_state}
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
                                        {editFormData.branch_inner_state && branchInnerLocations.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                No branch inner locations found for this state
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-house"></i> Office Address
                                        </label>
                                        <textarea
                                            name="office_address"
                                            value={editFormData.office_address}
                                            onChange={handleEditFormChange}
                                            placeholder="Office address"
                                            rows="2"
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
                                            rows="2"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-building"></i> Company Name
                                        </label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={editFormData.company_name}
                                            onChange={handleEditFormChange}
                                            placeholder="Company name"
                                            disabled={editLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-tag"></i> Rank
                                        </label>
                                        <input
                                            type="text"
                                            name="rank"
                                            value={editFormData.rank}
                                            onChange={handleEditFormChange}
                                            placeholder="Rank/Position"
                                            disabled={editLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reference Information Section */}
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-person-lines-fill"></i> Reference Information
                                </h3>

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
                    <div className="modal-content modal-sm">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-pencil-square"></i> Edit Bank Information
                                </h2>
                                <p className="employee-identifier">
                                    {sdsaUser &&
                                        ` • ${getFullName(sdsaUser)} • ${getPhoneNumber(sdsaUser)}`
                                    }
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
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-bank"></i> Bank Name
                                        </label>
                                        <select
                                            name="bank"
                                            value={bankFormData.bank}
                                            onChange={handleBankFormChange}
                                            disabled={bankEditLoading}
                                        >
                                            <option value="">Select Bank</option>
                                            {banks.map(bank => (
                                                <option key={bank.id} value={bank.id}>
                                                    {bank.bank_name || bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-credit-card"></i> Account Number
                                        </label>
                                        <input
                                            type="text"
                                            name="account_number"
                                            value={bankFormData.account_number}
                                            onChange={handleBankFormChange}
                                            placeholder="Account Number"
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-code"></i> IFSC Code
                                        </label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            value={bankFormData.ifsc_code}
                                            onChange={handleBankFormChange}
                                            placeholder="IFSC Code"
                                            maxLength="11"
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-building"></i> Branch Name
                                        </label>
                                        <input
                                            type="text"
                                            name="bank_branch_name"
                                            value={bankFormData.bank_branch_name}
                                            onChange={handleBankFormChange}
                                            placeholder="Branch Name"
                                            disabled={bankEditLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-wallet2"></i> Account Type
                                        </label>
                                        <select
                                            name="type_of_account"
                                            value={bankFormData.type_of_account}
                                            onChange={handleBankFormChange}
                                            disabled={bankEditLoading}
                                        >
                                            <option value="">Select Account Type</option>
                                            {accountTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.account_type || type.name || type.type_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-credit-card-2-front"></i> PAN Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={bankFormData.pan_number}
                                            onChange={handleBankFormChange}
                                            placeholder="PAN Card Number"
                                            maxLength="10"
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
                    <div className="modal-content modal-sm">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-pencil-square"></i> Edit Attachments
                                </h2>
                                <p className="employee-identifier">
                                    {sdsaUser &&
                                        ` • ${getFullName(sdsaUser)} • ${getPhoneNumber(sdsaUser)}`
                                    }
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
                                                name="aadhaar_img"
                                                onChange={handleAttachmentEditFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="aadhaar-img-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="aadhaar-img-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentEditFormData.aadhaar_img instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentEditFormData.aadhaar_img.name}
                                                </div>
                                            )}
                                            {sdsaUser?.aadhaar_img && !attachmentEditFormData.aadhaar_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(sdsaUser.aadhaar_img)} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                                name="pan_img"
                                                onChange={handleAttachmentEditFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="pan-img-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="pan-img-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentEditFormData.pan_img instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentEditFormData.pan_img.name}
                                                </div>
                                            )}
                                            {sdsaUser?.pan_img && !attachmentEditFormData.pan_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(sdsaUser.pan_img)} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                                name="photo"
                                                onChange={handleAttachmentEditFileChange}
                                                accept="image/*"
                                                disabled={attachmentEditLoading}
                                                id="photo-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="photo-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentEditFormData.photo instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentEditFormData.photo.name}
                                                </div>
                                            )}
                                            {sdsaUser?.photo && !attachmentEditFormData.photo && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark-image"></i> Current photo exists
                                                    <a href={getDocumentUrl(sdsaUser.photo)} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                                name="bank_proof_img"
                                                onChange={handleAttachmentEditFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={attachmentEditLoading}
                                                id="bank-proof-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="bank-proof-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentEditFormData.bank_proof_img instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentEditFormData.bank_proof_img.name}
                                                </div>
                                            )}
                                            {sdsaUser?.bank_proof_img && !attachmentEditFormData.bank_proof_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(sdsaUser.bank_proof_img)} target="_blank" rel="noopener noreferrer" className="view-link">
                                                        <i className="bi bi-eye"></i> View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-building"></i> COMPANY LOGO
                                        </label>
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="company_logo"
                                                onChange={handleAttachmentEditFileChange}
                                                accept="image/*"
                                                disabled={attachmentEditLoading}
                                                id="company-logo-upload"
                                                className="file-input"
                                            />
                                            <label htmlFor="company-logo-upload" className="file-upload-btn">
                                                <i className="bi bi-cloud-upload"></i> Choose File
                                            </label>
                                            {attachmentEditFormData.company_logo instanceof File && (
                                                <div className="file-info">
                                                    <i className="bi bi-check-circle"></i> Selected: {attachmentEditFormData.company_logo.name}
                                                </div>
                                            )}
                                            {sdsaUser?.company_logo && !attachmentEditFormData.company_logo && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(sdsaUser.company_logo)} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                onClick={handleSaveAttachmentEdit}
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

            {/* Attachment Upload Modal */}
            {showAttachmentModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget && !attachmentLoading) {
                        setShowAttachmentModal(false);
                        setAttachmentFormData({
                            title: '',
                            file: null,
                            file_type: 'other',
                            description: ''
                        });
                    }
                }}>
                    <div className="modal-content modal-sm">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>
                                    <i className="bi bi-upload"></i> Upload Attachment
                                </h2>
                                <p className="employee-identifier">
                                    {attachmentFormData.file && ` • ${attachmentFormData.file.name}`}
                                </p>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowAttachmentModal(false);
                                    setAttachmentFormData({
                                        title: '',
                                        file: null,
                                        file_type: 'other',
                                        description: ''
                                    });
                                }}
                                disabled={attachmentLoading}
                                aria-label="Close modal"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            {attachmentError && (
                                <div className="error-message">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <div>
                                        <strong>Error!</strong>
                                        <p>{attachmentError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="form-section">
                                <div className="form-group">
                                    <label>
                                        <i className="bi bi-tag"></i> Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={attachmentFormData.title}
                                        onChange={handleAttachmentFormChange}
                                        placeholder="Enter document title"
                                        disabled={attachmentLoading}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="bi bi-file-earmark"></i> File Type
                                    </label>
                                    <select
                                        name="file_type"
                                        value={attachmentFormData.file_type}
                                        onChange={handleAttachmentFormChange}
                                        disabled={attachmentLoading}
                                    >
                                        <option value="other">Other</option>
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                        <option value="document">Document</option>
                                        <option value="spreadsheet">Spreadsheet</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="archive">Archive</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="bi bi-file-text"></i> Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={attachmentFormData.description}
                                        onChange={handleAttachmentFormChange}
                                        placeholder="Enter description (optional)"
                                        rows="3"
                                        disabled={attachmentLoading}
                                    />
                                </div>

                                {attachmentFormData.file && (
                                    <div className="file-preview">
                                        <div className="file-preview-icon">
                                            <i className={getFileIcon(attachmentFormData.file.type)}></i>
                                        </div>
                                        <div className="file-preview-details">
                                            <strong>{attachmentFormData.file.name}</strong>
                                            <span>{formatFileSize(attachmentFormData.file.size)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowAttachmentModal(false);
                                    setAttachmentFormData({
                                        title: '',
                                        file: null,
                                        file_type: 'other',
                                        description: ''
                                    });
                                }}
                                disabled={attachmentLoading}
                            >
                                <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleUploadAttachment}
                                disabled={attachmentLoading || !attachmentFormData.title.trim() || !attachmentFormData.file}
                            >
                                {attachmentLoading ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-upload"></i> Upload
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
                        <i className="bi bi-person-badge"></i> SDSA User Details
                    </h1>
                </div>
                <div className="emp-header-right">
                    <div className="emp-status">
                        <span className={`emp-status-badge ${sdsaUser.status === 1 || sdsaUser.status === true ? 'emp-status-active' : 'emp-status-inactive'}`}>
                            <i className="bi bi-circle-fill"></i>
                            {sdsaUser.status === 1 || sdsaUser.status === true ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Header with Image Upload */}
            <div className="emp-profile-card">
                <div className="emp-profile-content">
                    <div className="emp-profile-avatar">
                        {imageLoading ? (
                            <div className="emp-profile-image-loading">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : profileImage ? (
                            <div className="emp-profile-image-container">
                                <img
                                    src={profileImage}
                                    alt={getFullName(sdsaUser)}
                                    className="emp-profile-image"
                                    onError={(e) => {
                                        console.error('Error loading image:', e);
                                        setProfileImage(null);
                                    }}
                                />
                                <div className="emp-profile-image-overlay">
                                    <button
                                        className="emp-profile-image-action"
                                        onClick={handleImageClick}
                                        title="Change profile image"
                                    >
                                        <i className="bi bi-camera"></i>
                                    </button>
                                    <button
                                        className="emp-profile-image-action"
                                        onClick={handleRemoveImage}
                                        title="Remove profile image"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="emp-profile-placeholder">
                                <i className="bi bi-person-circle"></i>
                                <button
                                    className="emp-profile-image-upload-btn"
                                    onClick={handleImageClick}
                                    title="Upload profile image"
                                >
                                    <i className="bi bi-camera"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="emp-profile-info">
                        <h1 className="emp-profile-name">
                            {getFullName(sdsaUser)}
                        </h1>
                        <div className="emp-profile-details">
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Email: <strong>{getEmail(sdsaUser) || 'N/A'}</strong></span>
                            </div>
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Password: <strong>{localStorage.getItem("sdsa_password") || 'N/A'}</strong></span>
                            </div>
                        </div>

                        {imageSuccess && (
                            <div className="emp-profile-image-success">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>{imageSuccess}</span>
                            </div>
                        )}
                        {imageError && (
                            <div className="emp-profile-image-error">
                                <i className="bi bi-exclamation-circle-fill"></i>
                                <span>{imageError}</span>
                            </div>
                        )}
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
                            {tab.id === 'attachments' && attachments.length > 0 && (
                                <span className="emp-tab-badge">{attachments.length}</span>
                            )}
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

export default SDSA_View;