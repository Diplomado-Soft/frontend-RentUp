import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

function MessagesPopover({ userId, userRole, onClose }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readMap, setReadMap] = useState({});
  const navigate = useNavigate();
  const popoverRef = useRef(null);

  useEffect(() => {
    const endpoint = userRole === 2
      ? `/api/chat/conversaciones/${userId}`
      : `/api/chat/conversaciones-inquilino/${userId}`;

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;

    axios
      .get(`${API_URL}${endpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((res) => {
        const unique = [];
        const seen = new Set();
        for (const conv of res.data || []) {
          if (!seen.has(conv.usuario_id)) {
            seen.add(conv.usuario_id);
            unique.push(conv);
          }
        }
        setConversaciones(unique);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar conversaciones:", err);
        setLoading(false);
      });
  }, [userId, userRole]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const marcarComoLeido = (usuarioId) => {
    setReadMap((prev) => ({ ...prev, [usuarioId]: true }));
  };

  const abrirChatCompleto = (e, conv) => {
    e.stopPropagation();
    marcarComoLeido(conv.usuario_id);
    onClose();
    navigate('/contacto');
  };

  const totalNoLeidos = conversaciones.reduce(
    (sum, c) => sum + (readMap[c.usuario_id] ? 0 : (c.mensajes_no_leidos || 0)),
    0
  );

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-2xl border border-line z-50 animate-fade-in overflow-hidden"
    >
      <div className="p-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500 text-lg">chat</span>
          <span className="font-bold text-ink text-sm">Mis Conversaciones</span>
          {totalNoLeidos > 0 && (
            <span className="bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {totalNoLeidos}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-outline text-sm">Cargando...</div>
        ) : conversaciones.length === 0 ? (
          <div className="p-8 text-center text-outline text-sm">Sin conversaciones</div>
        ) : (
          conversaciones.map((conv) => {
            const noLeidos = readMap[conv.usuario_id] ? 0 : (conv.mensajes_no_leidos || 0);
            return (
              <div
                key={conv.usuario_id}
                className="px-4 py-3 hover:bg-brand-500/5 cursor-pointer transition-colors flex items-center gap-3 border-b border-line/50 last:border-b-0"
                onClick={(e) => abrirChatCompleto(e, conv)}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                    {(conv.usuario_nombre || '?').charAt(0).toUpperCase()}
                  </div>
                  {noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                      {noLeidos}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${noLeidos > 0 ? 'font-semibold text-ink' : 'text-ink'}`}>
                      {conv.usuario_nombre} {conv.usuario_apellido}
                    </p>
                    {conv.ultimo_mensaje_fecha && (
                      <span className="text-[11px] text-outline/60 ml-2 whitespace-nowrap">
                        {new Date(conv.ultimo_mensaje_fecha).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short'
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-outline truncate mt-0.5">
                    {conv.ultimo_mensaje?.substring(0, 50) || 'Sin mensajes'}
                    {conv.ultimo_mensaje?.length > 50 ? '...' : ''}
                  </p>
                  {conv.apartamento_direccion && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full mt-1">
                      <span className="material-symbols-outlined" style={{fontSize:'0.6rem'}}>domain</span>
                      {conv.apartamento_direccion}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-line">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); navigate('/contacto'); }}
          className="w-full py-2 text-center text-sm font-medium text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          Ver todas las conversaciones →
        </button>
      </div>
    </div>
  );
}

export default MessagesPopover;
