import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./style.css"; 

export default function App() {
  
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [page, setPage] = useState(window.location.hash.replace('#', '') || "dashboard");
 
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.location.hash = page;
}, [page]);

  const handleMessage = (msg, type = "success") => {
    setMessage({ text: msg, type: type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };


// App.jsx
    const handleLoginSuccess = (userData) => {
      // 1. Tehirizo ho hita manerana ny browser ny user
      localStorage.setItem("user", JSON.stringify(userData));
      
      // 2. Update state
      setUser(userData);
      
      // 3. Ovaina ny pejy (Dashboard ihany, aza asiana hash hafa)
      setPage("dashboard");
      setMessage({ text: "Connexion réussie !", type: "success" });
    };

          const handleLogout = () => {
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("user"); // Fadio koa ny user ao amin'ny storage
            setUser(null);
            setPage("home"); // Na inona na inona anaran'ny pejy fidirana ao aminao
          };

          // AMPY ITY FONCTION ITY:
          const handleGoToLogin = () => {
            setPage("login"); 
          };

  // 2. Raha eo amin'ny Dashboard (na Landing Page na Statistiques)
  if (page === "dashboard") {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
        onGoToLogin={handleGoToLogin} 
      />
    );
  }

  // 3. Raha eo amin'ny Login na Register
  return (
    <div className="login-page">
      {/* PANEL ANKAVIA - Brand Content */}
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <p className="brand-description">
            "Promouvoir un développement durable et inclusif au cœur de la 
            Haute Matsiatra. Nous œuvrons pour l'épanouissement humain à travers 
            la formation, l'accompagnement et l'innovation sociale."
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

          {page === "login" ? (
            <Login 
              onSwitch={() => setPage("register")} 
              onLoginSuccess={handleLoginSuccess} 
              onBackToHome={() => setPage("dashboard")} 
            />
          ) : (
            <Register 
              onSwitch={() => setPage("login")} 
              onMessage={handleMessage} 
            />
          )}
        </div>
      </div>
    </div>
  );
}