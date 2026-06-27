import React, { useState, useEffect } from 'react';
import api from '../../../api';
import LoanVideo from './LoanVideo'; // Import the form component

const LoanVideoList = () => {
  const [loanVideos, setLoanVideos] = useState([]);
  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [videosRes, vendorBanksRes, loanTypesRes] = await Promise.all([
        api.get('loan-videos/'),
        api.get('vendor-banks/'),
        api.get('loan-types/')
      ]);
      
      // Log the responses to debug
      console.log('Loan Videos API Response:', videosRes.data);
      console.log('Vendor Banks API Response:', vendorBanksRes.data);
      console.log('Loan Types API Response:', loanTypesRes.data);
      
      // Handle videos data
      let videosData = [];
      if (Array.isArray(videosRes.data)) {
        videosData = videosRes.data;
      } else if (videosRes.data && videosRes.data.results) {
        videosData = videosRes.data.results;
      }
      
      // Handle vendor banks data
      let vendorData = [];
      if (Array.isArray(vendorBanksRes.data)) {
        vendorData = vendorBanksRes.data;
      } else if (vendorBanksRes.data && vendorBanksRes.data.results) {
        vendorData = vendorBanksRes.data.results;
      }
      
      // Handle loan types data
      let loanData = [];
      if (Array.isArray(loanTypesRes.data)) {
        loanData = loanTypesRes.data;
      } else if (loanTypesRes.data && loanTypesRes.data.results) {
        loanData = loanTypesRes.data.results;
      }
      
      console.log('Processed Videos:', videosData);
      console.log('Processed Vendor Banks:', vendorData);
      console.log('Processed Loan Types:', loanData);
      
      setLoanVideos(videosData);
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

  // Helper function to display vendor bank name
  const getVendorBankName = (vendorId) => {
    // Check if vendorId is an object
    if (vendorId && typeof vendorId === 'object') {
      return vendorId.vendor_name || vendorId.name || vendorId.bank_name || `Vendor ${vendorId.id}`;
    }
    
    // If it's an ID, find the vendor
    const vendor = vendorBanks.find(v => 
      v.id === vendorId || 
      v.id === parseInt(vendorId) ||
      String(v.id) === String(vendorId)
    );
    
    if (vendor) {
      return vendor.vendor_name || vendor.name || vendor.bank_name || `Vendor ${vendorId}`;
    }
    
    return `Vendor ${vendorId}`;
  };

  // Helper function to display loan type name
  const getLoanTypeName = (loanTypeId) => {
    // Check if loanTypeId is an object
    if (loanTypeId && typeof loanTypeId === 'object') {
      return loanTypeId.name || loanTypeId.loan_type || loanTypeId.loan_type_name || `Loan Type ${loanTypeId.id}`;
    }
    
    // If it's an ID, find the loan type
    const loanType = loanTypes.find(l => 
      l.id === loanTypeId || 
      l.id === parseInt(loanTypeId) ||
      String(l.id) === String(loanTypeId)
    );
    
    if (loanType) {
      return loanType.name || loanType.loan_type || loanType.loan_type_name || `Type ${loanTypeId}`;
    }
    
    return `Type ${loanTypeId}`;
  };

  const handleEdit = (video) => {
    console.log('Editing video:', video);
    setEditingVideo(video);
    setShowCreateForm(false);
  };

  const handleDelete = async (videoId, videoName) => {
    if (!window.confirm(`Are you sure you want to delete video "${videoName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`loan-videos/${videoId}/`);
      alert('Video deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSaved = () => {
    fetchAllData();
    setEditingVideo(null);
    setShowCreateForm(false);
  };

  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handlePlayVideo = (videoUrl) => {
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
            <h1 className="h3 mb-0">Loan Video Management</h1>
          </div>
        </div>
      </div>

      {/* Create/Edit Form Section */}
      {(showCreateForm || editingVideo) && (
        <div className="row mb-4">
          <div className="col-12">
            <LoanVideo 
              video={editingVideo}
              onVideoSaved={handleVideoSaved}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingVideo(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Videos List Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Uploaded Videos List</h5>
              <span className="badge bg-light text-dark">
                Total: {loanVideos.length}
              </span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading videos...</p>
                </div>
              ) : loanVideos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-film text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 text-muted">No videos uploaded yet</p>
                  {!showCreateForm && (
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create Your First Video
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">ID</th>
                        <th>Video Name</th>
                        <th>Video Image</th>
                        <th>Video File</th>
                        <th>Vendor Bank</th>
                        <th>Loan Type</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanVideos.map((video) => {
                        console.log('Rendering video row:', {
                          videoId: video.id,
                          videoName: video.video_name,
                          vendorBankId: video.vendor_bank,
                          vendorBankName: getVendorBankName(video.vendor_bank),
                          loanTypeId: video.loan_type,
                          loanTypeName: getLoanTypeName(video.loan_type)
                        });
                        
                        return (
                          <tr key={video.id} className="align-middle">
                            <td className="text-center">
                              <span className="badge bg-light text-dark">#{video.id}</span>
                            </td>
                            <td>
                              <strong>{video.video_name || 'N/A'}</strong>
                            </td>
                            <td>
                              {video.video_image ? (
                                <button 
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  onClick={() => handleViewImage(video.video_image)}
                                  title="View Image"
                                >
                                  <i className="bi bi-image me-1"></i>
                                  <small>View Image</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No Image</span>
                              )}
                            </td>
                            <td>
                              {video.video ? (
                                <button 
                                  className="btn btn-sm btn-outline-success d-flex align-items-center"
                                  onClick={() => handlePlayVideo(video.video)}
                                  title="Play Video"
                                >
                                  <i className="bi bi-play-circle me-1"></i>
                                  <small>Play Video</small>
                                </button>
                              ) : (
                                <span className="text-muted small">No Video</span>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {getVendorBankName(video.vendor_bank)}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-warning text-dark">
                                {getLoanTypeName(video.loan_type)}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge ${video.status ? 'bg-success' : 'bg-secondary'}`}>
                                {video.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleEdit(video)}
                                  title="Edit"
                                  disabled={showCreateForm || editingVideo}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(video.id, video.video_name)}
                                  title="Delete"
                                  disabled={loading}
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
            {loanVideos.length > 0 && (
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing <strong>{loanVideos.length}</strong> video{loanVideos.length !== 1 ? 's' : ''}
                    <br />
                    <small className="text-muted">
                      Vendor Banks loaded: {vendorBanks.length}
                      <br />
                      Loan Types loaded: {loanTypes.length}
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

      {/* Add some custom styles */}
      <style jsx>{`
        .card {
          border: none;
          border-radius: 10px;
        }
        
        .card-header {
          border-radius: 10px 10px 0 0 !important;
          padding: 1rem 1.5rem;
        }
        
        .table th {
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
          background-color: #f8f9fa;
          white-space: nowrap;
        }
        
        .table td {
          vertical-align: middle;
          white-space: nowrap;
        }
        
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
        }
        
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
        }
        
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.85rem;
          }
          
          .btn-group {
            flex-direction: column;
          }
          
          .btn-group-sm > .btn {
            margin-bottom: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoanVideoList;