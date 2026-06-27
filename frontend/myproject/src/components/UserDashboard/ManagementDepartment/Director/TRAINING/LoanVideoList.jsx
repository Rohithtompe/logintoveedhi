import React, { useState, useEffect } from 'react';
import api from '../../../../../api';
import Director_Sidebar from "../../Director/Sidebar/Director_Sidebar.jsx";
import "../../Director/Sidebar/Director_Sidebar.css";
// Import your LoanVideo component if it exists
// import LoanVideo from './LoanVideo';

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Manager Sidebar */}
      <Director_Sidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        padding: '30px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        minHeight: '100vh',
        overflowX: 'hidden',
        color: '#78350f'
      }}>
        {/* Your Loan Video List Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          {/* Header with Create Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#78350f',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                Loan Video Management
              </h2>
          
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={fetchAllData}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: '#78350f',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
          
            </div>
          </div>

          {/* Create/Edit Form Section */}
          {(showCreateForm || editingVideo) && (
            <div style={{
              marginBottom: '30px',
              padding: '20px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '15px',
              border: '2px solid rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#78350f',
                  margin: 0
                }}>
                  {editingVideo ? 'Edit Video' : 'Create New Video'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingVideo(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: '#78350f'
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              {/* Uncomment and add your LoanVideo component here */}
              {/* <LoanVideo 
                video={editingVideo}
                onVideoSaved={handleVideoSaved}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingVideo(null);
                }}
              /> */}
              <p style={{ color: '#92400e', fontStyle: 'italic' }}>
                LoanVideo component will be placed here
              </p>
            </div>
          )}

          {/* Videos List */}
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #fbbf24',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#78350f', fontSize: '1.1rem' }}>Loading videos...</p>
            </div>
          ) : loanVideos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px'
            }}>
              <i className="bi bi-film" style={{ fontSize: '4rem', color: '#92400e', opacity: 0.5 }}></i>
              <p style={{ color: '#78350f', fontSize: '1.2rem', marginTop: '20px' }}>
                No videos uploaded yet
              </p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    padding: '12px 25px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#78350f',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  Wait for Admin Approval
                </button>
              )}
            </div>
          ) : (
            <div style={{
              overflowX: 'auto',
              borderRadius: '15px',
              background: 'rgba(255, 255, 255, 0.8)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#78350f'
                  }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Video Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Video Image</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Video File</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Vendor Bank</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Loan Type</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {loanVideos.map((video, index) => (
                    <tr key={video.id} style={{
                      borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(251, 191, 36, 0.05)',
                      transition: 'background-color 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(251, 191, 36, 0.05)'}
                    >
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: '#fbbf24',
                          color: '#78350f',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          #{video.id}
                        </span>
                      </td>
                      <td style={{ padding: '15px', fontWeight: '500', color: '#78350f' }}>
                        {video.video_name || 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {video.video_image ? (
                          <button
                            onClick={() => handleViewImage(video.video_image)}
                            style={{
                              padding: '8px 15px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <i className="bi bi-image"></i>
                            View Image
                          </button>
                        ) : (
                          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No Image</span>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {video.video ? (
                          <button
                            onClick={() => handlePlayVideo(video.video)}
                            style={{
                              padding: '8px 15px',
                              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <i className="bi bi-play-circle"></i>
                            Play Video
                          </button>
                        ) : (
                          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No Video</span>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem'
                        }}>
                          {getVendorBankName(video.vendor_bank)}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: '#f59e0b',
                          color: '#78350f',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem'
                        }}>
                          {getLoanTypeName(video.loan_type)}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{
                          background: video.status ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem'
                        }}>
                          {video.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add keyframe animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoanVideoList;