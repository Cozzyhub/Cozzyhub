'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Filter out null/undefined images and ensure we have at least one image
  const validImages = images.filter(Boolean);
  
  if (validImages.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No image available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
        <div className="w-full aspect-square bg-gray-50 relative group">
          <img
            src={currentImage}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows (only show if multiple images) */}
          {validImages.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={() => setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={() => setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedIndex + 1} / {validImages.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${selectedIndex === index 
                  ? 'border-purple-600 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-purple-600/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
