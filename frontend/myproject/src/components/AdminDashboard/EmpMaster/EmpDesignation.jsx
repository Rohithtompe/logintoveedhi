// EmpDesignation.jsx
import React, { useEffect, useState } from 'react';
import "./styles/EmpDesignation.css";
import { useNavigate } from 'react-router-dom';

export default function EmpDesignation() {
  const [departmentId, setDepartmentId] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editStatus, setEditStatus] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/');
    } else {
      fetchDepartments();
      fetchDesignations();
    }
  }, [navigate]);

  function fetchDepartments() {
    fetch('/api/departments/', { 
      headers: getAuthHeaders()
    })
      .then(r => {
        if (r.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          navigate('/');
          return;
        }
        if (!r.ok) {
          throw new Error('Failed to fetch');
        }
        return r.json();
      })
      .then(data => {
        console.log('Departments fetched:', data);
        setDepartments(data || []);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      });
  }

  function fetchDesignations() {
    setLoading(true);
    fetch('/api/designations/', {
      headers: getAuthHeaders()
    })
      .then(r => {
        if (r.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          navigate('/');
          return;
        }
        if (!r.ok) {
          throw new Error('Failed to fetch');
        }
        return r.json();
      })
      .then(data => {
        console.log('Designations fetched - Full response:', data);
        if (data && data.length > 0) {
          console.log('First designation structure:', data[0]);
        }
        setDesignations(data || []);
        setError('');
      })
      .catch(error => {
        console.error('Error fetching designations:', error);
        setDesignations([]);
        setError('Failed to load designations');
      })
      .finally(() => setLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!departmentId || !designationName.trim()) { 
      setError('All fields are required'); 
      return; 
    }
    
    const designationData = {
      name: designationName.trim(),
      department: parseInt(departmentId),
      status: true
    };
    
    console.log('Adding designation:', designationData);
    
    try {
      const res = await fetch('/api/designations/', { 
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify(designationData)
      });
      
      console.log('Response status:', res.status);
      
      if (res.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
        return;
      }
      
      if (res.ok) { 
        const newDesignation = await res.json();
        console.log('Designation added:', newDesignation);
        
        setDesignationName(''); 
        setDepartmentId(''); 
        setSuccess('Designation added successfully!');
        fetchDesignations();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.name?.[0] || errorData.department?.[0] || 'Failed to add designation');
        } catch {
          setError('Failed to add designation');
        }
      }
    } catch (error) { 
      console.error('Request error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  function startEdit(designation) {
    console.log('Starting edit for designation:', designation);
    
    setEditingId(designation.id);
    setEditName(designation.name);
    
    // Extract department ID based on API response structure
    let deptId = '';
    
    if (designation.department) {
      if (typeof designation.department === 'object') {
        // If department is an object with id property
        if (designation.department.id) {
          deptId = designation.department.id;
        }
      } else {
        // If department is just an ID (number or string)
        deptId = designation.department;
      }
    }
    
    console.log('Extracted department ID:', deptId);
    setEditDepartmentId(deptId.toString());
    setEditStatus(designation.status !== undefined ? designation.status : true);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDepartmentId('');
    setEditStatus(true);
    setError('');
    setSuccess('');
  }

  async function handleEditSubmit(id) {
    setError('');
    setSuccess('');
    
    if (!editName.trim() || !editDepartmentId) {
      setError('All fields are required');
      return;
    }

    const updateData = {
      name: editName.trim(),
      department: parseInt(editDepartmentId),
      status: editStatus
    };

    console.log('Updating designation:', id, updateData);

    try {
      const res = await fetch(`/api/designations/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (res.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
        return;
      }

      if (res.ok) {
        console.log('Designation updated successfully');
        setEditingId(null);
        setSuccess('Designation updated successfully!');
        fetchDesignations();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.name?.[0] || 'Failed to update designation');
      }
    } catch (error) {
      console.error('Edit error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    
    if (!confirm('Are you sure you want to delete this designation?')) return;
    
    try {
      const res = await fetch(`/api/designations/${id}/`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
        return;
      }
      
      if (res.ok) {
        console.log('Designation deleted successfully');
        setSuccess('Designation deleted successfully!');
        fetchDesignations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Delete failed. The designation may be in use.');
      }
    } catch { 
      setError('Network error. Please check your connection.');
    }
  }

  async function handleStatusToggle(id, currentStatus) {
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/designations/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: !currentStatus
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/');
        return;
      }

      if (res.ok) {
        console.log('Status toggled successfully');
        setSuccess(`Designation ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchDesignations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  // Helper function to get department name
  const getDepartmentName = (designation) => {
    // If API returns a department_name field (preferred)
    if (designation.department_name) {
      return designation.department_name;
    }
    
    // Fallback: If department is an object with name
    if (designation.department && typeof designation.department === 'object') {
      return designation.department.name || 'N/A';
    }
    
    // Fallback: If department is just an ID, find in departments list
    if (designation.department) {
      const deptId = parseInt(designation.department);
      const dept = departments.find(d => d.id === deptId);
      return dept ? dept.name : `ID: ${deptId}`;
    }
    
    return 'N/A';
  };

  return (
    <div className="master-page-container">
      <div className="master-header"><h2>Add Designation</h2></div>
      
      {/* Status Messages */}
      {error && (
        <div className="alert alert-error" style={{ margin: '10px 20px', padding: '10px' }}>
          <span style={{ color: 'red' }}>Error: {error}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" style={{ margin: '10px 20px', padding: '10px' }}>
          <span style={{ color: 'green' }}>Success: {success}</span>
        </div>
      )}
      
      <div className="master-content">
        <form className="designation-form" onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select 
                value={departmentId} 
                onChange={e => setDepartmentId(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Designation Name *</label>
              <input 
                value={designationName} 
                onChange={e => setDesignationName(e.target.value)} 
                placeholder="Designation Name" 
                required
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </form>

        <div className="designation-list">
          <h3>Designation List</h3>
          <table className="designation-table">
            <thead>
              <tr>
                <th>Designation Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading">
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                      Loading designations...
                    </div>
                  </td>
                </tr>
              ) : designations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No designations found. Add one above.
                    </div>
                  </td>
                </tr>
              ) : (
                designations.map(d => {
                  const deptName = getDepartmentName(d);
                  console.log(`Designation ${d.name} department:`, d.department, '->', deptName);
                  
                  return (
                    <tr key={d.id} className={editingId === d.id ? 'editing-row' : ''}>
                      {editingId === d.id ? (
                        // Edit Mode
                        <>
                          <td>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="edit-input"
                              autoFocus
                              required
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <select
                              value={editDepartmentId}
                              onChange={(e) => setEditDepartmentId(e.target.value)}
                              className="edit-select"
                              required
                              disabled={loading}
                            >
                              <option value="">Select Department</option>
                              {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={editStatus ? 'active' : 'inactive'}
                              onChange={(e) => setEditStatus(e.target.value === 'active')}
                              className="status-select"
                              disabled={loading}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              className="btn small success"
                              onClick={() => handleEditSubmit(d.id)}
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button 
                              className="btn small secondary"
                              onClick={cancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td>{d.name}</td>
                          <td>
                            {deptName}
                          </td>
                          <td>
                            <span 
                              className={`badge ${d.status ? 'active' : 'inactive'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleStatusToggle(d.id, d.status)}
                              title="Click to toggle status"
                            >
                              {d.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn small" 
                              onClick={() => startEdit(d)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn small danger" 
                              onClick={() => handleDelete(d.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}