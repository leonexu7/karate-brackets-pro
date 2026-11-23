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
    weightDivision = findWeightDivision(ageDivision.id, gender, athlete.weight, options.weightDivisions);
  }

  let categoryKey = `${modalityId}_${ageDivision.id}_${gender}_${competingCat.id}`;
  let categoryName = `${modalityId.includes('kata') ? 'Kata' : 'Kumite'} ${ageDivision.name} ${genderLabel} • ${competingCat.name}`;

  if (weightDivision) {
    const sanitizedId = weightDivision.id || weightDivision.name.replace(/[^a-zA-Z0-9]/g, '_');
    categoryKey += `_${sanitizedId}`;
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
 * - groupByModalityProfile: Si es true (por defecto), agrupa a los competidores por su perfil de participación:
 *   1) Doble Modalidad (Kata y Kumite): compiten juntos en ambas llaves en el mismo tatami sin retrasos.
 *   2) Solo Kumite: tienen sus propias gráficas exclusivas de combate.
 *   3) Solo Kata: tienen sus propias gráficas exclusivas de formas.
 *   4) Casos extremos (1 competidor huérfano): se integra a la gráfica correspondiente de Doble Modalidad para no quedarse sin competir.
 */
export function groupAthletesIntoCategories(athletes, tournamentDate, dojosMap = {}, options = {}) {
  const allowMixedInfant = options.allowMixedInfant ?? true;
  const groupByModalityProfile = options.groupByModalityProfile ?? true;
  const divideAdultsByWeight = options.divideAdultsByWeight ?? false;
  const categories = {};

  if (!groupByModalityProfile) {
    // Modo tradicional: cada atleta se replica directamente en cada modalidad que marcó
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
            modalityProfile: modalityId.includes('kata') ? 'solo_kata' : 'solo_kumite',
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
  } else {
    // Modo Inteligente para Agilizar Áreas de Tatami:
    // Agrupa primero por cohorte base (Edad + Sexo + Kyu [+ Peso en mayores])
    // y dentro clasifica por perfil: Doble Modalidad, Solo Kumite y Solo Kata.
    const cohorts = {};

    (athletes || []).forEach(athlete => {
      const age = calculateAge(athlete.birthDate, tournamentDate);
      const ageDivision = findAgeDivision(age);
      const kyu = getKyuInfo(athlete.beltId);
      const gender = athlete.gender === 'F' ? 'F' : 'M';
      const genderLabel = gender === 'F' ? 'Femenil' : 'Varonil';

      const competingCatId = resolveCompetingCategory(kyu.id, athlete.competingCategory);
      const competingCat = getKyuCategoryInfo(competingCatId);

      // Peso en kumite mayores (>= 14 años) si la opción está activada
      let weightDivision = null;
      if (ageDivision.hasWeightDivisions && divideAdultsByWeight) {
        weightDivision = findWeightDivision(ageDivision.id, gender, athlete.weight, options.weightDivisions);
      }

      let cohortKey = `${ageDivision.id}_${gender}_${competingCat.id}`;
      let weightLabel = '';
      if (weightDivision) {
        const sanitizedId = weightDivision.id || weightDivision.name.replace(/[^a-zA-Z0-9]/g, '_');
        cohortKey += `_${sanitizedId}`;
        weightLabel = ` (${weightDivision.name})`;
      } else if (ageDivision.hasWeightDivisions && !divideAdultsByWeight) {
        cohortKey += `_open`;
        weightLabel = ` (Libre de Peso / Open)`;
      }

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = {
          key: cohortKey,
          ageDivision,
          gender,
          genderLabel,
          competingCat,
          weightDivision,
          weightLabel,
          format: ageDivision.format,
          both: [],
          kumiteOnly: [],
          kataOnly: [],
        };
      }

      const mods = (athlete.modalities && athlete.modalities.length > 0) ? athlete.modalities : ['kumite_ind'];
      const hasKata = mods.some(m => m.includes('kata') && !m.includes('team'));
      const hasKumite = mods.some(m => m.includes('kumite') && !m.includes('team'));

      const preparedAthlete = {
        ...athlete,
        calculatedAge: age,
        kyuName: kyu.name,
        isPromoted: competingCat.id !== kyu.naturalCategory,
        dojoName: dojosMap[athlete.dojoId]?.name || athlete.dojoName || 'Independiente',
      };

      if (hasKata && hasKumite) {
        cohorts[cohortKey].both.push(preparedAthlete);
      } else if (hasKumite) {
        cohorts[cohortKey].kumiteOnly.push(preparedAthlete);
      } else if (hasKata) {
        cohorts[cohortKey].kataOnly.push(preparedAthlete);
      } else {
        // Por defecto si no seleccionó modalidad
        cohorts[cohortKey].kumiteOnly.push(preparedAthlete);
      }
    });

    // Procesar cada cohorte y resolver casos extremos
    Object.values(cohorts).forEach(c => {
      let bothKataAthletes = [...c.both];
      let bothKumiteAthletes = [...c.both];
      let kumiteOnlyAthletes = [...c.kumiteOnly];
      let kataOnlyAthletes = [...c.kataOnly];

      // Caso extremo: Si en Solo Kumite hay solo 1 atleta huérfano y hay competidores en Doble Modalidad,
      // se integra a la gráfica de Kumite de Doble Modalidad para que no se quede sin pelear.
      if (kumiteOnlyAthletes.length === 1 && c.both.length > 0) {
        bothKumiteAthletes.push({
          ...kumiteOnlyAthletes[0],
          isSoloKumite: true,
        });
        kumiteOnlyAthletes = [];
      }

      // Caso extremo: Si en Solo Kata hay solo 1 atleta huérfano y hay competidores en Doble Modalidad,
      // se integra a la gráfica de Kata de Doble Modalidad para que no se quede sin competir.
      if (kataOnlyAthletes.length === 1 && c.both.length > 0) {
        bothKataAthletes.push({
          ...kataOnlyAthletes[0],
          isSoloKata: true,
        });
        kataOnlyAthletes = [];
      }

      // 1. Gráficas de Doble Modalidad (Kata y Kumite en el mismo Tatami)
      if (bothKataAthletes.length > 0 || bothKumiteAthletes.length > 0) {
        const pairKey = `pair_${c.key}`;

        if (bothKataAthletes.length > 0) {
          const kataKey = `kata_ind_${c.key}_doble`;
          categories[kataKey] = {
            key: kataKey,
            pairKey,
            modalityProfile: 'doble',
            name: `Kata ${c.ageDivision.name} ${c.genderLabel} • ${c.competingCat.name}${c.weightLabel} (Doble Modalidad)`,
            modalityId: 'kata_ind',
            ageDivision: c.ageDivision,
            gender: c.gender,
            competingCat: c.competingCat,
            weightDivision: null,
            format: c.format,
            athletes: bothKataAthletes,
          };
        }

        if (bothKumiteAthletes.length > 0) {
          const kumiteKey = `kumite_ind_${c.key}_doble`;
          categories[kumiteKey] = {
            key: kumiteKey,
            pairKey,
            modalityProfile: 'doble',
            name: `Kumite ${c.ageDivision.name} ${c.genderLabel} • ${c.competingCat.name}${c.weightLabel} (Doble Modalidad)`,
            modalityId: 'kumite_ind',
            ageDivision: c.ageDivision,
            gender: c.gender,
            competingCat: c.competingCat,
            weightDivision: c.weightDivision,
            format: c.format,
            athletes: bothKumiteAthletes,
          };
        }
      }

      // 2. Gráficas de Solo Kumite (si quedan 1 o más competidores no absorbidos)
      if (kumiteOnlyAthletes.length > 0) {
        const kumiteSoloKey = `kumite_ind_${c.key}_solo_kumite`;
        categories[kumiteSoloKey] = {
          key: kumiteSoloKey,
          modalityProfile: 'solo_kumite',
          name: `Kumite ${c.ageDivision.name} ${c.genderLabel} • ${c.competingCat.name}${c.weightLabel} [SOLO KUMITE]`,
          modalityId: 'kumite_ind',
          ageDivision: c.ageDivision,
          gender: c.gender,
          competingCat: c.competingCat,
          weightDivision: c.weightDivision,
          format: c.format,
          athletes: kumiteOnlyAthletes.map(a => ({ ...a, isSoloKumite: true })),
        };
      }

      // 3. Gráficas de Solo Kata (si quedan 1 o más competidores no absorbidos)
      if (kataOnlyAthletes.length > 0) {
        const kataSoloKey = `kata_ind_${c.key}_solo_kata`;
        categories[kataSoloKey] = {
          key: kataSoloKey,
          modalityProfile: 'solo_kata',
          name: `Kata ${c.ageDivision.name} ${c.genderLabel} • ${c.competingCat.name}${c.weightLabel} [SOLO KATA]`,
          modalityId: 'kata_ind',
          ageDivision: c.ageDivision,
          gender: c.gender,
          competingCat: c.competingCat,
          weightDivision: null,
          format: c.format,
          athletes: kataOnlyAthletes.map(a => ({ ...a, isSoloKata: true })),
        };
      }
    });
  }

  // Fusión inteligente de categorías infantiles (6-7 años y -5 años) a 'Mixto' si alguna rama tiene menos de 4 atletas
  if (allowMixedInfant) {
    const targetDivisions = ['u5', '6-7'];
    const keys = Object.keys(categories);

    targetDivisions.forEach(divId => {
      // Buscar pares M y F con misma modalidad, competingCat y modalityProfile
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
            catF.competingCat?.id === catM.competingCat?.id &&
            (catF.modalityProfile || '') === (catM.modalityProfile || '');
        });

        if (keyF) {
          const catF = categories[keyF];
          const countM = catM.athletes.length;
          const countF = catF.athletes.length;

          // Si una o ambas ramas tienen menos de 4 atletas y entre ambas juntan al menos 2
          if ((countM < 4 || countF < 4) && (countM + countF >= 2)) {
            const profileSuffix = catM.modalityProfile === 'doble'
              ? ' (Doble Modalidad)'
              : (catM.modalityProfile === 'solo_kumite' ? ' [SOLO KUMITE]' : (catM.modalityProfile === 'solo_kata' ? ' [SOLO KATA]' : ''));
            const mixedKey = `${catM.modalityId}_${divId}_MIXTO_${catM.competingCat.id}_${catM.modalityProfile || 'std'}`;
            const mixedName = `${catM.modalityId.includes('kata') ? 'Kata' : 'Kumite'} ${catM.ageDivision.name} Mixto • ${catM.competingCat.name}${profileSuffix}`;

            categories[mixedKey] = {
              key: mixedKey,
              pairKey: catM.pairKey ? `pair_${divId}_MIXTO_${catM.competingCat.id}` : null,
              modalityProfile: catM.modalityProfile,
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
