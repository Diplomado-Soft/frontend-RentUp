import React from 'react';
import { FaStar } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReviewItem = ({ review }) => {
  const stars = Array(5).fill(0).map((_, i) => (
    <FaStar 
      key={i}
      className={i < review.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
      size={16}
    />
  ));

  return (
    <div className="review-item border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {review.tenant_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{review.tenant_name}</h4>
            <div className="flex items-center gap-1 mb-1">
              {stars}
              <span className="text-xs text-gray-500">({review.stars})</span>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(review.date), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
};

export default ReviewItem;
