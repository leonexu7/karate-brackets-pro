import { INITIAL_TOURNAMENT } from '../constants/mockData';

// Clave definitiva limpia v3
const STORAGE_KEY = 'karate_brackets_clean_zero_v3';

export function loadTournamentState() {
  try {
    // Limpiar claves viejas del navegador que puedan contener atletas demo
    try {
      localStorage.removeItem('karate_brackets_pro_v1');
      localStorage.removeItem('karate_brackets_pro_v2');
    } catch (_) {}

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const freshState = {
        tournament: INITIAL_TOURNAMENT,
        dojos: [],
        athletes: [],
        teams: [],
        bracketResults: {},
        isCleanZero: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      return freshState;
    }

    const parsed = JSON.parse(raw);
    // Asegurar que si quedaron atletas con IDs de demo, se descarten
    const cleanAthletes = (parsed.athletes || []).filter(a =>
      a && a.id && !a.id.startsWith('demo-') && !a.id.startsWith('ath-')
    );

    const tournamentData = {
      ...INITIAL_TOURNAMENT,
      ...(parsed.tournament || {}),
      feeSingleModality: parsed.tournament?.feeSingleModality ?? 300,
      feeDoubleModality: parsed.tournament?.feeDoubleModality ?? 300,
      divideAdultsByWeight: parsed.tournament?.divideAdultsByWeight ?? false,
      allowMixedInfant: parsed.tournament?.allowMixedInfant ?? true,
    };

    return {
      tournament: tournamentData,
      dojos: parsed.dojos || [],
      athletes: cleanAthletes,
      teams: parsed.teams || [],
      bracketResults: parsed.bracketResults || {},
      isCleanZero: true,
    };
  } catch (err) {
    console.error('Error cargando datos de localStorage:', err);
    return {
      tournament: INITIAL_TOURNAMENT,
      dojos: [],
      athletes: [],
      teams: [],
      bracketResults: {},
      isCleanZero: true,
    };
  }
}

export function saveTournamentState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

export function forcePurgeToZero() {
  try {
    localStorage.clear();
    const freshState = {
      tournament: INITIAL_TOURNAMENT,
      dojos: [],
      athletes: [],
      teams: [],
      bracketResults: {},
      isCleanZero: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    return freshState;
  } catch (err) {
    console.error('Error purgando a cero:', err);
  }
}

export function exportTournamentToFile(state) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `Torneo_ShitoKai_${(state.tournament?.name || 'evento').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importTournamentFromFile(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.tournament && Array.isArray(parsed.athletes)) {
        saveTournamentState(parsed);
        onLoaded(parsed, null);
      } else {
        onLoaded(null, 'El archivo no contiene un formato de torneo válido.');
      }
    } catch (err) {
      onLoaded(null, 'Error al procesar el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// --- SINCRONIZACIÓN REMOTA CENTRAL (Para inscripciones remotas por enlace) ---

export async function fetchRemoteTournamentState() {
  try {
    const res = await fetch('/api/tournament');
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}
  return null;
}

export async function remoteRegisterAthlete(athlete, dojoData) {
  try {
    const res = await fetch('/api/register-athlete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete, dojoData }),
    });
    if (res.ok) return await res.json();
  } catch (_) {}
  return null;
}

export async function remoteRegisterBatch(athletes, dojoData) {
  try {
    const res = await fetch('/api/register-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athletes, dojoData }),
    });
    if (res.ok) return await res.json();
  } catch (_) {}
  return null;
}

export async function remoteSaveTournamentState(state) {
  try {
    const res = await fetch('/api/save-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.ok) return true;
  } catch (_) {}
  return false;
}

export async function remoteResetToZero() {
  try {
    const res = await fetch('/api/reset-to-zero', { method: 'POST' });
    if (res.ok) return true;
  } catch (_) {}
  return false;
}
