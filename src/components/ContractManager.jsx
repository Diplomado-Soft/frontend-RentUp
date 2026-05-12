import React, { useState, useEffect, useRef } from "react";
import { FaUserPlus, FaSearch, FaFileContract, FaCheck, FaTimes, FaUser, FaSpinner } from "react-icons/fa";
import axiosInstance from "../contexts/axiosInstance";

function ContractManager() {
  const [contracts, setContracts] = useState([]);
  const [availableApartments, setAvailableApartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantResults, setTenantResults] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    id_apt: "",
    tenant_id: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit_amount: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [contractsRes, apartmentsRes] = await Promise.all([
        axiosInstance.get('/contracts/landlord/contracts'),
        axiosInstance.get('/contracts/landlord/available-apartments')
      ]);

      const contractsData = contractsRes.data;
      const apartmentsData = apartmentsRes.data;

      if (Array.isArray(contractsData)) {
        setContracts(contractsData);
      } else {
        console.error('Contracts response is not an array:', contractsData);
        setContracts([]);
      }
      
      if (Array.isArray(apartmentsData)) {
        setAvailableApartments(apartmentsData);
      } else {
        console.error('Apartments response is not an array:', apartmentsData);
        setAvailableApartments([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const searchTenants = async (query) => {
    if (query.length < 1) {
      setTenantResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    setShowDropdown(true);

    try {
      const res = await axiosInstance.get(`/contracts/search-tenants`, { params: { q: query } });
      const data = res.data;
      
      if (Array.isArray(data)) {
        setTenantResults(data);
      } else {
        setTenantResults([]);
      }
    } catch (error) {
      console.error('Error searching tenants:', error);
      setTenantResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchTenants(value);
    }, 300);
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setFormData(prev => ({ ...prev, tenant_id: tenant.user_id.toString() }));
    setSearchQuery(`${tenant.user_name} ${tenant.user_lastname}`);
    setTenantResults([]);
    setShowDropdown(false);
  };

  const clearTenant = () => {
    setSelectedTenant(null);
    setFormData(prev => ({ ...prev, tenant_id: "" }));
    setSearchQuery("");
    setTenantResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApartmentChange = (e) => {
    const id_apt = e.target.value;
    const apt = availableApartments.find(a => a.id_apt === parseInt(id_apt));
    setFormData(prev => ({
      ...prev,
      id_apt,
      monthly_rent: apt ? apt.price?.toString() || "" : prev.monthly_rent
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form data:', formData);

    if (!formData.id_apt || !formData.tenant_id || !formData.start_date || !formData.end_date || !formData.monthly_rent) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    try {
      const payload = {
        id_apt: parseInt(formData.id_apt),
        tenant_id: parseInt(formData.tenant_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent),
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        activate_immediately: true
      };

      console.log('Payload:', payload);

      const res = await axiosInstance.post('/contracts', payload);

      if (res.status === 200 || res.status === 201) {
        showToast('¡Arriendo creado exitosamente!');
        setShowForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al crear arriendo';
      showToast(msg, 'error');
      console.error('Error creating contract:', error);
    }
  };

  const updateContractStatus = async (agreement_id, newStatus) => {
    try {
      await axiosInstance.put(`/contracts/${agreement_id}/status`, { status: newStatus });
      showToast('Estado actualizado');
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al actualizar estado';
      showToast(msg, 'error');
      console.error('Error updating contract:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id_apt: "",
      tenant_id: "",
      start_date: "",
      end_date: "",
      monthly_rent: "",
      deposit_amount: ""
    });
    setSelectedTenant(null);
    setSearchQuery("");
    setTenantResults([]);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendiente',
      active: 'Activo',
      expired: 'Vencido',
      terminated: 'Terminado'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <FaFileContract className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Arriendos</h2>
              <p className="text-sm text-gray-600">Vincule apartamentos a inquilinos</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg font-medium"
          >
            <FaUserPlus />
            <span>Nuevo Arriendo</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileContract className="text-green-600" />
              Crear Nuevo Arriendo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartamento *</label>
                <select
                  name="id_apt"
                  value={formData.id_apt}
                  onChange={handleApartmentChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Seleccione un apartamento</option>
                  {availableApartments.map(apt => (
                    <option key={apt.id_apt} value={apt.id_apt}>
                      {apt.barrio || 'Sin barrio'} - {apt.direccion_apt}
                    </option>
                  ))}
                </select>
                {availableApartments.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">No hay apartamentos disponibles para arrendar</p>
                )}
              </div>

              <div className="md:col-span-2" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inquilino *</label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <FaSearch className="absolute left-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.length >= 1 && setShowDropdown(true)}
                      placeholder="Escriba para buscar usuarios..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {searching && <FaSpinner className="absolute right-3 animate-spin text-gray-400" />}
                  </div>
                  
                  {showDropdown && tenantResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {tenantResults.map(tenant => (
                        <button
                          key={tenant.user_id}
                          type="button"
                          onClick={() => selectTenant(tenant)}
                          className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-green-600 text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{tenant.user_name} {tenant.user_lastname}</p>
                            <p className="text-sm text-gray-500">{tenant.user_email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showDropdown && searchQuery.length >= 1 && tenantResults.length === 0 && !searching && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </div>
                  )}

                  {selectedTenant && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <FaUser className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{selectedTenant.user_name} {selectedTenant.user_lastname}</p>
                          <p className="text-sm text-green-600">{selectedTenant.user_email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearTenant}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canon Mensual (COP) *</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Ej: 1500000"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito</label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Ej: 1500000"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
              >
                <FaCheck /> Crear Arriendo
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition shadow-lg"
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Arriendos Registrados</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <FaFileContract className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500">No hay arriendos registrados</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {contracts.map(contract => (
              <div key={contract.agreement_id} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-800">{contract.barrio || 'Sin barrio'} - {contract.direccion_apt || 'Sin dirección'}</h4>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Inquilino:</p>
                        <p className="font-medium text-gray-800">
                          {contract.tenant_name ? `${contract.tenant_name} ${contract.tenant_lastname}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Canon:</p>
                        <p className="font-medium text-gray-800">{formatPrice(contract.monthly_rent)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Inicio:</p>
                        <p className="font-medium text-gray-800">{formatDate(contract.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fin:</p>
                        <p className="font-medium text-gray-800">{formatDate(contract.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {contract.status === 'active' && (
                      <button
                        onClick={() => updateContractStatus(contract.agreement_id, 'terminated')}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                        title="Terminar arriendo"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ContractManager;
