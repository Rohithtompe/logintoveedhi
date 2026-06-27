import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManufactureYear = () => {
  const [formData, setFormData] = useState({
    manufacture_year: ''
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    manufacture_year: ''
  });

  const [manufactureYears, setManufactureYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchManufactureYears();
  }, []);

  const fetchManufactureYears = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint: /api/manufacture-year/
      const response = await api.get('manufacture-year/');
      console.log('Manufacture years response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        // Filter active records (assuming status field exists)
        const activeYears = response.data.filter(item =>
          item.status === true || item.status === 1 || item.status === "true"
        );
        setManufactureYears(activeYears);
      }
    } catch (error) {
      console.error('Error fetching manufacture years:', error);
      toast.error('Failed to load manufacture years');
    } finally {
      setLoading(false);
    }
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    // Check if it's a 4-digit number
    if (!/^\d{4}$/.test(year)) {
      return 'Please enter a valid 4-digit year';
    }

    const yearNum = parseInt(year, 10);

    // Check if it's within valid range
    if (yearNum < minYear || yearNum > currentYear) {
      return `Please enter a year between ${minYear} and ${currentYear}`;
    }

    return '';
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Remove non-numeric characters
    value = value.replace(/\D/g, '');

    // Limit to 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

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
    let { name, value } = e.target;

    // Remove non-numeric characters
    value = value.replace(/\D/g, '');

    // Limit to 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

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

    if (!data.manufacture_year?.trim()) {
      newErrors.manufacture_year = 'Manufacture Year is required';
    } else {
      const yearError = validateYear(data.manufacture_year);
      if (yearError) {
        newErrors.manufacture_year = yearError;
      }
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

      // Check if manufacture year already exists
      const existingYear = manufactureYears.find(
        year => year.manufacture_year === formData.manufacture_year &&
          (year.status === true || year.status === 1)
      );

      if (existingYear) {
        toast.error('Manufacture Year already exists');
        return;
      }

      // Create new manufacture year
      const payload = {
        manufacture_year: formData.manufacture_year,
        status: true // Active by default
      };

      console.log('Creating manufacture year with payload:', payload);
      const response = await api.post('manufacture-year/', payload);
      console.log('Create response:', response.data);

      toast.success('Manufacture Year Added Successfully');
      setFormData({ manufacture_year: '' });
      fetchManufactureYears();

    } catch (error) {
      console.error('Error adding manufacture year:', error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.manufacture_year) {
          const errorMsg = Array.isArray(errorData.manufacture_year)
            ? errorData.manufacture_year[0]
            : errorData.manufacture_year;
          toast.error(`Manufacture Year: ${errorMsg}`);
        } else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
          toast.error(errorMsg);
        } else {
          toast.error('Failed to add manufacture year');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (year) => {
    setEditFormData({
      id: year.id,
      manufacture_year: year.manufacture_year
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

      // Check if manufacture year already exists (excluding current one)
      const existingYear = manufactureYears.find(
        year => year.id !== editFormData.id &&
          year.manufacture_year === editFormData.manufacture_year &&
          (year.status === true || year.status === 1)
      );

      if (existingYear) {
        toast.error('Manufacture Year already exists');
        return;
      }

      const payload = {
        manufacture_year: editFormData.manufacture_year
      };

      console.log('Updating manufacture year with payload:', payload);
      const response = await api.put(`manufacture-year/${editFormData.id}/`, payload);
      console.log('Update response:', response.data);

      toast.success('Manufacture Year Updated Successfully');
      setShowEditModal(false);
      fetchManufactureYears();

    } catch (error) {
      console.error('Error updating manufacture year:', error);
      toast.error('Failed to update manufacture year');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manufacture year?')) {
      return;
    }

    try {
      await api.delete(`manufacture-year/${id}/`);
      toast.success('Manufacture Year deleted successfully');
      fetchManufactureYears();
    } catch (error) {
      console.error('Error deleting manufacture year:', error);
      toast.error('Failed to delete manufacture year');
    }
  };

  const handleStatusToggle = async (year) => {
    try {
      const newStatus = !year.status;
      await api.patch(`manufacture-year/${year.id}/`, { status: newStatus });
      toast.success(`Manufacture Year ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchManufactureYears();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter years based on search term
  const filteredYears = manufactureYears.filter(year => {
    if (!searchTerm.trim()) return true;

    const yearStr = year.manufacture_year?.toString() || '';
    return yearStr.includes(searchTerm);
  });

  // Sort years in descending order (newest first)
  const sortedYears = [...filteredYears].sort((a, b) =>
    parseInt(b.manufacture_year) - parseInt(a.manufacture_year)
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Add Manufacture Year Form */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Add Manufacture Year</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="manufacture_year" className="form-label">
                        <i class="bi bi-calendar-day-fill"></i>
                        Manufacture Year <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.manufacture_year ? 'is-invalid' : ''}`}
                        id="manufacture_year"
                        name="manufacture_year"
                        placeholder="Enter year (YYYY)"
                        value={formData.manufacture_year}
                        onChange={handleInputChange}
                        maxLength="4"
                      />
                      {errors.manufacture_year && (
                        <div className="invalid-feedback">{errors.manufacture_year}</div>
                      )}
                      <div className="form-text">
                        Enter a 4-digit year between 1900 and {new Date().getFullYear()}
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
                        ) : 'Add Year'}
                      </button>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ manufacture_year: '' })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Manufacture Years List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Manufacture Years</h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchManufactureYears}
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
                    <p className="mt-2">Loading manufacture years...</p>
                  </div>
                ) : sortedYears.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {searchTerm ? 'No years found matching your search' : 'No manufacture years found'}
                    </p>
                    {manufactureYears.length > 0 && searchTerm && (
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
                          <th>Year</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {sortedYears.map((year, index) => (
                          <tr key={year.id}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{year.manufacture_year}</strong>
                            </td>
                            <td>
                              <span
                                className={`badge ${year.status ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStatusToggle(year)}
                                title="Click to toggle status"
                              >
                                {year.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(year)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(year.id)}
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

                {!loading && sortedYears.length > 0 && (
                  <div className="text-muted mt-2">
                    Showing {sortedYears.length} of {manufactureYears.length} years
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
                <h5 className="modal-title">Edit Manufacture Year</h5>
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
                    <label className="form-label">Manufacture Year <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.manufacture_year ? 'is-invalid' : ''}`}
                      name="manufacture_year"
                      value={editFormData.manufacture_year}
                      onChange={handleEditInputChange}
                      placeholder="Enter year (YYYY)"
                      maxLength="4"
                      disabled={editing}
                    />
                    {errors.manufacture_year && (
                      <div className="invalid-feedback d-block">{errors.manufacture_year}</div>
                    )}
                    <div className="form-text">
                      Enter a 4-digit year between 1900 and {new Date().getFullYear()}
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

export default ManufactureYear;