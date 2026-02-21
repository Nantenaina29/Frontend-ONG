import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from "../axiosClient";
import Swal from 'sweetalert2'; 
import { FaUndo, FaTrashAlt, FaSpinner, FaDatabase } from "react-icons/fa";
import "./TrashPage.css";

const TrashPage = () => {
    const [selectedTable, setSelectedTable] = useState('membres');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const isReadOnly = selectedTable === 'responsables' || selectedTable === 'formations';

    const tables = [
        { id: 'membres', label: 'Membres' },
        { id: 'gs', label: 'Groupements' },
        { id: 'reseaux', label: 'Réseaux' },
        { id: 'formations', label: 'Formations' },
        { id: 'responsables', label: 'Responsables' }
    ];

    const fetchTrash = useCallback(async () => {
        setLoading(true);
        setItems([]); 
        try {
            const { data } = await axiosClient.get(`/api/trash/${selectedTable}`);
            
            const uniqueData = data.filter((item, index, self) =>
                index === self.findIndex((t) => (
                    (t.CodeGS && t.CodeGS === item.CodeGS) || 
                    (t.NumMembre && t.NumMembre === item.NumMembre) ||
                    (t.CodeRS && t.CodeRS === item.CodeRS) ||
                    (t.CodeRespo && t.CodeRespo === item.CodeRespo) ||
                    (t.codeformation && t.codeformation === item.codeformation) ||
                    (t.id && t.id === item.id)
                ))
            );
            
            setItems(uniqueData);
        } catch (error) {
            console.error("Erreur lors de la récupération :", error);
            Swal.fire('Erreur', 'Impossible de charger la corbeille', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedTable]);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    const handleAction = async (action, id) => {
        const isRestore = action === 'restore';
        
        const result = await Swal.fire({
            title: isRestore ? 'Confirmer la restauration ?' : 'Suppression definitiva ?',
            text: isRestore 
                ? "Voulez-vous restaurer cet élément ?" 
                : "Attention ! Cette action est irréversible.",
            icon: isRestore ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: isRestore ? '#2ecc71' : '#d33',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: isRestore ? 'Oui, restaurer' : 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) return;

        try {
            if (isRestore) {
                await axiosClient.post(`/api/trash/${selectedTable}/${id}/restore`);
                Swal.fire('Restauré !', 'Élément récupéré avec succès.', 'success');
            } else {
                await axiosClient.delete(`/api/trash/${selectedTable}/${id}/force`);
                Swal.fire('Supprimé !', 'Élément supprimé définitivement.', 'success');
            }
            fetchTrash(); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Une erreur est survenue.';
            Swal.fire('Erreur', errorMsg, 'error');
        }
    };

    return (
        <section className="trash-section" style={{ 
            padding: '20px', 
            height: '100vh', 
            backgroundColor: '#f4f7f6', 
            display: 'flex', 
            flexDirection: 'column',
            boxSizing: 'border-box'
        }}>
            {/* Header sy Nav mijanona eo ambony (Fixe) */}
            <div style={{ flexShrink: 0 }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#2c3e50' }}>
                        <FaTrashAlt color="#e74c3c" /> 
                        <span>Corbeille : Gestion des données supprimées</span>
                    </h2>
        
                    <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        {tables.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTable(t.id)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: selectedTable === t.id ? '#3498db' : '#ffffff',
                                    color: selectedTable === t.id ? 'white' : '#7f8c8d',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Ny Vata Mitsingevana misy ny Tableau */}
            <div className="container" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                marginBottom: '20px' // Elanelana @ footer
            }}>
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '15px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    maxHeight: '100%' 
                }}>
                    {/* TH Fixe (Lohateny) */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                            <tr>
                                <th style={{ padding: '18px', width: '10%', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '18px', width: '45%', textAlign: 'left' }}>Détails</th>
                                <th style={{ padding: '18px', width: '25%', textAlign: 'left' }}>Date de suppression</th>
                                {!isReadOnly && <th style={{ padding: '18px', width: '20%', textAlign: 'center' }}>Actions</th>}
                            </tr>
                        </thead>
                    </table>

                    {/* Data misy Scroll (Andalana 4 eo ho eo ny haavony) */}
                    <div className="premium-scroll" style={{ 
                        overflowY: 'auto', 
                        maxHeight: '280px', // Haavo mifanaraka @ andalana 4
                        flexGrow: 1 
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={isReadOnly ? "3" : "4"} style={{ padding: '40px', textAlign: 'center' }}>
                                            <FaSpinner className="animate-spin" style={{ marginRight: '10px' }} /> 
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : items.length > 0 ? (
                                    items.map(item => {
                                        const id = item.CodeRS || item.codeformation || item.NumMembre || item.CodeGS || item.CodeRespo;
                                        let details = '---';
                                        if (selectedTable === 'membres') details = `${item.NomMembre || ''} ${item.PrenomMembre || ''}`;
                                        else if (selectedTable === 'gs') details = item.nom || 'GS sans nom';
                                        else if (selectedTable === 'reseaux') details = item.NomRS || 'Réseau sans nom';
                                        else if (selectedTable === 'responsables') details = `${item.PrenomMembre || '---'} - ${item.Poste || 'Poste non défini'}`;
                                        else if (selectedTable === 'formations') details = `${item.PrenomMembre || '---'} - ${item.autonomie || 'Non défini'}`;
        
                                        return (
                                            <tr key={`${selectedTable}-${id}`} className="row-hover" style={{ borderBottom: '1px solid #f1f1f1' }}>
                                                <td style={{ padding: '15px', width: '10%', color: '#7f8c8d' }}>{id}</td>
                                                <td style={{ padding: '15px', width: '45%', fontWeight: '500', color: '#2c3e50' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <FaDatabase size={14} color="#3498db" opacity={0.7} />
                                                        {details}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', width: '25%', color: '#95a5a6' }}>
                                                    {item.deleted_at ? new Date(item.deleted_at).toLocaleString('fr-FR') : '---'}
                                                </td>
                                                {!isReadOnly && (
                                                    <td style={{ padding: '15px', width: '20%', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                            <button onClick={() => handleAction('restore', id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><FaUndo size={12} /></button>
                                                            <button onClick={() => handleAction('delete', id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><FaTrashAlt size={12} /></button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isReadOnly ? "3" : "4"} style={{ padding: '50px', textAlign: 'center', color: '#bdc3c7' }}>
                                            Aucune donnée supprimée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Fixe any ambany indrindra */}
            <footer style={{ 
                flexShrink: 0, 
                textAlign: 'center', 
                padding: '15px', 
                fontSize: '12px', 
                color: '#95a5a6',
                borderTop: '1px solid #eef2f3'
            }}>
                © 2026 <b>ONG TSINJO AINA FIANARANTSOA</b> - Système de Gestion Intégrée
            </footer>

            {/* CSS Custom ho an'ny Scrollbar sy Hover */}
            <style>{`
                .premium-scroll::-webkit-scrollbar { width: 6px; }
                .premium-scroll::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
                .premium-scroll::-webkit-scrollbar-track { background: transparent; }
                .row-hover:hover { background-color: #f8fbff !important; transition: 0.2s; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </section>
    );
};

export default TrashPage;