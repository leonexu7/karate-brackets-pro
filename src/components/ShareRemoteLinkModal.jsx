import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Globe, Wifi, QrCode, Sparkles } from 'lucide-react';

export default function ShareRemoteLinkModal({
  isOpen,
  onClose,
  tournament,
}) {
  const [copied, setCopied] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  // Detectar URL en vivo o URL actual
  const liveProductionUrl = 'https://leonexu7.github.io/karate-brackets-pro/';
  const currentUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? liveProductionUrl
        : window.location.href.split('#')[0].split('?')[0])
    : liveProductionUrl;

  const finalShareUrl = customUrl.trim() || currentUrl;

  const invitationMessage =
    `🥋 *CONVOCATORIA Y REGISTRO OFICIAL - ${tournament?.name || 'TORNEO DE KARATE SHITO-KAI'}*\n\n` +
    `Estimados Senseis, Profesores y Dojos afiliados:\n` +
    `Ya se encuentra habilitada la plataforma oficial de registro de competidores.\n\n` +
    `📋 *Instrucciones para Profesores:*\n` +
    `1. Ingresen al enlace oficial abajo desde su celular o computadora.\n` +
    `2. Escriban el nombre oficial de su Dojo y Sensei.\n` +
    `3. Inscriban a sus competidores uno a uno o descarguen la plantilla oficial de Excel para carga masiva.\n` +
    `4. El sistema calculará automáticamente sus categorías, cuartetas y cuotas de ficha.\n\n` +
    `🔗 *Enlace de Inscripción:* ${finalShareUrl}\n\n` +
    `*Fecha del Torneo:* ${tournament?.date || '2026'}\n` +
    `*Sede:* ${tournament?.venue || 'Gimnasio Oficial'}\n\n` +
    `⚠️ _Los datos se guardan en tiempo real en la mesa central para la elaboración de las llaves de competencia._`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(invitationMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-rose-500">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold">Enlace Remoto de Inscripción para Profesores</h2>
              <p className="text-xs text-slate-400">Comparte este enlace para que inscriban a sus alumnos desde cualquier lugar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Explicación de cómo funciona */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-emerald-900">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>¿Cómo funciona el registro remoto?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Cualquier profesor que abra este enlace en su celular o computadora verá únicamente el portal de inscripción para su escuela (sin ver a otros dojos). 
              Todo lo que registren se guarda automáticamente en tu base de datos central y actualiza las llaves de tatami en vivo.
            </p>
          </div>

          {/* Enlace para compartir */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-600" />
              <span>Enlace Directo para los Maestros:</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={finalShareUrl}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 font-semibold select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Opciones de conexión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Wifi className="w-3.5 h-3.5 text-sky-600" />
                <span>En la misma red Wi-Fi:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Cualquier celular o laptop conectado a la misma red de tu casa, dojo o gimnasio puede entrar con:
              </p>
              <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-900 font-mono text-[11px] break-all">
                {localNetworkUrl}
              </code>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Globe className="w-3.5 h-3.5 text-rose-600" />
                <span>Por Internet / Fuera de Wi-Fi:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Puedes abrir un túnel público gratis en 5 segundos ejecutando en tu terminal:
              </p>
              <code className="block bg-slate-900 text-emerald-300 p-1.5 rounded font-mono text-[10px]">
                npx localtunnel --port 3000
              </code>
              <p className="text-[10px] text-slate-500">
                O publicar la app en Vercel/Render para tener un dominio permanente gratuito.
              </p>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopyInvitation}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Mensaje Completo</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Compartir en WhatsApp con Profesores</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
