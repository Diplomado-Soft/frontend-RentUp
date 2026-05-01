import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faFileContract, faStar, faCheckCircle, faTimesCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function History() {
  const [contracts, setContracts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const [contractsRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/contracts/my-contracts`, {
          headers: { Authorization: `Bearer ${userData.token}` }
        }),
        fetch(`${API_URL}/reviews/user/my-reviews`, {
          headers: { Authorization: `Bearer ${userData.token}` }
        })
      ]);

      const contractsData = await contractsRes.json();
      const reviewsData = await reviewsRes.json();

      if (contractsData.success) setContracts(contractsData.contracts || []);
      if (reviewsData.success) setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'finished': return <FontAwesomeIcon icon={faTimesCircle} className="text-slate-400" />;
      case 'pending': return <FontAwesomeIcon icon={faClock} className="text-amber-500" />;
      default: return <FontAwesomeIcon icon={faClock} className="text-slate-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'finished': return 'Finalizado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const allActivities = [
    ...contracts.map(c => ({
      type: 'contract',
      id: c.id_contract,
      title: c.title || `Contrato #${c.id_contract}`,
      date: c.created_at,
      status: c.status,
      property: c.property_title
    })),
    ...reviews.map(r => ({
      type: 'review',
      id: r.review_id,
      title: `Reseña: ${r.property_title || 'Propiedad'}`,
      date: r.created_at,
      rating: r.rating
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faHistory} className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Historial</h2>
          <p className="text-sm text-surface-500">Tu actividad reciente</p>
        </div>
      </div>

      {allActivities.length === 0 ? (
        <div className="text-center py-8 text-surface-400">
          <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
          <p>No hay actividad registrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allActivities.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-surface-50 p-4 rounded-xl border border-surface-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
                {item.type === 'contract' ? (
                  <FontAwesomeIcon icon={faFileContract} className="text-primary-600" />
                ) : (
                  <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-800">{item.title}</p>
                {item.property && (
                  <p className="text-xs text-surface-500">{item.property}</p>
                )}
                <p className="text-xs text-surface-400">
                  {new Date(item.date).toLocaleDateString("es-CO")}
                </p>
              </div>
              {item.type === 'contract' ? (
                <span className="text-xs px-2 py-1 rounded-full bg-surface-100 flex items-center gap-1">
                  {getStatusIcon(item.status)}
                  {getStatusText(item.status)}
                </span>
              ) : (
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <FontAwesomeIcon
                      key={i}
                      icon={i <= item.rating ? faStar : faStarRegular}
                      className={`text-xs ${i <= item.rating ? "text-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
