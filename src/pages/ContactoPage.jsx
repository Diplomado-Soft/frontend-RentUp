import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import ChatList from '../components/ChatList';
import TenantChatList from '../components/TenantChatList';

function ContactoPage() {
  const { user } = useContext(UserContext);
  const userId = user?.id || user?.user_id;
  const userRole = user?.rol || user?.rol_id || user?.rolId || null;

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-outline text-lg">Inicia sesión para ver tus mensajes</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
          <div className="p-4 border-b border-line bg-paper-sunk">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-500 text-2xl">forum</span>
              <div>
                <h1 className="font-display text-2xl text-ink font-bold">Bandeja de Entrada</h1>
                <p className="text-sm text-ink-muted">Todas tus conversaciones en un solo lugar</p>
              </div>
            </div>
          </div>
          <div className="h-[calc(100vh-250px)] min-h-[500px]">
            {userRole === 2 ? (
              <ChatList arrendador_id={userId} />
            ) : (
              <TenantChatList tenant_id={userId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactoPage;
