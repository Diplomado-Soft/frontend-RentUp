import React from 'react';
import { createPortal } from 'react-dom';

function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, loading, variant }) {
  if (!open) return null;

  const isDanger = variant === 'danger' || !variant;

  const modal = (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-paper-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-card-lift" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full ${isDanger ? 'bg-error/10' : 'bg-brand-50'} flex items-center justify-center mx-auto mb-4`}>
          <span className={`material-symbols-outlined ${isDanger ? 'text-error' : 'text-brand-500'} text-2xl`}>
            {isDanger ? 'delete' : 'warning'}
          </span>
        </div>
        <h3 className="font-display text-xl text-ink text-center mb-2">{title || '¿Confirmar acción?'}</h3>
        <p className="text-sm text-ink-muted text-center mb-6">{message || 'Esta acción no se puede deshacer.'}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-paper-sunk text-ink hover:bg-line/30 transition-all">
            {cancelLabel || 'Cancelar'}
          </button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50 ${isDanger ? 'bg-error hover:bg-error/90' : 'bg-brand-500 hover:bg-brand-600'}`}>
            {loading ? 'Procesando...' : (confirmLabel || 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default ConfirmModal;
