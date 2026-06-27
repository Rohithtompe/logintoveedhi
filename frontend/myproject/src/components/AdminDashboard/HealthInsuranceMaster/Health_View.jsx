import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import '../VehicleMaster/Vehicle_View.css'; // Reusing styles from Vehicle_View for consistency

function Health_View() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for health insurance data
    const [insuranceData, setInsuranceData] = useState(null);
    const [policyDetails, setPolicyDetails] = useState([]);
    const [states, setStates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [sublocations, setSublocations] = useState([]);
    const [pincodes, setPincodes] = useState([]);
    const [policyTypes, setPolicyTypes] = useState([]);
    const [individualAges, setIndividualAges] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tab state
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        fetchInsuranceDetails();
        fetchRelatedData();
    }, [id]);

    const fetchInsuranceDetails = async () => {
        try {
            setLoading(true);

            // Fetch health insurance data
            const insuranceRes = await api.get(`health-add-insurance/${id}/`);
            setInsuranceData(insuranceRes.data);

            // Fetch policy details
            const policyRes = await api.get(`health-insurance-details/?health=${id}`);
            const policyData = Array.isArray(policyRes.data) ? policyRes.data : policyRes.data?.results || [];
            setPolicyDetails(policyData);

        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to load health insurance details');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedData = async () => {
        try {
            const [
                statesRes,
                locationsRes,
                sublocationsRes,
                pincodesRes,
                policyTypesRes,
                individualAgesRes,
                familyMembersRes,
                companiesRes
            ] = await Promise.all([
                api.get('branch-states/'),
                api.get('branch-locations/'),
                api.get('sublocations/'),
                api.get('pincodes/'),
                api.get('type-of-policy/'),
                api.get('health-insurance-age/'),
                api.get('number-of-person/'),
                api.get('insurance-company/')
            ]);

            // Set all related data
            setStates(Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : locationsRes.data?.results || []);
            setSublocations(Array.isArray(sublocationsRes.data) ? sublocationsRes.data : sublocationsRes.data?.results || []);
            setPincodes(Array.isArray(pincodesRes.data) ? pincodesRes.data : pincodesRes.data?.results || []);
            setPolicyTypes(Array.isArray(policyTypesRes.data) ? policyTypesRes.data : policyTypesRes.data?.results || []);
            setIndividualAges(Array.isArray(individualAgesRes.data) ? individualAgesRes.data : individualAgesRes.data?.results || []);
            setFamilyMembers(Array.isArray(familyMembersRes.data) ? familyMembersRes.data : familyMembersRes.data?.results || []);
            setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.results || []);

        } catch (err) {
            console.warn('Error fetching related data:', err);
        }
    };

    // Helper functions to get names from IDs
    const getStateName = (stateId) => {
        const state = states.find(s => s.id === stateId);
        return state ? state.name : 'N/A';
    };

    const getLocationName = (locationId) => {
        const location = locations.find(l => l.id === locationId);
        return location ? location.name : 'N/A';
    };

    const getSubLocationName = (subLocationId) => {
        const sublocation = sublocations.find(s => s.id === subLocationId);
        return sublocation ? sublocation.name : 'N/A';
    };

    const getPincode = (pincodeId) => {
        const pincode = pincodes.find(p => p.id === pincodeId);
        return pincode ? pincode.pincode : 'N/A';
    };

    const getPolicyTypeName = (policyTypeId) => {
        const policyType = policyTypes.find(p => p.id === policyTypeId);
        return policyType ? policyType.policy_name : 'N/A';
    };

    const getIndividualAge = (individualAgeId) => {
        const individualAge = individualAges.find(ia => ia.id === individualAgeId);
        return individualAge ? individualAge.individual_age : 'N/A';
    };

    const getFamilyMembers = (familyMemberId) => {
        const familyMember = familyMembers.find(fm => fm.id === familyMemberId);
        return familyMember ? familyMember.no_person : 'N/A';
    };

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.company_name : 'N/A';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // If date is in DD/MM/YYYY format, return as is
            if (dateString.includes('/')) {
                return dateString;
            }

            // If date is in YYYY-MM-DD format, convert to DD/MM/YYYY
            if (dateString.includes('-')) {
                const [year, month, day] = dateString.split('-');
                return `${day}/${month}/${year}`;
            }

            // Try parsing as ISO date
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB');
            }

            return dateString;
        } catch {
            return dateString;
        }
    };

    // Format phone number
    const formatPhoneNumber = (phone) => {
        if (!phone) return 'N/A';
        const cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
        return phone;
    };

    if (loading) {
        return (
            <div className="layout-wrapper layout-content-navbar vehicle-view-container">
                <div className="content-wrapper">
                    <div className="container-xxl flex-grow-1 container-p-y">
                        <div className="vehicle-view-loading">
                            <div className="spinner-border text-primary vehicle-view-loading-spinner" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading health insurance details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !insuranceData) {
        return (
            <div className="layout-wrapper layout-content-navbar vehicle-view-container">
                <div className="content-wrapper">
                    <div className="container-xxl flex-grow-1 container-p-y">
                        <div className="alert alert-danger d-flex align-items-center vehicle-view-card" role="alert">
                            <i className="bx bx-error-circle me-2" style={{ fontSize: '1.5rem' }}></i>
                            <div>
                                {error || 'Health insurance not found'}
                            </div>
                        </div>
                        <button
                            className="btn vehicle-view-btn vehicle-view-btn-primary"
                            onClick={() => navigate('/admin-dashboard/health/insurance-list')}
                        >
                            <i className="bx bx-arrow-back me-2"></i>
                            Back to Insurance List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrapper layout-content-navbar vehicle-view-container">
            <div className="layout-container">
                <div className="layout-page">
                    <div className="content-wrapper">
                        <div className="container-xxl flex-grow-1 container-p-y">
                            {/* Header */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm vehicle-view-header">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="d-flex align-items-center">
                                                        <div className="header-icon me-3">
                                                            <i className="bx bx-health text-white fs-4">🏥</i>
                                                        </div>
                                                        <div>
                                                            <h4
                                                                className="mb-0"
                                                                style={{
                                                                    fontSize: "26px",
                                                                    fontWeight: "800",
                                                                    color: "#0d6efd",
                                                                    letterSpacing: "0.6px"
                                                                }}
                                                            >
                                                                Health Insurance Details
                                                            </h4>

                                                            <p
                                                                className="mb-0"
                                                                style={{
                                                                    fontSize: "20px",
                                                                    fontWeight: "700",
                                                                    color: "#2c3e50",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                }}
                                                            >
                                                                <i className="bx bx-user"></i>
                                                                {insuranceData.customer_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        className="btn vehicle-view-btn vehicle-view-btn-secondary"
                                                        onClick={() => navigate('/admin-dashboard/health/insurance-list')}
                                                    >
                                                        <i className="bx bx-arrow-back me-2"></i>
                                                        Back to List
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="card mb-4 shadow-sm vehicle-view-tabs">
                                <div className="card-body p-0">
                                    <div className="simple-tabs">
                                        <button
                                            className={`simple-tab ${activeTab === 'profile' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('profile')}
                                        >
                                            <i className="bx bx-user-circle"></i>
                                            <span>Profile</span>
                                        </button>
                                        <button
                                            className={`simple-tab ${activeTab === 'policies' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('policies')}
                                        >
                                            <i className="bx bx-file-medical"></i>
                                            <span>Health Insurance Details</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Tab Content */}
                            {activeTab === 'profile' && (
                                <div className="card shadow-sm border-0 vehicle-view-card">
                                    <div className="card-header border-bottom" style={{
                                        borderTop: '4px solid #17a2b8',
                                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <div className="card-header-icon" style={{
                                                background: 'linear-gradient(135deg, #696cff 0%, #5a5fcf 100%)'
                                            }}>
                                                <i className="bx bx-user-circle text-white fs-5">👨‍🎓</i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-primary">Health Insurance Profile</h5>
                                                <small className="text-muted">Personal and policy information</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Customer Name</label>
                                                <div className="field-value">
                                                    {insuranceData.customer_name || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Phone No.</label>
                                                <div className="field-value">
                                                    <i className="bx bx-phone me-2 text-primary"></i>
                                                    {formatPhoneNumber(insuranceData.Phone_number)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Email Id</label>
                                                <div className="field-value">
                                                    <i className="bx bx-envelope me-2 text-primary"></i>
                                                    {insuranceData.email_id || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Customer Age</label>
                                                <div className="field-value">
                                                    <i className="bx bx-user me-2 text-primary"></i>
                                                    {insuranceData.customer_age || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">State</label>
                                                <div className="field-value">
                                                    {getStateName(insuranceData.state)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Location</label>
                                                <div className="field-value">
                                                    {getLocationName(insuranceData.location)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Sub Location</label>
                                                <div className="field-value">
                                                    {getSubLocationName(insuranceData.sub_location)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">PIN Code</label>
                                                <div className="field-value">
                                                    {getPincode(insuranceData.pincode)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Type Of Policy</label>
                                                <div className="field-value">
                                                    <span className="badge bg-label-primary">
                                                        {getPolicyTypeName(insuranceData.policy_name)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Individual Age</label>
                                                <div className="field-value">
                                                    {getIndividualAge(insuranceData.individual_age)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Number Of Persons</label>
                                                <div className="field-value">
                                                    {getFamilyMembers(insuranceData.no_person)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Created By</label>
                                                <div className="field-value">
                                                    {insuranceData.created_by || 'N/A'}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            position: "fixed",
                                            top: "0px",
                                            right: "16px",
                                            display: "flex",
                                            gap: "12px"
                                        }}
                                    >
                                        <i
                                            className="bi bi-whatsapp"
                                            title="Share on WhatsApp"
                                            style={{ fontSize: "22px", color: "#25D366", cursor: "pointer" }}
                                        ></i>

                                        <i
                                            className="bi bi-envelope-fill"
                                            title="Send Email"
                                            style={{ fontSize: "22px", color: "#EA4335", cursor: "pointer" }}
                                        ></i>

                                        <i
                                            className="bi bi-chat-dots-fill"
                                            title="Chat"
                                            style={{ fontSize: "22px", color: "#f4b400", cursor: "pointer" }}
                                        ></i>
                                    </div>
                                </div>
                            )}

                            {/* Health Insurance Details Tab Content */}
                            {activeTab === 'policies' && (
                                <div className="card shadow-sm border-0 vehicle-view-card">
                                    <div className="card-header border-bottom" style={{
                                        borderTop: '4px solid #28a745',
                                        background: 'linear-gradient(135deg, #e8f5e9 0%, #d4edda 100%)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <div className="card-header-icon" style={{
                                                backgroundColor: '#28a745'
                                            }}>
                                                <i className="bx bx-file-medical text-white fs-5">🏥</i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-success">Health Insurance Details</h5>
                                                <small className="text-muted">Policy information and coverage details</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {policyDetails.length === 0 ? (
                                            <div className="text-center py-5 vehicle-view-empty">
                                                <div className="vehicle-view-empty-icon">
                                                    <i className="bx bx-file-medical text-primary" style={{ fontSize: '48px' }}></i>
                                                </div>
                                                <h5 className="mb-2">No Health Insurance Details Found</h5>
                                                <p className="text-muted mb-4">No policy information has been added yet.</p>
                                                <button
                                                    className="btn vehicle-view-btn vehicle-view-btn-primary"
                                                    onClick={() => navigate(`/admin-dashboard/health/add-health-insurance?edit=${id}&tab=policies`)}
                                                >
                                                    <i className="bx bx-plus me-2"></i>
                                                    Add Policy Details
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="vehicle-view-table">
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Company Name</th>
                                                                <th>Sum Assured</th>
                                                                <th>Policy Premium</th>
                                                                <th>Insurance Start Date</th>
                                                                <th>Insurance End Date</th>
                                                                <th>Policy Number</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {policyDetails.map((policy, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="fw-medium">
                                                                            {getCompanyName(policy.company_name)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-primary bg-opacity-10 text-primary vehicle-view-badge">
                                                                            ₹{policy.sum_assured || '0'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-info bg-opacity-10 text-info vehicle-view-badge">
                                                                            ₹{policy.policy_premium || '0'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-success bg-opacity-10 text-success vehicle-view-badge">
                                                                            {formatDate(policy.ins_start_date)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-warning bg-opacity-10 text-warning vehicle-view-badge">
                                                                            {formatDate(policy.ins_last_date)}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ fontFamily: 'monospace' }}>
                                                                        {policy.policy_no || 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Health_View;