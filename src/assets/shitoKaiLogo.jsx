import React from 'react';
import shitokaiLogoImg from './shitokai_logo.png';

/**
 * Escudo Oficial Shito-Kai Karate-Do México
 * Utiliza la imagen oficial enviada por el usuario (escudo rojo circular Mon de la familia Mabuni).
 */
export const ShitoKaiLogo = ({ className = "w-9 h-9", alt = "Escudo Oficial Shito-Kai", ...props }) => (
  <img
    src={shitokaiLogoImg}
    alt={alt}
    className={`shrink-0 object-contain rounded-full ${className}`}
    loading="eager"
    {...props}
  />
);
