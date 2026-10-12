import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function tournamentApiPlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.resolve(dataDir, 'tournament_db.json');

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
        const raw = fs.readFileSync(dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          tournament: { ...defaultTournament, ...(parsed.tournament || {}) },
          dojos: parsed.dojos || [],
          athletes: (parsed.athletes || []).filter(a => a && a.id && !a.id.startsWith('demo-')),
          teams: parsed.teams || [],
        };
      } catch (e) {}
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
      return false;
    }
  }

  if (!fs.existsSync(dbPath)) {
    writeDb({ tournament: defaultTournament, dojos: [], athletes: [], teams: [] });
  }

  return {
    name: 'tournament-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // GET /api/tournament
        if (req.method === 'GET' && req.url === '/api/tournament') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(readDb()));
          return;
        }

        // POST /api/register-athlete
        if (req.method === 'POST' && req.url === '/api/register-athlete') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { athlete, dojoData } = JSON.parse(body);
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

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, athlete: athleteWithDojo, dojo, totalAthletes: db.athletes.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/register-batch
        if (req.method === 'POST' && req.url === '/api/register-batch') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { athletes, dojoData } = JSON.parse(body);
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

              const mapped = (athletes || []).map((a, i) => ({
                ...a,
                id: a.id || `ath-batch-${Date.now()}-${i}`,
                dojoId: dojoId || a.dojoId,
                registeredAt: new Date().toISOString(),
              }));

              db.athletes = [...mapped, ...db.athletes];
              writeDb(db);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, addedCount: mapped.length, dojo, totalAthletes: db.athletes.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/save-state (Admin)
        if (req.method === 'POST' && req.url === '/api/save-state') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newState = JSON.parse(body);
              const cleanAthletes = (newState.athletes || []).filter(a => a && a.id && !a.id.startsWith('demo-'));
              const toSave = {
                tournament: { ...defaultTournament, ...newState.tournament },
                dojos: newState.dojos || [],
                athletes: cleanAthletes,
                teams: newState.teams || [],
              };
              writeDb(toSave);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/reset-to-zero
        if (req.method === 'POST' && req.url === '/api/reset-to-zero') {
          const db = readDb();
          writeDb({
            tournament: db.tournament,
            dojos: [],
            athletes: [],
            teams: [],
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/karate-brackets-pro/' : '/',
  plugins: [react(), tournamentApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Accesible desde celulares y laptops en la red Wi-Fi o internet
  }
});
