import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function PayoutCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState(true);

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/category/`, {
        headers: getAuthHeaders()
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        setError('Unauthorized. Please login again.');
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Check Django server.');
      } else {
        setError('Failed to load categories. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      alert('Category name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/category/`, {
        category_name: categoryName.trim(),
        status: true
      }, {
        headers: getAuthHeaders()
      });

      // Add new category to the list
      setCategories([...categories, response.data]);
      setCategoryName('');
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      
      let errorMsg = 'Failed to add category. ';
      if (error.response?.status === 400) {
        if (error.response.data?.category_name) {
          const err = error.response.data.category_name;
          errorMsg = Array.isArray(err) ? err[0] : err;
        }
      } else if (error.response?.status === 401) {
        errorMsg = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 409) {
        errorMsg = 'Category name already exists.';
      }
      
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/category/${id}/`, {
        headers: getAuthHeaders()
      });
      setCategories(categories.filter(category => category.id !== id));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/category/${id}/`, {
        status: !currentStatus
      }, {
        headers: getAuthHeaders()
      });

      setCategories(categories.map(category => 
        category.id === id ? response.data : category
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Edit functions
  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.category_name);
    setEditStatus(category.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStatus(true);
  };

  const handleEditSubmit = async (id) => {
    if (!editName.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/category/${id}/`, {
        category_name: editName.trim(),
        status: editStatus
      }, {
        headers: getAuthHeaders()
      });

      setCategories(categories.map(category => 
        category.id === id ? response.data : category
      ));
      setEditingId(null);
      setEditName('');
      setEditStatus(true);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      
      let errorMsg = 'Failed to update category. ';
      if (error.response?.status === 400) {
        if (error.response.data?.category_name) {
          const err = error.response.data.category_name;
          errorMsg = Array.isArray(err) ? err[0] : err;
        }
      } else if (error.response?.status === 409) {
        errorMsg = 'Category name already exists.';
      }
      
      alert(errorMsg);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Payout Category</h4>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Add Category Card */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0 fw-bold">Add Category</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting || !categoryName.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Category List Card */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0 fw-bold">Category List</h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No categories found. Add your first category above.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">CATEGORY</th>
                        <th>STATUS</th>
                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="ps-3 align-middle">
                            {editingId === category.id ? (
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  autoFocus
                                />
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={editStatus}
                                    onChange={(e) => setEditStatus(e.target.checked)}
                                  />
                                  <label className="form-check-label small">
                                    {editStatus ? 'Active' : 'Inactive'}
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <span className="fw-medium">{category.category_name}</span>
                            )}
                          </td>
                          <td className="align-middle">
                            {editingId === category.id ? null : (
                              <span 
                                className={`badge ${category.status ? 'bg-success' : 'bg-danger'} px-3 py-2`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleStatus(category.id, category.status)}
                              >
                                {category.status ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="d-flex gap-2 justify-content-center">
                              {editingId === category.id ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleEditSubmit(category.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={cancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => startEdit(category)}
                                    title="Edit Category"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(category.id)}
                                    title="Delete Category"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayoutCategory;