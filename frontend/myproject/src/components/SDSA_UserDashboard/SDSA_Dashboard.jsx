import React from 'react'
import SDSA_Sidebar from './Sidebar/SDSA_Sidebar';
import './Sidebar/SDSA_Sidebar.css';

const SDSA_Dashboard = () => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* HR Manager Sidebar */}
      <SDSA_Sidebar />
      
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
                SDSA MASTER
              </div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                marginBottom: '15px',
               
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                SDSA Dashboard
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Welcome back! Manage your team efficiently with powerful SDSA tools.
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              minWidth: '130px',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ 
                fontSize: '2.8rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                SDSA
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                Master
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '25px',
            marginTop: '40px',
            position: 'relative',
            zIndex: 1
          }}>
            {[
              { 
                label: 'Total Employees', 
                value: '156', 
                description: 'Active staff members',
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 0.4)'
              },
              { 
                label: 'On Leave', 
                value: '8', 
                description: 'Today\'s leave count',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 0.4)'
              },
              { 
                label: 'New Hires', 
                value: '12', 
                description: 'This month',
                color: '#3b82f6',
                bgColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.4)'
              },
              { 
                label: 'Pending Requests', 
                value: '23', 
                description: 'Awaiting approval',
                color: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.4)'
              }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '16px',
                padding: '25px',
                backdropFilter: 'blur(15px)',
                border: `2px solid ${stat.borderColor}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px ${stat.borderColor}`;
                e.currentTarget.style.background = `rgba(255, 255, 255, 0.5)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
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
                    fontSize: '3.2rem', 
                    fontWeight: '800',
                    lineHeight: '1',
                    marginBottom: '8px',
                    color: stat.color,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    {stat.value}
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
        </div>
        
        {/* Search Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50px',
          padding: '15px 25px',
          marginBottom: '30px',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            color: '#92400e',
            fontSize: '1.2rem'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Type here to search..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#78350f',
              fontWeight: '500'
            }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              color: '#92400e',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>25°C</span>
              <span>☀️</span>
              <span>Sunny</span>
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '20px',
              color: '#1d4ed8',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              ENG
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '20px',
              color: '#92400e',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              02-02-2026
            </div>
          </div>
        </div>
        
        {/* Dashboard Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px'
        }}>
          {/* Left Column */}
          <div>
            {/* Recent Activities */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
              marginBottom: '30px',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ 
                fontSize: '1.7rem', 
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  width: '8px',
                  height: '35px',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '4px'
                }}></span>
                Recent Activities
              </h2>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {[
                  { 
                    activity: 'John Doe submitted leave request', 
                    time: '10 mins ago', 
                    type: 'leave',
                    color: '#f59e0b'
                  },
                  { 
                    activity: 'New employee onboarded: Sarah Smith', 
                    time: '1 hour ago', 
                    type: 'onboard',
                    color: '#3b82f6'
                  },
                  { 
                    activity: 'Performance review scheduled for Team A', 
                    time: '2 hours ago', 
                    type: 'review',
                    color: '#8b5cf6'
                  },
                  { 
                    activity: 'Salary processed for May 2024', 
                    time: '5 hours ago', 
                    type: 'salary',
                    color: '#10b981'
                  },
                  { 
                    activity: 'Training session completed: Leadership Skills', 
                    time: '1 day ago', 
                    type: 'training',
                    color: '#ec4899'
                  },
                  { 
                    activity: 'Policy update: Remote Work Guidelines', 
                    time: '2 days ago', 
                    type: 'policy',
                    color: '#6366f1'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    borderBottom: '2px solid rgba(251, 191, 36, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    transition: 'all 0.3s ease',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    background: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: `${item.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: item.color,
                      flexShrink: 0,
                      border: `2px solid ${item.color}40`
                    }}>
                      {item.type === 'leave' ? '📅' : 
                       item.type === 'onboard' ? '👤' : 
                       item.type === 'review' ? '⭐' : 
                       item.type === 'salary' ? '💰' : 
                       item.type === 'training' ? '🎓' : '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#78350f',
                        fontSize: '1.05rem',
                        marginBottom: '8px'
                      }}>
                        {item.activity}
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: item.color,
                          boxShadow: `0 0 8px ${item.color}`
                        }}></span>
                        {item.time}
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: `${item.color}20`,
                      color: item.color,
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: `1px solid ${item.color}40`
                    }}>
                      {item.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            {/* Department Overview */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
              marginBottom: '30px',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ 
                fontSize: '1.7rem', 
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  width: '8px',
                  height: '35px',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '4px'
                }}></span>
                Department Overview
              </h2>
              
              {[
                { department: 'IT Department', employees: 45, color: '#3b82f6', icon: '💻' },
                { department: 'Sales', employees: 32, color: '#10b981', icon: '📈' },
                { department: 'Marketing', employees: 28, color: '#f59e0b', icon: '🎯' },
                { department: 'Finance', employees: 22, color: '#ef4444', icon: '💰' },
                { department: 'Operations', employees: 40, color: '#8b5cf6', icon: '⚙️' },
                { department: 'Human Resources', employees: 15, color: '#ec4899', icon: '👥' }
              ].map((dept, index) => {
                const percentage = Math.round((dept.employees / 156) * 100);
                return (
                  <div key={index} style={{ marginBottom: '30px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '12px',
                          background: `${dept.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: dept.color,
                          border: `2px solid ${dept.color}40`
                        }}>
                          {dept.icon}
                        </div>
                        <span style={{ fontWeight: '600', color: '#78350f', fontSize: '1.1rem' }}>
                          {dept.department}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: '700', color: '#451a03', fontSize: '1.2rem' }}>
                          {dept.employees} employees
                        </span>
                        <span style={{ 
                          fontWeight: '700', 
                          color: dept.color,
                          fontSize: '1rem',
                          background: `${dept.color}20`,
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: `2px solid ${dept.color}40`
                        }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '14px',
                      background: 'rgba(251, 191, 36, 0.2)',
                      borderRadius: '7px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${dept.color} 0%, ${dept.color}cc 100%)`,
                        borderRadius: '7px',
                        transition: 'width 1.5s ease-in-out',
                        position: 'relative',
                        boxShadow: `0 0 20px ${dept.color}40`
                      }}>
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: '0',
                          width: '3px',
                          height: '100%',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div style={{
          marginTop: '40px',
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          textAlign: 'center',
          color: '#92400e',
          fontSize: '0.95rem',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            fontWeight: '700', 
            color: '#92400e',
            fontSize: '1.1rem',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span>HR Manager Dashboard</span>
            <span style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#f59e0b'
            }}></span>
            <span>02-02-2026</span>
          </div>
          <div style={{ 
            color: '#78350f',
            fontSize: '1rem'
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SDSA_Dashboard;