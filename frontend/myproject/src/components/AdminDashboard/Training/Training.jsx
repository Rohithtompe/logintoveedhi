import React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/Training.css'

const Training = () => {
  const navigate = useNavigate()

  const handleAddClick = (path) => {
    navigate(`/admin-dashboard/${path}`)
  }

  const handleListClick = (path) => {
    navigate(`/admin-dashboard/${path}`)
  }

  return (
    <div className="training-container">
      <h1 className="training-header">Training</h1>
      
      <div className="training-grid">
        {/* Type of Loan Video */}
        <div className="training-card">
          <h3 className="card-title">Type of Loan Video</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/loan-video')}
            >
              Add
            </button>
            <button 
              className="btn-list"
              onClick={() => handleListClick('training/loan-video-list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="training-card">
          <h3 className="card-title">Profile</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/profile')}
            >
              Add
            </button>
            <button 
              className="btn-list"
              onClick={() => handleListClick('training/profile-list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Seminars */}
        <div className="training-card">
          <h3 className="card-title">Seminars</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/seminar')}
            >
              Add
            </button>
            <button 
              className="btn-list"
              onClick={() => handleListClick('training/seminar-list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Policy */}
        <div className="training-card">
          <h3 className="card-title">Policy</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/policy')}
            >
              Add
            </button>
            <button 
              className="btn-list"
              onClick={() => handleListClick('training/policy-list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Offers */}
        <div className="training-card">
          <h3 className="card-title">Offers</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/offer-list')}
            >
              Add
            </button>
          </div>
        </div>

        {/* News */}
        <div className="training-card">
          <h3 className="card-title">News</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/news-list')}
            >
              Add
            </button>
          </div>
        </div>

        {/* Policy Images */}
        <div className="training-card">
          <h3 className="card-title">Policy Images</h3>
          <div className="button-group">
            <button 
              className="btn-add"
              onClick={() => handleAddClick('training/policy-image-list')}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Training