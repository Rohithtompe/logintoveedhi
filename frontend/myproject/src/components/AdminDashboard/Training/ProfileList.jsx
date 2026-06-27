import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Profile from './Profile';

const ProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      // Fetch profiles
      const profilesRes = await api.get('profiles/');
      console.log('Profiles raw data:', profilesRes.data);
      
      // Fetch vendor banks
      const vendorBanksRes = await api.get('vendor-banks/');
      console.log('Vendor banks raw data:', vendorBanksRes.data);
      
      // Fetch loan types
      const loanTypesRes = await api.get('loan-types/');
      console.log('Loan types raw data:', loanTypesRes.data);
      
      // Process profiles data
      let profilesData = [];
      if (Array.isArray(profilesRes.data)) {
        profilesData = profilesRes.data;
      } else if (profilesRes.data && profilesRes.data.results) {
        profilesData = profilesRes.data.results;
      }
      
      // Process vendor banks data
      let vendorData = [];
      if (Array.isArray(vendorBanksRes.data)) {
        vendorData = vendorBanksRes.data;
      } else if (vendorBanksRes.data && vendorBanksRes.data.results) {
        vendorData = vendorBanksRes.data.results;
      }
      
      // Process loan types data
      let loanData = [];
      if (Array.isArray(loanTypesRes.data)) {
        loanData = loanTypesRes.data;
      } else if (loanTypesRes.data && loanTypesRes.data.results) {
        loanData = loanTypesRes.data.results;
      }
      
      console.log('Processed profiles:', profilesData);
      console.log('Processed vendor banks:', vendorData);
      console.log('Processed loan types:', loanData);
      
      setProfiles(profilesData);
      setVendorBanks(vendorData);
      setLoanTypes(loanData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get name by ID (similar to BankersList)
  const getNameById = (id, array, nameField = 'name') => {
    if (!id || !array || array.length === 0) return 'N/A';
    
    console.log(`Looking for ID ${id} in array:`, array);
    
    // Try different ways to find the item
    const item = array.find(item => {
      // Check if item has the ID
      return item.id === id || 
             item.id === parseInt(id) ||
             String(item.id) === String(id);
    });
    
    console.log(`Found item for ID ${id}:`, item);
    
    if (!item) {
      console.log(`No item found for ID ${id}`);
      return `ID: ${id}`;
    }
    
    // Try different property names for vendor banks
    if (array === vendorBanks) {
      return item.vendor_name || item.name || item.bank_name || `Vendor ${item.id}`;
    }
    
    // For loan types
    if (array === loanTypes) {
      return item.name || item.loan_type || item.loan_type_name || `Loan Type ${item.id}`;
    }
    
    // Default fallback
    return item[nameField] || `ID: ${item.id}`;
  };

  // Get vendor bank name
  const getVendorBankName = (vendorBankId) => {
    console.log('Getting vendor bank name for ID:', vendorBankId);
    console.log('Available vendor banks:', vendorBanks);
    
    // Check if vendorBankId is an object (nested in API response)
    if (vendorBankId && typeof vendorBankId === 'object') {
      console.log('vendorBankId is an object:', vendorBankId);
      return vendorBankId.vendor_name || vendorBankId.name || vendorBankId.bank_name || `Vendor ${vendorBankId.id}`;
    }
    
    // If it's an ID, use getNameById
    const name = getNameById(vendorBankId, vendorBanks, 'vendor_name');
    console.log('Result:', name);
    return name;
  };

  // Get loan type name
  const getLoanTypeName = (loanTypeId) => {
    console.log('Getting loan type name for ID:', loanTypeId);
    
    // Check if loanTypeId is an object
    if (loanTypeId && typeof loanTypeId === 'object') {
      console.log('loanTypeId is an object:', loanTypeId);
      return loanTypeId.name || loanTypeId.loan_type || loanTypeId.loan_type_name || `Loan Type ${loanTypeId.id}`;
    }
    
    // If it's an ID, use getNameById
    const name = getNameById(loanTypeId, loanTypes, 'name');
    console.log('Result:', name);
    return name;
  };

  const handleEdit = (profile) => {
    console.log('Editing profile:', profile);
    setEditingProfile(profile);
    setShowCreateForm(false);
  };

  const handleDelete = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      await api.delete(`profiles/${profileId}/`);
      fetchAllData();
      alert('Profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  const handleProfileSaved = () => {
    fetchAllData();
    setEditingProfile(null);
    setShowCreateForm(false);
  };

  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handleDownloadFile = (fileUrl) => {
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://127.0.0.1:8000${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">Profile Management</h1>
          </div>
        </div>
      </div>

      {/* Create/Edit Form Section */}
      {(showCreateForm || editingProfile) && (
        <div className="row mb-4">
          <div className="col-12">
            <Profile 
              profile={editingProfile}
              onProfileSaved={handleProfileSaved}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingProfile(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Profiles List Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profiles List</h5>
              <span className="badge bg-light text-dark">
                Total: {profiles.length}
              </span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading profiles...</p>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-person text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 text-muted">No profiles found</p>
                  {!showCreateForm && (
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create Your First Profile
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Vendor Bank</th>
                        <th>Loan Type</th>
                        <th>Image</th>
                        <th>File</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => {
                        console.log('Profile data:', {
                          id: profile.id,
                          vendor_bank: profile.vendor_bank,
                          vendor_bank_type: typeof profile.vendor_bank,
                          loan_type: profile.loan_type,
                          loan_type_type: typeof profile.loan_type
                        });
                        
                        return (
                          <tr key={profile.id} className="align-middle">
                            <td>
                              <span className="badge bg-light text-dark">{profile.id}</span>
                            </td>
                            <td>
                              <strong>{getVendorBankName(profile.vendor_bank)}</strong>
                              <br />
                              <small className="text-muted">
                                {typeof profile.vendor_bank === 'object' 
                                  ? `Object ID: ${profile.vendor_bank?.id}` 
                                  : `ID: ${profile.vendor_bank}`}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {getLoanTypeName(profile.loan_type)}
                              </span>
                              <br />
                              <small className="text-muted">
                                {typeof profile.loan_type === 'object' 
                                  ? `Object ID: ${profile.loan_type?.id}` 
                                  : `ID: ${profile.loan_type}`}
                              </small>
                            </td>
                            <td>
                              {profile.image ? (
                                <button 
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  onClick={() => handleViewImage(profile.image)}
                                  title="View Image"
                                >
                                  <i className="bi bi-image me-1"></i>
                                  <small>View</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No Image</span>
                              )}
                            </td>
                            <td>
                              {profile.file ? (
                                <button 
                                  className="btn btn-sm btn-outline-success d-flex align-items-center"
                                  onClick={() => handleDownloadFile(profile.file)}
                                  title="Download File"
                                >
                                  <i className="bi bi-download me-1"></i>
                                  <small>Download</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No File</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${profile.status ? 'bg-success' : 'bg-secondary'}`}>
                                {profile.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleEdit(profile)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(profile.id)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {profiles.length > 0 && (
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing <strong>{profiles.length}</strong> profile{profiles.length !== 1 ? 's' : ''}
                    <br />
                    <small>
                      Vendor Banks: {vendorBanks.length}, 
                      Loan Types: {loanTypes.length}
                    </small>
                  </small>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchAllData}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileList;