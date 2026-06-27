import React, { useState, useEffect } from 'react';
import HR_ManagerSidebar from '../HR_Manager/Sidebar/HR_ManagerSidebar.jsx';
import '../HR_Manager/Sidebar/HR_ManagerSidebar.css';
import api from '../../../../api.js';

const HR_ManagerDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalDesignations, setTotalDesignations] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Function to get user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('access');
    if (!token) return null;
    
    try {
      // Decode JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.user_id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user ID from token
        const userId = getUserIdFromToken();
        console.log('User ID from token:', userId);
        
        if (userId) {
          // Fetch current user data directly using the user ID
          const userResponse = await api.get(`/users/${userId}/`);
          const userData = userResponse.data;
          console.log('User data from /users/${userId}/:', userData);
          
          setUserInfo(userData);
          
          // Check for employee image
          if (userData.employee_image) {
            console.log('Employee image found:', userData.employee_image);
            const imageUrl = getFullImageUrl(userData.employee_image);
            console.log('Constructed image URL:', imageUrl);
            setProfileImage(imageUrl);
          } else {
            console.log('No employee image found in user data');
          }
        } else {
          console.log('Could not get user ID from token');
        }
        
        // Fetch total employees count
        const employeesResponse = await api.get('/users/');
        const employees = employeesResponse.data.filter(user => user.role === 'employee');
        setTotalEmployees(employees.length);
        
        // Fetch total departments
        const deptResponse = await api.get('/departments/');
        setTotalDepartments(deptResponse.data.length);
        
        // Fetch total designations
        const desigResponse = await api.get('/designations/');
        setTotalDesignations(desigResponse.data.length);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Helper function to construct full URL for images
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it starts with /media/, construct full URL
    if (imagePath.startsWith('/media/')) {
      return `http://localhost:8000${imagePath}`;
    }

    // If it's just a filename, assume it's in employees directory
    if (imagePath && !imagePath.includes('/')) {
      return `http://localhost:8000/media/employees/${imagePath}`;
    }

    // Default case
    return `http://localhost:8000/media/${imagePath}`;
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format user name for display
  const getDisplayName = () => {
    if (!userInfo) return 'User';
    
    if (userInfo.full_name) {
      return userInfo.full_name.split(' ')[0];
    }
    if (userInfo.first_name) {
      return userInfo.first_name;
    }
    if (userInfo.username) {
      return userInfo.username;
    }
    return 'HR Manager';
  };

  // Get current date
  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  // Format date for last login display
  const formatLastLogin = () => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Handle image load error
  const handleImageError = (e) => {
    console.error('Image failed to load:', profileImage);
    setImageError(true);
    e.target.style.display = 'none';
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* HR Manager Sidebar */}
      <HR_ManagerSidebar />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: '280px',
        padding: '30px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        minHeight: '100vh',
        overflowX: 'hidden',
        color: '#78350f'
      }}>
        {/* Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.9) 0%, rgba(251, 191, 36, 0.8) 100%)',
          borderRadius: '20px',
          padding: '35px',
          marginBottom: '30px',
          color: '#451a03',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ 
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#92400e',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  width: '30px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                Human Resource Dashboard
              </div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800', 
                marginBottom: '15px',
                color: '#451a03',
                lineHeight: '1.1',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                {loading ? 'Loading...' : `${getGreeting()}, ${getDisplayName()}!`}
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '25px',
                flexWrap: 'wrap'
              }}>
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: '#78350f',
                  maxWidth: '700px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Welcome back! Manage your team efficiently with powerful HR tools.
                </p>
      
              </div>
            </div>
            
            {/* Employee Image/Profile Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid white',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Show uploaded image if available and no error */}
                {profileImage && !imageError ? (
                  <img 
                    src={profileImage}
                    alt={getDisplayName()}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={handleImageError}
                  />
                ) : (
                  /* Fallback icon (shown if no image or image fails to load) */
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}>
                    <i className="bi bi-person-circle" style={{ fontSize: '3rem', color: 'white' }}></i>
                  </div>
                )}
              </div>
              
              {/* Image status indicator */}
              {profileImage && !imageError && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                 
                </div>
              )}
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '8px 16px',
                textAlign: 'center',
                border: '2px solid rgba(251, 191, 36, 0.4)',
                minWidth: '120px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700',
                  color: '#451a03',
                  textTransform: 'capitalize'
                }}>
                  {userInfo?.designation_name || 'Employee'}
                </div>
                {userInfo?.employee_id && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#78350f',
                    marginTop: '4px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px'
                  }}>
                    ID: {userInfo.employee_id}
                  </div>
                )}
                {userInfo?.username && !userInfo?.employee_id && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#78350f',
                    fontSize:'15px',
                    marginTop: '4px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px'
                  }}>
                    Emp ID: {userInfo.username}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '25px',
          marginBottom: '30px'
        }}>
          {[
            { 
              label: 'Total Employees', 
              value: totalEmployees, 
              description: 'Active staff members',
              color: '#10b981'
            },

          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background glow */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: `linear-gradient(90deg, ${stat.color}00 0%, ${stat.color} 50%, ${stat.color}00 100%)`,
                opacity: '0.6'
              }}></div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  fontSize: '2.8rem', 
                  fontWeight: '800',
                  lineHeight: '1',
                  marginBottom: '8px',
                  color: stat.color,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {loading ? '...' : stat.value}
                </div>
                <div style={{ 
                  fontSize: '1.1rem',
                  color: '#78350f',
                  fontWeight: '600'
                }}>
                  {stat.label}
                </div>
              </div>
              <div style={{ 
                fontSize: '0.9rem',
                color: '#92400e',
                marginTop: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: stat.color,
                  boxShadow: `0 0 10px ${stat.color}`
                }}></div>
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Dashboard Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '25px',
          marginTop: '10px'
        }}>

        </div>
      </div>
    </div>
  );
};

export default HR_ManagerDashboard;