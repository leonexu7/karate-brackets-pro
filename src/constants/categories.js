export const AGE_DIVISIONS = [
  { id: 'u5', name: '-5 años', minAge: 0, maxAge: 5, format: 'cuarteta', hasWeightDivisions: false },
  { id: '6-7', name: '6-7 años', minAge: 6, maxAge: 7, format: 'cuarteta', hasWeightDivisions: false },
  { id: '8-9', name: '8-9 años', minAge: 8, maxAge: 9, format: 'cuarteta', hasWeightDivisions: false },
  { id: '10-11', name: '10-11 años (U12)', minAge: 10, maxAge: 11, format: 'bracket_16', hasWeightDivisions: false },
  { id: '12-13', name: '12-13 años (U14)', minAge: 12, maxAge: 13, format: 'bracket_16', hasWeightDivisions: false },
  { id: '14-15', name: '14-15 años (Cadetes)', minAge: 14, maxAge: 15, format: 'bracket_16', hasWeightDivisions: true },
  { id: '16-17', name: '16-17 años (Junior)', minAge: 16, maxAge: 17, format: 'bracket_16', hasWeightDivisions: true },
  { id: '18-20', name: '18-20 años (Sub-21)', minAge: 18, maxAge: 20, format: 'bracket_16', hasWeightDivisions: true },
  { id: 'senior', name: 'Senior (+18 años)', minAge: 18, maxAge: 34, format: 'bracket_16', hasWeightDivisions: true },
  { id: 'masters35', name: 'Master (+35 años)', minAge: 35, maxAge: 44, format: 'bracket_16', hasWeightDivisions: false },
  { id: 'masters45', name: 'Master (+45 años)', minAge: 45, maxAge: 99, format: 'bracket_16', hasWeightDivisions: false },
];

export const DEFAULT_WEIGHT_DIVISIONS = {
  '14-15': {
    M: [
      { id: 'm-14-15-52', name: '-52 kg', min: null, max: 52 },
      { id: 'm-14-15-57', name: '-57 kg', min: 52.01, max: 57 },
      { id: 'm-14-15-63', name: '-63 kg', min: 57.01, max: 63 },
      { id: 'm-14-15-70', name: '-70 kg', min: 63.01, max: 70 },
      { id: 'm-14-15-p70', name: '+70 kg', min: 70.01, max: null },
    ],
    F: [
      { id: 'f-14-15-47', name: '-47 kg', min: null, max: 47 },
      { id: 'f-14-15-54', name: '-54 kg', min: 47.01, max: 54 },
      { id: 'f-14-15-61', name: '-61 kg', min: 54.01, max: 61 },
      { id: 'f-14-15-p61', name: '+61 kg', min: 61.01, max: null },
    ],
  },
  '16-17': {
    M: [
      { id: 'm-16-17-55', name: '-55 kg', min: null, max: 55 },
      { id: 'm-16-17-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'm-16-17-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'm-16-17-76', name: '-76 kg', min: 68.01, max: 76 },
      { id: 'm-16-17-p76', name: '+76 kg', min: 76.01, max: null },
    ],
    F: [
      { id: 'f-16-17-48', name: '-48 kg', min: null, max: 48 },
      { id: 'f-16-17-53', name: '-53 kg', min: 48.01, max: 53 },
      { id: 'f-16-17-59', name: '-59 kg', min: 53.01, max: 59 },
      { id: 'f-16-17-66', name: '-66 kg', min: 59.01, max: 66 },
      { id: 'f-16-17-p66', name: '+66 kg', min: 66.01, max: null },
    ],
  },
  '18-20': {
    M: [
      { id: 'm-u21-60', name: '-60 kg', min: null, max: 60 },
      { id: 'm-u21-67', name: '-67 kg', min: 60.01, max: 67 },
      { id: 'm-u21-75', name: '-75 kg', min: 67.01, max: 75 },
      { id: 'm-u21-84', name: '-84 kg', min: 75.01, max: 84 },
      { id: 'm-u21-p84', name: '+84 kg', min: 84.01, max: null },
    ],
    F: [
      { id: 'f-u21-50', name: '-50 kg', min: null, max: 50 },
      { id: 'f-u21-55', name: '-55 kg', min: 50.01, max: 55 },
      { id: 'f-u21-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'f-u21-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'f-u21-p68', name: '+68 kg', min: 68.01, max: null },
    ],
  },
  'senior': {
    M: [
      { id: 'm-sen-60', name: '-60 kg', min: null, max: 60 },
      { id: 'm-sen-67', name: '-67 kg', min: 60.01, max: 67 },
      { id: 'm-sen-75', name: '-75 kg', min: 67.01, max: 75 },
      { id: 'm-sen-84', name: '-84 kg', min: 75.01, max: 84 },
      { id: 'm-sen-p84', name: '+84 kg', min: 84.01, max: null },
    ],
    F: [
      { id: 'f-sen-50', name: '-50 kg', min: null, max: 50 },
      { id: 'f-sen-55', name: '-55 kg', min: 50.01, max: 55 },
      { id: 'f-sen-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'f-sen-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'f-sen-p68', name: '+68 kg', min: 68.01, max: null },
    ],
  }
};

export const WEIGHT_DIVISIONS = DEFAULT_WEIGHT_DIVISIONS;

export const PRESETS_2_WEIGHTS = {
  M: [
    { id: 'm-ligero', name: '-75 kg', min: null, max: 75 },
    { id: 'm-pesado', name: '+75 kg', min: 75.01, max: null },
  ],
  F: [
    { id: 'f-ligero', name: '-60 kg', min: null, max: 60 },
    { id: 'f-pesado', name: '+60 kg', min: 60.01, max: null },
  ],
};

export const PRESETS_3_WEIGHTS = {
  M: [
    { id: 'm-ligero', name: '-67 kg', min: null, max: 67 },
    { id: 'm-medio', name: '-80 kg', min: 67.01, max: 80 },
    { id: 'm-pesado', name: '+80 kg', min: 80.01, max: null },
  ],
  F: [
    { id: 'f-ligero', name: '-55 kg', min: null, max: 55 },
    { id: 'f-medio', name: '-65 kg', min: 55.01, max: 65 },
    { id: 'f-pesado', name: '+65 kg', min: 65.01, max: null },
  ],
};

export const MODALITIES = [
  { id: 'kata_ind', name: 'Kata Individual', type: 'individual' },
  { id: 'kumite_ind', name: 'Kumite Individual', type: 'individual' },
  { id: 'kata_team', name: 'Kata Equipos', type: 'team' },
  { id: 'kumite_team', name: 'Kumite Equipos', type: 'team' },
];

export function calculateAge(birthDateString, referenceDateString = new Date().toISOString()) {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  const refDate = new Date(referenceDateString);
  if (isNaN(birthDate.getTime())) return null;

  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function findAgeDivision(age) {
  if (age === null || age === undefined || isNaN(age)) return AGE_DIVISIONS[0];
  if (age <= 5) return AGE_DIVISIONS[0]; // -5 años
  const div = AGE_DIVISIONS.find(d => age >= d.minAge && age <= d.maxAge);
  return div || AGE_DIVISIONS[AGE_DIVISIONS.length - 1];
}

export function findWeightDivision(ageDivisionId, gender, weight, customWeightDivisions = null) {
  const ageKey = ageDivisionId === '14-15' ? '14-15' :
                 ageDivisionId === '16-17' ? '16-17' :
                 ageDivisionId === '18-20' ? '18-20' :
                 ageDivisionId === 'senior' ? 'senior' : null;

  const source = (customWeightDivisions && customWeightDivisions[ageKey])
    ? customWeightDivisions
    : (WEIGHT_DIVISIONS || DEFAULT_WEIGHT_DIVISIONS);

  if (!ageKey || !source[ageKey]) return null;
  const list = source[ageKey][gender === 'F' ? 'F' : 'M'] || [];
  if (list.length === 0) return null;

  const wNum = parseFloat(weight);
  if (!wNum || isNaN(wNum) || wNum <= 0) {
    return list.find(w => w.isDefault) || list[0] || null;
  }

  // 1. Coincidencia estricta por rangos definidos
  for (const div of list) {
    const min = div.min !== null && div.min !== undefined && div.min !== '' ? parseFloat(div.min) : null;
    const max = div.max !== null && div.max !== undefined && div.max !== '' ? parseFloat(div.max) : null;

    if (max !== null && (min === null || min === 0)) {
      if (wNum <= max) return div;
    } else if (min !== null && max !== null) {
      if (wNum > (min - 0.05) && wNum <= (max + 0.05)) return div;
    } else if (min !== null && (max === null || max === 0)) {
      if (wNum >= (min - 0.05)) return div;
    }
  }

  // 2. Coincidencia secuencial ordenada por peso máximo
  const withMax = list.filter(d => d.max !== null && d.max !== undefined && d.max !== '' && parseFloat(d.max) > 0);
  withMax.sort((a, b) => parseFloat(a.max) - parseFloat(b.max));
  for (const div of withMax) {
    if (wNum <= parseFloat(div.max)) return div;
  }

  // 3. Categoría de peso libre / pesados (+)
  const plusDiv = list.find(d => !d.max || parseFloat(d.max) === 0);
  if (plusDiv) return plusDiv;

  return list[list.length - 1] || null;
}
