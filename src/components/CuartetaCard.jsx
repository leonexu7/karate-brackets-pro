import React, { useState, useEffect } from 'react';
import { Trophy, Printer, Award, Check } from 'lucide-react';
import { ShitoKaiLogo } from '../assets/shitoKaiLogo';
import silhouetteFemale from '../assets/silhouette_female.png';
import silhouetteMale from '../assets/silhouette_male.png';
import { generateSingleBracketPDF } from '../utils/pdfGenerator';

export default function CuartetaCard({ cuarteta, tournament, onMatchWinner }) {
  const [matches, setMatches] = useState(() => cuarteta?.matches || []);
  const [medals, setMedals] = useState(() => cuarteta?.medals || {});

  useEffect(() => {
    setMatches(cuarteta?.matches || []);
    setMedals(cuarteta?.medals || {});
  }, [cuarteta]);

  const isFemale = cuarteta?.gender === 'F' || (cuarteta?.categoryName && cuarteta.categoryName.toUpperCase().includes('FEMENIL'));
  const ath = cuarteta?.athletes || [];

  // Detectar si es una Final Directa (exactamente 2 atletas sin semifinales)
  const isDirectFinal = matches.length === 1 || (ath.filter(Boolean).length === 2 && matches.length < 3);

  const m1 = matches[0] || null;
  const m2 = matches[1] || null;
  const m3 = matches[2] || null;

  const handleSelectWinner = (matchIndex, winnerAthlete, loserAthlete) => {
    const updated = [...matches];
    if (!updated[matchIndex]) return;

    updated[matchIndex] = {
      ...updated[matchIndex],
      winner: winnerAthlete,
      loser: loserAthlete,
    };

    if (isDirectFinal) {
      setMatches(updated);
      const newMedals = {
        gold: winnerAthlete || null,
        silver: loserAthlete || null,
        bronze1: null,
        bronze2: null,
      };
      setMedals(newMedals);
      if (onMatchWinner) {
        onMatchWinner(cuarteta.id, updated, newMedals);
      }
      return;
    }

    if (matchIndex === 0 && updated[2]) {
      updated[2] = { ...updated[2], aka: winnerAthlete };
    } else if (matchIndex === 1 && updated[2]) {
      updated[2] = { ...updated[2], ao: winnerAthlete };
    }

    setMatches(updated);

    const newMedals = {
      gold: updated[2]?.winner || null,
      silver: updated[2]?.loser || null,
      bronze1: updated[0]?.loser || null,
      bronze2: updated[1]?.loser || null,
    };
    setMedals(newMedals);

    if (onMatchWinner) {
      onMatchWinner(cuarteta.id, updated, newMedals);
    }
  };

  const handlePrintPDF = () => {
    generateSingleBracketPDF({ ...cuarteta, matches, medals }, tournament);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
      {/* Cabecera de la Cuarteta */}
      <div
        className="bg-slate-900 text-white px-5 py-3 border-b-2 flex flex-wrap items-center justify-between gap-2 transition-colors"
        style={{ borderBottomColor: tournament?.badgeBorderColor || '#f43f5e' }}
      >
        <div className="flex items-center gap-3">
          <ShitoKaiLogo src={tournament?.customLogo} className="w-6 h-6" />
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
            {isDirectFinal ? '2' : '4'}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm tracking-wide text-white">{cuarteta?.categoryName}</h3>
              {cuarteta?.modalityProfile === 'doble' && (
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  🥋 Doble Modalidad
                </span>
              )}
              {cuarteta?.modalityProfile === 'solo_kumite' && (
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-200 border border-rose-400/30 px-2 py-0.5 rounded-full">
                  🥊 Solo Kumite
                </span>
              )}
              {cuarteta?.modalityProfile === 'solo_kata' && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  🥋 Solo Kata
                </span>
              )}
              {isDirectFinal && (
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  🏆 Final Directa
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300">
              Tatami {cuarteta?.tatami} • {isDirectFinal ? 'Final Directa de 2 Competidores' : 'Cuarteta Infantil: 4 Medallas Garantizadas (1 por Hoja)'}
            </div>
          </div>
        </div>

        <button
          onClick={handlePrintPDF}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          title="Descargar PDF horizontal para jueces"
        >
          <Printer className="w-3.5 h-3.5 text-rose-400" />
          <span>Imprimir Hoja</span>
        </button>
      </div>

      {/* Contenedor de Combates con líneas conectoras y Podio */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">

        {/* CASO A: FINAL DIRECTA (2 COMPETIDORES) */}
        {isDirectFinal ? (
          <>
            <div className="md:col-span-8 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Gran Final Directa por Campeonato
              </div>

              <div className="border-2 border-slate-900 rounded-xl p-4 bg-white shadow-xs space-y-3">
                <div className="text-center text-[10px] font-bold text-slate-500">
                  COMBATE ÚNICO — MEDALLA DE ORO Y PLATA
                </div>

                {/* Aka (Esquina Roja) */}
                <div
                  onClick={() => ath[0] && ath[1] && handleSelectWinner(0, ath[0], ath[1])}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m1?.winner?.id === ath[0]?.id
                      ? 'bg-amber-100 border-amber-500 font-bold text-amber-950 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-rose-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-8 bg-rose-500 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-bold">{ath[0]?.fullName || 'Competidor Aka'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[0]?.dojoName || 'Dojo'} {ath[0]?.weight ? `• ${ath[0].weight}kg` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m1?.winner?.id === ath[0]?.id && <Trophy className="w-4 h-4 text-amber-600" />}
                  </div>
                </div>

                {/* Ao (Esquina Azul) */}
                <div
                  onClick={() => ath[0] && ath[1] && handleSelectWinner(0, ath[1], ath[0])}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m1?.winner?.id === ath[1]?.id
                      ? 'bg-amber-100 border-amber-500 font-bold text-amber-950 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-8 bg-blue-600 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-bold">{ath[1]?.fullName || 'Competidor Ao'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[1]?.dojoName || 'Dojo'} {ath[1]?.weight ? `• ${ath[1].weight}kg` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m1?.winner?.id === ath[1]?.id && <Trophy className="w-4 h-4 text-amber-600" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Podio 2 Medallas */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Podio de Premiación</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Oro */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    1º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-amber-800">MEDALLA DE ORO</div>
                    <div className="font-semibold text-slate-900 truncate">
                      {medals?.gold?.fullName || m1?.winner?.fullName || 'En disputa en Gran Final'}
                    </div>
                  </div>
                </div>

                {/* Plata */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 border border-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    2º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-slate-700">MEDALLA DE PLATA</div>
                    <div className="font-semibold text-slate-900 truncate">
                      {medals?.silver?.fullName || m1?.loser?.fullName || 'Subcampeón Gran Final'}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center italic pt-1">
                  Categoría directa de 2 competidores.
                </div>
              </div>
            </div>
          </>
        ) : (
          /* CASO B: CUARTETA ESTÁNDAR (3 O 4 COMPETIDORES CON SEMIFINALES) */
          <>
            {/* SEMIFINALES (COL 1-5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>Ronda Semifinal (Define Bronces)</span>
              </div>

              {/* Semifinal 1 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2 relative">
                <div className="text-[10px] font-bold text-slate-500">COMBATE 1 — SEMIFINAL 1</div>

                {/* Aka */}
                <div
                  onClick={() => ath[0] && ath[1] && handleSelectWinner(0, ath[0], ath[1])}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m1?.winner?.id === ath[0]?.id
                      ? 'bg-rose-50 border-rose-400 font-bold text-rose-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-rose-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-rose-500 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{ath[0]?.fullName || '____________________'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[0]?.dojoName || 'Dojo'} {ath[0]?.weight ? `• ${ath[0].weight}kg` : ''} {ath[0]?.isSoloKumite ? '• [Solo Kumite]' : (ath[0]?.isSoloKata ? '• [Solo Kata]' : '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m1?.winner?.id === ath[0]?.id && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                </div>

                {/* Ao */}
                <div
                  onClick={() => ath[0] && ath[1] && handleSelectWinner(0, ath[1], ath[0])}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m1?.winner?.id === ath[1]?.id
                      ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-blue-600 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{ath[1]?.fullName || '____________________'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[1]?.dojoName || 'Dojo'} {ath[1]?.weight ? `• ${ath[1].weight}kg` : ''} {ath[1]?.isSoloKumite ? '• [Solo Kumite]' : (ath[1]?.isSoloKata ? '• [Solo Kata]' : '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m1?.winner?.id === ath[1]?.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              </div>

              {/* Semifinal 2 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2 relative">
                <div className="text-[10px] font-bold text-slate-500">COMBATE 2 — SEMIFINAL 2</div>

                {/* Aka */}
                <div
                  onClick={() => ath[2] && ath[3] && handleSelectWinner(1, ath[2], ath[3])}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m2?.winner?.id === ath[2]?.id
                      ? 'bg-rose-50 border-rose-400 font-bold text-rose-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-rose-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-rose-500 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{ath[2]?.fullName || '____________________'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[2]?.dojoName || 'Dojo'} {ath[2]?.weight ? `• ${ath[2].weight}kg` : ''} {ath[2]?.isSoloKumite ? '• [Solo Kumite]' : (ath[2]?.isSoloKata ? '• [Solo Kata]' : '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m2?.winner?.id === ath[2]?.id && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                </div>

                {/* Ao */}
                <div
                  onClick={() => ath[2] && ath[3] && handleSelectWinner(1, ath[3], ath[2])}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m2?.winner?.id === ath[3]?.id
                      ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-blue-600 rounded-xs shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{ath[3]?.fullName || '____________________'}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath[3]?.dojoName || 'Dojo'} {ath[3]?.weight ? `• ${ath[3].weight}kg` : ''} {ath[3]?.isSoloKumite ? '• [Solo Kumite]' : (ath[3]?.isSoloKata ? '• [Solo Kata]' : '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-slate-50 font-mono">[ Pts ]</span>
                    {m2?.winner?.id === ath[3]?.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              </div>
            </div>

            {/* GRAN FINAL (COL 6-8) */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-center text-slate-600">
                Gran Final (Oro y Plata)
              </div>

              <div className="border-2 border-slate-900 rounded-xl p-3 bg-white shadow-xs space-y-2.5">
                <div className="text-center text-[10px] font-bold text-slate-500">COMBATE 3 — GRAN FINAL</div>

                {/* Finalista Aka */}
                <div
                  onClick={() => m3?.aka && m3?.ao && handleSelectWinner(2, m3.aka, m3.ao)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m3?.winner?.id === m3?.aka?.id
                      ? 'bg-amber-100 border-amber-500 font-bold text-amber-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-7 bg-rose-500 rounded-xs" />
                    <div>
                      <div className="text-xs font-bold">{m3?.aka?.fullName || 'Ganador C1 (Aka)'}</div>
                      <div className="text-[10px] text-slate-500">{m3?.aka?.dojoName || 'Rellenar a mano'}</div>
                    </div>
                  </div>
                  {m3?.winner?.id === m3?.aka?.id && <Trophy className="w-4 h-4 text-amber-600" />}
                </div>

                {/* Finalista Ao */}
                <div
                  onClick={() => m3?.aka && m3?.ao && handleSelectWinner(2, m3.ao, m3.aka)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    m3?.winner?.id === m3?.ao?.id
                      ? 'bg-amber-100 border-amber-500 font-bold text-amber-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-7 bg-blue-600 rounded-xs" />
                    <div>
                      <div className="text-xs font-bold">{m3?.ao?.fullName || 'Ganador C2 (Ao)'}</div>
                      <div className="text-[10px] text-slate-500">{m3?.ao?.dojoName || 'Rellenar a mano'}</div>
                    </div>
                  </div>
                  {m3?.winner?.id === m3?.ao?.id && <Trophy className="w-4 h-4 text-amber-600" />}
                </div>
              </div>

              {/* Emblema Oficial en el espacio central libre */}
              <div className="border border-slate-200/90 rounded-xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 p-3 text-center shadow-xs flex flex-col items-center justify-center">
                <div className="relative my-0.5">
                  <img
                    src={isFemale ? silhouetteFemale : silhouetteMale}
                    alt={isFemale ? "Silueta Femenil" : "Silueta Varonil"}
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                  <span>{isFemale ? 'Rama Femenil' : 'Rama Varonil'}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-1">
                  {tournament?.bannerBadgeText || 'Shito-Kai'} • Cuarteta Infantil
                </div>
              </div>
            </div>

            {/* PODIO DE 4 MEDALLISTAS (COL 9-12) */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Podio de Premiación (4 Medallas)</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Oro */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    1º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-amber-800">MEDALLA DE ORO</div>
                    <div className="font-semibold text-slate-900 truncate">
                      {medals?.gold?.fullName || m3?.winner?.fullName || 'En disputa en Gran Final'}
                    </div>
                  </div>
                </div>

                {/* Plata */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 border border-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    2º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-slate-700">MEDALLA DE PLATA</div>
                    <div className="font-semibold text-slate-900 truncate">
                      {medals?.silver?.fullName || m3?.loser?.fullName || 'Subcampeón Gran Final'}
                    </div>
                  </div>
                </div>

                {/* Bronce 1 */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-900/10 border border-amber-900/20">
                  <span className="w-5 h-5 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    3º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-amber-900">MEDALLA DE BRONCE</div>
                    <div className="font-medium text-slate-800 truncate">
                      {medals?.bronze1?.fullName || m1?.loser?.fullName || 'Perdedor Semifinal 1'}
                    </div>
                  </div>
                </div>

                {/* Bronce 2 */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-900/10 border border-amber-900/20">
                  <span className="w-5 h-5 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    3º
                  </span>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-amber-900">MEDALLA DE BRONCE</div>
                    <div className="font-medium text-slate-800 truncate">
                      {medals?.bronze2?.fullName || m2?.loser?.fullName || 'Perdedor Semifinal 2'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
