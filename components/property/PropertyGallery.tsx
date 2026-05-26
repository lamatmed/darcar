/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  alt: string;
  type?: string;
}

export default function PropertyGallery({ images, alt, type }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // ✅ Changer d'image en cliquant sur l'image
  const handleImageClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Si clic sur la moitié gauche -> image précédente
    if (x < width / 2) {
      handlePrev();
    } 
    // Si clic sur la moitié droite -> image suivante
    else {
      handleNext();
    }
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      handleNext();
    } else if (swipe > 10000) {
      handlePrev();
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[70vh] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  return (
    <div className="relative w-full h-[50vh] sm:h-[70vh] bg-gray-200 dark:bg-gray-800 overflow-hidden group touch-pan-y">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          onClick={handleImageClick}  // ✅ AJOUTÉ : Changer d'image au clic
          className="absolute inset-0 w-full h-full cursor-pointer active:cursor-grabbing"
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover pointer-events-none"
            priority={currentIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Property Type Badge */}
      {type && (
        <div className="absolute bottom-20 left-6 z-20 pointer-events-none">
          <div className="bg-blue-600 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-lg inline-block uppercase tracking-wider">
            {type}
          </div>
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

      {/* Navigation Buttons (toujours là mais optionnels) */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter Badge */}
      {images.length > 1 && (
        <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 z-20 pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* ✅ Indicateurs visuels (optionnel) */}
      {images.length > 1 && (
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 pointer-events-none bg-gradient-to-r from-black/0 to-transparent"></div>
      )}
    </div>
  );
}