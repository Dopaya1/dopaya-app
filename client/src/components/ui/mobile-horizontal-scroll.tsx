/**
 * Mobile Horizontal Scroll Component
 * 
 * A horizontal scrolling component that shows multiple items on mobile
 * with smooth scrolling and touch support.
 * 
 * Usage:
 * <MobileHorizontalScroll items={items} renderItem={renderFunction} />
 * 
 * Last updated: January 2025
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileHorizontalScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showNavigation?: boolean;
  gap?: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function MobileHorizontalScroll<T>({
  items,
  renderItem,
  className = '',
  showNavigation = true,
  gap = 'gap-4',
  itemsPerView = { mobile: 1.2, tablet: 2.5, desktop: 4 }
}: MobileHorizontalScrollProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const currentScroll = scrollRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex-shrink-0 snap-start ${gap}`}
            style={{
              width: `calc(${100 / itemsPerView.mobile}% - ${gap === 'gap-4' ? '1rem' : gap === 'gap-6' ? '1.5rem' : '0.5rem'})`,
              minWidth: `calc(${100 / itemsPerView.mobile}% - ${gap === 'gap-4' ? '1rem' : gap === 'gap-6' ? '1.5rem' : '0.5rem'})`
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showNavigation && items.length > itemsPerView.mobile && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
}
