import React, { useState } from 'react';
import { Lock, Key, X, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  actualAdminKey = 'karate2026',
}) {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputKey === actualAdminKey) {
      setInputKey('');
      onLoginSuccess();
      onClose();
    } else {
      setErrorMsg('Clave de seguridad incorrecta. Solo el comité organizador puede acceder.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-tatami-200">
        {/* Cabecera */}
        <div className="bg-tatami-900 text-white px-5 py-4 flex items-center justify-between border-b-2 border-aka">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-aka-light" />
            <h3 className="font-semibold text-sm">Acceso Administrador (Organizador)</h3>
          </div>
          <button onClick={onClose} className="text-tatami-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="text-tatami-600 space-y-1">
            <p>
              Ingresa la clave de seguridad para acceder a la <strong>Mesa de Control</strong>:
            </p>
            <ul className="list-disc pl-4 text-[11px] text-tatami-500 space-y-0.5">
              <li>Ver todas las gráficas y llaves de combate.</li>
              <li>Imprimir los PDFs oficiales para jueces de tatami.</li>
              <li>Modificar fechas y ajustes del torneo.</li>
              <li>Ver padrón general de todos los dojos participantes.</li>
            </ul>
          </div>

          <div>
            <label className="block font-semibold text-tatami-700 mb-1">Clave de Seguridad *</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                placeholder="Ingresa la clave maestra"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 pr-10 border border-tatami-300 rounded-lg outline-hidden focus:ring-2 focus:ring-aka focus:border-aka text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-tatami-400 hover:text-tatami-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-tatami-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-tatami-600 hover:bg-tatami-100 rounded text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-tatami-900 hover:bg-black text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-aka-light" />
              <span>Desbloquear Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
