import React from 'react';
import { X, Coins, MessageSquare, Phone, Printer, CheckCircle2, Shield, User } from 'lucide-react';

export default function TreasuryReportModal({
  isOpen,
  onClose,
  tournament,
  dojos,
  athletes,
}) {
  if (!isOpen) return null;

  const feeSingle = tournament?.feeSingleModality !== undefined ? tournament.feeSingleModality : 300;
  const feeDouble = tournament?.feeDoubleModality !== undefined ? tournament.feeDoubleModality : 300;

  // Calcular desglose por cada dojo
  const dojosLedger = (dojos || []).map(dojo => {
    const dojoAthletes = (athletes || []).filter(a => a.dojoId === dojo.id);
    const singleCount = dojoAthletes.filter(a => (a.modalities || []).length === 1).length;
    const doubleCount = dojoAthletes.filter(a => (a.modalities || []).length >= 2).length;
    const totalDue = (singleCount * feeSingle) + (doubleCount * feeDouble);

    return {
      ...dojo,
      athletesCount: dojoAthletes.length,
      singleCount,
      doubleCount,
      totalDue,
    };
  });

  const grandTotalRevenue = dojosLedger.reduce((acc, d) => acc + d.totalDue, 0);
  const totalRegisteredAthletes = (athletes || []).length;

  const handleSendWhatsAppNotification = (dojo) => {
    const phone = (dojo.phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `🥋 *COMITÉ ORGANIZADOR - ${tournament.name || 'COPA SHITO-KAI 2026'}*\n\n` +
      `Estimado Sensei *${dojo.sensei || 'Profesor'}* (${dojo.name}):\n` +
      `Confirmamos el registro oficial de su escuela con *${dojo.athletesCount} competidores*.\n\n` +
      `📋 *Desglose de Fichas:*\n` +
      `• 1 Modalidad: ${dojo.singleCount} atleta(s) ($${dojo.singleCount * feeSingle} MXN)\n` +
      `• 2 Modalidades: ${dojo.doubleCount} atleta(s) ($${dojo.doubleCount * feeDouble} MXN)\n\n` +
      `💰 *MONTO TOTAL A LIQUIDAR EN MESA:* $${dojo.totalDue.toLocaleString('es-MX')} MXN\n\n` +
      `Favor de presentar este comprobante en la mesa de control el día del evento. ¡Mucho éxito en el tatami!`
    );

    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handlePrintTable = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-emerald-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <Coins className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Mesa de Tesorería: Estado de Cobro por Dojos</h2>
              <p className="text-xs text-slate-400">Control de cuotas y cobranza oficial por entrenador</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Global */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 font-medium text-[11px]">Dojos / Escuelas Registradas</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{dojosLedger.length}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 font-medium text-[11px]">Total Competidores Inscritos</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{totalRegisteredAthletes} atletas</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-xl">
              <span className="text-emerald-100 font-semibold text-[11px]">RECAUDACIÓN TOTAL ESPERADA</span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight mt-0.5">
                ${grandTotalRevenue.toLocaleString('es-MX')} MXN
              </div>
            </div>
          </div>

          {/* Tabla de Cobranza por Dojos */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Dojo / Escuela</th>
                    <th className="py-3 px-3">Sensei / Entrenador</th>
                    <th className="py-3 px-3 text-center">Atletas</th>
                    <th className="py-3 px-3">Desglose Fichas</th>
                    <th className="py-3 px-4 text-right">Total a Pagar</th>
                    <th className="py-3 px-4 text-center">Notificar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dojosLedger.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No hay dojos con atletas inscritos aún.
                      </td>
                    </tr>
                  ) : (
                    dojosLedger.map((d, i) => (
                      <tr key={d.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500">{d.city || 'S/D'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {d.sensei || 'Por asignar'}
                          </div>
                          {d.phone && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {d.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                            {d.athletesCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <div>1 mod: <strong>{d.singleCount}</strong> (${d.singleCount * feeSingle})</div>
                          <div>2 mod: <strong>{d.doubleCount}</strong> (${d.doubleCount * feeDouble})</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                            ${d.totalDue.toLocaleString('es-MX')} MXN
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppNotification(d)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                            title="Enviar estado de cuenta por WhatsApp al Sensei"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Cobro WA</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-500 text-[11px]">
            * Las cuotas se calculan en base a $ {feeSingle} (1 modalidad) y $ {feeDouble} (2 modalidades) por ficha.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintTable}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Hoja de Tesorería</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
