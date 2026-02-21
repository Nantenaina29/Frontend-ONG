import React, { useState, useEffect } from "react";
import { FaFilePdf, FaEye, FaEdit,  FaDownload, FaFileExcel, FaUserShield, FaBriefcase, FaObjectGroup, FaPercentage } from "react-icons/fa"; 
import axiosClient from "../axiosClient";
import Swal from "sweetalert2";
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


export default function ResponsablePage() {
  const [search, setSearch] = useState("");
  const [responsables, setResponsables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRespo, setSelectedRespo] = useState(null);
  const [newPoste, setNewPoste] = useState("");

  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- STATES VAOVAO ---
const [showStats, setShowStats] = useState(false);

// --- KAJY STATISTIQUES ---
const totalResponsables = responsables.length;
const totalBureau = responsables.filter(r => 
  ["Président(e)", "Secrétaire", "Trésorier(e)"].includes(r.Poste || r.poste)
).length;
const totalGSWithRespo = [...new Set(responsables.map(r => r.NomGS || r.nomgs))].filter(Boolean).length;
const tauxCouverture = totalResponsables > 0 ? ((totalBureau / totalResponsables) * 100).toFixed(0) : 0;

// --- EXPORT PDF VEHIVAVY BIRAO VAOVAO ---
const exportFemmesBureauPDF = async () => {
  try {
    // 1. Alaina avy any amin'ny Controller ilay data sivanina
    const response = await axiosClient.get("/api/femmes-bureau");
    const data = response.data;

    if (data.length === 0) {
      Swal.fire("Info", "Aucune femme au membre de bureau.", "info");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 2. Entête (Logo + Lohateny)
    doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 25) / 2, 10, 25, 25);
    doc.setFontSize(14);
    doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 45, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(183, 28, 28); // Loko mena antitra kely
    doc.text("Liste des femmes au membre de bureau", pageWidth / 2, 53, { align: "center" });

    // 3. Fiomanana ny tabilao (Manitsy ny accent avy amin'ny DB)
    const tableRows = data.map((item, index) => [
      index + 1,
      item.Nom || "---",
      item.Prenom || "---",
      item.NomGS || "---",
      (item.Poste || "").replace(/Ú/g, 'é')
    ]);

    // 4. Famokarana ny tabilao
    autoTable(doc, {
      head: [["N°", "Nom", "Prénom", "GS", "Poste"]],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [192, 57, 43] },
      styles: { fontSize: 10, halign: 'center' }
    });

    doc.save("Femmes_Bureau_TsinjoAina.pdf");
    Swal.fire("Bien!", "PDF avec succès!", "success");

  } catch (error) {
    // fakana ny antsipirian'ny fahadisoana
    const status = error.response ? error.response.status : "Tsy fantatra";
    const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message;

    console.error("Détails de l'erreur PDF:", error.response);

    Swal.fire({
      icon: "error",
      title: "Erreur de la récupération des données ",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Antony:</strong> ${errorDetail}</p>
        </div>
      `,
      confirmButtonText: "OK"
    });
  }
};

  // --- EXPORT PDF ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF(); 
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 30) / 2, 10, 30, 30);

      doc.setFontSize(14);
      doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 50, { align: "center" }); 
      
      doc.setFontSize(11);
      doc.text("Liste des Responsables", pageWidth / 2, 57, { align: "center" });

      // 3. Fiomanana ny Data
      const tableColumn = ["N°", "Nom", "Prénom","Sexe", "GS", "Poste"];
      const tableRows = filteredData.map((r, index) => [
        index + 1,
        r.Nom || r.nom || r.NomMembre || "---",
        r.Prenom || r.prenom || r.PrenomMembre || "---",
        r.Sexe || "---",
        r.NomGS || r.nomgs || "Aucun GS",
        r.Poste || r.poste || "Aucun poste"
      ]);

      // 4. Tabilao
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        // startY natao 65 mba tsy hikasika ny lohateny
        startY: 65, 
        theme: 'grid',
        styles: { 
          fontSize: 11,
          halign: 'center',
          valign: 'middle',
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [41, 128, 185], 
          fontSize: 11 
        }
      });

      doc.save("Liste_Responsables.pdf");
      Swal.fire("Bien!", "PDF généré avec succès!", "success");
    } catch (error) {
      Swal.fire("Erreur", "Erreur d'exporter un PDF: " + error.message, "error");
    }
  };

  // --- EXPORT EXCEL ---
  const exportExcel = () => {
    const worksheetData = [
      ["N°", "Nom", "Prénom","Sexe", "GS", "Poste"],
      ...filteredData.map((r, index) => [
        index + 1,
        r.Nom || r.nom || r.NomMembre || "---",
        r.Prenom || r.prenom || r.PrenomMembre || "---",
        r.Sexe || "---",
        r.NomGS || r.nomgs || "Aucun GS",
        r.Poste || r.poste || "Aucun poste"
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responsables");
    XLSX.writeFile(workbook, "Liste_Responsables.xlsx");
    
    Swal.fire("Bien!", "Excel exporté avec succès!", "success");
  };

  useEffect(() => {
    const fetchResponsables = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await axiosClient.get("/api/responsables", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setResponsables(response.data);
      } catch (error) {
        console.error("Erreur:", error);
        if (error.response?.status === 401) {
           Swal.fire("Session expiré", "Entrez-vous une fois", "warning");
        }
      }
    };
    fetchResponsables();
  }, []);

  // 2. Filtre ho an'ny fikarohana
  const filteredData = (responsables || []).filter((r) => {
  const nom = (r.Nom || r.nom || r.NomMembre || "").toString().toLowerCase();
  const prenom = (r.Prenom || r.prenom || r.PrenomMembre || "").toString().toLowerCase();
  const sexe = (r.Sexe || "").toLowerCase();
  const searchLower = search.toLowerCase();

  return nom.includes(searchLower) || prenom.includes(searchLower) || sexe.startsWith(searchLower);
});

  // 3. Rehefa hanova Poste
  const handleEdit = (respo) => {
    console.log("Ouvert modal pour:", respo.Nom); // Debug
    setSelectedRespo(respo);
    setNewPoste(respo.Poste || "");
    setShowModal(true); 
  };

  const handleUpdate = async () => {
    if (!selectedRespo) return;

    try {
        await axiosClient.put(`http://localhost:8000/api/responsables/${selectedRespo.CodeRespo}`, {
            Poste: newPoste
        });

        // Tsy mila miantso fetchResponsables() intsony
        const updatedList = responsables.map((r) => {
            if (r.CodeRespo === selectedRespo.CodeRespo) {
                return { ...r, Poste: newPoste }; // Ovaina ny poste an'ilay olona vao novaina
            }
            return r;
        });

        setResponsables(updatedList); // Havaozina ny tabilao eo no ho eo

        Swal.fire("Bien!", "Modification réussie.", "success");
        setShowModal(false);
        
    } catch (error) {
        console.error("Update error:", error);
        Swal.fire("Erreur", "Erreur de modification!", "error");
    }
};

  return (
    <div className="membre-page">
      <h2 className="page-title">Liste des Responsables</h2>

      <div className="membre-top">
        <div className="membre-actions">
          {/* Esorina eto ny bokotra Ajouter satria efa mandeha ho azy avy any amin'ny Membre */}
          <div className="export-container" style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="btn-export" 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <FaDownload style={{ marginRight: "5px" }} /> Exporter ▾
              </button>

              {/* ITY NO AMPAHANY SOLOINA NA AMPINA */}
              {showExportMenu && (
                <ul className="dropdown-menu" style={{ position: 'absolute', zIndex: 1000, background: 'white', border: '1px solid #ccc', borderRadius: '4px', listStyle: 'none', padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <li className="dropdown-item" onClick={() => { exportPDF(); setShowExportMenu(false); }} style={{ cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <FaFilePdf color="#e74c3c" style={{ marginRight: "8px" }} /> PDF (Global)
                  </li>
                  
                  {/* ITEM VAOVAO: FEMMES BUREAU */}
                  <li className="dropdown-item" onClick={() => { exportFemmesBureauPDF(); setShowExportMenu(false); }} style={{ cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <FaFilePdf color="#9b59b6" style={{ marginRight: "8px" }} /> Femmes Bureau (PDF)
                  </li>
                  
                  <li className="dropdown-item" onClick={() => { exportExcel(); setShowExportMenu(false); }} style={{ cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <FaFileExcel color="#27ae60" style={{ marginRight: "8px" }} /> EXCEL
                  </li>
                </ul>
              )}
            </div>
          <button className="btn-more" onClick={() => setShowStats(!showStats)}>
            <FaEye style={{ marginRight: "5px" }} /> {showStats ? "Cacher les stats" : "En voir plus"}
          </button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {showStats && (
  <div className="statistics-grid">
    
    {/* 1. TOTAL RESPONSABLES */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #2c3e50' }}>
      <h4 className="stat-label">TOTAL RESPONSABLES</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)' }}>
          <FaUserShield />
        </div>
        <div className="avatar-info">
          <span className="avatar-count" style={{ color: '#2c3e50' }}>{totalResponsables}</span>
          <span className="avatar-name">Responsables</span>
        </div>
      </div>
    </div>

    {/* 2. MEMBRES DU BUREAU */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #f1c40f' }}>
      <h4 className="stat-label">MEMBRES DU BUREAU</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #f1c40f, #f39c12)' }}>
          <FaBriefcase />
        </div>
        <div className="avatar-info">
          <span className="avatar-count" style={{ color: '#f39c12' }}>{totalBureau}</span>
          <span className="avatar-name">Pres / Sec / Trés</span>
        </div>
      </div>
    </div>

    {/* 3. GS COUVERTS */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #8e44ad' }}>
      <h4 className="stat-label">GS COUVERTS</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)' }}>
          <FaObjectGroup />
        </div>
        <div className="avatar-info">
          <span className="avatar-count" style={{ color: '#8e44ad' }}>{totalGSWithRespo}</span>
          <span className="avatar-name">Ayant de responsable</span>
        </div>
      </div>
    </div>

    {/* 4. TAUX DE COUVERTURE */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #27ae60' }}>
      <h4 className="stat-label">TAUX DE COUVERTURE</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}>
          <FaPercentage />
        </div>
        <div className="avatar-info" style={{ width: '100%' }}>
          <span className="avatar-count" style={{ color: '#27ae60' }}>{tauxCouverture}%</span>
          <div style={{ width: '80%', backgroundColor: '#eee', height: '4px', borderRadius: '2px', marginTop: '4px' }}>
            <div style={{ width: `${tauxCouverture}%`, backgroundColor: '#27ae60', height: '100%', borderRadius: '2px' }}></div>
          </div>
        </div>
      </div>
    </div>

  </div>
)}

      <div className="table-container">
        <table className="table-respo">
  <thead>
    <tr>
      <th className="col-id">N°</th>
      <th className="col-name">Nom</th>
      <th className="col-name">Prénom</th>
      <th className="col-sexe">Sexe</th>
      <th className="col-gs-respo">GS</th>
      <th className="col-poste">Poste</th>
      <th className="col-action-btn">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((r, index) => (
      <tr key={r.CodeRespo || index}>
        <td className="col-id">{index + 1}</td>
        <td className="col-name text-uppercase">{r.Nom || r.nom || r.NomMembre || "---"}</td>
        <td className="col-name">{r.Prenom || r.prenom || r.PrenomMembre || "---"}</td>
        <td className="col-sexe">{r.Sexe || r.sexe || "---"}</td>
        <td className="col-gs-respo">
          {r.NomGS || r.nomgs || <span className="text-muted">Aucun GS</span>}
        </td>
        <td className="col-poste">
          {r.Poste || r.poste ? (
            <span className="poste-text">{r.Poste || r.poste}</span>
          ) : (
            <span className="no-poste">Aucun poste</span>
          )}
        </td>
        <td className="col-action-btn">
          <button className="btn-edit-simple" onClick={() => handleEdit(r)}>
            <FaEdit /> Modifier Poste
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>

      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content-premium">
      {/* Header */}
      <div className="modal-header-lite">
        <h3>Modifier la poste</h3>
      </div>
      
      <div className="modal-body-premium">
        <div className="info-row">
          <span className="info-label">Nom/Prénom:</span>
          <span className="info-value">{selectedRespo?.Nom} {selectedRespo?.Prenom}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Sexe:</span>
          <span className="info-value">{selectedRespo?.Sexe || selectedRespo?.sexe || "---"}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">GS:</span>
          <span className="info-value">{selectedRespo?.NomGS}</span>
        </div>
        
        <div className="form-group-premium">
          <label>Nouveau Poste</label>
          <select 
            value={newPoste} 
            onChange={(e) => setNewPoste(e.target.value)}
            className="form-control-premium"
          >
            <option value="">-- Choisir --</option>
            <option value="Président(e)">Président(e)</option>
            <option value="Secrétaire">Secrétaire</option>
            <option value="Trésorier(e)">Trésorier(e)</option>
            <option value="Conseiller(e)">Conseiller(e)</option>
            <option value="Membres">Membres</option>
          </select>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="modal-buttons-premium">
        <button className="btn-cancel-premium" onClick={() => setShowModal(false)}>
          Annuler
        </button>
        <button className="btn-save-premium" onClick={handleUpdate}>
          Enregistrer
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}