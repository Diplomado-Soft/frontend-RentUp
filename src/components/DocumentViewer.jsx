import React, { useState } from 'react';
import { FaIdCard, FaExternalLinkAlt, FaSpinner, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import kycController from '../apis/kycController';

function DocumentViewer({ documentKey, documentUrl, icon: Icon = FaIdCard, label = 'Ver documento' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = async (e) => {
    e.preventDefault();

    if (!documentKey) {
      if (documentUrl) {
        window.open(documentUrl, '_blank', 'noopener');
      } else {
        setError('No hay enlace disponible para este documento');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await kycController.refreshDocumentUrl(documentKey);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, '_blank', 'noopener');
      } else {
        setError('No se pudo obtener el enlace del documento');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'El enlace del documento ha expirado y no se pudo renovar. Solicita al usuario volver a subirlo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
          <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleOpen}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F5F3FF] text-[#5849E4] text-xs font-medium hover:bg-[#EDE9FE] transition disabled:opacity-50"
      >
        {loading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <Icon />
        )}
        {loading ? 'Obteniendo enlace...' : label}
        <FaExternalLinkAlt className="text-[10px]" />
      </button>
    </div>
  );
}

export default DocumentViewer;
