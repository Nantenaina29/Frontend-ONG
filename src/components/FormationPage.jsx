import React, { useState, useEffect, useCallback } from "react";
import { FaFilePdf, FaEye,  FaDownload, FaFileExcel, FaGraduationCap, FaSeedling, FaTools} from "react-icons/fa";
import axiosClient from "../axiosClient";
import Swal from "sweetalert2";
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function FormationPage() {
  const [search, setSearch] = useState("");
  const [membresData, setMembresData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState("");

  const [formData, setFormData] = useState({
    nummembre: "", // Sora-madinika
    gestionsimplifiee: false,
    agrosol: false,
    agroeau: false,
    agrovegetaux: false,
    agroeco: false,
    productionsemence: false,
    nutritioneau: false,
    nutritionalimentaire: false,
    nutrition: false,
    conservationproduit: false,
    transformationproduit: false,
    genre: false,
    epracc: false,
    autre: "",
    autonomie: "Non"
  });

  // --- 1. KAJY AUTOMATIQUE (DERIVED STATE) ---
  const isAgroEco = formData.agrosol && formData.agroeau && formData.agrovegetaux;
  const isNutrition = formData.nutritioneau && formData.nutritionalimentaire;
  const isAutonome = 
    formData.gestionsimplifiee && isAgroEco && formData.productionsemence && 
    isNutrition && formData.conservationproduit && formData.transformationproduit && 
    formData.genre && formData.epracc;

  const currentAutonomie = isAutonome ? "Autonome" : "Non";

  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- STATES VAOVAO ---
const [showStats, setShowStats] = useState(false);

// --- KAJY STATISTIQUES FORMATIONS ---
const totalMembres = membresData.length;

// 1. Isan'ny mpikambana nahavita fiofanana farafahakeliny iray
const membresFormes = membresData.filter(m => 
  (m.gestionsimplifiee || m.agroeco || m.productionsemence || m.nutrition || m.genre)
).length;

// 2. Taham-pahavitana fiofanana (Taux de couverture formation)
const tauxFormation = totalMembres > 0 ? ((membresFormes / totalMembres) * 100).toFixed(0) : 0;

// 3. Mpikambana efa "Autonome" (nahavita ny modules rehetra)
const totalAutonome = membresData.filter(m => (m.autonomie === "Autonome" || m.Autonomie === "Autonome")).length;

// 4. Taham-pahaleovantena (Taux d'autonomie technique)
const tauxAutonomie = totalMembres > 0 ? ((totalAutonome / totalMembres) * 100).toFixed(0) : 0;

  // --- EXPORT PDF ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.addImage("/Logo.jpg", "JPEG", (pageWidth - 30) / 2, 10, 30, 30);
      doc.setFontSize(14);
      doc.text("ONG TSINJO AINA FIANARANTSOA", pageWidth / 2, 45, { align: "center" });
      doc.setFontSize(11);
      doc.text("Suivi des Formations par Membre", pageWidth / 2, 53, { align: "center" });

      const tableColumn = [
        "N°", "Prénom","G.SIMPLIFIE" , "AGROECOL", 
        "SEMENCE",  "NUTRITION", "Cons", "Trans", "GENRE", "EPRACC", "Autonomie"
      ];

      const tableRows = membresData.map((m, index) => [
        index + 1,
        m.prenom_membre || m.PrenomMembre || "",
        (m.gestionsimplifiee || m.GestionSimplifiee) ? "X" : "-",
        (m.agroeco || m.AgroEco) ? "X" : "-",
        (m.productionsemence || m.ProductionSemence) ? "X" : "-",
        (m.nutrition || m.Nutrition) ? "X" : "-",
        (m.conservationproduit || m.ConservationProduit) ? "X" : "-",
        (m.transformationproduit || m.TransformationProduit) ? "X" : "-",
        (m.genre || m.Genre) ? "X" : "-",
        (m.epracc || m.EPRACC) ? "X" : "-",
        m.autonomie || m.Autonomie || "Non"
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { 
          fontSize: 10, // Natao 10 mba ho antonona ny column maro
          halign: 'center',
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [41, 128, 185], 
          fontSize: 9 // Kely kely ny lohateny mba tsy hifampiditra
        },
        columnStyles: {
          1: { cellWidth: 35, halign: 'left' }, // Prénom omena toerana
          15: { cellWidth: 25 } // Autonomie
        }
      });

      doc.save("Suivi_Formations.pdf");
      Swal.fire("Bien!", "PDF généré!", "success");
    } catch (error) {
      Swal.fire("Erreur", error.message, "error");
    }
  };

  // --- EXPORT EXCEL ---
  const exportExcel = () => {
    const worksheetData = [
      ["N°", "Prénom", "Gestion Simplifiée",  "Agroécologie", "Production Semence",  "Nutrition", "Conservation", "Transformation", "Genre", "EPRACC", "Autonomie"],
      ...membresData.map((m, index) => [
        index + 1,
        m.prenom_membre || m.PrenomMembre || "",
        (m.gestionsimplifiee || m.GestionSimplifiee) ? "Oui" : "Non",
        (m.agroeco || m.AgroEco) ? "Oui" : "Non",
        (m.productionsemence || m.ProductionSemence) ? "Oui" : "Non",
        (m.nutrition || m.Nutrition) ? "Oui" : "Non",
        (m.conservationproduit || m.ConservationProduit) ? "Oui" : "Non",
        (m.transformationproduit || m.TransformationProduit) ? "Oui" : "Non",
        (m.genre || m.Genre) ? "Oui" : "Non",
        (m.epracc || m.EPRACC) ? "Oui" : "Non",
        m.autonomie || m.Autonomie || "Non"
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Formations");
    XLSX.writeFile(workbook, "Suivi_Formations.xlsx");
    Swal.fire("Bien!", "Excel généré!", "success");
  };

// --- 2. FETCH DATA (Nampiana ny search ao amin'ny URL) ---
// Ao anatin'ny FormationPage.jsx
const fetchData = useCallback(async () => {
  try {
    // Ampiasao ny axiosClient sy ny backticks (`) ho an'ny ${search}
    const res = await axiosClient.get(`/api/formations?search=${search}`);
    
    // Halaina ny data
    const result = res.data.data || res.data;
    setMembresData(result);
  } catch (err) {
    console.error("Error ao amin'ny fetchData:", err);
  }
}, [search]); // Ny 'search' ihany no dependency eto// <--- Tsy maintsy misy 'search' eto mba hiova isaky ny manoratra ianao

useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [search]); // <--- Mihaino ny fiovan'ny fetchData (izay mihaino ny search)
  // --- 3. HANDLERS ---
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const openEditModal = (m) => {
    // 1. Tehirizina ny anarana haseho eo amin'ny lohatenin'ny Modal
    setSelectedMembre(m.prenom_membre || m.PrenomMembre || "Membre");
  
    // 2. Fenoina ny formData araka ny angona avy any amin'ny Base de Données
    // Ampiasaina ny "!!" mba hanovana ny sanda ho Boolean (true/false)
    setFormData({
      nummembre: m.nummembre || m.NumMembre,
      gestionsimplifiee: !!(m.gestionsimplifiee || m.GestionSimplifiee),
      agrosol: !!(m.agrosol || m.AgroSol),
      agroeau: !!(m.agroeau || m.AgroEau),
      agrovegetaux: !!(m.agrovegetaux || m.AgroVegetaux),
      agroeco: !!(m.agroeco || m.AgroEco),
      productionsemence: !!(m.productionsemence || m.ProductionSemence),
      nutritioneau: !!(m.nutritioneau || m.NutritionEau),
      nutritionalimentaire: !!(m.nutritionalimentaire || m.NutritionAlimentaire),
      nutrition: !!(m.nutrition || m.Nutrition),
      conservationproduit: !!(m.conservationproduit || m.ConservationProduit),
      transformationproduit: !!(m.transformationproduit || m.TransformationProduit),
      genre: !!(m.genre || m.Genre),
      epracc: !!(m.epracc || m.EPRACC),
      autre: m.autre || m.Autre || "",
      autonomie: m.autonomie || m.Autonomie || "Non"
    });
  
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    // Ampiasao sora-madinika daholo ny keys eto mba hifanaraka amin'ny $fillable
    const finalData = {
      NumMembre: formData.nummembre, // Sora-madinika
      gestionsimplifiee: formData.gestionsimplifiee,
      agrosol: formData.agrosol,
      agroeau: formData.agroeau,
      agrovegetaux: formData.agrovegetaux,
      agroeco: isAgroEco, // Ilay kajy automatique
      productionsemence: formData.productionsemence,
      nutritioneau: formData.nutritioneau,
      nutritionalimentaire: formData.nutritionalimentaire,
      nutrition: isNutrition, // Ilay kajy automatique
      conservationproduit: formData.conservationproduit,
      transformationproduit: formData.transformationproduit,
      genre: formData.genre,
      epracc: formData.epracc,
      autre: formData.autre,
      autonomie: currentAutonomie // Ilay kajy automatique
    };
  
    try {
      await axiosClient.post("/api/formations", finalData);
      Swal.fire("Bien!", "Formation ajout avec succès!", "success");
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.error("Erreur save:", err.response?.data); // Jereo eto ny antsipirian'ny erreur
      Swal.fire("Erreur", "Erreur d'ajout: " + (err.response?.data?.message || "Ne pas enregistrer!"), "error");
    }
  };

  return (
    <div className="membre-page">
      <h2 className="page-title">Suivi des Formations</h2>
      <div className="membre-top">
        <div className="membre-actions">
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
        
        <div className="search-box">
        <input
        type="text"
        placeholder="Rechercher par prénom..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {showStats && (
  <div className="stats-main-container" style={{ marginBottom: '30px' }}>
    
    <div className="statistics-grid">
      
      {/* 1. TAUX DE FORMATION */}
      <div className="stat-card-avatar" style={{ borderLeft: '5px solid #3498db' }}>
        <h4 className="stat-label">TAUX DE FORMATION</h4>
        <div className="avatar-container-single">
          <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
            <FaGraduationCap />
          </div>
          <div className="avatar-info">
            <span className="avatar-count" style={{ color: '#2980b9' }}>{tauxFormation}%</span>
            <span className="avatar-name">{membresFormes} sur {totalMembres} membres</span>
          </div>
        </div>
      </div>

      {/* 2. AGROÉCOLOGIE */}
      <div className="stat-card-avatar" style={{ borderLeft: '5px solid #27ae60' }}>
        <h4 className="stat-label">AGROÉCOLOGIE</h4>
        <div className="avatar-container-single">
          <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}>
            <FaSeedling />
          </div>
          <div className="avatar-info">
            <span className="avatar-count" style={{ color: '#27ae60' }}>
              {membresData.filter(m => m.agroeco || m.AgroEco).length}
            </span>
            <span className="avatar-name">Membres expérimentés</span>
          </div>
        </div>
      </div>

      {/* 3. AUTONOMIE TECHNIQUE */}
      <div className="stat-card-avatar" style={{ borderLeft: '5px solid #e67e22' }}>
        <h4 className="stat-label">AUTONOMIE TECHNIQUE</h4>
        <div className="avatar-container-single">
          <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #e67e22, #d35400)' }}>
            <FaTools />
          </div>
          <div className="avatar-info" style={{ width: '100%' }}>
            <span className="avatar-count" style={{ color: '#d35400' }}>{tauxAutonomie}%</span>
            <div style={{ width: '80%', backgroundColor: '#eee', height: '4px', borderRadius: '2px', marginTop: '4px' }}>
              <div style={{ width: `${tauxAutonomie}%`, backgroundColor: '#e67e22', height: '100%', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
)}

<div className="formation-wrapper">
        <table className="formation-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Prénom</th>
              <th>GESTION SIMPLIFIE</th>
              <th>AgroEau</th>
              <th>AgroSol</th>
              <th>AgroVegetaux</th>
              <th>AGROECOLOGIE</th>
              <th>PROD.SEMENCE</th>
              <th>Eau/Hyg</th>
              <th>Alim.Saine</th>
              <th>NUTRITION</th>
              <th>Cons.PRODUIT</th>
              <th>Transf.PRODUIT</th>
              <th>GENRE</th>
              <th>EPRACC</th>
              <th>Autre</th>
              <th>Autonomie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {membresData && membresData.length > 0 ? (
    membresData.map((m, index) => {
      // 1. Fakana ny ID sy ny Anarana (izay miseho foana noho ny leftJoin)
      const numMembre = m.nummembre || m.NumMembre;
      const prenom = m.prenom_membre || m.PrenomMembre || "Membre " + numMembre;

      // 2. Fakana ny sanda Boolean (rehefa leftJoin dia null izy raha tsy mbola misy andalana ao amin'ny formations)
      const isGS = !!(m.gestionsimplifiee || m.GestionSimplifiee);
      const isAgroEau = !!(m.agroeau || m.AgroEau);
      const isAgroSol = !!(m.agrosol || m.AgroSol);
      const isAgroVeg = !!(m.agrovegetaux || m.AgroVegetaux);
      const isAgroEco = !!(m.agroeco || m.AgroEco);
      const isProdSem = !!(m.productionsemence || m.ProductionSemence);
      const isNutriEau = !!(m.nutritioneau || m.NutritionEau);
      const isNutriAlim = !!(m.nutritionalimentaire || m.NutritionAlimentaire);
      const isNutri = !!(m.nutrition || m.Nutrition);
      const isCons = !!(m.conservationproduit || m.ConservationProduit);
      const isTransf = !!(m.transformationproduit || m.TransformationProduit);
      const isGenre = !!(m.genre || m.Genre);
      const isEpracc = !!(m.epracc || m.EPRACC);
      
      const autre = m.autre || m.Autre || "aucun";
      const autonomie = m.autonomie || m.Autonomie || "Non";

      return (
        <tr key={numMembre || index}>
          {/* N° sy Prénom */}
          <td>{index + 1}</td>
          <td className="fw-bold text-start">{prenom}</td>

          {/* Fiofanana tsirairay */}
          <td>{isGS ? "Oui" : "Non"}</td>
          <td>{isAgroEau ? "Oui" : "Non"}</td>
          <td>{isAgroSol ? "Oui" : "Non"}</td>
          <td>{isAgroVeg ? "Oui" : "Non"}</td>

          {/* AgroEco (Calculé) */}
          <td className={isAgroEco ? "bg-light-success" : ""}>
            {isAgroEco ? "Oui" : "Non"}
          </td>

          <td>{isProdSem ? "Oui" : "Non"}</td>
          <td>{isNutriEau ? "Oui" : "Non"}</td>
          <td>{isNutriAlim ? "Oui" : "Non"}</td>

          {/* Nutrition (Calculé) */}
          <td className={isNutri ? "bg-light-success" : ""}>
            {isNutri ? "Oui" : "Non"}
          </td>

          <td>{isCons ? "Oui" : "Non"}</td>
          <td>{isTransf ? "Oui" : "Non"}</td>
          <td>{isGenre ? "Oui" : "Non"}</td>
          <td>{isEpracc ? "Oui" : "Non"}</td>

          {/* Hafa sy Autonomie */}
          <td className="small text-muted">{autre}</td>
          <td>
            <span className={`badge ${autonomie === "Autonome" ? "bg-success" : "bg-secondary"}`}>
              {autonomie}
            </span>
          </td>

          {/* Bokotra Action */}
          <td>
            <button 
              className="btn-edit-small" 
              onClick={() => openEditModal(m)}
              title="Modifier les formations"
            >
              ✏️
            </button>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="17" className="text-center py-4 text-muted">
        Aucun membre dans ce liste.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
      <div style={{ height: '0.75cm', clear: 'both' }}></div>

      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content-premium wide-modal">
      <div className="modal-header-premium">
        <h3>Formations de : <span className="highlight-text">{selectedMembre}</span></h3>

      </div>

      <form onSubmit={handleSave} className="modal-body-premium">
        <div className="premium-grid-2">
          
          {/* GROUP 1 & 2 */}
          <div className="grid-item card-sub">
            <CheckboxItem label="1- Gestion Simplifiée" name="gestionsimplifiee" checked={formData.gestionsimplifiee} onChange={handleCheckboxChange} />
          </div>

          <div className="grid-item card-sub border-blue">
            <label className="group-label text-primary">2- AgroEco (Auto)</label>
            <div className="checkbox-group-inner">
              <CheckboxItem label="Agro Eau" name="agroeau" checked={formData.agroeau} onChange={handleCheckboxChange} />
              <CheckboxItem label="Agro Sol" name="agrosol" checked={formData.agrosol} onChange={handleCheckboxChange} />
              <CheckboxItem label="Agro Végétaux" name="agrovegetaux" checked={formData.agrovegetaux} onChange={handleCheckboxChange} />
            </div>
          </div>

          {/* GROUP 3 & 4 */}
          <div className="grid-item card-sub">
            <CheckboxItem label="3- Production Sémence" name="productionsemence" checked={formData.productionsemence} onChange={handleCheckboxChange} />
          </div>

          <div className="grid-item card-sub border-green">
            <label className="group-label text-success">4- Nutrition (Auto)</label>
            <div className="checkbox-group-inner">
              <CheckboxItem label="Nutrition Eau" name="nutritioneau" checked={formData.nutritioneau} onChange={handleCheckboxChange} />
              <CheckboxItem label="Nutrition Alimentaire" name="nutritionalimentaire" checked={formData.nutritionalimentaire} onChange={handleCheckboxChange} />
            </div>
          </div>

          {/* GROUP 5, 6 & 7, 8 */}
          <div className="grid-item card-sub">
            <CheckboxItem label="5- Conservation Produit" name="conservationproduit" checked={formData.conservationproduit} onChange={handleCheckboxChange} />
            <CheckboxItem label="6- Transformation Produit" name="transformationproduit" checked={formData.transformationproduit} onChange={handleCheckboxChange} />
          </div>

          <div className="grid-item card-sub">
            <CheckboxItem label="7- Genre" name="genre" checked={formData.genre} onChange={handleCheckboxChange} />
            <CheckboxItem label="8- EPRACC" name="epracc" checked={formData.epracc} onChange={handleCheckboxChange} />
          </div>
        </div>

        {/* FULL WIDTH SECTION */}
        <div className="full-width-section">
          <div className="form-group-premium">
            <label>9- Autre formation</label>
            <input 
              type="text" 
              className="form-control-premium" 
              name="autre" 
              placeholder="Autre formation à préciser..."
              value={formData.autre} 
              onChange={(e) => setFormData({...formData, autre: e.target.value})} 
            />
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="modal-footer-premium">
          <button type="button" className="btn-cancel-premium" onClick={() => setShowModal(false)}>Annuler</button>
          <button type="submit" className="btn-save-premium">Enregistrer </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

const CheckboxItem = ({ label, name, checked, onChange }) => (
  <div className="form-check">
    <input type="checkbox" className="form-check-input" name={name} id={name} checked={checked} onChange={onChange} />
    <label className="form-check-label" htmlFor={name}>{label}</label>
  </div>
);