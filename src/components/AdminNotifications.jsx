import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { FaTrash, FaEdit, FaExclamationCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Notifications.css";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosClient.get("/api/notifications");
        const dataToSet = response.data.data || response.data;
        
        if (Array.isArray(dataToSet)) {
          setNotifications(dataToSet);
        } else {
          console.error("Les données reçues ne sont pas un tableau:", dataToSet);
        }
      } catch (err) {
        console.error("Erreur de l'API:", err);
      }
    };
  
    fetchNotifications();
  }, []); 
  
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: 'Voulez-vous supprimer cette notification ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
    });

    if (res.isConfirmed) {
      try {
        await axiosClient.delete(`/api/notifications/${id}`);
        setNotifications(notifications.filter(n => n.id !== id));
        Swal.fire('Supprimé !', 'La notification a été supprimée.', 'success');
      } catch (err) {
        console.error("Erreur suppression:", err);
        Swal.fire('Erreur', 'Impossible de supprimer la notification.', 'error');
      }
    }
  };

  return (
    <section className="notif-section">
      <div className="notif-container">
        {notifications.length > 0 ? (
          <div className="notif-card">
            {/* HEADER */}
            <div className="notif-header">
              <h2>
                <FaExclamationCircle />
                Journal des Notifications - Administration
              </h2>
            </div>
  
            {/* LISTE DES NOTIFICATIONS */}
            <div className="notif-list">
              {notifications.map((n, index) => (
                <div key={n.id || index} className="notif-item-premium">
                  {/* Bokotra Delete */}
                  <button 
                    className="delete-icon-btn" 
                    onClick={() => handleDelete(n.id)}
                    title="Supprimer la notification"
                  >
                    <FaTrash className="trash-icon" />
                  </button>
  
                  {/* Icon Action (Sary kely miankina amin'ny SUPPRESSION na MODIFICATION) */}
                  <div className={`action-icon ${n.action === 'SUPPRESSION' ? 'red' : 'orange'}`}>
                    {n.action === 'SUPPRESSION' ? <FaExclamationCircle /> : <FaEdit />}
                  </div>
  
                  {/* Info Detail */}
                  <div className="notif-info">
                    <div className="notif-row">
                      <span className="user-name">
                        {n.user?.name || "Utilisateur inconnu"}
                      </span>
                      <span className="notif-time">
                        {new Date(n.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    
                    <p className="notif-desc">
                      Action de <strong className={n.action === 'SUPPRESSION' ? 'text-red' : 'text-orange'}>
                        {n.action}
                      </strong> 
                      {" sur la table "} 
                      <strong className="table-name-text">{n.table_name}</strong> : 
                      <span className="details-text">{n.details}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ) : (
          /* REHEFA BANGA NY LISTE */
          <div className="empty-view">
            <div className="empty-icon-circle">
              <FaExclamationCircle />
            </div>
            <p className="empty-title">Aucune notification actuellement.</p>
            <p className="empty-subtitle">Votre journal est à jour.</p>
          </div>
        )}
      </div>
    </section>
  );
}