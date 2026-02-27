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

  // 1. LOGIN PRINCIPAL - AVEC DEBUG COMPLET
  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalMessage({ text: "", type: "" });
  
    if (!email || !password) {
      setLocalMessage({ text: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }
  
    setLoading(true);
    try {
      const res = await axiosClient.post('/login', { email, password });
      
      // 🔥 CHECK EXACT RESPONSE
      console.log('RESPONSE:', res.data);
      
      // Flexible structure - marche avec toutes les réponses backend
      const token = res.data.token || res.data.data?.token;
      const user = res.data.user || res.data.data?.user;
      
      if (token && user) {
        localStorage.setItem("ACCESS_TOKEN", token);
        localStorage.setItem("user", JSON.stringify(user));
        onLoginSuccess(user);  // Dashboard!
      } else {
        setLocalMessage({ text: "Login échoué - Vérifiez vos identifiants", type: "error" });
      }
    } catch (err) {
      console.error('ERROR:', err.response?.data);
      setLocalMessage({ text: "Erreur serveur", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  

  // 2. MOT DE PASSE OUBLIÉ
  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Réinitialisation',
      text: 'Entrez votre adresse email pour recevoir un nouveau mot de passe',
      input: 'email',
      inputPlaceholder: 'Votre email',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Envoyer',
      cancelButtonColor: '#d33',
      confirmButtonColor: '#10b981',
      showLoaderOnConfirm: true,
      preConfirm: async (emailValue) => {
        if (!emailValue) {
          Swal.showValidationMessage('Veuillez entrer un email valide');
          return;
        }
        try {
          await axiosClient.post('/api/forgot-password', { email: emailValue });
          return true;
        } catch (error) {
          Swal.showValidationMessage(
            `Erreur: ${error.response?.data?.message || "Impossible d'envoyer l'email"}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Succès !',
          'Un nouveau mot de passe a été envoyé à votre adresse email.',
          'success'
        );
      }
    });
  };

  return (
    <div className="form-wrapper login-v-spacer">
      {/* HEADER */}
      <div className="form-header">
        <div className="header-icon-container">
          <FaSignInAlt className="header-icon big-icon" />
        </div>
        <h2>Connexion</h2>
        <p>Accédez à votre espace de gestion administrative</p>
      </div>

      {/* MESSAGE */}
      {localMessage.text && (
        <div className={`msg-box ${localMessage.type === "error" ? "msg-error" : "msg-success"}`}>
          {localMessage.text}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleLogin} className="login-form-content">
        {/* EMAIL */}
        <div className="input-group">
          <label className="input-label">Identifiant (Email)</label>
          <div className="input-relative">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              className="custom-input"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* PASSWORD + OUBLIÉ */}
        <div className="input-group">
          <label className="input-label">Mot de passe</label>
          <div className="input-relative">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type="password"
              className="custom-input"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="forgot-password-container" style={{ textAlign: 'right', marginTop: '5px' }}>
            <span 
              className="link-forgot" 
              onClick={handleForgotPassword}
              style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}
            >
              Mot de passe oublié ?
            </span>
          </div>
        </div>

        {/* BUTTON */}
        <button type="submit" disabled={loading} className="btn-submit big-btn">
          {loading ? "En attente..." : (
            <>
              <FaSignInAlt /> <span>Se connecter</span>
            </>
          )}
        </button>
      </form>

      {/* REGISTER LINK */}
      <div className="form-footer">
        <p>
          Vous n'avez pas encore de compte ?{" "}
          <span className="link-switch" onClick={onSwitch}>
            S'inscrire ici
          </span>
        </p>
      </div>
    </div>
  );
}
