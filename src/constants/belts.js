/**
 * Sistema Oficial de KYUS y Divisiones Técnicas de Karate Do
 * 
 * Reglas solicitadas por el usuario:
 * 1. Categoría 1: 10º a 8º Kyu
 * 2. Categoría 2: 7º a 4º Kyu
 * 3. Categoría 3: 3º Kyu en adelante (Libre)
 * 4. Sin colores de cinta (evita confusiones entre dojos).
 * 5. Flexibilidad deportiva: El entrenador puede inscribir a su alumno en una categoría
 *    superior (ej. un 8º Kyu en 7º-4º Kyu o Libre), pero NUNCA en una inferior (un 3º Kyu no puede competir en 10º-8º Kyu).
 */

export const KYU_CATEGORIES = [
  {
    id: 'cat_10_8',
    name: '10º a 8º Kyu',
    shortName: '10º-8º Kyu',
    rank: 1, // Nivel menor
    description: 'Categoría para principiantes y novatos (10º, 9º y 8º Kyu)',
  },
  {
    id: 'cat_7_4',
    name: '7º a 4º Kyu',
    shortName: '7º-4º Kyu',
    rank: 2, // Nivel intermedio
    description: 'Categoría para intermedios (7º, 6º, 5º y 4º Kyu)',
  },
  {
    id: 'cat_3_plus',
    name: '3º Kyu en adelante (Libre)',
    shortName: '3º Kyu+ Libre',
    rank: 3, // Nivel máximo / Libre
    description: 'Categoría abierta para avanzados (3º, 2º, 1º Kyu y Cintas Negras)',
  },
];

export const KYUS = [
  { id: '10_kyu', name: '10º Kyu', naturalCategory: 'cat_10_8', rank: 1 },
  { id: '9_kyu', name: '9º Kyu', naturalCategory: 'cat_10_8', rank: 1 },
  { id: '8_kyu', name: '8º Kyu', naturalCategory: 'cat_10_8', rank: 1 },
  { id: '7_kyu', name: '7º Kyu', naturalCategory: 'cat_7_4', rank: 2 },
  { id: '6_kyu', name: '6º Kyu', naturalCategory: 'cat_7_4', rank: 2 },
  { id: '5_kyu', name: '5º Kyu', naturalCategory: 'cat_7_4', rank: 2 },
  { id: '4_kyu', name: '4º Kyu', naturalCategory: 'cat_7_4', rank: 2 },
  { id: '3_kyu', name: '3º Kyu', naturalCategory: 'cat_3_plus', rank: 3 },
  { id: '2_kyu', name: '2º Kyu', naturalCategory: 'cat_3_plus', rank: 3 },
  { id: '1_kyu', name: '1º Kyu', naturalCategory: 'cat_3_plus', rank: 3 },
  { id: 'cinta_negra', name: 'Cinta Negra (Dan)', naturalCategory: 'cat_3_plus', rank: 3 },
];

export const BELTS = KYUS; // Alias

export function getKyuInfo(kyuId) {
  if (!kyuId) return KYUS[0];
  const normalized = String(kyuId).toLowerCase().trim();

  const exact = KYUS.find(k => k.id.toLowerCase() === normalized);
  if (exact) return exact;

  if (normalized.includes('10')) return KYUS[0];
  if (normalized.includes('9')) return KYUS[1];
  if (normalized.includes('8') || normalized.includes('amarill')) return KYUS[2];
  if (normalized.includes('7') || normalized.includes('naranj')) return KYUS[3];
  if (normalized.includes('6') || normalized.includes('verd')) return KYUS[4];
  if (normalized.includes('5') || normalized.includes('azul')) return KYUS[5];
  if (normalized.includes('4') || normalized.includes('morad')) return KYUS[6];
  if (normalized.includes('3')) return KYUS[7];
  if (normalized.includes('2')) return KYUS[8];
  if (normalized.includes('1') && !normalized.includes('dan')) return KYUS[9];
  if (normalized.includes('negr') || normalized.includes('dan') || normalized.includes('cafe') || normalized.includes('marron')) return KYUS[10];

  return KYUS[0];
}

export function getKyuCategoryInfo(catId) {
  return KYU_CATEGORIES.find(c => c.id === catId) || KYU_CATEGORIES[0];
}

/**
 * Valida si un atleta con cierto Kyu puede inscribirse en una categoría determinada.
 * REGLA: Puede inscribirse en su categoría o en una SUPERIOR, pero NUNCA en una INFERIOR.
 */
export function canCompeteInCategory(kyuId, targetCategoryId) {
  const kyu = getKyuInfo(kyuId);
  const targetCategory = getKyuCategoryInfo(targetCategoryId);
  const naturalCategory = getKyuCategoryInfo(kyu.naturalCategory);

  // Permitido si la categoría objetivo tiene un rank mayor o igual al rank natural del atleta
  return targetCategory.rank >= naturalCategory.rank;
}

/**
 * Devuelve la categoría de competencia definitiva:
 * Si el entrenador especificó una válida, la usa; si no, usa la natural del Kyu.
 */
export function resolveCompetingCategory(kyuId, specifiedCategoryId = null) {
  const kyu = getKyuInfo(kyuId);
  if (specifiedCategoryId && canCompeteInCategory(kyuId, specifiedCategoryId)) {
    return specifiedCategoryId;
  }
  return kyu.naturalCategory;
}

export function getBeltInfo(kyuId) {
  return getKyuInfo(kyuId);
}
