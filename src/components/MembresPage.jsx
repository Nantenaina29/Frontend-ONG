import React, { useState, useEffect } from "react";
import { FaPlus, FaFilePdf, FaEye, FaUserAlt, FaUsers, FaUser, FaHome, FaChild, FaUserTie } from "react-icons/fa";
import axiosClient from "../axiosClient.js";
import Swal from "sweetalert2";
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function MembresPage() {
  const [membres, setMembres] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [annee, setAnnee] = useState("");
  const [sexe, setSexe] = useState("Homme");
  const [chef, setChef] = useState("Non");
  const [numMenage, setNumMenage] = useState("");
  const [showSearchExportMenu, setShowSearchExportMenu] = useState(false);

  const totalMembres = membres.length;
  const isanLahy = membres.filter(m => m.sexe === "Homme" || m.sexe === "M").length;
  const isanVavy = membres.filter(m => m.sexe === "Femme" || m.sexe === "V").length;
  const totalMenage = [...new Set(membres.map(m => m.numMenage).filter(n => n))].length;
  const isanChef = membres.filter(m => m.chef === "Chef" || m.chef === "OUI").length;
  const taonaAnkehitriny = new Date().getFullYear();
  const isanTanora = membres.filter(m => {
    const taona = parseInt(m.annee);
    return m.annee && !isNaN(taona) && (taonaAnkehitriny - taona) <= 26;
  }).length;

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 30) / 2, 10, 30, 30);
      doc.setFontSize(12);
      doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 45, { align: 'center' });
      const title = "Liste des Membres";
      doc.setFontSize(11);
      doc.text(title, pageWidth / 2, 55, { align: 'center' });
      autoTable(doc, {
        head: [["N°", "Nom", "Prénom", "Sexe", "Année", "Chef", "Ménage"]],
        body: filteredMembres.map((m, index) => [
          index + 1, m.nom, m.prenom, m.sexe, m.annee, m.chef, m.numMenage
        ]),
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        styles: { fontSize: 8, halign: 'center' },
      });
      const fileName = search ? `membres_${search}.pdf` : "liste_membres.pdf";
      doc.save(fileName);
      Swal.fire("Bien!", "Exportation PDF réussie!", "success");
    } catch (error) {
      Swal.fire("Erreur", error.message, "error");
    }
  };

  const exportExcel = () => {
    const worksheetData = [
      ["N°", "Nom", "Prénom", "Sexe", "Année", "Chef", "Ménage"],
      ...filteredMembres.map((m, index) => [
        index + 1, m.nom || "", m.prenom || "", m.sexe || "", m.annee || "", m.chef || "", m.numMenage || ""
      ])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Membres_Filtres");
    const fileName = search ? `membres_${search}.xlsx` : "Liste_Membres.xlsx";
    XLSX.writeFile(workbook, fileName);
    Swal.fire("Bien!", "Exportation Excel réussie!", "success");
  };

  useEffect(() => {
    const fetchMembres = async () => {
      try {
        const res = await axiosClient.get("/api/membres");
        const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        setMembres(rawData.map(m => ({
          // TANDREMO: Ataovy azo antoka fa m.NumMembre no soratanao fa tsy m.id
          id: m.NumMembre, 
          nom: m.NomMembre || "",
          prenom: m.PrenomMembre || "",
          annee: m.AnneeNaissance || "",
          sexe: m.Sexe === "H" ? "Homme" : (m.Sexe === "V" || m.Sexe === "F" ? "Femme" : (m.Sexe || "Homme")),
          chef: m.Chef || "Non",
          numMenage: m.NumMenage || ""
        })));
      } catch (err) {
        console.error("Erreur fetch:", err);
      }
    };
    fetchMembres();
  }, []);

  const filteredMembres = membres.filter(m => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return true;

    const nom = (m.nom || "").toLowerCase();
    const prenom = (m.prenom || "").toLowerCase();
    const sexe = (m.sexe || "").toLowerCase();
    const annee = (m.annee || "").toString();
    const numMenage = (m.numMenage || "").toString();
    
    // Hamarino tsara ny "C" na "c" eto:
    const chef = (m.Chef || m.chef || "").toLowerCase().trim(); 
    
    return (
      nom.includes(searchTerm) || 
      prenom.includes(searchTerm) || 
      sexe.includes(searchTerm) || 
      annee.includes(searchTerm) || 
      numMenage.includes(searchTerm) ||
      chef.includes(searchTerm)
    );
  }).sort((a, b) => parseInt(a.numMenage || 0) - parseInt(b.numMenage || 0));
  
  const openAddModal = () => {
    setNom(""); setPrenom(""); setAnnee(""); setSexe("Homme"); setChef("Non"); setNumMenage("");
    setShowAddModal(true);
  };
  const openEditModal = (m) => {
    console.log("Donnée modifié:", m); 
    if (!m.id) {
      Swal.fire("Erreur", "Aucune ID de membre!", "error");
      return;
    }
    setCurrentId(m.id); 
    setNom(m.nom);
    setPrenom(m.prenom);
    setAnnee(m.annee);
    setSexe(m.sexe);
    setChef(m.chef);
    setNumMenage(m.numMenage);
    setShowEditModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/api/membres", {
        NomMembre: nom, PrenomMembre: prenom, AnneeNaissance: parseInt(annee), Sexe: sexe || "Homme", Chef: chef || "Non", NumMenage: parseInt(numMenage)
      });
      setMembres([...membres, {
        id: res.data.data.NumMembre, nom: res.data.data.NomMembre, prenom: res.data.data.PrenomMembre, annee: res.data.data.AnneeNaissance, sexe: res.data.data.Sexe, chef: res.data.data.Chef, numMenage: res.data.data.NumMenage
      }]);
      Swal.fire("Bien!", "Ajout d'un membre réussi.", "success");
      setShowAddModal(false);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        Swal.fire("Attention", err.response.data.message, "warning");
      } else {
        Swal.fire("Erreur", "Erreur lors de l'ajout du membre!", "error");
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!currentId) {
      Swal.fire("Erreur", "ID introuvable", "error");
      return;
    }
  
    try {
      const dataToSend = {
        NomMembre: nom,
        PrenomMembre: prenom,
        AnneeNaissance: parseInt(annee),
        Sexe: sexe,
        Chef: chef,
        NumMenage: parseInt(numMenage)
      };
  
      // Eto ilay variable 'res'
      const res = await axiosClient.put(`/api/membres/${currentId}`, dataToSend);
  
      if (res.status === 200 || res.data) {
        console.log("Response pour le serveur:", res.data);
  
        setMembres(prevMembres =>
          prevMembres.map(m =>
            m.id === currentId
              ? {
                  ...m,
                  nom: nom,
                  prenom: prenom,
                  annee: annee,
                  sexe: sexe,
                  chef: chef,
                  numMenage: numMenage
                }
              : m
          )
        );
  
        Swal.fire("Bien!", "Modification réussie.", "success");
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Erreur :", err.response?.data);
      const errorDetail = err.response?.data?.message || "Erreur de modification!";
      Swal.fire("Erreur", errorDetail, "error");
    }
  };
  const handleDelete = async (numMembre) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler"
    });
  
    if (result.isConfirmed) {
      try {
        // 1. Alefa any amin'ny Backend ny famafana (mampiasa NumMembre)
        await axiosClient.delete(`/api/membres/${numMembre}`);

        setMembres((prevMembres) => prevMembres.filter((m) => m.id !== numMembre));
  
        Swal.fire("Bien!", "Suppression réussie.", "success");
      } catch (err) {
        console.error("Erreur suppression :", err);
        Swal.fire("Erreur", "Impossible de supprimer le membre.", "error");
      }
    }
  };

  return (
    <div className="membre-page">
      <h2 className="page-title">Liste des Membres</h2>
      <div className="membre-top">
        <div className="membre-actions">
          <button className="btn-add" onClick={openAddModal}><FaPlus style={{ marginRight: "5px" }} /> Ajouter</button>
          <div className="export-container">
            <button className="btn-export" onClick={() => setShowExportMenu(!showExportMenu)}><FaFilePdf style={{ marginRight: "5px" }} /> Exporter ▾</button>
            {showExportMenu && (
              <ul className="dropdown-menu">
                <li className="dropdown-item" onClick={() => { exportPDF(); setShowExportMenu(false); }}><FaFilePdf color="#e74c3c" /> PDF</li>
                <li className="dropdown-item" onClick={() => { exportExcel(); setShowExportMenu(false); }}><span style={{ color: "#27ae60", fontWeight: "bold" }}>X</span> EXCEL</li>
              </ul>
            )}
          </div>
          <button className="btn-more" onClick={() => setShowStats(!showStats)}><FaEye /> {showStats ? "Cacher les stats" : "En voir plus"}</button>
        </div>
        <div className="search-with-export-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un membre..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="search-icon">🔍</span>
          </div>
          {search && (
            <div className="export-container" style={{ position: 'relative' }}>
              <button className="btn-export" style={{ padding: '5px 10px', fontSize: '13px', height: '35px' }} onClick={() => setShowSearchExportMenu(!showSearchExportMenu)}><FaFilePdf size={14} /> Exporter ▾</button>
              {showSearchExportMenu && (
                <ul className="dropdown-menu" style={{ top: '100%', right: 0, display: 'block' }}>
                  <li className="dropdown-item" onClick={() => { exportPDF(); setShowSearchExportMenu(false); }}><FaFilePdf color="#e74c3c" /> PDF (Résultat)</li>
                  <li className="dropdown-item" onClick={() => { exportExcel(); setShowSearchExportMenu(false); }}><span style={{ color: "#27ae60", fontWeight: "bold" }}>X</span> EXCEL (Résultat)</li>
                  <li style={{ padding: '5px 10px', fontSize: '10px', color: '#95a5a6', borderTop: '1px solid #eee' }}>{filteredMembres.length} membres trouvés</li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {showStats && (
        <div className="statistics-grid">
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #3498db' }}>
            <h4 className="stat-label">TOTAL MEMBRES</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: '#3498db' }}><FaUsers /></div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#3498db' }}>{totalMembres}</span>
                <span className="avatar-name">Membres</span>
              </div>
            </div>
          </div>
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #e74c3c' }}>
            <h4 className="stat-label">GENRE</h4>
            <div className="avatar-container">
              <div className="avatar-item">
                <div className="avatar-circle male-bg"><FaUserAlt /></div>
                <div className="avatar-info">
                  <span className="avatar-count male-text">{isanLahy}</span>
                  <span className="avatar-name">Homme</span>
                </div>
              </div>
              <div className="avatar-divider"></div>
              <div className="avatar-item">
                <div className="avatar-circle female-bg"><FaUser /></div>
                <div className="avatar-info">
                  <span className="avatar-count female-text">{isanVavy}</span>
                  <span className="avatar-name">Femme</span>
                </div>
              </div>
            </div>
          </div>
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #27ae60' }}>
            <h4 className="stat-label">MENAGES</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: '#27ae60' }}><FaHome /></div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#27ae60' }}>{totalMenage}</span>
                <span className="avatar-name">Ménages</span>
              </div>
            </div>
          </div>
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #8e44ad' }}>
            <h4 className="stat-label">JEUNES (≤26)</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: '#8e44ad' }}><FaChild /></div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#8e44ad' }}>{isanTanora}</span>
                <span className="avatar-name">Jeunes</span>
              </div>
            </div>
          </div>
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #f1c40f' }}>
            <h4 className="stat-label">CHEF DE MENAGE</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: '#f1c40f' }}><FaUserTie /></div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#f39c12' }}>{isanChef}</span>
                <span className="avatar-name">Chefs</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
      <table className="membre-table">
            <thead>
              <tr>
                <th className="col-id">N°</th>
                <th className="col-name">Nom</th>
                <th className="col-firstname">Prénom</th>
                <th className="col-sex">Sexe</th>
                <th className="col-year">Année</th>
                <th className="col-status">Chef</th>
                <th className="col-house">N° Ménage</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {filteredMembres.map((m, index) => {

                    const isChef = (m.Chef || m.chef || "").toString().trim().toLowerCase() === "chef";

                    return (
                      <tr key={m.id} className={isChef ? "row-chef" : ""}>
                        <td className="col-id">{index + 1}</td>
                        <td className="col-name">{m.nom}</td>
                        <td className="col-firstname">{m.prenom}</td>
                        <td className="col-sex">{m.sexe}</td>
                        <td className="col-year">{m.annee}</td>
                        <td className="col-status">{m.chef}</td>
                        <td className="col-house">{m.numMenage}</td>
                        <td className="col-actions">
                          <div className="action-icons">
                            <span className="icon edit" onClick={() => openEditModal(m)}>✏️</span>
                            <span className="icon delete" onClick={() => handleDelete(m.id)}>🗑️</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
          </table>
      </div>
     {/* --- MODAL AJOUT --- */}
{showAddModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Ajouter un Membre</h2>
      <form onSubmit={handleAdd} className="premium-form">
        
        {/* Andalana 1: Nom sy Prenom */}
        <div className="form-group">
          <label>Nom :</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Nom du membre" />
        </div>
        <div className="form-group">
          <label>Prénom :</label>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} required placeholder="Prénom du membre" />
        </div>

        {/* Andalana 2: Année sy Sexe */}
        <div className="form-group">
          <label>Année de naissance :</label>
          <input type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Sexe :</label>
          <select value={sexe} onChange={(e) => setSexe(e.target.value)} required>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </div>

        {/* Andalana 3: Chef sy N° Ménage */}
        <div className="form-group">
          <label>Chef :</label>
          <select value={chef} onChange={(e) => setChef(e.target.value)}>
            <option value="Non">Non</option>
            <option value="Chef">Chef</option>
          </select>
        </div>
        <div className="form-group">
          <label>N° Ménage :</label>
          <input type="number" value={numMenage} onChange={(e) => setNumMenage(e.target.value)} required />
        </div>

        {/* Ny Bokotra (grid-column: span 2 dia manery azy ho eo ambany) */}
        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
            Annuler
          </button>
          <button type="submit" className="btn-save">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
)}
     {showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Nampiana lohateny mazava kokoa */}
      <h2>Modifier les informations</h2>
      
      <form onSubmit={handleEdit} className="premium-form">
        <div className="form-grid-inner" style={{ display: 'contents' }}> 
          {/* Ny 'display: contents' dia manampy ny CSS Grid hahita ireo div ambany ireo mivantana */}
          
          <div className="form-group">
            <label>Nom :</label>
            <input 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Prénom :</label>
            <input 
              value={prenom} 
              onChange={(e) => setPrenom(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Année de naissance :</label>
            <input 
              type="number" 
              value={annee} 
              onChange={(e) => setAnnee(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Sexe :</label>
            <select value={sexe} onChange={(e) => setSexe(e.target.value)} required>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          <div className="form-group">
            <label>Chef :</label>
            <select value={chef} onChange={(e) => setChef(e.target.value)}>
              <option value="Chef">Chef</option>
              <option value="Non">Non</option>
            </select>
          </div>

          <div className="form-group">
            <label>N° Ménage :</label>
            <input 
              type="number" 
              value={numMenage} 
              onChange={(e) => setNumMenage(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="modal-buttons">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => setShowEditModal(false)}
          >
            Annuler
          </button>
          <button type="submit" className="btn-save">
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}