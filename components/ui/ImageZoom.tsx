"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
}

export default function ImageZoom({
  src,
  alt,
  className = "",
  zoomScale = 2.5,
}: ImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZooming) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
    setShowHint(false);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    setIsZooming(true);
    setShowHint(false);

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleTouchEnd = () => {
    setIsZooming(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Hint Badge */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 pointer-events-none"
          >
            <ZoomIn size={14} />
            <span>Hover to zoom</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Indicator */}
      {isZooming && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
          {zoomScale}x
        </div>
      )}

      {/* Image Container */}
      <div
        ref={imageRef}
        className={`relative w-full h-full cursor-crosshair ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Original Image */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover select-none"
          draggable={false}
        />

        {/* Zoomed Overlay */}
        {isZooming && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-150"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomScale * 100}%`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      {/* Desktop: Full Image Zoom Panel */}
      {isZooming && (
        <div className="hidden lg:block absolute left-full top-0 ml-4 w-96 h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 pointer-events-none transition-all duration-200">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomScale * 100}%`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
            Zoomed View
          </div>
        </div>
      )}
    </div>
  );
}
