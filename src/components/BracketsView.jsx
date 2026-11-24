import React, { useState, useMemo } from 'react';
import { Trophy, Printer, Filter, Search, Award, ArrowDownUp, Shield, AlertCircle, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import CuartetaCard from './CuartetaCard';
import BracketCard from './BracketCard';
import { generateFullTournamentPDF } from '../utils/pdfGenerator';
import { getBracketAgeRank, countBracketPages } from '../utils/bracketEngine';
import PrintDispatcherModal from './PrintDispatcherModal';

export default function BracketsView({
  brackets,
  tournament,
  onDownloadAllPDF,
  isGeneratingPDF,
  pdfProgress,
  onOpenPrintDispatcher,
}) {
  const [filterTatami, setFilterTatami] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'cuarteta', 'standard'
  const [filterGender, setFilterGender] = useState('all'); // 'all', 'M', 'F', 'MIXTO'
  const [filterModality, setFilterModality] = useState('all'); // 'all', 'kata', 'kumite'
  const [sortOrder, setSortOrder] = useState('age_asc'); // 'age_asc', 'age_desc', 'name_asc', 'tatami'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de despacho de impresión interno
  const [isLocalDispatcherOpen, setIsLocalDispatcherOpen] = useState(false);

  // Paginación para alto rendimiento con más de 200 competidores
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [isGeneratingFilteredPDF, setIsGeneratingFilteredPDF] = useState(false);
  const [filteredPDFProgress, setFilteredPDFProgress] = useState(0);

  const filteredBrackets = useMemo(() => {
    const list = brackets.filter(b => {
      const matchTatami = filterTatami === 'all' || String(b.tatami) === String(filterTatami);
      const matchType = filterType === 'all'
        ? true
        : filterType === 'cuarteta'
          ? b.type === 'cuarteta'
          : b.type !== 'cuarteta';

      // Filtro por Rama / Sexo
      let matchGender = true;
      const bGender = b.gender || (b.categoryName.toUpperCase().includes('FEMENIL') ? 'F' : (b.categoryName.toUpperCase().includes('MIXTO') ? 'MIXTO' : 'M'));
      if (filterGender === 'M') {
        matchGender = bGender === 'M';
      } else if (filterGender === 'F') {
        matchGender = bGender === 'F';
      } else if (filterGender === 'MIXTO') {
        matchGender = bGender === 'MIXTO' || b.categoryName.toUpperCase().includes('MIXTO');
      }

      // Filtro por Modalidad (Kata / Kumite / Doble Modalidad / Solo Kumite / Solo Kata)
      let matchModality = true;
      const bProfile = b.modalityProfile || '';
      const bName = b.categoryName || '';
      if (filterModality === 'doble') {
        matchModality = bProfile === 'doble' || bName.includes('Doble Modalidad');
      } else if (filterModality === 'solo_kumite') {
        matchModality = bProfile === 'solo_kumite' || bName.includes('[SOLO KUMITE]');
      } else if (filterModality === 'solo_kata') {
        matchModality = bProfile === 'solo_kata' || bName.includes('[SOLO KATA]');
      } else if (filterModality === 'kata') {
        matchModality = bName.toLowerCase().includes('kata');
      } else if (filterModality === 'kumite') {
        matchModality = bName.toLowerCase().includes('kumite');
      }

      const matchSearch = b.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTatami && matchType && matchGender && matchModality && matchSearch;
    });

    // Ordenamiento dinámico
    return list.sort((a, b) => {
      if (sortOrder === 'age_asc') {
        const diff = getBracketAgeRank(a) - getBracketAgeRank(b);
        return diff !== 0 ? diff : a.categoryName.localeCompare(b.categoryName);
      }
      if (sortOrder === 'age_desc') {
        const diff = getBracketAgeRank(b) - getBracketAgeRank(a);
        return diff !== 0 ? diff : a.categoryName.localeCompare(b.categoryName);
      }
      if (sortOrder === 'tatami') {
        const diff = (a.tatami || 1) - (b.tatami || 1);
        return diff !== 0 ? diff : a.categoryName.localeCompare(b.categoryName);
      }
      return a.categoryName.localeCompare(b.categoryName);
    });
  }, [brackets, filterTatami, filterType, filterGender, filterModality, sortOrder, searchTerm]);

  const totalPages = Math.ceil(filteredBrackets.length / pageSize) || 1;
  const paginatedBrackets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrackets.slice(start, start + pageSize);
  }, [filteredBrackets, currentPage, pageSize]);

  const handleDownloadFilteredPDF = async () => {
    if (filteredBrackets.length === 0) return;
    setIsGeneratingFilteredPDF(true);
    setFilteredPDFProgress(0);
    try {
      await generateFullTournamentPDF(filteredBrackets, tournament, (p) => setFilteredPDFProgress(p));
    } finally {
      setIsGeneratingFilteredPDF(false);
      setFilteredPDFProgress(0);
    }
  };

  const cuartetasCount = brackets.filter(b => b.type === 'cuarteta').length;
  const standardCount = brackets.filter(b => b.type !== 'cuarteta').length;
  const totalPagesCount = useMemo(() => countBracketPages(brackets), [brackets]);

  return (
    <div className="space-y-6">
      {/* Banner de Estado y Control */}
      <div className="bg-white p-4 rounded-xl border border-tatami-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-tatami-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar categoría de gráfica..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-tatami-300 rounded-lg outline-hidden focus:ring-1 focus:ring-aka"
            />
          </div>

          {/* Ordenar por Edad / Categoría / Tatami */}
          <div className="flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5 text-tatami-500" />
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700 font-medium"
              title="Criterio de ordenamiento"
            >
              <option value="age_asc">Edad: Menor a Mayor (-5 años a Master)</option>
              <option value="age_desc">Edad: Mayor a Menor (Master a -5 años)</option>
              <option value="name_asc">Categoría: Alfabético A-Z</option>
              <option value="tatami">Área: Por número de Tatami</option>
            </select>
          </div>

          {/* Filtro Rama (Varonil / Femenil / Mixto) */}
          <select
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Todas las Ramas</option>
            <option value="M">Solo Varonil</option>
            <option value="F">Solo Femenil</option>
            <option value="MIXTO">Solo Mixto</option>
          </select>

          {/* Filtro Modalidad (Kata / Kumite / Doble / Especialistas) */}
          <select
            value={filterModality}
            onChange={(e) => { setFilterModality(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700 font-medium"
            title="Filtrar por perfil de modalidad"
          >
            <option value="all">Todas las Modalidades</option>
            <option value="doble">🥋 Doble Modalidad (Kata y Kumite)</option>
            <option value="solo_kumite">🥊 Solo Kumite (Combate)</option>
            <option value="solo_kata">🥋 Solo Kata (Formas)</option>
            <option value="kumite">Solo Kumite (General)</option>
            <option value="kata">Solo Kata (General)</option>
          </select>

          {/* Filtro Tatami */}
          <select
            value={filterTatami}
            onChange={(e) => { setFilterTatami(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Todos los Tatamis (1 a {tournament.tatamisCount})</option>
            {Array.from({ length: tournament.tatamisCount }, (_, i) => i + 1).map(num => (
              <option key={num} value={String(num)}>Tatami {num}</option>
            ))}
          </select>

          {/* Filtro Tipo de Gráfica */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Formato: Todos ({brackets.length})</option>
            <option value="cuarteta">Cuartetas Infantiles ({cuartetasCount})</option>
            <option value="standard">Gráficas Mayores ({standardCount})</option>
          </select>
        </div>

        {/* Botones de Descarga PDF y Despacho */}
        <div className="flex flex-wrap items-center gap-2">
          {filteredBrackets.length > 0 && filteredBrackets.length < brackets.length && (
            <button
              type="button"
              onClick={handleDownloadFilteredPDF}
              disabled={isGeneratingFilteredPDF || isGeneratingPDF}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Descargar en PDF únicamente las gráficas filtradas en pantalla"
            >
              <Printer className="w-4 h-4 text-rose-400" />
              <span>
                {isGeneratingFilteredPDF ? `Procesando (${filteredPDFProgress}%)...` : `Descargar Filtro (${filteredBrackets.length})`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenPrintDispatcher ? onOpenPrintDispatcher() : setIsLocalDispatcherOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            title="Abrir centro de despacho: Imprimir por turno (mañana/tarde), por tatami o anti-saturación"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Centro de Impresión y Despacho ({totalPagesCount} Hojas)</span>
          </button>
        </div>
      </div>

      {/* Rótulo explicativo de las Cuartetas Infantiles */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Regla Especial de Cuartetas para Categorías de -5 a 9 años activada:</strong>
          <span className="ml-1 text-amber-800">
            Cada cuarteta se imprime en <strong>1 hoja horizontal</strong> independiente y otorga 4 medallas al podio (1 Oro, 1 Plata, 2 Bronces). El peso en infantiles no genera divisiones extras, solo se usa para mantener equilibrio dentro del grupo.
          </span>
        </div>
      </div>

      {/* Lista de Gráficas */}
      {filteredBrackets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-tatami-200 text-tatami-400 space-y-2">
          <Trophy className="w-10 h-10 mx-auto text-tatami-300" />
          <h4 className="font-semibold text-tatami-700 text-sm">No hay gráficas para mostrar con los filtros actuales</h4>
          <p className="text-xs">Inscribe competidores o ajusta los criterios de búsqueda para ver las llaves de tatami.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedBrackets.map(bracket => (
            bracket.type === 'cuarteta' ? (
              <CuartetaCard
                key={bracket.id}
                cuarteta={bracket}
                tournament={tournament}
              />
            ) : (
              <BracketCard
                key={bracket.id}
                bracket={bracket}
                tournament={tournament}
              />
            )
          ))}

          {/* Barra de Paginación para alto volumen de gráficas */}
          {totalPages > 1 && (
            <div className="bg-white p-3.5 rounded-xl border border-tatami-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Mostrando gráficas <strong>{(currentPage - 1) * pageSize + 1}</strong> a <strong>{Math.min(currentPage * pageSize, filteredBrackets.length)}</strong> de <strong>{filteredBrackets.length}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  <span className="text-slate-500">Página</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Despacho e Impresión Rápida de Tatamis */}
      <PrintDispatcherModal
        isOpen={isLocalDispatcherOpen}
        onClose={() => setIsLocalDispatcherOpen(false)}
        brackets={brackets}
        tournament={tournament}
        filteredBrackets={filteredBrackets}
      />
    </div>
  );
}
