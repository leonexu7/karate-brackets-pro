import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Directorio de datos
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.resolve(dataDir, 'tournament_db.json');

// Estado inicial limpio
const defaultTournament = {
  id: 'torneo-oficial-2026',
  name: 'Copa Nacional de Karate Do 2026',
  date: '2026-10-24',
  venue: 'Gimnasio Olímpico Principal',
  tatamisCount: 3,
  organizer: 'Comité Organizador Oficial de Karate Do',
  adminKey: 'karate2026',
  feeSingleModality: 300,
  feeDoubleModality: 300,
  feeCoachBadge: 0,
};

function readDb() {
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(content);
      return {
        tournament: { ...defaultTournament, ...(data.tournament || {}) },
        dojos: data.dojos || [],
        athletes: (data.athletes || []).filter(a => a && a.id && !a.id.startsWith('demo-')),
        teams: data.teams || [],
      };
    } catch (e) {
      console.error('Error leyendo base de datos, usando datos limpios:', e);
    }
  }
  return {
    tournament: defaultTournament,
    dojos: [],
    athletes: [],
    teams: [],
  };
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error guardando en base de datos:', e);
    return false;
  }
}

// Inicializar si no existe
if (!fs.existsSync(dbPath)) {
  writeDb({
    tournament: defaultTournament,
    dojos: [],
    athletes: [],
    teams: [],
  });
}

// --- RUTAS DE API ---

// 1. Obtener estado completo del torneo
app.get('/api/tournament', (req, res) => {
  const data = readDb();
  res.json(data);
});

// 2. Registro remoto de un atleta por un profesor
app.post('/api/register-athlete', (req, res) => {
  const { athlete, dojoData } = req.body;
  if (!athlete || !athlete.fullName) {
    return res.status(400).json({ error: 'Datos de atleta incompletos' });
  }

  const db = readDb();
  let dojo = db.dojos.find(d => d.name.trim().toLowerCase() === (dojoData?.name || '').trim().toLowerCase());
  let dojoId = dojo ? dojo.id : null;

  if (!dojo && dojoData && dojoData.name) {
    dojoId = `dojo-${Date.now()}`;
    dojo = {
      id: dojoId,
      name: dojoData.name.trim(),
      sensei: dojoData.sensei?.trim() || '',
      city: dojoData.city?.trim() || '',
      phone: dojoData.phone?.trim() || '',
    };
    db.dojos.push(dojo);
  }

  const athleteWithDojo = {
    ...athlete,
    id: athlete.id || `ath-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    dojoId: dojoId || athlete.dojoId,
    registeredAt: new Date().toISOString(),
  };

  db.athletes.unshift(athleteWithDojo);
  writeDb(db);

  res.json({
    success: true,
    athlete: athleteWithDojo,
    dojo,
    totalAthletes: db.athletes.length,
  });
});

// 3. Registro remoto en lote (Excel o lista) por un profesor
app.post('/api/register-batch', (req, res) => {
  const { athletes, dojoData } = req.body;
  if (!Array.isArray(athletes) || athletes.length === 0) {
    return res.status(400).json({ error: 'Lista de atletas vacía' });
  }

  const db = readDb();
  let dojo = db.dojos.find(d => d.name.trim().toLowerCase() === (dojoData?.name || '').trim().toLowerCase());
  let dojoId = dojo ? dojo.id : null;

  if (!dojo && dojoData && dojoData.name) {
    dojoId = `dojo-${Date.now()}`;
    dojo = {
      id: dojoId,
      name: dojoData.name.trim(),
      sensei: dojoData.sensei?.trim() || '',
      city: dojoData.city?.trim() || '',
      phone: dojoData.phone?.trim() || '',
    };
    db.dojos.push(dojo);
  }

  const mapped = athletes.map((a, i) => ({
    ...a,
    id: a.id || `ath-batch-${Date.now()}-${i}`,
    dojoId: dojoId || a.dojoId,
    registeredAt: new Date().toISOString(),
  }));

  db.athletes = [...mapped, ...db.athletes];
  writeDb(db);

  res.json({
    success: true,
    addedCount: mapped.length,
    dojo,
    totalAthletes: db.athletes.length,
  });
});

// 4. Guardar ajustes del torneo o actualizar datos completos (Admin)
app.post('/api/save-state', (req, res) => {
  const newState = req.body;
  if (!newState || !newState.tournament) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const cleanAthletes = (newState.athletes || []).filter(a => a && a.id && !a.id.startsWith('demo-'));
  const toSave = {
    tournament: { ...defaultTournament, ...newState.tournament },
    dojos: newState.dojos || [],
    athletes: cleanAthletes,
    teams: newState.teams || [],
  };

  writeDb(toSave);
  res.json({ success: true, message: 'Torneo guardado en base de datos central' });
});

// 5. Vaciar a cero atletas
app.post('/api/reset-to-zero', (req, res) => {
  const db = readDb();
  const resetDb = {
    tournament: db.tournament,
    dojos: [],
    athletes: [],
    teams: [],
  };
  writeDb(resetDb);
  res.json({ success: true, message: 'Base de datos restablecida a 0' });
});

// Servir frontend compilado en producción si existe la carpeta dist
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🥋 Servidor de Karate Brackets Pro activo en http://localhost:${PORT}`);
  console.log(`🌐 Acceso en red local disponible en http://0.0.0.0:${PORT}`);
});
