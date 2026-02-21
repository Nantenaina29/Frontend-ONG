import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import axiosClient from "../axiosClient";

import "./Statistique.css";

const POSTE_COLORS = {
    'Président(e)': '#4e73df',
    'Secrétaire': '#1cc88a',
    'Trésorier(e)': '#f6c23e',
    'Conseiller(e)': '#36b9cc',
    'Membres': '#e74a3b'
};

const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

// 1. Component StatSection (Apetraka eto ivelany)
const StatSection = ({ title, children, color }) => (
  <div className="stat-section-card" style={{ borderLeft: `8px solid ${color}`, background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <div className="stat-header" style={{ marginBottom: '15px' }}>
      <h5 style={{ margin: 0, color: color, fontWeight: "bold", fontSize: '16px' }}>{title}</h5>
    </div>
    <div className="stat-body">
      {children}
    </div>
  </div>
);

export default function StatistiquePage() {
  const [data, setData] = useState({ membres: [], gs: [], reseaux: [], responsables: [], formations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resM, resG, resR, resP, resF] = await Promise.all([
          axiosClient.get("/api/membres"),
          axiosClient.get("/api/gs"),
          axiosClient.get("/api/reseaux"),
          axiosClient.get("/api/responsables"),
          axiosClient.get("/api/formations")
        ]);
        setData({
          membres: resM.data?.data || resM.data || [],
          gs: resG.data?.data || resG.data || [],
          reseaux: resR.data?.data || resR.data || [],
          responsables: resP.data?.data || resP.data || [],
          formations: resF.data?.data || resF.data || []
        });
      } catch (err) {
        console.error("Erreur API:", err);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // 2. Kajy rehetra ampiasaina amin'ny Charts
  const stats = useMemo(() => {
    const taona = new Date().getFullYear();
    const fData = data.formations;

    // --- Stats Formations (Taranja) ---
    const statsTaranja = [
      { name: 'G.Simpli', valeur: fData.filter(m => m.gestionsimplifiee || m.GestionSimplifiee).length },
      { name: 'AgroEco', valeur: fData.filter(m => m.agroeco || m.AgroEco).length },
      { name: 'Semence', valeur: fData.filter(m => m.productionsemence || m.ProductionSemence).length },
      { name: 'Nutrition', valeur: fData.filter(m => m.nutrition || m.Nutrition).length },
      { name: 'C.Produit', valeur: fData.filter(m => m.conservationproduit || m.ConservationProduit).length },
      { name: 'T.Produit', valeur: fData.filter(m => m.transformationproduit || m.TransformationProduit).length },
      { name: 'Genre', valeur: fData.filter(m => m.genre || m.Genre).length },
      { name: 'EPRACC', valeur: fData.filter(m => m.epracc || m.EPRACC).length },
    ];

    // --- Stats Autonomie ---
    const totalM = fData.length;
    const totalAutonome = fData.filter(f => f.autonomie === 'Autonome' || f.Autonomie === 'Autonome').length;

    // --- Stats Démographie ---
    const ageM = [
      { name: '<18', valeur: data.membres.filter(m => (taona - (m.AnneeNaissance || 2000)) < 18).length },
      { name: '18-26', valeur: data.membres.filter(m => {
          const a = taona - (m.AnneeNaissance || 2000); return a >= 18 && a <= 26;
      }).length },
      { name: '>27', valeur: data.membres.filter(m => (taona - (m.AnneeNaissance || 2000)) > 26).length }
    ];

    // --- Stats GS & Réseaux ---
    const gsCounts = data.gs.reduce((acc, curr) => {
        const year = new Date(curr.dateCreation || curr.DateCreation || curr.created_at).getFullYear();
        if (!isNaN(year)) acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});
    const gsByYear = Object.keys(gsCounts).map(y => ({ year: y, valeur: gsCounts[y] })).sort((a,b) => a.year - b.year);

    // --- Stats Responsables ---
    const normalizePoste = (txt) => txt ? txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    const respData = [
      { name: 'Président(e)', valeur: data.responsables.filter(r => normalizePoste(r.Poste || r.poste).includes("presid")).length },
      { name: 'Secrétaire', valeur: data.responsables.filter(r => normalizePoste(r.Poste || r.poste).includes("secr")).length },
      { name: 'Trésorier(e)', valeur: data.responsables.filter(r => normalizePoste(r.Poste || r.poste).includes("treso")).length },
      { name: 'Conseiller(e)', valeur: data.responsables.filter(r => normalizePoste(r.Poste || r.poste).includes("conseil")).length },
      { name: 'Membres', valeur: data.responsables.filter(r => {
        const p = normalizePoste(r.Poste || r.poste);
        return p.includes("membre"); // Ity no ovaina mba hifanaraka amin'ny anarana vaovao
    }).length }
  ].filter(item => item.valeur > 0);
    return { ageM, gsByYear, respData, statsTaranja, totalM, totalAutonome };
  }, [data]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div> {/* Soso-kevitra: asio sary mihetsika kely */}
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-page-container" style={{ padding: '20px', backgroundColor: '#f8f9fc' }}> 
      <h2 className="stat-title-main" style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>📊 Tableau de Bord Statistiques</h2>
      
      <div className="stat-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
        
        {/* 1. SECTION MEMBRES */}
        <StatSection title="1. DÉMOGRAPHIE (Âge des membres)" color="#4e73df">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.ageM}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valeur" fill="#4e73df" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </StatSection>

        {/* 2. SECTION GS */}
        <StatSection title="2. GROUPE DES SOLIDARITES(Créations GS par an)" color="#1cc88a">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.gsByYear}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valeur" fill="#1cc88a" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </StatSection>

        {/* 4. SECTION RESPONSABLES */}
        <StatSection title="3. RESPONSABILITES (Postes occupés)" color="#f6c23e">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.respData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valeur" label>
                {stats.respData.map((e, i) => <Cell key={i} fill={POSTE_COLORS[e.name] || COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </StatSection>

        {/* 5. SECTION FORMATIONS (Taranja + Autonomie) */}
        <StatSection title="4. IMPACT FORMATIONS & AUTONOMIE" color="#e74a3b">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '11px', textAlign: 'center', color: '#7f8c8d' }}>Membres par formations</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.statsTaranja}>
                  <XAxis dataKey="name" fontSize={9} interval={0} />
                  <Tooltip />
                  <Bar dataKey="valeur" fill="#e74a3b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p style={{ fontSize: '11px', textAlign: 'center', color: '#7f8c8d' }}>Taux d'autonomie</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Autonome', valeur: stats.totalAutonome },
                      { name: 'En cours', valeur: stats.totalM - stats.totalAutonome }
                    ]} 
                    innerRadius={45} outerRadius={65} dataKey="valeur"
                  >
                    <Cell fill="#27ae60" /><Cell fill="#87CEEB" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </StatSection>

      </div>
    </div>
  );
}