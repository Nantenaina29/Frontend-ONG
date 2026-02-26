import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home"); // "home" no voalohany
  const [message, setMessage] = useState({ text: "", type: "success" });


  // 2. Hafatra mipoitra (Flash messages)
  const handleMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  // 3. Rehefa tafiditra (Login Success)
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard"); // Tonga dia any amin'ny Dashboard
    handleMessage("Connexion réussie !");
  };

  // 4. Rehefa mivoaka (Logout)
  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home"); // Miverina any amin'ny pejy fandraisana
  };

  // ✅ 1. RAHA DASHBOARD (Rehefa tafiditra)
  if (page === "dashboard") {
    return (
      <Dashboard
        user={user}
        setUser={setUser}
        onLogout={handleLogout}
        onGoToLogin={() => setPage("login")}
      />
    );
  }

  // ✅ 2. RAHA AUTH (Login na Register)
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

          {page === "login" ? (
            <Login
              onSwitch={() => setPage("register")}
              onLoginSuccess={handleLoginSuccess}
              onBackToHome={() => setPage("dashboard")} // Raha te hiverina Dashboard
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