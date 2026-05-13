import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHistory, FaSpinner, FaFilePdf, FaDownload, FaBell, FaFileExcel, FaMapMarkerAlt, FaUser, FaMoneyBill, FaBed, FaBath, FaRulerCombined, FaImage, FaEdit, FaTrash, FaInfoCircle, FaBuilding } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faStar, faBell as faBellSolid, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import adminApartmentController from '../apis/adminApartmentController';
import axiosInstance from '../contexts/axiosInstance';
import Toast from './Toast';
import ImageModal from './ImageModal';
import AdminReviewsPanel from './AdminReviewsPanel';
import AdminUsersPanel from './AdminUsersPanel';
import './AdminDashboard.css';
import { initSocket, getSocket } from '../utils/socket';

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
    const [aiStatus, setAiStatus] = useState(null);

    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [userPagination, setUserPagination] = useState({ offset: 0, limit: 20, total: 0 });

    // Stats state
    const [adminStats, setAdminStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const searchTimeoutRef = useRef(null);
    const roleTimeoutRef = useRef(null);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;
    const userId = userData?.id;

    // Socket.io para notificaciones en tiempo real
    useEffect(() => {
        if (userId) {
            const socket = initSocket(userId);
            socket.emit("register_admin");

            socket.on("admin_notification", (notification) => {
                setToast({ message: notification.title, type: 'info' });
                fetchNotifications();
            });

            return () => {
                socket.off("admin_notification");
            };
        }
    }, [userId]);

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

    // Abrir modal de rechazo
    const openRejectModal = (id_apt) => {
        setRejectTargetId(id_apt);
        setRejectReason('');
        setShowRejectModal(true);
    };

    // Ejecutar rechazo desde modal
    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            setToast({ message: 'Ingresa un motivo para el rechazo', type: 'warning' });
            return;
        }

        try {
            setRejectingId(rejectTargetId);
            await adminApartmentController.rejectApartment(rejectTargetId, rejectReason);
            setToast({ message: 'Apartamento rechazado correctamente', type: 'success' });
            setPendingApartments(pendingApartments.filter(apt => apt.id_apt !== rejectTargetId));
            setPagination({ ...pagination, total: pagination.total - 1 });
            setSelectedApartmentDetail(null);
            setShowRejectModal(false);
            setRejectReason('');
            setRejectTargetId(null);
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Error al rechazar', type: 'error' });
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
            const res = await axiosInstance.get('/admin/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount((res.data.notifications || []).filter(n => !n.read_at).length);
        } catch (e) { console.error('Error cargando notificaciones:', e); }
    };

    const markNotificationRead = async (id) => {
        try {
            await axiosInstance.put(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.put('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    // Obtener usuarios
    const fetchUsers = async (offset = 0, roleFilter = null) => {
        try {
            setUsersLoading(true);
            // Asegurar que tengamos el rol correcto
            const currentRole = roleFilter !== null ? roleFilter : userRoleFilter;
            console.log('🔍 Fetching users - offset:', offset, 'role:', currentRole, 'search:', userSearch);
            const params = {
                limit: userPagination.limit,
                offset,
                search: userSearch,
                role: currentRole
            };
            console.log('Fetching users with params:', params);
            const res = await axiosInstance.get('/admin/users', { params });
            console.log('Users response:', res.data);
            console.log('First user sample:', res.data?.users?.[0]);
            if (res.data?.users) {
                setUsers(res.data.users);
                setUserPagination({
                    ...userPagination,
                    offset,
                    total: res.data.total
                });
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al cargar usuarios';
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setUsersLoading(false);
        }
    };

    // Bloquear usuario
    const handleBlockUser = async (userId, reason = 'Bloqueado por admin') => {
        try {
            setActionLoading(userId);
            await axiosInstance.put(`/admin/users/${userId}/block`, { reason });
            setToast({ message: 'Usuario bloqueado exitosamente', type: 'success' });
            fetchUsers(userPagination.offset);
        } catch (error) {
            setToast({ message: 'Error al bloquear usuario', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    // Desbloquear usuario
    const handleUnblockUser = async (userId) => {
        try {
            setActionLoading(userId);
            await axiosInstance.put(`/admin/users/${userId}/unblock`);
            setToast({ message: 'Usuario desbloqueado exitosamente', type: 'success' });
            fetchUsers(userPagination.offset);
        } catch (error) {
            setToast({ message: 'Error al desbloquear usuario', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    // Obtener reportes disponibles
    const fetchReports = async () => {
        try {
            const response = await axiosInstance.get('/admin/reports/available');
            setReports(response.data);
        } catch (error) {
            setToast({ message: 'Error al cargar reportes', type: 'error' });
        }
    };

    // Descargar reporte PDF
    const downloadReport = async (year, month) => {
        try {
            setDownloadingReport(true);
            const response = await axiosInstance.get(`/admin/reports/monthly?year=${year}&month=${month}`, {
                responseType: 'blob'
            });
            const blob = response.data;
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
            const res = await axiosInstance.get('/reviews/admin/flagged');
            const reviews = res.data.reviews?.reviews || res.data.reviews || [];
            setFlaggedReviews(Array.isArray(reviews) ? reviews : []);
        } catch (error) {
            setToast({ message: 'Error al cargar reseñas marcadas', type: 'error' });
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkAIHealth = async () => {
        try {
            const res = await axiosInstance.get('/reviews/admin/ai/health');
            setAiStatus(res.data.data?.ai?.available ? 'online' : 'offline');
        } catch (error) {
            setAiStatus('offline');
        }
    };

    const handleAnalyzeAllReviews = async () => {
        try {
            setAnalyzingReviews(true);
            const res = await axiosInstance.post('/reviews/admin/analyze-pending', { batchSize: 50 });
            setToast({ message: res.data.message || 'Análisis completado', type: 'success' });
            fetchFlaggedReviews();
            checkAIHealth();
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Error en análisis', type: 'error' });
        } finally {
            setAnalyzingReviews(false);
        }
    };

    const handleApproveReview = async (review_id) => {
        try {
            const res = await axiosInstance.post(`/reviews/admin/${review_id}/approve`);
            if (res.data) {
                setToast({ message: 'Reseña aprobada', type: 'success' });
                setFlaggedReviews(flaggedReviews.filter(r => r.review_id !== review_id));
            }
        } catch (error) {
            setToast({ message: 'Error al aprobar reseña', type: 'error' });
        }
    };

    const handleRejectReview = async (review_id) => {
        try {
            const res = await axiosInstance.post(`/reviews/admin/${review_id}/reject`, { notes: 'Rechazada por el administrador' });
            if (res.data) {
                setToast({ message: 'Reseña rechazada', type: 'success' });
                setFlaggedReviews(flaggedReviews.filter(r => r.review_id !== review_id));
            }
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Error al rechazar reseña', type: 'error' });
        }
    };

    const fetchAdminStats = async () => {
        try {
            setStatsLoading(true);
            const res = await axiosInstance.get('/stats/admin');
            setAdminStats(res.data);
        } catch (e) {
            console.error('Error cargando stats:', e);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchFlaggedReviews();
            checkAIHealth();
        } else if (activeTab === 'users') {
            fetchUsers(0, userRoleFilter);
        } else if (activeTab === 'stats') {
            fetchAdminStats();
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
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', position:'relative' }}>
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
                         <button
                             onClick={() => { setActiveTab('users'); if (activeTab !== 'users') fetchUsers(0); }}
                             style={{
                                 padding:'8px 16px',
                                 border:'none',
                                 borderRadius:8,
                                 cursor:'pointer',
                                 fontWeight:600,
                                 background: activeTab === 'users' ? '#6A6BEF' : '#e5e7eb',
                                 color: activeTab === 'users' ? '#fff' : '#374151',
                                 display:'flex',
                                 alignItems:'center',
                                 gap:6
                             }}
                         >
                              <FaUser style={{marginRight:6}} /> Usuarios
                          </button>
                          <button
                              onClick={() => setActiveTab('stats')}
                              style={{
                                  padding:'8px 16px',
                                  border:'none',
                                  borderRadius:8,
                                  cursor:'pointer',
                                  fontWeight:600,
                                  background: activeTab === 'stats' ? '#6A6BEF' : '#e5e7eb',
                                  color: activeTab === 'stats' ? '#fff' : '#374151',
                                  display:'flex',
                                  alignItems:'center',
                                  gap:6
                              }}
                          >
                              <FontAwesomeIcon icon={faStar} /> Estadísticas
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
                <AdminReviewsPanel
                    flaggedReviews={flaggedReviews}
                    reviewsLoading={reviewsLoading}
                    aiStatus={aiStatus}
                    analyzingReviews={analyzingReviews}
                    handleAnalyzeAllReviews={handleAnalyzeAllReviews}
                    handleApproveReview={handleApproveReview}
                    handleRejectReview={handleRejectReview}
                />
            ) : activeTab === 'users' ? (
                <AdminUsersPanel
                    users={users}
                    usersLoading={usersLoading}
                    userSearch={userSearch}
                    userRoleFilter={userRoleFilter}
                    userPagination={userPagination}
                    actionLoading={actionLoading}
                    searchTimeoutRef={searchTimeoutRef}
                    roleTimeoutRef={roleTimeoutRef}
                    setUserSearch={setUserSearch}
                    setUserRoleFilter={setUserRoleFilter}
                    setUsersLoading={setUsersLoading}
                    setUsers={setUsers}
                    fetchUsers={fetchUsers}
                    handleBlockUser={handleBlockUser}
                    handleUnblockUser={handleUnblockUser}
                    setShowBlockModal={setShowBlockModal}
                    setUserToBlock={setUserToBlock}
                />
            ) : activeTab === 'stats' ? (
                <div className="adminDashboard-section" style={{padding:16}}>
                    {statsLoading ? (
                        <div className="loadingSpinner"><FaSpinner className="spinning" /> Cargando estadísticas...</div>
                    ) : !adminStats ? (
                        <div className="alert-box alert-warning">No hay datos disponibles</div>
                    ) : (
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16}}>
                            <div className="stat-card" style={{background:'#EEF2FF', borderRadius:12, padding:16}}>
                                <h4 style={{margin:0, color:'#4F46E5', fontSize:13}}>Usuarios</h4>
                                <p style={{margin:'8px 0 0', fontSize:28, fontWeight:700, color:'#1E1B4B'}}>{adminStats.users?.total_users || 0}</p>
                                <p style={{margin:'4px 0 0', fontSize:12, color:'#6B7280'}}>
                                    {adminStats.users?.total_landlords || 0} arrendadores · {adminStats.users?.total_tenants || 0} inquilinos
                                </p>
                            </div>
                            <div className="stat-card" style={{background:'#F0FDF4', borderRadius:12, padding:16}}>
                                <h4 style={{margin:0, color:'#16A34A', fontSize:13}}>Apartamentos</h4>
                                <p style={{margin:'8px 0 0', fontSize:28, fontWeight:700, color:'#14532D'}}>{adminStats.apartments?.total_apartments || 0}</p>
                                <p style={{margin:'4px 0 0', fontSize:12, color:'#6B7280'}}>
                                    {adminStats.apartments?.approved_apartments || 0} aprobados · {adminStats.apartments?.pending_apartments || 0} pendientes
                                </p>
                            </div>
                            <div className="stat-card" style={{background:'#FFF7ED', borderRadius:12, padding:16}}>
                                <h4 style={{margin:0, color:'#EA580C', fontSize:13}}>Contratos activos</h4>
                                <p style={{margin:'8px 0 0', fontSize:28, fontWeight:700, color:'#7C2D12'}}>{adminStats.contracts?.active_contracts || 0}</p>
                                <p style={{margin:'4px 0 0', fontSize:12, color:'#6B7280'}}>
                                    ${Number(adminStats.contracts?.monthly_revenue || 0).toLocaleString()} /mes
                                </p>
                            </div>
                            <div className="stat-card" style={{background:'#F5F3FF', borderRadius:12, padding:16}}>
                                <h4 style={{margin:0, color:'#7C3AED', fontSize:13}}>Total contratos</h4>
                                <p style={{margin:'8px 0 0', fontSize:28, fontWeight:700, color:'#3B0764'}}>{adminStats.contracts?.total_contracts || 0}</p>
                                <p style={{margin:'4px 0 0', fontSize:12, color:'#6B7280'}}>
                                    {adminStats.contracts?.expired_contracts || 0} vencidos
                                </p>
                            </div>
                            {adminStats.topLandlords?.length > 0 && (
                                <div className="stat-card" style={{gridColumn:'1 / -1', background:'#FFFBEB', borderRadius:12, padding:16}}>
                                    <h4 style={{margin:0, color:'#D97706', fontSize:13}}>Top arrendadores</h4>
                                    {adminStats.topLandlords.map((l, i) => (
                                        <p key={l.user_id} style={{margin:'8px 0 0', fontSize:14, color:'#1F2937'}}>
                                            #{i+1} {l.user_name} {l.user_lastname} — {l.total_apartments} aptos
                                        </p>
                                    ))}
                                </div>
                            )}
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

                            {Array.isArray(selectedApartmentDetail.amenities) && selectedApartmentDetail.amenities.length > 0 && (
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
                            <button className="btn btn-danger" onClick={() => openRejectModal(selectedApartmentDetail.id_apt)} disabled={rejectingId === selectedApartmentDetail.id_apt}>
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

            {/* Modal de bloqueo de usuario */}
            {showBlockModal && userToBlock && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Bloquear Usuario</h3>
                        <div className="user-info">
                            <p><strong>Nombre:</strong> {userToBlock.user_name} {userToBlock.user_lastname}</p>
                            <p><strong>Email:</strong> {userToBlock.user_email}</p>
                            <p><strong>Rol:</strong> {userToBlock.rol_id === 3 ? 'Admin' : userToBlock.rol_id === 2 ? 'Arrendador' : 'Usuario'}</p>
                        </div>
                        <div className="form-group">
                            <label>Motivo del bloqueo:</label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Ingresa el motivo del bloqueo..."
                                className="form-control"
                                rows="4"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    if (blockReason.trim()) {
                                        handleBlockUser(userToBlock.user_id, blockReason);
                                        setShowBlockModal(false);
                                        setBlockReason('');
                                        setUserToBlock(null);
                                    }
                                }}
                                disabled={!blockReason.trim() || actionLoading === userToBlock.user_id}
                            >
                                {actionLoading === userToBlock.user_id ? <FaSpinner className="spinning" /> : 'Bloquear'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowBlockModal(false);
                                    setBlockReason('');
                                    setUserToBlock(null);
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de rechazo de apartamento */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Rechazar Apartamento</h3>
                        <div className="form-group">
                            <label>Motivo del rechazo:</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Ingresa el motivo del rechazo..."
                                className="form-control"
                                rows="4"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-danger"
                                onClick={confirmReject}
                                disabled={!rejectReason.trim() || rejectingId === rejectTargetId}
                            >
                                {rejectingId === rejectTargetId ? <FaSpinner className="spinning" /> : 'Rechazar'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setRejectTargetId(null);
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
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

