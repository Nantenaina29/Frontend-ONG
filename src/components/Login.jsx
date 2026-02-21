import { useState } from "react";
import axiosClient from "../axiosClient";
import "../style.css";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import Swal from 'sweetalert2'; // Aza hadino ny nanafatra ity

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
      await axiosClient.get("/sanctum/csrf-cookie");
      const res = await axiosClient.post("/api/login", { email, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      onLoginSuccess(res.data.user);
    } catch (err) {
      setLocalMessage({ 
        text: err.response?.data?.message || "Erreur lors de la connexion !", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Réinitialisation',
      text: 'Entrez votre adresse email pour recevoir un nouveau mot de passe',
      input: 'email',
      inputPlaceholder: 'Votre email',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      preConfirm: async (emailValue) => {
        try {
          // Appel API vers votre Backend PHP/Laravel
          const response = await axiosClient.post('/api/forgot-password', { email: emailValue });
          return response.data;
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
      <div className="form-header">
        <div className="header-icon-container">
           <FaSignInAlt className="header-icon big-icon" />
        </div>
        <h2>Connexion</h2>
        <p>Accédez à votre espace de gestion administrative</p>
      </div>

      {localMessage.text && (
        <div className={`msg-box ${localMessage.type === "error" ? "msg-error" : "msg-success"}`}>
          {localMessage.text}
        </div>
      )}

      <form onSubmit={handleLogin} className="login-form-content">
        {/* INPUT EMAIL */}
        <div className="input-group">
          <label className="input-label">Identifiant (Email)</label>
          <div className="input-relative">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              className="custom-input"
              placeholder="admin@taf.mg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* INPUT PASSWORD */}
        <div className="input-group">
          <label className="input-label">Mot de passe</label>
          <div className="input-relative">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type="password"
              className="custom-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* LIEN MOT DE PASSE OUBLIE */}
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

        <button type="submit" disabled={loading} className="btn-submit big-btn">
          {loading ? "En attente..." : (
            <>
              <FaSignInAlt /> <span>Se connecter </span>
            </>
          )}
        </button>
      </form>

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