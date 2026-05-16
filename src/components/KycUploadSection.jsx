import React, { useState } from 'react';
import { FaShieldAlt, FaIdCard, FaFileAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaTrash } from 'react-icons/fa';

function KycUploadSection({ kycFiles, setKycFiles }) {
  const [dragOverId, setDragOverId] = useState(null);

  const handleFileSelect = (field, file) => {
    setKycFiles(prev => ({ ...prev, [field]: file }));
  };

  const removeFile = (field) => {
    setKycFiles(prev => ({ ...prev, [field]: null }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const allUploaded = kycFiles?.id_document && kycFiles?.property_certificate;

  const cards = [
    {
      key: 'id_document',
      icon: FaIdCard,
      title: 'Documento de Identidad',
      subtitle: 'Cédula — Imagen o PDF',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
      description: 'Sube una foto legible de tu cédula de identidad'
    },
    {
      key: 'property_certificate',
      icon: FaFileAlt,
      title: 'Certificado de Tradición',
      subtitle: 'Tradición y Libertad — Imagen o PDF',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
      description: 'Sube el certificado de tradición y libertad de la propiedad'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-ambient-lg border border-gray-100 p-6 my-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5849E4] to-[#6C5CE7] flex items-center justify-center flex-shrink-0 shadow-sm">
          <FaShieldAlt className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#0B1C30] flex items-center gap-2">
            Verificación de Propiedad e Identidad Asegurada
          </h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Para la seguridad de toda la comunidad de RentUp en Mocoa, necesitamos validar tu identidad y propiedad.
            Esto asegura la veracidad de tu listado.
          </p>
        </div>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(({ key, icon: Icon, title, subtitle, accept, description }) => {
          const file = kycFiles?.[key];
          const isDragOver = dragOverId === key;

          return (
            <div
              key={key}
              className={`relative rounded-xl border-2 transition-all ${
                file
                  ? 'border-green-300 bg-green-50/30'
                  : isDragOver
                    ? 'border-[#5849E4] bg-[#5849E4]/5'
                    : 'border-gray-200 bg-gray-50/50 hover:border-[#5849E4]/30 hover:bg-[#5849E4]/[0.02]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(key); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => { e.preventDefault(); setDragOverId(null); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(key, f); }}
            >
              <input
                type="file"
                accept={accept}
                onChange={(e) => handleFileSelect(key, e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="p-4 flex flex-col items-center text-center min-h-[140px] justify-center">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                  file ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {file ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-[#0B1C30] mb-0.5">{title}</h4>
                <p className="text-xs text-gray-400 mb-2">{subtitle}</p>

                {/* File selected state */}
                {file ? (
                  <div className="w-full mt-1">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
                      <FaFileAlt className="text-green-600 text-xs flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(key); }}
                        className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 z-20 transition"
                      >
                        <FaTrash className="text-[10px] text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400">{description}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5849E4]/10 text-[#5849E4] text-xs font-semibold hover:bg-[#5849E4]/20 transition cursor-pointer z-20">
                      <FaUpload className="text-[10px]" />
                      Seleccionar Archivo
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${kycFiles?.id_document ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={kycFiles?.id_document ? 'text-green-700 font-medium' : 'text-gray-400'}>
            {kycFiles?.id_document ? 'Cédula seleccionada' : 'Falta cédula'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${kycFiles?.property_certificate ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={kycFiles?.property_certificate ? 'text-green-700 font-medium' : 'text-gray-400'}>
            {kycFiles?.property_certificate ? 'Certificado seleccionado' : 'Falta certificado'}
          </span>
        </div>
      </div>

      {/* All ready message */}
      {allUploaded && (
        <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <FaCheckCircle className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            ¡Documentos cargados y listos para revisión!
          </p>
        </div>
      )}
    </div>
  );
}

export default KycUploadSection;
