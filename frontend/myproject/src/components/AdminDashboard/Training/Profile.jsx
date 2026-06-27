import React, { useState, useEffect } from 'react';
import api from '../../../api';

const Profile = ({ profile = null, onProfileSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    vendor_bank: '',
    loan_type: '',
    image: null,
    file: null,
    status: true
  });

  const [vendorBanks, setVendorBanks] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingFile, setExistingFile] = useState(null);

  const isEditMode = !!profile;

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        vendor_bank: profile.vendor_bank || '',
        loan_type: profile.loan_type || '',
        image: null,
        file: null,
        status: profile.status !== undefined ? profile.status : true
      });
      if (profile.image) {
        setExistingImage(profile.image);
      }
      if (profile.file) {
        setExistingFile(profile.file);
      }
    }
  }, [profile, isEditMode]);

  // Fetch dropdown data
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      console.log('Fetching dropdown data...');
      
      // Fetch vendor banks
      const vendorBanksRes = await api.get('vendor-banks/');
      console.log('Vendor Banks API Response:', vendorBanksRes.data);
      
      // Fetch loan types
      const loanTypesRes = await api.get('loan-types/');
      console.log('Loan Types API Response:', loanTypesRes.data);
      
      // Handle different response structures
      let vendorData = [];
      if (Array.isArray(vendorBanksRes.data)) {
        vendorData = vendorBanksRes.data;
      } else if (vendorBanksRes.data && vendorBanksRes.data.results) {
        vendorData = vendorBanksRes.data.results;
      } else if (vendorBanksRes.data && vendorBanksRes.data.data) {
        vendorData = vendorBanksRes.data.data;
      }
      
      let loanData = [];
      if (Array.isArray(loanTypesRes.data)) {
        loanData = loanTypesRes.data;
      } else if (loanTypesRes.data && loanTypesRes.data.results) {
        loanData = loanTypesRes.data.results;
      } else if (loanTypesRes.data && loanTypesRes.data.data) {
        loanData = loanTypesRes.data.data;
      }
      
      console.log('Processed Vendor Data:', vendorData);
      console.log('Processed Loan Data:', loanData);
      
      setVendorBanks(vendorData);
      setLoanTypes(loanData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error loading dropdown data: ${error.message}`);
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
    
    if (name === 'image' && files[0]) {
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
    if (!formData.vendor_bank) {
      alert('Please select Vendor Bank');
      return;
    }

    if (!formData.loan_type) {
      alert('Please select Loan Type');
      return;
    }

    // For create mode, both files are required
    if (!isEditMode) {
      if (!formData.image) {
        alert('Please select an image');
        return;
      }
      if (!formData.file) {
        alert('Please select a file');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('vendor_bank', formData.vendor_bank);
      submitData.append('loan_type', formData.loan_type);
      submitData.append('status', formData.status);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      console.log('Submitting form data:', {
        vendor_bank: formData.vendor_bank,
        loan_type: formData.loan_type,
        status: formData.status,
        hasImage: !!formData.image,
        hasFile: !!formData.file
      });

      let response;
      if (isEditMode) {
        response = await api.put(`profiles/${profile.id}/`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('profiles/', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      console.log('API Response:', response.data);

      // Reset form
      setFormData({
        vendor_bank: '',
        loan_type: '',
        image: null,
        file: null,
        status: true
      });
      setImagePreview(null);
      setExistingImage(null);
      setExistingFile(null);
      
      // Reset file inputs
      document.getElementById('image').value = '';
      document.getElementById('file').value = '';

      // Notify parent
      if (onProfileSaved) {
        onProfileSaved();
      }
      
      alert(isEditMode ? 'Profile updated successfully!' : 'Profile created successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save profile';
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
      vendor_bank: '',
      loan_type: '',
      image: null,
      file: null,
      status: true
    });
    setImagePreview(null);
    setExistingImage(null);
    setExistingFile(null);
    document.getElementById('image').value = '';
    document.getElementById('file').value = '';
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="card shadow-sm">
      <div className={`card-header ${isEditMode ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
        <h5 className="mb-0">
          {isEditMode ? 'Edit Profile' : 'Create New Profile'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i class="bi bi-bank2"></i>
                Vendor Bank <span className="text-danger">*</span>
              </label>
              <select
                name="vendor_bank"
                value={formData.vendor_bank}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loadingDropdowns || vendorBanks.length === 0}
              >
                <option value="">Select Bank</option>
                {vendorBanks.length === 0 && loadingDropdowns && (
                  <option value="" disabled>Loading vendor banks...</option>
                )}
                {vendorBanks.length === 0 && !loadingDropdowns && (
                  <option value="" disabled>No vendor banks available</option>
                )}
                {vendorBanks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.vendor_name || bank.name || `Bank ${bank.id}`}
                  </option>
                ))}
              </select>
              {vendorBanks.length === 0 && !loadingDropdowns && (
                <small className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  No vendor banks found. Please check if vendor banks exist in the system.
                </small>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i class="bi bi-cash-coin"></i>
                Loan Type <span className="text-danger">*</span>
              </label>
              <select
                name="loan_type"
                value={formData.loan_type}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loadingDropdowns || loanTypes.length === 0}
              >
                <option value="">Select Loan Type</option>
                {loanTypes.length === 0 && loadingDropdowns && (
                  <option value="" disabled>Loading loan types...</option>
                )}
                {loanTypes.length === 0 && !loadingDropdowns && (
                  <option value="" disabled>No loan types available</option>
                )}
                {loanTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name || type.loan_type || type.loan_type_name || `Loan Type ${type.id}`}
                  </option>
                ))}
              </select>
              {loanTypes.length === 0 && !loadingDropdowns && (
                <small className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  No loan types found. Please check if loan types exist in the system.
                </small>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i class="bi bi-images"></i>
                Image {!isEditMode && <span className="text-danger">*</span>}
              </label>
              <div className="input-group">
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="form-control"
                  required={!isEditMode}
                  disabled={loadingDropdowns}
                />
              </div>
              <small className="form-text text-muted">
                {formData.image ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {formData.image.name}
                  </span>
                ) : existingImage ? (
                  <span className="text-info">
                    <i className="bi bi-image me-1"></i>
                    Existing image will be retained
                  </span>
                ) : 'Choose an image file (JPG, PNG, etc.)'}
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

            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i class="bi bi-file-earmark-arrow-up-fill"></i>
                File {!isEditMode && <span className="text-danger">*</span>}
              </label>
              <div className="input-group">
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="form-control"
                  required={!isEditMode}
                  disabled={loadingDropdowns}
                />
              </div>
              <small className="form-text text-muted">
                {formData.file ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {formData.file.name}
                  </span>
                ) : existingFile ? (
                  <span className="text-info">
                    <i className="bi bi-file-earmark me-1"></i>
                    Existing file will be retained
                  </span>
                ) : 'Choose a file (PDF, DOC, etc.)'}
              </small>
              
              {/* Existing File Link */}
              {existingFile && !formData.file && (
                <div className="mt-2">
                  <a 
                    href={`http://127.0.0.1:8000${existingFile}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-download me-1"></i>
                    View Existing File
                  </a>
                </div>
              )}
            </div>

            <div className="col-md-12 mb-3">
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
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : loadingDropdowns ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isEditMode ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {isEditMode ? 'Update Profile' : 'Create Profile'}
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
            ? 'Update the profile details. Leave files unchanged to keep existing ones.'
            : <span>All fields marked with <span className="text-danger">*</span> are required</span>
          }
        </small>
      </div>
    </div>
  );
};

export default Profile;