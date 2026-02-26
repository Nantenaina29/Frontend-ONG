import React, { useState } from "react"; // Nesoriko ny useEffect eto satria tsy ilaina intsony
import "./Dashboard.css";
import { 
  FaUsers, FaLayerGroup, FaNetworkWired, FaUserShield, 
  FaChalkboardTeacher, FaChartBar, FaSignOutAlt, FaBell, FaTrash,
  FaSun, FaMoon, FaCog, FaUserCircle 
} from "react-icons/fa";

import MainPage from "./MainPage";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import MembresPage from "./MembresPage";
import GSPage from "./GSPage";
import ReseauPage from "./ReseauPage";
import ResponsablePage from "./ResponsablePage";
import FormationPage from "./FormationPage";
import StatistiquePage from "./StatistiquePage";
import AdminNotifications from "./AdminNotifications";
import TrashPage from "./TrashPage";
import SettingsPage from "./SettingsPage";

export default function Dashboard({ user, setUser, onLogout, onGoToLogin }) {

  const [activePage, setActivePage] = useState(user ? "statistiques" : "home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);


  const handleConfirmLogout = () => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous allez être redirigé vers la page d'accueil.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      reverseButtons: true 
    }).then((result) => {
      if (result.isConfirmed) {
        setActivePage("home");    
        onLogout();
      }
    });
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSidebarItemClick = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const isLandingPage = activePage === "home";

  return (
    <div className={`dashboard-container ${darkMode ? "dark-theme" : ""}`}>
      
      {!isLandingPage && (
        <nav className="top-navbar">
          <div className="nav-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <div className="brand-group">
              <img src="/Logo.jpg" alt="Logo" className="nav-logo" />
              <h1 className="nav-title">ONG <span>TSINJO AINA FIANARANTSOA</span></h1>
            </div>
          </div>
          
          <div className="nav-right">
            <div className="user-profile-section">
            <div className="avatar-wrapper">
              {user?.photo ? (
                <img 
                  key={user.photo}
                  src={`${user.photo}${user.photo.includes('?') ? '&' : '?'}t=${new Date().getTime()}`} 
                  alt="Profil" 
                  className="user-avatar" 
                />
              ) : (
                <FaUserCircle className="user-avatar-placeholder" />
              )}
            </div>
              <div className="user-info">
                <span className="user-name">{user?.name }</span>
              </div>
            </div>

            <button 
            className="nav-icon-btn" 
            title="Paramètres"
            onClick={() => setActivePage("settings")} 
          >
            <FaCog className={`settings-icon ${activePage === "settings" ? "active-icon" : ""}`} />
          </button>

            <button className="nav-icon-btn" onClick={toggleDarkMode} title="Changer le mode">
              {darkMode ? <FaSun className="theme-icon sun" /> : <FaMoon className="theme-icon moon" />}
            </button>

            <button 
              className="nav-icon-btn logout-nav-btn" 
              onClick={(e) => {
                e.stopPropagation(); 
                handleConfirmLogout();
              }}
              title="Déconnexion"
            >
              <FaSignOutAlt />
            </button>
            </div>
        </nav>
      )}

      <div className="main-wrapper">
        {!isLandingPage && user && (
          <aside className={`main-sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <ul className="nav-menu">
            <li className={activePage === "statistiques" ? "active" : ""} onClick={() => handleSidebarItemClick("statistiques")}>
                <FaChartBar className="icon" /> <span>Tableau de bord</span>
              </li>
              <li className={activePage === "membres" ? "active" : ""} onClick={() => handleSidebarItemClick("membres")}>
                <FaUsers className="icon" /> <span>Membres</span>
              </li>
              <li className={activePage === "gs" ? "active" : ""} onClick={() => handleSidebarItemClick("gs")}>
                <FaLayerGroup className="icon" /> <span>Groupes Solidarités</span>
              </li>
              <li className={activePage === "reseau" ? "active" : ""} onClick={() => handleSidebarItemClick("reseau")}>
                <FaNetworkWired className="icon" /> <span>Réseaux</span>
              </li>
              <li className={activePage === "responsable" ? "active" : ""} onClick={() => handleSidebarItemClick("responsable")}>
                <FaUserShield className="icon" /> <span>Responsables</span>
              </li>
              <li className={activePage === "formation" ? "active" : ""} onClick={() => handleSidebarItemClick("formation")}>
                <FaChalkboardTeacher className="icon" /> <span>Formations</span>
              </li>


              {user?.role === "admin" && (
                <>
                  <li className={activePage === "notifications" ? "active" : ""} onClick={() => handleSidebarItemClick("notifications")}>
                    <FaBell className="icon" /> <span>Notifications</span>
                  </li>
                  <li className={activePage === "trash" ? "active" : ""} onClick={() => handleSidebarItemClick("trash")}>
                    <FaTrash className="icon" /> <span>Corbeille</span>
                  </li>
                </>
              )}
            </ul>
          </aside>
        )}

        <main className={isLandingPage ? "main-content-landing" : "main-content"}>
          <div className="page-renderer">
            {(() => {
              switch (activePage) {
                case "home":
                  return <MainPage user={user} onGoToLogin={onGoToLogin} />;
                case "membres":
                  return <MembresPage />;
                case "gs":
                  return <GSPage />;
                case "reseau":
                  return <ReseauPage />;
                case "responsable":
                  return <ResponsablePage />;
                case "formation":
                  return <FormationPage />;
                case "statistiques":
                  return <StatistiquePage />;
                  case "settings": 
                  return <SettingsPage user={user} setUser={setUser} />;
                case "trash":
                  return <TrashPage />;
                case "notifications":
                  return user?.role === "admin" ? <AdminNotifications /> : <div className="access-denied">Accès Refusé</div>;
                default:
                  return user ? <StatistiquePage /> : <MainPage user={user} onGoToLogin={onGoToLogin} />;
              }
            })()}
          </div>

          {!isLandingPage && (
            <footer className="main-footer">
              © {new Date().getFullYear()} ONG TSINJO AINA FIANARANTSOA - Système de Gestion Intégrée
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}