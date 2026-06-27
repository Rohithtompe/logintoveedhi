import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Seminar from './Seminar';

const SeminarList = () => {
  const [seminars, setSeminars] = useState([]);
  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      // Fetch seminars
      const seminarsRes = await api.get('seminars/');
      console.log('Seminars raw data:', seminarsRes.data);
      
      // Fetch vendor banks
      const vendorBanksRes = await api.get('vendor-banks/');
      console.log('Vendor banks raw data:', vendorBanksRes.data);
      
      // Fetch loan types
      const loanTypesRes = await api.get('loan-types/');
      console.log('Loan types raw data:', loanTypesRes.data);
      
      // Process seminars data
      let seminarsData = [];
      if (Array.isArray(seminarsRes.data)) {
        seminarsData = seminarsRes.data;
      } else if (seminarsRes.data && seminarsRes.data.results) {
        seminarsData = seminarsRes.data.results;
      } else if (seminarsRes.data && seminarsRes.data.data) {
        seminarsData = seminarsRes.data.data;
      }
      
      // Process vendor banks data
      let vendorData = [];
      if (Array.isArray(vendorBanksRes.data)) {
        vendorData = vendorBanksRes.data;
      } else if (vendorBanksRes.data && vendorBanksRes.data.results) {
        vendorData = vendorBanksRes.data.results;
      } else if (vendorBanksRes.data && vendorBanksRes.data.data) {
        vendorData = vendorBanksRes.data.data;
      }
      
      // Process loan types data
      let loanData = [];
      if (Array.isArray(loanTypesRes.data)) {
        loanData = loanTypesRes.data;
      } else if (loanTypesRes.data && loanTypesRes.data.results) {
        loanData = loanTypesRes.data.results;
      } else if (loanTypesRes.data && loanTypesRes.data.data) {
        loanData = loanTypesRes.data.data;
      }
      
      console.log('Processed seminars:', seminarsData);
      console.log('Processed vendor banks:', vendorData);
      console.log('Processed loan types:', loanData);
      
      setSeminars(seminarsData);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get name by ID
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

  const handleEdit = (seminar) => {
    console.log('Editing seminar:', seminar);
    setEditingSeminar(seminar);
    setShowCreateForm(false);
  };

  const handleDelete = async (seminarId) => {
    if (!window.confirm('Are you sure you want to delete this seminar?')) {
      return;
    }

    try {
      await api.delete(`seminars/${seminarId}/`);
      fetchAllData();
      alert('Seminar deleted successfully!');
    } catch (error) {
      console.error('Error deleting seminar:', error);
      alert('Error deleting seminar');
    }
  };

  const handleSeminarSaved = () => {
    fetchAllData();
    setEditingSeminar(null);
    setShowCreateForm(false);
  };

  const handleViewVideo = (videoUrl) => {
    if (videoUrl) {
      const fullUrl = videoUrl.startsWith('http') ? videoUrl : `http://127.0.0.1:8000${videoUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">Seminar Management</h1>
            {!showCreateForm && !editingSeminar && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Create New Seminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Form Section */}
      {(showCreateForm || editingSeminar) && (
        <div className="row mb-4">
          <div className="col-12">
            <Seminar 
              seminar={editingSeminar}
              onSeminarSaved={handleSeminarSaved}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingSeminar(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Seminars List Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Seminars List</h5>
              <span className="badge bg-light text-dark">
                Total: {seminars.length}
              </span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading seminars...</p>
                </div>
              ) : seminars.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-film text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 text-muted">No seminars found</p>
                  {!showCreateForm && (
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create Your First Seminar
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Vendor Bank</th>
                        <th>Loan Type</th>
                        <th>Video</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seminars.map((seminar) => {
                        console.log('Seminar data:', {
                          id: seminar.id,
                          name: seminar.name,
                          vendor_bank: seminar.vendor_bank,
                          vendor_bank_type: typeof seminar.vendor_bank,
                          loan_type: seminar.loan_type,
                          loan_type_type: typeof seminar.loan_type
                        });
                        
                        return (
                          <tr key={seminar.id} className="align-middle">
                            <td>
                              <span className="badge bg-light text-dark">{seminar.id}</span>
                            </td>
                            <td>
                              <strong>{seminar.name}</strong>
                            </td>
                            <td>
                              <strong>{getVendorBankName(seminar.vendor_bank)}</strong>
                              <br />
                              <small className="text-muted">
                                {typeof seminar.vendor_bank === 'object' 
                                  ? `Object ID: ${seminar.vendor_bank?.id}` 
                                  : `ID: ${seminar.vendor_bank}`}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {getLoanTypeName(seminar.loan_type)}
                              </span>
                              <br />
                              <small className="text-muted">
                                {typeof seminar.loan_type === 'object' 
                                  ? `Object ID: ${seminar.loan_type?.id}` 
                                  : `ID: ${seminar.loan_type}`}
                              </small>
                            </td>
                            <td>
                              {seminar.video ? (
                                <button 
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  onClick={() => handleViewVideo(seminar.video)}
                                  title="Watch Video"
                                >
                                  <i className="bi bi-play-circle me-1"></i>
                                  <small>Watch</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No Video</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${seminar.status ? 'bg-success' : 'bg-secondary'}`}>
                                {seminar.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatDate(seminar.created_at)}
                              </small>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleEdit(seminar)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(seminar.id)}
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
            {seminars.length > 0 && (
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing <strong>{seminars.length}</strong> seminar{seminars.length !== 1 ? 's' : ''}
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

export default SeminarList;