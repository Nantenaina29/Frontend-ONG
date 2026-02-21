import React from "react";
import { FaUserShield, FaQuoteLeft, FaHandHoldingHeart, FaGlobeAfrica, FaCheckCircle } from "react-icons/fa";
import "./Dashboard.css";



export default function MainPage({ onGoToLogin }) {
  return (
    <div className="home-presentation">
      <section className="hero-banner">
        <div className="hero-content">
          <FaQuoteLeft className="quote-icon" />
          <h2>Bienvenue chez ONG TSINJO AINA FIANARANTSOA</h2>
          <p className="hero-tagline">Logiciel de Gestion d'évaluation des données</p>
          
          <div className="hero-stats">
            <p>Une organisation dévouée au <strong>développement communautaire et à l'autonomisationdes foyers pour un avenir solidaire</strong>.</p>
          </div>
          <button className="hero-login-btn" onClick={onGoToLogin}>
                <FaUserShield style={{ marginRight: '8px' }} /> {/* Ity ilay icon premium */}
                Se Connecter
                </button>
        </div>
        <img src="/hero.jpg" alt="Illustration TAF" className="hero-illustration" />
      </section>

      <section className="info-grid">
        <div className="info-card highlight-green">
          <FaHandHoldingHeart className="card-icon" />
          <h3>Notre Mission</h3>
          <p>Développement humain durable, autopromotion des communautés, protection de l’environnement</p>
        </div>
        <div className="info-card highlight-blue">
          <FaGlobeAfrica className="card-icon" />
          <h3>Notre Vision</h3>
          <p>Citoyen responsable, prenant en main son développement, vivant en harmonie dans une société équitable.</p>
        </div>
        <div className="info-card highlight-green">
          <FaCheckCircle className="card-icon" />
          <h3>Nos Valeurs</h3>
          <p>Développement par l’effort propre, ne laissant personne de côté, sans aucune discrimination</p>
        </div>
      </section>
    </div>
  );
}