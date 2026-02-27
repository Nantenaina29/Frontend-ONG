import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  // 1. Ny "page" foana no mibaiko (Start at "home")
  const [page, setPage] = useState("home");
  
  // 2. Ny "user" alaina avy amin'ny localStorage raha misy
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard"); // Mifindra Dashboard avy hatrany
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("home");
  };

  // --- RENDERING ---

  // Raha vao dashboard ny pejy sady misy user
  if (page === "dashboard" && user) {
    return <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />;
  }

  // Raha tsy izany, ireto pejy ireto no aseho
  return (
<div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          
          <h1 className="brand-title">
            ONG <span>Tsinjo Aina Fianarantsoa</span>
          </h1>

          {/* Eto ireo paragraphe rehetra nanjavona teo */}
          <div className="brand-text-content">
            <p className="brand-description">
              "Promouvoir un développement durable et inclusif au cœur de la Haute Matsiatra."
            </p>
            
            <p className="brand-mission">
              Notre mission est d'accompagner les communautés locales vers une autonomie 
              réelle à travers l'éducation, la formation technique et le soutien social.
            </p>

            <div className="brand-motto">
              <span>Solidarité</span> • <span>Développement</span> • <span>Avenir</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="auth-dynamic-content">
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
              onMessage={(msg) => console.log(msg)}
            />
          )}
        </div>
      </div>
    </div>
  );
}