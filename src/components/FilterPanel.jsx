import React from 'react';

const AMENITIES = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'parqueadero', label: 'Parqueadero' },
  { key: 'gimnasio', label: 'Gimnasio' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'lavandería', label: 'Lavandería' },
  { key: 'seguridad', label: 'Seguridad 24/7' },
  { key: 'aire acondicionado', label: 'Aire Acond.' },
  { key: 'balcón', label: 'Balcón' },
  { key: 'ascensor', label: 'Ascensor' },
  { key: 'mascotas', label: 'Mascotas' },
];

const BEDROOM_OPTIONS = ['1', '2', '3', '4+'];
const BATHROOM_OPTIONS = ['1', '2', '3+'];
const PRICE_MAX = 6000000;
const STEP = 100000;

const formatPriceCol = (val) => {
  if (val === 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);
};

function Chip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
        selected
          ? 'bg-ink text-paper shadow-sm'
          : 'bg-paper-sunk text-ink-soft hover:bg-paper-sunk-hover hover:text-ink border border-line'
      }`}
    >
      {children}
    </button>
  );
}

function EditablePrice({ value, onChange, minBound, maxBound, align }) {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const display = focused
    ? draft
    : formatPriceCol(Number(value || 0));

  const commit = (raw) => {
    setFocused(false);
    const num = parseInt(raw, 10) || 0;
    const clamped = Math.max(minBound, Math.min(maxBound, num));
    onChange(String(clamped));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(String(value || 0));
      }}
      onChange={e => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setDraft(raw);
      }}
      onBlur={() => commit(draft)}
      onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
      className={`w-[90px] px-1.5 py-1 rounded-md border border-line bg-paper text-[11px] text-ink font-medium tabular-nums outline-none focus:border-ink transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
    />
  );
}

function DualRangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, step }) {
  const trackRef = React.useRef(null);
  const dragging = React.useRef(null);
  const [active, setActive] = React.useState(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;
  const pctMin = pct(valueMin);
  const pctMax = pct(valueMax);

  const valueFromClientX = (clientX) => {
    if (!trackRef.current) return valueMin;
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const stepped = Math.round(((min + p * (max - min)) / step)) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  const startDrag = (thumb, e) => {
    dragging.current = thumb;
    setActive(thumb);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerDown = (e) => {
    const v = valueFromClientX(e.clientX);
    const toMin = Math.abs(v - valueMin);
    const toMax = Math.abs(v - valueMax);
    startDrag(toMin <= toMax ? 'min' : 'max', e);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const v = valueFromClientX(e.clientX);
    if (dragging.current === 'min' && v <= valueMax) onChangeMin(v);
    if (dragging.current === 'max' && v >= valueMin) onChangeMax(v);
  };

  const endDrag = () => {
    dragging.current = null;
    setActive(null);
  };

  return (
    <div
      ref={trackRef}
      className="relative w-[320px] cursor-pointer select-none"
      style={{ height: 24, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Track bg */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-line pointer-events-none" />
      {/* Track active */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-brand-500 pointer-events-none"
        style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
      />
      {/* Min thumb — blanca */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-sm transition-shadow ${
          active === 'min' ? 'bg-white border-brand-700 border-[3px] shadow-md scale-110' : 'bg-white border-2 border-brand-500'
        }`}
        style={{ left: `calc(${pctMin}% - 10px)`, cursor: 'grab' }}
        onPointerDown={(e) => { e.stopPropagation(); startDrag('min', e); }}
      />
      {/* Max thumb — azul */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-sm transition-shadow ${
          active === 'max' ? 'bg-brand-600 border-brand-800 border-[3px] shadow-md scale-110' : 'bg-brand-500 border-2 border-brand-600'
        }`}
        style={{ left: `calc(${pctMax}% - 10px)`, cursor: 'grab' }}
        onPointerDown={(e) => { e.stopPropagation(); startDrag('max', e); }}
      />
    </div>
  );
}

export default function FilterPanel({ filters, setFilters }) {
  const activeCount = [
    (filters.priceMin || filters.priceMax) ? 1 : 0,
    filters.bedrooms.length,
    filters.bathrooms.length,
    filters.amenities.length,
  ].reduce((a, b) => a + b, 0);

  const toggleBedroom = (val) => {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(val)
        ? prev.bedrooms.filter(v => v !== val)
        : [...prev.bedrooms, val]
    }));
  };

  const toggleBathroom = (val) => {
    setFilters(prev => ({
      ...prev,
      bathrooms: prev.bathrooms.includes(val)
        ? prev.bathrooms.filter(v => v !== val)
        : [...prev.bathrooms, val]
    }));
  };

  const toggleAmenity = (key) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key]
    }));
  };

  const clearAll = () => {
    setFilters({ priceMin: '', priceMax: '', bedrooms: [], bathrooms: [], amenities: [] });
  };

  return (
    <div className="border-t border-line bg-paper/90">
      <div className="px-8 py-3 max-w-[1440px] mx-auto">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Precio — slider dual + inputs editables */}
          <div className="flex items-center gap-3 min-w-[420px]">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">Precio</span>
            <EditablePrice
              value={filters.priceMin || '0'}
              minBound={0}
              maxBound={Number(filters.priceMax) || PRICE_MAX}
              align="right"
              onChange={v => setFilters(prev => ({ ...prev, priceMin: v }))}
            />
            <DualRangeSlider
              min={0}
              max={PRICE_MAX}
              step={STEP}
              valueMin={Number(filters.priceMin || 0)}
              valueMax={Number(filters.priceMax || PRICE_MAX)}
              onChangeMin={v => setFilters(prev => ({ ...prev, priceMin: String(v) }))}
              onChangeMax={v => setFilters(prev => ({ ...prev, priceMax: String(v) }))}
            />
            <EditablePrice
              value={filters.priceMax || String(PRICE_MAX)}
              minBound={Number(filters.priceMin) || 0}
              maxBound={PRICE_MAX}
              align="left"
              onChange={v => setFilters(prev => ({ ...prev, priceMax: v }))}
            />
          </div>

          <div className="w-px h-6 bg-line self-center" />

          {/* Habitaciones */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">Hab.</span>
            {BEDROOM_OPTIONS.map(val => (
              <Chip key={val} selected={filters.bedrooms.includes(val)} onClick={() => toggleBedroom(val)}>
                {val}
              </Chip>
            ))}
          </div>

          <div className="w-px h-6 bg-line self-center" />

          {/* Baños */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">Baños</span>
            {BATHROOM_OPTIONS.map(val => (
              <Chip key={val} selected={filters.bathrooms.includes(val)} onClick={() => toggleBathroom(val)}>
                {val}
              </Chip>
            ))}
          </div>

          <div className="w-px h-6 bg-line self-center" />

          {/* Comodidades */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">Comod.</span>
            {AMENITIES.map(a => (
              <Chip key={a.key} selected={filters.amenities.includes(a.key)} onClick={() => toggleAmenity(a.key)}>
                {a.label}
              </Chip>
            ))}
          </div>

          {/* Limpiar */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-brand-500 hover:text-brand-600 font-medium transition-colors whitespace-nowrap"
            >
              Limpiar ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
