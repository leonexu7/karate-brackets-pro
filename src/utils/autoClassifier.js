import { calculateAge, findAgeDivision, findWeightDivision } from '../constants/categories.js';
import { getKyuInfo, getKyuCategoryInfo, resolveCompetingCategory } from '../constants/belts.js';

/**
 * Clasifica a un atleta determinando su categoría según:
 * - Modalidad (Kata / Kumite)
 * - Edad (calculada con fecha de nacimiento)
 * - Sexo (Rama Varonil / Femenil)
 * - Categoría de Kyu elegida por el entrenador (10-8 Kyu, 7-4 Kyu o 3 Kyu en adelante Libre)
 * - Peso oficial (si aplica >= 14 años en Kumite, configurable por administrador)
 */
export function classifyAthlete(athlete, tournamentDate, modalityId = 'kumite_ind', options = {}) {
  const age = calculateAge(athlete.birthDate, tournamentDate);
  const ageDivision = findAgeDivision(age);
  const kyu = getKyuInfo(athlete.beltId);
  const gender = athlete.gender === 'F' ? 'F' : 'M';
  const genderLabel = gender === 'F' ? 'Femenil' : 'Varonil';

  // Categoría de Kyu elegida o natural
  const competingCatId = resolveCompetingCategory(kyu.id, athlete.competingCategory);
  const competingCat = getKyuCategoryInfo(competingCatId);

  // División de peso en Kumite para mayores (>= 14 años), sujeta a configuración del administrador
  const divideAdultsByWeight = options.divideAdultsByWeight ?? false;
  let weightDivision = null;
  if (ageDivision.hasWeightDivisions && modalityId.includes('kumite') && divideAdultsByWeight) {
    weightDivision = findWeightDivision(ageDivision.id, gender, athlete.weight);
  }

  let categoryKey = `${modalityId}_${ageDivision.id}_${gender}_${competingCat.id}`;
  let categoryName = `${modalityId.includes('kata') ? 'Kata' : 'Kumite'} ${ageDivision.name} ${genderLabel} • ${competingCat.name}`;

  if (weightDivision) {
    categoryKey += `_${weightDivision.id}`;
    categoryName += ` (${weightDivision.name})`;
  } else if (ageDivision.hasWeightDivisions && modalityId.includes('kumite') && !divideAdultsByWeight) {
    // Modo Open / Libre de peso para torneos chicos (evita atletas solos en pesos desiertos)
    categoryKey += `_open`;
    categoryName += ` (Libre de Peso / Open)`;
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
 * Admite opciones de torneo:
 * - divideAdultsByWeight: Si es falso, agrupa a los mayores de 14 años en Open Kumite sin fragmentar en 5 pesos vacíos.
 * - allowMixedInfant: Si es true (por defecto), en categorías de 6-7 años (o -5) que tengan menos de 4 atletas en varonil o femenil,
 *   las fusiona en '6-7 Años Mixto' para que no queden huecos y se complete la cuarteta.
 */
export function groupAthletesIntoCategories(athletes, tournamentDate, dojosMap = {}, options = {}) {
  const categories = {};
  const allowMixedInfant = options.allowMixedInfant ?? true;

  (athletes || []).forEach(athlete => {
    const modalities = athlete.modalities && athlete.modalities.length > 0
      ? athlete.modalities
      : ['kumite_ind'];

    modalities.forEach(modalityId => {
      if (modalityId.includes('team')) return;

      const classification = classifyAthlete(athlete, tournamentDate, modalityId, options);
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

  // Fusión inteligente de categorías infantiles (6-7 años y -5 años) a 'Mixto' si alguna rama tiene menos de 4 atletas
  if (allowMixedInfant) {
    const targetDivisions = ['u5', '6-7'];
    const keys = Object.keys(categories);

    targetDivisions.forEach(divId => {
      // Buscar pares M y F con misma modalidad y competingCat
      keys.forEach(keyM => {
        const catM = categories[keyM];
        if (!catM || catM.ageDivision?.id !== divId || catM.gender !== 'M') return;

        // Buscar contraparte F
        const keyF = keys.find(k => {
          const catF = categories[k];
          return catF &&
            catF.ageDivision?.id === divId &&
            catF.gender === 'F' &&
            catF.modalityId === catM.modalityId &&
            catF.competingCat?.id === catM.competingCat?.id;
        });

        if (keyF) {
          const catF = categories[keyF];
          const countM = catM.athletes.length;
          const countF = catF.athletes.length;

          // Si una o ambas ramas tienen menos de 4 atletas y entre ambas juntan al menos 2
          if ((countM < 4 || countF < 4) && (countM + countF >= 2)) {
            const mixedKey = `${catM.modalityId}_${divId}_MIXTO_${catM.competingCat.id}`;
            const mixedName = `${catM.modalityId.includes('kata') ? 'Kata' : 'Kumite'} ${catM.ageDivision.name} Mixto • ${catM.competingCat.name}`;

            categories[mixedKey] = {
              key: mixedKey,
              name: mixedName,
              modalityId: catM.modalityId,
              ageDivision: catM.ageDivision,
              gender: 'MIXTO',
              competingCat: catM.competingCat,
              weightDivision: null,
              format: 'cuarteta',
              athletes: [...catM.athletes, ...catF.athletes],
            };

            delete categories[keyM];
            delete categories[keyF];
          }
        }
      });
    });
  }

  // En categorías infantiles (<14 años y cuartetas), ordenar primeramente por ESTATURA ascendente
  // y secundariamente por PESO para lograr cuartetas perfectamente equilibradas
  Object.values(categories).forEach(cat => {
    if (!cat.ageDivision.hasWeightDivisions || cat.format === 'cuarteta') {
      cat.athletes.sort((a, b) => {
        const hA = parseFloat(a.height) || 0;
        const hB = parseFloat(b.height) || 0;
        if (hA > 0 && hB > 0 && hA !== hB) {
          return hA - hB;
        }
        return (parseFloat(a.weight) || 0) - (parseFloat(b.weight) || 0);
      });
    }
  });

  return categories;
}
