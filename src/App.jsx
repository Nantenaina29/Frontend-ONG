import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  // 1. User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // 2. Page state - "home" foana no voalohany rehefa sokafana
  const [page, setPage] = useState("home"); 
  const [message, setMessage] = useState({ text: "", type: "success" });

  // 3. Hash sync
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // 4. FUNCTIONS
  const goToLogin = () => setPage("login");
  const goToRegister = () => setPage("register");

  const handleLoginSuccess = (userData) => {
    // Tehirizina ny data aloha vao ovaina ny state
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    
    // Mandroso avy hatrany any amin'ny dashboard
    setPage("dashboard"); 
    
    setMessage({ text: "Connexion réussie !", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  // --- RENDERING LOGIC ---

  // A. RAHA DASHBOARD (Ity irery no miseho, tsy misy zavatra hafa)
  if (page === "dashboard") {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // B. PUBLIC PAGES (Home, Login, Register)
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <p className="brand-description">
            "Promouvoir un développement durable et inclusif au cœur de la Haute Matsiatra..."
          </p>
          <div className="brand-footer-info">Région Haute Matsiatra • Madagascar</div>
        </div>
      </div>

      <div className="form-panel">
        <div className="auth-dynamic-content">
          {message.text && (
            <div className={`msg-box ${message.type === "error" ? "msg-error" : "msg-success"}`}>
              {message.text}
            </div>
          )}

          {/* Logic Switch tsotra sy madio */}
          {page === "home" && <MainPage onGoToLogin={goToLogin} />}
          
          {page === "login" && (
            <Login
              onSwitch={goToRegister}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {page === "register" && (
            <Register
              onSwitch={goToLogin}
              onMessage={setMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}