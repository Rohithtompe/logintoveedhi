import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import './Vehicle_View.css';

function Vehicle_View() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for insurance data
    const [insuranceData, setInsuranceData] = useState(null);
    const [vehicleDetails, setVehicleDetails] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [states, setStates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [sublocations, setSublocations] = useState([]);
    const [pincodes, setPincodes] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [industryTypes, setIndustryTypes] = useState([]);
    const [businessTypes, setBusinessTypes] = useState([]);
    const [vehicleMakes, setVehicleMakes] = useState([]);
    const [vehicleModels, setVehicleModels] = useState([]);
    const [manufactureYears, setManufactureYears] = useState([]);
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

            // Fetch insurance data
            const insuranceRes = await api.get(`vehicle-add-insurance/${id}/`);
            setInsuranceData(insuranceRes.data);

            // Fetch vehicle details
            const vehicleRes = await api.get(`vehicle-insurance-details/?vehicle=${id}`);
            const vehicleData = Array.isArray(vehicleRes.data) ? vehicleRes.data : vehicleRes.data?.results || [];
            setVehicleDetails(vehicleData);

            // Fetch documents
            const docsRes = await api.get(`vehicle-documents/?vehicle=${id}`);
            const docsData = Array.isArray(docsRes.data) ? docsRes.data : docsRes.data?.results || [];
            setDocuments(docsData);

        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to load insurance details');
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
                customerTypesRes,
                industryTypesRes,
                businessTypesRes,
                vehicleMakesRes,
                vehicleModelsRes,
                manufactureYearsRes,
                companiesRes
            ] = await Promise.all([
                api.get('branch-states/'),
                api.get('branch-locations/'),
                api.get('sublocations/'),
                api.get('pincodes/'),
                api.get('customer-type/'),
                api.get('industry-type/'),
                api.get('business-type/'),
                api.get('vehicle-make/'),
                api.get('vehicle-model/'),
                api.get('manufacture-year/'),
                api.get('company-name/')
            ]);

            // Set all related data
            setStates(Array.isArray(statesRes.data) ? statesRes.data : statesRes.data?.results || []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : locationsRes.data?.results || []);
            setSublocations(Array.isArray(sublocationsRes.data) ? sublocationsRes.data : sublocationsRes.data?.results || []);
            setPincodes(Array.isArray(pincodesRes.data) ? pincodesRes.data : pincodesRes.data?.results || []);
            setCustomerTypes(Array.isArray(customerTypesRes.data) ? customerTypesRes.data : customerTypesRes.data?.results || []);
            setIndustryTypes(Array.isArray(industryTypesRes.data) ? industryTypesRes.data : industryTypesRes.data?.results || []);
            setBusinessTypes(Array.isArray(businessTypesRes.data) ? businessTypesRes.data : businessTypesRes.data?.results || []);
            setVehicleMakes(Array.isArray(vehicleMakesRes.data) ? vehicleMakesRes.data : vehicleMakesRes.data?.results || []);
            setVehicleModels(Array.isArray(vehicleModelsRes.data) ? vehicleModelsRes.data : vehicleModelsRes.data?.results || []);
            setManufactureYears(Array.isArray(manufactureYearsRes.data) ? manufactureYearsRes.data : manufactureYearsRes.data?.results || []);
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

    const getCustomerTypeName = (customerTypeId) => {
        const customerType = customerTypes.find(c => c.id === customerTypeId);
        return customerType ? customerType.customer_type : 'N/A';
    };

    const getIndustryTypeName = (industryTypeId) => {
        const industryType = industryTypes.find(i => i.id === industryTypeId);
        return industryType ? industryType.industry_name : 'N/A';
    };

    const getBusinessTypeName = (businessTypeId) => {
        const businessType = businessTypes.find(b => b.id === businessTypeId);
        return businessType ? businessType.business_name : 'N/A';
    };

    const getVehicleMakeName = (vehicleMakeId) => {
        const vehicleMake = vehicleMakes.find(vm => vm.id === vehicleMakeId);
        return vehicleMake ? vehicleMake.vehical_make : 'N/A';
    };

    const getVehicleModelName = (vehicleModelId) => {
        const vehicleModel = vehicleModels.find(vm => vm.id === vehicleModelId);
        return vehicleModel ? vehicleModel.vehicle_model : 'N/A';
    };

    const getManufactureYearName = (manufactureYearId) => {
        const manufactureYear = manufactureYears.find(my => my.id === manufactureYearId);
        return manufactureYear ? manufactureYear.manufacture_year : 'N/A';
    };

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.company_name : 'N/A';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB');
        } catch {
            return dateString;
        }
    };

    // Handle file view/download
    const handleViewFile = (fileName, fileUrl) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        } else {
            console.log('View file:', fileName);
        }
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
                            <p className="mt-3 text-muted">Loading insurance details...</p>
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
                                {error || 'Insurance not found'}
                            </div>
                        </div>
                        <button
                            className="btn vehicle-view-btn vehicle-view-btn-primary"
                            onClick={() => navigate('/admin-dashboard/vehicle/insurance-list')}
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
                                                            <i className="bx bx-shield-alt text-white fs-4">💾</i>
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
                                                                Insurance Details
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

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Navigation - Simple Solution */}
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
                                            className={`simple-tab ${activeTab === 'vehicle' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('vehicle')}
                                        >
                                            <i className="bx bx-car"></i>
                                            <span>Vehicle Details</span>
                                        </button>
                                        <button
                                            className={`simple-tab ${activeTab === 'documents' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('documents')}
                                        >
                                            <i className="bx bx-file"></i>
                                            <span>Documents</span>
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
                                                <h5 className="mb-0 fw-bold text-primary">Insurance Profile</h5>
                                                <small className="text-muted">Personal and contact information</small>
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
                                                <label className="form-label fw-medium text-muted mb-1">Company Name</label>
                                                <div className="field-value">
                                                    {insuranceData.company_name || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Phone No.</label>
                                                <div className="field-value">
                                                    <i className="bx bx-phone me-2 text-primary"></i>
                                                    {insuranceData.phone_number || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Alternative Phone No.</label>
                                                <div className="field-value">
                                                    <i className="bx bx-mobile-alt me-2 text-primary"></i>
                                                    {insuranceData.alternative_phone_number || 'N/A'}
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
                                                <label className="form-label fw-medium text-muted mb-1">Date Of Birth</label>
                                                <div className="field-value">
                                                    <i className="bx bx-calendar me-2 text-primary"></i>
                                                    {formatDate(insuranceData.birth_date)}
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
                                                <label className="form-label fw-medium text-muted mb-1">Type Of Customer</label>
                                                <div className="field-value">
                                                    {getCustomerTypeName(insuranceData.customer_type)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Type Of Industry</label>
                                                <div className="field-value">
                                                    {getIndustryTypeName(insuranceData.industry_type)}
                                                </div>
                                            </div>
                                            <div className="col-md-6 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Type Of Business</label>
                                                <div className="field-value">
                                                    {getBusinessTypeName(insuranceData.business_type)}
                                                </div>
                                            </div>
                                            <div className="col-12 vehicle-view-field">
                                                <label className="form-label fw-medium text-muted mb-1">Address</label>
                                                <div className="field-value" style={{ minHeight: '100px' }}>
                                                    <i className="bx bx-map me-2 text-primary align-top"></i>
                                                    <span>{insuranceData.address || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Details Tab Content */}
                            {activeTab === 'vehicle' && (
                                <div className="card shadow-sm border-0 vehicle-view-card">
                                    <div className="card-header border-bottom" style={{
                                        borderTop: '4px solid #17a2b8',
                                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <div className="card-header-icon" style={{
                                                backgroundColor: '#17a2b8'
                                            }}>
                                                <i className="bx bx-car text-white fs-5">🚗</i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-info">Vehicle Details</h5>
                                                <small className="text-muted">Vehicle information and insurance details</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {vehicleDetails.length === 0 ? (
                                            <div className="text-center py-5 vehicle-view-empty">
                                                <div className="vehicle-view-empty-icon">
                                                    <i className="bx bx-car text-primary" style={{ fontSize: '48px' }}></i>
                                                </div>
                                                <h5 className="mb-2">No Vehicle Details Found</h5>
                                                <p className="text-muted mb-4">No vehicle information has been added yet.</p>
                                                <button
                                                    className="btn vehicle-view-btn vehicle-view-btn-primary"
                                                    onClick={() => navigate(`/admin-dashboard/vehicle/add-insurance?edit=${id}&tab=vehicle`)}
                                                >
                                                    <i className="bx bx-plus me-2"></i>
                                                    Add Vehicle Details
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="vehicle-view-table">
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Owner Name</th>
                                                                <th>Vehicle Number</th>
                                                                <th>Engine No.</th>
                                                                <th>Chassis No.</th>
                                                                <th>Make</th>
                                                                <th>Model</th>
                                                                <th>Year</th>
                                                                <th>Insurance Company</th>
                                                                <th>IDV Value</th>
                                                                <th>Start Date</th>
                                                                <th>End Date</th>
                                                                <th>Premium</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {vehicleDetails.map((vehicle, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="fw-medium">{vehicle.owner_name || 'N/A'}</div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-primary bg-opacity-10 text-primary vehicle-view-badge">
                                                                            {vehicle.vehicle_number || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ fontFamily: 'monospace' }}>
                                                                        {vehicle.engine_number || 'N/A'}
                                                                    </td>
                                                                    <td style={{ fontFamily: 'monospace' }}>
                                                                        {vehicle.chassis_number || 'N/A'}
                                                                    </td>
                                                                    <td>{getVehicleMakeName(vehicle.vehicle_make)}</td>
                                                                    <td>{getVehicleModelName(vehicle.vehicle_model)}</td>
                                                                    <td>
                                                                        <span className="badge bg-info bg-opacity-10 text-info vehicle-view-badge">
                                                                            {getManufactureYearName(vehicle.manufacture_year)}
                                                                        </span>
                                                                    </td>
                                                                    <td>{getCompanyName(vehicle.ins_company_name)}</td>
                                                                    <td className="fw-bold" style={{ color: '#28a745' }}>
                                                                        {vehicle.idv_value || '0'}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-success bg-opacity-10 text-success vehicle-view-badge">
                                                                            {formatDate(vehicle.ins_start_date)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-warning bg-opacity-10 text-warning vehicle-view-badge">
                                                                            {formatDate(vehicle.ins_last_date)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="fw-bold" style={{ color: '#dc3545' }}>
                                                                        {vehicle.premium || '0'}
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

                            {/* Documents Tab Content */}
                            {activeTab === 'documents' && (
                                <div className="card shadow-sm border-0 vehicle-view-card">
                                    <div className="card-header border-bottom" style={{
                                        borderTop: '4px solid #17a2b8',
                                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <div className="card-header-icon" style={{
                                                backgroundColor: '#17a2b8'
                                            }}>
                                                <i className="bx bx-file text-white fs-5">💾</i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-warning">Vehicle Documents</h5>
                                                <small className="text-muted">Uploaded files and documents</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {documents.length === 0 ? (
                                            <div className="text-center py-5 vehicle-view-empty">
                                                <div className="vehicle-view-empty-icon">
                                                    <i className="bx bx-file text-primary" style={{ fontSize: '48px' }}></i>
                                                </div>
                                                <h5 className="mb-2">No Documents Found</h5>
                                                <p className="text-muted mb-4">No documents have been uploaded yet.</p>
                                                <button
                                                    className="btn vehicle-view-btn vehicle-view-btn-primary"
                                                    onClick={() => navigate(`/admin-dashboard/vehicle/add-insurance?edit=${id}&tab=documents`)}
                                                >
                                                    <i className="bx bx-upload me-2"></i>
                                                    Upload Document
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="row">
                                                {documents.map((doc, index) => (
                                                    <div className="col-md-6 col-lg-4 mb-4" key={index}>
                                                        <div className="document-card">
                                                            <div
                                                                className="card-body"
                                                                style={{
                                                                    position: "relative", // important
                                                                    borderRadius: "16px",
                                                                    padding: "22px",
                                                                    background: "linear-gradient(135deg, #ffffff, #f8fbff)",
                                                                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                                                                    border: "1px solid #eef2f7",
                                                                    transition: "all 0.3s ease"
                                                                }}
                                                            >

                                                                {/* 🔥 Top Right Icons */}
                                                                <div
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "14px",
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

                                                                <div className="d-flex align-items-start" style={{ gap: "16px" }}>
                                                                    {/* Icon Box */}
                                                                    <div
                                                                        style={{
                                                                            minWidth: "56px",
                                                                            height: "56px",
                                                                            borderRadius: "14px",
                                                                            background: "linear-gradient(135deg, #ffe8a1, #ffd166)",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: "0 6px 14px rgba(255, 193, 7, 0.3)"
                                                                        }}
                                                                    >
                                                                        <i className="bx bx-file" style={{ fontSize: "26px", color: "#7a5c00" }}></i>
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div style={{ flex: 1 }}>
                                                                        <h6
                                                                            style={{
                                                                                fontSize: "18px",
                                                                                fontWeight: "800",
                                                                                marginBottom: "6px",
                                                                                color: "#1f2d3d",
                                                                                letterSpacing: "0.4px"
                                                                            }}
                                                                        >
                                                                            {doc.document_name || `Document ${index + 1}`}
                                                                        </h6>

                                                                        <span
                                                                            style={{
                                                                                fontSize: "13px",
                                                                                padding: "4px 10px",
                                                                                borderRadius: "20px",
                                                                                fontWeight: "600",
                                                                                background: doc.upload_file ? "#e6f7ee" : "#f1f3f5",
                                                                                color: doc.upload_file ? "#1b8a5a" : "#6c757d",
                                                                                display: "inline-block"
                                                                            }}
                                                                        >
                                                                            {doc.upload_file ? "Uploaded" : "No file uploaded"}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                {doc.upload_file && (
                                                                    <div
                                                                        style={{
                                                                            marginTop: "20px",
                                                                            display: "flex",
                                                                            gap: "12px"
                                                                        }}
                                                                    >
                                                                        <button
                                                                            className="btn btn-sm"
                                                                            style={{
                                                                                background: "#0d6efd",
                                                                                color: "#fff",
                                                                                borderRadius: "10px",
                                                                                padding: "8px 18px",
                                                                                fontWeight: "600",
                                                                                border: "none",
                                                                                boxShadow: "0 4px 10px rgba(13,110,253,0.3)"
                                                                            }}
                                                                            onClick={() => handleViewFile(doc.document_name, doc.upload_file)}
                                                                        >
                                                                            <i className="bx bx-show me-1"></i>
                                                                            View
                                                                        </button>

                                                                        <button
                                                                            className="btn btn-sm"
                                                                            style={{
                                                                                background: "#198754",
                                                                                color: "#fff",
                                                                                borderRadius: "10px",
                                                                                padding: "8px 18px",
                                                                                fontWeight: "600",
                                                                                border: "none",
                                                                                boxShadow: "0 4px 10px rgba(25,135,84,0.3)"
                                                                            }}
                                                                            onClick={() => window.open(doc.upload_file, "_blank")}
                                                                        >
                                                                            <i className="bx bx-download me-1"></i>
                                                                            Download
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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

export default Vehicle_View;