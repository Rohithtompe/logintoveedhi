import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Director_Sidebar from "../../Director/Sidebar/Director_Sidebar.jsx";
import "../../Director/Sidebar/Director_Sidebar.css";
import api from "../../../../../api.js";

const WorkLinks = () => {
    const [workLinksData, setWorkLinksData] = useState({
        totalCount: 500312,
        percentageChange: 4.14,
        label: 'ENG'
    });

    const navigate = useNavigate();

    const handleRefresh = () => {
        setWorkLinksData({
            totalCount: 500312,
            percentageChange: 4.14,
            label: 'ENG'
        });
    };

    const handleCreateWorkLink = () => {
        alert('Create New Work Link functionality');
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
    };

    // Handler for navigating to work icon links page
    const handleMyWorkLinksClick = () => {
        navigate('/management/director/work-icons-list');
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: '#fef3c7'
        }}>
            {/* Sidebar */}
            <Director_Sidebar />

            {/* Main Content */}
            <div style={{
                flex: 1,
                marginLeft: '280px',
                padding: '30px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                minHeight: '100vh',
                color: '#78350f'
            }}>

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.9) 0%, rgba(251, 191, 36, 0.8) 100%)',
                    borderRadius: '20px',
                    padding: '35px',
                    marginBottom: '30px',
                    color: '#451a03',
                    boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '10px'
                    }}>
                        Director WorkLink Dashboard
                    </h1>
                    <p>Manage and track employee WorkLink programs efficiently.</p>
                </div>

                {/* Content Area */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingTop: '10px'
                }}>
                    {/* Card with click handler */}
                    <div 
                        onClick={handleMyWorkLinksClick}
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                            borderRadius: '20px',
                            padding: '40px',
                            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
                            border: '2px solid rgba(251, 191, 36, 0.3)',
                            width: '100%',
                            maxWidth: '500px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.25)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #fde68a 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)';
                        }}
                    >
                        {/* Animated border effect */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                            transition: 'left 0.5s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.left = '100%';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.left = '-100%';
                        }}
                        />
                        
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#92400e',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}>
                            My Work Links
                            <span style={{
                                fontSize: '1.2rem',
                                opacity: 0.8,
                                transition: 'transform 0.3s ease'
                            }}>
                                →
                            </span>
                        </h2>
                        
                        <p style={{
                            marginTop: '15px',
                            color: '#78350f',
                            opacity: 0.8,
                            fontSize: '0.95rem'
                        }}>
                            Click to view and manage all work icon links
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkLinks;