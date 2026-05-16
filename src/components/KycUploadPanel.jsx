import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt, FaIdCard, FaFileAlt, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaClock, FaUpload, FaInfoCircle, FaBuilding
} from 'react-icons/fa';
import kycController from '../apis/kycController';
import Toast from './Toast';

function KycUploadPanel({ apartmentId, onComplete }) {
  const [idDocument, setIdDocument] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await kycController.getMyVerificationStatus();
      if (res.data) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!apartmentId) {
      setToast({ message: 'Primero debes crear el apartamento', type: 'warning' });
      return;
    }
    if (!idDocument && !certificate) {
      setToast({ message: 'Debes subir al menos un documento', type: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('apartment_id', apartmentId);
    if (idDocument) formData.append('id_document', idDocument);
    if (certificate) formData.append('property_certificate', certificate);

    try {
      setSubmitting(true);
      const res = await kycController.uploadDocuments(formData);
      setToast({ message: res.message, type: 'success' });
      setIdDocument(null);
      setCertificate(null);
      fetchStatus();
      if (onComplete) onComplete();
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Error al subir documentos',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    const config = {
      pending: { icon: FaClock, text: 'Pendiente', class: 'bg-warning-50 text-warning-700' },
      approved: { icon: FaCheckCircle, text: 'Aprobado', class: 'bg-[#DCFCE7] text-[#15803D]' },
      rejected: { icon: FaTimesCircle, text: 'Rechazado', class: 'bg-danger-50 text-danger-700' }
    };
    const s = config[status.status] || config.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.class}`}>
        <Icon /> {s.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-[#5849E4]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-ambient-sm border border-gray-200/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E5EEFF] flex items-center justify-center">
            <FaShieldAlt className="text-lg text-[#5849E4]" />
          </div>
          <div>
            <h3 className="font-headline font-semibold text-[#0B1C30] text-base">Verificación de Identidad y Propiedad</h3>
            <p className="text-xs text-on-surface-variant">KYC — Asegura tu identidad como arrendador</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {status?.status === 'approved' ? (
        <div className="bg-[#DCFCE7] rounded-lg p-4 flex items-start gap-3">
          <FaCheckCircle className="text-xl text-[#15803D] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#15803D] text-sm">¡Verificación completada!</p>
            <p className="text-xs text-[#15803D]/70 mt-0.5">Tu identidad y propiedad han sido verificadas. Tu apartamento está publicado.</p>
          </div>
        </div>
      ) : status?.status === 'rejected' ? (
        <div className="bg-[#FFDAD6] rounded-lg p-4 flex items-start gap-3 mb-4">
          <FaTimesCircle className="text-xl text-[#93000A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#93000A] text-sm">Verificación rechazada</p>
            <p className="text-xs text-[#93000A]/70 mt-0.5">{status.admin_notes || 'No se especificó motivo. Sube nuevamente los documentos.'}</p>
          </div>
        </div>
      ) : status?.status === 'pending' ? (
        <div className="bg-[#FFF8E1] rounded-lg p-4 flex items-start gap-3 mb-4">
          <FaClock className="text-xl text-warning-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-warning-700 text-sm">Verificación en revisión</p>
            <p className="text-xs text-warning-700/70 mt-0.5">Tus documentos están siendo revisados por un administrador. Recibirás una notificación cuando se complete la revisión.</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant mb-4">
          Para publicar tu apartamento, necesitamos verificar tu identidad y el certificado de tradición y libertad de la propiedad.
          Sube los documentos requeridos a continuación.
        </p>
      )}

      {(status?.status !== 'approved' && status?.status !== 'pending') && (
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1C30] mb-2">
              <FaIdCard className="text-[#5849E4]" />
              Foto de tu cédula / identificación
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#5849E4]/40 transition relative text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setIdDocument(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {idDocument ? (
                <div className="flex items-center justify-center gap-2">
                  <FaFileAlt className="text-[#5849E4]" />
                  <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">{idDocument.name}</span>
                  <button onClick={(e) => { e.preventDefault(); setIdDocument(null); }} className="text-danger-500 text-xs hover:underline">Quitar</button>
                </div>
              ) : (
                <div>
                  <FaUpload className="text-2xl text-outline mx-auto mb-1" />
                  <p className="text-xs text-outline">Sube tu cédula (JPG, PNG o PDF)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1C30] mb-2">
              <FaFileAlt className="text-[#5849E4]" />
              Certificado de Tradición y Libertad
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#5849E4]/40 transition relative text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setCertificate(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {certificate ? (
                <div className="flex items-center justify-center gap-2">
                  <FaBuilding className="text-[#5849E4]" />
                  <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">{certificate.name}</span>
                  <button onClick={(e) => { e.preventDefault(); setCertificate(null); }} className="text-danger-500 text-xs hover:underline">Quitar</button>
                </div>
              ) : (
                <div>
                  <FaUpload className="text-2xl text-outline mx-auto mb-1" />
                  <p className="text-xs text-outline">Sube el certificado de tradición y libertad (PDF o imagen)</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || (!idDocument && !certificate)}
            className="w-full py-3 bg-gradient-to-r from-[#5849E4] to-[#6C5CE7] text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaShieldAlt />}
            {submitting ? 'Subiendo documentos...' : 'Enviar para verificación'}
          </button>

          <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-start gap-2">
            <FaInfoCircle className="text-outline text-xs flex-shrink-0 mt-0.5" />
            <p className="text-xs text-outline leading-relaxed">
              Los documentos serán revisados por un administrador. Una vez aprobados, tu apartamento se publicará automáticamente
              y tu perfil quedará verificado.
            </p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default KycUploadPanel;
