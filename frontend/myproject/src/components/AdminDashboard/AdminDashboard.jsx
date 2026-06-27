import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import api from "../../api";
import "./AdminDashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import "./Sidebar/Sidebar.css";

function AdminDashboard() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "trainer",
    contact_info: "",
    employee_id: "",
  });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
  });

  // Carousel states
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);

  const [isOfferAnimating, setIsOfferAnimating] = useState(false);
  const [isNewsAnimating, setIsNewsAnimating] = useState(false);
  const [isPolicyAnimating, setIsPolicyAnimating] = useState(false);

  const itemsPerView = 1; // Show 1 item at a time like in the image

  const [dashboardOffers, setDashboardOffers] = useState([]);
  const [dashboardNews, setDashboardNews] = useState([]);
  const [dashboardPolicies, setDashboardPolicies] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  // Refs for interval cleanup
  const offerIntervalRef = useRef(null);
  const newsIntervalRef = useRef(null);
  const policyIntervalRef = useRef(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/");
    fetchEmployees();
    fetchDashboardOffers();
    fetchDashboardNews();
    fetchDashboardPolicies();
  }, [navigate]);

  // Auto-play for Offers
  useEffect(() => {
    if (dashboardOffers.length <= 1) {
      clearInterval(offerIntervalRef.current);
      return;
    }

    offerIntervalRef.current = setInterval(() => {
      handleOfferNext();
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (offerIntervalRef.current) {
        clearInterval(offerIntervalRef.current);
      }
    };
  }, [dashboardOffers.length, currentOfferIndex]);

  // Auto-play for News
  useEffect(() => {
    if (dashboardNews.length <= 1) {
      clearInterval(newsIntervalRef.current);
      return;
    }

    newsIntervalRef.current = setInterval(() => {
      handleNewsNext();
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (newsIntervalRef.current) {
        clearInterval(newsIntervalRef.current);
      }
    };
  }, [dashboardNews.length, currentNewsIndex]);

  // Auto-play for Policies
  useEffect(() => {
    if (dashboardPolicies.length <= 1) {
      clearInterval(policyIntervalRef.current);
      return;
    }

    policyIntervalRef.current = setInterval(() => {
      handlePolicyNext();
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (policyIntervalRef.current) {
        clearInterval(policyIntervalRef.current);
      }
    };
  }, [dashboardPolicies.length, currentPolicyIndex]);

  // Fetch offers from API
  const fetchDashboardOffers = async () => {
    try {
      setOffersLoading(true);
      const response = await api.get("/offers/");
      const activeOffers = response.data.filter(offer => offer.status === true);
      setDashboardOffers(activeOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setDashboardOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  // Fetch news from API
  const fetchDashboardNews = async () => {
    try {
      setNewsLoading(true);
      const response = await api.get("/news/");
      const activeNews = response.data.filter(news => news.status === true);
      setDashboardNews(activeNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      setDashboardNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Fetch policies from API
  const fetchDashboardPolicies = async () => {
    try {
      setPoliciesLoading(true);
      const response = await api.get("/policy-images/");
      const activePolicies = response.data.filter(policy => policy.status === true);
      setDashboardPolicies(activePolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      setDashboardPolicies([]);
    } finally {
      setPoliciesLoading(false);
    }
  };

  // Navigation functions for Offers
  const handleOfferPrev = () => {
    if (isOfferAnimating || dashboardOffers.length <= itemsPerView) return;

    // Reset auto-play timer
    if (offerIntervalRef.current) {
      clearInterval(offerIntervalRef.current);
      offerIntervalRef.current = setInterval(() => {
        handleOfferNext();
      }, 4000);
    }

    setIsOfferAnimating(true);

    setTimeout(() => {
      setCurrentOfferIndex(prev =>
        prev === 0 ? dashboardOffers.length - 1 : prev - 1
      );
      setIsOfferAnimating(false);
    }, 300);
  };

  const handleOfferNext = () => {
    if (isOfferAnimating || dashboardOffers.length <= itemsPerView) return;

    // Reset auto-play timer
    if (offerIntervalRef.current) {
      clearInterval(offerIntervalRef.current);
      offerIntervalRef.current = setInterval(() => {
        handleOfferNext();
      }, 4000);
    }

    setIsOfferAnimating(true);

    setTimeout(() => {
      setCurrentOfferIndex(prev =>
        prev >= dashboardOffers.length - 1 ? 0 : prev + 1
      );
      setIsOfferAnimating(false);
    }, 300);
  };

  // Navigation functions for News
  const handleNewsPrev = () => {
    if (isNewsAnimating || dashboardNews.length <= itemsPerView) return;

    // Reset auto-play timer
    if (newsIntervalRef.current) {
      clearInterval(newsIntervalRef.current);
      newsIntervalRef.current = setInterval(() => {
        handleNewsNext();
      }, 4000);
    }

    setIsNewsAnimating(true);

    setTimeout(() => {
      setCurrentNewsIndex(prev =>
        prev === 0 ? dashboardNews.length - 1 : prev - 1
      );
      setIsNewsAnimating(false);
    }, 300);
  };

  const handleNewsNext = () => {
    if (isNewsAnimating || dashboardNews.length <= itemsPerView) return;

    // Reset auto-play timer
    if (newsIntervalRef.current) {
      clearInterval(newsIntervalRef.current);
      newsIntervalRef.current = setInterval(() => {
        handleNewsNext();
      }, 4000);
    }

    setIsNewsAnimating(true);

    setTimeout(() => {
      setCurrentNewsIndex(prev =>
        prev >= dashboardNews.length - 1 ? 0 : prev + 1
      );
      setIsNewsAnimating(false);
    }, 300);
  };

  // Navigation functions for Policies
  const handlePolicyPrev = () => {
    if (isPolicyAnimating || dashboardPolicies.length <= itemsPerView) return;

    // Reset auto-play timer
    if (policyIntervalRef.current) {
      clearInterval(policyIntervalRef.current);
      policyIntervalRef.current = setInterval(() => {
        handlePolicyNext();
      }, 4000);
    }

    setIsPolicyAnimating(true);

    setTimeout(() => {
      setCurrentPolicyIndex(prev =>
        prev === 0 ? dashboardPolicies.length - 1 : prev - 1
      );
      setIsPolicyAnimating(false);
    }, 300);
  };

  const handlePolicyNext = () => {
    if (isPolicyAnimating || dashboardPolicies.length <= itemsPerView) return;

    // Reset auto-play timer
    if (policyIntervalRef.current) {
      clearInterval(policyIntervalRef.current);
      policyIntervalRef.current = setInterval(() => {
        handlePolicyNext();
      }, 4000);
    }

    setIsPolicyAnimating(true);

    setTimeout(() => {
      setCurrentPolicyIndex(prev =>
        prev >= dashboardPolicies.length - 1 ? 0 : prev + 1
      );
      setIsPolicyAnimating(false);
    }, 300);
  };

  // Fetch employees for the dashboard count
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get("users/");
      const employeesData = response.data.results || response.data || [];
      setEmployees(employeesData);

      // Calculate stats
      const active = employeesData.filter(emp => emp.is_active !== false).length;
      const inactive = employeesData.filter(emp => emp.is_active === false).length;

      setStats({
        totalEmployees: employeesData.length,
        activeEmployees: active,
        inactiveEmployees: inactive,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`users/${editId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("users/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "trainer",
        contact_info: "",
        employee_id: "",
      });
      setEditId(null);
      alert(editId ? "User updated successfully!" : "User created successfully!");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  // Handle card click navigation
  const handleCardClick = (type) => {
    switch (type) {
      case 'total':
        navigate('/admin-dashboard/emp/active');
        break;
      case 'active':
        navigate('/admin-dashboard/emp/active');
        break;
      case 'inactive':
        navigate('/admin-dashboard/emp/inactive');
        break;
      default:
        break;
    }
  };

  const [hoveredStat, setHoveredStat] = useState(null);

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  };

  const mainContentStyle = {
    flex: 1,
    padding: '30px',
    marginLeft: '280px',
    overflowY: 'auto',
    background: '#f5f7fa',
  };

  const headerStyle = {
    marginBottom: '30px',
  };

  const headerContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  };

  const welcomeTitleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const welcomeTextStyle = {
    color: '#64748b',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    maxWidth: '600px',
    fontWeight: '400',
  };

  const dividerStyle = {
    height: '1px',
    background: 'linear-gradient(90deg, #667eea 0%, #f1f5f9 100%)',
    borderRadius: '2px',
    marginTop: '10px',
  };

  const statsContainerStyle = {
    marginBottom: '30px',
  };

  const statsRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  };

  const statCardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    borderColor: '#c7d2fe',
  };

  const statIconStyle = (color) => ({
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '20px',
    fontSize: '1.5rem',
    flexShrink: 0,
    background: color,
    color: 'white',
  });

  const statContentStyle = {
    flex: 1,
  };

  const statTitleStyle = {
    fontSize: '0.85rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    fontWeight: '600',
  };

  const statNumberStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1',
    margin: '6px 0',
  };

  const statSubtitleStyle = {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginTop: '4px',
  };

  const dashboardContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const contentCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  };

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  };

  const cardTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const carouselContainerStyle = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    marginTop: '10px',
  };

  const carouselWrapperStyle = {
    overflow: 'hidden',
    width: '100%',
    padding: '5px 0',
  };

  const carouselTrackStyle = {
    display: 'flex',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  };

  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10,
    fontSize: '24px',
    color: '#475569',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <Outlet />

        {!location.pathname.includes('/admin-dashboard/') && (
          <>
            {/* Header Section */}
            <div style={headerStyle}>
              <div style={headerContentStyle}>
                {/* Inline keyframes */}
                <style>
                  {`
                @keyframes sparkleMove {
                0% { transform: translate(0,0); opacity: 0.2; }
                50% { transform: translate(15px,-25px); opacity: 1; }
                100% { transform: translate(0,0); opacity: 0.2; }
                }
              `}
                </style>

                <div
                  style={{
                    position: "relative",
                    margin: "-20px -10px 40px -10px",
                    padding: "20px 60px",
                    borderRadius: "36px",
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.92))",
                    backdropFilter: "blur(18px)",
                    boxShadow:
                      "0 60px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* ✨ Glitter Stars Inline */}
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: "3px",
                        height: "3px",
                        borderRadius: "50%",
                        background: "#38bdf8",
                        boxShadow: "0 0 12px 6px rgba(56,189,248,0.9)",
                        opacity: Math.random(),
                        animation: `sparkleMove ${6 + Math.random() * 6}s ease-in-out ${Math.random() * 5
                          }s infinite`,
                        zIndex: 1,
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                  {/* Glow Background */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 85% 15%, rgba(56,189,248,0.25), transparent 40%), radial-gradient(circle at 10% 90%, rgba(250,204,21,0.18), transparent 50%)",
                      zIndex: 0,
                    }}
                  />

                  {/* Floating blur circle */}
                  <div
                    style={{
                      position: "absolute",
                      right: "-100px",
                      top: "-100px",
                      width: "380px",
                      height: "380px",
                      background:
                        "radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)",
                      borderRadius: "50%",
                      filter: "blur(120px)",
                      zIndex: 0,
                    }}
                  />

                  {/* LEFT CONTENT */}
                  <div style={{ zIndex: 2, maxWidth: "62%" }}>
                    <h1
                      style={{
                        fontSize: "3rem",
                        fontWeight: "900",
                        marginBottom: "14px",
                        letterSpacing: "1px",
                        background: "linear-gradient(90deg, #38bdf8, #facc15)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Welcome back, K RAJESH
                    </h1>

                    <p
                      style={{
                        fontSize: "1.25rem",
                        color: "#e2e8f0",
                        lineHeight: "1.9",
                        opacity: 0.85,
                        marginBottom: "28px",
                        maxWidth: "90%",
                      }}
                    >
                      Effortlessly manage employees, monitor performance, and control the entire
                      ecosystem from this powerful, intelligent admin dashboard.
                    </p>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div
                    style={{
                      zIndex: 2,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      padding: "35px 45px",
                      borderRadius: "28px",
                      backdropFilter: "blur(14px)",
                      textAlign: "center",
                      minWidth: "260px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "2.1rem",
                        color: "#facc15",
                        letterSpacing: "2px",
                        marginBottom: "6px",
                      }}
                    >
                      VEEDHI
                    </h3>
                    <h2
                      style={{
                        fontSize: "3rem",
                        fontWeight: "900",
                        color: "#facc15",
                        letterSpacing: "3px",
                      }}
                    >
                      INSURANCE
                    </h2>
                  </div>
                </div>
              </div>
              <div style={dividerStyle}></div>
            </div>

            {/* Stats Cards Section */}
            <div style={statsContainerStyle}>
              <div style={statsRowStyle}>
                {/* Total Employees Card */}
                <div
                  style={{
                    ...statCardStyle,
                    ...(hoveredStat === 'total' ? statCardHoverStyle : {})
                  }}
                  onMouseEnter={() => setHoveredStat('total')}
                  onMouseLeave={() => setHoveredStat(null)}
                  onClick={() => handleCardClick('total')}
                >
                  <div style={statIconStyle('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div style={statContentStyle}>
                    <h3 style={statTitleStyle}>Total Employees</h3>
                    {loading ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.2rem' }}>Loading...</div>
                    ) : (
                      <div style={statNumberStyle}>{stats.totalEmployees}</div>
                    )}
                    <p style={statSubtitleStyle}>All registered staff members</p>
                  </div>
                </div>

                {/* Active Employees Card */}
                <div
                  style={{
                    ...statCardStyle,
                    ...(hoveredStat === 'active' ? statCardHoverStyle : {})
                  }}
                  onMouseEnter={() => setHoveredStat('active')}
                  onMouseLeave={() => setHoveredStat(null)}
                  onClick={() => handleCardClick('active')}
                >
                  <div style={statIconStyle('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
                    <i className="bi bi-person-check-fill"></i>
                  </div>
                  <div style={statContentStyle}>
                    <h3 style={statTitleStyle}>Active Employees</h3>
                    {loading ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.2rem' }}>Loading...</div>
                    ) : (
                      <div style={statNumberStyle}>{stats.activeEmployees}</div>
                    )}
                    <p style={statSubtitleStyle}>Currently active and working</p>
                  </div>
                </div>

                {/* Inactive Employees Card */}
                <div
                  style={{
                    ...statCardStyle,
                    ...(hoveredStat === 'inactive' ? statCardHoverStyle : {})
                  }}
                  onMouseEnter={() => setHoveredStat('inactive')}
                  onMouseLeave={() => setHoveredStat(null)}
                  onClick={() => handleCardClick('inactive')}
                >
                  <div style={statIconStyle('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}>
                    <i className="bi bi-person-x-fill"></i>
                  </div>
                  <div style={statContentStyle}>
                    <h3 style={statTitleStyle}>Inactive Employees</h3>
                    {loading ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.2rem' }}>Loading...</div>
                    ) : (
                      <div style={statNumberStyle}>{stats.inactiveEmployees}</div>
                    )}
                    <p style={statSubtitleStyle}>Not currently active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div style={dashboardContentStyle}>
              {/* OFFERS CAROUSEL */}
              <div style={contentCardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>
                    <i className="bi bi-gift-fill" style={{ color: '#ec4899' }}></i> OFFERS
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{dashboardOffers.length} offers</span>
                    {dashboardOffers.length > 0 && (
                      <span style={{ color: '#94a3b8' }}>
                        {currentOfferIndex + 1} of {dashboardOffers.length}
                      </span>
                    )}
                  </div>
                </div>

                <div style={carouselContainerStyle}>
                  {/* Left Arrow */}
                  {dashboardOffers.length > 1 && (
                    <button
                      onClick={handleOfferPrev}
                      disabled={isOfferAnimating}
                      style={{
                        ...navButtonStyle,
                        left: '10px',
                        opacity: isOfferAnimating ? 0.5 : 1,
                        cursor: isOfferAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #ec4899',
                        color: '#ec4899'
                      }}
                      onMouseEnter={(e) => {
                        if (!isOfferAnimating) {
                          e.currentTarget.style.background = '#ec4899';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#ec4899';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  )}

                  {/* Carousel Track */}
                  <div style={carouselWrapperStyle}>
                    <div style={{
                      ...carouselTrackStyle,
                      transform: `translateX(-${currentOfferIndex * 100}%)`,
                    }}>
                      {offersLoading ? (
                        // Loading state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </div>
                      ) : dashboardOffers.length > 0 ? (
                        // Actual offers
                        dashboardOffers.map((offer, index) => (
                          <div key={`offer-${offer.id}`} style={{ width: '100%', flexShrink: 0 }}>
                            <div
                              style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                height: '350px',
                                position: 'relative'
                              }}
                            >
                              {/* Large Image Container */}
                              <div style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {offer.image ? (
                                  <img
                                    src={offer.image}
                                    alt={offer.name || 'Offer'}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      objectPosition: "center",
                                      transition: 'transform 0.5s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                                  }}>
                                    <i className="bi bi-gift" style={{ fontSize: '4rem', marginBottom: '16px', color: '#d1d5db' }}></i>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>No Offer Image</span>
                                  </div>
                                )}

                                {/* Offer Overlay Info */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                  color: 'white',
                                  padding: '20px',
                                }}>
                                  <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                  }}>
                                    {offer.name || 'Special Offer'}
                                  </div>
                                  {offer.description && (
                                    <div style={{
                                      fontSize: '0.9rem',
                                      opacity: 0.9
                                    }}>
                                      {offer.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Empty state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            padding: '40px'
                          }}>
                            <i className="bi bi-gift" style={{ fontSize: '4rem', marginBottom: '20px', color: '#e2e8f0' }}></i>
                            <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '12px' }}>
                              No offers available
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#94a3b8', textAlign: 'center', maxWidth: '400px' }}>
                              Add offers from the Marketing section to display here
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {dashboardOffers.length > 1 && (
                    <button
                      onClick={handleOfferNext}
                      disabled={isOfferAnimating}
                      style={{
                        ...navButtonStyle,
                        right: '10px',
                        opacity: isOfferAnimating ? 0.5 : 1,
                        cursor: isOfferAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #ec4899',
                        color: '#ec4899'
                      }}
                      onMouseEnter={(e) => {
                        if (!isOfferAnimating) {
                          e.currentTarget.style.background = '#ec4899';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#ec4899';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  )}

                  {/* Dots Indicator */}
                  {dashboardOffers.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '25px'
                    }}>
                      {dashboardOffers.map((_, index) => (
                        <button
                          key={`offer-dot-${index}`}
                          onClick={() => {
                            if (!isOfferAnimating) {
                              setIsOfferAnimating(true);
                              setTimeout(() => {
                                setCurrentOfferIndex(index);
                                setIsOfferAnimating(false);
                              }, 300);
                            }
                          }}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            padding: 0,
                            cursor: isOfferAnimating ? 'not-allowed' : 'pointer',
                            backgroundColor: currentOfferIndex === index ? '#ec4899' : '#e2e8f0',
                            transition: 'all 0.3s ease',
                            opacity: isOfferAnimating ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isOfferAnimating) {
                              e.currentTarget.style.transform = 'scale(1.3)';
                              e.currentTarget.style.backgroundColor = currentOfferIndex === index ? '#ec4899' : '#cbd5e1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = currentOfferIndex === index ? '#ec4899' : '#e2e8f0';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* NEWS CAROUSEL */}
              <div style={contentCardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>
                    <i className="bi bi-newspaper" style={{ color: '#3b82f6' }}></i> COMPANY NEWS
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{dashboardNews.length} news items</span>
                    {dashboardNews.length > 0 && (
                      <span style={{ color: '#94a3b8' }}>
                        {currentNewsIndex + 1} of {dashboardNews.length}
                      </span>
                    )}
                  </div>
                </div>

                <div style={carouselContainerStyle}>
                  {/* Left Arrow */}
                  {dashboardNews.length > 1 && (
                    <button
                      onClick={handleNewsPrev}
                      disabled={isNewsAnimating}
                      style={{
                        ...navButtonStyle,
                        left: '10px',
                        opacity: isNewsAnimating ? 0.5 : 1,
                        cursor: isNewsAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #3b82f6',
                        color: '#3b82f6'
                      }}
                      onMouseEnter={(e) => {
                        if (!isNewsAnimating) {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  )}

                  {/* Carousel Track */}
                  <div style={carouselWrapperStyle}>
                    <div style={{
                      ...carouselTrackStyle,
                      transform: `translateX(-${currentNewsIndex * 100}%)`,
                    }}>
                      {newsLoading ? (
                        // Loading state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </div>
                      ) : dashboardNews.length > 0 ? (
                        // Actual news
                        dashboardNews.map((news, index) => (
                          <div key={`news-${news.id}`} style={{ width: '100%', flexShrink: 0 }}>
                            <div
                              style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                height: '350px',
                                position: 'relative'
                              }}
                            >
                              {/* Large Image Container */}
                              <div style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {news.image ? (
                                  <img
                                    src={news.image}
                                    alt={news.name || 'News'}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      objectPosition: "center",
                                      transition: 'transform 0.5s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                                  }}>
                                    <i className="bi bi-newspaper" style={{ fontSize: '4rem', marginBottom: '16px', color: '#d1d5db' }}></i>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>No News Image</span>
                                  </div>
                                )}

                                {/* News Overlay Info */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                  color: 'white',
                                  padding: '20px',
                                }}>
                                  <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                  }}>
                                    {news.name || 'Latest News'}
                                  </div>
                                  {news.description && (
                                    <div style={{
                                      fontSize: '0.9rem',
                                      opacity: 0.9
                                    }}>
                                      {news.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Empty state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            padding: '40px'
                          }}>
                            <i className="bi bi-newspaper" style={{ fontSize: '4rem', marginBottom: '20px', color: '#e2e8f0' }}></i>
                            <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '12px' }}>
                              No news available
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#94a3b8', textAlign: 'center', maxWidth: '400px' }}>
                              Add news from the Training section to display here
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {dashboardNews.length > 1 && (
                    <button
                      onClick={handleNewsNext}
                      disabled={isNewsAnimating}
                      style={{
                        ...navButtonStyle,
                        right: '10px',
                        opacity: isNewsAnimating ? 0.5 : 1,
                        cursor: isNewsAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #3b82f6',
                        color: '#3b82f6'
                      }}
                      onMouseEnter={(e) => {
                        if (!isNewsAnimating) {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  )}

                  {/* Dots Indicator */}
                  {dashboardNews.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '25px'
                    }}>
                      {dashboardNews.map((_, index) => (
                        <button
                          key={`news-dot-${index}`}
                          onClick={() => {
                            if (!isNewsAnimating) {
                              setIsNewsAnimating(true);
                              setTimeout(() => {
                                setCurrentNewsIndex(index);
                                setIsNewsAnimating(false);
                              }, 300);
                            }
                          }}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            padding: 0,
                            cursor: isNewsAnimating ? 'not-allowed' : 'pointer',
                            backgroundColor: currentNewsIndex === index ? '#3b82f6' : '#e2e8f0',
                            transition: 'all 0.3s ease',
                            opacity: isNewsAnimating ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isNewsAnimating) {
                              e.currentTarget.style.transform = 'scale(1.3)';
                              e.currentTarget.style.backgroundColor = currentNewsIndex === index ? '#3b82f6' : '#cbd5e1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = currentNewsIndex === index ? '#3b82f6' : '#e2e8f0';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* POLICIES CAROUSEL */}
              <div style={contentCardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>
                    <i className="bi bi-file-earmark-text-fill" style={{ color: '#10b981' }}></i> COMPANY POLICIES
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{dashboardPolicies.length} policies</span>
                    {dashboardPolicies.length > 0 && (
                      <span style={{ color: '#94a3b8' }}>
                        {currentPolicyIndex + 1} of {dashboardPolicies.length}
                      </span>
                    )}
                  </div>
                </div>

                <div style={carouselContainerStyle}>
                  {/* Left Arrow */}
                  {dashboardPolicies.length > 1 && (
                    <button
                      onClick={handlePolicyPrev}
                      disabled={isPolicyAnimating}
                      style={{
                        ...navButtonStyle,
                        left: '10px',
                        opacity: isPolicyAnimating ? 0.5 : 1,
                        cursor: isPolicyAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #10b981',
                        color: '#10b981'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPolicyAnimating) {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#10b981';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  )}

                  {/* Carousel Track */}
                  <div style={carouselWrapperStyle}>
                    <div style={{
                      ...carouselTrackStyle,
                      transform: `translateX(-${currentPolicyIndex * 100}%)`,
                    }}>
                      {policiesLoading ? (
                        // Loading state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </div>
                      ) : dashboardPolicies.length > 0 ? (
                        // Actual policies
                        dashboardPolicies.map((policy, index) => (
                          <div key={`policy-${policy.id}`} style={{ width: '100%', flexShrink: 0 }}>
                            <div
                              style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                height: '350px',
                                position: 'relative'
                              }}
                            >
                              {/* Large Image Container */}
                              <div style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {policy.image ? (
                                  <img
                                    src={policy.image}
                                    alt={policy.name || 'Policy'}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      objectPosition: "center",
                                      transition: 'transform 0.5s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                                  }}>
                                    <i className="bi bi-file-text" style={{ fontSize: '4rem', marginBottom: '16px', color: '#d1d5db' }}></i>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>No Policy Image</span>
                                  </div>
                                )}

                                {/* Policy Overlay Info */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                  color: 'white',
                                  padding: '20px',
                                }}>
                                  <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                  }}>
                                    {policy.name || 'Company Policy'}
                                  </div>
                                  {policy.description && (
                                    <div style={{
                                      fontSize: '0.9rem',
                                      opacity: 0.9
                                    }}>
                                      {policy.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Empty state
                        <div style={{ width: '100%', flexShrink: 0 }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            height: '350px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            padding: '40px'
                          }}>
                            <i className="bi bi-file-text" style={{ fontSize: '4rem', marginBottom: '20px', color: '#e2e8f0' }}></i>
                            <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '12px' }}>
                              No policies available
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#94a3b8', textAlign: 'center', maxWidth: '400px' }}>
                              Add policies from the Training section to display here
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {dashboardPolicies.length > 1 && (
                    <button
                      onClick={handlePolicyNext}
                      disabled={isPolicyAnimating}
                      style={{
                        ...navButtonStyle,
                        right: '10px',
                        opacity: isPolicyAnimating ? 0.5 : 1,
                        cursor: isPolicyAnimating ? 'not-allowed' : 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #10b981',
                        color: '#10b981'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPolicyAnimating) {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#10b981';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  )}

                  {/* Dots Indicator */}
                  {dashboardPolicies.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '25px'
                    }}>
                      {dashboardPolicies.map((_, index) => (
                        <button
                          key={`policy-dot-${index}`}
                          onClick={() => {
                            if (!isPolicyAnimating) {
                              setIsPolicyAnimating(true);
                              setTimeout(() => {
                                setCurrentPolicyIndex(index);
                                setIsPolicyAnimating(false);
                              }, 300);
                            }
                          }}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            padding: 0,
                            cursor: isPolicyAnimating ? 'not-allowed' : 'pointer',
                            backgroundColor: currentPolicyIndex === index ? '#10b981' : '#e2e8f0',
                            transition: 'all 0.3s ease',
                            opacity: isPolicyAnimating ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isPolicyAnimating) {
                              e.currentTarget.style.transform = 'scale(1.3)';
                              e.currentTarget.style.backgroundColor = currentPolicyIndex === index ? '#10b981' : '#cbd5e1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = currentPolicyIndex === index ? '#10b981' : '#e2e8f0';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;