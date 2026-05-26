import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../contexts/axiosInstance";
import ConfirmModal from "./ConfirmModal";
import { previewContractPdf, downloadContractPdf, renewContract } from "../apis/contractController";
import SignaturePad from "./SignaturePad";

const inputClass = "w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md placeholder:text-ink-muted";
const labelClass = "text-label-md uppercase tracking-wider text-ink-muted mb-1.5 block";

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
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [renewTarget, setRenewTarget] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signingContract, setSigningContract] = useState(null);
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
  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.start_date) {
      const start = new Date(formData.start_date);
      const months = durationDays / 30;
      start.setMonth(start.getMonth() + months);
      const endStr = start.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, end_date: endStr }));
    }
  }, [formData.start_date, durationDays]);

  const totalContractValue = formData.monthly_rent && durationDays
    ? (durationDays / 30) * parseFloat(formData.monthly_rent)
    : 0;

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

  const handleTerminateContract = async () => {
    if (!terminateTarget) return;
    try {
      await axiosInstance.put(`/contracts/${terminateTarget}/status`, { status: 'terminated' });
      showToast('Estado actualizado');
      setTerminateTarget(null);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al actualizar estado', 'error');
      setTerminateTarget(null);
    }
  };

  const canRenewContract = (c) => {
    if (c.status === 'active') return true;
    if (c.status === 'expired') {
      const endDate = new Date(c.end_date);
      const now = new Date();
      const diffDays = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return false;
  };

  const handleRenewContract = async () => {
    if (!renewTarget) return;
    try {
      const result = await renewContract(renewTarget.agreement_id, 12);
      if (result) {
        showToast('Contrato renovado exitosamente por 12 meses');
        setRenewTarget(null);
        fetchData();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al renovar contrato', 'error');
      setRenewTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({ id_apt: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", deposit_amount: "" });
    setDurationDays(30);
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
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">description</span>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink">Mis Contratos</h2>
            <p className="text-body-md text-ink-muted">Administra y crea contratos de arrendamiento</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-all text-label-md"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo Arriendo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paper-card rounded-xl p-6 border border-line/50 space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-500 text-lg">add_circle</span>
            <h3 className="font-display text-xl text-ink">Crear Nuevo Contrato</h3>
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
                  No hay apartamentos disponibles para arrendar
                </p>
              )}
            </div>

            <div className="md:col-span-2" ref={searchRef}>
              <label className={labelClass}>Inquilino</label>
              <div className="relative">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                    <span className="material-symbols-outlined text-sm">person_search</span>
                  </span>
                  <input type="text" value={searchQuery} onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 1 && setShowDropdown(true)}
                    placeholder="Escriba para buscar usuarios..." className={`${inputClass} pl-10`} />
                  {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin material-symbols-outlined text-sm text-ink-muted">sync</span>}
                </div>

                {showDropdown && tenantResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-paper-card border border-line/50 rounded-xl shadow-ambient-sm max-h-60 overflow-y-auto">
                    {tenantResults.map(tenant => (
                      <button key={tenant.user_id} type="button" onClick={() => selectTenant(tenant)}
                        className="w-full px-4 py-3 text-left hover:bg-paper-sunk flex items-center gap-3 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-label-md font-bold text-brand-500">{getInitials(tenant.user_name)}</span>
                        </div>
                        <div>
                          <p className="text-body-md font-medium text-ink">{tenant.user_name} {tenant.user_lastname}</p>
                          <p className="text-label-md text-ink-muted">{tenant.user_email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchQuery.length >= 1 && tenantResults.length === 0 && !searching && (
                  <div className="absolute z-20 w-full mt-1 bg-paper-card border border-line/50 rounded-xl shadow-ambient-sm p-4 text-center">
                    <p className="text-body-md text-ink-muted">No se encontraron usuarios</p>
                  </div>
                )}

                {selectedTenant && (
                  <div className="mt-2 p-3 bg-paper-sunk border border-line/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-label-md font-bold text-white">{getInitials(selectedTenant.user_name)}</span>
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-ink">{selectedTenant.user_name} {selectedTenant.user_lastname}</p>
                        <p className="text-label-md text-ink-muted">{selectedTenant.user_email}</p>
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
              <label className={labelClass}>Duración</label>
              <div className="flex gap-2">
                {[30, 60, 90, 120].map(d => (
                  <button key={d} type="button" onClick={() => setDurationDays(d)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      durationDays === d
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-paper-sunk text-ink hover:bg-line/30'
                    }`}>
                    {d / 30} {d === 30 ? 'Mes' : 'Meses'}
                  </button>
                ))}
              </div>
              {formData.start_date && (
                <p className="text-label-md text-ink-muted mt-1">
                  Fin estimado: <strong>{new Date(formData.end_date).toLocaleDateString('es-CO')}</strong>
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Canon Mensual (COP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
                <input type="number" name="monthly_rent" value={formData.monthly_rent} onChange={handleInputChange} required min="0" placeholder="0" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Depósito</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
                <input type="number" name="deposit_amount" value={formData.deposit_amount} onChange={handleInputChange} min="0" placeholder="0" className={`${inputClass} pl-8`} />
              </div>
            </div>
            {formData.monthly_rent && durationDays > 30 && (
              <div className="md:col-span-2 p-3 rounded-lg bg-brand-50 border border-brand-200">
                <p className="text-label-md text-brand-700">
                  Valor total del contrato: <strong className="text-lg">
                    ${(totalContractValue).toLocaleString('es-CO')} COP
                  </strong>
                  <span className="text-brand-500 ml-1">({durationDays / 30} meses × {parseFloat(formData.monthly_rent).toLocaleString('es-CO')}/mes)</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-all">
              <span className="material-symbols-outlined text-sm">check</span> Crear Contrato
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="flex items-center gap-2 px-6 py-3 bg-paper-sunk border border-line text-ink font-semibold rounded-lg hover:bg-line/30 transition-all">
              <span className="material-symbols-outlined text-sm">close</span> Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Contracts list */}
      <div>
        <h3 className="font-display text-xl text-ink mb-4">Contratos Recientes</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-paper-card border border-line/50 rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">description</span>
            <p className="text-body-md text-ink-muted">No hay arriendos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => (
              <div key={contract.agreement_id} className="bg-paper-card border border-line/50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-brand-500 text-lg">home</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-xl text-ink">{contract.barrio || 'Sin barrio'}</h4>
                        <p className="text-body-md text-ink-muted truncate">{contract.direccion_apt || 'Sin dirección'}</p>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-ink-muted">Inquilino</p>
                        <p className="text-body-md font-medium text-ink truncate">
                          {contract.tenant_name ? `${contract.tenant_name} ${contract.tenant_lastname || ''}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-ink-muted">Canon</p>
                        <p className="text-body-md font-medium text-ink">{formatPrice(contract.monthly_rent)}</p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-ink-muted">Inicio</p>
                        <p className="text-body-md text-ink">{formatDate(contract.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-label-md uppercase tracking-wider text-ink-muted">Fin</p>
                        <p className="text-body-md text-ink">{formatDate(contract.end_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {contract.signature_status && (
                        <span className={`inline-flex items-center gap-1 text-label-md px-2 py-0.5 rounded-full ${
                          contract.signature_status === 'fully_signed' ? 'bg-tertiary/10 text-tertiary' :
                          contract.signature_status === 'signed_by_tenant' ? 'bg-secondary/10 text-secondary' :
                          contract.signature_status === 'signed_by_landlord' ? 'bg-secondary/10 text-secondary' :
                          'bg-warning/10 text-warning'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {contract.signature_status === 'fully_signed' ? 'verified' :
                             contract.signature_status === 'signed_by_tenant' ? 'draw' :
                             contract.signature_status === 'signed_by_landlord' ? 'draw' :
                             'pending'}
                          </span>
                          {contract.signature_status === 'fully_signed' ? 'Totalmente firmado' :
                           contract.signature_status === 'signed_by_tenant' ? 'Inquilino firmó' :
                           contract.signature_status === 'signed_by_landlord' ? 'Tú firmaste' :
                           'Pendiente de firmas'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => {
                          const url = previewContractPdf(contract.agreement_id, contract.signed_pdf_url);
                          if (url) window.open(url, '_blank');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-paper-sunk text-ink hover:bg-line/30 transition text-label-md font-medium">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Vista previa
                      </button>
                      {contract.signature_status !== 'fully_signed' && (contract.status === 'active' || contract.status === 'pending') && (
                        (Date.now() - new Date(contract.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7 && (
                        <button onClick={() => {
                            setSigningContract(contract);
                            setShowSignaturePad(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition text-label-md font-medium">
                          <span className="material-symbols-outlined text-sm">draw</span>
                          Firmar
                        </button>
                      ))}
                      {contract.signature_status === 'fully_signed' && (
                        <button onClick={() => downloadContractPdf(contract.agreement_id, contract.signed_pdf_url)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition text-label-md font-medium">
                          <span className="material-symbols-outlined text-sm">download</span>
                          Descargar PDF
                        </button>
                      )}
                      {canRenewContract(contract) && (
                        <button onClick={() => setRenewTarget(contract)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition text-label-md font-medium">
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          Renovar
                        </button>
                      )}
                    </div>
                  </div>
                  {(contract.status === 'active' || (contract.status === 'expired' && canRenewContract(contract))) && (
                    <button onClick={() => setTerminateTarget(contract.agreement_id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition flex-shrink-0 text-label-md font-semibold" title="Finalizar contrato">
                      <span className="material-symbols-outlined text-sm">gavel</span>
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSignaturePad && signingContract && (
        <SignaturePad
          contract={signingContract}
          onClose={() => { setShowSignaturePad(false); setSigningContract(null); }}
          onSigned={(result) => {
            setShowSignaturePad(false);
            setSigningContract(null);
            showToast('Contrato firmado exitosamente');
            fetchData();
          }}
        />
      )}

      <ConfirmModal
        open={!!terminateTarget}
        title="¿Finalizar contrato?"
        message="Se marcará el contrato como finalizado y la propiedad quedará disponible nuevamente."
        confirmLabel="Finalizar"
        variant="danger"
        onConfirm={handleTerminateContract}
        onCancel={() => setTerminateTarget(null)}
      />

      <ConfirmModal
        open={!!renewTarget}
        title="¿Renovar contrato?"
        message={`Se renovará el contrato por 12 meses adicionales a partir de la fecha actual.${renewTarget?.status === 'expired' ? ' El contrato está vencido, se reactivará automáticamente.' : ''}`}
        confirmLabel="Renovar"
        onConfirm={handleRenewContract}
        onCancel={() => setRenewTarget(null)}
      />

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3 rounded-xl shadow-ambient-sm z-50 flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-error text-white' : 'bg-tertiary text-white'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ContractManager;
