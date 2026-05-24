import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function PromptModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  const modal = (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-paper-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-card-lift" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full ${isDanger ? 'bg-error/10' : 'bg-brand-50'} flex items-center justify-center mx-auto mb-4`}>
          <span className={`material-symbols-outlined ${isDanger ? 'text-error' : 'text-brand-500'} text-2xl`}>
            {isDanger ? 'error' : 'info'}
          </span>
        </div>
        <h3 className="font-display text-xl text-ink text-center mb-2">{title || 'Ingresa un valor'}</h3>
        {message && <p className="text-sm text-ink-muted text-center mb-4">{message}</p>}
        <div className="mb-4">
          <textarea
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full p-3 rounded-xl border border-line bg-paper text-ink text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
            rows={3}
            placeholder="Escribe aquí..."
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-paper-sunk text-ink hover:bg-line/30 transition-all">
            {cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={() => onConfirm(value)}
            disabled={!value.trim()}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40 ${isDanger ? 'bg-error hover:bg-error/90' : 'bg-brand-500 hover:bg-brand-600'}`}
          >
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default PromptModal;
