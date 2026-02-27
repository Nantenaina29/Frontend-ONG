import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import MainPage from "./components/MainPage";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  // Jereo raha efa tao amin'ny Dashboard izy teo aloha
  const [page, setPage] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? "dashboard" : "home";
  });

  const [message, setMessage] = useState({ text: "", type: "success" });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard"); 
  };

  const handleLogout = () => {
    localStorage.clear(); // Fafao daholo mba hadio
    setUser(null);
    setPage("home");
  };

  if (page === "dashboard" && user) {
    return <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />;
  }

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