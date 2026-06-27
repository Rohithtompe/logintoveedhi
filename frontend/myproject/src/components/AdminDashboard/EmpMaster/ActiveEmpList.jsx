import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import "./styles/ActiveEmpList.css";

function ActiveEmpList() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  // const limit = 50;
  const limit = 25;
  const navigate = useNavigate();

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    office_email: '',
    contact_info: '',
    office_phone_number: '',
    branch_inner_state: '',
    branch_inner_location: '',
    aadhar_number: '',
    pan_number: '',
    present_address: '',
    permanent_address: '',
    date_of_birth: '',
    employee_image: null,
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branchInnerStates, setBranchInnerStates] = useState([]);
  const [branchInnerLocations, setBranchInnerLocations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Inject bootstrap-icons if not present
  useEffect(() => {
    const href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // Load current user info
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }

    fetchCurrentUser();
  }, [navigate]);

  // Fetch current user information
  const fetchCurrentUser = async () => {
    try {
      setMe({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch employees from your Django API
  useEffect(() => {
    fetchEmployees(page);
    fetchDropdownData();
  }, [page]);

  // Function to fetch employees using your API
  function fetchEmployees(p = 1) {
    setLoading(true);

    // Try to fetch with backend filter first
    api.get(`users/?page=${p}&limit=${limit}&is_active=true`)
      .then(response => {
        let employeesData = response.data || [];

        if (response.data.results) {
          // If API supports filtering with is_active=true
          const filteredEmployees = response.data.results.filter(emp =>
            emp.is_active === true || emp.is_active === undefined
          );
          const total = filteredEmployees.length;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));

          // Pagination slice
          const startIndex = (p - 1) * limit;
          const endIndex = startIndex + limit;

          setEmployees(filteredEmployees.slice(startIndex, endIndex));
        } else {
          // If response is an array
          const filteredEmployees = employeesData.filter(emp =>
            emp.is_active === true || emp.is_active === undefined
          );

          const total = filteredEmployees.length;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));

          const startIndex = (p - 1) * limit;
          const endIndex = startIndex + limit;

          setEmployees(filteredEmployees.slice(startIndex, endIndex));
        }
      })
      .catch(error => {
        // If backend filter fails (parameter not supported), fetch all and filter locally
        console.log('Backend filter not supported, filtering locally...');

        api.get(`users/?page=${p}&limit=${limit}`)
          .then(response => {
            let employeesData = response.data || [];

            if (response.data.results) {
              // Filter only active employees locally
              const activeEmployees = response.data.results.filter(emp =>
                emp.is_active === true || emp.is_active === undefined
              );

              const total = activeEmployees.length;
              setTotalPages(Math.max(1, Math.ceil(total / limit)));

              const startIndex = (p - 1) * limit;
              const endIndex = startIndex + limit;

              setEmployees(activeEmployees.slice(startIndex, endIndex));
            } else {
              // Filter only active employees locally
              const activeEmployees = employeesData.filter(emp =>
                emp.is_active === true || emp.is_active === undefined
              );

              const total = activeEmployees.length;
              setTotalPages(Math.max(1, Math.ceil(total / limit)));

              const startIndex = (p - 1) * limit;
              const endIndex = startIndex + limit;

              setEmployees(activeEmployees.slice(startIndex, endIndex));
            }
          })
          .catch(error => {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            setTotalPages(1);

            if (error.response?.status === 401) {
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              localStorage.removeItem('role');
              navigate('/');
            }
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      // Fetch departments
      const deptResponse = await api.get('departments-dropdown/');
      setDepartments(deptResponse.data || []);

      // Fetch branch inner states
      const statesResponse = await api.get('branch-inner-states/');
      setBranchInnerStates(statesResponse.data || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Fetch branch locations based on state
  const fetchBranchInnerLocations = async (stateId) => {
    if (!stateId) {
      setBranchInnerLocations([]);
      return;
    }

    try {
      const response = await api.get(`branch-inner-locations/?branch_inner_state=${stateId}`);
      setBranchInnerLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching branch inner locations:', error);
    }
  };

  function handleView(id) {
    navigate(`/admin-dashboard/emp/view/${id}`);
  }

  function handleEdit(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    setEditingEmployee(employee);
    setEditFormData({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      office_email: employee.office_email || '',
      contact_info: employee.contact_info || '',
      office_phone_number: employee.office_phone_number || '',
      branch_inner_state: employee.branch_inner_state || '',
      branch_inner_location: employee.branch_inner_location || '',
      aadhar_number: employee.aadhar_number || '',
      pan_number: employee.pan_number || '',
      present_address: employee.present_address || '',
      permanent_address: employee.permanent_address || '',
      date_of_birth: employee.date_of_birth || '',
      employee_image: null,
    });

    // If branch state exists, fetch locations for that state
    if (employee.branch_inner_state) {
      fetchBranchInnerLocations(employee.branch_inner_state);
    }

    setShowEditModal(true);
  }

  // FIXED: Inactivate employee function
  async function handleInactivate(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const employeeName = employee.first_name && employee.last_name
      ? `${employee.first_name} ${employee.last_name}`
      : employee.username || 'Employee';

    if (!window.confirm(`Are you sure you want to mark "${employeeName}" as inactive? This will prevent them from logging in.`)) return;

    try {
      setLoading(true);

      console.log(`Attempting to inactivate user ${id}`);

      // Get the current user data first
      const currentResponse = await api.get(`users/${id}/`);
      const currentData = currentResponse.data;

      console.log('Current user data:', currentData);

      // Prepare update data with ALL fields, just change is_active
      const updateData = {
        ...currentData,
        is_active: false
      };

      // Remove password field if it exists
      if (updateData.password) {
        delete updateData.password;
      }

      // Ensure work_icons is sent as string if it's an array
      if (updateData.work_icons && Array.isArray(updateData.work_icons)) {
        updateData.work_icons = JSON.stringify(updateData.work_icons);
      }

      console.log('Update data for inactivate:', updateData);

      // Try PATCH first (partial update)
      try {
        const response = await api.patch(`users/${id}/`, {
          is_active: false
        });
        console.log('PATCH successful for inactivate:', response.data);
      } catch (patchError) {
        // If PATCH fails, try PUT with full data
        console.log('PATCH failed, trying PUT...');
        const response = await api.put(`users/${id}/`, updateData);
        console.log('PUT successful for inactivate:', response.data);
      }

      // Remove the employee from the list immediately (since this is ActiveEmpList)
      setEmployees(prevEmployees =>
        prevEmployees.filter(emp => emp.id !== id)
      );

      alert(`✅ "${employeeName}" has been marked as inactive and removed from this list.`);

      // Refresh the list after 1 second to ensure data is synced
      setTimeout(() => {
        fetchEmployees(page);
      }, 1000);

    } catch (error) {
      console.error('Error inactivating employee:', error);

      // Show detailed error
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        if (error.response.status === 400) {
          const errorData = error.response.data;
          let errorMsg = 'Validation error:\n';

          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              errorMsg += `${key}: ${errorData[key].join(', ')}\n`;
            } else {
              errorMsg += `${key}: ${errorData[key]}\n`;
            }
          }
          alert(errorMsg);

        } else if (error.response.status === 403) {
          alert('Permission denied. You need admin rights.');

        } else if (error.response.status === 404) {
          alert('Employee not found.');

        } else if (error.response.status === 405) {
          alert('Method not allowed. Please contact support.');

        } else {
          alert(`Server error: ${error.response.status}`);
        }

      } else if (error.request) {
        alert('No response from server. Check your connection.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Note: handleActivate is removed since this is ActiveEmpList
  // Activated employees should appear in InactiveEmpList

  function renderActions(row) {
    // Since this is ActiveEmpList, all employees here are active
    return (
      <div className="table-actions">
        <button
          className="action-btn view-btn"
          onClick={() => handleView(row.id)}
          title="View"
          disabled={loading}
        >
          <i className="bi bi-eye"></i>
        </button>
        <button
          className="action-btn edit-btn"
          onClick={() => handleEdit(row.id)}
          title="Edit"
          disabled={loading}
        >
          <i className="bi bi-pencil"></i>
        </button>
        {me && me.role === 'admin' && (
          // Show "Inactivate" button only for active employees
          <button
            className="action-btn inactivate-btn"
            onClick={() => handleInactivate(row.id)}
            title="Mark as Inactive"
            disabled={loading}
          >
            <i className="bi bi-shield-lock"></i>

          </button>
        )}
      </div>
    );
  }

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If branch state changes, fetch new locations
    if (name === 'branch_inner_state') {
      setEditFormData(prev => ({
        ...prev,
        branch_inner_location: ''
      }));
      fetchBranchInnerLocations(value);
    }
  };

  // Handle file upload in edit form
  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setEditFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  // Save edited employee data - FIXED VERSION
  const handleSaveEdit = async () => {
    if (!editingEmployee) return;

    setEditLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Editing employee ID:', editingEmployee.id);

      // First, get the current user data from API
      const currentUserResponse = await api.get(`users/${editingEmployee.id}/`);
      const currentUserData = currentUserResponse.data;

      console.log('Current user data:', currentUserData);

      // Prepare update data - keep all fields, update only changed ones
      const updateData = {
        ...currentUserData,
        first_name: editFormData.first_name.trim(),
        last_name: editFormData.last_name.trim(),
        email: editFormData.email || '',
        office_email: editFormData.office_email || '',
        contact_info: editFormData.contact_info || '',
        office_phone_number: editFormData.office_phone_number || '',
        branch_inner_state: editFormData.branch_inner_state || null,
        branch_inner_location: editFormData.branch_inner_location || null,
        aadhar_number: editFormData.aadhar_number || '',
        pan_number: editFormData.pan_number || '',
        present_address: editFormData.present_address || '',
        permanent_address: editFormData.permanent_address || '',
        date_of_birth: editFormData.date_of_birth || null,
      };

      // Remove password field if it exists
      delete updateData.password;

      // Ensure work_icons is string if it's array
      if (updateData.work_icons && Array.isArray(updateData.work_icons)) {
        updateData.work_icons = JSON.stringify(updateData.work_icons);
      }

      console.log('Update data:', updateData);

      // Try PATCH first (partial update) - only send changed fields
      const patchData = {};
      if (editFormData.first_name !== currentUserData.first_name) patchData.first_name = editFormData.first_name.trim();
      if (editFormData.last_name !== currentUserData.last_name) patchData.last_name = editFormData.last_name.trim();
      if (editFormData.email !== currentUserData.email) patchData.email = editFormData.email;
      if (editFormData.office_email !== currentUserData.office_email) patchData.office_email = editFormData.office_email;
      if (editFormData.contact_info !== currentUserData.contact_info) patchData.contact_info = editFormData.contact_info;
      if (editFormData.office_phone_number !== currentUserData.office_phone_number) patchData.office_phone_number = editFormData.office_phone_number;
      if (editFormData.branch_inner_state !== currentUserData.branch_inner_state) patchData.branch_inner_state = editFormData.branch_inner_state;
      if (editFormData.branch_inner_location !== currentUserData.branch_inner_location) patchData.branch_inner_location = editFormData.branch_inner_location;
      if (editFormData.aadhar_number !== currentUserData.aadhar_number) patchData.aadhar_number = editFormData.aadhar_number;
      if (editFormData.pan_number !== currentUserData.pan_number) patchData.pan_number = editFormData.pan_number;
      if (editFormData.present_address !== currentUserData.present_address) patchData.present_address = editFormData.present_address;
      if (editFormData.permanent_address !== currentUserData.permanent_address) patchData.permanent_address = editFormData.permanent_address;
      if (editFormData.date_of_birth !== currentUserData.date_of_birth) patchData.date_of_birth = editFormData.date_of_birth;

      let response;
      try {
        console.log('Trying PATCH request with data:', patchData);
        response = await api.patch(`users/${editingEmployee.id}/`, patchData);
        console.log('Update successful with PATCH:', response.data);
      } catch (patchError) {
        if (patchError.response?.status === 405 || patchError.response?.status === 400) {
          // PATCH not allowed or fails, try PUT with full data
          console.log('PATCH failed, trying PUT...');

          // For file upload with PUT, we need to use FormData
          if (editFormData.employee_image instanceof File) {
            const putFormData = new FormData();
            Object.keys(updateData).forEach(key => {
              if (updateData[key] !== null && updateData[key] !== undefined) {
                putFormData.append(key, updateData[key]);
              }
            });
            putFormData.append('employee_image', editFormData.employee_image);

            response = await api.put(`users/${editingEmployee.id}/`, putFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } else {
            response = await api.put(`users/${editingEmployee.id}/`, updateData);
          }

          console.log('Update successful with PUT:', response.data);
        } else {
          throw patchError;
        }
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Employee updated successfully!');

        // Update the frontend state
        const updatedEmployee = {
          ...editingEmployee,
          ...response.data
        };

        console.log('Updated employee for frontend:', updatedEmployee);

        // Update the employees state
        setEmployees(prevEmployees =>
          prevEmployees.map(emp =>
            emp.id === editingEmployee.id ? updatedEmployee : emp
          )
        );

        // Update editingEmployee as well
        setEditingEmployee(updatedEmployee);

        // Refresh the employees list
        setTimeout(() => {
          fetchEmployees(page);
        }, 500);

        // Close modal after 1.5 seconds
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage('Failed to update employee. Please try again.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);

      let errorMsg = 'Failed to update employee. ';

      if (error.response?.data) {
        console.error('Error response data:', error.response.data);

        if (typeof error.response.data === 'object') {
          // Format validation errors
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
          } else {
            errorMsg += JSON.stringify(error.response.data);
          }
        } else {
          errorMsg += error.response.data;
        }
      } else if (error.message) {
        errorMsg += error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="employee-list-container">
      {/* Enhanced Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget && !editLoading) {
            setShowEditModal(false);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-header-content">
                <h2>
                  <i className="bi bi-pencil-square"></i> Edit Employee
                </h2>
                <p className="employee-identifier">
                  {editingEmployee?.first_name && editingEmployee?.last_name &&
                    ` • ${editingEmployee.first_name} ${editingEmployee.last_name}`
                  }
                  {editingEmployee?.username && ` • ${editingEmployee.username}`}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              {successMessage && (
                <div className="success-message">
                  <i className="bi bi-check-circle-fill"></i>
                  <div>
                    <strong>Success!</strong>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="error-message">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <div>
                    <strong>Error!</strong>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-person-badge"></i> Personal Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-person"></i> First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditFormChange}
                      placeholder="First Name"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-person"></i> Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditFormChange}
                      placeholder="Last Name"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-telephone"></i> Personal Phone *
                    </label>
                    <input
                      type="tel"
                      name="contact_info"
                      value={editFormData.contact_info}
                      onChange={handleEditFormChange}
                      placeholder="10-digit phone number"
                      required
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-phone"></i> Office Phone
                    </label>
                    <input
                      type="tel"
                      name="office_phone_number"
                      value={editFormData.office_phone_number}
                      onChange={handleEditFormChange}
                      placeholder="10-digit office phone"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-envelope"></i> Personal Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      placeholder="personal@example.com"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-envelope-at"></i> Office Email
                    </label>
                    <input
                      type="email"
                      name="office_email"
                      value={editFormData.office_email}
                      onChange={handleEditFormChange}
                      placeholder="office@company.com"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-calendar"></i> Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editFormData.date_of_birth}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-geo-alt"></i> Address Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-building"></i> Branch State
                    </label>
                    <select
                      name="branch_inner_state"
                      value={editFormData.branch_inner_state}
                      onChange={handleEditFormChange}
                      disabled={editLoading}
                    >
                      <option value="">Select Inner State</option>
                      {branchInnerStates.map(state => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-geo"></i> Branch Location
                    </label>
                    <select
                      name="branch_inner_location"
                      value={editFormData.branch_inner_location}
                      onChange={handleEditFormChange}
                      disabled={editLoading || !editFormData.branch_inner_state}
                    >
                      <option value="">Select Inner Location</option>
                      {branchInnerLocations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-house"></i> Present Address
                    </label>
                    <textarea
                      name="present_address"
                      value={editFormData.present_address}
                      onChange={handleEditFormChange}
                      placeholder="Current address"
                      rows="3"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-house-door"></i> Permanent Address
                    </label>
                    <textarea
                      name="permanent_address"
                      value={editFormData.permanent_address}
                      onChange={handleEditFormChange}
                      placeholder="Permanent address"
                      rows="3"
                      disabled={editLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Document Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <i className="bi bi-files"></i> Document Information
                </h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-card-text"></i> Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={editFormData.aadhar_number}
                      onChange={handleEditFormChange}
                      placeholder="12-digit Aadhar"
                      maxLength="12"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-credit-card"></i> PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={editFormData.pan_number}
                      onChange={handleEditFormChange}
                      placeholder="10-character PAN"
                      maxLength="10"
                      disabled={editLoading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-image"></i> Employee Photo
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="employee_image"
                        onChange={handleEditFileChange}
                        accept="image/*"
                        disabled={editLoading}
                        id="employee-image-upload"
                        className="file-input"
                      />
                      <label htmlFor="employee-image-upload" className="file-upload-btn">
                        <i className="bi bi-cloud-upload"></i> Choose File
                      </label>
                      {editFormData.employee_image instanceof File && (
                        <div className="file-info">
                          <i className="bi bi-check-circle"></i> Selected: {editFormData.employee_image.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <i className="bi bi-hourglass-split"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="employee-list-header">
        <div className="header-left">
          <h1><i className="bi bi-people-fill"></i> Active Employees</h1>
          <p className="subtitle">Total: {employees.length} active employees</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Full Name</th> {/* ✅ Combined First & Last Name */}
                <th>Employee ID</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Permission</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading active employees...</p>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <i className="bi bi-people"></i>
                      <h3>No active employees found</h3>
                      <p>There are no active employees in the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>
                      <div className="employee-info">
                        {employee.profile_image ? (
                          <div className="employee-avatar">
                            <img
                              src={employee.profile_image}
                              alt={`${employee.first_name || ''} ${employee.last_name || ''}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="employee-avatar-placeholder">
                          </div>
                        )}
                        <div className="employee-name-details">
                          <div className="employee-full-name">
                            {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="employee-id">{employee.employee_id || employee.username || 'N/A'}</span>
                    </td>

                    <td>
                      <div className="contact-info">
                        {employee.contact_info || 'N/A'}
                      </div>
                    </td>

                    <td>
                      <div className="employee-email">{employee.email || 'N/A'}</div>
                    </td>

                    <td>
                      <span className="department">
                        {employee.department && typeof employee.department === 'object'
                          ? employee.department.name
                          : employee.department_name || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <span className="designation">
                        {employee.designation && typeof employee.designation === 'object'
                          ? employee.designation.name
                          : employee.designation_name || 'N/A'}
                      </span>
                    </td>

                    <td>
                      {/* ✅ All employees in this list are active */}
                      <span
                        style={{
                          color: "#198754", // green
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i
                          className="bi bi-circle-fill"
                          style={{ color: "#198754", fontSize: "8px" }}
                        ></i>
                        Active
                      </span>

                    </td>

                    <td>
                      {renderActions(employee)}
                    </td>

                    <td>
                      <div className="permission-dropdown-container">
                        <select
                          className="permission-select-dropdown"
                          defaultValue=""
                          onChange={(e) => {
                            const selectedValue = e.target.value;

                            if (selectedValue === 'work') {
                              // Navigate to Work Permission with employee ID
                              navigate(`/admin-dashboard/emp/work-permission?userId=${employee.id}`);
                            }
                            else if (selectedValue === 'payout') {
                              // Navigate to Payout Permission with employee ID
                              navigate(`/admin-dashboard/emp/payout-permission?userId=${employee.id}`);
                            }

                            // Reset dropdown to default after selection
                            e.target.value = '';
                          }}
                        >
                          <option value="">Permissions</option>
                          <option value="work">Emp Work Permissions</option>
                          <option value="payout">Payout Permission</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {employees.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn prev"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </button>

            <div className="page-info">
              Page {page} of {totalPages}
            </div>

            <button
              className="pagination-btn next"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveEmpList;