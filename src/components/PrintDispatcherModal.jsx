import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Sunrise,
  Sun,
  Sunset,
  Shield,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Check,
  Sparkles,
} from 'lucide-react';
import { getBracketAgeRank, countBracketPages } from '../utils/bracketEngine';
import { generateFullTournamentPDF } from '../utils/pdfGenerator';

/**
 * Centro de Impresión y Despacho Rápido de Tatamis
 * 
 * Resuelve:
 * 1. El orden invertido de salida en impresoras (con selector de bandeja boca arriba / face-up).
 * 2. La saturación de memoria de la impresora (dividiendo en Turnos Matutino/Mediodía/Tarde, por Tatami o en Lotes de 25-30 hojas).
 * 3. Garantiza que los niños pequeños (-5, 6-7, 8-9 años) salgan en las primeras hojas para arrancar el torneo a tiempo.
 */
export default function PrintDispatcherModal({
  isOpen,
  onClose,
  brackets = [],
  tournament = {},
  filteredBrackets = null,
}) {
  // Configuración de charola de impresora:
  // 'face_down' (normal): la hoja #1 se imprime primero (para láser o bandejas donde la cara cae boca abajo)
  // 'face_up' (invertido): la hoja #1 se imprime al final (para inyección de tinta donde cada hoja cae boca arriba sobre la anterior)
  const [trayOrder, setTrayOrder] = useState('face_up'); // Por defecto face_up para que el fajo termine con niños arriba
  const [batchSize, setBatchSize] = useState(25); // 25 hojas por lote anti-saturación
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState('');
  const [progress, setProgress] = useState(0);

  // Clasificación de gráficas por Bloque / Turno Horario
  const blocks = useMemo(() => {
    const morning = [];   // -5, 6-7, 8-9 años (Infantiles / Cuartetas)
    const midday = [];    // 10-11, 12-13 años (Juveniles Menores)
    const afternoon = []; // 14-15, 16-17, 18-20, Senior, Masters (Mayores)

    brackets.forEach(b => {
      const rank = getBracketAgeRank(b);
      if (rank <= 9) {
        morning.push(b);
      } else if (rank <= 13) {
        midday.push(b);
      } else {
        afternoon.push(b);
      }
    });

    return {
      morning: {
        id: 'morning',
        title: 'Turno 1: Matutino (8:30 AM)',
        subtitle: 'Infantiles (-5 a 9 años • Cuartetas con Medallas)',
        brackets: morning,
        pages: countBracketPages(morning),
        icon: Sunrise,
        color: 'amber',
        desc: '¡Lo primero que debe estar impreso a las 8:30 AM! Se imprime en ~2 min sin saturar.',
      },
      midday: {
        id: 'midday',
        title: 'Turno 2: Mediodía (11:30 AM)',
        subtitle: 'Juveniles Menores (10 a 13 años)',
        brackets: midday,
        pages: countBracketPages(midday),
        icon: Sun,
        color: 'sky',
        desc: 'Se manda a imprimir a las 11:15 AM mientras los infantiles están en finales o premiación.',
      },
      afternoon: {
        id: 'afternoon',
        title: 'Turno 3: Vespertino (2:00 PM)',
        subtitle: 'Cadetes, Juniors, Adultos y Masters (14+ años)',
        brackets: afternoon,
        pages: countBracketPages(afternoon),
        icon: Sunset,
        color: 'rose',
        desc: 'Se imprime antes de iniciar la jornada de la tarde. Cero congestión de impresoras.',
      },
    };
  }, [brackets]);

  // Clasificación por Tatami Individual
  const tatamisList = useMemo(() => {
    const count = tournament.tatamisCount || 3;
    const list = [];
    for (let t = 1; t <= count; t++) {
      const tBrackets = brackets.filter(b => (b.tatami || 1) === t);
      list.push({
        tatamiNumber: t,
        brackets: tBrackets,
        pages: countBracketPages(tBrackets),
      });
    }
    return list;
  }, [brackets, tournament.tatamisCount]);

  // División en Lotes Ligeros Anti-Saturación (ej. 25-30 hojas)
  const batches = useMemo(() => {
    const list = [];
    let currentChunk = [];
    let currentPageCount = 0;
    let batchIndex = 1;

    brackets.forEach(b => {
      const bPages = b.type === 'multipage' ? (b.totalPages || 2) : 1;
      if (currentPageCount + bPages > batchSize && currentChunk.length > 0) {
        list.push({
          index: batchIndex,
          name: `Lote ${batchIndex}`,
          brackets: currentChunk,
          pages: currentPageCount,
        });
        batchIndex++;
        currentChunk = [b];
        currentPageCount = bPages;
      } else {
        currentChunk.push(b);
        currentPageCount += bPages;
      }
    });

    if (currentChunk.length > 0) {
      list.push({
        index: batchIndex,
        name: `Lote ${batchIndex}`,
        brackets: currentChunk,
        pages: currentPageCount,
      });
    }

    return list;
  }, [brackets, batchSize]);

  const totalPagesAll = useMemo(() => countBracketPages(brackets), [brackets]);

  // Manejador centralizado de descarga PDF
  const handlePrintBatch = async (items, label, filenamePrefix) => {
    if (!items || items.length === 0 || isGenerating) return;
    setIsGenerating(true);
    setGeneratingLabel(label);
    setProgress(0);

    const isReverse = trayOrder === 'face_up';
    const tourName = (tournament?.name || 'Torneo_ShitoKai').replace(/\s+/g, '_');
    const safePrefix = filenamePrefix ? `_${filenamePrefix}` : '';
    const trayTag = isReverse ? '_FaceUp_CharolaBocaArriba' : '_Normal';
    const filename = `${tourName}${safePrefix}${trayTag}.pdf`;

    try {
      await generateFullTournamentPDF(
        items,
        tournament,
        (p) => setProgress(p),
        {
          reversePages: isReverse,
          filename,
        }
      );
    } catch (err) {
      console.error('Error generando lote de impresión:', err);
      alert('Error generando PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
      setGeneratingLabel('');
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Centro de Impresión */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-600/30 rounded-xl border border-rose-500/40 text-rose-300 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Centro de Impresión y Despacho de Tatamis
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Anti-Saturación
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Optimizado para imprimir en <strong>bloques ligeros</strong> (por turno o tatami) sin congelar la memoria de la impresora. Garantiza que los <strong>niños pequeños (-5 a 9 años)</strong> salgan primero para arrancar el torneo a tiempo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progreso Activa */}
        {isGenerating && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-3 shrink-0 flex items-center gap-3 animate-pulse">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-amber-950 mb-1">
                <span>{generatingLabel}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cuerpo con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {/* PANEL DE DETECCIÓN Y ORDEN DE CHAROLA (Boca Arriba vs Boca Abajo) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Configuración de Charola de Salida de tu Impresora:
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Total del Torneo: <strong>{brackets.length} gráficas</strong> ({totalPagesAll} hojas)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción Boca Arriba (Face-Up / Inkjet) */}
              <label
                onClick={() => setTrayOrder('face_up')}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                  trayOrder === 'face_up'
                    ? 'bg-rose-50/70 border-rose-500 text-slate-900 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="trayOrder"
                  checked={trayOrder === 'face_up'}
                  onChange={() => setTrayOrder('face_up')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-950">
                    <span>Charola Boca Arriba (Face-Up / Inyección de Tinta)</span>
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] rounded font-bold">RECOMENDADO</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Cada hoja sale visible hacia arriba y cae sobre la anterior. El sistema <strong>invierte el orden de impresión</strong> para que, al terminar el fajo, <strong>¡la hoja #1 de los niños quede arriba lista para usarse!</strong>
                  </p>
                </div>
              </label>

              {/* Opción Boca Abajo (Face-Down / Láser) */}
              <label
                onClick={() => setTrayOrder('face_down')}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                  trayOrder === 'face_down'
                    ? 'bg-sky-50/70 border-sky-500 text-slate-900 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="trayOrder"
                  checked={trayOrder === 'face_down'}
                  onChange={() => setTrayOrder('face_down')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-xs text-sky-950">
                    Charola Boca Abajo (Face-Down / Impresora Láser)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Las hojas salen con el texto hacia abajo (como las fotocopiadoras). Imprime en orden normal (1 a N). Al voltear el paquete de hojas, la #1 queda arriba.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* SECCIÓN 1: DESPACHO POR TURNO HORARIO DEL TORNEO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span>1. Despacho por Turnos de Horario (Evita Saturación de Búfer)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  La forma más profesional y rápida. Imprime solo el turno que se va a competir y arranca a tiempo sin esperar 180 hojas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Turno 1 Matutino */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg">
                      <Sunrise className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 bg-amber-600 text-white font-bold text-[10px] rounded-full">
                      8:30 AM
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">Turno 1: Matutino</h5>
                  <p className="font-semibold text-amber-900 text-[11px]">Infantiles (-5 a 9 años)</p>
                  <p className="text-[10px] text-amber-800 leading-snug">
                    {blocks.morning.brackets.length} gráficas • <strong>{blocks.morning.pages} hojas</strong> (Cuartetas).
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    ¡Imprime en ~90 seg! Tatamis listos de inmediato.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintBatch(blocks.morning.brackets, 'Turno 1 Matutino (Infantiles)', 'Turno1_Matutino_Infantiles')}
                  disabled={isGenerating || blocks.morning.brackets.length === 0}
                  className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Turno Matutino</span>
                </button>
              </div>

              {/* Turno 2 Mediodía */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 bg-sky-500/20 text-sky-800 rounded-lg">
                      <Sun className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 bg-sky-600 text-white font-bold text-[10px] rounded-full">
                      11:30 AM
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">Turno 2: Mediodía</h5>
                  <p className="font-semibold text-sky-900 text-[11px]">Juveniles (10 a 13 años)</p>
                  <p className="text-[10px] text-sky-800 leading-snug">
                    {blocks.midday.brackets.length} gráficas • <strong>{blocks.midday.pages} hojas</strong>.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Mandar a imprimir a las 11:15 AM sin parar las áreas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintBatch(blocks.midday.brackets, 'Turno 2 Mediodía (Juveniles)', 'Turno2_Mediodia_Juveniles')}
                  disabled={isGenerating || blocks.midday.brackets.length === 0}
                  className="mt-3 w-full py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Turno Mediodía</span>
                </button>
              </div>

              {/* Turno 3 Vespertino */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 bg-rose-500/20 text-rose-800 rounded-lg">
                      <Sunset className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full">
                      2:00 PM
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">Turno 3: Vespertino</h5>
                  <p className="font-semibold text-rose-900 text-[11px]">Cadetes, Seniors y Masters (14+)</p>
                  <p className="text-[10px] text-rose-800 leading-snug">
                    {blocks.afternoon.brackets.length} gráficas • <strong>{blocks.afternoon.pages} hojas</strong>.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Mandar a imprimir durante el descanso de mediodía.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintBatch(blocks.afternoon.brackets, 'Turno 3 Vespertino (Mayores)', 'Turno3_Vespertino_Mayores')}
                  disabled={isGenerating || blocks.afternoon.brackets.length === 0}
                  className="mt-3 w-full py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Turno Tarde</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESPACHO DIRECTO POR TATAMI (Para entregar a cada mesa de jueces) */}
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>2. Despacho por Área de Combate (Entrega Directa a Cada Mesa de Jueces)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Imprime un juego completo y ordenado exclusivamente para el Tatami asignado. Evita que la mesa de control tenga que separar 180 hojas a mano.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {tatamisList.map(t => (
                <div
                  key={t.tatamiNumber}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Tatami {t.tatamiNumber}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">
                        Área {t.tatamiNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {t.brackets.length} gráficas • <strong>{t.pages} hojas</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrintBatch(t.brackets, `Área Tatami ${t.tatamiNumber}`, `Tatami_${t.tatamiNumber}`)}
                    disabled={isGenerating || t.brackets.length === 0}
                    className="mt-2.5 w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-[11px] rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-emerald-400" />
                    <span>Descargar Tatami {t.tatamiNumber}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: MICRO-LOTES RÁPIDOS ANTI-SATURACIÓN (25-30 hojas) */}
          {batches.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>3. Micro-Lotes Anti-Saturación (Para Impresoras con Poca Memoria RAM)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Si tu impresora se congela con más de 30 páginas, descárgalas en estos paquetes ultra-ligeros (~2 MB c/u) que se imprimen en 45 segundos.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-500">Tamaño del lote:</span>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-800 font-semibold"
                  >
                    <option value={20}>20 hojas</option>
                    <option value={25}>25 hojas</option>
                    <option value={30}>30 hojas</option>
                    <option value={40}>40 hojas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {batches.map(b => (
                  <button
                    key={b.index}
                    type="button"
                    onClick={() => handlePrintBatch(b.brackets, `${b.name} (${b.pages} hojas)`, `Lote_${b.index}`)}
                    disabled={isGenerating}
                    className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-left transition-colors cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 group-hover:text-sky-900 text-xs">
                        {b.name}
                      </span>
                      <Printer className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {b.pages} hojas
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 4: SELECCIÓN ACTUAL Y CUADERNO COMPLETO */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-800 text-xs">¿Deseas el archivo maestro completo?</span>
              <p className="text-[11px] text-slate-500">
                Recomendado si imprimes desde una fotocopiadora de alto volumen o guardas el PDF en memoria USB.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {filteredBrackets && filteredBrackets.length > 0 && filteredBrackets.length < brackets.length && (
                <button
                  type="button"
                  onClick={() => handlePrintBatch(filteredBrackets, `Selección Filtrada (${filteredBrackets.length} gráficas)`, 'Seleccion_Filtrada')}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Imprimir Selección ({filteredBrackets.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handlePrintBatch(brackets, 'Cuaderno Completo Oficial', 'Cuaderno_Completo_Oficial')}
                disabled={isGenerating || brackets.length === 0}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar Todo ({totalPagesAll} Hojas)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Motor de despacho ordenado por edad ascendente (-5 años a Senior/Master)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
