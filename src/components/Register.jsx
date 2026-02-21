import { useState } from "react";
import axiosClient from "../axiosClient";
import "../style.css";
import { FaUser, FaEnvelope, FaLock, FaKey, FaUserPlus } from "react-icons/fa";

export default function Register({ onMessage, onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState({ text: "", type: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalMessage({ text: "", type: "" });

    if (!name || !email || !password || !pincode) {
      setLocalMessage({ text: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await axiosClient.get("/sanctum/csrf-cookie");
      await axiosClient.post("/api/register", { name, email, password, pincode });
      onMessage("Compte créé avec succès ! Connectez-vous.", "success");
      onSwitch();
    } catch (err) {
      setLocalMessage({ 
        text: err.response?.data?.message || "Erreur lors de l'inscription !", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper register-wrapper">
      <div className="form-header">
        <h2><FaUserPlus className="header-icon" /> Inscription</h2>
        <p>Créez votre accès administratif</p>
      </div>

      {localMessage.text && (
        <div className={`msg-box ${localMessage.type === "error" ? "msg-error" : "msg-success"}`}>
          {localMessage.text}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Nom Complet</label>
            <div className="input-relative">
              <span className="input-icon"><FaUser /></span>
              <input type="text" className="custom-input" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-relative">
              <span className="input-icon"><FaEnvelope /></span>
              <input type="email" className="custom-input" placeholder="admin@taf.mg" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Mot de passe</label>
            <div className="input-relative">
              <span className="input-icon"><FaLock /></span>
              <input type="password" className="custom-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Code PIN</label>
            <div className="input-relative">
              <span className="input-icon"><FaKey /></span>
              <input type="password" className="custom-input" placeholder="PIN" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "En cours..." : "S'inscrire"}
        </button>
      </form>

      <div className="form-footer">
        <p>Déjà un compte? <span onClick={onSwitch} className="link-switch">Se connecter</span></p>
      </div>
    </div>
  );
}