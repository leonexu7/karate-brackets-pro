import { calculateAge, findAgeDivision, findWeightDivision } from '../constants/categories.js';
import { getKyuInfo, getKyuCategoryInfo, resolveCompetingCategory } from '../constants/belts.js';

/**
 * Clasifica a un atleta determinando su categoría según:
 * - Modalidad (Kata / Kumite)
 * - Edad (calculada con fecha de nacimiento)
 * - Sexo (Rama Varonil / Femenil)
 * - Categoría de Kyu elegida por el entrenador (10-8 Kyu, 7-4 Kyu o 3 Kyu en adelante Libre)
 * - Peso oficial (si aplica >= 14 años en Kumite)
 */
export function classifyAthlete(athlete, tournamentDate, modalityId = 'kumite_ind') {
  const age = calculateAge(athlete.birthDate, tournamentDate);
  const ageDivision = findAgeDivision(age);
  const kyu = getKyuInfo(athlete.beltId);
  const gender = athlete.gender === 'F' ? 'F' : 'M';
  const genderLabel = gender === 'F' ? 'Femenil' : 'Varonil';

  // Categoría de Kyu elegida o natural
  const competingCatId = resolveCompetingCategory(kyu.id, athlete.competingCategory);
  const competingCat = getKyuCategoryInfo(competingCatId);

  // División de peso estricta a partir de 14-15 años en Kumite
  let weightDivision = null;
  if (ageDivision.hasWeightDivisions && modalityId.includes('kumite')) {
    weightDivision = findWeightDivision(ageDivision.id, gender, athlete.weight);
  }

  let categoryKey = `${modalityId}_${ageDivision.id}_${gender}_${competingCat.id}`;
  let categoryName = `${modalityId.includes('kata') ? 'Kata' : 'Kumite'} ${ageDivision.name} ${genderLabel} • ${competingCat.name}`;

  if (weightDivision) {
    categoryKey += `_${weightDivision.id}`;
    categoryName += ` (${weightDivision.name})`;
  }

  return {
    categoryKey,
    categoryName,
    age,
    ageDivision,
    kyu,
    competingCat,
    isPromoted: competingCat.id !== kyu.naturalCategory,
    weightDivision,
    gender,
    genderLabel,
    format: ageDivision.format, // 'cuarteta' o 'bracket_16'
    hasWeightDivisions: ageDivision.hasWeightDivisions,
  };
}

/**
 * Agrupa todos los atletas en sus categorías correspondientes.
 */
export function groupAthletesIntoCategories(athletes, tournamentDate, dojosMap = {}) {
  const categories = {};

  (athletes || []).forEach(athlete => {
    const modalities = athlete.modalities && athlete.modalities.length > 0
      ? athlete.modalities
      : ['kumite_ind'];

    modalities.forEach(modalityId => {
      if (modalityId.includes('team')) return;

      const classification = classifyAthlete(athlete, tournamentDate, modalityId);
      const key = classification.categoryKey;

      if (!categories[key]) {
        categories[key] = {
          key,
          name: classification.categoryName,
          modalityId,
          ageDivision: classification.ageDivision,
          gender: classification.gender,
          competingCat: classification.competingCat,
          weightDivision: classification.weightDivision,
          format: classification.format,
          athletes: [],
        };
      }

      categories[key].athletes.push({
        ...athlete,
        calculatedAge: classification.age,
        kyuName: classification.kyu.name,
        isPromoted: classification.isPromoted,
        dojoName: dojosMap[athlete.dojoId]?.name || athlete.dojoName || 'Independiente',
      });
    });
  });

  // En categorías infantiles (<14 años), ordenar por peso para equilibrio dentro de la cuarteta
  Object.values(categories).forEach(cat => {
    if (!cat.ageDivision.hasWeightDivisions) {
      cat.athletes.sort((a, b) => (Number(a.weight) || 0) - (Number(b.weight) || 0));
    }
  });

  return categories;
}
