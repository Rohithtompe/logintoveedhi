import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import "./styles/InactiveEmpList.css";

function InactiveEmpList() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const limit = 50;
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  // Fetch employees and filter for inactive only
  function fetchEmployees(p = 1) {
    setLoading(true);

    // Try with query parameter first
    api.get(`users/?page=${p}&limit=${limit}`)
      .then(response => {
        const employeesData = response.data || [];
        let allEmployees = [];
        let total = 0;

        if (response.data.results) {
          allEmployees = response.data.results;
          total = response.data.count || response.data.total || 0;
        } else {
          allEmployees = employeesData;
          total = employeesData.length || 0;
        }

        // 🔥 CRITICAL FIX: Filter for inactive users only
        const inactiveEmployees = allEmployees.filter(emp => emp.is_active === false);

        console.log('Total employees fetched:', allEmployees.length);
        console.log('Inactive employees:', inactiveEmployees.length);

        // Update states
        setEmployees(allEmployees); // Keep all for pagination calculation
        setFilteredEmployees(inactiveEmployees); // Show only inactive

        // Calculate total pages based on filtered count or total count
        const inactiveCount = inactiveEmployees.length;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));

        // If no inactive employees on current page, go to page 1
        if (inactiveCount === 0 && p > 1) {
          setPage(1);
        }
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
        setEmployees([]);
        setFilteredEmployees([]);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // FIXED: Activate employee function
  async function handleActivate(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const employeeName = employee.first_name && employee.last_name
      ? `${employee.first_name} ${employee.last_name}`
      : employee.username || 'Employee';

    if (!window.confirm(`Activate "${employeeName}"? This will move them to active list.`)) return;

    try {
      setLoading(true);
      setErrorMessage('');

      console.log(`Attempting to activate user ${id}`);

      // Get the current user data first
      const currentResponse = await api.get(`users/${id}/`);
      const currentData = currentResponse.data;

      console.log('Current user data:', currentData);

      // Prepare update data with ALL fields, just change is_active
      const updateData = {
        ...currentData,
        is_active: true
      };

      // Remove password field if it exists
      if (updateData.password) {
        delete updateData.password;
      }

      // Ensure work_icons is sent as string if it's an array
      if (updateData.work_icons && Array.isArray(updateData.work_icons)) {
        updateData.work_icons = JSON.stringify(updateData.work_icons);
      }

      console.log('Update data for activate:', updateData);

      // Try PATCH first (partial update)
      try {
        const response = await api.patch(`users/${id}/`, {
          is_active: true
        });
        console.log('PATCH successful for activate:', response.data);
      } catch (patchError) {
        // If PATCH fails, try PUT with full data
        console.log('PATCH failed, trying PUT...');
        const response = await api.put(`users/${id}/`, updateData);
        console.log('PUT successful for activate:', response.data);
      }

      // Update the employee in the local state IMMEDIATELY
      const updatedEmployee = {
        ...employee,
        is_active: true
      };

      // Update both employees and filteredEmployees
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id ? updatedEmployee : emp
        )
      );

      setFilteredEmployees(prev =>
        prev.filter(emp => emp.id !== id)
      );

      setSuccessMessage(`✅ "${employeeName}" activated successfully!`);

      // Refresh after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
        fetchEmployees(page);
      }, 2000);

    } catch (error) {
      console.error('Activation error:', error);

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
          setErrorMessage(errorMsg);

        } else if (error.response.status === 403) {
          setErrorMessage('Permission denied. You need admin rights.');

        } else if (error.response.status === 404) {
          setErrorMessage('Employee not found.');

        } else if (error.response.status === 405) {
          setErrorMessage('Method not allowed. Please contact support.');

        } else {
          setErrorMessage(`Server error: ${error.response.status}`);
        }

      } else if (error.request) {
        setErrorMessage('No response from server. Check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }

      // Clear error after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  }

  // Render action buttons
  function renderActions(employee) {
    return (
      <div className="table-actions">
        <button
          className="action-btn view-btn"
          onClick={() => navigate(`/admin-dashboard/emp/view/${employee.id}`)}
          title="View"
          disabled={loading}
        >
          <i className="bi bi-eye"></i>
        </button>
        <button
          className="action-btn activate-btn"
          onClick={() => handleActivate(employee.id)}
          title="Activate"
          disabled={loading}
        >
          <i className="bi bi-person-check"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="list-container">
      {/* Success message */}
      {successMessage && (
        <div className="floating-success">
          <i className="bi bi-check-circle"></i> {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="floating-error">
          <i className="bi bi-exclamation-circle"></i> {errorMessage}
        </div>
      )}

      <div className="list-header">
        <div className="header-content">
          <h2><i className="bi bi-person-dash-fill"></i> Inactive Employees</h2>
          <p>
            Showing {filteredEmployees.length} inactive {filteredEmployees.length === 1 ? 'employee' : 'employees'}
            {filteredEmployees.length === 0 && ' - All employees are active'}
          </p>
          <div className="header-stats">
            <div className="stat-card inactive">
              <i className="bi bi-person-x"></i>
              <div>
                <h3>{filteredEmployees.length}</h3>
                <p>Inactive Employees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="list-content">
        <table className="list-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Employee ID</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading inactive employees...</p>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="empty-state">
                    <i className="bi bi-person-check"></i>
                    <h3>No inactive employees found</h3>
                    <p>All employees are currently active</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={index % 2 === 0 ? 'even-row' : 'odd-row'}
                >
                  <td>
                    <div className="clickable-cell">
                      {employee.first_name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      {employee.last_name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      <span className="employee-id">{employee.employee_id || employee.username || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      <div className="contact-info">
                        {employee.contact_info || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      {employee.email || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      {employee.department && typeof employee.department === 'object'
                        ? employee.department.name
                        : employee.department_name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="clickable-cell">
                      {employee.designation && typeof employee.designation === 'object'
                        ? employee.designation.name
                        : employee.designation_name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    {/* Show only "Inactive" status */}
                    <span className="status-badge inactive">
                      <i className="bi bi-circle-fill"></i> Inactive
                    </span>
                  </td>
                  <td>
                    {renderActions(employee)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredEmployees.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </button>

            <div className="page-info">
              Page {page} of {totalPages}
            </div>

            <button
              className="pagination-btn"
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

export default InactiveEmpList;