import React, { useEffect, useState } from 'react';
import {
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaIdCard,
  FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaBuilding, FaImage,
  FaTimes, FaChevronCircleLeft, FaChevronCircleRight, FaUserCheck, FaUsers
} from 'react-icons/fa';
import kycController from '../apis/kycController';
import adminApartmentController from '../apis/adminApartmentController';
import axiosInstance from '../contexts/axiosInstance';
import Toast from './Toast';
import DocumentViewer from './DocumentViewer';

function AdminVerificationPanel() {
  const [subTab, setSubTab] = useState('kyc');
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [detailApartment, setDetailApartment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // User verification state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ offset: 0, limit: 50, total: 0 });
  const [userFilter, setUserFilter] = useState('');
  const [showUserRejectModal, setShowUserRejectModal] = useState(false);
  const [userRejectTarget, setUserRejectTarget] = useState(null);
  const [userRejectReason, setUserRejectReason] = useState('');

  const openDetailModal = async (verification) => {
    setSelectedVerification(verification);
    setDetailApartment(null);
    setDetailError(null);
    setCurrentImageIndex(0);
    if (verification.apartment_id) {
      setDetailLoading(true);
      try {
        const res = await axiosInstance.get(`/apartments/${verification.apartment_id}`);
        setDetailApartment(res.data);
      } catch (err) {
        setDetailError(err.response?.data?.error || 'Error al cargar detalles');
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const closeDetailModal = () => {
    setSelectedVerification(null);
    setDetailApartment(null);
    setDetailError(null);
  };

  const fetchVerifications = async (offset = 0) => {
    try {
      setLoading(true);
      let res;
      if (filter === 'pending') {
        res = await kycController.getPendingVerifications(pagination.limit, offset);
      } else {
        res = await kycController.getAllVerifications(pagination.limit, offset, filter);
      }
      setVerifications(res.data.verifications || []);
      setPagination({ offset, limit: res.data.limit || pagination.limit, total: res.data.total });
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al cargar solicitudes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForVerification = async (offset = 0) => {
    try {
      setUsersLoading(true);
      const params = { limit: usersPagination.limit, offset, role: 2 };
      if (userFilter) params.estado = userFilter;
      const res = await axiosInstance.get('/admin/users', { params });
      if (res.data?.users) {
        setUsers(res.data.users);
        setUsersPagination({ offset, limit: usersPagination.limit, total: res.data.total });
      }
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al cargar usuarios', type: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserApprove = async (userId) => {
    try {
      setActionLoading(`approve-${userId}`);
      await adminApartmentController.verifyUser(userId, 'aprobado', '');
      setToast({ message: 'Usuario aprobado correctamente', type: 'success' });
      setUsers(users.filter(u => u.user_id !== userId));
      setUsersPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al aprobar usuario', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openUserRejectModal = (user) => {
    setUserRejectTarget(user);
    setUserRejectReason('');
    setShowUserRejectModal(true);
  };

  const confirmUserReject = async () => {
    if (!userRejectReason.trim()) {
      setToast({ message: 'Ingresa un motivo para el rechazo', type: 'warning' });
      return;
    }
    try {
      setActionLoading(`reject-${userRejectTarget.user_id}`);
      await adminApartmentController.verifyUser(userRejectTarget.user_id, 'rechazado', userRejectReason);
      setToast({ message: 'Usuario rechazado correctamente', type: 'success' });
      setUsers(users.filter(u => u.user_id !== userRejectTarget.user_id));
      setUsersPagination(prev => ({ ...prev, total: prev.total - 1 }));
      setShowUserRejectModal(false);
      setUserRejectReason('');
      setUserRejectTarget(null);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al rechazar usuario', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (subTab === 'kyc') {
      fetchVerifications(0);
    } else {
      fetchUsersForVerification(0);
    }
  }, [subTab, filter, userFilter]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await kycController.approveVerification(id, '');
      setToast({ message: 'Verificación aprobada correctamente', type: 'success' });
      setVerifications(verifications.filter(v => v.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al aprobar', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (verification) => {
    setRejectTarget(verification);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setToast({ message: 'Ingresa un motivo para el rechazo', type: 'warning' });
      return;
    }
    try {
      setActionLoading(rejectTarget.id);
      await kycController.rejectVerification(rejectTarget.id, rejectReason);
      setToast({ message: 'Verificación rechazada correctamente', type: 'success' });
      setVerifications(verifications.filter(v => v.id !== rejectTarget.id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      setShowRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Error al rechazar', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
          <FaShieldAlt className="text-[#5849E4]" />
          Verificación de Arrendadores
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">Revisa documentos KYC o verifica usuarios directamente.</p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('kyc')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            subTab === 'kyc'
              ? 'bg-[#5849E4] text-white shadow-ambient-sm'
              : 'bg-white text-on-surface-variant border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FaIdCard /> KYC
        </button>
        <button
          onClick={() => setSubTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            subTab === 'users'
              ? 'bg-[#5849E4] text-white shadow-ambient-sm'
              : 'bg-white text-on-surface-variant border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FaUserCheck /> Verificación Directa
        </button>
      </div>

      {subTab === 'kyc' && (
      <>
      <div className="mb-4 flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-[#5849E4] text-white shadow-ambient-sm'
                : 'bg-white text-on-surface-variant border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
          <span className="ml-3 text-on-surface-variant">Cargando solicitudes...</span>
        </div>
      ) : verifications.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
          <FaCheckCircle className="text-5xl text-success mx-auto mb-4" />
          <h3 className="text-headline-sm text-[#0B1C30] mb-2">
            {filter === 'pending' ? 'No hay solicitudes pendientes' : 'No hay solicitudes ' + filter}
          </h3>
          <p className="text-on-surface-variant">Todas las solicitudes han sido procesadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {verifications.map(v => (
            <div key={v.id} onClick={() => openDetailModal(v)}
              className="bg-white rounded-xl p-5 shadow-ambient-sm border border-gray-200/60 hover:shadow-ambient-md transition-all cursor-pointer">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#5849E4]/10 flex items-center justify-center text-[#5849E4] font-bold text-sm">
                        {(v.user_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0B1C30] text-sm flex items-center gap-2">
                          {v.user_name} {v.user_lastname}
                          {v.is_verified && <FaCheckCircle className="text-[#15803D] text-xs" />}
                        </h4>
                        <p className="text-xs text-outline">{v.user_email}</p>
                        {v.user_phonenumber && <p className="text-xs text-outline">{v.user_phonenumber}</p>}
                      </div>
                    </div>
                     <div className="space-y-1">
                       <span className="text-xs font-medium text-gray-500">Estado KYC:</span>
                       <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                         v.status === 'pending' ? 'bg-warning-50 text-warning-700' :
                         v.status === 'approved' ? 'bg-[#DCFCE7] text-[#15803D]' :
                         'bg-danger-50 text-danger-700'
                       }`}>
                         {v.status === 'pending' ? 'Pendiente' : v.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                       </span>
                       <span className="text-xs font-medium text-gray-500">Verificación:</span>
                       <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                         v.estadoVerificacion === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                         v.estadoVerificacion === 'aprobado' ? 'bg-green-100 text-green-800' :
                         'bg-red-100 text-red-800'
                       }`}>
                         {v.estadoVerificacion === 'pendiente' ? 'Pendiente' : v.estadoVerificacion === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                       </span>
                     </div>
                  </div>

                  {v.direccion_apt && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-[#F8FAFC] rounded-lg px-3 py-2">
                      <FaBuilding className="text-[#5849E4]/60 flex-shrink-0" />
                      <span>{v.direccion_apt}{v.barrio ? `, ${v.barrio}` : ''}</span>
                      {v.price && <span className="font-bold text-[#0B1C30] ml-auto">${Number(v.price).toLocaleString('es-CO')}</span>}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {v.id_document_key && (
                      <DocumentViewer
                        documentKey={v.id_document_key}
                        documentUrl={v.id_document_url}
                        icon={FaIdCard}
                        label="Ver cédula"
                      />
                    )}
                  </div>

                  {v.admin_notes && (
                    <div className="bg-[#F8FAFC] rounded-lg px-3 py-2 text-xs text-on-surface-variant">
                      <span className="font-semibold">Notas:</span> {v.admin_notes}
                    </div>
                  )}
                </div>

                {v.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <button
                      onClick={() => handleApprove(v.id)}
                      disabled={actionLoading === v.id}
                      className="flex-1 lg:w-full px-4 py-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === v.id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => openRejectModal(v)}
                      disabled={actionLoading === v.id}
                      className="flex-1 lg:w-full px-4 py-2.5 rounded-lg bg-[#FFDAD6] text-[#93000A] text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <FaTimesCircle /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {verifications.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={pagination.offset === 0}
            onClick={() => fetchVerifications(Math.max(0, pagination.offset - pagination.limit))}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <FaChevronLeft className="text-xs" /> Anterior
          </button>
          <span className="text-sm text-on-surface-variant">
            {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <button
            disabled={pagination.offset + pagination.limit >= pagination.total}
            onClick={() => fetchVerifications(pagination.offset + pagination.limit)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Siguiente <FaChevronRight className="text-xs" />
          </button>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-xl p-6 shadow-ambient-lg max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm text-[#0B1C30] mb-4 flex items-center gap-2 text-danger"><FaTimesCircle /> Rechazar Verificación</h3>
            <div className="bg-[#F8FAFC] rounded-lg p-4 mb-4 space-y-1">
              <p className="text-sm"><span className="font-semibold">Solicitante:</span> {rejectTarget?.user_name} {rejectTarget?.user_lastname}</p>
              {rejectTarget?.direccion_apt && (
                <p className="text-sm"><span className="font-semibold">Propiedad:</span> {rejectTarget.direccion_apt}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-2">Motivo del rechazo:</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-danger focus:ring-2 focus:ring-danger/10 transition-all resize-none min-h-[100px]" rows={4} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={confirmReject} disabled={!rejectReason.trim() || actionLoading === rejectTarget?.id}
                className="px-5 py-2.5 rounded-lg bg-danger text-white font-semibold text-sm hover:bg-danger-600 transition-all flex items-center gap-2 disabled:opacity-50">
                {actionLoading === rejectTarget?.id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Rechazar
              </button>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTarget(null); }}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE DETALLE DEL APARTAMENTO ===== */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
          <div className="bg-white rounded-2xl shadow-ambient-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h3 className="text-headline-sm font-bold text-[#0B1C30] flex items-center gap-2">
                <FaBuilding className="text-[#5849E4]" />
                Detalles de la Propiedad
              </h3>
              <button onClick={closeDetailModal} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 🖼️ GALERÍA DE FOTOS COMERCIALES */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FaImage className="text-[#5849E4]" /> Fotos del Apartamento
                </h4>
                {detailLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
                    <FaSpinner className="animate-spin" /> Cargando imágenes...
                  </div>
                ) : detailApartment?.images?.length > 0 ? (
                  <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                    <img
                      src={detailApartment.images[currentImageIndex]?.url}
                      alt={`Foto ${currentImageIndex + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    {detailApartment.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => (prev === 0 ? detailApartment.images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition"
                        >
                          <FaChevronCircleLeft className="text-[#5849E4]" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => (prev === detailApartment.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition"
                        >
                          <FaChevronCircleRight className="text-[#5849E4]" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {detailApartment.images.map((_, i) => (
                            <span key={i} className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl py-8 text-center text-sm text-gray-400">
                    <FaImage className="text-3xl mx-auto mb-2 text-gray-300" />
                    {detailError ? `Error: ${detailError}` : 'No hay fotos disponibles'}
                  </div>
                )}
              </div>

              {/* 🛡️ BLOQUE DE VERIFICACIÓN KYC */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🛡️</span> Documentos de Verificación (KYC)
                </h3>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Documento de Identidad (Cédula)</p>
                  {selectedVerification.id_document_key ? (
                    <DocumentViewer
                      documentKey={selectedVerification.id_document_key}
                      documentUrl={selectedVerification.id_document_url}
                      icon={FaIdCard}
                      label="Ver Documento de Identidad"
                    />
                  ) : (
                    <span className="text-sm text-red-500 font-medium">⚠️ No cargado o no disponible</span>
                  )}
                </div>
              </div>

              {/* Información del solicitante */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 text-sm">
                <p><span className="font-semibold text-gray-600">Solicitante:</span> {selectedVerification.user_name} {selectedVerification.user_lastname}</p>
                <p><span className="font-semibold text-gray-600">Email:</span> {selectedVerification.user_email}</p>
                {selectedVerification.direccion_apt && (
                  <p><span className="font-semibold text-gray-600">Propiedad:</span> {selectedVerification.direccion_apt}{selectedVerification.barrio ? `, ${selectedVerification.barrio}` : ''}</p>
                )}
                {selectedVerification.admin_notes && (
                  <p><span className="font-semibold text-gray-600">Notas del admin:</span> {selectedVerification.admin_notes}</p>
                )}
              </div>

              {/* Acciones */}
              {selectedVerification.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(selectedVerification.id); closeDetailModal(); }}
                    disabled={actionLoading === selectedVerification.id}
                    className="flex-1 px-5 py-3 rounded-xl bg-[#DCFCE7] text-[#15803D] font-semibold text-sm hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === selectedVerification.id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Aprobar Verificación
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeDetailModal(); openRejectModal(selectedVerification); }}
                    disabled={actionLoading === selectedVerification.id}
                    className="flex-1 px-5 py-3 rounded-xl bg-[#FFDAD6] text-[#93000A] font-semibold text-sm hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaTimesCircle /> Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </>
      )}

      {subTab === 'users' && (
      <>
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'pendiente', 'aprobado', 'rechazado'].map(f => (
          <button
            key={f}
            onClick={() => {
              setUserFilter(f);
              setUsersPagination(prev => ({ ...prev, offset: 0 }));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              userFilter === f
                ? 'bg-gradient-to-r from-[#0A79BB] to-[#1E3A8A] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === '' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : f === 'aprobado' ? 'Aprobados' : 'Rechazados'}
          </button>
        ))}
      </div>

      {usersLoading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
          <span className="ml-3 text-on-surface-variant">Cargando arrendadores...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
          <FaUserCheck className="text-5xl text-success mx-auto mb-4" />
          <h3 className="text-headline-sm text-[#0B1C30] mb-2">
            {userFilter === 'pendiente' ? 'No hay arrendadores pendientes' : 'No hay arrendadores ' + userFilter}
          </h3>
          <p className="text-on-surface-variant">Todos los arrendadores han sido procesados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map(u => (
            <div key={u.user_id}
              className="bg-white rounded-xl p-5 shadow-ambient-sm border border-gray-200/60 hover:shadow-ambient-md transition-all">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#5849E4]/10 flex items-center justify-center text-[#5849E4] font-bold text-sm">
                        {(u.user_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0B1C30] text-sm flex items-center gap-2">
                          {u.user_name} {u.user_lastname}
                          {u.estadoVerificacion === 'aprobado' && <FaCheckCircle className="text-[#15803D] text-xs" />}
                        </h4>
                        <p className="text-xs text-outline">{u.user_email}</p>
                        {u.user_phonenumber && <p className="text-xs text-outline">{u.user_phonenumber}</p>}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.estadoVerificacion === 'pendiente' || !u.estadoVerificacion ? 'bg-yellow-100 text-yellow-800' :
                      u.estadoVerificacion === 'aprobado' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.estadoVerificacion === 'pendiente' || !u.estadoVerificacion ? 'Pendiente' :
                       u.estadoVerificacion === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>

                  {u.notasRevision && (
                    <div className="bg-[#F8FAFC] rounded-lg px-3 py-2 text-xs text-on-surface-variant">
                      <span className="font-semibold">Notas:</span> {u.notasRevision}
                    </div>
                  )}
                  {u.id_document_url && (
                    <div className="flex items-center gap-2 mt-2">
                      <DocumentViewer
                        documentKey={u.id_document_key}
                        documentUrl={u.id_document_url}
                        icon={FaIdCard}
                        label="Ver cédula"
                      />
                    </div>
                  )}
                </div>

                {(u.estadoVerificacion === 'pendiente' || !u.estadoVerificacion) && (
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <button
                      onClick={() => handleUserApprove(u.user_id)}
                      disabled={actionLoading === `approve-${u.user_id}`}
                      className="flex-1 lg:w-full px-4 py-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === `approve-${u.user_id}` ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => openUserRejectModal(u)}
                      disabled={actionLoading === `reject-${u.user_id}`}
                      className="flex-1 lg:w-full px-4 py-2.5 rounded-lg bg-[#FFDAD6] text-[#93000A] text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <FaTimesCircle /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={usersPagination.offset === 0}
            onClick={() => fetchUsersForVerification(Math.max(0, usersPagination.offset - usersPagination.limit))}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <FaChevronLeft className="text-xs" /> Anterior
          </button>
          <span className="text-sm text-on-surface-variant">
            {usersPagination.offset + 1}-{Math.min(usersPagination.offset + usersPagination.limit, usersPagination.total)} de {usersPagination.total}
          </span>
          <button
            disabled={usersPagination.offset + usersPagination.limit >= usersPagination.total}
            onClick={() => fetchUsersForVerification(usersPagination.offset + usersPagination.limit)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-on-surface hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Siguiente <FaChevronRight className="text-xs" />
          </button>
        </div>
      )}

      {showUserRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUserRejectModal(false)}>
          <div className="bg-white rounded-xl p-6 shadow-ambient-lg max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm text-[#0B1C30] mb-4 flex items-center gap-2 text-danger"><FaTimesCircle /> Rechazar Verificación</h3>
            <div className="bg-[#F8FAFC] rounded-lg p-4 mb-4 space-y-1">
              <p className="text-sm"><span className="font-semibold">Arrendador:</span> {userRejectTarget?.user_name} {userRejectTarget?.user_lastname}</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> {userRejectTarget?.user_email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-2">Motivo del rechazo:</label>
              <textarea value={userRejectReason} onChange={(e) => setUserRejectReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-danger focus:ring-2 focus:ring-danger/10 transition-all resize-none min-h-[100px]" rows={4} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={confirmUserReject} disabled={!userRejectReason.trim() || actionLoading === `reject-${userRejectTarget?.user_id}`}
                className="px-5 py-2.5 rounded-lg bg-danger text-white font-semibold text-sm hover:bg-danger-600 transition-all flex items-center gap-2 disabled:opacity-50">
                {actionLoading === `reject-${userRejectTarget?.user_id}` ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Rechazar
              </button>
              <button onClick={() => { setShowUserRejectModal(false); setUserRejectReason(''); setUserRejectTarget(null); }}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-on-surface font-semibold text-sm hover:bg-gray-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default AdminVerificationPanel;
