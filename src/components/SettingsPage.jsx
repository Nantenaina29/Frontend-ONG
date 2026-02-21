import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaCamera, FaCheckCircle, FaSave } from "react-icons/fa";
import axiosClient from "../axiosClient";
import Swal from "sweetalert2";
import "./SettingsPage.css";

export default function SettingsPage({ user , setUser}) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // State ho an'ny mombamomba (Profile)
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // State ho an'ny teny miafina (Password)
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // 1. Fanovana ny Mombamomba
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
  
    // 1. Mampiseho ny Loading avy hatrany
    Swal.fire({
      title: "Mise à jour en cours...",
      text: "Veuillez patienter pendant l'enregistrement de vos informations.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    setProfileLoading(true);
  
    try {
      // 2. Miantso ny API
      const response = await axiosClient.post("/api/update-profile", profile);
  
      if (response.data && (response.data.status === 'success' || response.status === 200)) {
        
        const updatedUser = response.data.user;
  
        // --- ETO NO MANERY NY RAFITRA HIANDRY 5 SEGONDRA ---
        setTimeout(() => {
          
          // 3. Vaovaozy ny Navbar (State Global)
          if (setUser) {
            setUser(updatedUser);
          }
  
          // 4. Tehirizina ao amin'ny LocalStorage
          localStorage.setItem("user", JSON.stringify(updatedUser));
  
          // 5. MESSAGE FAHOMBIAZANA (Mipoitra aorian'ny 5 segondra)
          Swal.fire({
            icon: "success",
            title: "Profil mis à jour",
            text: "Vos informations ont été modifiées avec succès.",
            confirmButtonColor: "#10b981",
            timer: 2000, 
            showConfirmButton: false
          });
  
          setProfileLoading(false);
        }, 5000); // 5000ms = 5 segondra
  
      } else {
        throw new Error("Erreur de validation");
      }
  
    } catch (err) {
      console.error("Update error:", err);
      setProfileLoading(false);
  
      const errorMsg = err.response?.data?.message || "Impossible de mettre à jour le profil";
      
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMsg,
        confirmButtonColor: "#ef4444"
      });
    }
  };

  // 2. Fanovana ny Teny miafina
  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    // 1. Fanamarinana mialoha
    if (passwords.new_password !== passwords.new_password_confirmation) {
      return Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Les nouveaux mots de passe ne correspondent pas",
        confirmButtonColor: "#ef4444",
      });
    }
  
    // 2. Mampiseho ny Loading
    Swal.fire({
      title: "Modification en cours...",
      text: "Le système met à jour votre mot de passe, veuillez patienter...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(); 
      },
    });
  
    setLoading(true);
  
    try {
      // 3. MIANDRY NY API SY NY 5 SEGONDRA (Parallel)
      // Ity 'Promise.all' ity no miantoka fa tsy maintsy mipoitra ny message faharoa
      const [response] = await Promise.all([
        axiosClient.post("/api/change-password", passwords),
        new Promise((resolve) => setTimeout(resolve, 5000)) // Manery azy hiandry 5s
      ]);
  
      // 4. ASEHOY NY MESSAGE FAHOMBIAZANA (Aorian'ny 5 segondra)
      // Na inona na inona status (success na 200), dia mampiseho confirmation isika eto
      if (response.status === 200 || response.data.status === 'success') {
        
        await Swal.fire({
          icon: "success",
          title: "Mot de passe modifié",
          text: "Votre mot de passe a été modifié avec succès.",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false
        });
  
        // Diovina ny form
        setPasswords({ 
          current_password: "", 
          new_password: "", 
          new_password_confirmation: "" 
        });
      }
  
    } catch (error) {
      console.error("Password Update Error:", error);
      
      // 5. MESSAGE ERREUR (Mipoitra avy hatrany raha misy diso)
      const errorMsg = error.response?.data?.message || "Une erreur est survenue lors de la modification.";
      
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMsg,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    Swal.fire({
      title: "Eo am-panavaozana...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  
    const formData = new FormData();
    formData.append("photo", file);
  
    try {
      const response = await axiosClient.post('/api/update-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      if (response.data.status === 'success') {
        // 1. Manampy dikan-teny (version) mba tsy ho voan'ny cache
        const saryVaovao = `${response.data.user.photo}?v=${new Date().getTime()}`;
  
        // 2. Preloading: Miandry ny sary ho vonona ao amin'ny fitadidiana
        const img = new Image();
        img.src = saryVaovao;
        
        img.onload = () => {
          // 3. IZAO NO HANITSY NY NAVBAR EO NO HO EO
          if (setUser) {
            setUser({ ...response.data.user, photo: saryVaovao });
          }
          
          // 4. Hanavao ny sary eo amin'ny Settings koa
          setProfile(prev => ({ ...prev, photo: saryVaovao }));
  
          Swal.fire({
            icon: "success",
            title: "Photo changé!",
            text: "Changement de photo réussie.",
            timer: 1500,
            showConfirmButton: false
          });
        };
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Erreur", "Erreur de changement", "error");
    }
  };
  
  return (
    <div className="settings-ultra-wrapper">
      <div className="settings-main-content">
        
        {/* CARD 1: TITRE & LOGO */}
        <div className="settings-card-premium">
          <div className="card-inner-header mainty-foana">
            <h2>Paramètres du Compte</h2>
            <p>Gérez vos informations personnelles et la sécurité de votre accès.</p>
          </div>
          <div className="logo-section">
            <img src="/Logo.jpg" alt="Logo" className="app-logo-premium" />
          </div>
        </div>
  
        {/* CARD 2: INFORMATIONS PERSONNELLES */}
        <div className="settings-card-premium">
          <div className="card-inner-header-with-icon">
            <FaUser className="card-icon" />
            <h3>Informations Personnelles</h3>
          </div>
  
              <div className="avatar-section-premium">
              <div className="avatar-ring">
                <img src={user?.photo || "/default-avatar.png"} alt="avatar" />
                <label htmlFor="photo-input" className="camera-overlay">
                  <FaCamera />
                  <input type="file" id="photo-input" hidden onChange={handlePhotoChange} />
                </label>
              </div>
            </div>
  
          <form onSubmit={handleUpdateProfile} className="form-premium">
            <div className="field-group">
              <label>Nom complet</label>
              <div className="field-input">
                <FaUser className="field-icon" />
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
            </div>
            <div className="field-group">
              <label>Email</label>
              <div className="field-input">
                <FaEnvelope className="field-icon" />
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-action-premium" disabled={profileLoading}>
              <FaSave /> {profileLoading ? "..." : "Enregistrer"}
            </button>
          </form>
        </div>
  
        {/* CARD 3: SÉCURITÉ */}
        <div className="settings-card-premium">
        <div className="card-inner-header-with-icon">
            <FaLock className="card-icon" />
            <div className="header-text-stack">
              <h3>Sécurité & Mot de passe</h3>
              {/* Ity ilay paragraphe nampiana */}
              <p className="card-description-premium">
                Modifiez votre mot de passe pour assurer la protection de votre compte.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleChangePassword} className="form-premium">
            <div className="field-group">
              <label>Mot de passe actuel</label>
              <div className="field-input">
                <FaLock className="field-icon" />
                <input type="password" required value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
            <div className="field-group">
              <label>Nouveau mot de passe</label>
              <div className="field-input">
                <FaLock className="field-icon" />
                <input type="password" required value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="Minimum 6 caractères" />
              </div>
            </div>
            <div className="field-group">
              <label>Confirmation de mot de passe</label>
              <div className="field-input">
                <FaCheckCircle className="field-icon" />
                <input type="password" required value={passwords.new_password_confirmation} onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="btn-action-premium" disabled={loading}>
              {loading ? "..." : "Mettre à jour"}
            </button>
          </form>
        </div>
  
      </div>
    </div>
  );
}