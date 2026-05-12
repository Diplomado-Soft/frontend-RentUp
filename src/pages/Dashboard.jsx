import React, { useState, useContext } from "react";
import ApartmentForm from "../components/ApartmentForm";
import Manage from '../components/Manage';
import ContractManager from '../components/ContractManager';
import LandlordReviews from '../components/LandlordReviews';
import Toast from '../components/Toast';
import { UserContext } from '../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faFileContract, faStar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleApartmentAdded = () => {
    setShowSuccessToast(true);
    setActiveTab('list');
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

    </div>
  );
}

export default Dashboard;
