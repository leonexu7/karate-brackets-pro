import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import TeacherRegistrationView from './components/TeacherRegistrationView';
import AdminLoginModal from './components/AdminLoginModal';
import AthleteList from './components/AthleteList';
import DojosView from './components/DojosView';
import BracketsView from './components/BracketsView';
import AthleteFormModal from './components/AthleteFormModal';
import BatchImportModal from './components/BatchImportModal';
import TournamentSettingsModal from './components/TournamentSettingsModal';
import TreasuryReportModal from './components/TreasuryReportModal';
import ShareRemoteLinkModal from './components/ShareRemoteLinkModal';
import CloudConfigModal from './components/CloudConfigModal';
import {
  isCloudConfigured,
  subscribeToCloudTournament,
  cloudRegisterAthlete,
  cloudRegisterBatch,
  cloudUpdateAthlete,
  cloudDeleteAthlete,
  cloudSaveTournamentSettings,
  cloudResetToZero
} from './services/firebase';
import { findMatchingDojo } from './utils/dojoHelper';
import {
  loadTournamentState,
  saveTournamentState,
  exportTournamentToFile,
  importTournamentFromFile,
  forcePurgeToZero,
  fetchRemoteTournamentState,
  remoteRegisterAthlete,
  remoteRegisterBatch,
  remoteSaveTournamentState,
  remoteResetToZero
} from './utils/storage';
import { groupAthletesIntoCategories } from './utils/autoClassifier';
import { buildTournamentBrackets } from './utils/bracketEngine';
import { generateFullTournamentPDF } from './utils/pdfGenerator';
import { INITIAL_TOURNAMENT, DEMO_ATHLETES, DEMO_DOJOS } from './constants/mockData';
import { ShitoKaiLogo } from './assets/shitoKaiLogo';

export default function App() {
  const [state, setState] = useState(() => {
    const loaded = loadTournamentState();
    // Asegurar 0 atletas si aún hubiera residuos
    const cleanAthletes = (loaded.athletes || []).filter(a =>
      a && a.id && !a.id.startsWith('demo-') && !a.id.startsWith('ath-')
    );
    return {
      ...loaded,
      athletes: cleanAthletes,
    };
  });

  // Estado de sesión de Administrador (Por defecto falso: vista exclusiva de maestros)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Pestañas activas para el Administrador ('brackets', 'athletes', 'dojos')
  const [activeTab, setActiveTab] = useState('brackets');

  // Modales
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Estado de conexión a la Nube (Google Firebase 24/7)
  const [isCloudActive, setIsCloudActive] = useState(() => isCloudConfigured());

  // Estado de generación masiva de PDF
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Guardar en localStorage cada vez que el estado cambie
  useEffect(() => {
    saveTournamentState(state);
  }, [state]);

  // Sincronización de datos: Firebase en la nube (24/7) o Servidor Local
  useEffect(() => {
    let isMounted = true;

    // Si la Nube Firebase está activa, escuchar en tiempo real con onSnapshot
    if (isCloudActive) {
      const unsubscribe = subscribeToCloudTournament(
        (cloudData) => {
          if (!isMounted || !cloudData) return;
          setState(prev => ({
            ...prev,
            tournament: cloudData.tournament ? { ...prev.tournament, ...cloudData.tournament } : prev.tournament,
            athletes: cloudData.athletes || prev.athletes,
            dojos: cloudData.dojos || prev.dojos,
          }));
        },
        (err) => {
          console.warn('Fallback de nube a local:', err);
        }
      );

      return () => {
        isMounted = false;
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }

    // Modo Servidor Local: polling cada 3.5 segundos
    const syncWithServer = async () => {
      const remote = await fetchRemoteTournamentState();
      if (!isMounted || !remote) return;

      setState(prev => {
        const remoteAthletes = (remote.athletes || []).filter(a => a && a.id && !a.id.startsWith('demo-'));
        const remoteDojos = remote.dojos || [];
        // Actualizar si hay diferencias en cantidad de atletas o dojos
        if (remoteAthletes.length !== prev.athletes.length || remoteDojos.length !== prev.dojos.length) {
          return {
            ...prev,
            tournament: remote.tournament || prev.tournament,
            dojos: remoteDojos,
            athletes: remoteAthletes,
            teams: remote.teams || prev.teams,
          };
        }
        return prev;
      });
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isCloudActive]);

  const dojosMap = useMemo(() => {
    const map = {};
    (state.dojos || []).forEach(d => { map[d.id] = d; });
    return map;
  }, [state.dojos]);

  // Agrupación automática en categorías
  const categoriesMap = useMemo(() => {
    return groupAthletesIntoCategories(state.athletes || [], state.tournament.date, dojosMap, {
      divideAdultsByWeight: state.tournament.divideAdultsByWeight ?? false,
      allowMixedInfant: state.tournament.allowMixedInfant ?? true,
    });
  }, [state.athletes, state.tournament.date, dojosMap, state.tournament.divideAdultsByWeight, state.tournament.allowMixedInfant]);

  // Generación automática de llaves
  const brackets = useMemo(() => {
    return buildTournamentBrackets(categoriesMap, state.tournament.tatamisCount || 3);
  }, [categoriesMap, state.tournament.tatamisCount]);

  const stats = useMemo(() => {
    const cuartetas = brackets.filter(b => b.type === 'cuarteta').length;
    const feeSingle = state.tournament?.feeSingleModality !== undefined ? state.tournament.feeSingleModality : 300;
    const feeDouble = state.tournament?.feeDoubleModality !== undefined ? state.tournament.feeDoubleModality : 300;
    const totalRevenue = (state.athletes || []).reduce((acc, a) => {
      const count = (a.modalities || []).length;
      return acc + (count >= 2 ? feeDouble : feeSingle);
    }, 0);

    return {
      totalAthletes: (state.athletes || []).length,
      totalDojos: (state.dojos || []).length,
      totalBrackets: brackets.length,
      totalCuartetas: cuartetas,
      totalRevenue,
    };
  }, [state.athletes, state.dojos, brackets, state.tournament]);

  // --- REGISTRO DESDE EL PORTAL DE MAESTROS ---
  const handleTeacherRegisterAthlete = async (athlete, dojoData) => {
    if (isCloudActive) {
      try {
        await cloudRegisterAthlete(athlete, dojoData);
      } catch (err) {
        console.warn('Error guardando en la Nube de Firebase:', err);
      }
    } else {
      try {
        await remoteRegisterAthlete(athlete, dojoData);
      } catch (err) {
        console.warn('Registro remoto offline/fallback:', err);
      }
    }

    setState(prev => {
      const existingDojo = findMatchingDojo(prev.dojos, dojoData.name);

      let dojoId = existingDojo ? existingDojo.id : null;
      let updatedDojos = [...prev.dojos];

      if (!existingDojo) {
        dojoId = `dojo-${Date.now()}`;
        updatedDojos.push({
          id: dojoId,
          name: dojoData.name.trim(),
          sensei: dojoData.sensei.trim(),
          city: dojoData.city.trim(),
          phone: dojoData.phone.trim(),
        });
      }

      const athleteWithDojo = {
        ...athlete,
        dojoId,
      };

      return {
        ...prev,
        dojos: updatedDojos,
        athletes: [athleteWithDojo, ...prev.athletes],
      };
    });
  };

  const handleTeacherRegisterBatch = async (athletesList, dojoData) => {
    if (isCloudActive) {
      try {
        await cloudRegisterBatch(athletesList, dojoData);
      } catch (err) {
        console.warn('Error guardando lote en la Nube de Firebase:', err);
      }
    } else {
      try {
        await remoteRegisterBatch(athletesList, dojoData);
      } catch (err) {
        console.warn('Registro masivo remoto offline/fallback:', err);
      }
    }

    setState(prev => {
      const existingDojo = findMatchingDojo(prev.dojos, dojoData.name);

      let dojoId = existingDojo ? existingDojo.id : null;
      let updatedDojos = [...prev.dojos];

      if (!existingDojo) {
        dojoId = `dojo-${Date.now()}`;
        updatedDojos.push({
          id: dojoId,
          name: dojoData.name.trim(),
          sensei: dojoData.sensei.trim(),
          city: dojoData.city.trim(),
          phone: dojoData.phone.trim(),
        });
      }

      const mappedAthletes = athletesList.map(a => ({
        ...a,
        dojoId,
      }));

      return {
        ...prev,
        dojos: updatedDojos,
        athletes: [...mappedAthletes, ...prev.athletes],
      };
    });
  };

  // --- Handlers de Edición y Gestión del Profesor ---
  const handleTeacherUpdateAthlete = async (updatedAthlete) => {
    if (isCloudActive) {
      try {
        await cloudUpdateAthlete(updatedAthlete);
      } catch (err) {
        console.warn('Error actualizando atleta en Firebase:', err);
      }
    }
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => a.id === updatedAthlete.id ? updatedAthlete : a),
    }));
  };

  const handleTeacherDeleteAthlete = async (athleteId) => {
    if (isCloudActive) {
      try {
        await cloudDeleteAthlete(athleteId);
      } catch (err) {
        console.warn('Error eliminando atleta en Firebase:', err);
      }
    }
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.filter(a => a.id !== athleteId),
    }));
  };

  // --- Handlers de Administración de Atletas ---
  const handleSaveAthlete = (athlete) => {
    setState(prev => {
      const exists = prev.athletes.some(a => a.id === athlete.id);
      const updated = exists
        ? prev.athletes.map(a => a.id === athlete.id ? athlete : a)
        : [athlete, ...prev.athletes];
      return { ...prev, athletes: updated };
    });
  };

  const handleDeleteAthlete = (id) => {
    if (window.confirm('¿Deseas eliminar a este competidor de la lista oficial?')) {
      setState(prev => ({
        ...prev,
        athletes: prev.athletes.filter(a => a.id !== id),
      }));
    }
  };

  const handleBatchImport = (newAthletes) => {
    setState(prev => ({
      ...prev,
      athletes: [...newAthletes, ...prev.athletes],
    }));
  };

  const handleQuickWeightUpdate = (athlete) => {
    const current = athlete.weight || '';
    const newWeightStr = window.prompt(`Registrar peso oficial en báscula para ${athlete.fullName} (kg):`, current);
    if (newWeightStr !== null) {
      const parsed = parseFloat(newWeightStr);
      if (!isNaN(parsed) && parsed > 0) {
        handleSaveAthlete({ ...athlete, weight: parsed });
      }
    }
  };

  // --- Handlers de Dojos ---
  const handleAddDojo = (dojo) => {
    setState(prev => ({ ...prev, dojos: [...prev.dojos, dojo] }));
  };

  const handleEditDojo = (dojo) => {
    setState(prev => ({
      ...prev,
      dojos: prev.dojos.map(d => d.id === dojo.id ? dojo : d),
    }));
  };

  const handleDeleteDojo = (id) => {
    if (window.confirm('¿Deseas eliminar este dojo? Los atletas permanecerán registrados.')) {
      setState(prev => ({
        ...prev,
        dojos: prev.dojos.filter(d => d.id !== id),
      }));
    }
  };

  // --- Handlers de Equipos ---
  const handleAddTeam = (team) => {
    setState(prev => ({ ...prev, teams: [...prev.teams, team] }));
  };

  const handleDeleteTeam = (id) => {
    setState(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));
  };

  // --- Generación completa de PDF ---
  const handleDownloadAllPDF = async () => {
    if (brackets.length === 0) return;
    setIsGeneratingPDF(true);
    setPdfProgress(0);

    try {
      await generateFullTournamentPDF(brackets, state.tournament, (progress) => {
        setPdfProgress(progress);
      });
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Ocurrió un error al generar el archivo PDF: ' + err.message);
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress(0);
    }
  };

  // --- Exportar / Importar JSON ---
  const handleExportJSON = () => {
    exportTournamentToFile(state);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importTournamentFromFile(file, (loadedData, error) => {
      if (error) {
        alert(error);
      } else if (loadedData) {
        setState(loadedData);
        alert('Torneo cargado exitosamente.');
      }
    });
    e.target.value = '';
  };

  // --- Vaciar a 0 absoluto ---
  const handleResetAllToZero = async () => {
    if (window.confirm('¿Estás seguro de vaciar a 0 atletas? Se limpiará toda la lista de competidores.')) {
      const fresh = forcePurgeToZero();
      if (isCloudActive) {
        try {
          await cloudResetToZero();
        } catch (err) {
          console.warn('Error purgando nube Firebase:', err);
        }
      } else {
        try {
          await remoteResetToZero();
        } catch (err) {
          console.warn('Error purgando servidor remoto:', err);
        }
      }
      setState(fresh);
      setIsSettingsModalOpen(false);
    }
  };

  const handleLoadDemoAthletes = () => {
    if (window.confirm('¿Cargar 12 atletas de prueba temporalmente para ver las gráficas?')) {
      setState(prev => ({
        ...prev,
        dojos: DEMO_DOJOS,
        athletes: DEMO_ATHLETES,
      }));
      setIsSettingsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Barra de Navegación Principal con Escudo Shito-Kai */}
      <Navbar
        tournament={state.tournament}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onNewAthlete={() => { setAthleteToEdit(null); setIsAthleteModalOpen(true); }}
        onBatchImport={() => setIsBatchModalOpen(true)}
        onDownloadAllPDF={handleDownloadAllPDF}
        isGeneratingPDF={isGeneratingPDF}
        pdfProgress={pdfProgress}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
        onOpenTreasury={() => setIsTreasuryModalOpen(true)}
        onOpenShareLink={() => setIsShareModalOpen(true)}
        isCloudConnected={isCloudActive}
        onOpenCloudConfig={() => setIsCloudModalOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {!isAdmin ? (
          /* MODO MAESTRO / PÚBLICO (No pueden ver otros dojos ni atletas de otros) */
          <TeacherRegistrationView
            tournament={state.tournament}
            onRegisterAthlete={handleTeacherRegisterAthlete}
            onRegisterBatchAthletes={handleTeacherRegisterBatch}
            onUpdateAthlete={handleTeacherUpdateAthlete}
            onDeleteAthlete={handleTeacherDeleteAthlete}
            allAthletes={state.athletes}
            allDojos={state.dojos}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        ) : (
          /* MODO ADMINISTRADOR (Panel completo con llaves, padrón general y ajustes) */
          <>
            {activeTab === 'brackets' && (
              <BracketsView
                brackets={brackets}
                tournament={state.tournament}
                onDownloadAllPDF={handleDownloadAllPDF}
                isGeneratingPDF={isGeneratingPDF}
                pdfProgress={pdfProgress}
              />
            )}

            {activeTab === 'athletes' && (
              <AthleteList
                athletes={state.athletes}
                dojos={state.dojos}
                tournamentDate={state.tournament.date}
                onEditAthlete={(ath) => { setAthleteToEdit(ath); setIsAthleteModalOpen(true); }}
                onDeleteAthlete={handleDeleteAthlete}
                onNewAthlete={() => { setAthleteToEdit(null); setIsAthleteModalOpen(true); }}
                onBatchImport={() => setIsBatchModalOpen(true)}
                onQuickWeightUpdate={handleQuickWeightUpdate}
              />
            )}

            {activeTab === 'dojos' && (
              <DojosView
                dojos={state.dojos}
                athletes={state.athletes}
                teams={state.teams}
                tournament={state.tournament}
                onAddDojo={handleAddDojo}
                onEditDojo={handleEditDojo}
                onDeleteDojo={handleDeleteDojo}
                onAddTeam={handleAddTeam}
                onDeleteTeam={handleDeleteTeam}
              />
            )}
          </>
        )}
      </main>

      {/* Pie de Página */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShitoKaiLogo className="w-5 h-5" />
            <span className="font-semibold text-slate-700">Shito-Kai Karate-Do</span>
            <span>• Sistema Oficial de Competencia</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Formato Horizontal WKF • Cuartetas Infantiles • Motor Anti-Clash</span>
            {!isAdmin ? (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-slate-600 hover:text-slate-900 font-semibold underline"
              >
                Panel de Administración
              </button>
            ) : (
              <span className="text-amber-700 font-medium">Sesión de Administrador Activa</span>
            )}
          </div>
        </div>
      </footer>

      {/* Modales */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('brackets');
        }}
        actualAdminKey={state.tournament.adminKey || 'karate2026'}
      />

      <AthleteFormModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        onSave={handleSaveAthlete}
        athleteToEdit={athleteToEdit}
        dojos={state.dojos}
        tournamentDate={state.tournament.date}
      />

      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImportAthletes={handleBatchImport}
        dojos={state.dojos}
      />

      <TournamentSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        tournament={state.tournament}
        onSaveTournament={(t) => {
          setState(prev => {
            const updated = { ...prev, tournament: t };
            if (isCloudActive) {
              cloudSaveTournamentSettings(t);
            } else {
              remoteSaveTournamentState(updated);
            }
            return updated;
          });
        }}
        onResetAllToZero={handleResetAllToZero}
        onLoadDemoAthletes={handleLoadDemoAthletes}
        onExportBackup={() => exportTournamentToFile(state)}
      />

      {/* Modal de Cobro y Tesorería por Dojos */}
      <TreasuryReportModal
        isOpen={isTreasuryModalOpen}
        onClose={() => setIsTreasuryModalOpen(false)}
        tournament={state.tournament}
        dojos={state.dojos}
        athletes={state.athletes}
      />

      {/* Modal de Enlace Remoto y Convocatoria para Profesores */}
      <ShareRemoteLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tournament={state.tournament}
      />

      {/* Modal de Configuración de la Nube (Google Firebase 24/7) */}
      <CloudConfigModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConfigChanged={(connected) => setIsCloudActive(connected)}
      />
    </div>
  );
}
