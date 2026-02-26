import { useState } from "react";
import axiosClient from "../axiosClient";
import "../style.css";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function Login({ onSwitch, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState({ text: "", type: "" });

  // 1. Lojika ho an'ny fidirana (Login)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalMessage({ text: "", type: "" });

    if (!email || !password) {
      setLocalMessage({ text: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Mandefa fangatahana any amin'ny Backend
      const res = await axiosClient.post('/login', { email, password });

      if (res.data.token) {
        localStorage.setItem("ACCESS_TOKEN", res.data.token);
        // Alefa any amin'ny App.jsx ny angon'ny mpampiasa
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setLocalMessage({ 
        text: err.response?.data?.message || "Identifiants incorrects ou erreur serveur.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Lojika ho an'ny Mot de passe oublié
  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Réinitialisation',
      text: 'Entrez votre email pour recevoir un nouveau mot de passe',
      input: 'email',
      inputPlaceholder: 'Votre email',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      preConfirm: async (emailValue) => {
        try {
          // Tandremo ny path eto: raha efa misy /api ny axiosClient dia '/forgot-password' fotsiny
          const response = await axiosClient.post('/forgot-password', { email: emailValue });
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(
            `Erreur: ${error.response?.data?.message || "Email non trouvé"}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Succès !', 'Vérifiez votre boîte mail.', 'success');
      }
    });
  };

  return (
    <div className="form-wrapper login-v-spacer">
      <div className="form-header">
        <div className="header-icon-container">
           <FaSignInAlt className="header-icon big-icon" />
        </div>
        <h2>Connexion</h2>
        <p>Espace de gestion ONG TAF</p>
      </div>

      {localMessage.text && (
        <div className={`msg-box ${localMessage.type === "error" ? "msg-error" : "msg-success"}`}>
          {localMessage.text}
        </div>
      )}

      <form onSubmit={handleLogin} className="login-form-content">
        <div className="input-group">
          <label className="input-label">Email</label>
          <div className="input-relative">
            <span className="input-icon"><FaEnvelope /></span>
            <input
              type="email"
              className="custom-input"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Mot de passe</label>
          <div className="input-relative">
            <span className="input-icon"><FaLock /></span>
            <input
              type="password"
              className="custom-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-password-container" style={{ textAlign: 'right', marginTop: '8px' }}>
            <span className="link-forgot" onClick={handleForgotPassword} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
              Mot de passe oublié ?
            </span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-submit big-btn">
          {loading ? "Chargement..." : "Se connecter"}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Nouveau membre ?{" "}
          <span className="link-switch" onClick={onSwitch} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            S'inscrire
          </span>
        </p>
      </div>
    </div>
  );
}