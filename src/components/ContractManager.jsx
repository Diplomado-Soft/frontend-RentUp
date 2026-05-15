import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../contexts/axiosInstance";

const inputClass = "w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md placeholder:text-outline";
const labelClass = "text-label-md uppercase tracking-wider text-outline mb-1.5 block";

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
      setContracts(Array.isArray(contractsRes.data) ? contractsRes.data : []);
      setAvailableApartments(Array.isArray(apartmentsRes.data) ? apartmentsRes.data : []);
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
    if (query.length < 1) { setTenantResults([]); setShowDropdown(false); return; }
    setSearching(true);
    setShowDropdown(true);
    try {
      const res = await axiosInstance.get(`/contracts/search-tenants`, { params: { q: query } });
      setTenantResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error searching tenants:', error);
      setTenantResults([]);
    } finally { setSearching(false); }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchTenants(value), 300);
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
      ...prev, id_apt,
      monthly_rent: apt ? apt.price?.toString() || "" : prev.monthly_rent
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_apt || !formData.tenant_id || !formData.start_date || !formData.end_date || !formData.monthly_rent) {
      showToast('Por favor complete todos los campos requeridos', 'error'); return;
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
      const res = await axiosInstance.post('/contracts', payload);
      if (res.status === 200 || res.status === 201) {
        showToast('¡Arriendo creado exitosamente!');
        setShowForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al crear arriendo', 'error');
    }
  };

  const updateContractStatus = async (agreement_id, newStatus) => {
    try {
      await axiosInstance.put(`/contracts/${agreement_id}/status`, { status: newStatus });
      showToast('Estado actualizado');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al actualizar estado', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ id_apt: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", deposit_amount: "" });
    setSelectedTenant(null);
    setSearchQuery("");
    setTenantResults([]);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pendiente', cls: 'bg-secondary/10 text-secondary' },
      active: { label: 'Activo', cls: 'bg-tertiary/10 text-tertiary' },
      expired: { label: 'Vencido', cls: 'bg-surface-container-high text-outline' },
      terminated: { label: 'Terminado', cls: 'bg-error-container/30 text-error' }
    };
    const c = config[status] || config.pending;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium ${c.cls}`}>{c.label}</span>;
  };

  const getInitials = (name) => (name || '').charAt(0).toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-on-primary text-lg">description</span>
          </div>
          <div>
            <h2 className="font-headline text-headline-md text-on-surface">Gestión de Arriendos</h2>
            <p className="text-body-md text-on-surface-variant">Administra y crea contratos de arrendamiento</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo Arriendo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">add_circle</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Crear Nuevo Contrato</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Propiedad</label>
              <select name="id_apt" value={formData.id_apt} onChange={handleApartmentChange} required className={inputClass}>
                <option value="">Seleccione una propiedad</option>
                {availableApartments.map(apt => (
                  <option key={apt.id_apt} value={apt.id_apt}>
                    {apt.barrio || 'Sin barrio'} - {apt.direccion_apt}
                  </option>
                ))}
              </select>
              {availableApartments.length === 0 && (
                <p className="text-label-md text-secondary mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  No hay apartamentos disponibles
                </p>
              )}
            </div>

            <div className="md:col-span-2" ref={searchRef}>
              <label className={labelClass}>Inquilino</label>
              <div className="relative">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    <span className="material-symbols-outlined text-sm">person_search</span>
                  </span>
                  <input type="text" value={searchQuery} onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 1 && setShowDropdown(true)}
                    placeholder="Escriba para buscar usuarios..." className={`${inputClass} pl-10`} />
                  {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin material-symbols-outlined text-sm text-outline">sync</span>}
                </div>

                {showDropdown && tenantResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-surface-container-lowest rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {tenantResults.map(tenant => (
                      <button key={tenant.user_id} type="button" onClick={() => selectTenant(tenant)}
                        className="w-full px-4 py-3 text-left hover:bg-surface-container-low flex items-center gap-3 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-label-md font-bold text-primary">{getInitials(tenant.user_name)}</span>
                        </div>
                        <div>
                          <p className="text-body-md font-medium text-on-surface">{tenant.user_name} {tenant.user_lastname}</p>
                          <p className="text-label-md text-outline">{tenant.user_email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchQuery.length >= 1 && tenantResults.length === 0 && !searching && (
                  <div className="absolute z-20 w-full mt-1 bg-surface-container-lowest rounded-xl shadow-lg p-4 text-center">
                    <p className="text-body-md text-on-surface-variant">No se encontraron usuarios</p>
                  </div>
                )}

                {selectedTenant && (
                  <div className="mt-2 p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-label-md font-bold text-on-primary">{getInitials(selectedTenant.user_name)}</span>
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-on-surface">{selectedTenant.user_name} {selectedTenant.user_lastname}</p>
                        <p className="text-label-md text-outline">{selectedTenant.user_email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={clearTenant} className="text-error hover:bg-error/10 rounded-lg p-1.5 transition">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Fecha Inicio</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha Fin</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Canon Mensual (COP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                <input type="number" name="monthly_rent" value={formData.monthly_rent} onChange={handleInputChange} required min="0" placeholder="0" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Depósito</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                <input type="number" name="deposit_amount" value={formData.deposit_amount} onChange={handleInputChange} min="0" placeholder="0" className={`${inputClass} pl-8`} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-sm">check</span> Crear Contrato
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-all">
              <span className="material-symbols-outlined text-sm">close</span> Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Contracts list */}
      <div>
        <h3 className="font-headline text-headline-sm text-on-surface mb-4">Contratos Recientes</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">description</span>
            <p className="text-body-md text-on-surface-variant">No hay arriendos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => (
              <div key={contract.agreement_id} className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">home</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-headline text-headline-sm text-on-surface">{contract.barrio || 'Sin barrio'}</h4>
                        <p className="text-body-md text-on-surface-variant truncate">{contract.direccion_apt || 'Sin dirección'}</p>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Inquilino</p>
                        <p className="text-body-md font-medium text-on-surface truncate">
                          {contract.tenant_name ? `${contract.tenant_name} ${contract.tenant_lastname || ''}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Canon</p>
                        <p className="text-body-md font-medium text-on-surface">{formatPrice(contract.monthly_rent)}</p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Inicio</p>
                        <p className="text-body-md text-on-surface">{formatDate(contract.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Fin</p>
                        <p className="text-body-md text-on-surface">{formatDate(contract.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  {contract.status === 'active' && (
                    <button onClick={() => updateContractStatus(contract.agreement_id, 'terminated')}
                      className="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition flex-shrink-0" title="Finalizar contrato">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-error text-on-error' : 'bg-tertiary text-on-tertiary'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ContractManager;
