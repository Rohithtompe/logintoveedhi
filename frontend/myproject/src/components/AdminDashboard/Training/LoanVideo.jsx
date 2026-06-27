import React, { useState, useEffect } from 'react';
import api from '../../../api';

const LoanVideo = ({ video = null, onVideoSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    video_name: '',
    video_image: null,
    video: null,
    vendor_bank: '',
    loan_type: '',
    status: true
  });

  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);

  const isEditMode = !!video;

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && video) {
      setFormData({
        video_name: video.video_name || '',
        vendor_bank: typeof video.vendor_bank === 'object' ? video.vendor_bank.id : video.vendor_bank || '',
        loan_type: typeof video.loan_type === 'object' ? video.loan_type.id : video.loan_type || '',
        video_image: null,
        video: null,
        status: video.status !== undefined ? video.status : true
      });
      
      if (video.video_image) {
        setExistingImage(video.video_image);
      }
      if (video.video) {
        setExistingVideo(video.video);
      }
    }
  }, [video, isEditMode]);

  // Fetch vendor banks and loan types on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      const [vendorBanksRes, loanTypesRes] = await Promise.all([
        api.get('vendor-banks/'),
        api.get('loan-types/')
      ]);
      
      const vendorData = Array.isArray(vendorBanksRes.data) ? vendorBanksRes.data : vendorBanksRes.data.results || [];
      const loanData = Array.isArray(loanTypesRes.data) ? loanTypesRes.data : loanTypesRes.data.results || [];
      
      setVendorBanks(vendorData);
      setLoanTypes(loanData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      alert('Error loading dropdown data');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'video_image' && files[0]) {
      // Create preview for image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
    
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.video_name || !formData.vendor_bank || !formData.loan_type) {
      alert('Please fill all required fields');
      return;
    }

    // For create mode, both files are required
    if (!isEditMode && (!formData.video_image || !formData.video)) {
      alert('Please select both image and video files');
      return;
    }

    // For edit mode, check if at least one file is provided or exists
    if (isEditMode && !formData.video_image && !existingImage && !formData.video && !existingVideo) {
      alert('Please select at least one file to update');
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('video_name', formData.video_name);
      submitData.append('vendor_bank', formData.vendor_bank);
      submitData.append('loan_type', formData.loan_type);
      submitData.append('status', formData.status);
      
      // Append files if provided
      if (formData.video_image) {
        submitData.append('video_image', formData.video_image);
      }
      
      if (formData.video) {
        submitData.append('video', formData.video);
      }

      console.log('Submitting data:', {
        video_name: formData.video_name,
        vendor_bank: formData.vendor_bank,
        loan_type: formData.loan_type,
        status: formData.status,
        hasImage: !!formData.video_image,
        hasVideo: !!formData.video
      });

      let response;
      if (isEditMode) {
        response = await api.patch(`loan-videos/${video.id}/`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('loan-videos/', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      console.log('API Response:', response.data);

      // Reset form
      setFormData({
        video_name: '',
        video_image: null,
        video: null,
        vendor_bank: '',
        loan_type: '',
        status: true
      });
      setImagePreview(null);
      setExistingImage(null);
      setExistingVideo(null);
      
      // Reset file inputs
      document.getElementById('video_image').value = '';
      document.getElementById('video').value = '';

      // Notify parent component
      if (onVideoSaved) {
        onVideoSaved();
      }
      
      alert(isEditMode ? 'Video updated successfully!' : 'Video added successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = isEditMode ? 'Failed to update video' : 'Failed to add video';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = [];
          for (const key in error.response.data) {
            if (Array.isArray(error.response.data[key])) {
              errors.push(...error.response.data[key]);
            } else {
              errors.push(error.response.data[key]);
            }
          }
          errorMessage = errors.join(', ');
        } else {
          errorMessage = error.response.data.toString();
        }
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      video_name: '',
      video_image: null,
      video: null,
      vendor_bank: '',
      loan_type: '',
      status: true
    });
    setImagePreview(null);
    setExistingImage(null);
    setExistingVideo(null);
    document.getElementById('video_image').value = '';
    document.getElementById('video').value = '';
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="card shadow-sm">
      <div className={`card-header ${isEditMode ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
        <h5 className="mb-0">
          {isEditMode ? 'Edit Video' : 'Upload New Video'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">
                <i class="bi bi-camera-reels-fill"></i>
                Video Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="video_name"
                value={formData.video_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter video name"
                required
                disabled={loadingDropdowns}
              />
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">
                <i class="bi bi-card-image"></i>
                Video Image {!isEditMode && <span className="text-danger">*</span>}
              </label>
              <div className="input-group">
                <input
                  type="file"
                  id="video_image"
                  name="video_image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="form-control"
                  required={!isEditMode}
                  disabled={loadingDropdowns}
                />
              </div>
              <small className="form-text text-muted">
                {formData.video_image ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {formData.video_image.name}
                  </span>
                ) : existingImage ? (
                  <span className="text-info">
                    <i className="bi bi-image me-1"></i>
                    Existing image will be retained
                  </span>
                ) : 'Choose an image file for thumbnail'}
              </small>
              
              {/* Image Preview */}
              {(imagePreview || existingImage) && (
                <div className="mt-2">
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview || `http://127.0.0.1:8000${existingImage}`} 
                      alt="Preview" 
                      className="img-thumbnail"
                      style={{ maxWidth: '150px', maxHeight: '150px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">
                <i class="bi bi-files-alt"></i>
                Video File {!isEditMode && <span className="text-danger">*</span>}
              </label>
              <div className="input-group">
                <input
                  type="file"
                  id="video"
                  name="video"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="form-control"
                  required={!isEditMode}
                  disabled={loadingDropdowns}
                />
              </div>
              <small className="form-text text-muted">
                {formData.video ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {formData.video.name}
                  </span>
                ) : existingVideo ? (
                  <span className="text-info">
                    <i className="bi bi-play-circle me-1"></i>
                    Existing video will be retained
                  </span>
                ) : 'Choose a video file (mp4, mov, avi, etc.)'}
              </small>
              
              {/* Existing Video Link */}
              {existingVideo && !formData.video && (
                <div className="mt-2">
                  <a 
                    href={`http://127.0.0.1:8000${existingVideo}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-play-circle me-1"></i>
                    View Existing Video
                  </a>
                </div>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">
                <i class="bi bi-bank"></i>
                Vendor Bank <span className="text-danger">*</span>
              </label>
              <select
                name="vendor_bank"
                value={formData.vendor_bank}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loadingDropdowns}
              >
                <option value="">Select Bank</option>
                {vendorBanks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.vendor_name || bank.name || bank.bank_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">
                <i class="bi bi-bank2"></i>
                Loan Type <span className="text-danger">*</span>
              </label>
              <select
                name="loan_type"
                value={formData.loan_type}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loadingDropdowns}
              >
                <option value="">Select Loan Type</option>
                {loanTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name || type.loan_type || type.loan_type_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-12 mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="form-check-input"
                  disabled={loadingDropdowns}
                />
                <label className="form-check-label" htmlFor="status">
                  Active Status
                </label>
              </div>
            </div>

            <div className="col-12">
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary flex-fill"
                  disabled={submitLoading || loadingDropdowns}
                >
                  {submitLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditMode ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : loadingDropdowns ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isEditMode ? 'bi-check-circle' : 'bi-upload'} me-2`}></i>
                      {isEditMode ? 'Update Video' : 'Upload Video'}
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={submitLoading || loadingDropdowns}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  {isEditMode ? 'Cancel' : 'Reset'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="card-footer bg-light">
        <small className="text-muted">
          {isEditMode 
            ? 'Update the video details. Leave files unchanged to keep existing ones.'
            : 'All fields marked with <span className="text-danger">*</span> are required'
          }
        </small>
      </div>
    </div>
  );
};

export default LoanVideo;