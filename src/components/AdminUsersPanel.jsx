import React from 'react';
import { FaSpinner, FaUsers, FaInfoCircle, FaSearch, FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone } from 'react-icons/fa';

function AdminUsersPanel({
  users, usersLoading, userSearch, userRoleFilter, userPagination,
  actionLoading, searchTimeoutRef, roleTimeoutRef,
  setUserSearch, setUserRoleFilter, setUsersLoading, setUsers,
  fetchUsers, handleBlockUser, handleUnblockUser,
  setShowBlockModal, setUserToBlock
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
          <FaUsers className="text-info-500" />
          Gestión de Usuarios
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">Administra los permisos y el estado de todos los miembros de la plataforma.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-sm" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              clearTimeout(searchTimeoutRef.current);
              searchTimeoutRef.current = setTimeout(() => fetchUsers(0, userRoleFilter), 500);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#5849E4] focus:ring-2 focus:ring-[#5849E4]/10 transition-all outline-none"
          />
        </div>
        <select
          value={userRoleFilter}
          onChange={(e) => {
            const newRole = e.target.value;
            setUserRoleFilter(newRole);
            setUsers([]);
            setUsersLoading(true);
            clearTimeout(roleTimeoutRef.current);
            roleTimeoutRef.current = setTimeout(() => fetchUsers(0, newRole), 50);
          }}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#5849E4] focus:ring-2 focus:ring-[#5849E4]/10 transition-all outline-none"
        >
          <option value="">Filtrar por Rol</option>
          <option value="0">Sin rol</option>
          <option value="1">Usuario</option>
          <option value="2">Arrendador</option>
          <option value="3">Admin</option>
        </select>
      </div>

      {usersLoading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
          <span className="ml-3 text-on-surface-variant">Cargando usuarios...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
          <FaInfoCircle className="text-4xl text-outline mx-auto mb-4" />
          <p className="text-on-surface-variant">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(user => {
            const roleColors = {
              3: { badge: 'bg-[#E0DCFF] text-[#3A23C8]' },
              2: { badge: 'bg-[#DCFCE7] text-[#15803D]' },
              1: { badge: 'bg-[#DBEAFE] text-[#1D4ED8]' }
            };
            const rc = roleColors[user.rol_id] || { badge: 'bg-gray-100 text-gray-500' };
            return (
              <div key={user.user_id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                      user.is_active ? 'bg-[#5849E4]' : 'bg-danger-500'
                    }`}>
                      {(user.user_name || 'U').charAt(0).toUpperCase()}
                      {(user.user_lastname || '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-headline font-semibold text-[#0B1C30] text-base">{user.user_name} {user.user_lastname}</h3>
                      <p className="text-xs text-outline/70">ID: #{user.user_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rc.badge}`}>
                    {user.rol_id === 3 ? 'Admin' : user.rol_id === 2 ? 'Arrendador' : user.rol_id === 1 ? 'Usuario' : 'Sin rol'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <FaEnvelope className="text-outline text-sm flex-shrink-0" />
                    <span className="text-sm truncate">{user.user_email}</span>
                  </div>
                  {user.user_phonenumber && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <FaPhone className="text-outline text-sm flex-shrink-0" />
                      <span className="text-sm">{user.user_phonenumber}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-success-500' : 'bg-danger-500'}`} />
                    <span className="text-xs font-medium text-on-surface-variant">{user.is_active ? 'Activo' : 'Bloqueado'}</span>
                  </div>
                  {actionLoading === user.user_id ? (
                    <FaSpinner className="animate-spin text-outline" />
                  ) : user.is_active ? (
                    <button
                      onClick={() => { setUserToBlock(user); setShowBlockModal(true); }}
                      disabled={user.rol_id === 3}
                      className="text-sm font-medium text-[#5849E4] border border-[#5849E4]/40 px-4 py-1.5 rounded-lg hover:bg-[#F5F3FF] transition-all disabled:opacity-40"
                    >
                      Bloquear
                    </button>
                  ) : (
                    <button onClick={() => handleUnblockUser(user.user_id)}
                      className="text-sm font-medium text-white bg-[#5849E4] px-4 py-1.5 rounded-lg hover:bg-[#3f2acc] transition-all"
                    >
                      Desbloquear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {users.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
          <span className="text-sm text-on-surface-variant">
            Mostrando {userPagination.offset + 1}-{Math.min(userPagination.offset + userPagination.limit, userPagination.total)} de {userPagination.total} usuarios
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={userPagination.offset === 0}
              onClick={() => fetchUsers(Math.max(0, userPagination.offset - userPagination.limit))}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-on-surface-variant hover:bg-gray-50 transition-all disabled:opacity-40"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <span className="text-xs text-outline">...</span>
            <button
              disabled={userPagination.offset + userPagination.limit >= userPagination.total}
              onClick={() => fetchUsers(userPagination.offset + userPagination.limit)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-on-surface-variant hover:bg-gray-50 transition-all disabled:opacity-40"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPanel;
