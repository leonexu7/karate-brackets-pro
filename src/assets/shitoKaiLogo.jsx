import React from 'react';
import shitokaiLogoImg from './shitokai_logo.png';

/**
 * Escudo Oficial Shito-Kai Karate-Do México o Logotipo Personalizado del Torneo
 * Si se pasa `src` (ej. customLogo del torneo), muestra esa imagen; de lo contrario, muestra el escudo oficial Shito-Kai.
 */
export const ShitoKaiLogo = ({ src, className = "w-9 h-9", alt = "Logotipo Oficial", ...props }) => (
  <img
    src={src || shitokaiLogoImg}
    alt={alt}
    className={`shrink-0 object-contain rounded-full ${className}`}
    loading="eager"
    {...props}
  />
);
