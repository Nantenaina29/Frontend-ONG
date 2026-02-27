import { useState } from "react";
import axiosClient from "../axiosClient";
import "../style.css";
import { FaUser, FaEnvelope, FaLock, FaKey, FaUserPlus } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function Register({ onSwitch }) {
  // Déclaration des states indispensables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validation locale
    if (!name || !email || !password || !pincode) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs incomplets',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setLoading(true);

    // 2. Affichage du chargement
    Swal.fire({
      title: 'Création du compte...',
      text: 'Veuillez patienter pendant que nous préparons votre espace.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axiosClient.post('/register', { 
        name, 
        email, 
        password, 
        pincode 
      });

      console.log('✅ REGISTER SUCCESS:', response.data);

      // 3. Notification de succès
      Swal.fire({
        icon: 'success',
        title: 'Inscription réussie !',
        text: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
        confirmButtonText: 'Aller à la connexion',
        confirmButtonColor: '#28a745',
      }).then((result) => {
        if (result.isConfirmed) {
          onSwitch(); // Retour au Login
        }
      });

    } catch (err) {
      console.error('❌ REGISTER ERROR:', err.response?.data);

      // 4. Gestion des erreurs spécifiques de Laravel
      const validationErrors = err.response?.data?.errors;
      let errorMessage = err.response?.data?.message || "Une erreur est survenue.";

      if (validationErrors) {
        // Affiche la première erreur de validation trouvée
        errorMessage = Object.values(validationErrors)[0][0];
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'inscription',
        text: errorMessage,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Réessayer'
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

      <form onSubmit={handleRegister}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="reg-name" className="input-label">Nom Complet</label>
            <div className="input-relative">
              <span className="input-icon"><FaUser /></span>
              <input 
                id="reg-name"
                name="name"
                type="text" 
                className="custom-input" 
                placeholder="Nom" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="reg-email" className="input-label">Email</label>
            <div className="input-relative">
              <span className="input-icon"><FaEnvelope /></span>
              <input 
                id="reg-email"
                name="email"
                type="email" 
                className="custom-input" 
                placeholder="Adresse email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="reg-password" className="input-label">Mot de passe</label>
            <div className="input-relative">
              <span className="input-icon"><FaLock /></span>
              <input 
                id="reg-password"
                name="password"
                type="password" 
                className="custom-input" 
                placeholder="Mot de passe" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="reg-pincode" className="input-label">Code PIN</label>
            <div className="input-relative">
              <span className="input-icon"><FaKey /></span>
              <input 
                id="reg-pincode"
                name="pincode"
                type="password" 
                className="custom-input" 
                placeholder="PIN" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)} 
                required 
              />
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