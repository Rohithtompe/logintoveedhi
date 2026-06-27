import React from 'react'
import { useNavigate } from 'react-router-dom'
import HR_ManagerSidebar from "./Sidebar/HR_ManagerSidebar.jsx";
// Remove this line if Manager_Sidebar.jsx already imports the CSS
import "./Sidebar/HR_ManagerSidebar.css";
import { 
  FaVideo, 
  FaUserCircle, 
  FaChalkboardTeacher, 
  FaListAlt,
  FaPlusCircle,
  FaShieldAlt,
  FaGift,
  FaNewspaper,
  FaImages,
  FaChartLine,
  FaCertificate,
  FaUsers,
  FaCalendarCheck,
  FaBookOpen,
  FaClipboardCheck,
  FaFileContract,
  FaChartBar
} from 'react-icons/fa';

const HR_Training = () => {
  const navigate = useNavigate();

  // Navigation handler for modules
  const handleModuleClick = (moduleTitle) => {
    // Convert title to route-friendly format
    switch(moduleTitle) {
      case 'Type of Loan Video':
        navigate('/hr/manager/loan-video-list');  // Updated path
        break;
      case 'Profile':
        navigate('/hr/manager/profile-list');
        break;
      case 'Seminars':
        navigate('/hr/manager/seminars-list');
        break;
      case 'Policy':
        navigate('/hr/manager/policy-list');
        break;
      case 'offers':
        navigate('/hr/manager/offers-list');
        break;
      case 'News':
        navigate('/hr/manager/news-list');
        break;
      case 'Policy Images':
        navigate('/hr/manager/policy-images-list');
        break;
      default:
        navigate('/hr/manager/training');
    }
  };

  // Training Modules Data based on your structure
  const trainingModules = [
    {
      id: 1,
      title: 'Type of Loan Video',
      icon: <FaVideo />,
      color: '#d97706',
    },
    {
      id: 2,
      title: 'Profile',
      icon: <FaUserCircle />,
      color: '#f59e0b',
    },
    {
      id: 3,
      title: 'Seminars',
      icon: <FaChalkboardTeacher />,
      color: '#fbbf24',
    },
    {
      id: 4,
      title: 'Policy',
      icon: <FaBookOpen />,
      color: '#92400e',
    },
    {
      id: 5,
      title: 'offers',
      icon: <FaShieldAlt />,
      color: '#b45309',
    },
    {
      id: 6,
      title: 'News',
      icon: <FaGift />,
      color: '#78350f',
    },
    {
      id: 7,
      title: 'Policy Images',
      icon: <FaNewspaper />,
      color: '#d97706',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* Manager Sidebar */}
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

        {/* Training Modules Grid - Based on your structure */}
        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            padding: '0 10px'
          }}>
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#78350f',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '2px'
                }}></span>
                Training Management Modules
              </h2>
              <p style={{
                color: '#92400e',
                fontSize: '1.1rem'
              }}>
                Access all training management features below
              </p>
            </div>
          </div>

          {/* Modules Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            {trainingModules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => handleModuleClick(module.title)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.2) 100%)',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(245, 158, 11, 0.25)',
                    borderColor: 'rgba(251, 191, 36, 0.6)'
                  }
                }}
              >
                {/* Background accent */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '80px',
                  height: '80px',
                  background: `${module.color}15`,
                  borderRadius: '0 0 0 100%'
                }}></div>

                {/* Module Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '25px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${module.color}20 0%, ${module.color}40 100%)`,
                    width: '70px',
                    height: '70px',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    color: module.color,
                    border: `2px solid ${module.color}30`
                  }}>
                    {module.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#78350f',
                      marginBottom: '5px'
                    }}>
                      {module.title}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#92400e',
                      opacity: 0.8
                    }}>
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Module Actions */}
                <div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#92400e',
                    fontWeight: '600',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                  </div>
                </div>

                {/* Quick Stats for Module */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '25px',
                  paddingTop: '25px',
                  borderTop: '2px solid rgba(251, 191, 36, 0.2)'
                }}>
                  <div style={{
                    textAlign: 'center'
                  }}>
                  </div>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: module.color,
                      marginBottom: '5px'
                    }}>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: module.color,
                    }}>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default HR_Training;