import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function PayoutType() {
  const [payoutTypes, setPayoutTypes] = useState([]);
  const [payoutTypeName, setPayoutTypeName] = useState('');
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

  // Fetch payout types on load
  useEffect(() => {
    fetchPayoutTypes();
  }, []);

  const fetchPayoutTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/payout-type/`, {
        headers: getAuthHeaders()
      });
      setPayoutTypes(response.data);
    } catch (error) {
      console.error('Error fetching payout types:', error);
      if (error.response?.status === 401) {
        setError('Unauthorized. Please login again.');
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Check Django server.');
      } else {
        setError('Failed to load payout types. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!payoutTypeName.trim()) {
      alert('Payout type name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/payout-type/`, {
        payout_name: payoutTypeName.trim(),  // Changed to payout_name
        status: true
      }, {
        headers: getAuthHeaders()
      });

      // Add new payout type to the list
      setPayoutTypes([...payoutTypes, response.data]);
      setPayoutTypeName('');
      alert('Payout type added successfully!');
    } catch (error) {
      console.error('Error adding payout type:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = 'Failed to add payout type. ';
      if (error.response?.status === 400) {
        if (error.response.data?.payout_name) {
          const err = error.response.data.payout_name;
          errorMsg = Array.isArray(err) ? err[0] : err;
        } else if (error.response.data?.non_field_errors) {
          const err = error.response.data.non_field_errors;
          errorMsg = Array.isArray(err) ? err[0] : err;
        }
      } else if (error.response?.status === 401) {
        errorMsg = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Check if Django serializer has syntax error (model : should be model =)';
      }
      
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payout type?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/payout-type/${id}/`, {
        headers: getAuthHeaders()
      });
      setPayoutTypes(payoutTypes.filter(type => type.id !== id));
      alert('Payout type deleted successfully!');
    } catch (error) {
      console.error('Error deleting payout type:', error);
      alert('Failed to delete payout type. Please try again.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/payout-type/${id}/`, {
        status: !currentStatus
      }, {
        headers: getAuthHeaders()
      });

      setPayoutTypes(payoutTypes.map(type => 
        type.id === id ? response.data : type
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Edit functions
  const startEdit = (payoutType) => {
    setEditingId(payoutType.id);
    setEditName(payoutType.payout_name);  // Changed to payout_name
    setEditStatus(payoutType.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStatus(true);
  };

  const handleEditSubmit = async (id) => {
    if (!editName.trim()) {
      alert('Payout type name is required');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/payout-type/${id}/`, {
        payout_name: editName.trim(),  // Changed to payout_name
        status: editStatus
      }, {
        headers: getAuthHeaders()
      });

      setPayoutTypes(payoutTypes.map(type => 
        type.id === id ? response.data : type
      ));
      setEditingId(null);
      setEditName('');
      setEditStatus(true);
      alert('Payout type updated successfully!');
    } catch (error) {
      console.error('Error updating payout type:', error);
      
      let errorMsg = 'Failed to update payout type. ';
      if (error.response?.status === 400) {
        if (error.response.data?.payout_name) {
          const err = error.response.data.payout_name;
          errorMsg = Array.isArray(err) ? err[0] : err;
        }
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Check Django serializer syntax.';
      }
      
      alert(errorMsg);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Payout Type</h4>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Add Payout Type Card */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0 fw-bold">Add Payout Type</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Payout Type Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter payout type name"
                    value={payoutTypeName}
                    onChange={(e) => setPayoutTypeName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting || !payoutTypeName.trim()}
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

      {/* Payout Type List Card */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0 fw-bold">Payout Type List</h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading payout types...</p>
                </div>
              ) : payoutTypes.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No payout types found. Add your first payout type above.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">PAYOUT TYPE</th>
                        <th>STATUS</th>
                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutTypes.map((payoutType) => (
                        <tr key={payoutType.id}>
                          <td className="ps-3 align-middle">
                            {editingId === payoutType.id ? (
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
                              <span className="fw-medium">{payoutType.payout_name}</span>
                            )}
                          </td>
                          <td className="align-middle">
                            {editingId === payoutType.id ? null : (
                              <span 
                                className={`badge ${payoutType.status ? 'bg-success' : 'bg-danger'} px-3 py-2`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleStatus(payoutType.id, payoutType.status)}
                              >
                                {payoutType.status ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="d-flex gap-2 justify-content-center">
                              {editingId === payoutType.id ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleEditSubmit(payoutType.id)}
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
                                    onClick={() => startEdit(payoutType)}
                                    title="Edit Payout Type"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(payoutType.id)}
                                    title="Delete Payout Type"
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

export default PayoutType;