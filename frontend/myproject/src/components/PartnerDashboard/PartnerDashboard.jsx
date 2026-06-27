import React from 'react'
import PartnerSidebar from './sidebar/PartnerSidebar';
import './Sidebar/PartnerSidebar.css';

const PartnerDashboard = () => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#fef3c7'
    }}>
      {/* HR Manager Sidebar */}
      <PartnerSidebar />
      
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
                Partner Dashboard
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
                Partner Dashboard
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#78350f',
                marginBottom: '25px',
                maxWidth: '700px',
                lineHeight: '1.6'
              }}>
                Welcome back! Manage your team efficiently with powerful HR tools.
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
                Partner
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#92400e',
                marginTop: '5px',
                fontWeight: '600'
              }}>
                User
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

        

      </div>
    </div>
  )
}

export default PartnerDashboard;