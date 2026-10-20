import React, { useState, useMemo } from 'react';
import { Trophy, Printer, Filter, Search, Award, ArrowDownUp, Shield, AlertCircle } from 'lucide-react';
import CuartetaCard from './CuartetaCard';
import BracketCard from './BracketCard';

function getBracketAgeRank(b) {
  const name = (b.categoryName || '').toLowerCase();
  const key = (b.categoryKey || '').toLowerCase();
  if (name.includes('-5') || key.includes('u5')) return 5;
  if (name.includes('6-7') || key.includes('6-7')) return 7;
  if (name.includes('8-9') || key.includes('8-9')) return 9;
  if (name.includes('10-11') || key.includes('10-11')) return 11;
  if (name.includes('12-13') || key.includes('12-13')) return 13;
  if (name.includes('14-15') || key.includes('14-15')) return 15;
  if (name.includes('16-17') || key.includes('16-17')) return 17;
  if (name.includes('18-20') || key.includes('18-20') || key.includes('u21')) return 20;
  if (name.includes('senior') || name.includes('+18') || key.includes('senior')) return 25;
  if (name.includes('+35') || key.includes('master35')) return 35;
  if (name.includes('+45') || key.includes('master45')) return 45;
  return 15;
}

export default function BracketsView({
  brackets,
  tournament,
  onDownloadAllPDF,
  isGeneratingPDF,
  pdfProgress,
}) {
  const [filterTatami, setFilterTatami] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'cuarteta', 'standard'
  const [filterGender, setFilterGender] = useState('all'); // 'all', 'M', 'F', 'MIXTO'
  const [filterModality, setFilterModality] = useState('all'); // 'all', 'kata', 'kumite'
  const [sortOrder, setSortOrder] = useState('age_asc'); // 'age_asc', 'age_desc', 'name_asc', 'tatami'
  const [searchTerm, setSearchTerm] = useState('');

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

      // Filtro por Modalidad (Kata / Kumite)
      let matchModality = true;
      if (filterModality === 'kata') {
        matchModality = b.categoryName.toLowerCase().includes('kata');
      } else if (filterModality === 'kumite') {
        matchModality = b.categoryName.toLowerCase().includes('kumite');
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

  const cuartetasCount = brackets.filter(b => b.type === 'cuarteta').length;
  const standardCount = brackets.filter(b => b.type !== 'cuarteta').length;

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-tatami-300 rounded-lg outline-hidden focus:ring-1 focus:ring-aka"
            />
          </div>

          {/* Ordenar por Edad / Categoría / Tatami */}
          <div className="flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5 text-tatami-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
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
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Todas las Ramas</option>
            <option value="M">Solo Varonil</option>
            <option value="F">Solo Femenil</option>
            <option value="MIXTO">Solo Mixto</option>
          </select>

          {/* Filtro Modalidad (Kata / Kumite) */}
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Kata y Kumite</option>
            <option value="kata">Solo Kata</option>
            <option value="kumite">Solo Kumite</option>
          </select>

          {/* Filtro Tatami */}
          <select
            value={filterTatami}
            onChange={(e) => setFilterTatami(e.target.value)}
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
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-tatami-300 rounded-lg bg-white text-tatami-700"
          >
            <option value="all">Formato: Todos ({brackets.length})</option>
            <option value="cuarteta">Cuartetas Infantiles ({cuartetasCount})</option>
            <option value="standard">Gráficas Mayores ({standardCount})</option>
          </select>
        </div>

        {/* Botón Maestro PDF */}
        <button
          onClick={onDownloadAllPDF}
          disabled={isGeneratingPDF || brackets.length === 0}
          className="px-4 py-2 bg-aka hover:bg-aka-dark text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>
            {isGeneratingPDF ? `Procesando Cuaderno (${pdfProgress}%)...` : `Descargar Cuaderno Completo (${brackets.length} Gráficas)`}
          </span>
        </button>
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
          {filteredBrackets.map(bracket => (
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
        </div>
      )}
    </div>
  );
}
