import React from 'react';

/**
 * Ilustración estética y claramente visible de Cerezo Japonés (Sakura) en flor
 * Diseñado con flores rosadas definidas, ramas elegantes y pétalos flotantes.
 */
export const CherryBlossomTree = ({ className = "w-44 h-32", ...props }) => (
  <svg
    viewBox="0 0 240 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none drop-shadow-sm ${className}`}
    {...props}
  >
    {/* Rama principal de madera oscura elegante */}
    <path
      d="M240 15 C190 25 150 50 110 55 C70 60 35 90 5 115"
      stroke="#573318"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M150 50 C130 30 100 20 85 10"
      stroke="#573318"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M110 55 C100 80 80 105 60 120"
      stroke="#573318"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M175 32 C185 55 200 75 220 90"
      stroke="#573318"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M75 95 C65 115 50 135 30 145"
      stroke="#573318"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* FLORES DE SAKURA (Pétalos rosados vivos con centro carmesí suave) */}
    {/* Grupo 1 (Superior izquierda) */}
    <g transform="translate(85, 12)">
      <circle cx="-7" cy="-4" r="6" fill="#FBCFE8" />
      <circle cx="7" cy="-4" r="6" fill="#FBCFE8" />
      <circle cx="-5" cy="6" r="6" fill="#FBCFE8" />
      <circle cx="5" cy="6" r="6" fill="#FBCFE8" />
      <circle cx="0" cy="-7" r="6" fill="#F472B6" />
      <circle cx="0" cy="0" r="3" fill="#E11D48" />
      <circle cx="0" cy="0" r="1.5" fill="#FEF08A" />
    </g>

    {/* Grupo 2 (Centro) */}
    <g transform="translate(130, 42)">
      <circle cx="-8" cy="-5" r="7" fill="#FCE7F3" />
      <circle cx="8" cy="-5" r="7" fill="#FCE7F3" />
      <circle cx="-6" cy="7" r="7" fill="#FBCFE8" />
      <circle cx="6" cy="7" r="7" fill="#FBCFE8" />
      <circle cx="0" cy="-8" r="7" fill="#F472B6" />
      <circle cx="0" cy="0" r="3.5" fill="#E11D48" />
      <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
    </g>

    {/* Grupo 3 (Rama derecha) */}
    <g transform="translate(195, 65)">
      <circle cx="-6" cy="-4" r="6" fill="#FBCFE8" />
      <circle cx="6" cy="-4" r="6" fill="#FBCFE8" />
      <circle cx="-4" cy="5" r="6" fill="#FBCFE8" />
      <circle cx="4" cy="5" r="6" fill="#FBCFE8" />
      <circle cx="0" cy="-6" r="6" fill="#FB7185" />
      <circle cx="0" cy="0" r="2.8" fill="#E11D48" />
      <circle cx="0" cy="0" r="1.2" fill="#FEF08A" />
    </g>

    {/* Grupo 4 (Rama inferior) */}
    <g transform="translate(55, 110)">
      <circle cx="-7" cy="-5" r="6.5" fill="#FCE7F3" />
      <circle cx="7" cy="-5" r="6.5" fill="#FCE7F3" />
      <circle cx="-5" cy="6" r="6.5" fill="#FBCFE8" />
      <circle cx="5" cy="6" r="6.5" fill="#FBCFE8" />
      <circle cx="0" cy="-7" r="6.5" fill="#F472B6" />
      <circle cx="0" cy="0" r="3" fill="#E11D48" />
      <circle cx="0" cy="0" r="1.5" fill="#FEF08A" />
    </g>

    {/* Grupo 5 (Capullo extremo izquierdo) */}
    <g transform="translate(20, 130)">
      <circle cx="-4" cy="-3" r="5" fill="#FBCFE8" />
      <circle cx="4" cy="-3" r="5" fill="#FBCFE8" />
      <circle cx="0" cy="4" r="5" fill="#F472B6" />
      <circle cx="0" cy="0" r="2" fill="#E11D48" />
    </g>

    {/* Flor suelta adicional */}
    <g transform="translate(160, 22)">
      <circle cx="-5" cy="-3" r="4.5" fill="#FCE7F3" />
      <circle cx="5" cy="-3" r="4.5" fill="#FBCFE8" />
      <circle cx="0" cy="4" r="4.5" fill="#F472B6" />
      <circle cx="0" cy="0" r="1.8" fill="#E11D48" />
    </g>

    {/* PÉTALOS FLOTANTES AL VIENTO (Efecto Sakura) */}
    <path d="M70 40 C74 35 80 38 78 43 C76 48 70 46 70 40 Z" fill="#F472B6" opacity="0.9" />
    <path d="M100 75 C104 70 110 73 108 78 C106 83 100 81 100 75 Z" fill="#FB7185" opacity="0.95" />
    <path d="M40 70 C44 65 50 68 48 73 C46 78 40 76 40 70 Z" fill="#FBCFE8" opacity="0.85" />
    <path d="M140 105 C144 100 150 103 148 108 C146 113 140 111 140 105 Z" fill="#F472B6" opacity="0.85" />
    <path d="M25 155 C29 150 35 153 33 158 C31 163 25 161 25 155 Z" fill="#FB7185" opacity="0.9" />
    <path d="M180 120 C184 115 190 118 188 123 C186 128 180 126 180 120 Z" fill="#FBCFE8" opacity="0.85" />
  </svg>
);

// Alias para compatibilidad
export const CherryBlossomBranch = CherryBlossomTree;

export const SakuraBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-medium shadow-2xs">
    🌸 <span className="font-semibold">Shito-Kai</span>
  </span>
);
