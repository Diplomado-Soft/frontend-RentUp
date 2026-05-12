import React, { useEffect } from 'react';

function ImageModal({ images, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onPrev, onNext, onClose]);

  const getImageUrl = (image) => {
    if (typeof image === 'object' && image?.url) {
      return image.url;
    }
    return image || "";
  };

  const imageSrc = getImageUrl(images[currentIndex]);

return (
    <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]"
    onClick={onClose}
    >
    <div
        className="relative max-w-3xl w-full mx-4 bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
    >
        <img
        src={imageSrc}
        alt={`Apartamento ${currentIndex + 1}`}
        className="w-full h-[70vh] object-cover"
        />

        <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 text-2xl font-bold transition"
        >
        &times;
        </button>

        <button
        onClick={onPrev}
        className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 text-3xl transition"
        >
        &#8592;
        </button>
        <button
        onClick={onNext}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 text-3xl transition"
        >
        &#8594;
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
        </div>
    </div>
    </div>
);
}

export default ImageModal;
