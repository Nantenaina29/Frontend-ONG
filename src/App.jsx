import { useState, useEffect } from "react";
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

  const [page, setPage] = useState("home"); 
  const [message, setMessage] = useState({ text: "", type: "success" });

  useEffect(() => {
    window.location.hash = page;
  }, [page]);

    const handleLoginSuccess = (userData) => {
      try {
        // 1. Sauvegarde des données utilisateur
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        
        // 2. Changement de page vers le tableau de bord
        setPage("dashboard");
        
        // 3. Message de confirmation
        setMessage({ text: "Connexion réussie ! Redirection en cours...", type: "success" });
        
        console.log("Succès : Redirection vers le tableau de bord...");

        // Nettoyage du message après 3 secondes
        setTimeout(() => {
          setMessage({ text: "", type: "success" });
        }, 3000);

      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        setMessage({ text: "Une erreur est survenue lors de la redirection.", type: "error" });
      }
    };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  // ==========================================
  // 1. LOJIKA HO AN'NY DASHBOARD IRERY
  // ==========================================
  if (page === "dashboard") {
    return (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // ==========================================
  // 2. LOJIKA HO AN'NY PEJY HAFA (Home, Login, Register)
  // ==========================================
  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-content">
          <img src="/Logo TAF 3D.png" alt="Logo TAF3D" className="brand-logo" />
          <h1 className="brand-title">ONG <span>Tsinjo Aina Fianarantsoa</span></h1>
          <p className="brand-description">"Promouvoir un développement durable..."</p>
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

          {/* Eto dia fepetra tsotra sisa: Home, Login, na Register */}
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