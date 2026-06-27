// EmpDepartment.jsx
import React, { useEffect, useState } from 'react';
import "./styles/EmpDepartment.css";
import { useNavigate } from 'react-router-dom';

function EmpDepartment() {
  const [name, setName] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
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
    }
  }, [navigate]);

  useEffect(() => { 
    fetchList(); 
  }, []);

  function fetchList() {
    setLoading(true);
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
        console.log('Fetched data:', data);
        setList(data || []);
        setError('');
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setList([]);
        setError('Failed to load departments');
      })
      .finally(() => setLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name.trim()) { 
      setError('Department field is required'); 
      return; 
    }
    
    try {
      const res = await fetch('/api/departments/', { 
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          status: true
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
        setName(''); 
        setSuccess('Department added successfully!');
        fetchList();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.name?.[0] || errorData.detail || 'Failed to add department');
      }
    } catch (error) { 
      console.error('Add error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  function startEdit(department) {
    setEditingId(department.id);
    setEditName(department.name);
    setEditStatus(department.status);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditStatus(true);
    setError('');
    setSuccess('');
  }

  async function handleEditSubmit(id) {
    setError('');
    setSuccess('');
    
    if (!editName.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      const res = await fetch(`/api/departments/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus
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
        setEditingId(null);
        setEditName('');
        setEditStatus(true);
        setSuccess('Department updated successfully!');
        fetchList();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.name?.[0] || errorData.detail || 'Failed to update department');
      }
    } catch (error) {
      console.error('Edit error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      const res = await fetch(`/api/departments/${id}/`, {
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
        setSuccess('Department deleted successfully!');
        fetchList();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Delete failed. The department may be in use.');
      }
    } catch (error) { 
      console.error('Delete error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  async function handleStatusToggle(id, currentStatus) {
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/departments/${id}/`, {
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
        setSuccess(`Department ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchList();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setError('Network error. Please check your connection.');
    }
  }

  return (
    <div className="master-page-container">
      <div className="master-header"><h2>Add Department</h2></div>
      
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
        <form className="dept-form" onSubmit={handleAdd}>
          <div className="input-group">
            <input 
              placeholder="Department Name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        <div className="dept-list">
          <h3>Department List</h3>
          <table className="dept-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading">
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                      Loading departments...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No departments found. Add one above.
                    </div>
                  </td>
                </tr>
              ) : (
                list.map(d => (
                  <tr key={d.id}>
                    {editingId === d.id ? (
                      // Edit Mode
                      <>
                        <td>{d.id}</td>
                        <td>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                        </td>
                        <td>
                          <select
                            value={editStatus ? 'active' : 'inactive'}
                            onChange={(e) => setEditStatus(e.target.value === 'active')}
                            className="status-select"
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
                        <td>{d.id}</td>
                        <td>{d.name}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmpDepartment;