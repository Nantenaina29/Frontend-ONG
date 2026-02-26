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

      if (res.data.status === 'success' && res.data.token) {

        localStorage.setItem("ACCESS_TOKEN", res.data.token);

        console.log('✅ Tafiditra ny mpampiasa:', res.data.user.name);

        onLoginSuccess(res.data.user); 
        
      } else {
        setLocalMessage({ text: "Erreur d'authentification inconnue.", type: "error" });
      }

    } catch (err) {
      console.error('❌ Erreur de connexion:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || "Email ou mot de passe incorrect!";
      
      setLocalMessage({ 
        text: errorMessage, 
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
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Envoyer',  
      cancelButtonColor: '#d33',
      confirmButtonColor: '#10b981',
      showLoaderOnConfirm: true,
      preConfirm: async (emailValue) => {
        try {
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
              placeholder="Adresse email"
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
              placeholder="Mot de passe"
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