import React from 'react';

// Siluetas vectoriales de Karate estilizadas, sobrias y en formato SVG puro
export const KarateKickSilhouette = ({ className = "w-16 h-16 text-tatami-400 opacity-20", ...props }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props}>
    {/* Silueta de patada alta (Yoko Geri / Mawashi Geri) en Karate Do */}
    <path d="M42 22 c-4 0 -7 -3 -7 -7 s3 -7 7 -7 s7 3 7 7 s-3 7 -7 7 z M38 24 c-2 2 -4 6 -4 10 l0 14 l-6 16 l-8 22 l6 2 l8 -20 l6 -14 l4 8 l0 26 l6 0 l0 -30 l-4 -14 l6 -10 l16 -4 l24 -8 l-3 -6 l-20 6 l-14 2 l-5 -12 z M34 26 l-12 12 l4 4 l10 -10 z" />
  </svg>
);

export const KarateKamaeSilhouette = ({ className = "w-16 h-16 text-tatami-400 opacity-20", ...props }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props}>
    {/* Silueta postura guardia Zenkutsu Dachi / Kamae */}
    <path d="M48 20 c-4 0 -7 -3 -7 -7 s3 -7 7 -7 s7 3 7 7 s-3 7 -7 7 z M44 22 c-4 3 -6 8 -6 13 l-12 6 l2 5 l10 -4 l2 12 l-12 24 l6 4 l10 -20 l8 10 l4 20 l7 -2 l-5 -22 l-6 -10 l4 -16 l14 4 l2 -6 l-16 -5 l-3 -7 z" />
  </svg>
);

export const KarateKataSilhouette = ({ className = "w-16 h-16 text-tatami-400 opacity-20", ...props }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props}>
    {/* Silueta Kiba Dachi / Golpe de Puño Choku Tsuki */}
    <path d="M50 20 c-4 0 -7 -3 -7 -7 s3 -7 7 -7 s7 3 7 7 s-3 7 -7 7 z M46 23 c-3 2 -5 6 -5 11 l-14 2 l0 6 l14 -2 l2 10 l-16 18 l5 5 l14 -14 l4 10 l-10 22 l6 2 l10 -20 l6 0 l10 20 l6 -2 l-10 -22 l4 -10 l14 14 l5 -5 l-16 -18 l2 -10 l20 -2 l0 -6 l-20 2 l-4 -9 z" />
  </svg>
);

export const KarateBeltIcon = ({ colorClass = "bg-tatami-800", className = "w-4 h-4 rounded-full" }) => (
  <span className={`inline-block border border-tatami-300 shadow-xs ${colorClass} ${className}`} />
);
