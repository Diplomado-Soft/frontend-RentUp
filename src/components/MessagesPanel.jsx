import React, { useEffect, useRef } from "react";
import ChatList from "./ChatList";
import TenantChatList from "./TenantChatList";

function MessagesPanel({ userId, userRole, onClose }) {
  const panelRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevenir scroll del body mientras el panel esté abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.25s ease-out' }}
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-[420px] h-full bg-surface-container-lowest shadow-2xl flex flex-col rounded-l-xl"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-all text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="flex-1 overflow-hidden">
          {userRole === 2 ? (
            <ChatList arrendador_id={userId} />
          ) : (
            <TenantChatList tenant_id={userId} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default MessagesPanel;
