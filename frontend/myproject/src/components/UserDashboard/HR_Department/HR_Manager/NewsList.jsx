import React, { useState, useEffect, useRef } from "react";
import api from "../../../../api.js";
import HR_ManagerSidebar from "../HR_Manager/Sidebar/HR_ManagerSidebar.jsx";
import "../HR_Manager/Sidebar/HR_ManagerSidebar.css";

const NewsList = () => {
    const [newsList, setNewsList] = useState([]);
    const [newNews, setNewNews] = useState({
        name: "",
        image: null,
    });
    const [editingId, setEditingId] = useState(null);
    const [editingNews, setEditingNews] = useState({
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

    // Load news from API on component mount
    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await api.get("/news/");

            // Convert boolean status to display strings
            const newsWithDisplayStatus = response.data.map(item => ({
                ...item,
                displayStatus: item.status ? "Active" : "Inactive"
            }));

            setNewsList(newsWithDisplayStatus);
            setError("");
        } catch (err) {
            setError("Failed to fetch news. Please try again.");
            console.error("Error fetching news:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewNews({ ...newNews, name: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewNews({ ...newNews, image: file });
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newNews.name.trim()) {
            setError("Please enter a news name");
            return;
        }
        if (!newNews.image) {
            setError("Please select an image");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("name", newNews.name);
            formData.append("image", newNews.image);

            const response = await api.post("/news/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Add displayStatus for UI
            const newItem = {
                ...response.data,
                displayStatus: "Active"
            };

            // Add the new news to the list
            setNewsList([...newsList, newItem]);

            // Reset form
            setNewNews({ name: "", image: null });
            setFileName("No file chosen");
            setSuccess("News added successfully!");

        } catch (err) {
            console.error("Error adding news:", err);
            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(`Validation Error: ${errorMessages}`);
            } else {
                setError("Failed to add news. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Start editing a news item
    const startEditing = (news) => {
        setEditingId(news.id);
        setEditingNews({
            name: news.name,
            image: null,
            imagePreview: news.image,
        });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null);
        setEditingNews({
            name: "",
            image: null,
            imagePreview: "",
        });
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    // Handle edit input change
    const handleEditInputChange = (e) => {
        setEditingNews({ ...editingNews, name: e.target.value });
    };

    // Handle edit image change
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingNews({
                    ...editingNews,
                    image: file,
                    imagePreview: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Save edited news
    const saveEditedNews = async (id) => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("name", editingNews.name);

            // Only append image if a new one was selected
            if (editingNews.image) {
                formData.append("image", editingNews.image);
            }

            const response = await api.patch(`/news/${id}/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Update local state with displayStatus
            const updatedNewsList = newsList.map((news) =>
                news.id === id ? {
                    ...response.data,
                    displayStatus: response.data.status ? "Active" : "Inactive"
                } : news
            );
            setNewsList(updatedNewsList);

            // Exit edit mode
            cancelEditing();
            setSuccess("News updated successfully!");

        } catch (err) {
            console.error("Error updating news:", err);
            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(`Validation Error: ${errorMessages}`);
            } else {
                setError("Failed to update news. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            setLoading(true);
            setError("");

            // Find the current news item
            const currentNews = newsList.find(news => news.id === id);
            if (!currentNews) {
                setError("News item not found");
                return;
            }

            // Get current boolean status from backend
            const response = await api.get(`/news/${id}/`);
            const currentBooleanStatus = response.data.status;

            // Toggle the boolean value
            const newBooleanStatus = !currentBooleanStatus;

            // Update in backend with boolean value
            await api.patch(`/news/${id}/`, {
                status: newBooleanStatus
            });

            // Update local state with new display status
            const updatedNewsList = newsList.map((news) =>
                news.id === id
                    ? {
                        ...news,
                        status: newBooleanStatus,
                        displayStatus: newBooleanStatus ? "Active" : "Inactive"
                    }
                    : news
            );

            setNewsList(updatedNewsList);
            setSuccess(`Status updated to ${newBooleanStatus ? "Active" : "Inactive"} successfully!`);

        } catch (err) {
            console.error("Error updating status:", err);
            console.error("Error response data:", err.response?.data);

            if (err.response?.data) {
                if (err.response.data.status) {
                    setError(`Status update failed: ${err.response.data.status.join(', ')}`);
                } else {
                    const errorMessages = Object.entries(err.response.data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                    setError(`Validation Error: ${errorMessages}`);
                }
            } else {
                setError("Failed to update status. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteNews = async (id) => {
        if (!window.confirm("Are you sure you want to delete this news item?")) {
            return;
        }

        try {
            await api.delete(`/news/${id}/`);

            // Update local state
            const updatedNewsList = newsList.filter((news) => news.id !== id);
            setNewsList(updatedNewsList);
            setSuccess("News deleted successfully!");

        } catch (err) {
            console.error("Error deleting news:", err);
            setError("Failed to delete news. Please try again.");
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

                {/* News List Section */}
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
                        News List
                    </h3>

                    {loading && newsList.length === 0 ? (
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
                                Loading news...
                            </p>
                        </div>
                    ) : newsList.length === 0 ? (
                        <div style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            border: '3px dashed #fbbf24',
                            color: '#92400e',
                            borderRadius: '24px',
                            padding: '50px 20px',
                            textAlign: 'center',
                            fontSize: '1.2rem'
                        }}>
                            📰 No news found. Add your first news item above!
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
                                        }}>NEWS NAME</th>
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
                                    {newsList.map((news, index) => (
                                        <tr
                                            key={news.id}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? 'white' : '#fffbeb',
                                                borderBottom: '2px solid #fde68a',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fffbeb'}
                                        >
                                            <td style={{ padding: '20px' }}>
                                                {editingId === news.id ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editingNews.name}
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
                                                        {news.name}
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '20px' }}>
                                                {editingId === news.id ? (
                                                    <div>
                                                        {editingNews.imagePreview && (
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
                                                                        src={editingNews.imagePreview}
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
                                                        {news.image ? (
                                                            <img
                                                                src={news.image}
                                                                alt={news.name}
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
                                                    style={{
                                                        background: news.displayStatus === "Active"
                                                            ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                                                            : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '40px',
                                                        padding: '10px 20px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        minWidth: '100px',
                                                        opacity: loading || editingId === news.id ? 0.7 : 1,
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                >
                                                    {news.displayStatus === "Active" ? "🟢 Active" : "⚪ Inactive"}
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

export default NewsList;