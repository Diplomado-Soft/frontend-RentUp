import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faUser, faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "../styles/ChatList.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function ChatList({ onSelectChat, selectedChatId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const response = await fetch(`${API_URL}/chat/conversaciones/${userData.id}`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Cargando conversaciones...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><FontAwesomeIcon icon={faComment} /></div>
        <h3>No tienes mensajes</h3>
        <p>Cuando contactes a un arrendador, aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="conversaciones-grid">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`conversacion-card ${selectedChatId === conv.id ? 'selected' : ''}`}
          onClick={() => onSelectChat(conv)}
        >
          <div className="conversacion-avatar">
            <div className="avatar-circle">
              {(conv.other_user_name || "U").charAt(0)}
            </div>
            {conv.unread_count > 0 && (
              <span className="badge-unread">{conv.unread_count}</span>
            )}
          </div>
          <div className="conversacion-info">
            <div className="conversacion-header">
              <h4 className="usuario-nombre">
                {conv.other_user_name} {conv.other_user_lastname || ''}
              </h4>
              <span className="timestamp">
                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString("es-CO") : ''}
              </span>
            </div>
            <p className="ultimo-mensaje">
              {conv.last_message || "Sin mensajes"}
            </p>
            {conv.property_title && (
              <span className="propiedad-tag">
                <FontAwesomeIcon icon={faHome} /> {conv.property_title}
              </span>
            )}
          </div>
          <div className="conversacion-action">
            <button className="btn-abrir-chat">Abrir</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
