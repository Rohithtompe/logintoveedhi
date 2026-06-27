import React, { useState, useEffect, useRef } from "react";
import api from "../../../../api.js";
import HR_ManagerSidebar from "../HR_Manager/Sidebar/HR_ManagerSidebar.jsx";
import "../HR_Manager/Sidebar/HR_ManagerSidebar.css";

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [newOffer, setNewOffer] = useState({
        name: "",
        image: null,
    });
    const [editingId, setEditingId] = useState(null);
    const [editingOffer, setEditingOffer] = useState({
        name: "",
        image: null,
        imagePreview: "",
    });
    const [fileName, setFileName] = useState("No file chosen");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    // Load offers from API on component mount
    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/offers/");

            // Convert boolean status to display strings
            const offersWithDisplayStatus = response.data.map(item => ({
                ...item,
                displayStatus: item.status ? "Active" : "Inactive"
            }));

            setOffers(offersWithDisplayStatus);
            setError("");
        } catch (err) {
            setError("Failed to fetch offers. Please try again.");
            console.error("Error fetching offers:", err);
        } finally {
            setLoading(false);
        }
    };

    // Clear messages after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError("");
                setSuccess("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
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
                overflowX: 'hidden'
            }}>


                {/* Display Messages */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid #ef4444',
                        color: '#b91c1c',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '25px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '500'
                    }}>
                        <span>⚠️ {error}</span>
                        <button
                            onClick={() => setError("")}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#b91c1c',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {success && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '2px solid #f59e0b',
                        color: '#92400e',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '25px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '500'
                    }}>
                        <span>✅ {success}</span>
                        <button
                            onClick={() => setSuccess("")}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#92400e',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}



                <hr style={{
                    border: '3px solid #fbbf24',
                    opacity: 0.3,
                    margin: '30px 0',
                    borderRadius: '3px'
                }} />

                {/* Offer List Section */}
                <div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#92400e',
                        marginBottom: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{
                            background: '#f59e0b',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>📋</span>
                        Offer List
                    </h3>

                    {loading && offers.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fffbeb',
                            borderRadius: '24px',
                            border: '3px solid #fde68a'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto 20px',
                                border: '5px solid #fde68a',
                                borderTopColor: '#f59e0b',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <style>
                                {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                            </style>
                            <p style={{ color: '#92400e', fontSize: '1.2rem', fontWeight: '500' }}>
                                Loading offers...
                            </p>
                        </div>
                    ) : offers.length === 0 ? (
                        <div style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            border: '3px dashed #fbbf24',
                            color: '#92400e',
                            borderRadius: '24px',
                            padding: '50px 20px',
                            textAlign: 'center',
                            fontSize: '1.2rem'
                        }}>
                            🎯 No offers found. Add your first offer above!
                        </div>
                    ) : (
                        <div style={{
                            background: '#fffbeb',
                            borderRadius: '24px',
                            border: '3px solid #fde68a',
                            overflow: 'hidden'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                        color: 'white'
                                    }}>
                                        <th style={{
                                            width: "25%",
                                            padding: '18px 20px',
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>OFFER NAME</th>
                                        <th style={{
                                            width: "25%",
                                            padding: '18px 20px',
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>IMAGE</th>
                                        <th style={{
                                            width: "20%",
                                            padding: '18px 20px',
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>STATUS</th>
                         
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map((offer, index) => (
                                        <tr
                                            key={offer.id}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? 'white' : '#fffbeb',
                                                borderBottom: '2px solid #fde68a',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fffbeb'}
                                        >
                                            <td style={{ padding: '20px' }}>
                                                {editingId === offer.id ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editingOffer.name}
                                                        onChange={handleEditInputChange}
                                                        style={{
                                                            width: "100%",
                                                            border: '3px solid #f59e0b',
                                                            borderRadius: '12px',
                                                            padding: '10px 14px',
                                                            fontSize: '0.95rem'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#92400e',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {offer.name}
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '20px' }}>
                                                {editingId === offer.id ? (
                                                    <div>
                                                        {editingOffer.imagePreview && (
                                                            <div style={{
                                                                marginBottom: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px'
                                                            }}>
                                                                <div style={{
                                                                    width: '70px',
                                                                    height: '70px',
                                                                    borderRadius: '12px',
                                                                    border: '3px solid #fbbf24',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <img
                                                                        src={editingOffer.imagePreview}
                                                                        alt="Preview"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover"
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span style={{ color: '#92400e', fontSize: '0.9rem' }}>
                                                                    Current Image
                                                                </span>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            onChange={handleEditImageChange}
                                                            accept="image/*"
                                                            ref={editFileInputRef}
                                                            style={{
                                                                border: '3px solid #fde68a',
                                                                borderRadius: '12px',
                                                                padding: '8px 12px',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        />
                                                        <small style={{ color: '#92400e', marginTop: '8px', display: 'block' }}>
                                                            Leave empty to keep current image
                                                        </small>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '90px',
                                                        height: '90px',
                                                        borderRadius: '16px',
                                                        border: '3px solid #fbbf24',
                                                        overflow: 'hidden',
                                                        background: '#fef3c7',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {offer.image ? (
                                                            <img
                                                                src={offer.image}
                                                                alt={offer.name}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover"
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>📷 No Image</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '20px' }}>
                                                <button
                                                   
                                                    disabled={loading || editingId === offer.id}
                                                    style={{
                                                        background: offer.displayStatus === "Active"
                                                            ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                                                            : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',

                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '40px',
                                                        padding: '10px 20px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        minWidth: '100px',
                                                        opacity: loading || editingId === offer.id ? 0.7 : 1,
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                >
                                                    {offer.displayStatus === "Active" ? "🟢 Active" : "⚪ Inactive"}
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default OffersList;