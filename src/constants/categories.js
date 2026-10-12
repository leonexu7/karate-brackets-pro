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

export const WEIGHT_DIVISIONS = {
  '14-15': {
    M: [
      { id: 'm-14-15-52', name: '-52 kg', max: 52 },
      { id: 'm-14-15-57', name: '-57 kg', min: 52.01, max: 57 },
      { id: 'm-14-15-63', name: '-63 kg', min: 57.01, max: 63 },
      { id: 'm-14-15-70', name: '-70 kg', min: 63.01, max: 70 },
      { id: 'm-14-15-p70', name: '+70 kg', min: 70.01 },
    ],
    F: [
      { id: 'f-14-15-47', name: '-47 kg', max: 47 },
      { id: 'f-14-15-54', name: '-54 kg', min: 47.01, max: 54 },
      { id: 'f-14-15-61', name: '-61 kg', min: 54.01, max: 61 },
      { id: 'f-14-15-p61', name: '+61 kg', min: 61.01 },
    ],
  },
  '16-17': {
    M: [
      { id: 'm-16-17-55', name: '-55 kg', max: 55 },
      { id: 'm-16-17-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'm-16-17-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'm-16-17-76', name: '-76 kg', min: 68.01, max: 76 },
      { id: 'm-16-17-p76', name: '+76 kg', min: 76.01 },
    ],
    F: [
      { id: 'f-16-17-48', name: '-48 kg', max: 48 },
      { id: 'f-16-17-53', name: '-53 kg', min: 48.01, max: 53 },
      { id: 'f-16-17-59', name: '-59 kg', min: 53.01, max: 59 },
      { id: 'f-16-17-66', name: '-66 kg', min: 59.01, max: 66 },
      { id: 'f-16-17-p66', name: '+66 kg', min: 66.01 },
    ],
  },
  '18-20': {
    M: [
      { id: 'm-u21-60', name: '-60 kg', max: 60 },
      { id: 'm-u21-67', name: '-67 kg', min: 60.01, max: 67 },
      { id: 'm-u21-75', name: '-75 kg', min: 67.01, max: 75 },
      { id: 'm-u21-84', name: '-84 kg', min: 75.01, max: 84 },
      { id: 'm-u21-p84', name: '+84 kg', min: 84.01 },
    ],
    F: [
      { id: 'f-u21-50', name: '-50 kg', max: 50 },
      { id: 'f-u21-55', name: '-55 kg', min: 50.01, max: 55 },
      { id: 'f-u21-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'f-u21-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'f-u21-p68', name: '+68 kg', min: 68.01 },
    ],
  },
  'senior': {
    M: [
      { id: 'm-sen-60', name: '-60 kg', max: 60 },
      { id: 'm-sen-67', name: '-67 kg', min: 60.01, max: 67 },
      { id: 'm-sen-75', name: '-75 kg', min: 67.01, max: 75 },
      { id: 'm-sen-84', name: '-84 kg', min: 75.01, max: 84 },
      { id: 'm-sen-p84', name: '+84 kg', min: 84.01 },
      { id: 'm-sen-open', name: 'Open (Libre)', isDefault: true },
    ],
    F: [
      { id: 'f-sen-50', name: '-50 kg', max: 50 },
      { id: 'f-sen-55', name: '-55 kg', min: 50.01, max: 55 },
      { id: 'f-sen-61', name: '-61 kg', min: 55.01, max: 61 },
      { id: 'f-sen-68', name: '-68 kg', min: 61.01, max: 68 },
      { id: 'f-sen-p68', name: '+68 kg', min: 68.01 },
      { id: 'f-sen-open', name: 'Open (Libre)', isDefault: true },
    ],
  }
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

export function findWeightDivision(ageDivisionId, gender, weight) {
  const ageKey = ageDivisionId === '14-15' ? '14-15' :
                 ageDivisionId === '16-17' ? '16-17' :
                 ageDivisionId === '18-20' ? '18-20' :
                 ageDivisionId === 'senior' ? 'senior' : null;

  if (!ageKey || !WEIGHT_DIVISIONS[ageKey]) return null;
  const list = WEIGHT_DIVISIONS[ageKey][gender === 'F' ? 'F' : 'M'] || [];
  if (!weight || weight <= 0) {
    return list.find(w => w.isDefault) || list[0] || null;
  }

  for (const div of list) {
    if (div.max && !div.min && weight <= div.max) return div;
    if (div.min && div.max && weight >= div.min && weight <= div.max) return div;
    if (div.min && !div.max && weight >= div.min) return div;
  }
  return list[list.length - 1] || null;
}
