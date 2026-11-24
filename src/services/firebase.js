import { initializeApp, getApps, getApp } from '@firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  getDocs,
  query
} from '@firebase/firestore';
import { normalizeDojoKey } from '../utils/dojoHelper.js';

const STORAGE_CONFIG_KEY = 'karate_firebase_cloud_config_v1';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBAv_Ofl7V497CO278BmyGruwPzPpQmaXY",
  authDomain: "torneo--de-karate.firebaseapp.com",
  projectId: "torneo--de-karate",
  storageBucket: "torneo--de-karate.firebasestorage.app",
  messagingSenderId: "439672085234",
  appId: "1:439672085234:web:c85cc9d8125c6c81248e6b",
  measurementId: "G-Y6X7R2245B"
};

// Obtener configuración desde localStorage, variables de entorno VITE o configuración por defecto
export function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (_) {}

  // Fallback a variables de entorno si existen
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // Configuración oficial activa del proyecto
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Error guardando configuración de Firebase:', err);
    return false;
  }
}

export function removeFirebaseConfig() {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
  } catch (_) {}
}

let firestoreInstance = null;
let firebaseAppInstance = null;

export function initFirebase() {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      firebaseAppInstance = initializeApp(config);
    } else {
      firebaseAppInstance = getApp();
    }
    firestoreInstance = getFirestore(firebaseAppInstance);
    return firestoreInstance;
  } catch (err) {
    console.error('Error inicializando Firebase:', err);
    return null;
  }
}

export function getDb() {
  if (!firestoreInstance) {
    return initFirebase();
  }
  return firestoreInstance;
}

export function isCloudConfigured() {
  const config = getStoredFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

// --- SUSCRIPCIÓN EN TIEMPO REAL (onSnapshot) ---
// Escucha cualquier cambio en la nube y actualiza la pantalla del admin al instante sin recargar
export function subscribeToCloudTournament(onDataReceived, onError) {
  const db = getDb();
  if (!db) return () => {};

  const tournamentDocRef = doc(db, 'tournaments', 'main_tournament');
  const athletesColRef = collection(db, 'tournaments', 'main_tournament', 'athletes');
  const dojosColRef = collection(db, 'tournaments', 'main_tournament', 'dojos');

  let currentTournament = null;
  let currentAthletes = [];
  let currentDojos = [];

  const notify = () => {
    onDataReceived({
      tournament: currentTournament,
      athletes: currentAthletes,
      dojos: currentDojos,
    });
  };

  // 1. Escuchar torneo base
  const unsubTournament = onSnapshot(tournamentDocRef, (snap) => {
    if (snap.exists()) {
      currentTournament = snap.data();
      notify();
    }
  }, (err) => {
    console.warn('Error escuchando torneo en la nube:', err);
    if (onError) onError(err);
  });

  // 2. Escuchar atletas
  const unsubAthletes = onSnapshot(athletesColRef, (snap) => {
    const list = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() });
    });
    // Descartar demos si hubiera
    currentAthletes = list.filter(a => a && a.id && !a.id.startsWith('demo-'));
    notify();
  }, (err) => {
    console.warn('Error escuchando atletas en la nube:', err);
    if (onError) onError(err);
  });

  // 3. Escuchar dojos
  const unsubDojos = onSnapshot(dojosColRef, (snap) => {
    const list = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() });
    });
    currentDojos = list;
    notify();
  }, (err) => {
    console.warn('Error escuchando dojos en la nube:', err);
    if (onError) onError(err);
  });

  // Función de desuscripción limpia
  return () => {
    unsubTournament();
    unsubAthletes();
    unsubDojos();
  };
}

// --- REGISTRAR 1 ATLETA EN LA NUBE ---
export async function cloudRegisterAthlete(athlete, dojoData) {
  const db = getDb();
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    // 1. Verificar o crear dojo
    const dojosCol = collection(db, 'tournaments', 'main_tournament', 'dojos');
    const dojosSnap = await getDocs(dojosCol);
    let dojoId = null;

    const targetDojoKey = normalizeDojoKey(dojoData.name);
    dojosSnap.forEach(d => {
      const data = d.data();
      if (data.name) {
        if (data.name.trim().toLowerCase() === dojoData.name.trim().toLowerCase() ||
            normalizeDojoKey(data.name) === targetDojoKey) {
          dojoId = d.id;
        }
      }
    });

    if (!dojoId) {
      dojoId = `dojo-${Date.now()}`;
      const newDojoRef = doc(db, 'tournaments', 'main_tournament', 'dojos', dojoId);
      batch.set(newDojoRef, {
        id: dojoId,
        name: dojoData.name.trim(),
        sensei: dojoData.sensei.trim(),
        city: (dojoData.city || '').trim(),
        phone: (dojoData.phone || '').trim(),
        registeredAt: new Date().toISOString(),
      });
    }

    // 2. Crear atleta
    const athleteId = athlete.id || `ath-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const athleteRef = doc(db, 'tournaments', 'main_tournament', 'athletes', athleteId);

    const athleteToSave = {
      ...athlete,
      id: athleteId,
      dojoId,
      registeredAt: new Date().toISOString(),
    };

    batch.set(athleteRef, athleteToSave);

    await batch.commit();
    return { success: true, athlete: athleteToSave, dojoId };
  } catch (err) {
    console.error('Error registrando atleta en Firebase:', err);
    throw err;
  }
}

// --- REGISTRAR LOTE DE ATLETAS EN LA NUBE (Excel / Lote) ---
export async function cloudRegisterBatch(athletesList, dojoData) {
  const db = getDb();
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    // 1. Verificar o crear dojo con normalización inteligente
    const dojosCol = collection(db, 'tournaments', 'main_tournament', 'dojos');
    const dojosSnap = await getDocs(dojosCol);
    let dojoId = null;

    const targetDojoKey = normalizeDojoKey(dojoData.name);
    dojosSnap.forEach(d => {
      const data = d.data();
      if (data.name) {
        if (data.name.trim().toLowerCase() === dojoData.name.trim().toLowerCase() ||
            normalizeDojoKey(data.name) === targetDojoKey) {
          dojoId = d.id;
        }
      }
    });

    if (!dojoId) {
      dojoId = `dojo-${Date.now()}`;
      const newDojoRef = doc(db, 'tournaments', 'main_tournament', 'dojos', dojoId);
      batch.set(newDojoRef, {
        id: dojoId,
        name: dojoData.name.trim(),
        sensei: dojoData.sensei.trim(),
        city: (dojoData.city || '').trim(),
        phone: (dojoData.phone || '').trim(),
        registeredAt: new Date().toISOString(),
      });
    }

    // 2. Guardar cada atleta del lote
    athletesList.forEach((a, idx) => {
      const athleteId = a.id || `ath-xl-${Date.now()}-${idx}`;
      const athRef = doc(db, 'tournaments', 'main_tournament', 'athletes', athleteId);
      batch.set(athRef, {
        ...a,
        id: athleteId,
        dojoId,
        registeredAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    return { success: true, count: athletesList.length, dojoId };
  } catch (err) {
    console.error('Error registrando lote en Firebase:', err);
    throw err;
  }
}

// --- ACTUALIZAR ATLETA EN LA NUBE (Edición de Profesor o Admin) ---
export async function cloudUpdateAthlete(athlete) {
  const db = getDb();
  if (!db || !athlete?.id) return false;

  try {
    const athleteRef = doc(db, 'tournaments', 'main_tournament', 'athletes', athlete.id);
    await setDoc(athleteRef, athlete, { merge: true });
    return true;
  } catch (err) {
    console.error('Error actualizando atleta en Firebase:', err);
    throw err;
  }
}

// --- ELIMINAR ATLETA EN LA NUBE ---
export async function cloudDeleteAthlete(athleteId) {
  const db = getDb();
  if (!db || !athleteId) return false;

  try {
    const athleteRef = doc(db, 'tournaments', 'main_tournament', 'athletes', athleteId);
    await deleteDoc(athleteRef);
    return true;
  } catch (err) {
    console.error('Error eliminando atleta en Firebase:', err);
    throw err;
  }
}

// --- GUARDAR O ACTUALIZAR DOJO EN LA NUBE ---
export async function cloudSaveDojo(dojo) {
  const db = getDb();
  if (!db || !dojo?.id) return false;

  try {
    const dojoRef = doc(db, 'tournaments', 'main_tournament', 'dojos', dojo.id);
    await setDoc(dojoRef, {
      ...dojo,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error guardando dojo en Firebase:', err);
    return false;
  }
}

// --- ELIMINAR DOJO EN LA NUBE ---
export async function cloudDeleteDojo(dojoId) {
  const db = getDb();
  if (!db || !dojoId) return false;

  try {
    const dojoRef = doc(db, 'tournaments', 'main_tournament', 'dojos', dojoId);
    await deleteDoc(dojoRef);
    return true;
  } catch (err) {
    console.error('Error eliminando dojo en Firebase:', err);
    return false;
  }
}

// --- GUARDAR AJUSTES DEL TORNEO EN LA NUBE ---
export async function cloudSaveTournamentSettings(tournament) {
  const db = getDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'tournaments', 'main_tournament');
    await setDoc(docRef, tournament, { merge: true });
    return true;
  } catch (err) {
    console.error('Error guardando ajustes en Firebase:', err);
    return false;
  }
}

// --- PURGAR MEDIANTE REST API (Fallback de emergencia si falla el SDK) ---
export async function restApiResetToZero() {
  const config = getStoredFirebaseConfig() || DEFAULT_FIREBASE_CONFIG;
  const projectId = config.projectId;
  if (!projectId) return { success: false, totalDeleted: 0 };

  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tournaments/main_tournament`;
  let totalDeleted = 0;

  for (const col of ['athletes', 'dojos', 'teams']) {
    try {
      const res = await fetch(`${baseUrl}/${col}?pageSize=300`);
      if (res.ok) {
        const data = await res.json();
        const documents = data.documents || [];
        const deletePromises = documents.map(d =>
          fetch(`https://firestore.googleapis.com/v1/${d.name}`, { method: 'DELETE' })
            .then(r => { if (r.ok) totalDeleted++; })
            .catch(() => {})
        );
        await Promise.all(deletePromises);
      }
    } catch (err) {
      console.warn(`Error en restApiResetToZero para ${col}:`, err);
    }
  }

  return { success: true, totalDeleted };
}

// --- PURGAR A CERO EN LA NUBE (Elimina atletas, dojos y equipos en lotes seguros) ---
export async function cloudResetToZero() {
  const db = getDb();
  let deletedAthletes = 0;
  let deletedDojos = 0;
  let deletedTeams = 0;

  if (db) {
    try {
      // 1. Obtener y borrar atletas en lotes de máximo 100 docs
      const athletesCol = collection(db, 'tournaments', 'main_tournament', 'athletes');
      const athSnap = await getDocs(athletesCol);
      deletedAthletes = athSnap.size;
      const athDocs = athSnap.docs;
      for (let i = 0; i < athDocs.length; i += 100) {
        const batch = writeBatch(db);
        athDocs.slice(i, i + 100).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      // 2. Obtener y borrar dojos en lotes de máximo 100 docs
      const dojosCol = collection(db, 'tournaments', 'main_tournament', 'dojos');
      const dojosSnap = await getDocs(dojosCol);
      deletedDojos = dojosSnap.size;
      const dojoDocs = dojosSnap.docs;
      for (let i = 0; i < dojoDocs.length; i += 100) {
        const batch = writeBatch(db);
        dojoDocs.slice(i, i + 100).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      // 3. Obtener y borrar equipos (si existen)
      try {
        const teamsCol = collection(db, 'tournaments', 'main_tournament', 'teams');
        const teamsSnap = await getDocs(teamsCol);
        deletedTeams = teamsSnap.size;
        const teamDocs = teamsSnap.docs;
        for (let i = 0; i < teamDocs.length; i += 100) {
          const batch = writeBatch(db);
          teamDocs.slice(i, i + 100).forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (_) {}

      // 4. Reiniciar documento base del torneo
      try {
        const mainDoc = doc(db, 'tournaments', 'main_tournament');
        await setDoc(mainDoc, {
          isCleanZero: true,
          purgedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (_) {}

      return {
        success: true,
        deletedAthletes,
        deletedDojos,
        deletedTeams,
        method: 'sdk',
      };
    } catch (err) {
      console.warn('Fallo método SDK en cloudResetToZero, ejecutando fallback REST:', err);
    }
  }

  // Fallback REST API
  try {
    const restRes = await restApiResetToZero();
    return {
      success: true,
      deletedAthletes: restRes.totalDeleted,
      deletedDojos: 0,
      deletedTeams: 0,
      method: 'rest',
    };
  } catch (err) {
    console.error('Error total purgando base de datos en Firebase:', err);
    return { success: false, error: err.message };
  }
}
