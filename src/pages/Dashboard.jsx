import React, { useState, useContext } from "react";
import ApartmentForm from "../components/ApartmentForm";
import Manage from '../components/Manage';
import ContractManager from '../components/ContractManager';
import LandlordReviews from '../components/LandlordReviews';
import Toast from '../components/Toast';
import { UserContext } from '../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faChartLine, faTrash, faExclamationTriangle, faFileContract, faStar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleApartmentAdded = () => {
    setShowSuccessToast(true);
    setActiveTab('list');
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData?.token;
      
      if (!token) {
        alert('Sesión expirada');
        logout();
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/users/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        logout();
        navigate('/');
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        alert('Error al eliminar la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la cuenta');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] sm:min-h-[calc(100vh-56px)] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header con Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-1 sm:px-4">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="mr-1 sm:mr-2 text-xs sm:text-sm" />
              <span className="hidden xs:inline">Mis Apartamentos</span>
              <span className="xs:hidden">Mis Aptos</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'add'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1 sm:mr-2 text-xs sm:text-sm" />
              <span className="hidden xs:inline">Añadir Apartamento</span>
              <span className="xs:hidden">Añadir</span>
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'contracts'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faFileContract} className="mr-1 sm:mr-2 text-xs sm:text-sm" />
              <span className="hidden xs:inline">Arriendos</span>
              <span className="xs:hidden">Arriendos</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faStar} className="mr-1 sm:mr-2 text-xs sm:text-sm" />
              <span className="hidden xs:inline">Reseñas</span>
              <span className="xs:hidden">Reseñas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {activeTab === 'list' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Mis Apartamentos</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestiona tus propiedades publicadas</p>
                </div>
              </div>
              <Manage />
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-4xl mx-auto">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Añadir Nuevo Apartamento</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Completa la información para publicar tu propiedad</p>
              </div>
              <ApartmentForm onApartmentAdded={handleApartmentAdded} />
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="animate-fadeIn">
            <ContractManager />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fadeIn">
            <LandlordReviews />
          </div>
        )}
      </div>

      {/* Notificación de apartamento añadido */}
      {showSuccessToast && (
        <Toast 
          message="¡Apartamento añadido exitosamente!" 
          type="success" 
          onClose={() => setShowSuccessToast(false)} 
        />
      )}

      {/* Botón para eliminar cuenta */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faTrash} />
          Eliminar mi cuenta
        </button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              ¿Estás seguro de eliminar tu cuenta?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Esta acción es irreversible. Se eliminarán todos tus datos, apartamentos y publicaciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
