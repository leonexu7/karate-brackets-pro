import React, { useState } from 'react';
import { Trophy, Printer, Users, Check, ChevronRight, FileText, Award } from 'lucide-react';
import { ShitoKaiLogo } from '../assets/shitoKaiLogo';
import silhouetteFemale from '../assets/silhouette_female.png';
import silhouetteMale from '../assets/silhouette_male.png';
import { generateSingleBracketPDF } from '../utils/pdfGenerator';

export default function BracketCard({ bracket, tournament }) {
  const [activePageIndex, setActivePageIndex] = useState(0);

  const isMultiPage = bracket.type === 'multipage';

  const handlePrintPDF = () => {
    generateSingleBracketPDF(bracket, tournament);
  };

  // Renderizador para un bracket estándar con líneas de avance y espacio para rellenar a mano
  const renderBracketTree = (stdBracket) => {
    const rounds = stdBracket.rounds || [];

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-8 min-w-[780px] py-3">
          {rounds.map((round, rIdx) => {
            const matches = round.matches || [];

            return (
              <div key={rIdx} className="flex-1 min-w-[190px] space-y-4">
                {/* Título de Ronda */}
                <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-center text-xs font-bold text-slate-800 uppercase tracking-wider shadow-xs">
                  {round.name}
                </div>

                {/* Lista de Combates con líneas de unión */}
                <div className="space-y-4 flex flex-col justify-around h-full">
                  {matches.map((m, mIdx) => (
                    <div
                      key={m.id || mIdx}
                      className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden relative"
                    >
                      {/* Cabecera del combate */}
                      <div className="bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 flex justify-between items-center border-b border-slate-100">
                        <span>Combate #{m.matchNumber || mIdx + 1}</span>
                        {m.isBye && <span className="text-amber-700 bg-amber-100 px-1 rounded text-[9px]">Pase Directo</span>}
                      </div>

                      {/* Esquina Aka (Rojo coral suave) */}
                      <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-1.5 truncate flex-1">
                          <span className="w-2 h-4 bg-rose-500 rounded-xs shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {rIdx === 0
                              ? (m.aka?.fullName || (m.isBye ? 'BYE' : '—'))
                              : '____________________'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1 py-0.2 rounded bg-slate-50">[   ]</span>
                        </div>
                      </div>

                      {/* Esquina Ao (Azul zafiro suave) */}
                      <div className="p-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-1.5 truncate flex-1">
                          <span className="w-2 h-4 bg-blue-600 rounded-xs shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {rIdx === 0
                              ? (m.ao?.fullName || (m.isBye ? 'BYE' : '—'))
                              : '____________________'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1 py-0.2 rounded bg-slate-50">[   ]</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Si es la ronda final, aprovechamos el amplio espacio libre vertical para ubicar el emblema oficial de la rama */}
                {rIdx === rounds.length - 1 && (
                  <div className="mt-6 border border-slate-200/90 rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 p-4 text-center shadow-xs flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-1.5 shadow-2xs">
                      <ShitoKaiLogo className="w-5 h-5" />
                    </div>
                    <div className="relative my-1">
                      <img
                        src={isFemale ? silhouetteFemale : silhouetteMale}
                        alt={isFemale ? "Silueta Femenil" : "Silueta Varonil"}
                        className="w-32 h-32 object-contain mx-auto transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                      <span>{isFemale ? 'Rama Femenil' : 'Rama Varonil'}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 mt-1">
                      Shito-Kai Karate-Do
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Tatami {stdBracket.tatami || bracket.tatami || 1} • Gráfica Oficial
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizador del bloque oficial de Podio y Resultados de Mesa para jueceo manual
  const renderPodiumSection = () => {
    return (
      <div className="mt-6 border-t border-slate-200 pt-5 relative z-10">
        <div className="bg-slate-50/95 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative z-10">
          {/* Encabezado del Podio */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                Resultados y Podio
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-slate-700 shadow-2xs">
                Tatami {bracket.tatami || 1} • Shito-Kai
              </span>
            </div>
          </div>

          {/* Cuadrícula de 4 Medallistas: 1° Oro, 2° Plata, 3° Bronce 1, 3° Bronce 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1º ORO */}
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-3 space-y-2 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  1º ORO
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase">Campeón</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Atleta:</div>
                  <div className="border-b-2 border-dashed border-amber-300 min-h-[22px] flex items-center text-xs font-semibold text-slate-900 px-1">
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Dojo / Escuela:</div>
                  <div className="border-b-2 border-dashed border-amber-300 min-h-[20px] flex items-center text-[11px] text-slate-600 px-1">
                  </div>
                </div>
              </div>
            </div>

            {/* 2º PLATA */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-3 space-y-2 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="bg-slate-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2º PLATA
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Subcampeón</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Atleta:</div>
                  <div className="border-b-2 border-dashed border-slate-300 min-h-[22px] flex items-center text-xs font-semibold text-slate-900 px-1">
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Dojo / Escuela:</div>
                  <div className="border-b-2 border-dashed border-slate-300 min-h-[20px] flex items-center text-[11px] text-slate-600 px-1">
                  </div>
                </div>
              </div>
            </div>

            {/* 3º BRONCE 1 */}
            <div className="bg-amber-900/5 border border-amber-800/30 rounded-xl p-3 space-y-2 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="bg-amber-800 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  3º BRONCE
                </span>
                <span className="text-[10px] font-bold text-amber-900 uppercase">Semifinalista 1</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Atleta:</div>
                  <div className="border-b-2 border-dashed border-amber-800/30 min-h-[22px] flex items-center text-xs font-semibold text-slate-900 px-1">
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Dojo / Escuela:</div>
                  <div className="border-b-2 border-dashed border-amber-800/30 min-h-[20px] flex items-center text-[11px] text-slate-600 px-1">
                  </div>
                </div>
              </div>
            </div>

            {/* 3º BRONCE 2 */}
            <div className="bg-amber-900/5 border border-amber-800/30 rounded-xl p-3 space-y-2 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="bg-amber-800 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  3º BRONCE
                </span>
                <span className="text-[10px] font-bold text-amber-900 uppercase">Semifinalista 2</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Atleta:</div>
                  <div className="border-b-2 border-dashed border-amber-800/30 min-h-[22px] flex items-center text-xs font-semibold text-slate-900 px-1">
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Dojo / Escuela:</div>
                  <div className="border-b-2 border-dashed border-amber-800/30 min-h-[20px] flex items-center text-[11px] text-slate-600 px-1">
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de Validación de Mesa */}
          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 shrink-0">Árbitro Central (Sushin):</span>
              <span className="border-b border-slate-300 flex-1 min-h-[18px]"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 shrink-0">Juez de Mesa:</span>
              <span className="border-b border-slate-300 flex-1 min-h-[18px]"></span>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 text-[11px] text-slate-500">
              <span>Hora Cierre: <strong>[____:____]</strong></span>
              <span className="bg-slate-200/60 px-2 py-0.5 rounded text-[10px] font-medium">Validado Shito-Kai</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isFemale = bracket.gender === 'F' || (bracket.categoryName && bracket.categoryName.toUpperCase().includes('FEMENIL'));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
      {/* Cabecera de la Gráfica */}
      <div className="bg-slate-900 text-white px-5 py-3 border-b-2 border-rose-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShitoKaiLogo className="w-7 h-7" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-wide text-white">{bracket.categoryName}</h3>
              {isMultiPage && (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Multi-Hoja ({bracket.totalPages} Hojas Conectadas)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Tatami {bracket.tatami} • {isMultiPage ? `${bracket.totalAthletes} Atletas (Categoría Grande)` : `${bracket.bracketSize} posiciones oficiales`}
            </div>
          </div>
        </div>

        <button
          onClick={handlePrintPDF}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
          title="Descargar PDF en tamaño Carta horizontal"
        >
          <Printer className="w-3.5 h-3.5 text-rose-400" />
          <span>Imprimir Gráfica en PDF</span>
        </button>
      </div>

      {/* RÓTULO MULTI-HOJA CONECTADA (SI ES CATEGORÍA GRANDE) */}
      {isMultiPage && (
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Esta categoría se divide en <strong>3 hojas continuas</strong> para mantener nombres grandes y legibles:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {bracket.pages.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePageIndex(idx)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    activePageIndex === idx
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {idx === 0 ? 'Hoja 1: Poule A' : idx === 1 ? 'Hoja 2: Poule B' : 'Hoja 3: Gran Final'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1 text-[11px] text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 font-medium">
            ℹ️ {bracket.pages[activePageIndex].title}: {bracket.pages[activePageIndex].note}
          </div>
        </div>
      )}

      {/* Contenido de la Gráfica */}
      <div className="p-5 relative z-10">
        {isMultiPage ? (
          activePageIndex === 2 ? (
            // Vista de Hoja 3: Cruces Finales
            <div className="max-w-2xl mx-auto py-4 space-y-6">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Cruces de Semifinales y Gran Final</h4>
                <p className="text-xs text-slate-500">Los clasificados de la Poule A (Hoja 1) se enfrentan a los de la Poule B (Hoja 2)</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* SF-1 */}
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-700 text-[11px]">SEMIFINAL 1 (SF-1)</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-rose-600">AKA: 1er Lugar Poule A (Hoja 1)</span>
                    <span className="font-mono text-slate-400">[ Pts ]</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-blue-600">AO: 2do Lugar Poule B (Hoja 2)</span>
                    <span className="font-mono text-slate-400">[ Pts ]</span>
                  </div>
                </div>

                {/* SF-2 */}
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-700 text-[11px]">SEMIFINAL 2 (SF-2)</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-rose-600">AKA: 1er Lugar Poule B (Hoja 2)</span>
                    <span className="font-mono text-slate-400">[ Pts ]</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-blue-600">AO: 2do Lugar Poule A (Hoja 1)</span>
                    <span className="font-mono text-slate-400">[ Pts ]</span>
                  </div>
                </div>

                {/* FINAL ABSOLUTA */}
                <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white space-y-2 shadow-xs">
                  <div className="font-bold text-center text-sm text-slate-900 flex items-center justify-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>GRAN FINAL POR MEDALLA DE ORO</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg text-center font-semibold text-slate-800">
                    Ganador SF-1 (Aka) vs Ganador SF-2 (Ao)
                  </div>
                </div>

                {/* Emblema Oficial de la Rama en el espacio central de cruces */}
                <div className="border border-slate-200/90 rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 p-4 text-center shadow-xs flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-1.5 shadow-2xs">
                    <ShitoKaiLogo className="w-5 h-5" />
                  </div>
                  <div className="relative my-1">
                    <img
                      src={isFemale ? silhouetteFemale : silhouetteMale}
                      alt={isFemale ? "Silueta Femenil" : "Silueta Varonil"}
                      className="w-28 h-28 object-contain mx-auto"
                    />
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                    <span>{isFemale ? 'Rama Femenil' : 'Rama Varonil'}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-1">
                    Shito-Kai Karate-Do • Cruces Finales
                  </div>
                </div>
              </div>

              {/* Registro Oficial de Podio en Hoja 3 */}
              {renderPodiumSection()}
            </div>
          ) : (
            <div>
              {renderBracketTree(bracket.pages[activePageIndex].bracket)}
              {renderPodiumSection()}
            </div>
          )
        ) : (
          <div>
            {renderBracketTree(bracket)}
            {renderPodiumSection()}
          </div>
        )}
      </div>
    </div>
  );
}
