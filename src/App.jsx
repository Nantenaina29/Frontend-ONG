// App.jsx - Version synchronisée (Force Home au démarrage)
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  // 1. User state: vakiana ny storage fa apetraka ho null raha vao manomboka ny app
  // Mba hahafahana manao login indray
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // 2. FORCE HOME: Na inona na inona nisy teo aloha, pejy "home" foana no misokatra voalohany
  const [page, setPage] = useState("home"); 

  const [message, setMessage] = useState({ text: "", type: "success" });

  // 3. Hash sync
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
        // 1. Tehirizo ALOHA ny data rehetra
        localStorage.setItem("user", JSON.stringify(userData));
        
        // 2. Ovaina miaraka ny user sy ny page (Synchronized update)
        setUser(userData);
        setPage("dashboard");
      
        // 3. Hafatra fahombiazana (Tsy mampihetsika setPage intsony ny timeout eto)
        setMessage({ text: "Connexion réussie !", type: "success" });
        setTimeout(() => {
          setMessage({ text: "", type: "success" });
        }, 3000);
      };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

      if (page === "dashboard") {
        return (
          <Dashboard 
            user={user} 
            setUser={setUser} 
            onLogout={handleLogout} 
          />
        );
      }
  // B. Public Pages
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <p className="brand-description">
            "Promouvoir un development durable et inclusif au cœur de la Haute Matsiatra..."
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

          {/* Logic switch - Home foana no voalohany izao */}
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

          {/* Fiarovana: raha sendra tafiditra amin'ny dashboard nefa tsy misy user */}
          {page === "dashboard" && !user && (
            <Login
              onSwitch={goToRegister}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}