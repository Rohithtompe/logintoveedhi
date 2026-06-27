import React, { useState, useEffect, useRef } from "react";
import api from "../../../api";

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
      // Status is BooleanField, default is True in model
      // Don't need to append status as it defaults to True

      const response = await api.post("/news/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add displayStatus for UI
      const newItem = {
        ...response.data,
        displayStatus: "Active" // Default is True which means Active
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
        // Check if the error is specifically about status field
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
    <div className="container mt-4">
      {/* Display Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* Add News Section */}
      <div className="mb-5">
        <h1 className="mb-4">Add News</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-3">
            <label className="form-label">
              <i class="bi bi-newspaper"></i>
              <strong>Name *</strong>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="News Name"
              value={newNews.name}
              onChange={handleInputChange}
              required
              style={{ width: "300px" }}
              disabled={loading}
            />
          </div>

          {/* Image Upload Field */}
          <div className="mb-3">
            <label className="form-label">
              <i class="bi bi-newspaper"></i>
              <strong>News Image * (Height: 380px, Width: 290px)</strong>
            </label>
            
            <div className="d-flex align-items-center gap-3">
              <div>
                <input
                  type="file"
                  id="fileInput"
                  className="form-control d-none"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  disabled={loading}
                  ref={fileInputRef}
                />
                <label 
                  htmlFor="fileInput" 
                  className={`btn ${loading ? 'btn-secondary' : 'btn-outline-primary'} mb-0 px-4`}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  Choose File
                </label>
              </div>
              <div>
                <span className="text-muted fw-medium">{fileName}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary mt-3 px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              <strong>Submit</strong>
            )}
          </button>
        </form>
      </div>

      <hr className="my-4" />

      {/* News List Section */}
      <div className="mt-4">
        <h2 className="mb-4">News List</h2>

        {loading && newsList.length === 0 ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading news...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="alert alert-info">
            No news found. Add your first news item above.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "25%" }}><strong>NAME</strong></th>
                  <th style={{ width: "25%" }}><strong>IMAGE</strong></th>
                  <th style={{ width: "20%" }}><strong>STATUS</strong></th>
                  <th style={{ width: "30%" }}><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((news) => (
                  <tr key={news.id}>
                    <td className="align-middle">
                      {editingId === news.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editingNews.name}
                          onChange={handleEditInputChange}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div className="fw-medium">{news.name}</div>
                      )}
                    </td>
                    
                    <td className="align-middle">
                      {editingId === news.id ? (
                        <div className="d-flex flex-column gap-2">
                          {editingNews.imagePreview && (
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className="rounded bg-light d-flex align-items-center justify-content-center"
                                style={{ height: "60px", width: "45px", overflow: "hidden" }}
                              >
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
                              <small className="text-muted">Current Image</small>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              onChange={handleEditImageChange}
                              accept="image/*"
                              ref={editFileInputRef}
                            />
                            <small className="text-muted">Leave empty to keep current image</small>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="rounded d-flex align-items-center justify-content-center bg-light mx-auto"
                          style={{ height: "95px", width: "70px", overflow: "hidden" }}
                        >
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
                            <span className="text-muted">No Image</span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="align-middle">
                      <button
                        className={`btn btn-sm ${news.displayStatus === "Active" ? "btn-success" : "btn-danger"}`}
                        onClick={() => toggleStatus(news.id)}
                        disabled={loading || editingId === news.id}
                        style={{ minWidth: "80px" }}
                      >
                        {news.displayStatus}
                      </button>
                    </td>
                    
                    <td className="align-middle">
                      {editingId === news.id ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success px-3"
                            onClick={() => saveEditedNews(news.id)}
                            disabled={loading}
                          >
                            <i className="bi bi-check-circle me-1"></i> Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary px-3"
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            <i className="bi bi-x-circle me-1"></i> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-3">
                          <button
                            className="btn btn-sm btn-outline-primary px-3"
                            onClick={() => startEditing(news)}
                            disabled={loading}
                            style={{ minWidth: "70px" }}
                          >
                            <i className="bi bi-pencil me-1"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger px-3"
                            onClick={() => deleteNews(news.id)}
                            disabled={loading}
                            style={{ minWidth: "70px" }}
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;