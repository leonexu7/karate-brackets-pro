export const INITIAL_TOURNAMENT = {
  id: 'torneo-oficial-2026',
  name: 'Copa Nacional de Karate Do 2026',
  date: '2026-10-24',
  venue: 'Gimnasio Olímpico Principal',
  tatamisCount: 3,
  organizer: 'Comité Organizador Oficial de Karate Do',
  adminKey: 'karate2026', // Clave de seguridad por defecto para el organizador
  feeSingleModality: 300, // Costo de ficha oficial por 1 modalidad ($300 MXN)
  feeDoubleModality: 300, // Costo de ficha oficial por 2 modalidades ($300 MXN)
  divideAdultsByWeight: false, // Por defecto en torneos chicos: Categoría abierta (Open) de peso en mayores
  allowMixedInfant: true, // Permitir categoría mixta en 6-7 años si faltan competidores
};

// Iniciar con 0 dojos, 0 atletas y 0 equipos (totalmente limpio para registros reales)
export const INITIAL_DOJOS = [];
export const INITIAL_ATHLETES = [];
export const INITIAL_TEAMS = [];

// Atletas y Dojos de demostración opcionales (solo por si el organizador desea hacer una prueba en su panel privado)
export const DEMO_DOJOS = [
  { id: 'dojo-demo-1', name: 'Escuela Shito-Ryu Kai Honbu México', sensei: 'Ricardo Tanaka (6º Dan)', city: 'CDMX', phone: '55 1234 5678' },
  { id: 'dojo-demo-2', name: 'Asociación Shotokan Tradicional', sensei: 'Laura Mendoza (5º Dan)', city: 'Puebla', phone: '22 2345 6789' },
  { id: 'dojo-demo-3', name: 'Club Goju-Ryu Shinsei', sensei: 'Carlos Ibarra (5º Dan)', city: 'Toluca', phone: '72 3456 7890' },
  { id: 'dojo-demo-4', name: 'Organización Bushido Karate Do', sensei: 'Elena Morales (4º Dan)', city: 'Cuernavaca', phone: '77 4567 8901' },
];

export const DEMO_ATHLETES = [
  // Cuarteta Infantil -5 años
  { id: 'demo-1', fullName: 'Mateo Tanaka Gómez', birthDate: '2021-04-12', gender: 'M', beltId: 'blanca', weight: 18.5, height: 105, dojoId: 'dojo-demo-1', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-2', fullName: 'Santiago Morales Ruiz', birthDate: '2021-08-20', gender: 'M', beltId: 'blanca', weight: 19.0, height: 108, dojoId: 'dojo-demo-4', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-3', fullName: 'Iker Mendoza Santos', birthDate: '2021-02-15', gender: 'M', beltId: 'amarilla', weight: 18.0, height: 104, dojoId: 'dojo-demo-2', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-4', fullName: 'Leonardo Ibarra Vega', birthDate: '2021-06-30', gender: 'M', beltId: 'blanca', weight: 19.5, height: 107, dojoId: 'dojo-demo-3', modalities: ['kata_ind', 'kumite_ind'] },

  // Cuarteta Infantil 6-7 años
  { id: 'demo-5', fullName: 'Rodrigo Tanaka Solís', birthDate: '2019-05-10', gender: 'M', beltId: 'amarilla', weight: 23.0, height: 120, dojoId: 'dojo-demo-1', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-6', fullName: 'Maximiliano Cruz Soto', birthDate: '2019-09-14', gender: 'M', beltId: 'naranja', weight: 24.2, height: 122, dojoId: 'dojo-demo-2', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-7', fullName: 'Gael Ibarra Navarro', birthDate: '2019-01-22', gender: 'M', beltId: 'amarilla', weight: 22.8, height: 119, dojoId: 'dojo-demo-3', modalities: ['kata_ind', 'kumite_ind'] },
  { id: 'demo-8', fullName: 'Emiliano Flores Peña', birthDate: '2019-11-05', gender: 'M', beltId: 'naranja', weight: 25.0, height: 124, dojoId: 'dojo-demo-4', modalities: ['kata_ind', 'kumite_ind'] },

  // Cadetes 14-15 años (-57kg Kumite)
  { id: 'demo-9', fullName: 'Alejandro Ramos León', birthDate: '2011-04-10', gender: 'M', beltId: 'cafe', weight: 55.4, height: 168, dojoId: 'dojo-demo-1', modalities: ['kumite_ind'] },
  { id: 'demo-10', fullName: 'Daniel Ortiz Marín', birthDate: '2011-06-20', gender: 'M', beltId: 'negra', weight: 56.1, height: 170, dojoId: 'dojo-demo-2', modalities: ['kumite_ind'] },
  { id: 'demo-11', fullName: 'Bruno Silva Castro', birthDate: '2011-01-15', gender: 'M', beltId: 'cafe', weight: 54.8, height: 166, dojoId: 'dojo-demo-3', modalities: ['kumite_ind'] },
  { id: 'demo-12', fullName: 'Hugo Estrada Ponce', birthDate: '2011-09-02', gender: 'M', beltId: 'cafe', weight: 56.9, height: 171, dojoId: 'dojo-demo-4', modalities: ['kumite_ind'] },
];
