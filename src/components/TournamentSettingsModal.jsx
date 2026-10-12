import React, { useState } from 'react';
import { X, Settings, Calendar, MapPin, Shield, RefreshCw, Key, Trash2, Coins } from 'lucide-react';
import { DEMO_ATHLETES, DEMO_DOJOS } from '../constants/mockData';

export default function TournamentSettingsModal({
  isOpen,
  onClose,
  tournament,
  onSaveTournament,
  onResetAllToZero,
  onLoadDemoAthletes,
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
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTournament({
      ...tournament,
      ...form,
      tatamisCount: parseInt(form.tatamisCount, 10) || 1,
      feeSingleModality: parseFloat(form.feeSingleModality) || 0,
      feeDoubleModality: parseFloat(form.feeDoubleModality) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-tatami-200">
        <div className="bg-tatami-900 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-aka">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-aka-light" />
            <h2 className="text-sm font-semibold">Configuración del Torneo (Solo Administrador)</h2>
          </div>
          <button onClick={onClose} className="text-tatami-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
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

          {/* Cuotas de Ficha por Modalidad */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
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
          <div className="p-3 bg-tatami-50 border border-tatami-200 rounded-lg space-y-1">
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

          <div className="pt-3 border-t border-tatami-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetAllToZero}
                className="text-tatami-500 hover:text-red-700 text-xs flex items-center gap-1"
                title="Limpiar base de datos y dejar en 0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar a 0 atletas</span>
              </button>

              <button
                type="button"
                onClick={onLoadDemoAthletes}
                className="text-tatami-500 hover:text-sky-700 text-xs flex items-center gap-1"
                title="Cargar 12 atletas de prueba temporalmente"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cargar Atletas Prueba</span>
              </button>
            </div>

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
    </div>
  );
}
