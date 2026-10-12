import React, { useState, useMemo } from 'react';
import { Trophy, Printer, Filter, Search, Award, Shield, AlertCircle } from 'lucide-react';
import CuartetaCard from './CuartetaCard';
import BracketCard from './BracketCard';

export default function BracketsView({
  brackets,
  tournament,
  onDownloadAllPDF,
  isGeneratingPDF,
  pdfProgress,
}) {
  const [filterTatami, setFilterTatami] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'cuarteta', 'standard'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrackets = useMemo(() => {
    return brackets.filter(b => {
      const matchTatami = filterTatami === 'all' || String(b.tatami) === String(filterTatami);
      const matchType = filterType === 'all'
        ? true
        : filterType === 'cuarteta'
          ? b.type === 'cuarteta'
          : b.type !== 'cuarteta';
      const matchSearch = b.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTatami && matchType && matchSearch;
    });
  }, [brackets, filterTatami, filterType, searchTerm]);

  const cuartetasCount = brackets.filter(b => b.type === 'cuarteta').length;
  const standardCount = brackets.filter(b => b.type !== 'cuarteta').length;

  return (
    <div className="space-y-6">
      {/* Banner de Estado y Control */}
      <div className="bg-white p-4 rounded-xl border border-tatami-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-tatami-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar categoría de gráfica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-tatami-300 rounded-lg outline-hidden focus:ring-1 focus:ring-aka"
            />
          </div>

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
            <option value="all">Todas las Gráficas ({brackets.length})</option>
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
