import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("home");
  };

  // 1. RAHA TAFIDITRA (Dashboard)
  if (page === "dashboard" && user) {
    return <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />;
  }

  // 2. RAHA PEJY FANDRAISANA (MainPage feno pejy - Full Screen)
  if (page === "home") {
    return <MainPage onGoToLogin={() => setPage("login")} />;
  }

  // 3. RAHA LOGIN NA REGISTER (Vao mipoitra ilay misy sisiny ankavia)
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <div className="brand-text-content">
            <p className="brand-description">
              "Promouvoir un développement durable et inclusif au cœur de la Haute Matsiatra."
            </p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="auth-dynamic-content">
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