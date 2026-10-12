import React, { useState, useMemo } from 'react';
import { Search, Trash2, Edit3, Scale, Award, UserPlus, FileSpreadsheet } from 'lucide-react';
import { KYUS, getKyuInfo, getKyuCategoryInfo } from '../constants/belts';
import { calculateAge, findAgeDivision } from '../constants/categories';

export default function AthleteList({
  athletes,
  dojos,
  tournamentDate,
  onEditAthlete,
  onDeleteAthlete,
  onNewAthlete,
  onBatchImport,
  onQuickWeightUpdate,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDojo, setFilterDojo] = useState('all');
  const [filterKyu, setFilterKyu] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const dojosMap = useMemo(() => {
    const map = {};
    (dojos || []).forEach(d => { map[d.id] = d; });
    return map;
  }, [dojos]);

  const filteredAthletes = useMemo(() => {
    return (athletes || []).filter(a => {
      const matchSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDojo = filterDojo === 'all' || a.dojoId === filterDojo;
      const matchKyu = filterKyu === 'all' || a.beltId === filterKyu;
      const matchGender = filterGender === 'all' || a.gender === filterGender;
      return matchSearch && matchDojo && matchKyu && matchGender;
    });
  }, [athletes, searchTerm, filterDojo, filterKyu, filterGender]);

  const totalPages = Math.ceil(filteredAthletes.length / pageSize) || 1;
  const paginatedAthletes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAthletes.slice(start, start + pageSize);
  }, [filteredAthletes, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre de atleta..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Filtro Dojo */}
          <select
            value={filterDojo}
            onChange={(e) => { setFilterDojo(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Todos los Dojos ({dojos.length})</option>
            {dojos.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Filtro por Grado KYU */}
          <select
            value={filterKyu}
            onChange={(e) => { setFilterKyu(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Todos los Grados (Kyus)</option>
            {KYUS.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>

          {/* Filtro Género */}
          <select
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Ambas Ramas</option>
            <option value="M">Varonil (M)</option>
            <option value="F">Femenil (F)</option>
          </select>
        </div>

        {/* Botones de creación */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBatchImport}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Importar CSV</span>
          </button>
          <button
            onClick={onNewAthlete}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-400" />
            <span>Inscribir Atleta</span>
          </button>
        </div>
      </div>

      {/* Tabla de Atletas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Competidor</th>
                <th className="py-3 px-3">Dojo / Escuela</th>
                <th className="py-3 px-3">Grado Técnico (KYU)</th>
                <th className="py-3 px-3">Edad & División</th>
                <th className="py-3 px-3">Báscula (kg)</th>
                <th className="py-3 px-3">Modalidades</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAthletes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No hay competidores registrados aún. Usa la cédula o el botón superior para agregar atletas.
                  </td>
                </tr>
              ) : (
                paginatedAthletes.map(ath => {
                  const kyu = getKyuInfo(ath.beltId);
                  const age = calculateAge(ath.birthDate, tournamentDate);
                  const ageDiv = findAgeDivision(age);
                  const dojo = dojosMap[ath.dojoId];

                  return (
                    <tr key={ath.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{ath.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className={ath.gender === 'F' ? 'text-rose-600 font-semibold' : 'text-blue-600 font-semibold'}>
                            {ath.gender === 'F' ? 'FEM' : 'VAR'}
                          </span>
                          <span>• Nac: {ath.birthDate || 'N/D'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{ath.dojoName || dojo?.name || 'Independiente'}</div>
                        <div className="text-[11px] text-slate-500">{dojo?.city || ''}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold bg-slate-50 border-slate-200 text-slate-800 w-fit">
                            {kyu.name}
                          </span>
                          {ath.competingCategory && ath.competingCategory !== kyu.naturalCategory && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {getKyuCategoryInfo(ath.competingCategory).shortName}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{age !== null ? `${age} años` : '—'}</div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          ageDiv.format === 'cuarteta'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ageDiv.name} {ageDiv.format === 'cuarteta' && '• Cuarteta'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">
                            {ath.weight ? `${ath.weight} kg` : <span className="text-slate-400 italic">Sin pesar</span>}
                          </span>
                          <button
                            onClick={() => onQuickWeightUpdate(ath)}
                            title="Actualizar pesaje en báscula"
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {(ath.modalities || ['kumite_ind']).map(m => (
                            <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                              {m.includes('kata') ? 'Kata' : 'Kumite'}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditAthlete(ath)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="Editar datos"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAthlete(ath.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar de lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando <strong>{Math.min(filteredAthletes.length, (currentPage - 1) * pageSize + 1)}</strong> a{' '}
            <strong>{Math.min(filteredAthletes.length, currentPage * pageSize)}</strong> de{' '}
            <strong>{filteredAthletes.length}</strong> competidores
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-2 py-1 font-semibold text-slate-800">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
