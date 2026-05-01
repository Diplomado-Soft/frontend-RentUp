// src/components/My-Account/Messages.js
import React, { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import ChatList from "../ChatList";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

function Messages() {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center gap-3 text-surface-500 py-8">
          <p>Por favor, inicia sesión para ver tus mensajes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faComments} className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Mensajes</h2>
          <p className="text-sm text-surface-500">Conversaciones con arrendadores</p>
        </div>
      </div>
      
      <div className="messages-container">
        <ChatList />
      </div>
    </div>
  );
}

export default Messages;
