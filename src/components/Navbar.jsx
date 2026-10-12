import React from 'react';
import { Trophy, Users, Shield, Calendar, MapPin, Printer, Download, Upload, Plus, FileSpreadsheet, Lock, LogOut, Settings, Coins, Share2, Cloud } from 'lucide-react';
import { ShitoKaiLogo } from '../assets/shitoKaiLogo';
import { CherryBlossomBranch } from '../assets/cherryBlossom';

export default function Navbar({
  tournament,
  isAdmin,
  activeTab,
  setActiveTab,
  stats,
  onNewAthlete,
  onBatchImport,
  onDownloadAllPDF,
  isGeneratingPDF,
  pdfProgress,
  onExportJSON,
  onImportJSON,
  onOpenSettings,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenShareLink,
  onOpenTreasury,
  isCloudConnected,
  onOpenCloudConfig,
}) {
  return (
    <header className="bg-white border-b border-tatami-200 sticky top-0 z-40 shadow-xs relative">
      {/* Sutil rama de cerezo zen de fondo a la derecha */}
      <div className="absolute right-0 top-0 overflow-hidden h-full pointer-events-none opacity-35 hidden md:block">
        <CherryBlossomBranch className="w-56 h-14" />
      </div>

      {/* Barra superior con identidad marcial y escudo Shito-Kai */}
      <div className="bg-slate-900 text-white px-4 py-2 border-b-2 border-rose-500 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center space-x-3">
          {/* Escudo oficial de Shito-Kai (chico, discreto, en la parte superior izquierda) */}
          <ShitoKaiLogo className="w-8 h-8 drop-shadow-xs" />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-white">{tournament.name}</span>
              <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/60 px-1.5 py-0.2 rounded font-serif">
                SHITO-KAI
              </span>
              {isAdmin ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Modo Administrador
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.2 rounded-full">
                  Portal de Maestros
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-[11px] mt-0.5">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {tournament.date}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {tournament.venue}</span>
              {isAdmin && (
                <span className="text-amber-400 font-medium">Tatamis: {tournament.tatamisCount} Áreas</span>
              )}
            </div>
          </div>
        </div>

        {/* Métricas y Estado */}
        <div className="flex items-center gap-3 text-xs">
          {isAdmin ? (
            <>
              <div className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span><strong className="text-white">{stats.totalAthletes}</strong> Atletas</span>
              </div>
              <div className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span><strong className="text-white">{stats.totalDojos}</strong> Dojos</span>
              </div>
              <div className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span><strong className="text-white">{stats.totalBrackets}</strong> Gráficas</span>
              </div>
              <button
                type="button"
                onClick={onOpenTreasury}
                className="bg-emerald-950/80 hover:bg-emerald-900 px-2.5 py-1 rounded border border-emerald-700/60 flex items-center gap-1.5 text-emerald-300 transition-colors cursor-pointer"
                title="Ver estado de cobranza y tesorería por dojos"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span><strong className="text-white">${stats.totalRevenue ? stats.totalRevenue.toLocaleString('es-MX') : 0}</strong> MXN</span>
              </button>
              <button
                type="button"
                onClick={onOpenCloudConfig}
                className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                  isCloudConnected
                    ? 'bg-sky-950/80 hover:bg-sky-900 border-sky-600/70 text-sky-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title={isCloudConnected ? "Base de datos en la Nube Activa (24/7 sin laptop)" : "Conectar Nube Firebase 24/7"}
              >
                <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{isCloudConnected ? 'Nube 24/7' : 'Conectar Nube'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenShareLink}
                className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Compartir enlace de inscripción para maestros"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartir Enlace</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="Cerrar panel de administración"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenShareLink}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Compartir enlace de inscripción con otros profesores"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Compartir Enlace</span>
              </button>
              <button
                onClick={onOpenAdminLogin}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs border border-slate-600 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Acceso Administrador</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Navegación del Administrador */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('brackets')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'brackets'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Gráficas de Tatami</span>
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                {stats.totalBrackets}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('athletes')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'athletes'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-sky-600" />
              <span>Padrón General de Atletas</span>
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                {stats.totalAthletes}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dojos')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'dojos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Dojos y Equipos</span>
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                {stats.totalDojos}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className="px-2.5 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
              title="Solo el organizador puede modificar las fechas y áreas"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Modificar Fechas / Ajustes</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewAthlete}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Inscribir Atleta</span>
            </button>

            <button
              onClick={onBatchImport}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-300 flex items-center gap-1.5 transition-colors"
              title="Importar lista"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Carga Masiva</span>
            </button>

            <button
              onClick={onExportJSON}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200"
              title="Guardar Respaldo en Archivo JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer"
              title="Cargar Torneo desde Archivo JSON"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
            </label>

            {/* BOTÓN MAESTRO: COLOR SUAVE Y ATRACTIVO (Coral suave, no vino) */}
            <button
              onClick={onDownloadAllPDF}
              disabled={isGeneratingPDF || stats.totalBrackets === 0}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                {isGeneratingPDF ? `Generando (${pdfProgress}%)...` : 'Imprimir Todo en PDF'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
