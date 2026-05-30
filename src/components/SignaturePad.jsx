import React, { useRef, useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import axiosInstance from "../contexts/axiosInstance";
import { previewContractPdf } from "../apis/contractController";

function SignaturePad({ contract, onSigned, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2e5a88";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    setHasSignature(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = () => {
    return canvasRef.current.toDataURL("image/png");
  };

  const handleConfirmSign = async () => {
    setSigning(true);
    try {
      const signatureData = getSignatureData();
      const res = await axiosInstance.put(`/contracts/${contract.agreement_id}/sign`, { signature: signatureData });
      if (res.data) {
        setShowConfirm(false);
        onSigned(res.data);
      }
    } catch (err) {
      console.error("Error signing:", err);
      setError(err.response?.data?.error || err.message || 'Error al firmar el contrato');
      setShowConfirm(false);
    } finally {
      setSigning(false);
    }
  };

  const handlePreviewPdf = () => {
    const url = previewContractPdf(contract.agreement_id, contract.signed_pdf_url);
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-paper-card rounded-2xl p-6 max-w-lg w-full mx-4 shadow-card-lift" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl text-ink">Firmar Contrato</h3>
            <p className="text-sm text-ink-muted mt-1">
              Contrato N° {contract.agreement_id} — {contract.barrio || contract.direccion_apt || ""}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-line/30 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handlePreviewPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-paper-sunk text-ink text-label-md hover:bg-line/30 transition-all flex-1 justify-center"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Vista previa del contrato
          </button>
        </div>

        <div className="mb-4">
          <p className="text-label-md text-ink-muted uppercase tracking-wider mb-2">
            Dibuja tu firma aquí
          </p>
          <div className="border-2 border-dashed border-line rounded-xl overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              className="w-full touch-none"
              style={{ height: "180px" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
          <div className="flex justify-between mt-2">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1 text-label-md text-ink-muted hover:text-ink transition-all"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Limpiar
            </button>
            {hasSignature && (
              <span className="text-label-md text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Firma capturada
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}
        <p className="text-xs text-ink-muted mb-4 text-center">
          Al firmar, aceptas los términos y condiciones del contrato de arrendamiento.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-paper-sunk text-ink hover:bg-line/30 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!hasSignature}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">draw</span>
            Firmar Contrato
          </button>
        </div>

        <ConfirmModal
          open={showConfirm}
          title="¿Confirmar firma?"
          message="Al confirmar, estarás firmando digitalmente este contrato de arrendamiento. Esta acción no se puede deshacer."
          confirmLabel={signing ? "Firmando..." : "Sí, firmar"}
          variant="confirm"
          onConfirm={handleConfirmSign}
          onCancel={() => { if (!signing) setShowConfirm(false); }}
          loading={signing}
        />
      </div>
    </div>
  );
}

export default SignaturePad;
