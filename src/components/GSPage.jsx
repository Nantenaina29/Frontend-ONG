import React, { useState, useEffect } from "react";
import { FaPlus, FaFilePdf, FaEye, FaDownload, FaFileExcel, FaLayerGroup, FaUsers, FaMapMarkedAlt, FaChartPie } from "react-icons/fa";
import axiosClient from "../axiosClient.js";
import Swal from "sweetalert2";
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function GSPage() {
  const [search, setSearch] = useState("");
  const [gsData, setGsData] = useState([]);
  const [menages, setMenages] = useState([]);

  const [currentId, setCurrentId] = useState(null);
  const [nom, setNom] = useState("");
  const [numMenage, setNumMenage] = useState([]);
  const [dateCreation, setDateCreation] = useState("");
  const [commune, setCommune] = useState("");
  const [fokontany, setFokontany] = useState("");
  const [village, setVillage] = useState("");
  const [showStats, setShowStats] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchExportMenu, setShowSearchExportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // STATISTIQUES
  const totalGS = gsData.length;
  const totalEffectif = gsData.reduce((sum, g) => sum + (Number(g.effectif) || 0), 0);
  const totalCommunes = [...new Set(gsData.map(g => g.commune))].filter(Boolean).length;
  const moyenneEffectif = totalGS > 0 ? (totalEffectif / totalGS).toFixed(1) : 0;

  // FETCH GS & MENAGES
  useEffect(() => {
    const fetchGsDataInitial = async () => {
      try {
        const res = await axiosClient.get("/api/gs");
        setGsData(res.data);
      } catch (error) {
        console.error("Erreur fetch GS :", error);
      }
    };

    const fetchMenages = async () => {
      try {
        const res = await axiosClient.get("/api/menages");
        setMenages(res.data);
      } catch (error) {
        console.error("Erreur fetch menages :", error);
      }
    };

    fetchGsDataInitial();
    fetchMenages();
  }, []);

  const filteredData = gsData.filter(g => {
    const searchTerm = search.toLowerCase();
    return (
      (g.nom || "").toLowerCase().includes(searchTerm) ||
      (g.commune || "").toLowerCase().includes(searchTerm) ||
      (g.fokontany || "").toLowerCase().includes(searchTerm) ||
      (g.village || "").toLowerCase().includes(searchTerm) ||
      (g.effectif || "").toString().includes(searchTerm) ||
      (g.numMenage || "").toLowerCase().includes(searchTerm)
    );
  });

  // EXPORT PDF
  const exportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 30) / 2, 10, 30, 30);
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 45, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      const title = "Liste des Groupes Solidarités (GS)";
      doc.text(title, pageWidth / 2, 53, { align: "center" });

      const tableColumn = ["N°", "Nom GS", "N° Ménage", "Effectif", "Date Création", "Commune", "Fokontany", "Village"];
      const tableRows = filteredData.map((gs, index) => [
        index + 1,
        gs.nom || "",
        gs.numMenage || "",
        gs.effectif || 0,
        gs.dateCreation ? new Date(gs.dateCreation).toLocaleDateString('fr-FR') : "",
        gs.commune || "",
        gs.fokontany || "",
        gs.village || ""
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], halign: 'center', fontSize: 10, cellPadding: 3 },
        styles: { fontSize: 9, halign: 'center', valign: 'middle' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const fileName = search ? `GS_Recherche_${search.replace(/\s+/g, '_')}.pdf` : "Liste_des_GS.pdf";
      doc.save(fileName);

      Swal.fire({
        title: "Bien!",
        text: search ? `Exportation des ${filteredData.length} résultats réussie!` : "Exportation de la liste complète réussie!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Erreur PDF:", error);
      Swal.fire("Erreur", "Erreur d'exportation PDF: " + error.message, "error");
    }
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    try {
      const tableHeader = ["N°", "Nom GS", "N° Ménage", "Effectif", "Date Création", "Commune", "Fokontany", "Village"];
      const tableRows = filteredData.map((gs, index) => [
        index + 1,
        gs.nom || "",
        gs.numMenage || "",
        gs.effectif || 0,
        gs.dateCreation ? new Date(gs.dateCreation).toLocaleDateString('fr-FR') : "",
        gs.commune || "",
        gs.fokontany || "",
        gs.village || ""
      ]);

      const worksheetData = [tableHeader, ...tableRows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      const sheetName = search ? `Filtre_${search.substring(0, 10)}` : "Liste_des_GS";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = search ? `GS_Export_${search.replace(/\s+/g, '_')}.xlsx` : "Liste_des_GS_Complet.xlsx";
      XLSX.writeFile(workbook, fileName);

      Swal.fire({
        title: "Bien!",
        text: "Exportation Excel réussie!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Erreur Excel:", error);
      Swal.fire("Erreur", "Erreur d'exportation Excel: " + error.message, "error");
    }
  };

  // MODALS
  const openAddModal = () => {
    setNom("");
    setNumMenage([]);
    setDateCreation("");
    setCommune("");
    setFokontany("");
    setVillage("");
    setShowAddModal(true);
  };

  const openEditModal = (g) => {
    setCurrentId(g.CodeGS);
    setNom(g.nom || "");
    setNumMenage(g.numMenage ? g.numMenage.split(",") : []);
    setDateCreation(g.dateCreation ? g.dateCreation.split("T")[0] : "");
    setCommune(g.commune || "");
    setFokontany(g.fokontany || "");
    setVillage(g.village || "");
    setShowEditModal(true);
  };

  // FETCH GS
  const fetchGs = async () => {
    try {
      const res = await axiosClient.get("/api/gs");
      setGsData(res.data);
    } catch (error) {
      console.error("Erreur fetch GS :", error);
    }
  };

  // AJOUT
  const handleAdd = async (e) => {
    e.preventDefault();
    const data = { nom, numMenage: numMenage.join(","), dateCreation, commune, fokontany, village };
    try {
      await axiosClient.post("/api/gs", data);
      await fetchGs();
      setShowAddModal(false);
      Swal.fire("Bien!", "GS ajouté avec succès !", "success");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur ajout GS";
      Swal.fire("Erreur", errorMsg, "error");
    }
  };

  // EDIT
  const handleEdit = async (e) => {
    e.preventDefault();
    const data = { nom, numMenage: numMenage.join(","), dateCreation, commune, fokontany, village };
    try {
      await axiosClient.put(`/api/gs/${currentId}`, data);
      await fetchGs();
      setShowEditModal(false);
      Swal.fire("Bien!", "GS modifié avec succès !", "success");
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur modification GS";
      Swal.fire("Erreur", msg, "error");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Voulez-vous vraiment supprimer ce GS ?",
      text: "Supprimé un GS sans répétition!!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/api/gs/${id}`);
        setGsData(gsData.filter((g) => g.CodeGS !== id));
        Swal.fire("Bien!", "Suppression réussie.", "success");
      } catch (err) {
        console.error("Erreur suppression :", err);
        Swal.fire(
          "Erreur",
          err.response?.data?.message || "Erreur lors de la suppression du GS",
          "error"
        );
      }
      
    }
  };

  return (
    <div className="membre-page">
      <h2 className="page-title">Liste des Groupes des Solidarités</h2>
  
      {/* Top actions */}
      <div className="membre-top">
        <div className="membre-actions">
          <button className="btn-add" onClick={openAddModal}>
            <FaPlus style={{ marginRight: "5px" }} /> Ajouter
          </button>
  
          {/* Export général */}
          <div className="export-container" style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="btn-export"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <FaDownload style={{ marginRight: "5px" }} /> Exporter ▾
            </button>
  
            {showExportMenu && (
              <ul className="dropdown-menu">
                <li className="dropdown-item" onClick={() => { exportPDF(); setShowExportMenu(false); }}>
                  <FaFilePdf color="#e74c3c" /> PDF
                </li>
                <li className="dropdown-item" onClick={() => { exportExcel(); setShowExportMenu(false); }}>
                  <FaFileExcel color="#27ae60" /> EXCEL
                </li>
              </ul>
            )}
          </div>
  
          <button className="btn-more" onClick={() => setShowStats(!showStats)}>
            <FaEye /> {showStats ? "Cacher les stats" : "En voir plus"}
          </button>
        </div>
  
        {/* Search + Export filtered */}
        <div className="search-with-export-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un GS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
  
          {search && (
            <div className="export-container" style={{ position: 'relative' }}>
              <button
                className="btn-export"
                style={{ padding: '5px 10px', fontSize: '13px', height: '35px', backgroundColor: '#2980b9' }}
                onClick={() => setShowSearchExportMenu(!showSearchExportMenu)}
              >
                <FaFilePdf size={14} /> Exporter ▾
              </button>
  
              {showSearchExportMenu && (
                <ul className="dropdown-menu" style={{ top: '100%', right: 0, display: 'block' }}>
                  <li className="dropdown-item" onClick={() => { exportPDF(); setShowSearchExportMenu(false); }}>
                    <FaFilePdf color="#e74c3c" /> PDF (Résultat)
                  </li>
                  <li className="dropdown-item" onClick={() => { exportExcel(); setShowSearchExportMenu(false); }}>
                    <FaFileExcel color="#27ae60" /> EXCEL (Résultat)
                  </li>
                  <li style={{ padding: '8px 10px', fontSize: '11px', color: '#7f8c8d', borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <strong>{filteredData.length}</strong> GS trouvés
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
  
      {/* Statistics */}
      {showStats && (
        <div className="statistics-grid">
          {/* Total GS */}
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #3498db' }}>
            <h4 className="stat-label">TOTAL GS</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
                <FaLayerGroup />
              </div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#3498db' }}>{totalGS}</span>
                <span className="avatar-name">Groupements</span>
              </div>
            </div>
          </div>
  
          {/* Total Effectif */}
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #27ae60' }}>
            <h4 className="stat-label">TOTAL EFFECTIF</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}>
                <FaUsers />
              </div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#27ae60' }}>{totalEffectif}</span>
                <span className="avatar-name">Membres</span>
              </div>
            </div>
          </div>
  
          {/* Communes */}
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #e67e22' }}>
            <h4 className="stat-label">COMMUNES</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #e67e22, #d35400)' }}>
                <FaMapMarkedAlt />
              </div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#e67e22' }}>{totalCommunes}</span>
                <span className="avatar-name">Localités</span>
              </div>
            </div>
          </div>
  
          {/* Moyenne */}
          <div className="stat-card-avatar" style={{ borderLeft: '5px solid #8e44ad' }}>
            <h4 className="stat-label">MOYENNE</h4>
            <div className="avatar-container-single">
              <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)' }}>
                <FaChartPie />
              </div>
              <div className="avatar-info">
                <span className="avatar-count" style={{ color: '#8e44ad' }}>{moyenneEffectif}</span>
                <span className="avatar-name">Pers. / GS</span>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Table */}
      <div className="table-container">
        <table className="membre-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Nom GS</th>
              <th>N° Ménage</th>
              <th>Effectif</th>
              <th>Date Création</th>
              <th>Commune</th>
              <th>Fokontany</th>
              <th>Village</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((g, index) => (
              <tr key={g.CodeGS}>
                <td>{index + 1}</td>
                <td>{g.nom}</td>
                <td>{g.numMenage}</td>
                <td>{g.effectif}</td>
                <td>{g.dateCreation ? new Date(g.dateCreation).toLocaleDateString('fr-FR') : ""}</td>
                <td>{g.commune}</td>
                <td>{g.fokontany}</td>
                <td>{g.village}</td>
                <td className="action-icons">
                  <span className="icon edit" onClick={() => openEditModal(g)}>✏️</span>
                  <span className="icon delete" onClick={() => handleDelete(g.CodeGS)}>🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
{/* --- MODAL GS (ULTRA COMPACT) --- */}
{(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px', padding: '15px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>
              {showAddModal ? "Nouveau GS" : "Modifier GS"}
            </h3>
            
            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="premium-form" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px 15px',
                    padding: '0' 
                  }}>
              
              {/* COLUMN ANKAVIA (Mifintina) */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Nom GS :</label>
                  <input type="text" value={nom} style={{ padding: '6px' }} onChange={(e)=>setNom(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>N° Ménage :</label>
                  <select 
                    multiple 
                    className="multi-select-gs" 
                    value={numMenage} 
                    style={{ height: '115px', padding: '5px', fontSize: '0.85rem' }}
                    onChange={(e)=>setNumMenage(Array.from(e.target.selectedOptions, (o)=>o.value))} 
                    required
                  >
                    {menages.map((m, i) => <option key={i} value={m.NumMenage}> {m.NumMenage}</option>)}
                  </select>
                </div>
              </div>

              {/* COLUMN ANKAVANANA (Mifintina) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Date :</label>
                  <input type="date" value={dateCreation} style={{ padding: '6px' }} onChange={(e)=>setDateCreation(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Commune :</label>
                  <input type="text" value={commune} style={{ padding: '6px' }} onChange={(e)=>setCommune(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Fokontany :</label>
                  <input type="text" value={fokontany} style={{ padding: '6px' }} onChange={(e)=>setFokontany(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Village :</label>
                  <input type="text" value={village} style={{ padding: '6px' }} onChange={(e)=>setVillage(e.target.value)} required />
                </div>
              </div>

              {/* BOKOTRA (Ambany indrindra) */}
              <div className="modal-buttons" style={{ gridColumn: 'span 2', marginTop: '10px', paddingTop: '10px' }}>
                <button type="button" className="btn-cancel" style={{ padding: '6px 15px' }} onClick={() => {setShowAddModal(false); setShowEditModal(false)}}>
                  Annuler
                </button>
                <button type="submit" className="btn-save" style={{ padding: '6px 15px' }}>
                  {showAddModal ? "Enregistrer" : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
