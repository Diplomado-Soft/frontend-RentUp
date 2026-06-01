import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [readConversations, setReadConversations] = useState({});

  const marcarComoLeido = useCallback((usuarioId) => {
    setReadConversations(prev => ({ ...prev, [usuarioId]: true }));
  }, []);

  return (
    <NotificationContext.Provider value={{ readConversations, marcarComoLeido }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationContext debe usarse dentro de NotificationProvider");
  return ctx;
}
