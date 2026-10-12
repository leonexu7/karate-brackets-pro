import React, { useState, useEffect } from 'react';
import { X, Cloud, Check, Copy, ExternalLink, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  removeFirebaseConfig,
  initFirebase,
  getDb
} from '../services/firebase';

export default function CloudConfigModal({
  isOpen,
  onClose,
  onConfigChanged,
}) {
  const [pasteBlock, setPasteBlock] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const [isConnected, setIsConnected] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredFirebaseConfig();
      if (current) {
        setApiKey(current.apiKey || '');
        setProjectId(current.projectId || '');
        setAuthDomain(current.authDomain || '');
        setStorageBucket(current.storageBucket || '');
        setMessagingSenderId(current.messagingSenderId || '');
        setAppId(current.appId || '');
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
      setTestStatus(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Analizar automáticamente el bloque pegado de la consola de Firebase
  const handleAutoParse = (text) => {
    setPasteBlock(text);
    if (!text.trim()) return;

    // Buscar apiKey: "..." o '...'
    const extract = (key) => {
      const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
      const match = text.match(regex);
      return match ? match[1] : '';
    };

    const parsedApiKey = extract('apiKey');
    const parsedProjectId = extract('projectId');
    const parsedAuthDomain = extract('authDomain');
    const parsedStorageBucket = extract('storageBucket');
    const parsedSenderId = extract('messagingSenderId');
    const parsedAppId = extract('appId');

    if (parsedApiKey) setApiKey(parsedApiKey);
    if (parsedProjectId) setProjectId(parsedProjectId);
    if (parsedAuthDomain) setAuthDomain(parsedAuthDomain);
    if (parsedStorageBucket) setStorageBucket(parsedStorageBucket);
    if (parsedSenderId) setMessagingSenderId(parsedSenderId);
    if (parsedAppId) setAppId(parsedAppId);
  };

  const handleSaveAndTest = async () => {
    if (!apiKey.trim() || !projectId.trim()) {
      alert('Por favor ingresa al menos la API Key y el Project ID de Firebase.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(newConfig);

    try {
      const db = initFirebase();
      if (db) {
        setTestStatus('success');
        setIsConnected(true);
        if (onConfigChanged) onConfigChanged(true);
      } else {
        throw new Error('No se pudo inicializar la conexión con Firebase.');
      }
    } catch (err) {
      console.error('Error probando Firebase:', err);
      setTestStatus('error');
      setErrorMessage(err.message || 'Error de conexión.');
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('¿Deseas desconectar la nube de Firebase? El sistema volverá a guardar en tu computadora local.')) {
      removeFirebaseConfig();
      setApiKey('');
      setProjectId('');
      setAuthDomain('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setPasteBlock('');
      setIsConnected(false);
      setTestStatus(null);
      if (onConfigChanged) onConfigChanged(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-sky-500">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold">Base de Datos en la Nube (Google Firebase)</h2>
              <p className="text-xs text-slate-400">Permite inscripciones 24/7 sin que tu laptop esté prendida</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto max-h-[80vh]">
          {/* Banner de Estado */}
          {isConnected ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <Check className="w-4 h-4 font-bold" />
              </span>
              <div className="space-y-0.5 text-emerald-900">
                <div className="font-bold text-sm">Nube Conectada y Activa</div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Todas las inscripciones enviadas por los maestros se guardan en la nube de Google Firebase en tiempo real. 
                  Tu laptop puede estar apagada y nadie perderá datos.
                </p>
                <div className="pt-1 font-mono text-[10px] text-emerald-700">
                  Proyecto activo: <strong>{projectId}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-amber-900">
                <div className="font-bold text-xs">Actualmente en modo Servidor Local</div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Para que la página funcione 24/7 sin depender de que tu laptop esté prendida, conecta tu proyecto gratuito de Google Firebase abajo. Solo toma 2 minutos.
                </p>
              </div>
            </div>
          )}

          {/* Guía rápida de 3 pasos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>¿Cómo obtener las claves gratis en 2 minutos?</span>
              </span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 text-[11px] underline"
              >
                <span>Abrir Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pl-1">
              <li>Inicia sesión con tu cuenta de Google en <strong>console.firebase.google.com</strong> y da clic en <strong>"Crear un proyecto"</strong> (ej. <em>Copa Karate 2026</em>).</li>
              <li>En el menú izquierdo ve a <strong>Compilación &gt; Firestore Database</strong> y haz clic en <strong>"Crear base de datos"</strong> (inicia en <em>Modo de prueba</em>).</li>
              <li>En la pantalla principal del proyecto, haz clic en el icono web <strong>(&lt;/&gt;)</strong> para registrar la app y copia el bloque de código <code>firebaseConfig</code>.</li>
            </ol>
          </div>

          {/* Pegar Bloque Completo */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>Opción Rápida: Pega el bloque de código de Firebase aquí:</span>
              <span className="text-[10px] text-slate-500 font-normal">Se autocompletarán los campos automáticamente</span>
            </label>
            <textarea
              rows={3}
              value={pasteBlock}
              onChange={(e) => handleAutoParse(e.target.value)}
              placeholder='const firebaseConfig = { apiKey: "AIzaSy...", projectId: "mi-torneo-2026", ... };'
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Campos individuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-[11px]">API Key *</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyB3..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-[11px]">Project ID *</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="torneo-karate-2026"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-[11px]">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="torneo-karate-2026.firebaseapp.com"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-[11px]">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Mensajes de prueba */}
          {testStatus === 'success' && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg font-medium text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>¡Conexión establecida con éxito! La nube de Google Firebase está activa y lista.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-rose-100 text-rose-800 rounded-lg font-medium text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Error de conexión: {errorMessage}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <div>
              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Desconectar Nube
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveAndTest}
                disabled={testStatus === 'testing'}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Guardar y Conectar a la Nube</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
