import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./style.css"; 

export default function App() {
  
  const [page, setPage] = useState("home"); 
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "success" });

  const handleMessage = (msg, type = "success") => {
    setMessage({ text: msg, type: type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLoginSuccess = (userData) => {
    // Tsy asiana localStorage.setItem intsony eto
    setUser(userData);
    setPage("dashboard"); 
    handleMessage("Connexion réussie !", "success");
  };

  const handleLogout = () => {
    // Diovina fotsiny ny state fa tsy mila mikitika localStorage
    setUser(null);
    setPage("home");
  };

  // ✅ LOGIQUE A: RAHA TAFIDITRA (Dashboard feno)
  if (page === "dashboard" && user) {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
        onGoToLogin={() => setPage("login")} 
      />
    );
  }

  // ✅ LOGIQUE B: RAHA MBOLA TSY TAFIDITRA (Home, Login, na Register)
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
          ) : page === "register" ? (
            <Register 
              onSwitch={() => setPage("login")} 
              onMessage={handleMessage} 
            />
          ) : (
            <Dashboard 
              activePage="home" 
              onGoToLogin={() => setPage("login")} 
            />
          )}
        </div>
      </div>
    </div>
  );
}