import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./style.css";

export default function App() {

  const [message, setMessage] = useState({ text: "", type: "success" });


  const [page, setPage] = useState("login");

  const [user, setUser] = useState(null);

 
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("ACCESS_TOKEN");
  
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setPage("dashboard");
    } else {
      setPage("login");
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("dashboard");
    setMessage({ text: "Connexion réussie !", type: "success" });
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  const handleGoToLogin = () => {
    setPage("login");
  };

  // ✅ Dashboard
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

  // ✅ Auth pages
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">
            ONG <span>Tsinjo Aina Fianarantsoa</span>
          </h1>
          <p className="brand-description">
          "Promouvoir un développement durable et inclusif au cœur de la 
            Haute Matsiatra. Nous œuvrons pour l'épanouissement humain à travers 
            la formation, l'accompagnement et l'innovation sociale."
          </p>
          <div className="brand-footer-info">
            Région Haute Matsiatra • Madagascar
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="auth-dynamic-content">
          {message.text && (
            <div
              className={`msg-box ${
                message.type === "error" ? "msg-error" : "msg-success"
              }`}
            >
              {message.text}
            </div>
          )}

          {page === "login" ? (
            <Login
              onSwitch={() => setPage("register")}
              onLoginSuccess={handleLoginSuccess}
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