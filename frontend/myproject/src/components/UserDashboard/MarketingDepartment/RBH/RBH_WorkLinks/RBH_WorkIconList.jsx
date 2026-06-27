import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RBH_Sidebar from "../../RBH/Sidebar/RBH_Sidebar.jsx";
import "../../RBH/Sidebar/RBH_Sidebar.css";
import api from '../../../../../api.js';

const RBH_WorkIconList = () => {
    const navigate = useNavigate();
    const [workIcons, setWorkIcons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);

    // Fetch current user info and their work icon permissions
    useEffect(() => {
        const fetchUserAndPermissions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Use the UserPayoutIconsView endpoint which returns current user info
                // This endpoint already exists in your views
                const userResponse = await api.get('/user-payout-icons/');
                const userData = userResponse.data;
                
                console.log('User data:', userData); // Debug log
                
                setUserInfo(userData.user);
                
                // Get work icon IDs from the response
                const workIconIds = userData.work_icon_ids || [];
                
                console.log('Work icon IDs:', workIconIds); // Debug log
                
                // Check if user has any work icon permissions
                setHasPermission(workIconIds.length > 0);
                
                // If user has permissions, fetch the work icons they're allowed to see
                if (workIconIds.length > 0) {
                    try {
                        // Fetch all work icons
                        const workIconsResponse = await api.get('/work-icon/');
                        const allWorkIcons = workIconsResponse.data;
                        
                        console.log('All work icons:', allWorkIcons); // Debug log
                        
                        // Filter to only include icons the user has permission for
                        const permittedIcons = allWorkIcons.filter(icon => 
                            workIconIds.includes(icon.id)
                        );
                        
                        console.log('Permitted icons:', permittedIcons); // Debug log
                        setWorkIcons(permittedIcons);
                    } catch (iconError) {
                        console.error('Error fetching work icons:', iconError);
                        setWorkIcons([]);
                    }
                } else {
                    // No permissions, set empty array
                    setWorkIcons([]);
                }
                
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load your work icons. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserAndPermissions();
    }, []);

    // If there's an error
    if (error) {
        return (
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: '#fef3c7'
            }}>
                <RBH_Sidebar />
                <div style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '30px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    minHeight: '100vh',
                    color: '#78350f',
                    overflowX: 'hidden'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '15px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)'
                    }}>
                        <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>Error</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#f59e0b',
                                color: '#78350f',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If user has no permissions, show waiting for approval message
    if (!loading && !hasPermission) {
        return (
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: '#fef3c7'
            }}>
                <RBH_Sidebar />
                <div style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '30px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    minHeight: '100vh',
                    color: '#78350f',
                    overflowX: 'hidden'
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
                        <div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                marginBottom: '10px'
                            }}>
                                CBO Work Icon Access
                            </h1>
                        </div>
                    </div>

                    {/* No Permission Message */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '15px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '20px',
                            color: '#f59e0b'
                        }}>
                            ⏳
                        </div>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: '600',
                            color: '#78350f',
                            marginBottom: '15px'
                        }}>
                            Waiting for Admin Approval
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#92400e',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}>
                            You don't have access to any work icons yet. 
                            Please contact your administrator to grant you permission to view work icons.
                        </p>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '50px',
                        paddingTop: '20px',
                        borderTop: '1px solid #f59e0b',
                        textAlign: 'center',
                        color: '#92400e',
                        fontSize: '14px'
                    }}>
                        © {new Date().getFullYear()}, VEEDHI All Rights Reserved.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: '#fef3c7'
        }}>
            {/* Fixed Sidebar */}
            <RBH_Sidebar />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                marginLeft: '280px',
                padding: '30px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                minHeight: '100vh',
                color: '#78350f',
                overflowX: 'hidden'
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
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',  
                            marginBottom: '10px'
                        }}>
                            Director My Work Icons
                        </h1>
                        {userInfo && (
                            <p style={{ fontSize: '1.1rem' }}>
                                Welcome, {userInfo.full_name || userInfo.username || 'User'}! 
                                You have access to {workIcons.length} work icon(s).
                            </p>
                        )}
                    </div>
                </div>

                {/* Work Icons Section */}
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 6px rgba(120, 53, 15, 0.1)'
                }}>
                    <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#78350f',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Work Icons Access</span>
                        {workIcons.length > 0 && (
                            <span style={{
                                fontSize: '1rem',
                                backgroundColor: '#f59e0b',
                                color: '#78350f',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontWeight: '500'
                            }}>
                                Total: {workIcons.length}
                            </span>
                        )}
                    </h2>

                    {/* Work Icons Table */}
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #f3f3f3',
                                borderTop: '3px solid #f59e0b',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 15px'
                            }}></div>
                            <p>Loading your work icons...</p>
                        </div>
                    ) : workIcons.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>
                            <p>No work icons have been assigned to you yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'left'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#78350f',
                                        color: 'white'
                                    }}>
                                        <th style={{ padding: '15px' }}>#</th>
                                        <th style={{ padding: '15px' }}>ICON NAME</th>
                                        <th style={{ padding: '15px' }}>USERNAME</th>
                                        <th style={{ padding: '15px' }}>PASSWORD</th>
                                        <th style={{ padding: '15px' }}>DESCRIPTION</th>
                                        <th style={{ padding: '15px' }}>IMAGE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workIcons.map((icon, index) => (
                                        <tr key={icon.id} style={{
                                            borderBottom: '1px solid #fde68a',
                                            backgroundColor: index % 2 === 0 ? 'rgba(254, 243, 199, 0.5)' : 'white'
                                        }}>
                                            <td style={{ padding: '15px' }}>{index + 1}</td>
                                            <td style={{ padding: '15px', fontWeight: '500' }}>
                                                <div>{icon.icon_name}</div>
                                                <div style={{ fontSize: '12px', color: '#92400e' }}>ID: {icon.id}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    backgroundColor: '#17a2b8',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}>
                                                    {icon.username}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    backgroundColor: '#ffc107',
                                                    color: '#212529',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}>
                                                    {icon.password || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                {icon.icon_description || (
                                                    <span style={{ fontStyle: 'italic', color: '#92400e' }}>No description</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px' }}>
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
                                                    />
                                                ) : (
                                                    <span style={{
                                                        backgroundColor: '#6c757d',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}>
                                                        No Image
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Results Count */}
                    {workIcons.length > 0 && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            textAlign: 'right',
                            color: '#92400e'
                        }}>
                            Showing {workIcons.length} work icon(s) you have access to
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '50px',
                    paddingTop: '20px',
                    borderTop: '1px solid #f59e0b',
                    textAlign: 'center',
                    color: '#92400e',
                    fontSize: '14px'
                }}>
                    © {new Date().getFullYear()}, VEEDHI All Rights Reserved.
                </div>

                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default RBH_WorkIconList;