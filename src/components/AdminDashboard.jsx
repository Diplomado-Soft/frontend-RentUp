import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHistory, FaSpinner, FaFilePdf, FaDownload, FaBell, FaFileExcel, FaMapMarkerAlt, FaUser, FaMoneyBill, FaBed, FaBath, FaRulerCombined, FaImage, FaEdit, FaTrash, FaInfoCircle, FaBuilding } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faStar, faBell as faBellSolid, faCheck, faTimes, faBuilding, faClipboardList, faRobot } from '@fortawesome/free-solid-svg-icons';
import adminApartmentController from '../apis/adminApartmentController';
import Toast from './Toast';
import ImageModal from './ImageModal';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('apartments');
    const [pendingApartments, setPendingApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApartment, setSelectedApartment] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [history, setHistory] = useState([]);
    const [rejectNotes, setRejectNotes] = useState('');
    const [approvingId, setApprovingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ offset: 0, limit: 50, total: 0 });
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReportsSection, setShowReportsSection] = useState(false);
    const [selectedApartmentDetail, setSelectedApartmentDetail] = useState(null);
    const [reports, setReports] = useState([]);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Reviews state
    const [flaggedReviews, setFlaggedReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [analyzingReviews, setAnalyzingReviews] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState(null);

    // Cargar apartamentos pendientes
    const fetchPendingApartments = async (offset = 0) => {
        try {
            setLoading(true);
            const response = await adminApartmentController.getPendingApartments(
                pagination.limit,
                offset
            );
            setPendingApartments(response.data.apartments);
            setPagination({
                offset,
                limit: response.data.limit,
                total: response.data.total
            });
        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Error al cargar apartamentos',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Cargar historial
    const fetchHistory = async (id_apt) => {
        try {
            const response = await adminApartmentController.getApprovalHistory(id_apt);
            setHistory(response.data);
            setShowHistoryModal(true);
        } catch (error) {
            setToast({
                message: 'Error al cargar el historial',
                type: 'error'
            });
        }
    };

    // Aprobar apartamento
    const handleApprove = async (id_apt) => {
        try {
            setApprovingId(id_apt);
            await adminApartmentController.approveApartment(id_apt, '');
            setToast({
                message: 'Apartamento aprobado correctamente',
                type: 'success'
            });
            // Remover del listado
            setPendingApartments(pendingApartments.filter(apt => apt.id_apt !== id_apt));
            setPagination({ ...pagination, total: pagination.total - 1 });
        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Error al aprobar',
                type: 'error'
            });
        } finally {
            setApprovingId(null);
        }
    };

    // Rechazar apartamento
    const handleReject = async (id_apt) => {
        if (!rejectNotes.trim()) {
            setToast({
                message: 'Ingresa un motivo para el rechazo',
                type: 'warning'
            });
            return;
        }

        try {
            setRejectingId(id_apt);
            await adminApartmentController.rejectApartment(id_apt, rejectNotes);
            setToast({
                message: 'Apartamento rechazado correctamente',
                type: 'success'
            });
            // Remover del listado y limpiar
            setPendingApartments(pendingApartments.filter(apt => apt.id_apt !== id_apt));
            setPagination({ ...pagination, total: pagination.total - 1 });
            setSelectedApartment(null);
            setRejectNotes('');
        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Error al rechazar',
                type: 'error'
            });
        } finally {
            setRejectingId(null);
        }
    };

    // Obtener URLs de imágenes
    const getImageUrls = (images) => {
        if (Array.isArray(images) && images[0]?.url) return images.map(img => img.url);
        if (typeof images === 'string') return images.split(",").filter(url => url.trim());
        if (Array.isArray(images)) return images;
        return [];
    };

    // Montar componente
    useEffect(() => {
        fetchPendingApartments(0);
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const tok = ud?.token;
            const res = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/notifications`,
                { headers: { 'Authorization': `Bearer ${tok}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount((data.notifications || []).filter(n => !n.read_at).length);
            }
        } catch (e) { console.error('Error cargando notificaciones:', e); }
    };

    const markNotificationRead = async (id) => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/notifications/${id}/read`,
                { method: 'PUT', headers: { 'Authorization': `Bearer ${ud?.token}` } }
            );
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/notifications/read-all`,
                { method: 'PUT', headers: { 'Authorization': `Bearer ${ud?.token}` } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;

    // Obtener reportes disponibles
    const fetchReports = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/reports/available`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const data = await response.json();
            setReports(data);
        } catch (error) {
            setToast({ message: 'Error al cargar reportes', type: 'error' });
        }
    };

    // Descargar reporte PDF
    const downloadReport = async (year, month) => {
        try {
            setDownloadingReport(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/admin/reports/monthly?year=${year}&month=${month}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const mNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            a.download = `Reporte_RentUP_${mNames[month-1]}_${year}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setToast({ message: 'Reporte PDF descargado exitosamente', type: 'success' });
        } catch (error) {
            setToast({ message: 'Error al descargar reporte', type: 'error' });
        } finally {
            setDownloadingReport(false);
        }
    };

    // Toggle sección de reportes
    const toggleReportsSection = () => {
        if (!showReportsSection) {
            fetchReports();
        }
        setShowReportsSection(!showReportsSection);
    };

    // ===== FUNCIONES DE RESEÑAS =====
    const fetchFlaggedReviews = async () => {
        try {
            setReviewsLoading(true);
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${API_URL}/reviews/admin/flagged`, {
                headers: { 'Authorization': `Bearer ${ud?.token}` }
            });
            const data = await res.json();
            console.log('Reviews response:', data);
            if (res.ok) {
                // El backend devuelve {reviews: [...], total, limit, offset}
                const reviews = data.reviews?.reviews || data.reviews || [];
                setFlaggedReviews(Array.isArray(reviews) ? reviews : []);
            } else {
                setToast({ message: data.error || 'Error al cargar reseñas marcadas', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Error al cargar reseñas marcadas', type: 'error' });
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkOllamaHealth = async () => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${API_URL}/reviews/admin/ai/health`, {
                headers: { 'Authorization': `Bearer ${ud?.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOllamaStatus(data.data?.ollama?.available ? 'online' : 'offline');
            }
        } catch (error) {
            setOllamaStatus('offline');
        }
    };

    const handleAnalyzeAllReviews = async () => {
        try {
            setAnalyzingReviews(true);
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${API_URL}/reviews/admin/analyze-pending`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ud?.token}`
                },
                body: JSON.stringify({ batchSize: 50 })
            });
            const data = await res.json();
            if (res.ok) {
                setToast({ message: data.message || 'Análisis completado', type: 'success' });
                fetchFlaggedReviews();
                checkOllamaHealth();
            } else {
                setToast({ message: data.error || 'Error en análisis', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Error al analizar reseñas', type: 'error' });
        } finally {
            setAnalyzingReviews(false);
        }
    };

    const handleApproveReview = async (review_id) => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${API_URL}/reviews/admin/${review_id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${ud?.token}` }
            });
            if (res.ok) {
                setToast({ message: 'Reseña aprobada', type: 'success' });
                setFlaggedReviews(flaggedReviews.filter(r => r.review_id !== review_id));
            }
        } catch (error) {
            setToast({ message: 'Error al aprobar reseña', type: 'error' });
        }
    };

    const handleRejectReview = async (review_id) => {
        try {
            const ud = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${API_URL}/reviews/admin/${review_id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${ud?.token}` }
            });
            if (res.ok) {
                setToast({ message: 'Reseña rechazada', type: 'success' });
                setFlaggedReviews(flaggedReviews.filter(r => r.review_id !== review_id));
            }
        } catch (error) {
            setToast({ message: 'Error al rechazar reseña', type: 'error' });
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchFlaggedReviews();
            checkOllamaHealth();
        }
    }, [activeTab]);

    if (!token) {
        return (
            <div className="adminDashboard-container">
                <div className="alert-box alert-warning">
                    No estás autenticado. <a href="/login">Inicia sesión</a>
                </div>
            </div>
        );
    }

    return (
        <div className="adminDashboard-container">
            <div className="adminDashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
                <div>
                    <h1>Panel de Administración</h1>
                    <p>Gestiona apartamentos, reseñas y reportes</p>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {/* Tabs */}
                    <div style={{ display:'flex', gap:4 }}>
                        <button
                            onClick={() => setActiveTab('apartments')}
                            style={{
                                padding:'8px 16px',
                                border:'none',
                                borderRadius:8,
                                cursor:'pointer',
                                fontWeight:600,
                                background: activeTab === 'apartments' ? '#6A6BEF' : '#e5e7eb',
                                color: activeTab === 'apartments' ? '#fff' : '#374151'
                            }}
                        >
                            <FaBuilding style={{marginRight:6}} /> Apartamentos
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            style={{
                                padding:'8px 16px',
                                border:'none',
                                borderRadius:8,
                                cursor:'pointer',
                                fontWeight:600,
                                background: activeTab === 'reviews' ? '#6A6BEF' : '#e5e7eb',
                                color: activeTab === 'reviews' ? '#fff' : '#374151',
                                display:'flex',
                                alignItems:'center',
                                gap:6
                            }}
                        >
                            <FontAwesomeIcon icon={faStar} /> Reseñas
                        </button>
                    </div>
                    
                    {/* Notifications */}
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                        style={{ background:'none', border:'1px solid #6A6BEF', borderRadius:8, padding:'8px 14px', cursor:'pointer', color:'#6A6BEF', display:'flex', alignItems:'center', gap:6, fontWeight:600 }}
                    >
                        <FaBell />
                        {unreadCount > 0 && (
                            <span style={{ background:'#E24B4A', color:'#fff', borderRadius:'50%', fontSize:11, minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                                {unreadCount}
                            </span>
                        )}
                        Alertas
                    </button>
                    {showNotifications && (
                        <div style={{ position:'absolute', right:0, top:'110%', width:360, background:'#fff', border:'1px solid #ddd', borderRadius:10, boxShadow:'0 4px 20px rgba(0,0,0,0.12)', zIndex:1000, maxHeight:420, overflowY:'auto' }}>
                            <div style={{ padding:'12px 16px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                <span style={{ fontWeight:600, fontSize:14 }}>Notificaciones</span>
                                {unreadCount > 0 && <button onClick={markAllRead} style={{ background:'none', border:'none', color:'#6A6BEF', cursor:'pointer', fontSize:12 }}>Marcar todas como leídas</button>}
                            </div>
                            {notifications.length === 0
                                ? <div style={{ padding:20, textAlign:'center', color:'#888', fontSize:13 }}>Sin notificaciones</div>
                                : notifications.map(n => (
                                    <div key={n.id} onClick={() => markNotificationRead(n.id)}
                                        style={{ padding:'12px 16px', borderBottom:'1px solid #f0f0f0', cursor:'pointer', background:n.read_at ? '#fff' : '#f5f5ff' }}
                                    >
                                        <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                                            <span style={{ fontSize:18 }}>{n.type === 'review_flagged' ? <FontAwesomeIcon icon={faFlag} /> : n.type === 'new_review' ? <FontAwesomeIcon icon={faStar} style={{color: '#fbbf24'}} /> : <FontAwesomeIcon icon={faBellSolid} />}</span>
                                            <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontSize:13, fontWeight:n.read_at ? 400 : 600 }}>{n.title}</p>
                                                <p style={{ margin:'2px 0 0', fontSize:12, color:'#666' }}>{n.message}</p>
                                                <p style={{ margin:'4px 0 0', fontSize:11, color:'#aaa' }}>{new Date(n.created_at).toLocaleString('es-CO')}</p>
                                            </div>
                                            {!n.read_at && <span style={{ width:8, height:8, borderRadius:'50%', background:'#6A6BEF', flexShrink:0, marginTop:4 }}></span>}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido basado en pestaña activa */}
            {activeTab === 'reviews' ? (
                /* ===== SECCIÓN DE RESEÑAS ===== */
                <div className="reviews-section">
                    {/* Header de sección */}
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                                Gestión de Reseñas
                            </h2>
                            <p className="text-gray-600 text-sm">Revisa y modera reseñas marcadas por la IA</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Estado de Ollama */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                ollamaStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                <FontAwesomeIcon icon={faRobot} />
                                <span className="text-sm font-medium">
                                    Ollama: {ollamaStatus === 'online' ? 'En línea' : 'Apagado'}
                                </span>
                            </div>
                            
                            {/* Botón analizar */}
                            <button
                                onClick={handleAnalyzeAllReviews}
                                disabled={analyzingReviews || ollamaStatus !== 'online'}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                {analyzingReviews ? (
                                    <><FaSpinner className="spinning" /> Analizando...</>
                                ) : (
                                    <><FontAwesomeIcon icon={faRobot} /> Analizar Reseñas con IA</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Lista de reseñas marcadas */}
                    {reviewsLoading ? (
                        <div className="loadingSpinner">
                            <FaSpinner className="spinning" />
                            Cargando reseñas...
                        </div>
                    ) : flaggedReviews.length === 0 ? (
                        <div className="alert-box alert-success flex items-center gap-3">
                            <FontAwesomeIcon icon={faCheck} className="text-xl" />
                            <div>
                                <p className="font-semibold">No hay reseñas pendientes de revisión</p>
                                <p className="text-sm">Todas las reseñas han sido moderadas</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                <FontAwesomeIcon icon={faFlag} className="text-red-500 mr-2" />
                                {flaggedReviews.length} reseña(s) marcada(s) requieren revisión
                            </p>
                            
                            {flaggedReviews.map(review => (
                                <div key={review.review_id} className="review-card p-4 border border-red-200 bg-red-50 rounded-lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                                                    <span className="text-red-700 font-bold">{review.user_name?.charAt(0) || 'U'}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{review.user_name} {review.user_lastname}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {review.barrio || 'Sin barrio'} - {review.direccion_apt}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Estrellas */}
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1,2,3,4,5].map(star => (
                                                    <FontAwesomeIcon 
                                                        key={star}
                                                        icon={faStar}
                                                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                            
                                            {/* Comentario */}
                                            <p className="text-gray-700 mb-2">{review.comment}</p>
                                            
                                            {/* Razón del flag */}
                                            {review.flag_reason && (
                                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-100 p-2 rounded">
                                                    <FontAwesomeIcon icon={faFlag} />
                                                    <span>{review.flag_reason}</span>
                                                </div>
                                            )}
                                            
                                            {/* Sentimiento */}
                                            {review.sentiment && (
                                                <div className="mt-2 text-sm">
                                                    <span className={`px-2 py-1 rounded ${
                                                        review.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                        review.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        Sentimiento: {review.sentiment}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(review.created_at).toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                        
                                        {/* Acciones */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleApproveReview(review.review_id)}
                                                className="btn btn-success btn-sm flex items-center gap-1"
                                                title="Aprobar reseña"
                                            >
                                                <FontAwesomeIcon icon={faCheck} /> Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleRejectReview(review.review_id)}
                                                className="btn btn-danger btn-sm flex items-center gap-1"
                                                title="Rechazar reseña"
                                            >
                                                <FontAwesomeIcon icon={faTimes} /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : loading ? (
                <div className="loadingSpinner">
                    <FaSpinner className="spinning" />
                    Cargando apartamentos...
                </div>
            ) : pendingApartments.length === 0 ? (
                <div className="alert-box alert-success">
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />No hay apartamentos pendientes de aprobación
                </div>
            ) : (
                <>
                    {/* Botón para mostrar sección de reportes */}
                    <div className="mb-6">
                        <button 
                            className="btn btn-primary"
                            onClick={toggleReportsSection}
                        >
                            <FaFilePdf /> {showReportsSection ? 'Ocultar Reportes' : 'Ver Reportes PDF'}
                        </button>
                    </div>

                    {/* Sección de reportes */}
                    {showReportsSection && (
                        <div className="reports-section mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FaFileExcel /> Descargar Reportes Mensuales
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {reports.map((report) => (
                                    <button
                                        key={`${report.year}-${report.month}`}
                                        className="btn btn-secondary flex items-center gap-2"
                                        onClick={() => downloadReport(report.year, report.month)}
                                        disabled={downloadingReport}
                                    >
                                        <FaDownload />
                                        <div className="text-left">
                                            <div className="font-semibold">{report.monthName}</div>
                                            <div className="text-xs">{report.year}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {reports.length === 0 && (
                                <p className="text-gray-500">No hay reportes disponibles</p>
                            )}
                        </div>
                    )}

                    <div className="apartmentsList">
                        {pendingApartments.map(apt => (
                            <div key={apt.id_apt} className="apartmentCard">
                                <div className="cardHeader">
                                    <div className="cardTitle">
                                        <h3>{apt.direccion_apt}</h3>
                                        <span className="badge badge-pending">Pendiente</span>
                                    </div>
                                    <div className="cardMeta">
                                        <small><FaMapMarkerAlt className="mr-1" /> {apt.barrio}</small>
                                        <small><FaUser className="mr-1" /> {apt.user_name} {apt.user_lastname}</small>
                                    </div>
                                </div>

                                <div className="cardDetails">
                                    <div className="detailRow">
                                        <span><FaMoneyBill className="mr-1" /> Precio:</span>
                                        <strong>${apt.price?.toLocaleString('es-CO')}</strong>
                                    </div>
                                    <div className="detailRow">
                                        <span><FaBed className="mr-1" /> Habitaciones:</span>
                                        <strong>{apt.bedrooms}</strong>
                                    </div>
                                    <div className="detailRow">
                                        <span><FaBath className="mr-1" /> Baños:</span>
                                        <strong>{apt.bathrooms}</strong>
                                    </div>
                                    <div className="detailRow">
                                        <span><FaRulerCombined className="mr-1" /> Área:</span>
                                        <strong>{apt.area_m2} m²</strong>
                                    </div>
                                </div>

                                <div className="cardActions">
                                    <button 
                                        className="btn btn-small btn-info w-full"
                                        onClick={() => setSelectedApartmentDetail(apt)}
                                    >
                                        <FaSpinner className="mr-1" /> Ver detalles completos
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    <div className="pagination">
                        <button 
                            disabled={pagination.offset === 0}
                            onClick={() => fetchPendingApartments(Math.max(0, pagination.offset - pagination.limit))}
                        >
                            ← Anterior
                        </button>
                        <span>
                            Mostrando {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total}
                        </span>
                        <button 
                            disabled={pagination.offset + pagination.limit >= pagination.total}
                            onClick={() => fetchPendingApartments(pagination.offset + pagination.limit)}
                        >
                            Siguiente →
                        </button>
                    </div>
                </>
            )}

            {/* Modal de Detalles del Apartamento */}
            {selectedApartmentDetail && (
                <div className="modal-overlay" onClick={() => setSelectedApartmentDetail(null)}>
                    <div className="apartment-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h2>Detalles del Apartamento</h2>
                            <button className="close-modal-btn" onClick={() => setSelectedApartmentDetail(null)}>
                                ×
                            </button>
                        </div>
                        <div className="detail-modal-content">
                            <div className="detail-section">
                                <h3><FaMapMarkerAlt /> Ubicación</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Dirección:</label>
                                        <span>{selectedApartmentDetail.direccion_apt}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Barrio:</label>
                                        <span>{selectedApartmentDetail.barrio}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h3><FaUser /> Información del Propietario</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Nombre:</label>
                                        <span>{selectedApartmentDetail.user_name} {selectedApartmentDetail.user_lastname}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedApartmentDetail.user_email || 'No disponible'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Teléfono:</label>
                                        <span>{selectedApartmentDetail.user_phonenumber || 'No disponible'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><FaMoneyBill /> Precio y Características</h3>
                                <div className="detail-grid characteristics-grid">
                                    <div className="detail-item highlight">
                                        <label>Precio:</label>
                                        <span className="price-value">${selectedApartmentDetail.price?.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FaBed /> Habitaciones:</label>
                                        <span>{selectedApartmentDetail.bedrooms}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FaBath /> Baños:</label>
                                        <span>{selectedApartmentDetail.bathrooms}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FaRulerCombined /> Área:</label>
                                        <span>{selectedApartmentDetail.area_m2} m²</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FaBuilding /> Piso:</label>
                                        <span>{selectedApartmentDetail.floor || 'No especificado'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Ascensor:</label>
                                        <span>{selectedApartmentDetail.elevator ? 'Sí' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedApartmentDetail.description && (
                                <div className="detail-section">
                                    <h3><FaEdit /> Descripción</h3>
                                    <p className="description-text">{selectedApartmentDetail.description}</p>
                                </div>
                            )}

                            {selectedApartmentDetail.amenities && selectedApartmentDetail.amenities.length > 0 && (
                                <div className="detail-section">
                                    <h3><FaCheckCircle /> Comodidades</h3>
                                    <div className="amenities-list">
                                        {selectedApartmentDetail.amenities.map((amenity, idx) => (
                                            <span key={idx} className="amenity-tag">{amenity}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <h3><FaImage /> Fotos del Apartamento</h3>
                                <div className="detail-images-grid">
                                    {(() => {
                                        const images = getImageUrls(selectedApartmentDetail.images);
                                        return images.length > 0 ? (
                                            images.map((img, idx) => (
                                                <div key={idx} className="detail-image-wrapper" onClick={() => {
                                                    setModalImages(images);
                                                    setCurrentImageIndex(idx);
                                                    setShowImageModal(true);
                                                }}>
                                                    <img src={img} alt={`Foto ${idx + 1}`} />
                                                    <span className="image-overlay"><FaImage /> Ver</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-images">No hay imágenes disponibles</p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="detail-modal-actions">
                            <button className="btn btn-success" onClick={() => {
                                handleApprove(selectedApartmentDetail.id_apt);
                                setSelectedApartmentDetail(null);
                            }} disabled={approvingId === selectedApartmentDetail.id_apt}>
                                <FaCheckCircle /> Aprobar
                            </button>
                            <button className="btn btn-danger" onClick={async () => {
                                const reason = prompt('Ingresa el motivo del rechazo:');
                                if (reason && reason.trim()) {
                                    setRejectingId(selectedApartmentDetail.id_apt);
                                    try {
                                        await adminApartmentController.rejectApartment(selectedApartmentDetail.id_apt, reason);
                                        setToast({ message: 'Apartamento rechazado correctamente', type: 'success' });
                                        setPendingApartments(pendingApartments.filter(apt => apt.id_apt !== selectedApartmentDetail.id_apt));
                                        setPagination({ ...pagination, total: pagination.total - 1 });
                                        setSelectedApartmentDetail(null);
                                    } catch (error) {
                                        setToast({ message: error.response?.data?.error || 'Error al rechazar', type: 'error' });
                                    } finally {
                                        setRejectingId(null);
                                    }
                                } else {
                                    setToast({ message: 'Ingresa un motivo para el rechazo', type: 'warning' });
                                }
                            }} disabled={rejectingId === selectedApartmentDetail.id_apt}>
                                <FaTimesCircle /> Rechazar
                            </button>
                            <button className="btn btn-secondary" onClick={() => fetchHistory(selectedApartmentDetail.id_apt)}>
                                <FaHistory /> Ver Historial
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Historial */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Historial de Cambios</h2>
                        {history.length === 0 ? (
                            <p>Sin cambios registrados</p>
                        ) : (
                            <table className="historyTable">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Admin</th>
                                        <th>Cambio</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td>{new Date(entry.action_date).toLocaleDateString('es-CO')}</td>
                                            <td>{entry.admin_name || 'Sistema'}</td>
                                            <td>
                                                <span className={`badge badge-${entry.new_status}`}>
                                                    {entry.new_status === 'approved' ? <><FontAwesomeIcon icon={faCheck} className="mr-1" />Aprobado</> : <><FontAwesomeIcon icon={faTimes} className="mr-1" />Rechazado</>}
                                                </span>
                                            </td>
                                            <td>{entry.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Imagen */}
            {showImageModal && modalImages.length > 0 && (
                <ImageModal 
                    images={modalImages} 
                    currentIndex={currentImageIndex}
                    onClose={() => {
                        setShowImageModal(false);
                        setModalImages([]);
                        setCurrentImageIndex(0);
                    }}
                    onPrev={() => setCurrentImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
                    onNext={() => setCurrentImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))}
                />
            )}

            {/* Toast de notificaciones */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
