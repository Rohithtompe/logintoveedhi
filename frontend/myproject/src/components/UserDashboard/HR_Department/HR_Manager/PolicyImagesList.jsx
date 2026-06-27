import React, { useState, useEffect, useRef } from "react";
import api from "../../../../api.js";
import HR_ManagerSidebar from "../HR_Manager/Sidebar/HR_ManagerSidebar.jsx";
import "../HR_Manager/Sidebar/HR_ManagerSidebar.css";

const PolicyImageList = () => {
  const [policyImages, setPolicyImages] = useState([]);
  const [newPolicyImage, setNewPolicyImage] = useState({
    name: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [editingPolicyImage, setEditingPolicyImage] = useState({
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

  // Load policy images from API on component mount
  useEffect(() => {
    fetchPolicyImages();
  }, []);

  const fetchPolicyImages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/policy-images/");

      // Convert boolean status to display strings
      const policyImagesWithDisplayStatus = response.data.map(item => ({
        ...item,
        displayStatus: item.status ? "Active" : "Inactive"
      }));

      setPolicyImages(policyImagesWithDisplayStatus);
      setError("");
    } catch (err) {
      setError("Failed to fetch policy images. Please try again.");
      console.error("Error fetching policy images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewPolicyImage({ ...newPolicyImage, name: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPolicyImage({ ...newPolicyImage, image: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPolicyImage.name.trim()) {
      setError("Please enter a policy image name");
      return;
    }
    if (!newPolicyImage.image) {
      setError("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", newPolicyImage.name);
      formData.append("image", newPolicyImage.image);

      const response = await api.post("/policy-images/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add displayStatus for UI
      const newItem = {
        ...response.data,
        displayStatus: "Active"
      };

      // Add the new policy image to the list
      setPolicyImages([...policyImages, newItem]);

      // Reset form
      setNewPolicyImage({ name: "", image: null });
      setFileName("No file chosen");
      setSuccess("Policy image added successfully!");

    } catch (err) {
      console.error("Error adding policy image:", err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        setError(`Validation Error: ${errorMessages}`);
      } else {
        setError("Failed to add policy image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Start editing a policy image
  const startEditing = (policyImage) => {
    setEditingId(policyImage.id);
    setEditingPolicyImage({
      name: policyImage.name,
      image: null,
      imagePreview: policyImage.image,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingPolicyImage({
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
    setEditingPolicyImage({ ...editingPolicyImage, name: e.target.value });
  };

  // Handle edit image change
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPolicyImage({
          ...editingPolicyImage,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save edited policy image
  const saveEditedPolicyImage = async (id) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("name", editingPolicyImage.name);

      // Only append image if a new one was selected
      if (editingPolicyImage.image) {
        formData.append("image", editingPolicyImage.image);
      }

      const response = await api.patch(`/policy-images/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state with displayStatus
      const updatedPolicyImages = policyImages.map((policyImage) =>
        policyImage.id === id ? {
          ...response.data,
          displayStatus: response.data.status ? "Active" : "Inactive"
        } : policyImage
      );
      setPolicyImages(updatedPolicyImages);

      // Exit edit mode
      cancelEditing();
      setSuccess("Policy image updated successfully!");

    } catch (err) {
      console.error("Error updating policy image:", err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        setError(`Validation Error: ${errorMessages}`);
      } else {
        setError("Failed to update policy image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      setError("");

      // Find the current policy image
      const currentPolicyImage = policyImages.find(img => img.id === id);
      if (!currentPolicyImage) {
        setError("Policy image not found");
        return;
      }

      // Get current boolean status from backend
      const response = await api.get(`/policy-images/${id}/`);
      const currentBooleanStatus = response.data.status;

      // Toggle the boolean value
      const newBooleanStatus = !currentBooleanStatus;

      // Update in backend with boolean value
      await api.patch(`/policy-images/${id}/`, {
        status: newBooleanStatus
      });

      // Update local state with new display status
      const updatedPolicyImages = policyImages.map((policyImage) =>
        policyImage.id === id
          ? {
            ...policyImage,
            status: newBooleanStatus,
            displayStatus: newBooleanStatus ? "Active" : "Inactive"
          }
          : policyImage
      );

      setPolicyImages(updatedPolicyImages);
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

  const deletePolicyImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy image?")) {
      return;
    }

    try {
      await api.delete(`/policy-images/${id}/`);

      // Update local state
      const updatedPolicyImages = policyImages.filter((policyImage) => policyImage.id !== id);
      setPolicyImages(updatedPolicyImages);
      setSuccess("Policy image deleted successfully!");

    } catch (err) {
      console.error("Error deleting policy image:", err);
      setError("Failed to delete policy image. Please try again.");
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
      background: '#fef3c7'
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
        overflowX: 'hidden',
        color: '#78350f'
      }}>
        {/* Policy Image Management Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 15px 35px rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>

          {/* Display Messages */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
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

          {/* Policy Image List Section */}
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
              Policy Image List
            </h3>

            {loading && policyImages.length === 0 ? (
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
                  Loading policy images...
                </p>
              </div>
            ) : policyImages.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '3px dashed #fbbf24',
                color: '#92400e',
                borderRadius: '24px',
                padding: '50px 20px',
                textAlign: 'center',
                fontSize: '1.2rem'
              }}>
                📄 No policy images found. Add your first policy image above!
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
                      }}>POLICY NAME</th>
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
                    {policyImages.map((policyImage, index) => (
                      <tr
                        key={policyImage.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? 'white' : '#fffbeb',
                          borderBottom: '2px solid #fde68a',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fffbeb'}
                      >
                        <td style={{ padding: '20px' }}>
                          {editingId === policyImage.id ? (
                            <input
                              type="text"
                              className="form-control"
                              value={editingPolicyImage.name}
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
                              {policyImage.name}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '20px' }}>
                          {editingId === policyImage.id ? (
                            <div>
                              {editingPolicyImage.imagePreview && (
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
                                      src={editingPolicyImage.imagePreview}
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
                              {policyImage.image ? (
                                <img
                                  src={policyImage.image}
                                  alt={policyImage.name}
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
                            onClick={() => toggleStatus(policyImage.id)}
                            disabled={loading || editingId === policyImage.id}
                            style={{
                              background: policyImage.displayStatus === "Active"
                                ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                                : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '40px',
                              padding: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              minWidth: '100px',
                              cursor: loading || editingId === policyImage.id ? 'not-allowed' : 'pointer',
                              opacity: loading || editingId === policyImage.id ? 0.7 : 1,
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {policyImage.displayStatus === "Active" ? "🟢 Active" : "⚪ Inactive"}
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
    </div>
  );
};

export default PolicyImageList;