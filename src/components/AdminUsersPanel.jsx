import React from 'react';
import { FaSpinner, FaUser, FaInfoCircle, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

function AdminUsersPanel({
  users,
  usersLoading,
  userSearch,
  userRoleFilter,
  userPagination,
  actionLoading,
  searchTimeoutRef,
  roleTimeoutRef,
  setUserSearch,
  setUserRoleFilter,
  setUsersLoading,
  setUsers,
  fetchUsers,
  handleBlockUser,
  handleUnblockUser,
  setShowBlockModal,
  setUserToBlock
}) {
  return (
    <div className="users-section">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaUser className="text-blue-500" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 text-sm">Administra y controla el acceso de usuarios</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => fetchUsers(0, userRoleFilter), 500);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[250px]"
        />
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
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todos los roles</option>
          <option value="0">Sin rol</option>
          <option value="1">Usuario</option>
          <option value="2">Arrendador</option>
          <option value="3">Admin</option>
        </select>
      </div>

      {usersLoading ? (
        <div className="loadingSpinner">
          <FaSpinner className="spinning" />
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="alert-box alert-info">
          <FaInfoCircle className="mr-2" />
          No se encontraron usuarios
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.user_id} className="user-card p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    user.is_active ? 'bg-blue-500' : 'bg-red-500'
                  }`}>
                    {(user.user_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{user.user_name} {user.user_lastname}</p>
                    <p className="text-sm text-gray-500">{user.user_email}</p>
                    {user.user_phonenumber && (
                      <p className="text-xs text-gray-400">{user.user_phonenumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.rol_id === 3 ? 'bg-purple-100 text-purple-700' :
                    user.rol_id === 2 ? 'bg-green-100 text-green-700' :
                    user.rol_id === 1 ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {user.rol_id === 3 ? 'Admin' :
                     user.rol_id === 2 ? 'Arrendador' :
                     user.rol_id === 1 ? 'Usuario' :
                     'Sin rol'}
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Activo' : 'Bloqueado'}
                  </span>

                  {actionLoading === user.user_id ? (
                    <FaSpinner className="spinning text-gray-500" />
                  ) : user.is_active ? (
                    <button
                      onClick={() => {
                        setUserToBlock(user);
                        setShowBlockModal(true);
                      }}
                      className="btn btn-danger btn-sm"
                      disabled={user.rol_id === 3}
                      title={user.rol_id === 3 ? 'No puedes bloquear a otro admin' : 'Bloquear usuario'}
                    >
                      <FaTimesCircle /> Bloquear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnblockUser(user.user_id)}
                      className="btn btn-success btn-sm"
                    >
                      <FaCheckCircle /> Desbloquear
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Registrado: {new Date(user.created_at).toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div className="pagination mt-6">
          <button
            disabled={userPagination.offset === 0}
            onClick={() => fetchUsers(Math.max(0, userPagination.offset - userPagination.limit))}
          >
            ← Anterior
          </button>
          <span>
            Mostrando {userPagination.offset + 1}-{Math.min(userPagination.offset + userPagination.limit, userPagination.total)} de {userPagination.total}
          </span>
          <button
            disabled={userPagination.offset + userPagination.limit >= userPagination.total}
            onClick={() => fetchUsers(userPagination.offset + userPagination.limit)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPanel;
