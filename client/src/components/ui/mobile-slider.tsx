/**
 * Mobile Slider Component
 * 
 * A touch-friendly slider component optimized for mobile devices.
 * Shows one item at a time on mobile, multiple on desktop.
 * 
 * Usage:
 * <MobileSlider items={items} renderItem={renderFunction} />
 * 
 * Last updated: January 2025
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOBILE } from '@/constants/mobile';

interface MobileSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showNavigation?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  gap?: string;
}

export function MobileSlider<T>({
  items,
  renderItem,
  className = '',
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  gap = 'gap-4'
}: MobileSliderProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    if (sliderRef.current) {
      setScrollLeft(sliderRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const x = e.touches[0].pageX;
    const walk = (startX - x) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sliderRef.current) return;
    
    setIsDragging(false);
    
    // Determine if we should snap to next/previous item
    const threshold = 50;
    const currentScroll = sliderRef.current.scrollLeft;
    const itemWidth = sliderRef.current.scrollWidth / items.length;
    const newIndex = Math.round(currentScroll / itemWidth);
    
    if (Math.abs(currentScroll - newIndex * itemWidth) > threshold) {
      if (currentScroll > newIndex * itemWidth) {
        setCurrentIndex(Math.min(newIndex + 1, items.length - 1));
      } else {
        setCurrentIndex(Math.max(newIndex - 1, 0));
      }
    } else {
      setCurrentIndex(newIndex);
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // Scroll to current item
  useEffect(() => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.scrollWidth / items.length;
      sliderRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, items.length]);

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Single item view with swipe */}
      <div className="md:hidden">
        <div
          ref={sliderRef}
          className="flex overflow-x-hidden scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full"
              style={{ minWidth: '100%' }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {/* Mobile navigation dots */}
        {items.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex 
                    ? 'bg-orange-500' 
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Grid view */}
      <div className="hidden md:block">
        <div className={`grid ${MOBILE.layout.grid3} ${gap}`}>
          {items.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop navigation arrows */}
      {showNavigation && items.length > 3 && (
        <div className="hidden md:flex justify-between items-center mt-6">
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            aria-label="Previous items"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {items.length}
          </span>
          
          <button
            onClick={goToNext}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            aria-label="Next items"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

// Hook for managing slider state
export function useMobileSlider<T>(items: T[], initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)));
  };

  return {
    currentIndex,
    currentItem: items[currentIndex],
    goToNext,
    goToPrevious,
    goToIndex,
    totalItems: items.length
  };
}
