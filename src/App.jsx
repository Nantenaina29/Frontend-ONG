// App.jsx - PERFECT VERSION
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  const [page, setPage] = useState("home");  // MainPage par défaut
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "success" });

  // Hash sync
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // FUNCTIONS
  const goToLogin = () => {
    setPage("login");
    window.location.hash = "login";
  };

  const goToRegister = () => {
    setPage("register");
    window.location.hash = "register";
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setPage("dashboard");
    window.location.hash = "dashboard";
    setMessage({ text: "Connexion réussie !", type: "success" });
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
    window.location.hash = "home";
  };

  // 1. DASHBOARD (user logged)
  if (page === "dashboard" && user) {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // 2. LOGIN/REGISTER/HOME (public pages)
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

          {/* PERFECT SWITCHING */}
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
