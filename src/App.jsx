// App.jsx - Version Corrigée et Synchronisée
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  // 1. Initialisation avy amin'ny localStorage mba tsy hovonoina rehefa refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch  {
      return null;
    }
  });

  // 2. Raha efa misy user dia mandeha dashboard, raha tsy izany dia home
  const [page, setPage] = useState(() => {
    return localStorage.getItem("user") ? "dashboard" : "home";
  });

  const [message, setMessage] = useState({ text: "", type: "success" });

  // 3. Hash sync - manampy ny navigation ao amin'ny navigateur
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // 4. FUNCTIONS
  const goToLogin = () => {
    setPage("login");
  };

  const goToRegister = () => {
    setPage("register");
  };

  const handleLoginSuccess = (userData) => {
    // Tehirizina aloha vao ovaina ny state
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard");
    setMessage({ text: "Connexion réussie !", type: "success" });
    
    // Fafana ny message aorian'ny 3 segondra
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  // 5. RENDERING LOGIC
  
  // A. Raha tafiditra ny mpampiasa (Dashboard)
  if (page === "dashboard" && user) {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // B. Pejy ho an'ny daholobe (Public Pages)
  return (
    <div className="login-page">
      {/* PANEL ANKAVIA - Brand Content */}
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

      {/* PANEL ANKAVANANA - Auth Forms */}
      <div className="form-panel">
        <div className="auth-dynamic-content">
          {message.text && (
            <div className={`msg-box ${message.type === "error" ? "msg-error" : "msg-success"}`}>
              {message.text}
            </div>
          )}

          {/* SWITCHING LOGIC */}
          {page === "home" && <MainPage onGoToLogin={goToLogin} />}
          
          {(page === "login" || (page === "dashboard" && !user)) && (
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