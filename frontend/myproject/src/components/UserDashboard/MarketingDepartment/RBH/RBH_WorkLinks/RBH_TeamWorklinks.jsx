import React, { useState } from 'react';
import "../Sidebar/RBH_Sidebar.css";

const RBH_TeamWorklinks = () => {
    // Mock data for team work links
    const [teamLinks, setTeamLinks] = useState([
        { 
            id: 1, 
            name: 'Marketing Campaign', 
            url: 'https://marketing.example.com', 
            category: 'MARKETING', 
            status: 'Active', 
            createdAt: '2024-01-15', 
            description: 'Marketing team collaboration platform',
            teamMembers: ['John Doe', 'Jane Smith', 'Bob Wilson'],
            teamLead: 'Alice Johnson'
        },
        { 
            id: 2, 
            name: 'Development Hub', 
            url: 'https://dev.example.com', 
            category: 'DEVELOPMENT', 
            status: 'Active', 
            createdAt: '2024-01-12', 
            description: 'Development team resources and tools',
            teamMembers: ['Mike Chen', 'Sarah Lee', 'Tom Harris'],
            teamLead: 'Robert Brown'
        },
        { 
            id: 3, 
            name: 'Sales Dashboard', 
            url: 'https://sales.example.com', 
            category: 'SALES', 
            status: 'Active', 
            createdAt: '2024-01-10', 
            description: 'Sales team performance metrics',
            teamMembers: ['Chris Taylor', 'Emma Davis', 'Alex Wong'],
            teamLead: 'Michael Scott'
        },
        { 
            id: 4, 
            name: 'HR Portal', 
            url: 'https://hr.example.com', 
            category: 'HR', 
            status: 'Active', 
            createdAt: '2024-01-08', 
            description: 'Human resources team portal',
            teamMembers: ['Patricia Clark', 'James Miller', 'Lisa White'],
            teamLead: 'Karen Wilson'
        },
        { 
            id: 5, 
            name: 'Operations Tracker', 
            url: 'https://ops.example.com', 
            category: 'OPERATIONS', 
            status: 'Inactive', 
            createdAt: '2024-01-05', 
            description: 'Operations team workflow management',
            teamMembers: ['David Moore', 'Sophia Taylor', 'Kevin Martin'],
            teamLead: 'Steven Adams'
        },
        { 
            id: 6, 
            name: 'Design Studio', 
            url: 'https://design.example.com', 
            category: 'DESIGN', 
            status: 'Active', 
            createdAt: '2024-01-03', 
            description: 'Design team collaboration space',
            teamMembers: ['Rachel Green', 'Monica Geller', 'Phoebe Buffay'],
            teamLead: 'Ross Geller'
        },
    ]);

    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);

    // Mock data for roles and users
    const roles = ['Admin', 'Team Lead', 'Member', 'Viewer', 'Contributor'];
    const users = [
        'John Doe', 'Jane Smith', 'Alice Johnson', 'Robert Brown', 
        'Mike Chen', 'Sarah Lee', 'Chris Taylor', 'Emma Davis'
    ];
    const categories = ['All', 'MARKETING', 'DEVELOPMENT', 'SALES', 'HR', 'OPERATIONS', 'DESIGN', 'SUPPORT'];

    const filteredLinks = teamLinks.filter(link => {
        const matchesCategory = filterCategory === 'All' || link.category === filterCategory;
        const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            link.teamLead.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleLinkClick = (link) => {
        setSelectedLink(link);
        setShowAccessModal(true);
    };

    const handleCloseModal = () => {
        setShowAccessModal(false);
        setSelectedLink(null);
    };

    const handleShowData = () => {
        alert(`Showing data for Role: ${selectedRole || 'Not selected'}, User: ${selectedUser || 'Not selected'}`);
    };

    const handleReset = () => {
        setSelectedRole('');
        setSelectedUser('');
        setFilterCategory('All');
        setSearchTerm('');
    };

    const handleAddTeamLink = () => {
        alert('Add New Team Work Link functionality');
    };

    const handleEdit = (id, e) => {
        e.stopPropagation();
        alert(`Edit team link with ID: ${id}`);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this team work link?')) {
            setTeamLinks(teamLinks.filter(link => link.id !== id));
        }
    };

    const handleToggleStatus = (id, e) => {
        e.stopPropagation();
        setTeamLinks(teamLinks.map(link => 
            link.id === id 
                ? { ...link, status: link.status === 'Active' ? 'Inactive' : 'Active' }
                : link
        ));
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: '#fffbeb'
        }}>
            {/* Main Content Area */}
            <div style={{
                flex: 1,
                padding: '30px',
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                minHeight: '100vh',
                color: '#78350f'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(252, 211, 77, 0.85) 100%)',
                    borderRadius: '20px',
                    padding: '35px',
                    marginBottom: '30px',
                    color: '#451a03',
                    boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
                    border: '2px solid #fbbf24',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '2.8rem',
                        fontWeight: '800',
                        marginBottom: '15px',
                        background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Work Link Team
                    </h1>
                    <p style={{ 
                        color: '#92400e', 
                        fontSize: '1.2rem',
                        maxWidth: '800px',
                        margin: '0 auto 25px',
                        lineHeight: '1.6'
                    }}>
                        Manage team work links, assign roles, and control access permissions across your organization
                    </p>
                    
                    <button
                        onClick={handleAddTeamLink}
                        style={{
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                        }}
                    >
                        + Add Team Link
                    </button>
                </div>

                {/* Team Controls Panel */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(252, 211, 77, 0.8) 100%)',
                    borderRadius: '18px',
                    padding: '30px',
                    marginBottom: '30px',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '25px',
                        marginBottom: '25px'
                    }}>
                        {/* Role Selection */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '10px',
                                color: '#92400e',
                                fontWeight: '600',
                                fontSize: '1.1rem'
                            }}>
                                Select Role
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 20px',
                                        borderRadius: '10px',
                                        border: '2px solid #f59e0b',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        color: '#78350f',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="" style={{ color: '#a1a1aa' }}>-- Select Role --</option>
                                    {roles.map(role => (
                                        <option key={role} value={role} style={{ color: '#78350f' }}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                <span style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#f59e0b',
                                    pointerEvents: 'none'
                                }}>
                                    ▼
                                </span>
                            </div>
                        </div>

                        {/* User Selection */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '10px',
                                color: '#92400e',
                                fontWeight: '600',
                                fontSize: '1.1rem'
                            }}>
                                Select User
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 20px',
                                        borderRadius: '10px',
                                        border: '2px solid #f59e0b',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        color: '#78350f',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="" style={{ color: '#a1a1aa' }}>-- Select User --</option>
                                    {users.map(user => (
                                        <option key={user} value={user} style={{ color: '#78350f' }}>
                                            {user}
                                        </option>
                                    ))}
                                </select>
                                <span style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#f59e0b',
                                    pointerEvents: 'none'
                                }}>
                                    ▼
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={handleShowData}
                            style={{
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                minWidth: '180px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                            }}
                        >
                            Show Data
                        </button>
                        
                        <button
                            onClick={handleReset}
                            style={{
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                                minWidth: '180px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    flexWrap: 'wrap',
                    gap: '15px',
                    background: 'rgba(254, 243, 199, 0.7)',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '1px solid #fbbf24'
                }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setFilterCategory(category)}
                                style={{
                                    padding: '10px 20px',
                                    background: filterCategory === category 
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                                        : 'rgba(251, 191, 36, 0.2)',
                                    color: filterCategory === category ? 'white' : '#92400e',
                                    border: `1px solid ${filterCategory === category ? '#d97706' : '#fbbf24'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search team links..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '12px 20px 12px 45px',
                                width: '300px',
                                borderRadius: '10px',
                                border: '1px solid #fbbf24',
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: '#92400e',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#f59e0b',
                            fontSize: '1.2rem'
                        }}>
                            🔍
                        </span>
                    </div>
                </div>

                {/* Team Links Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '25px',
                    marginBottom: '40px'
                }}>
                    {filteredLinks.map(link => (
                        <div
                            key={link.id}
                            onClick={() => handleLinkClick(link)}
                            style={{
                                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(252, 211, 77, 0.8) 100%)',
                                borderRadius: '18px',
                                padding: '25px',
                                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)',
                                border: '1px solid #fbbf24',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.15)';
                            }}
                        >
                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                padding: '5px 15px',
                                background: link.status === 'Active' 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {link.status}
                            </div>

                            {/* Category Badge */}
                            <div style={{
                                display: 'inline-block',
                                padding: '5px 15px',
                                background: 'rgba(251, 191, 36, 0.2)',
                                color: '#92400e',
                                borderRadius: '15px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                marginBottom: '15px',
                                border: '1px solid #fbbf24'
                            }}>
                                {link.category}
                            </div>

                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '10px',
                                color: '#451a03'
                            }}>
                                {link.name}
                            </h3>

                            <p style={{
                                color: '#92400e',
                                marginBottom: '20px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                {link.description}
                            </p>

                            {/* Team Info */}
                            <div style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                padding: '15px',
                                borderRadius: '10px',
                                marginBottom: '15px',
                                border: '1px solid #fbbf24'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    marginBottom: '10px'
                                }}>
                                    <div>
                                        <strong style={{ color: '#92400e' }}>Team Lead:</strong>
                                        <div style={{ color: '#d97706', marginTop: '5px' }}>
                                            {link.teamLead}
                                        </div>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#92400e' }}>Members:</strong>
                                        <div style={{ color: '#d97706', marginTop: '5px' }}>
                                            {link.teamMembers.length}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem',
                                    color: '#b45309',
                                    fontStyle: 'italic'
                                }}>
                                    {link.teamMembers.slice(0, 3).join(', ')}
                                    {link.teamMembers.length > 3 ? '...' : ''}
                                </div>
                            </div>

                            <div style={{
                                color: '#d97706',
                                marginBottom: '20px',
                                fontSize: '0.9rem',
                                wordBreak: 'break-all'
                            }}>
                                <strong>URL: </strong>
                                <span style={{ color: '#ea580c' }}>
                                    {link.url}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '1px solid rgba(251, 191, 36, 0.5)'
                            }}>
                                <span style={{
                                    color: '#92400e',
                                    fontSize: '0.85rem'
                                }}>
                                    Created: {link.createdAt}
                                </span>
                                
                                <div style={{ display: 'flex', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleEdit(link.id, e)}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            color: '#92400e',
                                            border: '1px solid #f59e0b',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleToggleStatus(link.id, e)}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#1e40af',
                                            border: '1px solid #3b82f6',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {link.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(link.id, e)}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#dc2626',
                                            border: '1px solid #ef4444',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team Stats Summary */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(252, 211, 77, 0.8) 100%)',
                    borderRadius: '18px',
                    padding: '25px',
                    marginTop: '30px',
                    border: '1px solid #fbbf24',
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#92400e' }}>
                            {teamLinks.length}
                        </div>
                        <div style={{ color: '#d97706', fontWeight: '600' }}>Team Links</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#92400e' }}>
                            {teamLinks.filter(l => l.status === 'Active').length}
                        </div>
                        <div style={{ color: '#d97706', fontWeight: '600' }}>Active Teams</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#92400e' }}>
                            {roles.length}
                        </div>
                        <div style={{ color: '#d97706', fontWeight: '600' }}>Roles</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#92400e' }}>
                            {users.length}
                        </div>
                        <div style={{ color: '#d97706', fontWeight: '600' }}>Users</div>
                    </div>
                </div>

                {/* Access Denied Modal (Reusing from MyWorklinks) */}
                {showAccessModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                            borderRadius: '20px',
                            padding: '40px',
                            maxWidth: '500px',
                            width: '90%',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            border: '3px solid #f59e0b',
                            textAlign: 'center',
                            animation: 'slideUp 0.3s ease'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto 30px',
                                fontSize: '2.5rem'
                            }}>
                                🔒
                            </div>

                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#92400e',
                                marginBottom: '15px'
                            }}>
                                Team Access Required
                            </h2>

                            <div style={{
                                color: '#78350f',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                marginBottom: '30px'
                            }}>
                                Team access permission required for this link. 
                                Please contact your team lead or administrator.
                            </div>

                            {selectedLink && (
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    marginBottom: '30px',
                                    border: '1px solid #fbbf24'
                                }}>
                                    <div style={{ color: '#92400e', fontWeight: '600', marginBottom: '5px' }}>
                                        {selectedLink.name}
                                    </div>
                                    <div style={{ color: '#d97706', fontSize: '0.9rem' }}>
                                        Team Lead: {selectedLink.teamLead}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '12px 35px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Add CSS animations */}
                <style jsx="true">{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    select:focus {
                        border-color: #d97706;
                        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default RBH_TeamWorklinks;