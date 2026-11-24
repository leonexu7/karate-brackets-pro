/**
 * Motor de Generación de Llaves de Karate (Brackets)
 * - Cuartetas infantiles (<= 8-9 años) con 4 medallas garantizadas (1 por hoja)
 * - Brackets estándar de 8 y 16 competidores con separación de dojos (Anti-clash óptimo)
 * - Brackets multi-hoja dinámicos para categorías grandes (>16 atletas, ej. 3 a 5 hojas vinculadas)
 */

/**
 * Distribuye una lista de atletas aplicando el algoritmo Anti-Clash:
 * Intenta separar competidores del mismo dojo entre cuadrantes/mitades.
 */
export function separateDojos(athletes) {
  if (!athletes || athletes.length <= 1) return [...(athletes || [])];

  // Agrupar por dojoId o dojoName
  const byDojo = {};
  athletes.forEach(a => {
    const dId = a.dojoId || a.dojoName || 'sin_dojo';
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
 * Asigna posiciones (slots) exactas en la llave asegurando que los competidores
 * del mismo dojo queden en mitades opuestas y NUNCA se enfrenten en primera ronda.
 */
export function assignAntiClashSlots(athletes, bracketSize = 8) {
  const numMatches = bracketSize / 2;
  const slots = new Array(bracketSize).fill(null);
  if (!athletes || athletes.length === 0) return slots;

  // Si son solo 2 competidores, colocarlos en extremos opuestos (Match 1 Aka y Último Match Ao)
  // de modo que ambos aparezcan directamente en la Gran Final
  if (athletes.length === 2) {
    slots[0] = athletes[0];
    slots[bracketSize - 1] = athletes[1];
    return slots;
  }

  // 1. Agrupar atletas por Dojo
  const byDojo = {};
  athletes.forEach(a => {
    const dId = a.dojoId || a.dojoName || 'sin_dojo';
    if (!byDojo[dId]) byDojo[dId] = [];
    byDojo[dId].push(a);
  });

  const sortedDojos = Object.keys(byDojo).sort((a, b) => byDojo[b].length - byDojo[a].length);

  // Orden de preferencia de partidos alternando mitades opuestas (arriba, abajo, centro):
  const matchOrder8 = [0, 3, 1, 2];
  const matchOrder16 = [0, 7, 3, 4, 1, 6, 2, 5];
  const matchOrder32 = [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10];
  const matchOrder = bracketSize === 32 ? matchOrder32 : (bracketSize === 16 ? matchOrder16 : matchOrder8);

  const matchAssignments = Array.from({ length: numMatches }, () => []);

  function findBestMatch(dojoId) {
    // Prioridad 1: Match completamente vacío (para recibir Bye si faltan atletas)
    for (const mIdx of matchOrder) {
      if (matchAssignments[mIdx].length === 0) {
        return mIdx;
      }
    }
    // Prioridad 2: Match con 1 atleta de un DOJO DIFERENTE
    for (const mIdx of matchOrder) {
      if (matchAssignments[mIdx].length === 1) {
        const existingDojo = matchAssignments[mIdx][0].dojoId || matchAssignments[mIdx][0].dojoName;
        if (existingDojo !== dojoId) {
          return mIdx;
        }
      }
    }
    // Prioridad 3: Solo si un dojo satura más del 50% de la categoría
    for (const mIdx of matchOrder) {
      if (matchAssignments[mIdx].length === 1) {
        return mIdx;
      }
    }
    return -1;
  }

  // Asignar alternando entre dojos (ronda por ronda)
  let hasMore = true;
  let roundIdx = 0;
  while (hasMore) {
    hasMore = false;
    for (const dId of sortedDojos) {
      const group = byDojo[dId];
      if (roundIdx < group.length) {
        hasMore = true;
        const ath = group[roundIdx];
        const bestM = findBestMatch(dId);
        if (bestM !== -1) {
          matchAssignments[bestM].push(ath);
        }
      }
    }
    roundIdx++;
  }

  // Mapear matchAssignments a slots:
  for (let m = 0; m < numMatches; m++) {
    const assigned = matchAssignments[m];
    if (assigned.length === 1) {
      slots[m * 2] = assigned[0];
      slots[m * 2 + 1] = null;
    } else if (assigned.length >= 2) {
      slots[m * 2] = assigned[0];
      slots[m * 2 + 1] = assigned[1];
    }
  }

  return slots;
}

/**
 * Organiza los 4 slots de una cuarteta garantizando que compañeros de dojo
 * queden en Semifinales opuestas (Semi 1 vs Semi 2).
 */
function slotCuartetaAntiClash(chunk) {
  if (!chunk || chunk.length === 0) return [null, null, null, null];
  if (chunk.length === 1) return [chunk[0], null, null, null];
  if (chunk.length === 2) return [chunk[0], chunk[1], null, null];

  const byDojo = {};
  chunk.forEach(a => {
    const dId = a.dojoId || a.dojoName || 'sin_dojo';
    if (!byDojo[dId]) byDojo[dId] = [];
    byDojo[dId].push(a);
  });

  const groups = Object.values(byDojo).sort((a, b) => b.length - a.length);
  const slots = [null, null, null, null];

  if (groups[0].length >= 2) {
    // Teammate 1 en Semifinal 1 (slot 0 Aka)
    slots[0] = groups[0][0];
    // Teammate 2 en Semifinal 2 (slot 2 Aka)
    slots[2] = groups[0][1];

    const remaining = [];
    for (let i = 2; i < groups[0].length; i++) remaining.push(groups[0][i]);
    for (let g = 1; g < groups.length; g++) {
      for (const a of groups[g]) remaining.push(a);
    }

    if (remaining[0]) slots[1] = remaining[0]; // Rival de Semi 1
    if (remaining[1]) slots[3] = remaining[1]; // Rival de Semi 2
  } else {
    // Dojos distintos
    slots[0] = chunk[0] || null;
    slots[1] = chunk[1] || null;
    slots[2] = chunk[2] || null;
    slots[3] = chunk[3] || null;
  }
  return slots;
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
    // Aplicar separación de dojos en semifinales opuestas dentro de la cuarteta
    const slots = slotCuartetaAntiClash(rawChunk);
    const cuartetaIndex = Math.floor(i / chunkSize) + 1;

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
      // Si son exactamente 2 atletas: van directo a la Gran Final
      // Si son 3 o 4 atletas: Semifinal 1, Semifinal 2 y Gran Final
      matches: rawChunk.length === 2 ? [
        {
          id: `${cuartetaId}_m1`,
          matchNumber: 1,
          roundName: 'Gran Final Directa',
          aka: slots[0],
          ao: slots[1],
          scoreAka: 0,
          scoreAo: 0,
          winner: null, // Oro
          runnerUp: null, // Plata
          note: 'Final directa por campeonato',
        }
      ] : [
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
          isBye: slots[1] === null,
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
          isBye: slots[3] === null,
        },
        {
          id: `${cuartetaId}_m3`,
          matchNumber: 3,
          roundName: 'Gran Final',
          aka: slots[1] === null ? slots[0] : null, // Si hubo Bye en Semi 1
          ao: slots[3] === null ? slots[2] : null,  // Si hubo Bye en Semi 2
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
 * Posiciones oficiales para Byes simétricos en llaves de Karate (WKF / Shito-Kai)
 */
const SEEDING_ORDER_8 = [0, 7, 2, 4, 3, 5, 1, 6];
const SEEDING_ORDER_16 = [0, 15, 8, 7, 4, 11, 12, 3, 2, 13, 10, 5, 6, 9, 14, 1];

/**
 * Genera un bracket estándar para torneos con jueceo en papel:
 * - Regla Shito-Kai: NUNCA se trunca la llave a solo 2 o 4 combates.
 * - Siempre mantiene como mínimo los Cuartos de Final (8 posiciones: 4 cuartos -> 2 semis -> 1 final)
 *   para que si llegan competidores de última hora a la mesa, existan los renglones oficiales
 *   para agregarlos a mano.
 * - Si hay solo 2 competidores, se colocan en extremos opuestos y aparecen ya rotulados directamente
 *   en la Gran Final por el campeonato, manteniendo todas las líneas de Cuartos y Semis disponibles.
 * - Si hay 9 a 16 competidores: Octavos de Final (8 combates) -> Cuartos -> Semifinales -> Gran Final.
 */
export function generateStandardBracket(categoryKey, categoryName, athletes, tatamiNumber = 1, forceSize = null, gender = null) {
  const count = athletes.length;
  const bracketSize = forceSize || (count <= 8 ? 8 : 16);
  const resolvedGender = gender || (categoryName.toUpperCase().includes('FEMENIL') ? 'F' : 'M');

  // Colocar competidores con el algoritmo Anti-Choque garantizado
  const slots = assignAntiClashSlots(athletes, bracketSize);

  const bracketId = `bracket_${categoryKey}`;
  const rounds = [];

  if (bracketSize === 8) {
    // Ronda 1: Cuartos de Final (4 combates)
    const r1Matches = [];
    for (let i = 0; i < 4; i++) {
      const aka = slots[i * 2];
      const ao = slots[i * 2 + 1];
      const isBye = (!aka && Boolean(ao)) || (Boolean(aka) && !ao);
      const winner = isBye ? (aka || ao) : null;
      r1Matches.push({
        id: `${bracketId}_r1_m${i + 1}`,
        matchNumber: i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner,
        isBye,
      });
    }
    rounds.push({ name: 'Cuartos de Final', matches: r1Matches });

    // Ronda 2: Semifinales (2 combates)
    const r2Matches = [];
    for (let i = 0; i < 2; i++) {
      const aka = r1Matches[i * 2].winner;
      const ao = r1Matches[i * 2 + 1].winner;
      const isBye = (!aka && Boolean(ao)) || (Boolean(aka) && !ao);
      const winner = isBye ? (aka || ao) : null;
      r2Matches.push({
        id: `${bracketId}_r2_m${i + 1}`,
        matchNumber: 4 + i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner,
        isBye,
      });
    }
    rounds.push({ name: 'Semifinales', matches: r2Matches });

    // Ronda 3: Gran Final (1 combate)
    const finalAka = r2Matches[0].winner;
    const finalAo = r2Matches[1].winner;
    rounds.push({
      name: 'Gran Final',
      matches: [{
        id: `${bracketId}_r3_m1`,
        matchNumber: 7,
        aka: finalAka,
        ao: finalAo,
        scoreAka: 0,
        scoreAo: 0,
        winner: null,
        isBye: false,
      }]
    });
  } else {
    // Bracket de 16: Octavos -> Cuartos -> Semis -> Final
    const r1Matches = [];
    for (let i = 0; i < 8; i++) {
      const aka = slots[i * 2];
      const ao = slots[i * 2 + 1];
      const isBye = (!aka && Boolean(ao)) || (Boolean(aka) && !ao);
      const winner = isBye ? (aka || ao) : null;
      r1Matches.push({
        id: `${bracketId}_r1_m${i + 1}`,
        matchNumber: i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner,
        isBye,
      });
    }
    rounds.push({ name: 'Octavos de Final', matches: r1Matches });

    const r2Matches = [];
    for (let i = 0; i < 4; i++) {
      const aka = r1Matches[i * 2].winner;
      const ao = r1Matches[i * 2 + 1].winner;
      const isBye = (!aka && Boolean(ao)) || (Boolean(aka) && !ao);
      const winner = isBye ? (aka || ao) : null;
      r2Matches.push({
        id: `${bracketId}_r2_m${i + 1}`,
        matchNumber: 8 + i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner,
        isBye,
      });
    }
    rounds.push({ name: 'Cuartos de Final', matches: r2Matches });

    const r3Matches = [];
    for (let i = 0; i < 2; i++) {
      const aka = r2Matches[i * 2].winner;
      const ao = r2Matches[i * 2 + 1].winner;
      const isBye = (!aka && Boolean(ao)) || (Boolean(aka) && !ao);
      const winner = isBye ? (aka || ao) : null;
      r3Matches.push({
        id: `${bracketId}_r3_m${i + 1}`,
        matchNumber: 12 + i + 1,
        aka,
        ao,
        scoreAka: 0,
        scoreAo: 0,
        winner,
        isBye,
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
        isBye: false,
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
 * Escala dinámicamente:
 * - 17 a 32 competidores: 2 Poules de 16 (Poule A y B) + Hoja de Cruces Finales (3 hojas)
 * - 33 a 64 competidores: 4 Poules de 16 (Poule A, B, C, D) + Hoja de Cruces Finales (5 hojas)
 * - > 64 competidores: 8 Poules de 16 + Hoja de Cruces Finales
 * Garantiza que NINGÚN competidor sea descartado y que los compañeros de dojo
 * queden repartidos equitativamente entre las diferentes hojas clasificatorias.
 */
export function generateMultiPageBracket(categoryKey, categoryName, athletes, tatamiNumber = 1, gender = null) {
  const totalCount = athletes.length;
  const pouleCount = totalCount <= 32 ? 2 : (totalCount <= 64 ? 4 : 8);
  const pouleLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const resolvedGender = gender || (categoryName.toUpperCase().includes('FEMENIL') ? 'F' : 'M');

  // Separar los atletas entre las poules equilibrando dojos
  const byDojo = {};
  athletes.forEach(a => {
    const dId = a.dojoId || a.dojoName || 'sin_dojo';
    if (!byDojo[dId]) byDojo[dId] = [];
    byDojo[dId].push(a);
  });

  const pouleBuckets = Array.from({ length: pouleCount }, () => []);
  let pIdx = 0;
  Object.values(byDojo).sort((a, b) => b.length - a.length).forEach(group => {
    group.forEach(ath => {
      pouleBuckets[pIdx].push(ath);
      pIdx = (pIdx + 1) % pouleCount;
    });
  });

  const pages = [];
  const totalPages = pouleCount + 1;

  for (let i = 0; i < pouleCount; i++) {
    const letter = pouleLetters[i];
    const pAthletes = pouleBuckets[i];
    const bracketSize = pAthletes.length <= 8 ? 8 : 16;
    const stdBracket = generateStandardBracket(
      `${categoryKey}_poule_${letter}`,
      `${categoryName} - Poule ${letter}`,
      pAthletes,
      tatamiNumber,
      bracketSize,
      resolvedGender
    );

    pages.push({
      pageNumber: i + 1,
      totalPages,
      pouleLetter: letter,
      title: `Hoja ${i + 1} de ${totalPages} — Poule ${letter} (Rondas Clasificatorias)`,
      note: pouleCount === 2
        ? 'Los 2 finalistas de esta hoja avanzan a las Semifinales en la Hoja Final'
        : 'El campeón de esta Poule avanza a las Semifinales en la Hoja Final',
      bracket: stdBracket,
    });
  }

  // Hoja Final de Cruces
  const finalsMatches = pouleCount === 2 ? [
    { id: 'semi_cruz_1', matchNumber: 'SF-1', akaLabel: 'Ganador Poule A (Hoja 1)', aoLabel: 'Subcampeón Poule B (Hoja 2)' },
    { id: 'semi_cruz_2', matchNumber: 'SF-2', akaLabel: 'Ganador Poule B (Hoja 2)', aoLabel: 'Subcampeón Poule A (Hoja 1)' },
    { id: 'final_oro', matchNumber: 'FINAL', akaLabel: 'Ganador SF-1', aoLabel: 'Ganador SF-2' },
  ] : [
    { id: 'semi_cruz_1', matchNumber: 'SF-1', akaLabel: 'Campeón Poule A (Hoja 1)', aoLabel: 'Campeón Poule B (Hoja 2)' },
    { id: 'semi_cruz_2', matchNumber: 'SF-2', akaLabel: 'Campeón Poule C (Hoja 3)', aoLabel: 'Campeón Poule D (Hoja 4)' },
    { id: 'final_oro', matchNumber: 'FINAL', akaLabel: 'Ganador SF-1', aoLabel: 'Ganador SF-2' },
  ];

  pages.push({
    pageNumber: totalPages,
    totalPages,
    title: `Hoja ${totalPages} de ${totalPages} — Semifinales Cruzadas y Gran Final`,
    note: 'Combates decisivos por Medalla de Oro, Plata y Bronces',
    finalsBracket: {
      name: 'Cruces Finales',
      pouleCount,
      matches: finalsMatches,
    }
  });

  return {
    id: `multipage_${categoryKey}`,
    type: 'multipage',
    categoryKey,
    categoryName,
    tatami: tatamiNumber,
    gender: resolvedGender,
    totalAthletes: athletes.length,
    pouleCount,
    totalPages,
    pages,
  };
}

/**
 * Generador principal: Recibe las categorías y genera la lista completa de gráficas listas para imprimir
 */
export function buildTournamentBrackets(categoriesMap, tatamisCount = 3) {
  const allBrackets = [];
  let tatamiIndex = 1;
  const pairTatamiMap = {};

  Object.values(categoriesMap).forEach(category => {
    const athletes = category.athletes || [];
    if (athletes.length === 0) return;

    let assignedTatami;
    if (category.pairKey) {
      if (pairTatamiMap[category.pairKey]) {
        assignedTatami = pairTatamiMap[category.pairKey];
      } else {
        assignedTatami = ((tatamiIndex - 1) % tatamisCount) + 1;
        pairTatamiMap[category.pairKey] = assignedTatami;
        tatamiIndex++;
      }
    } else {
      assignedTatami = ((tatamiIndex - 1) % tatamisCount) + 1;
      tatamiIndex++;
    }

    if (category.format === 'cuarteta') {
      // Regla de Cuartetas Infantiles (<= 8-9 años): 1 por hoja, todos con medalla
      const cuartetas = generateCuartetas(category.key, category.name, athletes, assignedTatami, category.gender);
      cuartetas.forEach(c => {
        c.modalityProfile = category.modalityProfile || 'standard';
        c.pairKey = category.pairKey || null;
      });
      allBrackets.push(...cuartetas);
    } else if (athletes.length > 16) {
      // Categoría multitudinaria: Multi-hoja conectada (ej. 3 hojas para adolescentes)
      const multi = generateMultiPageBracket(category.key, category.name, athletes, assignedTatami, category.gender);
      multi.modalityProfile = category.modalityProfile || 'standard';
      multi.pairKey = category.pairKey || null;
      allBrackets.push(multi);
    } else {
      // Gráfica estándar de 8 o 16 competidores por hoja
      const std = generateStandardBracket(category.key, category.name, athletes, assignedTatami, null, category.gender);
      std.modalityProfile = category.modalityProfile || 'standard';
      std.pairKey = category.pairKey || null;
      allBrackets.push(std);
    }
  });

  return allBrackets;
}
