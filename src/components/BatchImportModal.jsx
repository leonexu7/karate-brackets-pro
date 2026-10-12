import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Upload, Download, AlertCircle, CheckCircle2, FileCheck } from 'lucide-react';
import { getKyuInfo } from '../constants/belts';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelHandler';

export default function BatchImportModal({ isOpen, onClose, onImportAthletes, dojos }) {
  const [inputText, setInputText] = useState('');
  const [selectedDojoId, setSelectedDojoId] = useState(dojos[0]?.id || '');
  const [previewList, setPreviewList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const exampleText = `Mateo Tanaka, 2019-04-12, M, 10 kyu, 22.5, 118
Valentina Ruiz, 2018-09-05, F, 8 kyu, 25.0, 122
Santiago Morales, 2014-06-20, M, 6 kyu, 38.4, 145
Diego Hernández, 2011-03-15, M, 3 kyu, 54.2, 168`;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessingFile(true);
    setExcelFileName(file.name);

    try {
      const result = await parseExcelFile(file);
      if (result.success && result.athletes?.length > 0) {
        const withDojo = result.athletes.map(a => ({
          ...a,
          dojoId: selectedDojoId,
        }));
        setPreviewList(withDojo);
      } else {
        setErrorMsg(result.error || 'No se pudieron reconocer datos válidos del archivo.');
        setPreviewList([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el archivo Excel.');
      setPreviewList([]);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleParseText = () => {
    setErrorMsg('');
    if (!inputText.trim()) {
      setErrorMsg('Por favor ingresa texto o pega los datos de los competidores.');
      return;
    }

    const lines = inputText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('nombre')) return;
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const fullName = parts[0]?.trim();
        const birthDate = parts[1]?.trim();
        const gender = (parts[2]?.trim().toUpperCase().startsWith('F') ? 'F' : 'M');
        const kyuInput = parts[3]?.trim() || '10_kyu';
        const kyu = getKyuInfo(kyuInput);
        const weight = parseFloat(parts[4]?.trim()) || null;
        const height = parseFloat(parts[5]?.trim()) || null;

        if (fullName) {
          parsed.push({
            id: `batch-${Date.now()}-${idx}`,
            fullName,
            birthDate: birthDate.match(/^\d{4}-\d{2}-\d{2}$/) ? birthDate : '2016-01-01',
            gender,
            beltId: kyu.id,
            kyuName: kyu.name,
            competingCategory: kyu.naturalCategory,
            weight,
            height,
            dojoId: selectedDojoId,
            modalities: ['kumite_ind', 'kata_ind'],
          });
        }
      }
    });

    if (parsed.length === 0) {
      setErrorMsg('No se pudieron reconocer datos válidos. Usa el formato: Nombre, AAAA-MM-DD, Sexo, Kyu, Peso, Estatura');
    } else {
      setPreviewList(parsed);
      setExcelFileName('');
    }
  };

  const handleConfirm = () => {
    if (previewList.length > 0) {
      const finalAthletes = previewList.map(a => ({
        ...a,
        dojoId: selectedDojoId,
      }));
      onImportAthletes(finalAthletes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-emerald-500">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-semibold">Carga Masiva de Competidores (Excel / CSV)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* SELECCIÓN DE DOJO Y DESCARGA DE PLANTILLA */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-800">Asignar a Escuela / Dojo:</label>
              <select
                value={selectedDojoId}
                onChange={(e) => setSelectedDojoId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {dojos.length === 0 ? (
                  <option value="">(Registrar primero un dojo)</option>
                ) : (
                  dojos.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla Excel</span>
            </button>
          </div>

          {/* ZONA DE SUBIDA DE ARCHIVO EXCEL */}
          <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center bg-emerald-50/40 space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="adminExcelUpload"
            />
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5 text-emerald-700" />
              <label htmlFor="adminExcelUpload" className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer">
                Haz clic aquí para seleccionar o arrastrar archivo Excel (.xlsx / .csv)
              </label>
            </div>
            {isProcessingFile && <p className="text-slate-500 font-semibold animate-pulse">Procesando archivo...</p>}
            {excelFileName && !isProcessingFile && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded font-semibold text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-emerald-700" /> {excelFileName}
              </span>
            )}
          </div>

          {/* O PEGAR TEXTO DIRECTAMENTE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">O pega texto de competidores (Excel / WhatsApp):</label>
              <button
                type="button"
                onClick={() => setInputText(exampleText)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Cargar ejemplo
              </button>
            </div>

            <textarea
              rows={4}
              placeholder={exampleText}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500 bg-white"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseText}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Previsualizar Texto Pegado
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {previewList.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Competidores listos para importar: {previewList.length}</span>
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                {previewList.slice(0, 10).map((ath, i) => (
                  <div key={i} className="py-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{ath.fullName}</span>
                    <span className="text-slate-500 text-[11px]">
                      Nac: {ath.birthDate} • {ath.kyuName || ath.beltId} • {ath.weight ? `${ath.weight}kg` : 's/p'}
                    </span>
                  </div>
                ))}
                {previewList.length > 10 && (
                  <div className="py-1 text-slate-400 italic text-[11px]">... y {previewList.length - 10} más</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={previewList.length === 0}
              onClick={handleConfirm}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Importar {previewList.length} Atletas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
