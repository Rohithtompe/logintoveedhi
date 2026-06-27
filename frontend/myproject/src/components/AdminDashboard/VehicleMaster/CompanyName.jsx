import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompanyName = () => {
  const [formData, setFormData] = useState({
    company_name: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    company_name: ''
  });
  
  const [companyNames, setCompanyNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanyNames();
  }, []);

  const fetchCompanyNames = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint: /api/company-name/
      const response = await api.get('company-name/');
      console.log('Company names response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter active records (assuming status field exists)
        const activeCompanies = response.data.filter(item => 
          item.status === true || item.status === 1 || item.status === "true"
        );
        setCompanyNames(activeCompanies);
      }
    } catch (error) {
      console.error('Error fetching company names:', error);
      toast.error('Failed to load company names');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    if (!data.company_name?.trim()) {
      newErrors.company_name = 'Company Name is required';
    } else if (data.company_name.trim().length < 2) {
      newErrors.company_name = 'Company Name must be at least 2 characters';
    } else if (data.company_name.trim().length > 100) {
      newErrors.company_name = 'Company Name must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if company name already exists
      const existingCompany = companyNames.find(
        company => company.company_name.toLowerCase() === formData.company_name.trim().toLowerCase() &&
                (company.status === true || company.status === 1)
      );
      
      if (existingCompany) {
        toast.error('Company Name already exists');
        return;
      }
      
      // Create new company name
      const payload = {
        company_name: formData.company_name.trim(),
        status: true // Active by default
      };
      
      console.log('Creating company with payload:', payload);
      const response = await api.post('company-name/', payload);
      console.log('Create response:', response.data);
      
      toast.success('Company Name Added Successfully');
      setFormData({ company_name: '' });
      fetchCompanyNames();
      
    } catch (error) {
      console.error('Error adding company name:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.company_name) {
          const errorMsg = Array.isArray(errorData.company_name) 
            ? errorData.company_name[0] 
            : errorData.company_name;
          toast.error(`Company Name: ${errorMsg}`);
        } else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add company name');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (company) => {
    setEditFormData({
      id: company.id,
      company_name: company.company_name
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editFormData)) {
      return;
    }
    
    try {
      setEditing(true);
      
      // Check if company name already exists (excluding current one)
      const existingCompany = companyNames.find(
        company => company.id !== editFormData.id &&
                company.company_name.toLowerCase() === editFormData.company_name.trim().toLowerCase() &&
                (company.status === true || company.status === 1)
      );
      
      if (existingCompany) {
        toast.error('Company Name already exists');
        return;
      }
      
      const payload = {
        company_name: editFormData.company_name.trim()
      };
      
      console.log('Updating company with payload:', payload);
      const response = await api.put(`company-name/${editFormData.id}/`, payload);
      console.log('Update response:', response.data);
      
      toast.success('Company Name Updated Successfully');
      setShowEditModal(false);
      fetchCompanyNames();
      
    } catch (error) {
      console.error('Error updating company name:', error);
      toast.error('Failed to update company name');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }
    
    try {
      await api.delete(`company-name/${id}/`);
      toast.success('Company deleted successfully');
      fetchCompanyNames();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleStatusToggle = async (company) => {
    try {
      const newStatus = !company.status;
      await api.patch(`company-name/${company.id}/`, { status: newStatus });
      toast.success(`Company ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCompanyNames();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter companies based on search term
  const filteredCompanies = companyNames.filter(company => {
    if (!searchTerm.trim()) return true;
    
    const companyName = company.company_name?.toLowerCase() || '';
    return companyName.includes(searchTerm.toLowerCase());
  });

  // Sort companies alphabetically
  const sortedCompanies = [...filteredCompanies].sort((a, b) => 
    a.company_name.localeCompare(b.company_name)
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Company Name Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Company Name</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="company_name" className="form-label">
                        <i class="bi bi-building"></i>
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                        id="company_name"
                        name="company_name"
                        placeholder="Enter company name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                      />
                      {errors.company_name && (
                        <div className="invalid-feedback">{errors.company_name}</div>
                      )}
                      <div className="form-text">
                        Enter the company name (2-100 characters)
                      </div>
                    </div>
                    
                    <div className="col-md-4 mb-3 d-flex align-items-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : 'Add Company'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ company_name: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Company Names List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Company Names</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchCompanyNames}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading company names...</p>
                  </div>
                ) : sortedCompanies.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No companies found matching your search' : 'No company names found'}
                    </p>
                    {companyNames.length > 0 && searchTerm && (
                      <button 
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>s.no</th>
                          <th>Company Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedCompanies.map((company, index) => (
                          <tr key={company.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{company.company_name}</strong>
                            </td>
                            <td>
                              <span 
                                className={`badge ${company.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(company)}
                                title="Click to toggle status"
                              >
                                {company.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(company)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(company.id)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!loading && sortedCompanies.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedCompanies.length} of {companyNames.length} companies
                    {searchTerm && ` (filtered)`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Company Name</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Company Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                      name="company_name"
                      value={editFormData.company_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter company name"
                      disabled={editing}
                    />
                    {errors.company_name && (
                      <div className="invalid-feedback d-block">{errors.company_name}</div>
                    )}
                    <div className="form-text">
                      Enter the company name (2-100 characters)
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                      disabled={editing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={editing}
                    >
                      {editing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bootstrap Icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
      />
    </>
  );
};

export default CompanyName;