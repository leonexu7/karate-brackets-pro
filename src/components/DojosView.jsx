import React, { useState } from 'react';
import { Shield, Users, Plus, Edit3, Trash2, Award, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function DojosView({
  dojos,
  athletes,
  teams,
  tournament,
  onAddDojo,
  onEditDojo,
  onDeleteDojo,
  onAddTeam,
  onDeleteTeam,
}) {
  const [activeSubTab, setActiveSubTab] = useState('dojos'); // 'dojos' o 'teams'

  // Modal rápido para Dojos
  const [showDojoModal, setShowDojoModal] = useState(false);
  const [editingDojo, setEditingDojo] = useState(null);
  const [dojoForm, setDojoForm] = useState({ name: '', sensei: '', city: '', phone: '' });

  // Modal rápido para Equipos
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    dojoId: dojos[0]?.id || '',
    modality: 'kumite_team',
    categoryName: 'Juvenil (14-17 años)',
    selectedMembers: [],
  });

  const handleOpenDojoModal = (dojo = null) => {
    if (dojo) {
      setEditingDojo(dojo);
      setDojoForm({ name: dojo.name, sensei: dojo.sensei, city: dojo.city, phone: dojo.phone || '' });
    } else {
      setEditingDojo(null);
      setDojoForm({ name: '', sensei: '', city: '', phone: '' });
    }
    setShowDojoModal(true);
  };

  const handleSaveDojo = (e) => {
    e.preventDefault();
    if (!dojoForm.name.trim()) return;

    if (editingDojo) {
      onEditDojo({ ...editingDojo, ...dojoForm });
    } else {
      onAddDojo({ id: `dojo-${Date.now()}`, ...dojoForm });
    }
    setShowDojoModal(false);
  };

  const handleSaveTeam = (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    onAddTeam({
      id: `team-${Date.now()}`,
      name: teamForm.name,
      dojoId: teamForm.dojoId,
      modality: teamForm.modality,
      categoryName: teamForm.categoryName,
      members: teamForm.selectedMembers,
    });
    setShowTeamModal(false);
    setTeamForm({
      name: '',
      dojoId: dojos[0]?.id || '',
      modality: 'kumite_team',
      categoryName: 'Juvenil (14-17 años)',
      selectedMembers: [],
    });
  };

  const toggleTeamMember = (athId) => {
    setTeamForm(prev => {
      const exists = prev.selectedMembers.includes(athId);
      const members = exists
        ? prev.selectedMembers.filter(id => id !== athId)
        : [...prev.selectedMembers, athId];
      return { ...prev, selectedMembers: members };
    });
  };

  return (
    <div className="space-y-4">
      {/* Selector de Sub-pestaña */}
      <div className="flex items-center justify-between border-b border-tatami-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('dojos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'dojos'
                ? 'bg-tatami-900 text-white'
                : 'text-tatami-600 hover:bg-tatami-100'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Escuelas & Dojos ({dojos.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'teams'
                ? 'bg-tatami-900 text-white'
                : 'text-tatami-600 hover:bg-tatami-100'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Equipos Registrados ({teams.length})</span>
          </button>
        </div>

        <div>
          {activeSubTab === 'dojos' ? (
            <button
              onClick={() => handleOpenDojoModal()}
              className="px-3 py-1.5 bg-tatami-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Dojo</span>
            </button>
          ) : (
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-3 py-1.5 bg-tatami-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Crear Equipo</span>
            </button>
          )}
        </div>
      </div>

      {/* VISTA 1: LISTADO DE DOJOS */}
      {activeSubTab === 'dojos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dojos.map(dojo => {
            const dojoAthletes = athletes.filter(a => a.dojoId === dojo.id);
            const feeSingle = tournament?.feeSingleModality !== undefined ? tournament.feeSingleModality : 300;
            const feeDouble = tournament?.feeDoubleModality !== undefined ? tournament.feeDoubleModality : 300;
            const dojoTotalFee = dojoAthletes.reduce((acc, a) => {
              const count = (a.modalities || []).length;
              return acc + (count >= 2 ? feeDouble : feeSingle);
            }, 0);

            return (
              <div key={dojo.id} className="bg-white p-4 rounded-xl border border-tatami-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold font-serif">
                      館
                    </div>
                    <div>
                      <h3 className="font-semibold text-tatami-900 text-sm leading-tight">{dojo.name}</h3>
                      <div className="text-[11px] text-tatami-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-tatami-400" /> {dojo.city || 'Ciudad no especificada'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDojoModal(dojo)}
                      className="p-1 text-tatami-400 hover:text-tatami-800 rounded hover:bg-tatami-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDojo(dojo.id)}
                      className="p-1 text-tatami-400 hover:text-aka rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1 bg-tatami-50 p-2.5 rounded-lg border border-tatami-100">
                  <div className="text-tatami-700 font-medium">
                    Sensei: <span className="font-semibold text-tatami-900">{dojo.sensei || 'Por asignar'}</span>
                  </div>
                  {dojo.phone && (
                    <div className="text-tatami-500 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {dojo.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-tatami-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-tatami-500">Inscritos en Torneo:</span>
                    <span className="font-bold text-tatami-900 bg-tatami-100 px-2 py-0.5 rounded-full">
                      {dojoAthletes.length} atletas
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50 px-2.5 py-1 rounded-md text-emerald-900 text-[11px] font-semibold">
                    <span>Fichas a liquidar:</span>
                    <span className="font-mono font-bold">${dojoTotalFee.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: LISTADO DE EQUIPOS */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full py-10 text-center text-tatami-400 bg-white rounded-xl border border-tatami-200">
              No hay equipos registrados aún. Crea uno con el botón superior.
            </div>
          ) : (
            teams.map(team => {
              const dojo = dojos.find(d => d.id === team.dojoId);
              const memberAthletes = athletes.filter(a => (team.members || []).includes(a.id));
              return (
                <div key={team.id} className="bg-white p-4 rounded-xl border border-tatami-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-aka px-1.5 py-0.5 bg-aka-light rounded">
                        {team.modality === 'kata_team' ? 'Kata Equipos' : 'Kumite Equipos'}
                      </span>
                      <h3 className="font-semibold text-tatami-900 text-sm mt-1">{team.name}</h3>
                      <div className="text-xs text-tatami-500 font-medium">{dojo?.name} • {team.categoryName}</div>
                    </div>
                    <button
                      onClick={() => onDeleteTeam(team.id)}
                      className="p-1 text-tatami-400 hover:text-aka rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-tatami-600">Integrantes del Equipo:</span>
                    <ul className="text-xs divide-y divide-tatami-100 bg-tatami-50 rounded-lg p-2 border border-tatami-100">
                      {memberAthletes.length === 0 ? (
                        <li className="text-tatami-400 italic text-[11px]">Sin integrantes seleccionados</li>
                      ) : (
                        memberAthletes.map(m => (
                          <li key={m.id} className="py-1 flex justify-between">
                            <span className="font-medium text-tatami-800">{m.fullName}</span>
                            <span className="text-tatami-500 text-[11px]">{m.weight ? m.weight + 'kg' : ''}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Agregar/Editar Dojo */}
      {showDojoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-tatami-200">
            <div className="bg-tatami-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="text-sm font-semibold">{editingDojo ? 'Editar Dojo' : 'Registrar Nuevo Dojo'}</h3>
              <button onClick={() => setShowDojoModal(false)} className="text-tatami-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveDojo} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-tatami-700 mb-1">Nombre del Dojo / Escuela *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bushido Karate Kai"
                  value={dojoForm.name}
                  onChange={(e) => setDojoForm({ ...dojoForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
                />
              </div>
              <div>
                <label className="block font-semibold text-tatami-700 mb-1">Sensei / Entrenador Responsable *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sensei Roberto Tanaka (5º Dan)"
                  value={dojoForm.sensei}
                  onChange={(e) => setDojoForm({ ...dojoForm, sensei: e.target.value })}
                  className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-tatami-700 mb-1">Ciudad / Estado</label>
                  <input
                    type="text"
                    placeholder="Ej. CDMX"
                    value={dojoForm.city}
                    onChange={(e) => setDojoForm({ ...dojoForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-tatami-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="55 0000 0000"
                    value={dojoForm.phone}
                    onChange={(e) => setDojoForm({ ...dojoForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden focus:ring-1 focus:ring-aka"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-tatami-200">
                <button
                  type="button"
                  onClick={() => setShowDojoModal(false)}
                  className="px-3 py-1.5 text-tatami-600 hover:bg-tatami-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-tatami-900 hover:bg-black text-white font-semibold rounded"
                >
                  Guardar Dojo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Equipo */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-tatami-200">
            <div className="bg-tatami-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="text-sm font-semibold">Registrar Equipo de Competencia</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-tatami-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-tatami-700 mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Shito Ryu Águilas Kumite"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-tatami-300 rounded-md outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-tatami-700 mb-1">Dojo Perteneciente *</label>
                  <select
                    value={teamForm.dojoId}
                    onChange={(e) => setTeamForm({ ...teamForm, dojoId: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-tatami-300 rounded-md bg-white"
                  >
                    {dojos.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-tatami-700 mb-1">Modalidad *</label>
                  <select
                    value={teamForm.modality}
                    onChange={(e) => setTeamForm({ ...teamForm, modality: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-tatami-300 rounded-md bg-white"
                  >
                    <option value="kumite_team">Kumite en Equipos (Combate)</option>
                    <option value="kata_team">Kata en Equipos (Formas Sincronizadas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-tatami-700 mb-1">
                  Seleccionar Atletas del Dojo ({athletes.filter(a => a.dojoId === teamForm.dojoId).length} disponibles):
                </label>
                <div className="max-h-36 overflow-y-auto border border-tatami-200 rounded-md p-2 divide-y divide-tatami-100 bg-tatami-50">
                  {athletes.filter(a => a.dojoId === teamForm.dojoId).map(ath => {
                    const isChecked = teamForm.selectedMembers.includes(ath.id);
                    return (
                      <label key={ath.id} className="py-1 flex items-center justify-between cursor-pointer hover:bg-tatami-100 px-1 rounded">
                        <span className="font-medium text-tatami-800">{ath.fullName}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTeamMember(ath.id)}
                          className="rounded text-aka focus:ring-aka"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-tatami-200">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-3 py-1.5 text-tatami-600 hover:bg-tatami-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-tatami-900 hover:bg-black text-white font-semibold rounded"
                >
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
