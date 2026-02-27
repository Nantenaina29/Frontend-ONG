import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  // 1. STATE INITIALISATION: Ity no lojika mandidy ny pejy voalohany
  // Raha misy user ao amin'ny storage, dia "dashboard" avy hatrany, raha tsy izany "home"
  const [page, setPage] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? "dashboard" : "home";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const [message, setMessage] = useState({ text: "", type: "success" });

  // 2. Hash sync (Ity dia ho an'ny URL fotsiny, tsy misy setPage ka tsy miteraka menamena)
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // 3. FUNCTIONS
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard"); // Mifindra any amin'ny dashboard avy hatrany
    
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

  // RAHA DASHBOARD: Ity irery no mipoitra
  if (page === "dashboard") {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // RAHA PEJY PUBLIQUES
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <p className="brand-description">"Promouvoir un développement durable..."</p>
        </div>
      </div>

      <div className="form-panel">
        <div className="auth-dynamic-content">
          {message.text && (
            <div className={`msg-box ${message.type === "error" ? "msg-error" : "msg-success"}`}>
              {message.text}
            </div>
          )}

          {page === "home" && <MainPage onGoToLogin={() => setPage("login")} />}
          
          {page === "login" && (
            <Login
              onSwitch={() => setPage("register")}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {page === "register" && (
            <Register
              onSwitch={() => setPage("login")}
              onMessage={setMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}