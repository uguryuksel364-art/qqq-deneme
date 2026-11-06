import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatioClassName?: string;
  autoPlayInterval?: number; // pass 0 to disable
  onImageClick?: (url: string) => void;
  onEyeClick?: () => void;
  hideArrows?: boolean;
  hideCounter?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt = 'Görsel',
  className = '',
  aspectRatioClassName = 'aspect-video',
  autoPlayInterval = 0,
  onImageClick,
  onEyeClick,
  hideCounter = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch & Swipe tracking
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const hasSwiped = React.useRef(false);

  const handlePrev = React.useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = React.useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    if (!autoPlayInterval || images.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, images.length, handleNext]);

  // Lock body scroll when lightbox is active
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    hasSwiped.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX.current - currentX;
    const diffY = touchStartY.current - currentY;

    // If moving more horizontally than vertically, mark potential swipe
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      hasSwiped.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;
    const minSwipeDistance = 35; // Minimum horizontal pixel delta

    if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped left -> Next image
        handleNext();
      } else {
        // Swiped right -> Previous image
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    // Reset hasSwiped shortly so quick taps are not blocked
    setTimeout(() => {
      hasSwiped.current = false;
    }, 100);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`w-full bg-ink-950 flex items-center justify-center border border-white/5 ${aspectRatioClassName} ${className}`}>
        <span className="text-xs text-foam-400/40">Görsel Yüklenmemiş</span>
      </div>
    );
  }

  // Variants for slide animation
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const handleOpenLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasSwiped.current) return;
    if (onEyeClick) {
      onEyeClick();
      return;
    }
    if (onImageClick) {
      onImageClick(images[currentIndex]);
    } else {
      setIsLightboxOpen(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden group select-none touch-pan-y ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide Area */}
      <div className={`relative w-full overflow-hidden ${aspectRatioClassName}`}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 h-full w-full cursor-pointer"
            onClick={handleOpenLightbox}
          >
            <img
              src={images[currentIndex]}
              alt={`${alt} - ${currentIndex + 1}`}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover select-none pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Center Eye Icon (Clicks to onEyeClick or Lightbox) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onEyeClick) {
                onEyeClick();
              } else {
                handleOpenLightbox(e);
              }
            }}
            aria-label="Filodaki Aracı Gör"
            title="Filodaki Aracı Gör"
            className="pointer-events-auto p-3 rounded-full bg-ink-950/80 backdrop-blur-md text-foam border border-white/15 shadow-xl hover:bg-ink-900 hover:border-teal/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Eye className="w-5 h-5 text-teal" />
          </button>
        </div>
      </div>

      {/* Note: Turquoise arrow buttons were removed as requested to let users swipe naturally with fingers */}

      {images.length > 1 && (
        <>
          {/* Indicators / Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1.5 rounded-full bg-ink-950/60 backdrop-blur-sm border border-white/10 shadow-md">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(idx, e)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-5 bg-teal shadow-[0_0_8px_rgba(79,169,168,0.6)]' : 'w-1.5 bg-foam/40 hover:bg-foam/75'
                }`}
                aria-label={`Slayt ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image Counter (Only if > 1 images and not hidden) */}
      {images.length > 1 && !hideCounter && (
        <span className="absolute top-4 right-4 bg-ink-950/80 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-medium text-foam/80 tracking-wider z-10 shadow">
          {currentIndex + 1} / {images.length}
        </span>
      )}

      {/* --- built-in LIGHTBOX (Fullscreen view) --- */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-ink-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-10 select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute top-4 right-4 p-3 rounded-full bg-ink-900/80 border border-white/10 text-foam hover:text-teal hover:bg-ink-800 hover:scale-105 active:scale-95 transition-all duration-200 z-[10000] shadow-lg"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Lightbox main container with touch swipe support */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Navigation inside Lightbox */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-ink-900/80 border border-white/10 text-foam hover:text-brass hover:bg-ink-800 hover:scale-105 active:scale-95 transition-all duration-200 z-50 shadow-xl"
                  aria-label="Önceki Görsel"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-ink-900/80 border border-white/10 text-foam hover:text-brass hover:bg-ink-800 hover:scale-105 active:scale-95 transition-all duration-200 z-50 shadow-xl"
                  aria-label="Sonraki Görsel"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* High-res Image view */}
            <div className="relative max-w-full max-h-full flex items-center justify-center p-2">
              <img
                src={images[currentIndex]}
                alt={`${alt} - ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl bg-ink-950"
              />

              {/* Overlay captions */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-ink-900/90 backdrop-blur border border-white/5 px-4 py-2 rounded-full text-xs font-light text-foam/90 shadow-lg shrink-0 whitespace-nowrap">
                <span>{alt}</span>
                <span className="text-white/20">|</span>
                <span className="font-mono text-teal">{currentIndex + 1} / {images.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


