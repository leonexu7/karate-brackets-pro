/**
 * Motor de Generación de Llaves de Karate (Brackets)
 * - Cuartetas infantiles (<= 8-9 años) con 4 medallas garantizadas (1 por hoja)
 * - Brackets estándar de 8 y 16 competidores con separación de dojos (Anti-clash)
 * - Brackets multi-hoja para categorías grandes (>16 atletas, ej. 3 hojas vinculadas)
 */

/**
 * Distribuye una lista de atletas aplicando el algoritmo Anti-Clash:
 * Intenta separar competidores del mismo dojo entre cuadrantes/mitades.
 */
export function separateDojos(athletes) {
  if (!athletes || athletes.length <= 1) return [...(athletes || [])];

  // Agrupar por dojoId
  const byDojo = {};
  athletes.forEach(a => {
    const dId = a.dojoId || 'sin_dojo';
    if (!byDojo[dId]) byDojo[dId] = [];
    byDojo[dId].push(a);
  });

  // Ordenar grupos de dojos por tamaño descendente
  const dojoGroups = Object.values(byDojo).sort((a, b) => b.length - a.length);

  // Distribuir alternando de extremos hacia el centro (Aka y Ao opuestos)
  const result = new Array(athletes.length);
  let left = 0;
  let right = athletes.length - 1;
  let toggle = true;

  dojoGroups.forEach(group => {
    group.forEach(athlete => {
      if (toggle) {
        result[left++] = athlete;
      } else {
        result[right--] = athlete;
      }
      toggle = !toggle;
    });
  });

  return result.filter(Boolean);
}

/**
 * Genera cuartetas infantiles (<= 8-9 años)
 * Si hay 4 niños -> 1 cuarteta
 * Si hay 7 -> Cuarteta 1 (4 niños), Cuarteta 2 (3 niños con 1 bye)
 * Cada cuarteta garantiza 4 medallas (1 Oro, 1 Plata, 2 Bronces).
 */
export function generateCuartetas(categoryKey, categoryName, athletes, tatamiNumber = 1, gender = null) {
  // athletes viene pre-ordenado por estatura (y peso) desde autoClassifier.
  // Agrupamos en bloques de 4 para que cada cuarteta sea lo más equivalente posible en estatura.
  const cuartetas = [];
  const chunkSize = 4;
  const totalCuartetas = Math.ceil(athletes.length / chunkSize);
  const resolvedGender = gender || (categoryName.toUpperCase().includes('FEMENIL') ? 'F' : (categoryName.toUpperCase().includes('MIXTO') ? 'MIXTO' : 'M'));

  for (let i = 0; i < athletes.length; i += chunkSize) {
    const rawChunk = athletes.slice(i, i + chunkSize);
    // Aplicar separación de dojos dentro del grupo de estatura homogénea
    const chunk = separateDojos(rawChunk);
    const cuartetaIndex = Math.floor(i / chunkSize) + 1;

    // Rellenar hasta 4 con null (Bye) si la última cuarteta tiene 2 o 3 competidores
    const slots = [
      chunk[0] || null,
      chunk[1] || null,
      chunk[2] || null,
      chunk[3] || null,
    ];

    // Detectar rango de estatura del grupo
    const validHeights = rawChunk.map(a => parseFloat(a.height) || 0).filter(h => h > 0);
    let heightBadge = '';
    if (totalCuartetas > 1 && validHeights.length > 0) {
      const minH = Math.min(...validHeights);
      const maxH = Math.max(...validHeights);
      if (maxH < 130) {
        heightBadge = ' • Estatura < 130 cm';
      } else if (minH >= 130) {
        heightBadge = ' • Estatura ≥ 130 cm';
      } else {
        heightBadge = ` • ${Math.round(minH)}-${Math.round(maxH)} cm`;
      }
    }

    const cuartetaId = `cuarteta_${categoryKey}_${cuartetaIndex}`;
    const groupSuffix = totalCuartetas > 1 ? ` (Grupo ${cuartetaIndex}/${totalCuartetas}${heightBadge})` : '';

    cuartetas.push({
      id: cuartetaId,
      type: 'cuarteta',
      categoryKey,
      categoryName: `${categoryName}${groupSuffix}`,
      groupIndex: cuartetaIndex,
      totalGroups: totalCuartetas,
      tatami: tatamiNumber,
      gender: resolvedGender,
      athletes: slots,
      // Estructura de combates:
      // Combate 1 (Semi 1): slots[0] (Aka) vs slots[1] (Ao)
      // Combate 2 (Semi 2): slots[2] (Aka) vs slots[3] (Ao)
      // Combate 3 (Final): Ganador Semi 1 vs Ganador Semi 2
      matches: [
        {
          id: `${cuartetaId}_m1`,
          matchNumber: 1,
          roundName: 'Semifinal 1',
          aka: slots[0],
          ao: slots[1],
          scoreAka: 0,
          scoreAo: 0,
          winner: slots[1] === null ? slots[0] : null,
          loser: slots[1] === null ? null : null, // Bronce 1
        },
        {
          id: `${cuartetaId}_m2`,
          matchNumber: 2,
          roundName: 'Semifinal 2',
          aka: slots[2],
          ao: slots[3],
          scoreAka: 0,
          scoreAo: 0,
          winner: slots[3] === null ? slots[2] : null,
          loser: slots[3] === null ? null : null, // Bronce 2
        },
        {
          id: `${cuartetaId}_m3`,
          matchNumber: 3,
          roundName: 'Gran Final',
          aka: null, // Viene de m1
          ao: null,  // Viene de m2
          scoreAka: 0,
          scoreAo: 0,
          winner: null, // Oro
          runnerUp: null, // Plata
        }
      ],
      // Medallas garantizadas
      medals: {
        gold: null,
        silver: null,
        bronze1: null,
        bronze2: null,
      }
    });
  }

  return cuartetas;
}

/**
 * Posiciones oficiales para Byes simétricos en llaves de 16
 */
const SEEDING_ORDER_16 = [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2];

/**
 * Genera un bracket estándar adaptativo según la cantidad real de competidores:
 * - 1 o 2 atletas: Final Directa (1 combate por Oro y Plata)
 * - 3 o 4 atletas: Semifinales (2 combates) y Gran Final (1 combate)
 * - 5 a 8 atletas: Cuartos de Final (4 combates) -> Semifinales -> Gran Final
 * - 9 a 16 atletas: Octavos de Final (8 combates) -> Cuartos -> Semifinales -> Gran Final
 */
export function generateStandardBracket(categoryKey, categoryName, athletes, tatamiNumber = 1, forceSize = null, gender = null) {
  const count = athletes.length;
  let bracketSize = forceSize;
  if (!bracketSize) {
    if (count <= 2) {
      bracketSize = 2;
    } else if (count <= 4) {
      bracketSize = 4;
    } else if (count <= 8) {
      bracketSize = 8;
    } else {
      bracketSize = 16;
    }
  }

  const separated = separateDojos(athletes);
  const resolvedGender = gender || (categoryName.toUpperCase().includes('FEMENIL') ? 'F' : 'M');

  // Colocar competidores en las posiciones de siembra según el tamaño
  const slots = new Array(bracketSize).fill(null);
  if (bracketSize === 2) {
    slots[0] = separated[0] || null;
    slots[1] = separated[1] || null;
  } else if (bracketSize === 4) {
    if (count === 3) {
      // Si son 3: Semifinal 1 (atleta 0 vs atleta 1), Semifinal 2 (atleta 2 vs Bye que avanza a la final)
      slots[0] = separated[0];
      slots[1] = separated[1];
      slots[2] = separated[2];
      slots[3] = null;
    } else {
      for (let i = 0; i < separated.length && i < 4; i++) {
        slots[i] = separated[i];
      }
    }
  } else {
    for (let i = 0; i < separated.length && i < bracketSize; i++) {
      const seedPos = bracketSize === 16 ? SEEDING_ORDER_16[i] - 1 : (i % 2 === 0 ? i / 2 : bracketSize - Math.ceil(i / 2));
      slots[seedPos] = separated[i];
    }
  }

  const bracketId = `bracket_${categoryKey}`;
  const rounds = [];

  if (bracketSize === 2) {
    // 1 sola ronda: Gran Final Directa por campeonato
    const aka = slots[0];
    const ao = slots[1];
    const isBye = !aka || !ao;
    rounds.push({
      name: 'Gran Final',
      matches: [{
        id: `${bracketId}_final_m1`,
        matchNumber: 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner: isBye ? (aka || ao) : null,
        isBye,
      }]
    });
  } else if (bracketSize === 4) {
    // Ronda 1: Semifinales (2 combates)
    const r1Matches = [];
    for (let i = 0; i < 2; i++) {
      const aka = slots[i * 2];
      const ao = slots[i * 2 + 1];
      const isBye = !aka || !ao;
      r1Matches.push({
        id: `${bracketId}_sf_m${i + 1}`,
        matchNumber: i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner: isBye ? (aka || ao) : null,
        isBye,
      });
    }
    rounds.push({ name: 'Semifinales', matches: r1Matches });

    // Ronda 2: Gran Final (1 combate)
    rounds.push({
      name: 'Gran Final',
      matches: [{
        id: `${bracketId}_final_m1`,
        matchNumber: 3,
        aka: r1Matches[0].winner,
        ao: r1Matches[1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      }]
    });
  } else if (bracketSize === 8) {
    // Ronda 1: Cuartos de Final (4 combates)
    const r1Matches = [];
    for (let i = 0; i < 4; i++) {
      const aka = slots[i * 2];
      const ao = slots[i * 2 + 1];
      const isBye = !aka || !ao;
      r1Matches.push({
        id: `${bracketId}_r1_m${i + 1}`,
        matchNumber: i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner: isBye ? (aka || ao) : null,
        isBye,
      });
    }
    rounds.push({ name: 'Cuartos de Final', matches: r1Matches });

    // Ronda 2: Semifinales (2 combates)
    const r2Matches = [];
    for (let i = 0; i < 2; i++) {
      r2Matches.push({
        id: `${bracketId}_r2_m${i + 1}`,
        matchNumber: 4 + i + 1,
        aka: r1Matches[i * 2].winner,
        ao: r1Matches[i * 2 + 1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      });
    }
    rounds.push({ name: 'Semifinales', matches: r2Matches });

    // Ronda 3: Gran Final (1 combate)
    rounds.push({
      name: 'Gran Final',
      matches: [{
        id: `${bracketId}_r3_m1`,
        matchNumber: 7,
        aka: r2Matches[0].winner,
        ao: r2Matches[1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      }]
    });
  } else {
    // Bracket de 16: Octavos -> Cuartos -> Semis -> Final
    const r1Matches = [];
    for (let i = 0; i < 8; i++) {
      const aka = slots[i * 2];
      const ao = slots[i * 2 + 1];
      const isBye = !aka || !ao;
      r1Matches.push({
        id: `${bracketId}_r1_m${i + 1}`,
        matchNumber: i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner: isBye ? (aka || ao) : null,
        isBye,
      });
    }
    rounds.push({ name: 'Octavos de Final', matches: r1Matches });

    const r2Matches = [];
    for (let i = 0; i < 4; i++) {
      r2Matches.push({
        id: `${bracketId}_r2_m${i + 1}`,
        matchNumber: 8 + i + 1,
        aka: r1Matches[i * 2].winner,
        ao: r1Matches[i * 2 + 1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      });
    }
    rounds.push({ name: 'Cuartos de Final', matches: r2Matches });

    const r3Matches = [];
    for (let i = 0; i < 2; i++) {
      r3Matches.push({
        id: `${bracketId}_r3_m${i + 1}`,
        matchNumber: 12 + i + 1,
        aka: r2Matches[i * 2].winner,
        ao: r2Matches[i * 2 + 1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      });
    }
    rounds.push({ name: 'Semifinales', matches: r3Matches });

    rounds.push({
      name: 'Gran Final',
      matches: [{
        id: `${bracketId}_r4_m1`,
        matchNumber: 15,
        aka: r3Matches[0].winner,
        ao: r3Matches[1].winner,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
      }]
    });
  }

  return {
    id: bracketId,
    type: 'standard',
    categoryKey,
    categoryName,
    tatami: tatamiNumber,
    gender: resolvedGender,
    bracketSize,
    slots,
    rounds,
    totalAthletes: count,
  };
}

/**
 * Genera una gráfica multi-hoja conectada para categorías grandes (> 16 competidores)
 * Divide en Poule A (Hoja 1 de 3), Poule B (Hoja 2 de 3) y Finales Cruzadas (Hoja 3 de 3).
 */
export function generateMultiPageBracket(categoryKey, categoryName, athletes, tatamiNumber = 1, gender = null) {
  const separated = separateDojos(athletes);
  const mid = Math.ceil(separated.length / 2);
  const pouleA_athletes = separated.slice(0, mid);
  const pouleB_athletes = separated.slice(mid);
  const resolvedGender = gender || (categoryName.toUpperCase().includes('FEMENIL') ? 'F' : 'M');

  const pouleA = generateStandardBracket(`${categoryKey}_pouleA`, `${categoryName} - Poule A`, pouleA_athletes, tatamiNumber, 16, resolvedGender);
  const pouleB = generateStandardBracket(`${categoryKey}_pouleB`, `${categoryName} - Poule B`, pouleB_athletes, tatamiNumber, 16, resolvedGender);

  return {
    id: `multipage_${categoryKey}`,
    type: 'multipage',
    categoryKey,
    categoryName,
    tatami: tatamiNumber,
    gender: resolvedGender,
    totalAthletes: athletes.length,
    totalPages: 3,
    pages: [
      {
        pageNumber: 1,
        totalPages: 3,
        title: 'Hoja 1 de 3 — Poule A (Rondas Clasificatorias)',
        note: 'Los 2 finalistas de esta hoja avanzan a las Semifinales en la Hoja 3',
        bracket: pouleA,
      },
      {
        pageNumber: 2,
        totalPages: 3,
        title: 'Hoja 2 de 3 — Poule B (Rondas Clasificatorias)',
        note: 'Los 2 finalistas de esta hoja avanzan a las Semifinales en la Hoja 3',
        bracket: pouleB,
      },
      {
        pageNumber: 3,
        totalPages: 3,
        title: 'Hoja 3 de 3 — Semifinales Cruzadas y Gran Final',
        note: 'Combates decisivos por Medalla de Oro, Plata y Bronces',
        finalsBracket: {
          name: 'Cruces Finales',
          matches: [
            { id: 'semi_cruz_1', matchNumber: 'SF-1', akaLabel: 'Ganador Poule A (Hoja 1)', aoLabel: 'Subcampeón Poule B (Hoja 2)' },
            { id: 'semi_cruz_2', matchNumber: 'SF-2', akaLabel: 'Ganador Poule B (Hoja 2)', aoLabel: 'Subcampeón Poule A (Hoja 1)' },
            { id: 'final_oro', matchNumber: 'FINAL', akaLabel: 'Ganador SF-1', aoLabel: 'Ganador SF-2' },
          ]
        }
      }
    ]
  };
}

/**
 * Generador principal: Recibe las categorías y genera la lista completa de gráficas listas para imprimir
 */
export function buildTournamentBrackets(categoriesMap, tatamisCount = 3) {
  const allBrackets = [];
  let tatamiIndex = 1;

  Object.values(categoriesMap).forEach(category => {
    const athletes = category.athletes || [];
    if (athletes.length === 0) return;

    const assignedTatami = ((tatamiIndex - 1) % tatamisCount) + 1;
    tatamiIndex++;

    if (category.format === 'cuarteta') {
      // Regla de Cuartetas Infantiles (<= 8-9 años): 1 por hoja, todos con medalla
      const cuartetas = generateCuartetas(category.key, category.name, athletes, assignedTatami, category.gender);
      allBrackets.push(...cuartetas);
    } else if (athletes.length > 16) {
      // Categoría multitudinaria: Multi-hoja conectada (ej. 3 hojas para adolescentes)
      const multi = generateMultiPageBracket(category.key, category.name, athletes, assignedTatami, category.gender);
      allBrackets.push(multi);
    } else {
      // Gráfica estándar de 8 o 16 competidores por hoja
      const std = generateStandardBracket(category.key, category.name, athletes, assignedTatami, null, category.gender);
      allBrackets.push(std);
    }
  });

  return allBrackets;
}
