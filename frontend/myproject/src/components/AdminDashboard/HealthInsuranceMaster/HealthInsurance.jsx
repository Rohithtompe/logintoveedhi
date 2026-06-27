import React from 'react';
import { Link } from 'react-router-dom';

const HealthInsurance = () => {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      <div style={{
        display: "flex",
        gap: "30px",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "20px 0",
      }}>

        {/* Add Health Insurance Card */}
        <Link 
          to="/admin-dashboard/health/add-health-insurance" 
          style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "360px",
            textDecoration: "none",
          }}
        >
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "35px 20px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{
              width: "90px",
              height: "90px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <i className="bi bi-plus-circle" style={{
                fontSize: "42px",
                color: "#0284c7",
              }}></i>
            </div>
            <h5 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              paddingTop: "10px",
            }}>Add Health Insurance</h5>
          </div>
        </Link>

        {/* My Health Insurance Card */}
        <Link 
          to="/admin-dashboard/health/insurance-list" 
          style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "360px",
            textDecoration: "none",
          }}
        >
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "35px 20px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{
              width: "90px",
              height: "90px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <i className="bi bi-file-earmark-text" style={{
                fontSize: "42px",
                color: "#0284c7",
              }}></i>
            </div>
            <h5 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              paddingTop: "10px",
            }}>My Health Insurance</h5>
          </div>
        </Link>

        {/* Health Insurance Team Card */}
        <Link 
          to="/admin-dashboard/health/insurance-team" 
          style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "360px",
            textDecoration: "none",
          }}
        >
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "35px 20px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{
              width: "90px",
              height: "90px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <i className="bi bi-people" style={{
                fontSize: "42px",
                color: "#0284c7",
              }}></i>
            </div>
            <h5 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              paddingTop: "10px",
            }}>Health Insurance Team</h5>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default HealthInsurance;