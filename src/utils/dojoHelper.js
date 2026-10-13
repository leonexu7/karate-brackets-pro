/**
 * Utilidades para normalización y vinculación inteligente de Dojos
 * Evita duplicados por faltas de ortografía (ej. 'OB - KAI tlacotepec' vs 'ob-kay TLACOTEPEC')
 */

export function normalizeDojoKey(rawName) {
  if (!rawName) return '';
  let str = String(rawName).trim().toLowerCase();

  // 1. Quitar acentos (á -> a, etc.)
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2. Normalizar variantes de 'kai' / 'kay'
  str = str.replace(/\bkay\b/g, 'kai');
  str = str.replace(/\bkaii\b/g, 'kai');

  // 3. Quitar guiones, símbolos, barras y comas
  str = str.replace(/[-_./,\\]/g, ' ');

  // 4. Quitar prefijos genéricos redundantes (Dojo, Escuela, Club, etc.)
  str = str.replace(/^(dojo|escuela|club|gimnasio|academia)\s+/g, '');

  // 5. Normalizar nombres de estilos comunes
  str = str.replace(/\bshito\s+kai\b/g, 'shitokai');
  str = str.replace(/\bshoto\s+kan\b/g, 'shotokan');
  str = str.replace(/\bgoju\s+ryu\b/g, 'gojuryu');
  str = str.replace(/\bwado\s+ryu\b/g, 'wadoryu');

  // 6. Colapsar espacios en blanco
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Busca si un dojo ya existe en la lista comparando tanto el nombre exacto como la clave normalizada
 */
export function findMatchingDojo(existingDojos, dojoName) {
  if (!dojoName || !Array.isArray(existingDojos)) return null;
  const trimmed = dojoName.trim().toLowerCase();
  const targetKey = normalizeDojoKey(dojoName);
  if (!targetKey) return null;

  return existingDojos.find(d => {
    if (!d || !d.name) return false;
    const dTrimmed = d.name.trim().toLowerCase();
    if (dTrimmed === trimmed) return true;
    return normalizeDojoKey(d.name) === targetKey;
  }) || null;
}
