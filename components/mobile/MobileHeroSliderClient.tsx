"use client";

import { useState, useEffect } from "react";

interface MobileHeroSliderClientProps {
  slides: string[];
}

export default function MobileHeroSliderClient({ slides }: MobileHeroSliderClientProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
        next();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [index]); // Reset interval on index change to avoid rapid skips if user creates manual events

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  // Swipe Handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next();
    }
    if (isRightSwipe) {
      prev();
    }
  };

  return (
    <div 
      className="md:hidden w-full relative group overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="flex transition-transform duration-500 ease-out h-48"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
            <img
                key={i}
                src={slide}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover shrink-0"
            />
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === i ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
