import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./style.css"; 

export default function App() {
  // 1. States - HOME no default fa tsy misy hash intsony
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [page, setPage] = useState("home"); 
  const [user, setUser] = useState(null);

  const handleMessage = (msg, type = "success") => {
    setMessage({ text: msg, type: type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard"); // Mifindra Dashboard rehefa mahomby ny Login
    handleMessage("Connexion réussie !", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home"); // Miverina Home rehefa mivoaka
  };

  const handleGoToLogin = () => {
    setPage("login"); 
  };

  // ✅ LOGIQUE A: RAHA DASHBOARD NA HOME (satria ny Dashboard no mitantana ny MainPage)
  if (page === "dashboard" || page === "home") {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
        onGoToLogin={handleGoToLogin} 
      />
    );
  }

  // ✅ LOGIQUE B: RAHA LOGIN NA REGISTER
  return (
    <div className="login-page">
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
              onBackToHome={() => setPage("home")} 
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