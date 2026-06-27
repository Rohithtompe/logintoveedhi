import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api';

const WorkPermission = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');
  
  const [workIcons, setWorkIcons] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [existingPermissions, setExistingPermissions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch employee information
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      if (!userId) return;
      
      try {
        const response = await api.get(`users/${userId}/`);
        setEmployeeInfo(response.data);
        
        // Get existing work permissions from employee
        if (response.data.work_icons) {
          let workIcons = response.data.work_icons;
          
          if (typeof workIcons === 'string') {
            try {
              workIcons = JSON.parse(workIcons);
            } catch (e) {
              console.warn('Could not parse work_icons as JSON:', e);
              workIcons = [];
            }
          }
          
          setExistingPermissions(workIcons || []);
        }
      } catch (error) {
        console.error('Error fetching employee info:', error);
      }
    };
    
    fetchEmployeeInfo();
  }, [userId]);

  // Fetch work icons data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all work icons
        const response = await api.get('/work-icon/');
        const workIconsData = response.data;
        setWorkIcons(workIconsData);
        
        // Create permissions object from existing permissions
        if (workIconsData.length > 0) {
          const initialPermissions = {};
          workIconsData.forEach(icon => {
            // Check if this work icon is already in employee's permissions
            const isChecked = Array.isArray(existingPermissions) 
              ? existingPermissions.some(perm => 
                  perm == icon.id || 
                  String(perm) == String(icon.id) ||
                  perm == String(icon.id) ||
                  String(perm) == icon.id
                )
              : false;
            
            initialPermissions[icon.id] = isChecked;
          });
          
          setPermissions(initialPermissions);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, existingPermissions]);

  // Handle checkbox change
  const handlePermissionChange = (id) => {
    setPermissions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle select all
  const handleSelectAll = () => {
    const allSelected = workIcons.every(icon => permissions[icon.id]);
    
    const newPermissions = {};
    workIcons.forEach(icon => {
      newPermissions[icon.id] = !allSelected;
    });
    
    setPermissions(newPermissions);
  };

  // Save permissions to employee
  const savePermissions = async () => {
    if (!userId) {
      alert('Please select an employee first');
      return;
    }

    if (workIcons.length === 0) {
      alert('No work icons available to save');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare work_icons array based on checked permissions
      const workIconsArray = [];
      Object.keys(permissions).forEach(iconId => {
        if (permissions[iconId]) {
          workIconsArray.push(parseInt(iconId));
        }
      });

      const updateData = {
        work_icons: workIconsArray
      };

      console.log('Updating employee with data:', updateData);

      // Try PATCH first
      try {
        await api.patch(`/users/${userId}/`, updateData);
      } catch (patchError) {
        if (patchError.response?.status === 405) {
          await api.put(`/users/${userId}/`, updateData);
        } else {
          throw patchError;
        }
      }
      
      // Update existing permissions in state
      setExistingPermissions(workIconsArray);
      
      // Show success message
      setSuccessMessage('✓ Work permissions saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error saving permissions to employee:', err);
      
      let errorMsg = 'Failed to save permissions. ';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = [];
          for (const key in error.response.data) {
            if (Array.isArray(error.response.data[key])) {
              errors.push(`${key}: ${error.response.data[key].join(', ')}`);
            } else {
              errors.push(`${key}: ${error.response.data[key]}`);
            }
          }
          if (errors.length > 0) {
            errorMsg += 'Validation errors: ' + errors.join('; ');
          }
        } else {
          errorMsg += error.response.data;
        }
      } else if (error.message) {
        errorMsg += error.message;
      }
      
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Go back to employee list
  const handleCancel = () => {
    navigate(-1);
  };

  // Helper function to get employee display name
  const getEmployeeDisplayName = () => {
    if (!employeeInfo) return 'Loading...';
    
    let displayName = '';
    if (employeeInfo.first_name && employeeInfo.last_name) {
      displayName = `${employeeInfo.first_name} ${employeeInfo.last_name}`;
    } else if (employeeInfo.first_name) {
      displayName = employeeInfo.first_name;
    } else if (employeeInfo.last_name) {
      displayName = employeeInfo.last_name;
    } else if (employeeInfo.username) {
      displayName = employeeInfo.username;
    } else if (employeeInfo.email) {
      displayName = employeeInfo.email;
    } else {
      displayName = `Employee ${employeeInfo.id}`;
    }
    
    return displayName;
  };

  // Count selected permissions
  const selectedCount = Object.values(permissions).filter(Boolean).length;

  if (!userId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No Employee Selected</h2>
        <p>Please select an employee from the active employees list.</p>
        <button 
          onClick={() => navigate('/admin-dashboard/emp/active')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Active Employees
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <h1 style={{ 
            color: '#2c3e50', 
            marginBottom: '5px',
            fontSize: '24px'
          }}>
            Work Permission Management
          </h1>
          {employeeInfo && (
            <p style={{ color: '#6c757d', margin: 0 }}>
              Employee: {getEmployeeDisplayName()} 
              (ID: {employeeInfo.id})
            </p>
          )}
        </div>
        <button 
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: '8px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: saving ? 0.5 : 1
          }}
        >
          Cancel
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
          {successMessage}
        </div>
      )}

      {/* Stats and Select All */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <div>
          <span style={{ fontWeight: '500', marginRight: '10px' }}>
            Total: {workIcons.length} work icons
          </span>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>
            Selected: {selectedCount}
          </span>
        </div>
        <button 
          onClick={handleSelectAll}
          disabled={workIcons.length === 0 || saving}
          style={{
            padding: '5px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (workIcons.length === 0 || saving) ? 0.5 : 1
          }}
        >
          {workIcons.every(icon => permissions[icon.id]) ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Work Icons Table */}
      <div style={{ 
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 1fr 150px 150px 200px 100px 120px',
          backgroundColor: '#343a40',
          color: 'white',
          padding: '15px',
          fontWeight: 'bold'
        }}>
          <div>#</div>
          <div>ICON NAME</div>
          <div>USERNAME</div>
          <div>PASSWORD</div>
          <div>DESCRIPTION</div>
          <div>IMAGE</div>
          <div style={{ textAlign: 'center' }}>PERMISSION</div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }}></div>
            <p>Loading work icons...</p>
          </div>
        ) : workIcons.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <p>No work icons found</p>
            <button 
              onClick={() => navigate('/admin-dashboard/emp/work-icons')}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Work Icons Management
            </button>
          </div>
        ) : (
          /* Work Icons List */
          <div>
            {workIcons.map((icon, index) => (
              <div 
                key={icon.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 150px 150px 200px 100px 120px',
                  alignItems: 'center',
                  padding: '15px',
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: permissions[icon.id] ? '#f1f8ff' : 'white',
                  transition: 'background-color 0.3s'
                }}
              >
                <div>{index + 1}</div>
                
                <div>
                  <div style={{ fontSize: '16px', marginBottom: '2px', fontWeight: '500' }}>
                    {icon.icon_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    ID: {icon.id}
                  </div>
                </div>
                
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {icon.username}
                  </span>
                </div>
                
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {icon.password || 'N/A'}
                  </span>
                </div>
                
                <div>
                  <small style={{
                    display: 'block',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#6c757d'
                  }}>
                    {icon.icon_description || (
                      <span style={{ fontStyle: 'italic' }}>No description</span>
                    )}
                  </small>
                </div>
                
                <div>
                  {icon.icon_image ? (
                    <img
                      src={icon.icon_image}
                      alt={icon.icon_name}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'contain',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px'
                      }}
                      title={icon.icon_name}
                    />
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      No Image
                    </span>
                  )}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <label style={{ 
                    display: 'inline-block',
                    position: 'relative',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={permissions[icon.id] || false}
                      onChange={() => handlePermissionChange(icon.id)}
                      disabled={saving}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        height: 0,
                        width: 0
                      }}
                    />
                    <span style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      backgroundColor: permissions[icon.id] ? '#28a745' : 'white',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      transition: 'all 0.3s',
                      opacity: saving ? 0.5 : 1
                    }}>
                      {permissions[icon.id] && (
                        <span style={{
                          position: 'absolute',
                          left: '7px',
                          top: '2px',
                          width: '6px',
                          height: '12px',
                          border: 'solid white',
                          borderWidth: '0 2px 2px 0',
                          transform: 'rotate(45deg)'
                        }}></span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'right',
        paddingTop: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <button 
          onClick={savePermissions}
          disabled={saving || workIcons.length === 0}
          style={{
            padding: '10px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: (saving || workIcons.length === 0) ? 0.5 : 1
          }}
        >
          {saving ? 'Saving...' : `Save ${selectedCount} Permission(s) for ${getEmployeeDisplayName()}`}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '50px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()}, VEEDHI All Rights Reserved.
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 1200px) {
          div > div {
            grid-template-columns: 50px 1fr 120px 120px 150px 80px 100px !important;
          }
        }
        
        @media (max-width: 992px) {
          div > div {
            display: block !important;
            padding: 10px !important;
          }
          
          div > div > div {
            margin-bottom: 10px;
            display: flex !important;
            justify-content: space-between;
          }
          
          div > div > div::before {
            content: attr(data-label);
            font-weight: bold;
            margin-right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkPermission;