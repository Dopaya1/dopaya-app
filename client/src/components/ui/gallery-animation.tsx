import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandableGalleryProps {
  images: string[];
  taglines?: string[];
  className?: string;
  onImageClick?: (index: number) => void;
  icons?: React.ReactNode[];
}

const ExpandableGallery: React.FC<ExpandableGalleryProps> = ({ images, taglines = [], className = '', onImageClick, icons = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => {
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const getFlexValue = (index: number) => {
    if (hoveredIndex === null) {
      return 1;
    }
    return hoveredIndex === index ? 2 : 0.5;
  };

  return (
    <div className={className}>
      {/* Desktop: Horizontal Expandable Gallery */}
      <div className="hidden md:flex gap-2 h-96 w-full">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-md"
            style={{ flex: 1 }}
            animate={{ flex: getFlexValue(index) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              if (onImageClick) {
                onImageClick(index);
              } else {
                openImage(index);
              }
            }}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Bottom gradient overlay for readability */}
            <div className="absolute inset-0">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
            {/* Tagline */}
            {taglines[index] && (() => {
              const parts = taglines[index].split(':');
              const title = parts[0] || '';
              const description = parts.slice(1).join(':').trim();
              return (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <motion.div
                    initial={{ opacity: 0.95 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="text-white drop-shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      {icons[index] ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">{icons[index]}</span> : null}
                      <p className="text-sm font-bold leading-tight">
                        {title}
                      </p>
                    </div>
                    {description && description.length > 0 ? (
                      <p className="text-xs font-normal leading-tight mt-1">{description}</p>
                    ) : null}
                  </motion.div>
                </div>
              );
            })()}
          </motion.div>
        ))}
      </div>

      {/* Mobile: 2x2 Grid Layout */}
      <div className="md:hidden grid grid-cols-2 gap-3 w-full">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-md aspect-square"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => {
              if (onImageClick) {
                onImageClick(index);
              } else {
                openImage(index);
              }
            }}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Bottom gradient overlay for readability */}
            <div className="absolute inset-0">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
            {/* Tagline */}
            {taglines[index] && (() => {
              const parts = taglines[index].split(':');
              const title = parts[0] || '';
              const description = parts.slice(1).join(':').trim();
              return (
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <div className="text-white drop-shadow-lg">
                    <div className="flex items-center gap-2">
                      {icons[index] ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">{icons[index]}</span> : null}
                      <p className="text-xs font-bold leading-tight">
                        {title}
                      </p>
                    </div>
                    {description && description.length > 0 ? (
                      <p className="text-[10px] font-normal leading-tight mt-0.5 line-clamp-1">{description}</p>
                    ) : null}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ))}
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {onImageClick ? null : selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 p-4"
            onClick={closeImage}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              onClick={closeImage}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors"
                onClick={goToPrev}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Image */}
            <motion.div
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                src={images[selectedIndex]}
                alt={`Gallery image ${selectedIndex! + 1}`}
                className="w-full h-full object-contain rounded-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors"
                onClick={goToNext}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-white bg-opacity-50 px-4 py-2 rounded-md">
              {selectedIndex! + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpandableGallery;

