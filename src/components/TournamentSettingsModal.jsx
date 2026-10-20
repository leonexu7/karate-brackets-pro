import React, { useState } from 'react';
import { X, Settings, Calendar, MapPin, Shield, RefreshCw, Key, Trash2, Coins, AlertTriangle, Download, Scale, Users } from 'lucide-react';
import { DEMO_ATHLETES, DEMO_DOJOS } from '../constants/mockData';

export default function TournamentSettingsModal({
  isOpen,
  onClose,
  tournament,
  onSaveTournament,
  onResetAllToZero,
  onLoadDemoAthletes,
  onExportBackup,
}) {
  const [form, setForm] = useState({
    name: tournament.name || '',
    date: tournament.date || '',
    venue: tournament.venue || '',
    tatamisCount: tournament.tatamisCount || 3,
    organizer: tournament.organizer || '',
    adminKey: tournament.adminKey || 'karate2026',
    feeSingleModality: tournament.feeSingleModality !== undefined ? tournament.feeSingleModality : 300,
    feeDoubleModality: tournament.feeDoubleModality !== undefined ? tournament.feeDoubleModality : 300,
    divideAdultsByWeight: tournament.divideAdultsByWeight !== undefined ? tournament.divideAdultsByWeight : false,
    allowMixedInfant: tournament.allowMixedInfant !== undefined ? tournament.allowMixedInfant : true,
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTournament({
      ...tournament,
      ...form,
      tatamisCount: parseInt(form.tatamisCount, 10) || 1,
      feeSingleModality: parseFloat(form.feeSingleModality) || 0,
      feeDoubleModality: parseFloat(form.feeDoubleModality) || 0,
      divideAdultsByWeight: Boolean(form.divideAdultsByWeight),
      allowMixedInfant: Boolean(form.allowMixedInfant),
    });
    onClose();
  };

  const handleExecuteReset = () => {
    if (confirmText.trim().toUpperCase() !== 'REINICIAR' && confirmText.trim().toUpperCase() !== 'BORRAR') {
      alert('Debes escribir la palabra REINICIAR o BORRAR para confirmar la eliminación total.');
      return;
    }
    setShowResetConfirm(false);
    setConfirmText('');
    onResetAllToZero();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-tatami-200">
        <div className="bg-tatami-900 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-aka shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-aka-light" />
            <h2 className="text-sm font-semibold">Configuración del Torneo (Solo Administrador)</h2>
          </div>
          <button onClick={onClose} className="text-tatami-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block font-semibold text-tatami-700 mb-1">Nombre Oficial del Torneo *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-tatami-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-tatami-500" />
                Fecha del Torneo *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
              />
              <span className="text-[10px] text-tatami-400">Solo tú puedes modificar esta fecha</span>
            </div>

            <div>
              <label className="block font-semibold text-tatami-700 mb-1">Número de Tatamis (Áreas)</label>
              <select
                value={form.tatamisCount}
                onChange={(e) => setForm({ ...form, tatamisCount: e.target.value })}
                className="w-full px-3 py-2 border border-tatami-300 rounded-md bg-white outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 8].map(n => (
                  <option key={n} value={n}>{n} Tatami{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-tatami-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-tatami-500" />
              Sede / Instalación Deportiva
            </label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
              placeholder="Gimnasio Olímpico, Complejo Deportivo..."
            />
          </div>

          <div>
            <label className="block font-semibold text-tatami-700 mb-1">Asociación / Comité Organizador</label>
            <input
              type="text"
              value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
              placeholder="Asociación Estatal de Karate Do..."
            />
          </div>

          {/* División por Peso en Mayores (Kumite >= 14 años) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-600" />
                  <span>División por Peso en Mayores (Kumite Cadetes, Juniors, Adultos ≥ 14 años)</span>
                </label>
                <p className="text-[11px] text-slate-600">
                  {form.divideAdultsByWeight
                    ? 'Activado: Divide estrictamente en categorías de peso (-52kg, -57kg, etc.). Útil en torneos estatales masivos.'
                    : 'Desactivado: Categoría Abierta / Open (Recomendado para torneos chicos para que nadie se quede solo en un peso vacío).'}
                </p>
                <span className="text-[10px] text-slate-400 block italic">
                  * Nota técnica: Kata nunca se divide por peso, siempre se divide por edad y grado kyu.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, divideAdultsByWeight: !prev.divideAdultsByWeight }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.divideAdultsByWeight ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    form.divideAdultsByWeight ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Fusión Mixta en 6-7 años */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fusión Mixta en Niños de 6-7 años (si faltan participantes)</span>
                </label>
                <p className="text-[11px] text-slate-600">
                  {form.allowMixedInfant
                    ? 'Activado: Si en 6-7 años hay menos de 4 niñas o niños, los une en "6-7 Años Mixto" para completar la cuarteta de 4 medallas.'
                    : 'Desactivado: Mantiene varonil y femenil separados aunque la cuarteta quede con pocos competidores.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, allowMixedInfant: !prev.allowMixedInfant }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.allowMixedInfant ? 'bg-amber-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    form.allowMixedInfant ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cuotas de Ficha por Modalidad */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <label className="block font-semibold text-emerald-900 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-700" />
              Cuotas de Ficha de Inscripción (Cálculo de Pagos) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-emerald-800 mb-0.5">
                  1 Modalidad ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={form.feeSingleModality}
                  onChange={(e) => setForm({ ...form, feeSingleModality: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-md font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-800 mb-0.5">
                  2 Modalidades ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={form.feeDoubleModality}
                  onChange={(e) => setForm({ ...form, feeDoubleModality: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-md font-mono text-xs bg-white"
                />
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 block">
              Calcula automáticamente el total a pagar que ve el maestro al registrar a sus competidores.
            </span>
          </div>

          {/* Clave de Seguridad */}
          <div className="p-3 bg-tatami-50 border border-tatami-200 rounded-xl space-y-1">
            <label className="block font-semibold text-tatami-800 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              Clave de Seguridad para Administrador *
            </label>
            <input
              type="text"
              required
              value={form.adminKey}
              onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
              className="w-full px-3 py-1.5 border border-tatami-300 rounded-md font-mono text-xs bg-white"
            />
            <span className="text-[10px] text-tatami-500 block">
              Puedes cambiar esta clave en cualquier momento para proteger el acceso a tus llaves y PDFs.
            </span>
          </div>

          {/* SECCIÓN DE REINICIO TOTAL PARA NUEVO TORNEO */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-rose-950 text-xs">Reiniciar Torneo para Próximo Evento</h4>
                  <p className="text-[10px] text-rose-700">
                    Limpia alumnos, dojos y gráficas para dejar la aplicación lista para un nuevo torneo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0"
              >
                Limpiar Todo
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-tatami-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onLoadDemoAthletes}
              className="text-tatami-500 hover:text-sky-700 text-xs flex items-center gap-1"
              title="Cargar atletas de prueba temporalmente"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cargar Prueba</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-tatami-600 hover:bg-tatami-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-tatami-900 hover:bg-black text-white font-semibold rounded"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Confirmación Segura de Reinicio */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-rose-300">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900">¿Limpiar y Reiniciar Torneo?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción borrará permanentemente la lista de <strong>atletas inscritos, dojos y resultados de combates</strong> para que puedas utilizar el software en tu próximo evento deportivo.
            </p>

            {onExportBackup && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-600">¿Deseas guardar copia antes de borrar?</span>
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Respaldo JSON</span>
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Escribe <span className="text-rose-600 font-mono">REINICIAR</span> para confirmar:
              </label>
              <input
                type="text"
                placeholder="REINICIAR"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border-2 border-rose-300 rounded-lg text-center font-mono font-bold text-sm tracking-widest uppercase outline-hidden focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowResetConfirm(false); setConfirmText(''); }}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={confirmText.trim().toUpperCase() !== 'REINICIAR' && confirmText.trim().toUpperCase() !== 'BORRAR'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar y Borrar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
