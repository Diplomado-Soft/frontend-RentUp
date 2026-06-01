import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatComponent from "./ChatComponent";
import { useNotificationContext } from "../contexts/NotificationContext";
import "../styles/ChatList.css";

export default function TenantChatList({ tenant_id }) {
  const { readConversations, marcarComoLeido } = useNotificationContext();
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant_id) return;

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;

    axios
      .get(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/api/chat/conversaciones-inquilino/${tenant_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((res) => {
        const uniqueByUser = [];
        const seen = new Set();
        for (const conv of res.data || []) {
          if (!seen.has(conv.usuario_id)) {
            seen.add(conv.usuario_id);
            uniqueByUser.push(conv);
          }
        }
        setConversaciones(uniqueByUser);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar conversaciones:", err);
        setLoading(false);
      });
  }, [tenant_id]);

  const abrirChat = (usuario) => {
    marcarComoLeido(usuario.usuario_id);
    setConversacionActiva(usuario);
  };

  const cerrarChat = () => {
    setConversacionActiva(null);
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="loading-spinner">Cargando conversaciones...</div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      {!conversacionActiva ? (
        <div className="conversaciones-lista">
          <div className="chat-list-header">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-brand-500 text-xl">chat</span>
              <h2 className="font-display text-2xl text-ink m-0">Mis Conversaciones</h2>
            </div>
            <p className="subtitle">Mensajes con tus arrendadores</p>
          </div>

          {conversaciones.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-symbols-outlined text-4xl text-outline">forum</span>
              </div>
              <h3>No tienes conversaciones</h3>
              <p>Cuando contactes a un arrendador, aparecerán aquí</p>
            </div>
          ) : (
            <div className="conversaciones-grid">
              {conversaciones.map((conv) => (
                <div
                  key={conv.usuario_id}
                  className="conversacion-card"
                  onClick={() => abrirChat(conv)}
                >
                  <div className="conversacion-avatar">
                    <div className="avatar-circle">
                      {conv.usuario_nombre?.charAt(0).toUpperCase()}
                    </div>
                    {!readConversations[conv.usuario_id] && conv.mensajes_no_leidos > 0 && (
                      <span className="badge-unread">{conv.mensajes_no_leidos}</span>
                    )}
                  </div>

                  <div className="conversacion-info">
                    <div className="conversacion-header">
                      <h3 className="usuario-nombre">
                        {conv.usuario_nombre} {conv.usuario_apellido}
                      </h3>
                      <span className="timestamp">
                        {conv.ultimo_mensaje_fecha ? new Date(conv.ultimo_mensaje_fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short'
                        }) : ''}
                      </span>
                    </div>
                    <p className="ultimo-mensaje">
                      {conv.ultimo_mensaje?.substring(0, 50)}
                      {conv.ultimo_mensaje?.length > 50 ? '...' : ''}
                    </p>
                    {conv.propiedades_asociadas && (
                      <span className="propiedad-tag">
                        <span className="material-symbols-outlined" style={{fontSize:'0.7rem'}}>domain</span>
                        {conv.propiedades_asociadas}
                      </span>
                    )}
                  </div>

                  <div className="conversacion-action">
                    <button className="btn-abrir-chat">
                      Abrir chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="chat-activo-container">
          <div className="chat-header">
            <button className="btn-volver" onClick={cerrarChat}>
              ← Volver
            </button>
            <div className="chat-user-info">
              <div className="avatar-small">
                {conversacionActiva.usuario_nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>
                  {conversacionActiva.usuario_nombre} {conversacionActiva.usuario_apellido}
                </h3>
                {conversacionActiva.propiedades_asociadas && (
                  <p className="chat-propiedad">
                    Propiedades: {conversacionActiva.propiedades_asociadas}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="chat-wrapper">
            <ChatComponent
              emisor_id={tenant_id}
              receptor_id={conversacionActiva.usuario_id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
