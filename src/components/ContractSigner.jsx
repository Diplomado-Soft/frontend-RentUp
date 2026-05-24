import React, { useState, useEffect } from "react";
import axiosInstance from "../contexts/axiosInstance";
import { signContract } from "../apis/contractController";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-paper-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-ambient-xl border border-line/50" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-brand-500 text-2xl">contract_edit</span>
        </div>
        <h3 className="font-headline text-headline-sm text-ink text-center mb-2">Firmar Contrato</h3>
        <p className="text-body-md text-ink-muted text-center mb-6">{message}</p>
        <p className="text-label-md text-ink-muted text-center mb-6 bg-paper-sunk rounded-lg p-3">
          Una vez firmado, el contrato tendrá validez legal.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-line text-ink font-semibold bg-paper-card hover:bg-paper-sunk transition-all text-label-md">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all text-label-md flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">draw</span>
            Firmar
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractSigner({ contract, onSigned }) {
  const [signing, setSigning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (!contract?.agreement_id) {
      setPdfLoading(false);
      setPdfError(true);
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/${contract.agreement_id}/pdf`, {
          responseType: 'blob'
        });
        if (!cancelled) {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          setPdfLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading PDF:', err);
          setPdfError(true);
          setPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [contract?.agreement_id]);

  const handleSignClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSign = async () => {
    setShowConfirm(false);
    setSigning(true);
    try {
      const result = await signContract(contract.agreement_id);
      if (onSigned) onSigned(result);
    } catch (error) {
      alert(
        error.response?.data?.error || "Error al firmar el contrato. Intenta de nuevo."
      );
    } finally {
      setSigning(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message={`¿Estás seguro de firmar el contrato de arrendamiento para "${contract?.direccion_apt || 'esta propiedad'}"?`}
          onConfirm={handleConfirmSign}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="bg-paper-card border border-line/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-line/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-brand-500 text-lg">description</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-headline-sm text-ink truncate">Vista Previa del Contrato</h3>
              <p className="text-body-md text-ink-muted truncate">
                {contract?.direccion_apt || 'Propiedad'} — {contract?.barrio || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignClick}
            disabled={signing || contract?.status === 'signed'}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all text-label-md flex-shrink-0 ${
              contract?.status === 'signed'
                ? 'bg-tertiary/10 text-tertiary cursor-default'
                : 'bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {contract?.status === 'signed' ? 'check_circle' : signing ? 'sync' : 'draw'}
            </span>
            {contract?.status === 'signed'
              ? 'Contrato Firmado'
              : signing
                ? 'Firmando...'
                : 'Firmar Contrato'}
          </button>
        </div>

        <div className="bg-paper-sunk/50 min-h-[400px] flex items-center justify-center">
          {pdfLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
              <p className="text-body-md text-ink-muted">Cargando PDF...</p>
            </div>
          ) : pdfError ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">picture_as_pdf</span>
              <p className="text-body-md text-ink-muted">Vista previa no disponible</p>
              <p className="text-label-md text-ink-muted mt-1">El PDF se generará al descargarlo desde el botón "Contrato"</p>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title="Vista previa del contrato"
              className="w-full border-0"
              style={{ height: '600px' }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default ContractSigner;
