
import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaFilePdf, FaEye, FaDownload, FaFileExcel, FaNetworkWired, FaProjectDiagram, FaCheckCircle} from "react-icons/fa";
import axiosClient from "../axiosClient";
import Swal from "sweetalert2"; // 👈 Nampiana
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


export default function ReseauPage() {
  const [search, setSearch] = useState("");
  const [reseaux, setReseaux] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [gsOptions, setGsOptions] = useState([]);

  // Formulaire

  const [NomRS, setNomRS] = useState("");
  const [NomGS, setNomGS] = useState([]);
  const [DateCreation, setDateCreation] = useState("");
  const [Activite, setActivite] = useState(false);
  const [Plaidoyer, setPlaidoyer] = useState(false);
  const [Plan, setPlan] = useState(false);

  // --- KAJY STATISTIQUES RESEAUX ---

const [showStats, setShowStats] = useState(false);
const [showSearchExportMenu, setShowSearchExportMenu] = useState(false);
const totalReseaux = reseaux.length;

// 1. Isan'ny GS tafiditra ao anaty tambajotra (unique)

const allGsInReseaux = reseaux.reduce((acc, curr) => {
  const list = curr.NomGS ? curr.NomGS.split(',') : [];
  return acc.concat(list);
}, []);
const totalGsCouvert = [...new Set(allGsInReseaux)].length;

// 2. Isan'ny Tambajotra efa "Autonome"
const totalAutonome = reseaux.filter(r => r.Autonomie === "Autonome").length;

// 3. Taham-pahaleovantena (Taux d'autonomie)
const tauxAutonomie = totalReseaux > 0 ? ((totalAutonome / totalReseaux) * 100).toFixed(0) : 0;
  // State ho an'ny dropdown menu
  const [showExportMenu, setShowExportMenu] = useState(false)
  // --- 1. LOGIQUE DE RECHERCHE (FILTRE) ---
  // Ity no miantoka fa izay mifanaraka amin'ny "search" ihany no ampiasaina
  const filteredReseaux = (reseaux || []).filter(r =>
   (r.NomRS || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.NomGS || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.Autonomie || "").toLowerCase().includes(search.toLowerCase())

  );

  // --- FUNCTION EXPORT PDF ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 30) / 2, 10, 30, 30);
      doc.setFontSize(14);
      doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 42, { align: "center" });
      doc.setFontSize(11);
      doc.text(search ? `Résultats de recherche pour: "${search}"` : "Liste des Réseaux", pageWidth / 2, 49, { align: "center" });
      const tableColumn = ["N°", "Nom Réseau", "Nom GS", "Date Création", "Activité", "Plaidoyer", "Plan", "Autonomie"];
      const tableRows = filteredReseaux.map((r, index) => [
        index + 1,
        r.NomRS || "",
        r.NomGS || "",
       r.DateCreation ? new Date(r.DateCreation).toLocaleDateString('fr-FR') : "",
        r.Activite ? "Oui" : "Non",
        r.Plaidoyer ? "Oui" : "Non",
        r.Plan ? "Oui" : "Non",
       r.Autonomie || ""
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        styles: { fontSize: 9, halign: 'center' },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save(search ? `Recherche_Reseaux_${search}.pdf` : "Liste_Reseaux.pdf");
      Swal.fire("Bien!", "PDF exporté avec succès!", "success");
    } catch (error) {
      Swal.fire("Erreur", error.message, "error");
    }
  };
  // --- FUNCTION EXPORT EXCEL ---

  const exportExcel = () => {
  const worksheetData = [
      ["N°", "Nom Réseau", "Nom GS", "Date Création", "Activité", "Plaidoyer", "Plan", "Autonomie"],
      ...filteredReseaux.map((r, index) => [
        index + 1,
        r.NomRS || "",
        r.NomGS || "",
        r.DateCreation ? new Date(r.DateCreation).toLocaleDateString('fr-FR') : "",
        r.Activite ? "Oui" : "Non",
        r.Plaidoyer ? "Oui" : "Non",
        r.Plan ? "Oui" : "Non",
        r.Autonomie || ""
      ])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new()
   XLSX.utils.book_append_sheet(workbook, worksheet, "Réseaux");
    XLSX.writeFile(workbook, search ? `Export_Reseaux_${search}.xlsx` : "Liste_Reseaux.xlsx");
    Swal.fire("Bien!", "Excel exporté avec succès!", "success");
  };

  // useRef ho an'ny modal
  const modalRef = useRef();

  // --- FETCH DATA sy GS ---
  const fetchReseaux = async () => {
    try {
    const res = await axiosClient.get("/api/reseaux");
     setReseaux(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Erreur fetch reseaux :", err);
   }
  };

  useEffect(() => {
    (async () => {
      await fetchReseaux();
        try {
        const resGS = await axiosClient.get("/api/gs-list");
        const dataGS = resGS.data.data || resGS.data;
        setGsOptions(Array.isArray(dataGS) ? dataGS : []);
      } catch (err) {
        console.error("Erreur fetch GS :", err);
      }
    })();
  }, []);

  // --- MODAL ---
  const openAddModal = () => {
      setIsEdit(false);
      setCurrentId(null);
      setNomRS("");
      setNomGS([]);
      setDateCreation("");
      setActivite(false);
      setPlaidoyer(false);
      setPlan(false);
      setShowModal(true);
    };

  const openEditModal = (r) => {
    setIsEdit(true);
    setCurrentId(r.CodeRS);
    setNomRS(r.NomRS);
    setNomGS(r.NomGS ? r.NomGS.split(",") : []);
    setDateCreation(r.DateCreation ? r.DateCreation.split('T')[0] : "");
    setActivite(!!r.Activite);
    setPlaidoyer(!!r.Plaidoyer);
    setPlan(!!r.Plan);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataToSend = {
      NomRS,
      NomGS: NomGS.join(","),
      DateCreation: DateCreation ? new Date(DateCreation).toISOString().split('T')[0] : null,
      Activite,
      Plaidoyer,
      Plan,
      Autonomie: Activite && Plaidoyer && Plan ? "Autonome" : "Non",
    };

    try {
      if (isEdit) {
        await axiosClient.put(`/api/reseaux/${currentId}`, dataToSend);
        Swal.fire("Bien!", "Réseau modifié avec succès", "success");
      } else {
       await axiosClient.post("/api/reseaux", dataToSend);
        Swal.fire("Bien!", "Réseau ajouté avec succès", "success");
      }
      await fetchReseaux();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        Swal.fire("Non autorisé", "Session lany daty na tsy manana alalana ianao. Miverena miditra (Login).", "error");
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        Swal.fire(
          err.response?.status === 422 ? "Attention" : "Erreur",
          errorMessage,
          err.response?.status === 422 ? "warning" : "error"
        );
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({

      title: "Voulez-vous vraiment supprimer ce réseau ?",

      text: "Supprimé un réseau sans répétition!",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#d33",

      cancelButtonColor: "#3085d6",

      confirmButtonText: "Oui, supprimer !",

      cancelButtonText: "Annuler"

    });
    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/api/reseaux/${id}`);
        setReseaux(reseaux.filter(r => r.CodeRS !== id));
        Swal.fire("Supprimé!", "Le réseau a été supprimé.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Erreur", "Erreur lors de la suppression", "error");
      }
    }
  };

  return (
    <div className="membre-page">
      <h2 className="page-title">Liste des Réseaux</h2>
      <div className="membre-top">
        <div className="membre-actions">
          <button className="btn-add" onClick={openAddModal}>
            <FaPlus style={{ marginRight: "5px" }} /> Ajouter
          </button>
          <div className="export-container" style={{ position: 'relative', display: 'inline-block' }}>
            <button  className="btn-export"  onClick={() => setShowExportMenu(!showExportMenu)} >
              <FaDownload style={{ marginRight: "5px" }} /> Exporter ▾
            </button> {showExportMenu && (
              <ul className="dropdown-menu">
                <li className="dropdown-item" onClick={() => { exportPDF(); setShowExportMenu(false); }}>
                  <FaFilePdf color="#e74c3c" style={{ marginRight: "8px" }} /> PDF
                </li>
                <li className="dropdown-item" onClick={() => { exportExcel(); setShowExportMenu(false); }}>
                  <FaFileExcel color="#27ae60" style={{ marginRight: "8px" }} /> EXCEL
                </li>
              </ul>
            )}
          </div>
                  <button className="btn-more" onClick={() => setShowStats(!showStats)}>
                    <FaEye style={{ marginRight: "5px" }} /> {showStats ? "Cacher les stats" : "En voir plus"}
                  </button>
                </div>
                <div className="search-with-export-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un réseau..." value={search} onChange={e => setSearch(e.target.value)}/>
            <span className="search-icon">🔍</span>
          </div>

  {/* Bouton Export mipoitra rehefa mikaroka */}
  {search && (
    <div className="export-container" style={{ position: 'relative' }}>
      <button className="btn-export"
        style={{ padding: '5px 10px', fontSize: '13px', height: '35px', backgroundColor: '#2980b9' }}
        onClick={() => setShowSearchExportMenu(!showSearchExportMenu)} >
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
            <strong>{
             reseaux.filter(r =>
                (r.NomRS || "").toLowerCase().includes(search.toLowerCase()) ||
                (r.NomGS || "").toLowerCase().includes(search.toLowerCase())
              ).length
            }</strong> réseaux trouvés
          </li>
        </ul>
      )}
    </div>
  )}
  </div>
 </div>  
      {showStats && (
  <div className="statistics-grid">
    {/* 1. TOTAL RÉSEAUX */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #e74c3c' }}>
      <h4 className="stat-label">TOTAL RÉSEAUX</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
          <FaNetworkWired />
        </div>
        <div className="avatar-info">
          <span className="avatar-count" style={{ color: '#e74c3c' }}>{totalReseaux}</span>
          <span className="avatar-name">Réseaux</span>
        </div>
      </div>
    </div>
    {/* 2. GS COUVERTS */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #3498db' }}>
      <h4 className="stat-label">GS COUVERTS</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
          <FaProjectDiagram />
        </div>
        <div className="avatar-info">
        <span className="avatar-count" style={{ color: '#3498db' }}>{totalGsCouvert}</span>
          <span className="avatar-name">Groupes des Solidarités</span>
        </div>
      </div>
    </div>
    {/* 3. AUTONOMIE */}
    <div className="stat-card-avatar" style={{ borderLeft: '5px solid #27ae60' }}>
      <h4 className="stat-label">AUTONOMIE</h4>
      <div className="avatar-container-single">
        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}>
          <FaCheckCircle />
        </div>
        <div className="avatar-info">
          <span className="avatar-count" style={{ color: '#27ae60' }}>{tauxAutonomie}%</span>
          <span className="avatar-name">{totalAutonome} réseaux autonomes</span>
        </div>
      </div>
    </div>
  </div>

)}

      <div className="table-container">
        <table className="membre-table">
          <thead>
            <tr>
       <th className="col-xs">N°</th>
        <th className="col-lg">Nom Réseau</th>
        <th className="col-lg">Nom GS</th> {/* Ity no omena toerana be indrindra */}
        <th className="col-md">Date Création</th>
        <th className="col-xs">Activité</th>
        <th className="col-xs">Plaidoyer</th>
        <th className="col-xs">Plan</th>
        <th className="col-md">Autonomie</th>
        <th className="col-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReseaux.map((r, index) => (
              <tr key={r.CodeRS}>
                    <td className="col-xs">{index + 1}</td>
                    <td className="col-md"><strong>{r.NomRS}</strong></td>
                    <td className="col-lg">{r.NomGS}</td>
                    <td className="col-md">
                      {r.DateCreation ? new Date(r.DateCreation).toLocaleDateString('fr-FR') : "" }
                    </td>

                    {/* Lasa maintso raha Oui */}
                    <td className="col-sm">
                      <span className={r.Activite ? "text-green" : ""}>
                        {r.Activite ? "Oui" : "Non"}
                      </span>
                    </td>

                    <td className="col-sm">
                      <span className={r.Plaidoyer ? "text-green" : ""}>
                        {r.Plaidoyer ? "Oui" : "Non"}
                      </span>
                    </td>

                    <td className="col-sm">
                      <span className={r.Plan ? "text-green" : ""}>
                        {r.Plan ? "Oui" : "Non"}
                      </span>
                    </td>

                    {/* Lasa manga raha Autonome */}
                    <td className="col-md">
                      <span className={r.Autonomie === "Autonome" ? "text-blue" : ""}>
                        {r.Autonomie}
                      </span>
                    </td>

                    <td className="action-icons col-sm">
                      <span className="icon edit" onClick={() => openEditModal(r)}>✏️</span>
                      <span className="icon delete" onClick={() => handleDelete(r.CodeRS)}>🗑️</span>
                    </td>
                  </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content premium-modal" ref={modalRef}>
      <div className="modal-header">
        <h2>{isEdit ? "Modifier Réseau" : "Nouveau Réseau"}</h2>
        <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
      </div>

      <form onSubmit={handleSave} className="premium-form">
        <div className="form-flex-container">
          
          {/* COLUMN 1: Info & Autonomie */}
          <div className="form-col">
            <div className="form-group-modern">
              <label>Nom du Réseau</label>
              <input 
                className="form-input" 
                value={NomRS} 
                onChange={e => setNomRS(e.target.value)} 
                required 
                placeholder="Nom du Réseau" 
              />
            </div>

            <div className="form-group-modern" style={{ marginTop: '15px' }}>
              <label>Date de Création</label>
              <input 
                type="date" 
                className="form-input" 
                value={DateCreation} 
                onChange={e => setDateCreation(e.target.value)} 
              />
            </div>

            {isEdit && (
              <div className="autonomie-checklist">
                <p className="checklist-title">Critères d'Autonomie</p>
                <label className="checkbox-modern">
                  <input type="checkbox" checked={Activite} onChange={e => setActivite(e.target.checked)}/>
                  <span>Activité</span>
                </label>
                <label className="checkbox-modern">
                  <input type="checkbox" checked={Plaidoyer} onChange={e => setPlaidoyer(e.target.checked)}/>
                  <span>Plaidoyer</span>
                </label>
                <label className="checkbox-modern">
                  <input type="checkbox" checked={Plan} onChange={e => setPlan(e.target.checked)} />
                  <span>Plan de développement</span>
                </label>
              </div>
            )}
          </div>

          {/* COLUMN 2: Sélection GS & Bokotra (Eo ambany ankavanana) */}
          <div className="form-col action-column">
            <div className="form-group-modern">
              <label>Groupes de Solidarité</label>
              <select
                multiple
                size="4"
                className="form-select-multi custom-scrollbar"
                value={NomGS}
                onChange={e => setNomGS(Array.from(e.target.selectedOptions, o => o.value))}
              >
                {gsOptions.map(g => (
                  <option key={g.CodeGS} value={g.nom}>{g.nom}</option>
                ))}
              </select>
            </div>

            <div className="modal-footer-right">
              <button type="button" className="btn-annuler" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button type="submit" className="btn-creer">
                {isEdit ? "Modifier" : "Enregistrer"}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}