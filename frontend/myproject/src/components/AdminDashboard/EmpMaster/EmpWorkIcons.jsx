import React from 'react';
import { Link } from 'react-router-dom';
import './styles/EmpWorkIcons.css';

function EmpWorkIcons() {
  const rowStyle = {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  };

  const cardStyle = {
    flex: 1,
    minWidth: "280px",
    maxWidth: "360px",
    textDecoration: "none",
  };

  const bodyStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px 20px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  };

  const circleStyle = {
    width: "90px",
    height: "90px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#e0f2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const iconStyle = {
    fontSize: "42px",
    color: "#0284c7",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#0f172a",
  };
  return (
    <>
    
    <div className="container-xxl">
      <div style={rowStyle}>

        <Link to="add" style={cardStyle}>
          <div style={bodyStyle}>
            <div style={circleStyle}>
              <i className="bi bi-briefcase" style={iconStyle}></i>
            </div>
            <h5 style={titleStyle}>Add Icons</h5>
          </div>
        </Link>

        <Link to="team" style={cardStyle}>
          <div style={bodyStyle}>
            <div style={circleStyle}>
              <i className="bi bi-people" style={iconStyle}></i>
            </div>
            <h5 style={titleStyle}>Team Links</h5>
          </div>
        </Link>

      </div>
    </div>

    </>
  );
}

export default EmpWorkIcons;

