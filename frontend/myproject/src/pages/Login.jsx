import { useState } from "react";
import api from "../api";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import img from "../assets/vedhika.jpeg";
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle, Shield, Sparkles, FileText, X } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const termsAndConditions = `
    Terms and Conditions for Veedhi Investment Portal

    1. Acceptance of Terms
    By accessing and using this portal, you agree to be bound by these Terms and Conditions.

    2. User Accounts
    a. Your login credentials are confidential and must not be shared.
    b. You are responsible for all activities under your account.

    3. Authorized Use
    a. This portal is for official business purposes only.
    b. Access is granted based on your designated role and permissions.

    4. Data Protection
    a. All company and client data must be treated as confidential.
    b. Unauthorized data sharing or copying is strictly prohibited.

    5. System Security
    a. Do not attempt to breach system security.
    b. Report any security vulnerabilities immediately.

    6. Compliance
    a. You must comply with all company policies and procedures.
    b. Violations may result in account suspension or termination.

    7. Monitoring
    a. System administrators monitor portal usage for security and compliance.
    b. All activities are logged and may be reviewed.

    8. Limitation of Liability
    The company is not liable for any indirect damages arising from portal use.

    9. Changes to Terms
    Terms may be updated periodically. Continued use constitutes acceptance.

    By checking the acceptance box, you acknowledge reading and agreeing to these terms.
  `;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions to continue");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("login/", { username, password });
      
      // Store tokens and user data
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("password", password); // Store password for dashboard display
      
      try {
        const userRes = await api.get("users/", {
          headers: {
            Authorization: `Bearer ${res.data.access}`
          }
        });
        
        const currentUser = userRes.data.find(user => 
          user.username === username || user.id === res.data.user_id
        );
        
        if (currentUser) {
          localStorage.setItem("user_id", currentUser.id);
          localStorage.setItem("designation", currentUser.designation_name || "");
          localStorage.setItem("full_name", currentUser.full_name || "");
          localStorage.setItem("employee_id", currentUser.employee_id || "");
          localStorage.setItem("department", currentUser.department_name || "");
          
          setSuccess(`Welcome ${currentUser.full_name || username}!`);
          
          setTimeout(() => {
            if (res.data.role === "admin") {
              navigate("/admin-dashboard");
            } else {
              const designation = currentUser.designation_name?.toLowerCase() || "";
              const department = currentUser.department_name?.toLowerCase() || "";
              
              let dashboardRoute = "/employee-dashboard"; 
              
              // --- FIXED FINANCE LOGIC (Strict Order) ---
              if (department.includes("finance")) {
                // Pehle humesa Asst check karo taaki Manager wala logic ise na pakad le
                if (designation.includes("assistant manager") || designation.includes("asst manager") || designation.includes("asst")) {
                  dashboardRoute = "/finance/asst-manager/dashboard";
                } else if (designation.includes("manager")) {
                  dashboardRoute = "/finance/manager/dashboard";
                }
              }
              
              // HR Department Routes
              else if (designation.includes("hr manager") || (designation.includes("manager") && department.includes("hr"))) {
                dashboardRoute = "/hr/manager/dashboard";
              }
              
              // Marketing Department Routes
              else if (designation === "bh" || designation.includes("branch head")) {
                dashboardRoute = "/marketing/bh/dashboard";
              } else if (designation === "rbh" || designation.includes("regional branch head")) {
                dashboardRoute = "/marketing/rbh/dashboard";
              } else if (designation === "cbo" || designation.includes("chief business officer")) {
                dashboardRoute = "/marketing/cbo/dashboard";
              }
              
              // Management Department Routes (MD Priority First)
              else if (designation.includes("managing director") || designation.includes("md")) {
                dashboardRoute = "/management/managing-director/dashboard";
              } else if (designation.includes("director")) {
                dashboardRoute = "/management/director/dashboard";
              }
              
              // Support/CRM Department Routes
              else if (designation.includes("marketing head")) {
                dashboardRoute = "/support-crm/marketing-head/dashboard";
              } else if (designation.includes("marketing manager")) {
                dashboardRoute = "/support-crm/marketing-manager/dashboard";
              }
              
              if (dashboardRoute === "/employee-dashboard") {
                setError(`No specific dashboard for "${designation}". Access Denied.`);
                localStorage.clear(); // Clear storage for safety
                setIsLoading(false);
                return;
              }
              
              navigate(dashboardRoute);
            }
          }, 1500);
        } else {
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => {
            if (res.data.role === "admin") navigate("/admin-dashboard");
            else {
              setError("User data not found.");
              localStorage.clear();
              setIsLoading(false);
            }
          }, 1500);
        }
      } catch (userErr) {
        console.error("Error fetching user details:", userErr);
        setError("Network error fetching user profile.");
        setIsLoading(false);
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 px-4 font-sans overflow-hidden relative">
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full opacity-15 blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full particle-wave"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-amber-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Terms & Conditions
              </h3>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-amber-600" />
              </button>
            </div>
            <div className="prose max-w-none text-gray-700 mb-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {termsAndConditions}
              </pre>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowTerms(false)} className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md z-10">
        <div className="bg-gradient-to-br from-white/95 to-amber-50/95 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/40 shadow-2xl shadow-amber-200/30 max-h-[90vh] overflow-y-auto custom-scrollbar glass">
          
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 rounded-full mb-6"></div>

          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-full blur-xl"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-amber-100 via-yellow-50 to-white rounded-full border-6 border-white shadow-2xl shadow-amber-300/50 overflow-hidden">
                <img src={img} alt="VEEDHI Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <h1 className="text-4xl font-black tracking-tight gradient-text">VEEDHI</h1>
              <h2 className="text-4xl font-black tracking-tight gradient-text">INSURANCE</h2>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/80 rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50/80 to-green-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-emerald-700 font-semibold text-sm">{success}</p>
                <p className="text-emerald-600 text-xs">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-amber-900 ml-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Username
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none transition-all bg-white/80 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-amber-900 ml-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lock className="w-3 h-3" />
                  </div>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none transition-all bg-white/80 text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 p-1.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/50">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-amber-600 border-amber-300 rounded"
                disabled={isLoading}
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm font-medium text-amber-900">Accept Terms and Conditions</label>
                <button type="button" onClick={() => setShowTerms(true)} className="text-xs text-amber-600 block mt-1 underline">
                  View full terms
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 relative overflow-hidden group"
            >
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-sm font-bold">Sign in to Veedhi</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;