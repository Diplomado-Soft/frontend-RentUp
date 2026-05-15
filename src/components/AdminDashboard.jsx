import React, { useEffect, useState, useRef } from 'react';
import {
  FaCheckCircle, FaTimesCircle, FaHistory, FaSpinner, FaFilePdf,
  FaDownload, FaBell, FaMapMarkerAlt, FaUser, FaMoneyBill,
  FaImage, FaEdit, FaBuilding, FaSearch,
  FaStar, FaChartBar, FaUsers, FaHome,
  FaFileAlt, FaDollarSign, FaChevronLeft, FaChevronRight,
  FaRobot, FaShieldAlt, FaInfoCircle, FaUserTimes,
  FaEnvelope, FaPhone, FaFrown, FaChartLine, FaBrain
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag as faFlagSolid, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import adminApartmentController from '../apis/adminApartmentController';
import axiosInstance from '../contexts/axiosInstance';
import Toast from './Toast';
import ImageModal from './ImageModal';
import './AdminDashboard.css';
import { initSocket } from '../utils/socket';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('apartments');
  const [pendingApartments, setPendingApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartmentDetail, setSelectedApartmentDetail] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, total: 0 });
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportsSection, setShowReportsSection] = useState(false);
  const [reports, setReports] = useState([]);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [adminStats, setAdminStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [occupationTrend, setOccupationTrend] = useState(null);
  const [revenueByZone, setRevenueByZone] = useState(null);
  const [vacancyRate, setVacancyRate] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const notifRef = useRef(null);

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
  const searchTimeoutRef = useRef(null);
  const roleTimeoutRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const token = userData?.token;
  const userId = userData?.id;

  const tabs = [
    { id: 'apartments', label: 'Apartamentos', icon: FaBuilding },
    { id: 'reviews', label: 'Reseñas', icon: FaStar },
    { id: 'users', label: 'Usuarios', icon: FaUsers },
    { id: 'stats', label: 'Estadísticas', icon: FaChartBar },
  ];

  useEffect(() => {
    if (userId) {
      const socket = initSocket(userId);
      socket.emit("register_admin");
      socket.on("admin_notification", (notification) => {
        setToast({ message: notification.title, type: 'info' });
        fetchNotifications();
      });
      return () => { socket.off("admin_notification"); };
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPendingApartments(0);
    fetchNotifications();
  }, []);

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

  const fetchPendingApartments = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await adminApartmentController.getPendingApartments(pagination.limit, offset);
      setPendingApartments(response.data.apartments);
      setPagination({ offset, limit: response.data.limit, total: response.data.total });
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al cargar apartamentos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (id_apt) => {
    try {
      const response = await adminApartmentController.getApprovalHistory(id_apt);
      setHistory(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      setToast({ message: 'Error al cargar el historial', type: 'error' });
    }
  };

  const handleApprove = async (id_apt) => {
    try {
      setApprovingId(id_apt);
      await adminApartmentController.approveApartment(id_apt, '');
      setToast({ message: 'Apartamento aprobado correctamente', type: 'success' });
      setPendingApartments(pendingApartments.filter(apt => apt.id_apt !== id_apt));
      setPagination({ ...pagination, total: pagination.total - 1 });
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al aprobar', type: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (id_apt) => {
    setRejectTargetId(id_apt);
    setRejectReason('');
    setShowRejectModal(true);
  };

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

  const getImageUrls = (images) => {
    if (Array.isArray(images) && images[0]?.url) return images.map(img => img.url);
    if (typeof images === 'string') return images.split(",").filter(url => url.trim());
    if (Array.isArray(images)) return images;
    return [];
  };

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

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get('/admin/reports/available');
      setReports(response.data);
    } catch (error) {
      setToast({ message: 'Error al cargar reportes', type: 'error' });
    }
  };

  const downloadReport = async (year, month) => {
    try {
      setDownloadingReport(true);
      const response = await axiosInstance.get(`/admin/reports/monthly?year=${year}&month=${month}`, { responseType: 'blob' });
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

  const toggleReportsSection = () => {
    if (!showReportsSection) fetchReports();
    setShowReportsSection(!showReportsSection);
  };

  // === REVIEWS FUNCTIONS ===
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

  // === USERS FUNCTIONS ===
  const fetchUsers = async (offset = 0, roleFilter = null) => {
    try {
      setUsersLoading(true);
      const currentRole = roleFilter !== null ? roleFilter : userRoleFilter;
      const params = { limit: userPagination.limit, offset, search: userSearch, role: currentRole };
      const res = await axiosInstance.get('/admin/users', { params });
      if (res.data?.users) {
        setUsers(res.data.users);
        setUserPagination({ ...userPagination, offset, total: res.data.total });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Error al cargar usuarios';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

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

  // === STATS FUNCTIONS ===
  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const [statsRes, trendRes, revenueRes, vacancyRes] = await Promise.all([
        axiosInstance.get('/stats/admin'),
        axiosInstance.get('/stats/occupation-trend?days=30'),
        axiosInstance.get('/stats/revenue-by-zone'),
        axiosInstance.get('/stats/vacancy-rate')
      ]);
      setAdminStats(statsRes.data);
      setOccupationTrend(trendRes.data);
      setRevenueByZone(revenueRes.data);
      setVacancyRate(vacancyRes.data);
    } catch (e) {
      console.error('Error cargando stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-ambient-md max-w-md text-center">
          <FaShieldAlt className="text-5xl text-primary mx-auto mb-4" />
          <h2 className="text-headline-md mb-2">Acceso Restringido</h2>
          <p className="text-on-surface-variant mb-6">No estás autenticado. Inicia sesión para acceder al panel.</p>
          <a href="/login" className="btn-primary inline-block">Iniciar Sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-headline-lg text-[#0B1C30] font-headline">Panel de Administración</h1>
            <p className="text-on-surface-variant text-body-md">Gestiona apartamentos, reseñas, usuarios y reportes</p>
          </div>
          <div className="flex items-center gap-3 relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
              className="relative px-4 py-2.5 rounded-lg border border-[#5849E4]/30 text-[#5849E4] hover:bg-[#5849E4]/5 transition-all duration-200 flex items-center gap-2 font-semibold text-sm"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-danger-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
                  {unreadCount}
                </span>
              )}
              Alertas
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-ambient-lg border-0 z-50 animate-fade-in">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-[#0B1C30] text-sm">Notificaciones</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-[#5849E4] hover:text-[#3f2acc] transition-colors">
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-outline text-sm">Sin notificaciones</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3.5 cursor-pointer transition-colors flex gap-3 items-start ${
                          n.read_at ? 'bg-white hover:bg-gray-50' : 'bg-[#F5F3FF] hover:bg-[#EDE9FE]'
                        }`}
                      >
                        <span className="text-lg mt-0.5 flex-shrink-0">
                          {n.type === 'review_flagged' ? <FontAwesomeIcon icon={faFlagSolid} className="text-danger-500" /> :
                           n.type === 'new_review' ? <FontAwesomeIcon icon={faStarSolid} className="text-warning-400" /> :
                           <FaBell className="text-primary" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.read_at ? 'text-on-surface' : 'font-semibold text-[#0B1C30]'}`}>{n.title}</p>
                          <p className="text-xs text-outline mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-outline/60 mt-1">{new Date(n.created_at).toLocaleString('es-CO')}</p>
                        </div>
                        {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#5849E4] flex-shrink-0 mt-2" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-1.5 shadow-ambient-sm mb-6 inline-flex flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#5849E4] text-white shadow-ambient-sm'
                    : 'text-on-surface-variant hover:bg-[#F5F3FF] hover:text-[#5849E4]'
                }`}
              >
                <Icon className={isActive ? '' : 'text-lg'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* === APARTMENTS TAB === */}
        {activeTab === 'apartments' && (
          <>
            <div className="mb-6">
              <button
                onClick={toggleReportsSection}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg border border-[#5849E4]/20 text-[#5849E4] font-semibold text-sm hover:bg-[#5849E4]/5 transition-all duration-200 shadow-ambient-sm"
              >
                <FaFilePdf />
                {showReportsSection ? 'Ocultar Reportes PDF' : 'Ver Reportes PDF'}
              </button>
            </div>
            {showReportsSection && (
              <div className="bg-white rounded-xl p-6 shadow-ambient-sm mb-6 animate-fade-in">
                <h3 className="text-headline-sm text-[#0B1C30] mb-4 flex items-center gap-2">
                  <FaDownload className="text-[#5849E4]" />
                  Descargar Reportes Mensuales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {reports.map((report) => (
                    <button
                      key={`${report.year}-${report.month}`}
                      onClick={() => downloadReport(report.year, report.month)}
                      disabled={downloadingReport}
                      className="flex items-center gap-3 px-4 py-3 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5849E4] rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      <FaDownload className="flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">{monthNames[report.month - 1]}</div>
                        <div className="text-xs opacity-70">{report.year}</div>
                      </div>
                    </button>
                  ))}
                  {reports.length === 0 && <p className="text-outline text-sm col-span-full">No hay reportes disponibles</p>}
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
                <span className="ml-3 text-on-surface-variant">Cargando apartamentos...</span>
              </div>
            ) : pendingApartments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
                <FaCheckCircle className="text-5xl text-success mx-auto mb-4" />
                <h3 className="text-headline-sm text-[#0B1C30] mb-2">No hay apartamentos pendientes</h3>
                <p className="text-on-surface-variant">Todos los apartamentos han sido revisados</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
                    <FaHome className="text-[#5849E4]" />
                    Aprobación de Apartamentos
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-warning-50 text-warning-700 text-xs font-semibold">{pagination.total} pendientes</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingApartments.map(apt => (
                    <div key={apt.id_apt} className="bg-white rounded-xl p-5 shadow-ambient-sm hover:shadow-ambient-md transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-headline font-semibold text-[#0B1C30] text-base truncate">{apt.direccion_apt}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-on-surface-variant">
                            <FaMapMarkerAlt className="text-[#5849E4]/60 text-xs flex-shrink-0" />
                            <span className="truncate">{apt.barrio}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-on-surface-variant">
                            <FaUser className="text-[#5849E4]/60 text-xs flex-shrink-0" />
                            <span className="truncate">{apt.user_name} {apt.user_lastname}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-warning-50 text-warning-700 text-xs font-semibold whitespace-nowrap ml-2">Pendiente</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        <div className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <p className="text-[11px] text-outline font-medium">Precio</p>
                          <p className="text-sm font-bold text-[#0B1C30]">${apt.price?.toLocaleString('es-CO')}</p>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <p className="text-[11px] text-outline font-medium">Habitaciones</p>
                          <p className="text-sm font-bold text-[#0B1C30]">{apt.bedrooms}</p>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <p className="text-[11px] text-outline font-medium">Baños</p>
                          <p className="text-sm font-bold text-[#0B1C30]">{apt.bathrooms}</p>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <p className="text-[11px] text-outline font-medium">Área</p>
                          <p className="text-sm font-bold text-[#0B1C30]">{apt.area_m2} m²</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedApartmentDetail(apt)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#5849E4]/30 text-[#5849E4] font-semibold text-sm hover:bg-[#5849E4]/5 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FaEdit className="text-xs" />
                        Ver Detalles
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    disabled={pagination.offset === 0}
                    onClick={() => fetchPendingApartments(Math.max(0, pagination.offset - pagination.limit))}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <FaChevronLeft className="text-xs" /> Anterior
                  </button>
                  <span className="text-sm text-on-surface-variant">
                    {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total}
                  </span>
                  <button
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    onClick={() => fetchPendingApartments(pagination.offset + pagination.limit)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Siguiente <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* === REVIEWS TAB === */}
        {activeTab === 'reviews' && (
          <div>
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-16">
                <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
                <span className="ml-3 text-on-surface-variant">Cargando reseñas...</span>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
                      <FaStar className="text-warning-400" />
                      Gestión de Reseñas
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        aiStatus === 'online' ? 'bg-[#DCFCE7] text-[#15803D]' : aiStatus === null ? 'bg-gray-100 text-gray-500' : 'bg-danger-50 text-danger-700'
                      }`}>
                        {aiStatus === null ? (
                          <FaSpinner className="animate-spin text-[10px]" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${aiStatus === 'online' ? 'bg-[#15803D] animate-pulse' : 'bg-danger-700'}`} />
                        )}
                        IA: {aiStatus === null ? 'Verificando...' : aiStatus === 'online' ? 'Online' : 'Apagado'}
                      </span>
                      <span className="text-xs text-on-surface-variant">• Supervisando actividad en tiempo real</span>
                    </div>
                  </div>
                  <button
                    onClick={handleAnalyzeAllReviews}
                    disabled={analyzingReviews || aiStatus !== 'online'}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#2170E4] text-[#2170E4] rounded-lg font-semibold text-sm hover:bg-[#2170E4] hover:text-white transition-all duration-200 disabled:opacity-50"
                  >
                    {analyzingReviews ? <FaSpinner className="animate-spin" /> : <FaRobot />}
                    Analizar con IA
                  </button>
                </div>

                {/* Empty state */}
                {flaggedReviews.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
                    <FaCheckCircle className="text-5xl text-success mx-auto mb-4" />
                    <h3 className="text-headline-sm text-[#0B1C30] mb-2">No hay reseñas pendientes de revisión</h3>
                    <p className="text-on-surface-variant">Todas las reseñas han sido moderadas</p>
                  </div>
                ) : (
                  <>
                    {/* Reviews Table Container */}
                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden mb-6">
                      <div className="px-6 py-4 bg-[#F8FAFC] border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-headline font-semibold text-[#0B1C30] text-sm">Reseñas Marcadas para Revisión</h3>
                        <span className="bg-[#FFDAD6] text-[#93000A] px-3 py-1 rounded-full text-xs font-semibold">
                          {flaggedReviews.length} Críticas detectadas
                        </span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {flaggedReviews.map(review => {
                          const stars = review.rating || 0;
                          const sentimentLabel = review.sentiment === 'positive' ? 'Positivo' : review.sentiment === 'negative' ? 'Crítico' : 'Neutral';
                          const isCritical = review.sentiment === 'negative' || (review.flag_reason && !review.sentiment);
                          return (
                            <div key={review.review_id} className="p-6 hover:bg-[#F8FAFC] transition-colors flex flex-col lg:flex-row gap-6 items-start">
                              <div className="flex items-center gap-4 min-w-[220px]">
                                <div className="w-12 h-12 rounded-full bg-[#5849E4]/10 flex items-center justify-center text-[#5849E4] font-bold text-sm flex-shrink-0">
                                  {(review.user_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-[#0B1C30] text-sm">{review.user_name} {review.user_lastname}</h4>
                                  <p className="text-xs text-outline">{review.barrio || 'Apartamento'} {review.direccion_apt ? `#${review.direccion_apt}` : ''}</p>
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex gap-0.5 text-amber-400">
                                    {[1,2,3,4,5].map(s => (
                                      <FaStar key={s} className={s <= stars ? 'text-amber-400' : 'text-gray-300'} />
                                    ))}
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-tight ${
                                    isCritical ? 'bg-[#FFDAD6] text-[#93000A]' : 'bg-[#DCFCE7] text-[#15803D]'
                                  }`}>
                                    {isCritical ? 'Crítico' : sentimentLabel}
                                  </span>
                                  <span className="text-xs text-outline">{new Date(review.created_at).toLocaleString('es-CO')}</span>
                                </div>
                                <p className="text-sm text-on-surface leading-relaxed max-w-3xl">
                                  &ldquo;{review.comment}&rdquo;
                                </p>
                              </div>
                              <div className="flex lg:flex-col gap-2 w-full lg:w-auto flex-shrink-0">
                                <button onClick={() => handleApproveReview(review.review_id)}
                                  className="flex-1 lg:w-32 bg-[#DCFCE7] text-[#15803D] py-2 rounded-lg text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1">
                                  <FaCheckCircle /> Aprobar
                                </button>
                                <button onClick={() => handleRejectReview(review.review_id)}
                                  className="flex-1 lg:w-32 bg-[#FFDAD6] text-[#93000A] py-2 rounded-lg text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1">
                                  <FaTimesCircle /> Rechazar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {flaggedReviews.length > 0 && (
                        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-gray-100 flex items-center justify-between">
                          <p className="text-xs text-outline">Mostrando {flaggedReviews.length} reseña(s) pendiente(s)</p>
                          <div className="flex gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-outline hover:bg-gray-50 transition-colors">
                              <FaChevronLeft className="text-xs" />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-outline hover:bg-gray-50 transition-colors">
                              <FaChevronRight className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Insights Mini Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <FaFrown className="text-xl text-[#5849E4]" />
                          <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Principales Quejas</h4>
                        </div>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-center text-sm">
                            <span className="text-on-surface-variant">Mantenimiento</span>
                            <span className="font-bold text-[#93000A]">42%</span>
                          </li>
                          <li className="flex justify-between items-center text-sm">
                            <span className="text-on-surface-variant">Ruido</span>
                            <span className="font-bold text-[#93000A]">28%</span>
                          </li>
                          <li className="flex justify-between items-center text-sm">
                            <span className="text-on-surface-variant">Atención Cliente</span>
                            <span className="font-bold text-[#93000A]">15%</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <FaChartLine className="text-xl text-[#5849E4]" />
                          <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Sentimiento Semanal</h4>
                        </div>
                        <div className="flex items-end gap-2 h-20">
                          {[40, 60, 45, 70, 85, 75, 60].map((h, i) => (
                            <div key={i} className={`w-full rounded-t-sm ${i >= 4 ? 'bg-[#5849E4]' : 'bg-[#5849E4]/20'}`} style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <p className="mt-4 text-[11px] text-outline uppercase tracking-widest text-center">Tendencia: Alcista</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#E0EEFF] text-[#004395] rounded-full flex items-center justify-center mb-3">
                          <FaBrain className="text-xl" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Automatización Activa</h4>
                        <p className="text-xs text-on-surface-variant px-4">La IA ha respondido automáticamente a 45 reseñas positivas esta semana.</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
                <FaUsers className="text-info-500" />
                Gestión de Usuarios
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">Administra los permisos y el estado de todos los miembros de la plataforma.</p>
            </div>
            <div className="mb-6 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-sm" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = setTimeout(() => fetchUsers(0, userRoleFilter), 500);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#5849E4] focus:ring-2 focus:ring-[#5849E4]/10 transition-all outline-none"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setUserRoleFilter(newRole);
                  setUsers([]);
                  setUsersLoading(true);
                  clearTimeout(roleTimeoutRef.current);
                  roleTimeoutRef.current = setTimeout(() => fetchUsers(0, newRole), 50);
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#5849E4] focus:ring-2 focus:ring-[#5849E4]/10 transition-all outline-none"
              >
                <option value="">Filtrar por Rol</option>
                <option value="0">Sin rol</option>
                <option value="1">Usuario</option>
                <option value="2">Arrendador</option>
                <option value="3">Admin</option>
              </select>
            </div>
            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
                <span className="ml-3 text-on-surface-variant">Cargando usuarios...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
                <FaInfoCircle className="text-4xl text-outline mx-auto mb-4" />
                <p className="text-on-surface-variant">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map(user => {
                  const roleColors = {
                    3: { badge: 'bg-[#E0DCFF] text-[#3A23C8]' },
                    2: { badge: 'bg-[#DCFCE7] text-[#15803D]' },
                    1: { badge: 'bg-[#DBEAFE] text-[#1D4ED8]' }
                  };
                  const rc = roleColors[user.rol_id] || { badge: 'bg-gray-100 text-gray-500' };
                  return (
                    <div key={user.user_id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                            user.is_active ? 'bg-[#5849E4]' : 'bg-danger-500'
                          }`}>
                            {(user.user_name || 'U').charAt(0).toUpperCase()}
                            {(user.user_lastname || '').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-headline font-semibold text-[#0B1C30] text-base">{user.user_name} {user.user_lastname}</h3>
                            <p className="text-xs text-outline/70">ID: #{user.user_id}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rc.badge}`}>
                          {user.rol_id === 3 ? 'Admin' : user.rol_id === 2 ? 'Arrendador' : user.rol_id === 1 ? 'Usuario' : 'Sin rol'}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <FaEnvelope className="text-outline text-sm flex-shrink-0" />
                          <span className="text-sm truncate">{user.user_email}</span>
                        </div>
                        {user.user_phonenumber && (
                          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <FaPhone className="text-outline text-sm flex-shrink-0" />
                            <span className="text-sm">{user.user_phonenumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-success-500' : 'bg-danger-500'}`} />
                          <span className="text-xs font-medium text-on-surface-variant">{user.is_active ? 'Activo' : 'Bloqueado'}</span>
                        </div>
                        {actionLoading === user.user_id ? (
                          <FaSpinner className="animate-spin text-outline" />
                        ) : user.is_active ? (
                          <button
                            onClick={() => { setUserToBlock(user); setBlockReason(''); setShowBlockModal(true); }}
                            disabled={user.rol_id === 3}
                            className="text-sm font-medium text-[#5849E4] border border-[#5849E4]/40 px-4 py-1.5 rounded-lg hover:bg-[#F5F3FF] transition-all disabled:opacity-40"
                          >
                            Bloquear
                          </button>
                        ) : (
                          <button onClick={() => handleUnblockUser(user.user_id)}
                            className="text-sm font-medium text-white bg-[#5849E4] px-4 py-1.5 rounded-lg hover:bg-[#3f2acc] transition-all"
                          >
                            Desbloquear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {users.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm text-on-surface-variant">
                  Mostrando {userPagination.offset + 1}-{Math.min(userPagination.offset + userPagination.limit, userPagination.total)} de {userPagination.total} usuarios
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={userPagination.offset === 0}
                    onClick={() => fetchUsers(Math.max(0, userPagination.offset - userPagination.limit))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-on-surface-variant hover:bg-gray-50 transition-all disabled:opacity-40"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#5849E4] text-white text-sm font-medium">1</button>
                  <span className="text-xs text-outline">...</span>
                  <button
                    disabled={userPagination.offset + userPagination.limit >= userPagination.total}
                    onClick={() => fetchUsers(userPagination.offset + userPagination.limit)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-on-surface-variant hover:bg-gray-50 transition-all disabled:opacity-40"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === STATS TAB === */}
        {activeTab === 'stats' && (
          <div className="max-w-[1200px]">
            {statsLoading ? (
              <div className="flex items-center justify-center py-16">
                <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
                <span className="ml-3 text-on-surface-variant">Cargando estadísticas...</span>
              </div>
            ) : !adminStats ? (
              <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
                <FaChartBar className="text-5xl text-outline mx-auto mb-4" />
                <h3 className="text-headline-sm text-[#0B1C30] mb-2">Sin datos disponibles</h3>
                <p className="text-on-surface-variant">No hay estadísticas para mostrar</p>
              </div>
            ) : (
              <>
                <header className="mb-8">
                  <h2 className="text-headline-lg text-[#0B1C30]">Resumen de Estadísticas</h2>
                  <p className="text-on-surface-variant text-body-md">Seguimiento detallado del rendimiento de la plataforma.</p>
                </header>

                {/* 4 Metric Cards Grid — datos reales del backend */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <MetricCard
                    icon={FaUsers} label="Usuarios Totales"
                    value={adminStats.users?.total_users || 0}
                    detail={`${adminStats.users?.total_landlords || 0} arrendadores · ${adminStats.users?.total_tenants || 0} inquilinos`}
                  />
                  <MetricCard
                    icon={FaHome} label="Apartamentos"
                    value={adminStats.apartments?.total_apartments || 0}
                    detail={`${adminStats.apartments?.approved_apartments || 0} aprobados · ${adminStats.apartments?.pending_apartments || 0} pendientes`}
                  />
                  <MetricCard
                    icon={FaFileAlt} label="Contratos Activos"
                    value={adminStats.contracts?.active_contracts || 0}
                    detail={`${adminStats.contracts?.expired_contracts || 0} vencidos · $${Number(adminStats.contracts?.monthly_revenue || 0).toLocaleString()}/mes`}
                  />
                  <MetricCard
                    icon={FaDollarSign} label="Ingresos Mensuales"
                    value={`$${Number(adminStats.contracts?.monthly_revenue || 0).toLocaleString()}`}
                    detail={`${adminStats.contracts?.total_contracts || 0} contratos totales`}
                  />
                </div>

                {/* Tendencia & Top Arrendadores */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                  {/* Tendencia de Ocupación */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Tendencia de Ocupación</h4>
                    </div>
                    <div className="h-[300px] w-full rounded-lg bg-[#F8FAFC] overflow-hidden flex items-end px-4 gap-1.5">
                      {occupationTrend && occupationTrend.length > 0 ? (
                        occupationTrend.slice(-15).map((item, i) => {
                          const maxVal = Math.max(...occupationTrend.map(o => o.occupancy_pct));
                          const h = maxVal > 0 ? (item.occupancy_pct / maxVal) * 100 : 0;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                className={`w-full rounded-t-sm transition-all duration-300 ${
                                  h >= 80 ? 'bg-[#5849E4]' : h >= 50 ? 'bg-[#5849E4]/60' : 'bg-[#5849E4]/30'
                                }`}
                                style={{ height: `${Math.max(h, 4)}%` }}
                              />
                              <span className="text-[9px] text-outline/60 whitespace-nowrap -rotate-45 origin-left mt-1">
                                {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-sm text-outline">Sin datos de ocupación</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Arrendadores — datos reales del backend */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
                    <h4 className="font-headline font-semibold text-[#0B1C30] text-sm mb-6">Top Arrendadores</h4>
                    {adminStats.topLandlords?.length > 0 ? (
                      <div className="space-y-5">
                        {(adminStats.topLandlords || []).slice(0, 4).map((l, i) => (
                          <div key={l.user_id} className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-[#5849E4]/10 flex items-center justify-center text-[#5849E4] font-bold text-sm">
                                {(l.user_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                i === 0 ? 'bg-[#10B981]' : 'bg-gray-400'
                              }`}>{i + 1}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-[#0B1C30] truncate">{l.user_name} {l.user_lastname}</p>
                              <p className="text-xs text-on-surface-variant">{l.total_apartments} Propiedades</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-outline text-center py-8">Sin datos de arrendadores</p>
                    )}
                  </div>
                </div>

                {/* Detailed Stats Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
                    <h4 className="font-headline font-semibold text-[#0B1C30] text-sm mb-4">Ingresos por Zona</h4>
                    {revenueByZone && revenueByZone.length > 0 ? (
                      <div className="space-y-4">
                        {revenueByZone.map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-on-surface-variant truncate">{item.zone}</span>
                              <span className="font-bold text-[#0B1C30] flex-shrink-0 ml-2">${Number(item.amount).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-[#5849E4] h-2.5 rounded-full transition-all" style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center">
                        <p className="text-sm text-outline">Sin datos de ingresos por zona</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Tasa de Vacancia</h4>
                      {vacancyRate ? (
                        <>
                          <p className="text-[40px] font-bold font-headline text-[#5849E4] mt-2">{vacancyRate.vacancy_rate}%</p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {vacancyRate.vacant} vacantes de {vacancyRate.total_approved} aprobados
                          </p>
                        </>
                      ) : (
                        <div className="h-[120px] flex items-center">
                          <p className="text-sm text-outline">Sin datos</p>
                        </div>
                      )}
                    </div>
                    {vacancyRate && (
                      <div className="w-32 h-32 relative flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path className="text-[#5849E4]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${vacancyRate.occupancy_rate}, 100`} strokeLinecap="round" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-on-surface-variant">{vacancyRate.occupancy_rate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApartmentDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedApartmentDetail(null)}>
          <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-detail-header">
              <h2>Detalles del Apartamento</h2>
              <button className="admin-detail-close" onClick={() => setSelectedApartmentDetail(null)}>×</button>
            </div>
            <div className="admin-detail-body">
              <div className="admin-detail-section">
                <h3><FaMapMarkerAlt /> Ubicación</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item"><label>Dirección:</label><span>{selectedApartmentDetail.direccion_apt}</span></div>
                  <div className="admin-detail-item"><label>Barrio:</label><span>{selectedApartmentDetail.barrio}</span></div>
                </div>
              </div>
              <div className="admin-detail-section">
                <h3><FaUser /> Propietario</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item"><label>Nombre:</label><span>{selectedApartmentDetail.user_name} {selectedApartmentDetail.user_lastname}</span></div>
                  <div className="admin-detail-item"><label>Email:</label><span>{selectedApartmentDetail.user_email || 'No disponible'}</span></div>
                  <div className="admin-detail-item"><label>Teléfono:</label><span>{selectedApartmentDetail.user_phonenumber || 'No disponible'}</span></div>
                </div>
              </div>
              <div className="admin-detail-section">
                <h3><FaMoneyBill /> Precio y Características</h3>
                <div className="admin-detail-grid characteristics-grid">
                  <div className="admin-detail-item highlight"><label>Precio:</label><span className="admin-price-value">${selectedApartmentDetail.price?.toLocaleString('es-CO')}</span></div>
                  <div className="admin-detail-item"><label>Habitaciones:</label><span>{selectedApartmentDetail.bedrooms}</span></div>
                  <div className="admin-detail-item"><label>Baños:</label><span>{selectedApartmentDetail.bathrooms}</span></div>
                  <div className="admin-detail-item"><label>Área:</label><span>{selectedApartmentDetail.area_m2} m²</span></div>
                  <div className="admin-detail-item"><label>Piso:</label><span>{selectedApartmentDetail.floor || 'No especificado'}</span></div>
                  <div className="admin-detail-item"><label>Ascensor:</label><span>{selectedApartmentDetail.elevator ? 'Sí' : 'No'}</span></div>
                </div>
              </div>
              {selectedApartmentDetail.description && (
                <div className="admin-detail-section">
                  <h3><FaEdit /> Descripción</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed bg-[#F8FAFC] p-3 rounded-lg">{selectedApartmentDetail.description}</p>
                </div>
              )}
              {Array.isArray(selectedApartmentDetail.amenities) && selectedApartmentDetail.amenities.length > 0 && (
                <div className="admin-detail-section">
                  <h3><FaCheckCircle /> Comodidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApartmentDetail.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-info-50 text-info-700 text-xs font-medium">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="admin-detail-section">
                <h3><FaImage /> Fotos</h3>
                <div className="admin-images-grid">
                  {(() => {
                    const images = getImageUrls(selectedApartmentDetail.images);
                    return images.length > 0 ? (
                      images.map((img, idx) => (
                        <div key={idx} className="admin-image-wrapper" onClick={() => { setModalImages(images); setCurrentImageIndex(idx); setShowImageModal(true); }}>
                          <img src={img} alt={`Foto ${idx + 1}`} />
                          <span className="admin-image-overlay"><FaImage /> Ver</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-outline text-sm col-span-full text-center py-4">Sin imágenes</p>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="admin-detail-actions">
              <button className="flex-1 min-w-[120px] justify-center px-5 py-2.5 rounded-lg bg-success text-white font-semibold text-sm hover:bg-success-600 transition-all flex items-center gap-2 disabled:opacity-50"
                onClick={() => { handleApprove(selectedApartmentDetail.id_apt); setSelectedApartmentDetail(null); }} disabled={approvingId === selectedApartmentDetail.id_apt}>
                {approvingId === selectedApartmentDetail.id_apt ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Aprobar
              </button>
              <button className="flex-1 min-w-[120px] justify-center px-5 py-2.5 rounded-lg bg-danger text-white font-semibold text-sm hover:bg-danger-600 transition-all flex items-center gap-2 disabled:opacity-50"
                onClick={() => openRejectModal(selectedApartmentDetail.id_apt)} disabled={rejectingId === selectedApartmentDetail.id_apt}>
                <FaTimesCircle /> Rechazar
              </button>
              <button className="flex-1 min-w-[120px] justify-center px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                onClick={() => fetchHistory(selectedApartmentDetail.id_apt)}>
                <FaHistory /> Historial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHistoryModal(false)}>
          <div className="bg-white rounded-xl p-6 shadow-ambient-lg max-w-lg w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm text-[#0B1C30] mb-4">Historial de Cambios</h3>
            {history.length === 0 ? (
              <p className="text-on-surface-variant text-sm">Sin cambios registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F8FAFC]">
                    <th className="text-left px-3 py-2.5 font-semibold text-on-surface-variant">Fecha</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-on-surface-variant">Admin</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-on-surface-variant">Cambio</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-on-surface-variant">Notas</th>
                  </tr></thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-on-surface-variant">{new Date(entry.action_date).toLocaleDateString('es-CO')}</td>
                        <td className="px-3 py-2.5">{entry.admin_name || 'Sistema'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.new_status === 'approved' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                            {entry.new_status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface-variant">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={() => setShowHistoryModal(false)} className="mt-4 px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all">Cerrar</button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-xl p-6 shadow-ambient-lg max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm text-[#0B1C30] mb-4 flex items-center gap-2 text-danger"><FaTimesCircle /> Rechazar Apartamento</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-2">Motivo del rechazo:</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-danger focus:ring-2 focus:ring-danger/10 transition-all resize-none min-h-[100px]" rows={4} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={confirmReject} disabled={!rejectReason.trim() || rejectingId === rejectTargetId}
                className="px-5 py-2.5 rounded-lg bg-danger text-white font-semibold text-sm hover:bg-danger-600 transition-all flex items-center gap-2 disabled:opacity-50">
                {rejectingId === rejectTargetId ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Rechazar
              </button>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTargetId(null); }}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && userToBlock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowBlockModal(false); setBlockReason(''); setUserToBlock(null); }}>
          <div className="bg-white rounded-xl p-6 shadow-ambient-lg max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm text-[#0B1C30] mb-4 flex items-center gap-2 text-danger"><FaUserTimes /> Bloquear Usuario</h3>
            <div className="bg-[#F8FAFC] rounded-lg p-4 mb-4 space-y-1">
              <p className="text-sm"><span className="font-semibold">Nombre:</span> {userToBlock.user_name} {userToBlock.user_lastname}</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> {userToBlock.user_email}</p>
              <p className="text-sm"><span className="font-semibold">Rol:</span> {userToBlock.rol_id === 3 ? 'Admin' : userToBlock.rol_id === 2 ? 'Arrendador' : 'Usuario'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-2">Motivo del bloqueo:</label>
              <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ingresa el motivo del bloqueo..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-danger focus:ring-2 focus:ring-danger/10 transition-all resize-none min-h-[100px]" rows={4} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { if (blockReason.trim()) { handleBlockUser(userToBlock.user_id, blockReason); setShowBlockModal(false); setBlockReason(''); setUserToBlock(null); } }}
                disabled={!blockReason.trim() || actionLoading === userToBlock.user_id}
                className="px-5 py-2.5 rounded-lg bg-danger text-white font-semibold text-sm hover:bg-danger-600 transition-all flex items-center gap-2 disabled:opacity-50">
                {actionLoading === userToBlock.user_id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Bloquear
              </button>
              <button onClick={() => { setShowBlockModal(false); setBlockReason(''); setUserToBlock(null); }}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && modalImages.length > 0 && (
        <ImageModal images={modalImages} currentIndex={currentImageIndex}
          onClose={() => { setShowImageModal(false); setModalImages([]); setCurrentImageIndex(0); }}
          onPrev={() => setCurrentImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
          onNext={() => setCurrentImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center">
          <Icon className="text-xl text-[#5849E4]" />
        </div>
      </div>
      <p className="text-xs text-on-surface-variant font-medium mb-0.5">{label}</p>
      <h3 className="text-headline-md text-[#0B1C30] font-headline">{value}</h3>
      <p className="text-xs text-on-surface-variant mt-2">{detail}</p>
    </div>
  );
}

export default AdminDashboard;
