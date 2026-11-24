import { initializeApp } from '@firebase/app';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  writeBatch
} from '@firebase/firestore';
import { KYUS, getKyuInfo, getKyuCategoryInfo } from '../src/constants/belts.js';

const config = {
  apiKey: 'AIzaSyBAv_Ofl7V497CO278BmyGruwPzPpQmaXY',
  authDomain: 'torneo--de-karate.firebaseapp.com',
  projectId: 'torneo--de-karate',
  storageBucket: 'torneo--de-karate.firebasestorage.app',
  messagingSenderId: '439672085234',
  appId: '1:439672085234:web:c85cc9d8125c6c81248e6b'
};

const app = initializeApp(config);
const db = getFirestore(app);

console.log('--- INICIANDO CARGA DIRECTA DE 220 COMPETIDORES A FIREBASE ---');

const DOJOS = [
  { id: 'dojo_1', name: 'Shito-Kai Honbu', sensei: 'Akira Tanaka', city: 'Puebla', phone: '222 100 1001', quota: 35 },
  { id: 'dojo_2', name: 'Kobukan Karate Do', sensei: 'Carlos Morales', city: 'Tehuacán', phone: '238 100 2002', quota: 28 },
  { id: 'dojo_3', name: 'Bushido Ryu', sensei: 'Fernando Ruiz', city: 'Orizaba', phone: '272 100 3003', quota: 25 },
  { id: 'dojo_4', name: 'Kenseikan Cholula', sensei: 'Mariana Gómez', city: 'Cholula', phone: '222 100 4004', quota: 22 },
  { id: 'dojo_5', name: 'Hayashi-Ha Atlixco', sensei: 'Javier López', city: 'Atlixco', phone: '244 100 5005', quota: 20 },
  { id: 'dojo_6', name: 'Renbukan CDMX', sensei: 'Daniel Soto', city: 'CDMX', phone: '551 100 6006', quota: 20 },
  { id: 'dojo_7', name: 'Seishin Kai', sensei: 'Laura Méndez', city: 'Tlaxcala', phone: '246 100 7007', quota: 18 },
  { id: 'dojo_8', name: 'Shindo Kan', sensei: 'Rodrigo Pérez', city: 'Veracruz', phone: '229 100 8008', quota: 18 },
  { id: 'dojo_9', name: 'Itosu Kai', sensei: 'Gabriela Cruz', city: 'Córdoba', phone: '271 100 9009', quota: 18 },
  { id: 'dojo_10', name: 'Kenyu Ryu', sensei: 'Miguel Ortiz', city: 'Pachuca', phone: '771 101 0010', quota: 16 },
];

const FIRST_NAMES_M = ['Mateo', 'Santiago', 'Leonardo', 'Emiliano', 'Diego', 'Daniel', 'Alejandro', 'Manuel', 'Joaquín', 'Sebastián', 'Nicolás', 'Gabriel', 'Samuel', 'Ángel', 'David', 'Lucas', 'Rodrigo', 'Maximiliano', 'Iker', 'Carlos', 'Eduardo', 'Jorge', 'Javier', 'Rafael', 'Emilio'];
const FIRST_NAMES_F = ['Sofía', 'Valentina', 'Regina', 'Camila', 'Valeria', 'Ximena', 'María José', 'Victoria', 'Renata', 'Natalia', 'Daniela', 'Fernanda', 'Jimena', 'Andrea', 'Mariana', 'Guadalupe', 'Elena', 'Romina', 'Sara', 'Lucía', 'Paula', 'Carolina', 'Alexa', 'Monserrat'];
const LAST_NAMES = ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez', 'Jiménez', 'Reyes', 'Díaz', 'Torres', 'Gutiérrez', 'Ruiz', 'Mendoza', 'Aguilar', 'Méndez', 'Moreno', 'Castillo', 'Álvarez', 'Romero', 'Juárez'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // 1. Limpiar colección previa de atletas y dojos para garantizar estado perfecto
  console.log('1. Verificando colecciones actuales en Firebase...');
  const athletesColRef = collection(db, 'tournaments', 'main_tournament', 'athletes');
  const dojosColRef = collection(db, 'tournaments', 'main_tournament', 'dojos');

  const athletesSnap = await getDocs(athletesColRef);
  const dojosSnap = await getDocs(dojosColRef);

  console.log(`   Se encontraron ${athletesSnap.size} atletas y ${dojosSnap.size} dojos anteriores.`);

  if (athletesSnap.size > 0 || dojosSnap.size > 0) {
    console.log('   Limpiando datos antiguos...');
    let cleanBatch = writeBatch(db);
    let count = 0;

    for (const d of athletesSnap.docs) {
      cleanBatch.delete(d.ref);
      count++;
      if (count % 400 === 0) {
        await cleanBatch.commit();
        cleanBatch = writeBatch(db);
      }
    }

    for (const d of dojosSnap.docs) {
      cleanBatch.delete(d.ref);
      count++;
      if (count % 400 === 0) {
        await cleanBatch.commit();
        cleanBatch = writeBatch(db);
      }
    }

    await cleanBatch.commit();
    console.log('   ✓ Colecciones limpiadas.');
  }

  // 2. Subir los 10 Dojos oficiales
  console.log('2. Guardando los 10 Dojos oficiales en Firebase...');
  const dojoBatch = writeBatch(db);
  DOJOS.forEach(d => {
    const dojoRef = doc(db, 'tournaments', 'main_tournament', 'dojos', d.id);
    dojoBatch.set(dojoRef, {
      id: d.id,
      name: d.name,
      sensei: d.sensei,
      city: d.city,
      phone: d.phone,
      registeredAt: new Date().toISOString(),
    });
  });
  await dojoBatch.commit();
  console.log('   ✓ 10 Dojos guardados en Firebase.');

  // 3. Generar y subir los 220 Atletas
  console.log('3. Generando los 220 competidores con edades, grados Kyu, estaturas y pesos...');
  const athletes = [];
  let athIdCounter = 1;

  DOJOS.forEach(dojo => {
    for (let i = 0; i < dojo.quota; i++) {
      const isFemale = Math.random() < 0.45;
      const firstName = isFemale ? getRandomElem(FIRST_NAMES_F) : getRandomElem(FIRST_NAMES_M);
      const lastName1 = getRandomElem(LAST_NAMES);
      const lastName2 = getRandomElem(LAST_NAMES);
      const fullName = `${firstName} ${lastName1} ${lastName2}`;

      // Distribución por edades
      const roll = Math.random();
      let age;
      if (roll < 0.15) age = getRandomInt(4, 5);
      else if (roll < 0.25) age = getRandomInt(6, 7);
      else if (roll < 0.35) age = getRandomInt(8, 9);
      else if (roll < 0.50) age = getRandomInt(10, 11);
      else if (roll < 0.65) age = getRandomInt(12, 13);
      else if (roll < 0.80) age = getRandomInt(14, 15);
      else if (roll < 0.90) age = getRandomInt(16, 17);
      else age = getRandomInt(18, 28);

      const birthYear = 2026 - age;
      const birthMonth = String(getRandomInt(1, 12)).padStart(2, '0');
      const birthDay = String(getRandomInt(1, 28)).padStart(2, '0');
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

      let height = null;
      let weight = null;
      if (age <= 5) {
        height = getRandomInt(95, 112);
        weight = getRandomInt(16, 22);
      } else if (age <= 7) {
        height = getRandomInt(110, 126);
        weight = getRandomInt(19, 27);
      } else if (age <= 9) {
        height = getRandomInt(122, 140);
        weight = getRandomInt(24, 36);
      } else if (age <= 11) {
        height = getRandomInt(135, 152);
        weight = getRandomInt(30, 46);
      } else if (age <= 13) {
        height = getRandomInt(145, 166);
        weight = getRandomInt(38, 58);
      } else if (age <= 15) {
        height = getRandomInt(155, 176);
        weight = getRandomInt(46, 72);
      } else {
        height = getRandomInt(160, 185);
        weight = getRandomInt(54, 86);
      }

      // Modalidades
      const modRoll = Math.random();
      let modalities = ['kumite_ind', 'kata_ind'];
      if (modRoll < 0.18) modalities = ['kumite_ind'];
      else if (modRoll < 0.32) modalities = ['kata_ind'];

      const kyuObj = getRandomElem(KYUS);
      const catInfo = getKyuCategoryInfo(kyuObj.naturalCategory);

      athletes.push({
        id: `real-ath-${String(athIdCounter++).padStart(3, '0')}`,
        fullName,
        birthDate,
        gender: isFemale ? 'F' : 'M',
        beltId: kyuObj.id,
        kyuName: kyuObj.name,
        competingCategory: kyuObj.naturalCategory,
        competingCategoryName: catInfo.name,
        weight,
        height,
        modalities,
        dojoId: dojo.id,
        dojoName: dojo.name,
        sensei: dojo.sensei,
        city: dojo.city,
        phone: dojo.phone,
        registeredVia: 'teacher_portal',
        registeredAt: new Date().toISOString(),
      });
    }
  });

  console.log(`   Preparados ${athletes.length} atletas para subir a Firebase...`);

  // Subir en batches de 150 atletas (límite de Firestore es 500)
  const batchSize = 150;
  for (let i = 0; i < athletes.length; i += batchSize) {
    const chunk = athletes.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(ath => {
      const athleteRef = doc(db, 'tournaments', 'main_tournament', 'athletes', ath.id);
      batch.set(athleteRef, ath);
    });
    await batch.commit();
    console.log(`   ✓ Lote de ${chunk.length} atletas subido exitosamente (${i + chunk.length}/${athletes.length})`);
  }

  // 4. Actualizar el documento de torneo con la fecha y tatamis
  const tournamentDocRef = doc(db, 'tournaments', 'main_tournament');
  const tBatch = writeBatch(db);
  tBatch.set(tournamentDocRef, {
    name: 'TORNEO NACIONAL DE KARATE DO SHITO-KAI MÉXICO',
    date: '2026-11-28',
    venue: 'Gimnasio Miguel Hidalgo, Puebla',
    organizer: 'Shito-Kai México',
    tatamisCount: 4,
    divideAdultsByWeight: true,
    feeSingleModality: 300,
    feeDoubleModality: 300,
    bannerBadgeText: 'Shito-Kai México',
    navbarBadgeText: 'SHITO-KAI',
    badgeBgColor: '#FFF1F2',
    badgeBorderColor: '#FECDD3',
    badgeTextColor: '#BE123C',
    badgeNavbarBgColor: 'rgba(76, 5, 25, 0.8)',
    badgeNavbarTextColor: '#FDA4AF',
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  await tBatch.commit();

  console.log('--- ¡ÉXITO TOTAL! 220 ATLETAS Y 10 DOJOS SUBIDOS A FIREBASE EN LA NUBE ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Error fatal al sembrar Firebase:', err);
  process.exit(1);
});
