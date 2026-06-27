import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api';

const Partner_PayoutPermission = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get('userId');
    
    const [payouts, setPayouts] = useState([]);
    const [payoutTypes, setPayoutTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [existingPermissions, setExistingPermissions] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch partner information
    useEffect(() => {
        const fetchPartnerInfo = async () => {
            if (!userId) return;
            
            try {
                const response = await api.get(`partner-users/${userId}/`);
                setPartnerInfo(response.data);
                
                // Get existing payout permissions from partner
                if (response.data.payout_icons) {
                    let payoutIcons = response.data.payout_icons;
                    
                    if (typeof payoutIcons === 'string') {
                        try {
                            payoutIcons = JSON.parse(payoutIcons);
                        } catch (e) {
                            console.warn('Could not parse payout_icons as JSON:', e);
                            payoutIcons = [];
                        }
                    }
                    
                    setExistingPermissions(payoutIcons || []);
                }
            } catch (error) {
                console.error('Error fetching partner info:', error);
            }
        };
        
        fetchPartnerInfo();
    }, [userId]);

    // Fetch payout data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch all payouts from payout table
                const payoutsResponse = await api.get('payout/');
                const payoutsData = payoutsResponse.data;
                setPayouts(payoutsData);
                
                // Fetch all payout types
                const typesResponse = await api.get('payout-type/');
                const typesData = typesResponse.data;
                setPayoutTypes(typesData);
                
                // Extract unique payout_name_id values from payouts
                const uniquePayoutIds = [...new Set(payoutsData.map(p => p.payout_name))];
                
                // Map IDs to payout type names and check existing permissions
                const payoutPermissions = uniquePayoutIds.map(payoutId => {
                    // Find the payout type that matches this ID
                    const payoutType = typesData.find(type => type.id == payoutId);
                    
                    // Check if this payout type is already in partner's permissions
                    const isChecked = Array.isArray(existingPermissions) 
                        ? existingPermissions.some(perm => 
                            perm == payoutId || 
                            String(perm) == String(payoutId) ||
                            perm == String(payoutId) ||
                            String(perm) == payoutId
                          )
                        : false;
                    
                    return {
                        id: payoutId,
                        name: payoutType ? payoutType.payout_name : `Payout Type-${payoutId}`,
                        checked: isChecked
                    };
                }).sort((a, b) => a.name.localeCompare(b.name));
                
                setPermissions(payoutPermissions);
                
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId, existingPermissions]);

    // Handle checkbox change
    const handleCheckboxChange = (payoutTypeId) => {
        setPermissions(prev => 
            prev.map(perm => 
                perm.id === payoutTypeId 
                    ? { ...perm, checked: !perm.checked }
                    : perm
            )
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        const allChecked = permissions.every(perm => perm.checked);
        setPermissions(prev => 
            prev.map(perm => ({
                ...perm,
                checked: !allChecked
            }))
        );
    };

    // Save permissions to partner
    const handleSave = async () => {
        if (!userId) return;
        
        try {
            setSaving(true);
            
            // Get selected payout type IDs
            const selectedPermissions = permissions
                .filter(perm => perm.checked)
                .map(perm => parseInt(perm.id));
            
            console.log('Saving payout permissions for partner:', userId);
            console.log('Selected permissions:', selectedPermissions);
            
            // Use PATCH request for partner user
            await api.patch(`partner-users/${userId}/`, {
                payout_icons: selectedPermissions
            });
            
            // Update existing permissions in state
            setExistingPermissions(selectedPermissions);
            
            // Show success message
            setSuccessMessage('✓ Payout permissions saved successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (error) {
            console.error('Error saving partner payout permissions:', error);
            
            let errorMsg = 'Failed to save permissions. ';
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errors = [];
                    for (const key in error.response.data) {
                        if (Array.isArray(error.response.data[key])) {
                            errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                        } else {
                            errors.push(`${key}: ${error.response.data[key]}`);
                        }
                    }
                    if (errors.length > 0) {
                        errorMsg += 'Validation errors: ' + errors.join('; ');
                    }
                } else {
                    errorMsg += error.response.data;
                }
            } else if (error.message) {
                errorMsg += error.message;
            }
            
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    // Go back to partner list
    const handleCancel = () => {
        navigate(-1);
    };

    // Helper function to get partner display name
    const getPartnerDisplayName = () => {
        if (!partnerInfo) return 'Loading...';
        
        let displayName = '';
        if (partnerInfo.first_name && partnerInfo.last_name) {
            displayName = `${partnerInfo.first_name} ${partnerInfo.last_name}`;
        } else if (partnerInfo.first_name) {
            displayName = partnerInfo.first_name;
        } else if (partnerInfo.alias_name) {
            displayName = partnerInfo.alias_name;
        } else if (partnerInfo.email_id) {
            displayName = partnerInfo.email_id;
        } else {
            displayName = `Partner ${partnerInfo.id}`;
        }
        
        return displayName;
    };

    if (!userId) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>No Partner Selected</h2>
                <p>Please select a partner from the active partners list.</p>
                <button 
                    onClick={() => navigate('/admin-dashboard/partner/active')}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Active Partners
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '15px',
                borderBottom: '1px solid #ddd'
            }}>
                <div>
                    <h1 style={{ 
                        color: '#6f42c1', 
                        marginBottom: '5px',
                        fontSize: '24px'
                    }}>
                        Partner Payout Permission
                    </h1>
                    {partnerInfo && (
                        <p style={{ color: '#6c757d', margin: 0 }}>
                            Partner: {getPartnerDisplayName()} 
                            (ID: {partnerInfo.id})
                        </p>
                    )}
                </div>
                <button 
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: saving ? 0.5 : 1
                    }}
                >
                    Cancel
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div style={{
                    padding: '10px 15px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
                    {successMessage}
                </div>
            )}

            {/* Select All Button */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
            }}>
                <div>
                    <span style={{ fontWeight: '500', marginRight: '10px' }}>
                        Total: {permissions.length} payout types
                    </span>
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        Selected: {permissions.filter(p => p.checked).length}
                    </span>
                </div>
                <button 
                    onClick={handleSelectAll}
                    disabled={permissions.length === 0 || saving}
                    style={{
                        padding: '5px 15px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: (permissions.length === 0 || saving) ? 0.5 : 1
                    }}
                >
                    {permissions.every(p => p.checked) ? 'Deselect All' : 'Select All'}
                </button>
            </div>

            {/* Payout Types Table */}
            <div style={{ 
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                overflow: 'hidden'
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#343a40',
                    color: 'white',
                    padding: '15px',
                    fontWeight: 'bold'
                }}>
                    <div style={{ flex: 1 }}>PAYOUT TYPE</div>
                    <div style={{ width: '150px', textAlign: 'center' }}>PERMISSION</div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #6f42c1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 15px'
                        }}></div>
                        <p>Loading payout types...</p>
                    </div>
                ) : permissions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                        <p>No payout types found in the payout list</p>
                        <button 
                            onClick={() => navigate('/admin-dashboard/payout/payout')}
                            style={{
                                marginTop: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Payout Management
                        </button>
                    </div>
                ) : (
                    /* Payout Types List */
                    <div>
                        {permissions.map(payoutType => {
                            // Count how many times this payout type is used
                            const usageCount = payouts.filter(p => p.payout_name == payoutType.id).length;
                            
                            return (
                                <div 
                                    key={payoutType.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px',
                                        borderBottom: '1px solid #dee2e6',
                                        backgroundColor: payoutType.checked ? '#f5f0ff' : 'white',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '16px', marginBottom: '2px' }}>
                                            {payoutType.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                            ID: {payoutType.id} • Used in {usageCount} payout(s)
                                        </div>
                                    </div>
                                    <div style={{ width: '150px', textAlign: 'center' }}>
                                        <label style={{ 
                                            display: 'inline-block',
                                            position: 'relative',
                                            cursor: saving ? 'not-allowed' : 'pointer'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={payoutType.checked}
                                                onChange={() => handleCheckboxChange(payoutType.id)}
                                                disabled={saving}
                                                style={{
                                                    position: 'absolute',
                                                    opacity: 0,
                                                    cursor: saving ? 'not-allowed' : 'pointer',
                                                    height: 0,
                                                    width: 0
                                                }}
                                            />
                                            <span style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: payoutType.checked ? '#6f42c1' : 'white',
                                                border: '2px solid #ddd',
                                                borderRadius: '4px',
                                                transition: 'all 0.3s',
                                                opacity: saving ? 0.5 : 1
                                            }}>
                                                {payoutType.checked && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        left: '7px',
                                                        top: '2px',
                                                        width: '6px',
                                                        height: '12px',
                                                        border: 'solid white',
                                                        borderWidth: '0 2px 2px 0',
                                                        transform: 'rotate(45deg)'
                                                    }}></span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div style={{ 
                marginTop: '30px', 
                textAlign: 'right',
                paddingTop: '20px',
                borderTop: '1px solid #ddd'
            }}>
                <button 
                    onClick={handleSave}
                    disabled={saving || permissions.length === 0}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: (saving || permissions.length === 0) ? 0.5 : 1
                    }}
                >
                    {saving ? 'Saving...' : 'Save Permissions'}
                </button>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '50px',
                paddingTop: '20px',
                borderTop: '1px solid #ddd',
                textAlign: 'center',
                color: '#6c757d',
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
    );
};

export default Partner_PayoutPermission;