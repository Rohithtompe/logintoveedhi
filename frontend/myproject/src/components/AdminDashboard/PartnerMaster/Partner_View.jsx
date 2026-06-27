import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';

function Partner_View() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [partnerUser, setPartnerUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allPartnerUsers, setAllPartnerUsers] = useState([]);

    // Separate password visibility states
    const [showProfilePassword, setShowProfilePassword] = useState(false);
    const [showCompanyPassword, setShowCompanyPassword] = useState(false);
    const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [settingPassword, setSettingPassword] = useState(false);

    const [activeTab, setActiveTab] = useState('profile');

    // Profile Image State
    const [profileImage, setProfileImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imageSuccess, setImageSuccess] = useState('');
    const fileInputRef = useRef(null);

    // Attachment States
    const [attachments, setAttachments] = useState([]);
    const [attachmentLoading, setAttachmentLoading] = useState(false);
    const [attachmentError, setAttachmentError] = useState('');
    const [attachmentSuccess, setAttachmentSuccess] = useState('');
    const attachmentInputRef = useRef(null);

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    // Bank Edit Modal States
    const [showBankEditModal, setShowBankEditModal] = useState(false);
    const [bankEditLoading, setBankEditLoading] = useState(false);
    const [bankFormData, setBankFormData] = useState({
        bank: '',
        account_number: '',
        ifsc_code: '',
        bank_branch_name: '',
        type_of_account: '',
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

    // Branch Inner State/Location States
    const [branchInnerStates, setBranchInnerStates] = useState([]);
    const [branchInnerLocations, setBranchInnerLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
        phone_number: '',
        password: '',
        alias_name: '',
        company_name: '',
        branch_inner_state: '',
        branch_inner_location: '',
        office_address: '',
        residential_address: '',
        aadhaar_number: '',
        pan_number: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        account_type: '',
        ref_name_1: '',
        ref_relation_1: '',
        ref_mobile_1: '',
        ref_address_1: '',
        ref_name_2: '',
        ref_relation_2: '',
        ref_mobile_2: '',
        ref_address_2: '',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // New states for related data
    const [banks, setBanks] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [partnerTypes, setPartnerTypes] = useState([]);
    const [loadingRelatedData, setLoadingRelatedData] = useState(true);

    // Company Information states
    const [companyFormData, setCompanyFormData] = useState({
        reporting_to_id: '',
        password: ''
    });
    const [savingCompanyInfo, setSavingCompanyInfo] = useState(false);

    // Helper functions to get data from Partner user
    const getFullName = (partner) => {
        if (!partner) return 'N/A';
        const firstName = partner.first_name || partner.firstName || '';
        const lastName = partner.last_name || partner.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || partner.username || partner.alias_name || 'N/A';
    };

    const getPhoneNumber = (partner) => {
        if (!partner) return 'N/A';
        if (partner.phone_number) return partner.phone_number;
        if (partner.phone) return partner.phone;
        if (partner.contact) return partner.contact;
        if (partner.mobile) return partner.mobile;
        return 'N/A';
    };

    const getEmail = (partner) => {
        if (!partner) return 'N/A';
        if (partner.email_id) return partner.email_id;
        if (partner.email) return partner.email;
        if (partner.emailId) return partner.emailId;
        return 'N/A';
    };

    // Get profile image URL
    const getProfileImageUrl = (partner) => {
        if (!partner) return null;

        const imageField = partner.profile_image || partner.profile_pic || partner.avatar || partner.image || partner.photo;

        if (!imageField) return null;

        if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
            return imageField;
        }

        if (typeof imageField === 'string') {
            if (imageField.startsWith('/media/') || imageField.startsWith('/uploads/')) {
                return `${api.defaults.baseURL || 'http://localhost:8000'}${imageField}`;
            }
            return `${api.defaults.baseURL || 'http://localhost:8000'}/media/partner/photos/${imageField}`;
        }

        return null;
    };

    // Get document URL helper
    const getDocumentUrl = (documentField, subfolder) => {
        if (!documentField) return null;

        if (typeof documentField === 'string') {
            if (documentField.startsWith('http://') || documentField.startsWith('https://')) {
                return documentField;
            }
            if (documentField.startsWith('/media/') || documentField.startsWith('/uploads/')) {
                return `${api.defaults.baseURL || 'http://localhost:8000'}${documentField}`;
            }
            return `${api.defaults.baseURL || 'http://localhost:8000'}/media/partner/${subfolder}/${documentField}`;
        }
        return null;
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
        if (!partnerUser) return;

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
            console.log('Setting password for Partner ID:', partnerUser.id);

            // FIX: Send both password and confirm_password
            const response = await api.patch(`partner-users/${partnerUser.id}/`, {
                password: newPassword,
                confirm_password: confirmPassword  // ← ADD THIS LINE
            });

            if (response.status === 200) {
                setSuccessMessage('Password updated successfully!');

                setTimeout(() => {
                    setShowSetPasswordModal(false);
                    setSuccessMessage('');
                    // Refresh user data
                    fetchAllPartnerUsers();
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

    // Fetch attachments
    const fetchAttachments = async () => {
        if (!partnerUser) return;

        try {
            setAttachmentLoading(true);
            const response = await api.get(`partner-attachments/?partner=${partnerUser.id}`);

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

            const response = await api.patch(`partner-users/${partnerUser.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                const updatedPartner = {
                    ...partnerUser,
                    ...response.data
                };
                setPartnerUser(updatedPartner);

                const imageUrl = getProfileImageUrl(updatedPartner);
                if (imageUrl) {
                    setProfileImage(imageUrl);
                }

                setImageSuccess('Profile image updated successfully!');
                e.target.value = '';

                setTimeout(() => {
                    fetchAllPartnerUsers();
                }, 1000);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setImageError('Failed to upload image. Please try again.');
        } finally {
            setImageLoading(false);
            setTimeout(() => {
                setImageSuccess('');
                setImageError('');
            }, 3000);
        }
    };

    const handleRemoveImage = async () => {
        if (!partnerUser) return;

        setImageLoading(true);
        setImageError('');
        setImageSuccess('');

        try {
            const response = await api.patch(`partner-users/${partnerUser.id}/`, {
                profile_image: null
            });

            if (response.status === 200 || response.status === 201) {
                const updatedPartner = {
                    ...partnerUser,
                    ...response.data
                };
                setPartnerUser(updatedPartner);
                setProfileImage(null);
                setImageSuccess('Profile image removed successfully!');

                setTimeout(() => {
                    fetchAllPartnerUsers();
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

    // Attachment Handlers - View and Delete only
    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        setAttachmentLoading(true);
        setAttachmentError('');
        setAttachmentSuccess('');

        try {
            const response = await api.delete(`partner-attachments/${attachmentId}/`);

            if (response.status === 204 || response.status === 200) {
                setAttachmentSuccess('Attachment deleted successfully!');
                setAttachments(prev => prev.filter(att => att.id !== attachmentId));
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
        const url = getDocumentUrl(attachment.file, 'attachments');
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Bank Edit Handlers
    const handleBankEdit = () => {
        if (!partnerUser) return;

        setBankFormData({
            bank: partnerUser.bank || '',
            account_number: partnerUser.account_number || '',
            ifsc_code: partnerUser.ifsc_code || '',
            bank_branch_name: partnerUser.bank_branch_name || '',
            type_of_account: partnerUser.type_of_account || partnerUser.account_type || '',
            pan_number: partnerUser.pan_number || ''
        });

        setShowBankEditModal(true);
    };

    const handleBankFormChange = (e) => {
        const { name, value } = e.target;
        setBankFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveBank = async () => {
        if (!partnerUser) return;

        setBankEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating bank info for Partner ID:', partnerUser.id);

            const updateData = {
                bank: bankFormData.bank || null,
                account_number: bankFormData.account_number || '',
                ifsc_code: bankFormData.ifsc_code || '',
                bank_branch_name: bankFormData.bank_branch_name || '',
                type_of_account: bankFormData.type_of_account || null,
                pan_number: bankFormData.pan_number || ''
            };

            console.log('Bank update data:', updateData);

            const response = await api.patch(`partner-users/${partnerUser.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('Bank information updated successfully!');

                const updatedPartner = {
                    ...partnerUser,
                    ...response.data
                };

                setPartnerUser(updatedPartner);

                setTimeout(() => {
                    fetchAllPartnerUsers();
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
        if (!partnerUser) return;

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
        if (!partnerUser) return;

        setAttachmentEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Updating attachments for Partner ID:', partnerUser.id);

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

            const response = await api.patch(`partner-users/${partnerUser.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setSuccessMessage('Attachments updated successfully!');

                const updatedPartner = {
                    ...partnerUser,
                    ...response.data
                };

                setPartnerUser(updatedPartner);

                // Update profile image if photo was uploaded
                if (attachmentEditFormData.photo instanceof File) {
                    const imageUrl = getProfileImageUrl(updatedPartner);
                    if (imageUrl) {
                        setProfileImage(imageUrl);
                    }
                }

                setTimeout(() => {
                    fetchAllPartnerUsers();
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
        return 'bi-file-earmark';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper functions for branch inner state/location
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

    // Fetch branch inner locations by state ID
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
            const filtered = branchInnerLocations.filter(location =>
                location.branch_inner_state == stateId ||
                location.state_id == stateId
            );
            setFilteredLocations(filtered);
        }
    };

    useEffect(() => {
        fetchAllPartnerUsers();
    }, [id]);

    useEffect(() => {
        if (partnerUser) {
            console.log('=== PARTNER USER DATA DEBUG ===');
            console.log('Full Partner object:', partnerUser);
            console.log('All fields:', Object.keys(partnerUser));
            console.log('Document fields:', {
                photo: partnerUser.photo,
                pan_img: partnerUser.pan_img,
                aadhaar_img: partnerUser.aadhaar_img,
                bank_proof_img: partnerUser.bank_proof_img,
                company_logo: partnerUser.company_logo
            });

            // Load profile image
            const imageUrl = getProfileImageUrl(partnerUser);
            if (imageUrl) {
                setProfileImage(imageUrl);
            }

            // Initialize bank form data
            setBankFormData({
                bank: partnerUser.bank || '',
                account_number: partnerUser.account_number || '',
                ifsc_code: partnerUser.ifsc_code || '',
                bank_branch_name: partnerUser.bank_branch_name || '',
                type_of_account: partnerUser.type_of_account || partnerUser.account_type || '',
                pan_number: partnerUser.pan_number || ''
            });

            setCompanyFormData({
                reporting_to_id: partnerUser.reporting_to_id || partnerUser.reporting_to || '',
                password: ''
            });

            fetchRelatedData();
            fetchAttachments();
        }
    }, [partnerUser]);

    const fetchAllPartnerUsers = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching all Partner users from /api/partner-users/');

            const response = await api.get('partner-users/');
            console.log('API Response structure:', {
                dataType: typeof response.data,
                isArray: Array.isArray(response.data),
                hasResults: !!response.data?.results,
                data: response.data
            });

            let partnerUsersList = [];

            if (response.data && response.data.results) {
                partnerUsersList = response.data.results;
            } else if (Array.isArray(response.data)) {
                partnerUsersList = response.data;
            } else if (typeof response.data === 'object') {
                partnerUsersList = Object.values(response.data);
            }

            console.log('Processed Partner users list:', partnerUsersList);
            console.log('Number of Partner users:', partnerUsersList.length);
            setAllPartnerUsers(partnerUsersList);

            const foundPartner = partnerUsersList.find(partner => {
                return (
                    (partner.id && partner.id.toString() === id) ||
                    (partner.partner_id && partner.partner_id.toString() === id) ||
                    partner.username === id ||
                    partner.email_id === id ||
                    partner.phone_number === id
                );
            });

            if (foundPartner) {
                console.log('Partner user found:', foundPartner);
                console.log('Partner ID match:', {
                    requestedId: id,
                    foundId: foundPartner.id,
                    foundPartnerId: foundPartner.partner_id,
                    foundUsername: foundPartner.username,
                    foundPhone: foundPartner.phone_number
                });
                setPartnerUser(foundPartner);
            } else {
                console.log('Partner user not found with ID:', id);
                setError(`Partner user with ID "${id}" not found.`);
            }

        } catch (err) {
            console.error('Error fetching Partner users:', err);
            console.error('Error details:', err.response?.data);

            let errorMessage = 'Failed to load Partner user data';

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
                banksResponse,
                accountTypesResponse,
                partnerTypesResponse,
                branchStatesResponse,
                branchLocationsResponse
            ] = await Promise.all([
                api.get('banks/').catch(() => ({ data: [] })),
                api.get('typeofaccounts/').catch(() => ({ data: [] })),
                api.get('partner-type/').catch(() => ({ data: [] })),
                api.get('branch-inner-states/').catch(() => ({ data: [] })),
                api.get('branch-inner-locations/').catch(() => ({ data: [] }))
            ]);

            setBanks(banksResponse.data || []);
            setAccountTypes(accountTypesResponse.data || []);
            setPartnerTypes(partnerTypesResponse.data || []);

            let statesData = [];
            if (Array.isArray(branchStatesResponse.data)) {
                statesData = branchStatesResponse.data;
            } else if (branchStatesResponse.data.results) {
                statesData = branchStatesResponse.data.results;
            }
            setBranchInnerStates(statesData);

            let locationsData = [];
            if (Array.isArray(branchLocationsResponse.data)) {
                locationsData = branchLocationsResponse.data;
            } else if (branchLocationsResponse.data.results) {
                locationsData = branchLocationsResponse.data.results;
            }
            setBranchInnerLocations(locationsData);

            if (partnerUser?.branch_inner_state) {
                await fetchBranchInnerLocations(partnerUser.branch_inner_state);
            }

        } catch (err) {
            console.error('Error fetching related data:', err);
        } finally {
            setLoadingRelatedData(false);
        }
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

    const getPartnerTypeName = (partnerTypeId) => {
        if (!partnerTypeId) return 'N/A';
        const partnerType = partnerTypes.find(p =>
            p.id === partnerTypeId ||
            p.partner_type_id === partnerTypeId ||
            p.pk === partnerTypeId
        );
        return partnerType ? (partnerType.name || partnerType.partner_type) : `Partner Type ${partnerTypeId}`;
    };

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setPartnerUser(null);
        fetchAllPartnerUsers();
    };

    const handleCompanyFieldChange = (field, value) => {
        setCompanyFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveCompanyInfo = async () => {
        if (!partnerUser) return;
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

            console.log('Updating Partner info:', updateData);
            const response = await api.patch(`partner-users/${partnerUser.id}/`, updateData);

            if (response.status === 200) {
                setSuccessMessage('Partner information updated successfully!');
                const updatedPartner = {
                    ...partnerUser,
                    ...response.data,
                    reporting_to_id: companyFormData.reporting_to_id || partnerUser.reporting_to_id
                };
                setPartnerUser(updatedPartner);
                setCompanyFormData(prev => ({
                    ...prev,
                    password: ''
                }));
                setTimeout(() => {
                    fetchAllPartnerUsers();
                }, 1000);
            }
        } catch (error) {
            console.error('Error updating Partner info:', error);
            let errorMsg = 'Failed to update Partner information. ';
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
        if (!partnerUser) return;
        setEditingPartner(partnerUser);
        setEditFormData({
            first_name: partnerUser.first_name || '',
            last_name: partnerUser.last_name || '',
            email_id: partnerUser.email_id || '',
            phone_number: partnerUser.phone_number || '',
            password: '',
            alias_name: partnerUser.alias_name || '',
            company_name: partnerUser.company_name || '',
            branch_inner_state: partnerUser.branch_inner_state || '',
            branch_inner_location: partnerUser.branch_inner_location || '',
            office_address: partnerUser.office_address || '',
            residential_address: partnerUser.residential_address || '',
            aadhaar_number: partnerUser.aadhaar_number || '',
            pan_number: partnerUser.pan_number || '',
            account_number: partnerUser.account_number || '',
            ifsc_code: partnerUser.ifsc_code || '',
            bank_name: partnerUser.bank || partnerUser.bank_name || '',
            account_type: partnerUser.type_of_account || partnerUser.account_type || '',
            ref_name_1: partnerUser.ref_name_1 || '',
            ref_relation_1: partnerUser.ref_relation_1 || '',
            ref_mobile_1: partnerUser.ref_mobile_1 || '',
            ref_address_1: partnerUser.ref_address_1 || '',
            ref_name_2: partnerUser.ref_name_2 || '',
            ref_relation_2: partnerUser.ref_relation_2 || '',
            ref_mobile_2: partnerUser.ref_mobile_2 || '',
            ref_address_2: partnerUser.ref_address_2 || '',
        });

        if (partnerUser.branch_inner_state) {
            fetchBranchInnerLocations(partnerUser.branch_inner_state);
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
    };

    const handleSaveEdit = async () => {
        if (!editingPartner) return;
        setEditLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Editing Partner user ID:', editingPartner.id);
            const updateData = {
                first_name: editFormData.first_name.trim(),
                last_name: editFormData.last_name.trim(),
                email_id: editFormData.email_id || '',
                phone_number: editFormData.phone_number || '',
                alias_name: editFormData.alias_name || '',
                company_name: editFormData.company_name || '',
                branch_inner_state: editFormData.branch_inner_state || null,
                branch_inner_location: editFormData.branch_inner_location || null,
                office_address: editFormData.office_address || '',
                residential_address: editFormData.residential_address || '',
                aadhaar_number: editFormData.aadhaar_number || '',
                pan_number: editFormData.pan_number || '',
                account_number: editFormData.account_number || '',
                ifsc_code: editFormData.ifsc_code || '',
                bank: editFormData.bank_name || '',
                type_of_account: editFormData.account_type || '',
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

            console.log('Update data for Partner:', updateData);
            const response = await api.patch(`partner-users/${editingPartner.id}/`, updateData);

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('Partner user updated successfully!');
                const updatedPartner = {
                    ...editingPartner,
                    ...response.data
                };
                setPartnerUser(updatedPartner);
                setEditingPartner(updatedPartner);

                // Update profile image if changed
                const imageUrl = getProfileImageUrl(updatedPartner);
                if (imageUrl) {
                    setProfileImage(imageUrl);
                }

                setTimeout(() => {
                    fetchAllPartnerUsers();
                }, 500);
                setTimeout(() => {
                    setShowEditModal(false);
                    setSuccessMessage('');
                }, 1500);
            } else {
                setErrorMessage('Failed to update Partner user. Please try again.');
            }
        } catch (error) {
            console.error('Error updating Partner user:', error);
            let errorMsg = 'Failed to update Partner user. ';
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
                    <h3 className="emp-loading-title">Loading Partner Details</h3>
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
                        <i className="bi bi-exclamation-triangle"></i> Error Loading Partner User
                    </h1>
                </div>
                <div className="emp-error-card">
                    <div className="emp-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                    <h2 className="emp-error-message-title">Error Loading Partner User</h2>
                    <p className="emp-error-message">{error}</p>
                    <div className="emp-debug-info">
                        <h6 className="emp-debug-title">Debug Information</h6>
                        <div className="emp-debug-content">
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Requested ID:</span>
                                <span className="emp-debug-value">{id}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">Total Partner users fetched:</span>
                                <span className="emp-debug-value">{allPartnerUsers.length}</span>
                            </div>
                            <div className="emp-debug-item">
                                <span className="emp-debug-label">API Endpoint:</span>
                                <span className="emp-debug-value">/api/partner-users/</span>
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

    // No Partner user found
    if (!partnerUser) {
        return (
            <div className="emp-notfound-container">
                <div className="emp-notfound-header">
                    <h1 className="emp-notfound-title">
                        <i className="bi bi-person-x"></i> Partner User Not Found
                    </h1>
                </div>
                <div className="emp-notfound-card">
                    <div className="emp-notfound-icon">
                        <i className="bi bi-search"></i>
                    </div>
                    <h2 className="emp-notfound-message">Partner User Not Found</h2>
                    <p>No Partner user found with ID: <strong>{id}</strong></p>
                    <p className="emp-notfound-info">
                        Total Partner users in system: {allPartnerUsers.length}
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
        { id: 'partner', label: 'Partner Type', icon: 'bi-tag' },
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
                                                <p className="emp-info-value">{partnerUser.first_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Last Name</label>
                                                <p className="emp-info-value">{partnerUser.last_name || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Alias Name</label>
                                                <p className="emp-info-value">{partnerUser.alias_name || 'N/A'}</p>
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
                                                <p className="emp-info-value">{getPhoneNumber(partnerUser) || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Email</label>
                                                <p className="emp-info-value">{getEmail(partnerUser) || 'N/A'}</p>
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
                                                title="Edit Partner User"
                                            >
                                                <i className="bi bi-pencil"></i> Edit Profile
                                            </button>
                                        </div>
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Status</label>
                                                <p className="emp-info-value">
                                                    <span className={`status-badge ${partnerUser.status === 1 || partnerUser.status === true ? 'active' : 'inactive'}`}>
                                                        {partnerUser.status === 1 || partnerUser.status === true ? 'Active' : 'Inactive'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Company Name</label>
                                                <p className="emp-info-value">{partnerUser.company_name || 'N/A'}</p>
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
                                                <p className="emp-info-value">{partnerUser.office_address || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Residential Address</label>
                                                <p className="emp-info-value">{partnerUser.residential_address || 'N/A'}</p>
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
                                                        {getBranchInnerStateName(partnerUser.branch_inner_state)}
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
                                                        {getBranchInnerLocationName(partnerUser.branch_inner_location)}
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
                                                <p className="emp-info-value">{partnerUser.ref_name_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{partnerUser.ref_relation_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{partnerUser.ref_mobile_1 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{partnerUser.ref_address_1 || 'N/A'}</p>
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
                                                <p className="emp-info-value">{partnerUser.ref_name_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Relation</label>
                                                <p className="emp-info-value">{partnerUser.ref_relation_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Mobile No</label>
                                                <p className="emp-info-value">{partnerUser.ref_mobile_2 || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Address</label>
                                                <p className="emp-info-value">{partnerUser.ref_address_2 || 'N/A'}</p>
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
                                                        {getBankName(partnerUser.bank) || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Account Number</label>
                                                <p className="emp-info-value">{partnerUser.account_number || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">IFSC Code</label>
                                                <p className="emp-info-value">{partnerUser.ifsc_code || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Branch Name</label>
                                                <p className="emp-info-value">{partnerUser.bank_branch_name || 'N/A'}</p>
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
                                                        {getAccountTypeName(partnerUser.type_of_account) || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">PAN Card Number</label>
                                                <p className="emp-info-value">{partnerUser.pan_number || 'N/A'}</p>
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
                                                <label className="emp-info-label">Partner ID</label>
                                                <p className="emp-info-value">{partnerUser.partner_id || partnerUser.id || 'N/A'}</p>
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
                                                    {allPartnerUsers
                                                        .filter(partner => partner.id !== partnerUser.id)
                                                        .map(partner => (
                                                            <option key={partner.id} value={partner.id}>
                                                                {getFullName(partner)} ({partner.phone_number || partner.email_id})
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

            case 'partner':
                return (
                    <div className="emp-tab-card">
                        <div className="emp-tab-content">
                            <h5 className="emp-tab-title">Partner Type Information</h5>
                            <div className="emp-tab-grid">
                                <div className="emp-tab-column">
                                    <div className="emp-section">
                                        <div className="emp-info-list">
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Partner Type</label>
                                                {loadingRelatedData ? (
                                                    <div className="emp-related-loading">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="emp-info-value">
                                                        {getPartnerTypeName(partnerUser.partner_type) || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Rank</label>
                                                <p className="emp-info-value">{partnerUser.rank || 'N/A'}</p>
                                            </div>
                                            <div className="emp-info-item">
                                                <label className="emp-info-label">Company Name</label>
                                                <p className="emp-info-value">{partnerUser.company_name || 'N/A'}</p>
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

                            {/* Messages */}
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

                            {/* Attachments List */}
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
                                        {/* AADHAR CARD */}
                                        {partnerUser?.aadhaar_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    AADHAR CARD *
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(partnerUser.aadhaar_img, 'aadhar'),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Aadhar Card
                                                </button>
                                            </div>
                                        )}

                                        {/* PAN CARD */}
                                        {partnerUser?.pan_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    PAN CARD *
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(partnerUser.pan_img, 'pan'),
                                                        '_blank'
                                                    )}
                                                >
                                                    View PAN Card
                                                </button>
                                            </div>
                                        )}

                                        {/* EMPLOYEE PHOTO */}
                                        {partnerUser?.photo && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    EMPLOYEE PHOTO
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(partnerUser.photo, 'photos'),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Employee Photo
                                                </button>
                                            </div>
                                        )}

                                        {/* BANK PROOF */}
                                        {partnerUser?.bank_proof_img && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    BANK PROOF
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(partnerUser.bank_proof_img, 'bank_proof'),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Bank Proof
                                                </button>
                                            </div>
                                        )}

                                        {/* COMPANY LOGO */}
                                        {partnerUser?.company_logo && (
                                            <div className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    COMPANY LOGO
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => window.open(
                                                        getDocumentUrl(partnerUser.company_logo, 'company_logo'),
                                                        '_blank'
                                                    )}
                                                >
                                                    View Company Logo
                                                </button>
                                            </div>
                                        )}

                                        {/* Regular Attachments Divider */}
                                        {attachments.length > 0 && (partnerUser?.aadhaar_img || partnerUser?.pan_img || partnerUser?.photo || partnerUser?.bank_proof_img || partnerUser?.company_logo) && (
                                            <div style={{ margin: '16px 0 8px', borderTop: '1px solid #e9ecef' }}></div>
                                        )}

                                        {/* Regular Uploaded Attachments - View Only, No Delete */}
                                        {attachments.map((attachment) => (
                                            <div key={attachment.id} className="emp-attachment-row">
                                                <span className="emp-attachment-name">
                                                    {attachment.title?.toUpperCase() || 'ATTACHMENT'}
                                                </span>
                                                <button
                                                    className="emp-attachment-view"
                                                    onClick={() => handleDownloadAttachment(attachment)}
                                                >
                                                    View {attachment.title || 'Attachment'}
                                                </button>
                                            </div>
                                        ))}

                                        {/* No Attachments Message */}
                                        {!partnerUser?.aadhaar_img && !partnerUser?.pan_img && !partnerUser?.photo &&
                                            !partnerUser?.bank_proof_img && !partnerUser?.company_logo && attachments.length === 0 && (
                                                <div className="emp-no-attachments">
                                                    <i className="bi bi-folder2-open"></i>
                                                    <p>No attachments available</p>
                                                </div>
                                            )}
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
            {/* Hidden file input for image upload */}
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
                                    {partnerUser?.first_name && partnerUser?.last_name &&
                                        ` • ${partnerUser.first_name} ${partnerUser.last_name}`
                                    }
                                    {partnerUser?.phone_number && ` • ${partnerUser.phone_number}`}
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

            {/* Edit Modal */}
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
                                    <div className="form-group full-width">
                                        <label>
                                            <i className="bi bi-house"></i> Office Address
                                        </label>
                                        <textarea
                                            name="office_address"
                                            value={editFormData.office_address || ''}
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
                                            value={editFormData.residential_address || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Residential address"
                                            rows="2"
                                            disabled={editLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Government ID & Bank Information Section */}
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <i className="bi bi-credit-card"></i> Government ID & Bank Information
                                </h3>
                                <div className="edit-form-grid">
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-card-text"></i> Aadhaar Number
                                        </label>
                                        <input
                                            type="text"
                                            name="aadhaar_number"
                                            value={editFormData.aadhaar_number || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="12-digit Aadhaar"
                                            maxLength="12"
                                            disabled={editLoading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-credit-card-2-front"></i> PAN Number
                                        </label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={editFormData.pan_number || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="ABCDE1234F"
                                            maxLength="10"
                                            disabled={editLoading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <i className="bi bi-bank"></i> Bank Name
                                        </label>
                                        <select
                                            name="bank_name"
                                            value={editFormData.bank_name || ''}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading}
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
                                            <i className="bi bi-wallet2"></i> Account Type
                                        </label>
                                        <select
                                            name="account_type"
                                            value={editFormData.account_type || ''}
                                            onChange={handleEditFormChange}
                                            disabled={editLoading}
                                        >
                                            <option value="">Select Account Type</option>
                                            {accountTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.account_type || type.name}
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
                                            value={editFormData.account_number || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Account number"
                                            maxLength="18"
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
                                            value={editFormData.ifsc_code || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="11-character IFSC"
                                            maxLength="11"
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
                                    {partnerUser &&
                                        ` • ${getFullName(partnerUser)} • ${getPhoneNumber(partnerUser)}`
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
                                                    {type.account_type || type.name}
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
                                    {partnerUser &&
                                        ` • ${getFullName(partnerUser)} • ${getPhoneNumber(partnerUser)}`
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
                                            {partnerUser?.aadhaar_img && !attachmentEditFormData.aadhaar_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(partnerUser.aadhaar_img, 'aadhar')} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                            {partnerUser?.pan_img && !attachmentEditFormData.pan_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(partnerUser.pan_img, 'pan')} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                            {partnerUser?.photo && !attachmentEditFormData.photo && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark-image"></i> Current photo exists
                                                    <a href={getDocumentUrl(partnerUser.photo, 'photos')} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                            {partnerUser?.bank_proof_img && !attachmentEditFormData.bank_proof_img && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(partnerUser.bank_proof_img, 'bank_proof')} target="_blank" rel="noopener noreferrer" className="view-link">
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
                                            {partnerUser?.company_logo && !attachmentEditFormData.company_logo && (
                                                <div className="file-info existing-file">
                                                    <i className="bi bi-file-earmark"></i> Current file exists
                                                    <a href={getDocumentUrl(partnerUser.company_logo, 'company_logo')} target="_blank" rel="noopener noreferrer" className="view-link">
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

            {/* Header with Edit Button */}
            <div className="emp-header">
                <div className="emp-header-left">
                    <h1 className="emp-title">
                        <i className="bi bi-person-badge" style={{ color: '#6f42c1' }}></i> Partner User Details
                    </h1>
                </div>
                <div className="emp-header-right">
                    <div className="emp-status">
                        <span className={`emp-status-badge ${partnerUser.status === 1 || partnerUser.status === true ? 'emp-status-active' : 'emp-status-inactive'}`}>
                            <i className="bi bi-circle-fill"></i>
                            {partnerUser.status === 1 || partnerUser.status === true ? 'Active' : 'Inactive'}
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
                                    alt={getFullName(partnerUser)}
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
                            {getFullName(partnerUser)}
                        </h1>
                        <div className="emp-profile-details">
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Email: <strong>{getEmail(partnerUser) || 'N/A'}</strong></span>
                            </div>
                            <div className="emp-profile-detail">
                                <i className="bi bi-envelope"></i>
                                <span>Password: <strong>{localStorage.getItem("partner_password") || 'N/A'}</strong></span>
                            </div>
                        </div>

                        {/* Image Upload Messages */}
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

export default Partner_View;