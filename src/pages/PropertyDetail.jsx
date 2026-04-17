import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewsSection from '../components/ReviewsSection';
import { FaMapMarkerAlt, FaBed, FaBath, FaDollarSign } from 'react-icons/fa';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - reemplazar con real API /api/properties/${id}
    const mockProperty = {
      id: parseInt(id),
      title: `Apartamento moderno cerca de Uniputumayo #${id}`,
      price: 1200,
      rooms: 2,
      bathrooms: 1,
      area: 65,
      images: ['/apartmentLogo.png', '/instituteLogo.png'],
      description: 'Hermoso apartamento completamente amoblado con vista a la ciudad...',
      location: 'Pasto, Nariño',
      landlord: 'Juan Pérez',
      phone: '+57 310 123 4567'
    };
    
    setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Cargando detalle del inmueble...</div>
    </div>;
  }

  if (!property) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-red-500">Inmueble no encontrado</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="h-96 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-xl">
            <FaMapMarkerAlt />
            <span>{property.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Info principal */}
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <FaDollarSign className="mx-auto text-3xl text-green-600 mb-2" />
                <div className="text-2xl font-bold">${property.price}</div>
                <div className="text-sm text-gray-500">Mensual</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <FaBed className="mx-auto text-3xl text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{property.rooms}</div>
                <div className="text-sm text-gray-500">Habitaciones</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <FaBath className="mx-auto text-3xl text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{property.bathrooms}</div>
                <div className="text-sm text-gray-500">Baños</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <div className="space-y-3">
                <p><strong>Arrendador:</strong> {property.landlord}</p>
                <p><strong>Teléfono:</strong> {property.phone}</p>
              </div>
              <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all">
                Contactar ahora
              </button>
            </div>
          </div>

          {/* Reseñas */}
          <div>
            <ReviewsSection inmueble_id={property.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
