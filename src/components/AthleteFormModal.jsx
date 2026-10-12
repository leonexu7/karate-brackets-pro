import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Scale, Ruler, Award, CheckCircle2, TrendingUp, Lock, Sparkles } from 'lucide-react';
import {
  KYUS,
  KYU_CATEGORIES,
  getKyuInfo,
  getKyuCategoryInfo,
  canCompeteInCategory,
  resolveCompetingCategory
} from '../constants/belts';
import { MODALITIES, calculateAge, findAgeDivision, findWeightDivision } from '../constants/categories';

export default function AthleteFormModal({
  isOpen,
  onClose,
  onSave,
  athleteToEdit,
  dojos,
  tournamentDate,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: 'M',
    beltId: '10_kyu',
    competingCategory: 'cat_10_8',
    weight: '',
    height: '',
    dojoId: dojos[0]?.id || '',
    modalities: ['kumite_ind', 'kata_ind'],
  });

  const [suggestedInfo, setSuggestedInfo] = useState(null);

  useEffect(() => {
    if (athleteToEdit) {
      const kyu = getKyuInfo(athleteToEdit.beltId);
      const compCat = athleteToEdit.competingCategory || kyu.naturalCategory;
      setFormData({
        fullName: athleteToEdit.fullName || '',
        birthDate: athleteToEdit.birthDate || '',
        gender: athleteToEdit.gender || 'M',
        beltId: kyu.id,
        competingCategory: compCat,
        weight: athleteToEdit.weight !== undefined && athleteToEdit.weight !== null ? athleteToEdit.weight : '',
        height: athleteToEdit.height !== undefined && athleteToEdit.height !== null ? athleteToEdit.height : '',
        dojoId: athleteToEdit.dojoId || dojos[0]?.id || '',
        modalities: athleteToEdit.modalities || ['kumite_ind'],
      });
    } else {
      setFormData({
        fullName: '',
        birthDate: '',
        gender: 'M',
        beltId: '10_kyu',
        competingCategory: 'cat_10_8',
        weight: '',
        height: '',
        dojoId: dojos[0]?.id || '',
        modalities: ['kumite_ind', 'kata_ind'],
      });
    }
  }, [athleteToEdit, dojos, isOpen]);

  const handleKyuChange = (newBeltId) => {
    const kyu = getKyuInfo(newBeltId);
    setFormData(prev => {
      const isAllowed = canCompeteInCategory(newBeltId, prev.competingCategory);
      return {
        ...prev,
        beltId: newBeltId,
        competingCategory: isAllowed ? prev.competingCategory : kyu.naturalCategory,
      };
    });
  };

  useEffect(() => {
    if (!formData.birthDate) {
      setSuggestedInfo(null);
      return;
    }

    const age = calculateAge(formData.birthDate, tournamentDate);
    if (age === null || isNaN(age)) {
      setSuggestedInfo(null);
      return;
    }

    const ageDiv = findAgeDivision(age);
    const weightNum = parseFloat(formData.weight) || 0;
    const weightDiv = ageDiv.hasWeightDivisions
      ? findWeightDivision(ageDiv.id, formData.gender, weightNum)
      : null;
    const kyuInfo = getKyuInfo(formData.beltId);
    const targetCatId = resolveCompetingCategory(formData.beltId, formData.competingCategory);
    const categoryInfo = getKyuCategoryInfo(targetCatId);

    setSuggestedInfo({
      age,
      ageDiv,
      weightDiv,
      kyuInfo,
      categoryInfo,
      isCuarteta: ageDiv.format === 'cuarteta',
    });
  }, [formData.birthDate, formData.gender, formData.weight, formData.beltId, formData.competingCategory, tournamentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const kyu = getKyuInfo(formData.beltId);
    const finalCompCat = resolveCompetingCategory(formData.beltId, formData.competingCategory);
    const catInfo = getKyuCategoryInfo(finalCompCat);

    onSave({
      ...(athleteToEdit || {}),
      id: athleteToEdit?.id || `ath-${Date.now()}`,
      fullName: formData.fullName.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      beltId: kyu.id,
      kyuName: kyu.name,
      competingCategory: finalCompCat,
      competingCategoryName: catInfo.name,
      weight: formData.weight !== '' ? parseFloat(formData.weight) : null,
      height: formData.height !== '' ? parseFloat(formData.height) : null,
      dojoId: formData.dojoId,
      modalities: formData.modalities.length > 0 ? formData.modalities : ['kumite_ind'],
    });

    onClose();
  };

  const handleModalityToggle = (modId) => {
    setFormData(prev => {
      const exists = prev.modalities.includes(modId);
      const updated = exists ? prev.modalities.filter(m => m !== modId) : [...prev.modalities, modId];
      return { ...prev, modalities: updated };
    });
  };

  const currentKyu = getKyuInfo(formData.beltId);
  const naturalCategory = getKyuCategoryInfo(currentKyu.naturalCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-rose-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm sm:text-base font-semibold">
              {athleteToEdit ? 'Editar Competidor' : 'Inscribir Competidor (Panel Admin)'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Atleta *</label>
              <input
                type="text"
                required
                placeholder="Ej. Mateo Tanaka Solís"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Escuela / Dojo *</label>
              <select
                value={formData.dojoId}
                onChange={(e) => setFormData({ ...formData, dojoId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                {dojos.length === 0 ? (
                  <option value="">(No hay dojos registrados aún)</option>
                ) : (
                  dojos.map(dojo => (
                    <option key={dojo.id} value={dojo.id}>{dojo.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rama / Sexo *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'M' })}
                  className={`py-2 text-center rounded-lg border font-semibold transition-colors ${
                    formData.gender === 'M'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Varonil (M)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'F' })}
                  className={`py-2 text-center rounded-lg border font-semibold transition-colors ${
                    formData.gender === 'F'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Femenil (F)
                </button>
              </div>
            </div>
          </div>

          {/* Grado KYU (Sin colores) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                Grado Técnico KYU *
              </label>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {currentKyu.name}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
              {KYUS.map(kyu => (
                <button
                  key={kyu.id}
                  type="button"
                  onClick={() => handleKyuChange(kyu.id)}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    formData.beltId === kyu.id
                      ? 'border-slate-900 bg-slate-900 text-white font-bold ring-2 ring-rose-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{kyu.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Categoría de Competencia */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span>Categoría de Competencia (Permite subir de grado)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {KYU_CATEGORIES.map(cat => {
                const isAllowed = canCompeteInCategory(formData.beltId, cat.id);
                const isSelected = formData.competingCategory === cat.id;
                const isPromotion = cat.rank > naturalCategory.rank;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={!isAllowed}
                    onClick={() => {
                      if (isAllowed) setFormData({ ...formData, competingCategory: cat.id });
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      !isAllowed
                        ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-white border-rose-500 ring-2 ring-rose-400 font-bold text-slate-900 shadow-xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{cat.name}</span>
                      {!isAllowed && <Lock className="w-3 h-3 text-slate-400" />}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {!isAllowed ? 'Bloqueado (inferior)' : cat.shortName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                Peso en Báscula (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="150"
                placeholder="Ej. 24.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-slate-500" />
                Estatura (cm) - Opcional
              </label>
              <input
                type="number"
                step="1"
                min="80"
                max="220"
                placeholder="Ej. 125"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Modalidades</label>
            <div className="grid grid-cols-2 gap-2">
              {MODALITIES.filter(m => m.type === 'individual').map(m => {
                const checked = formData.modalities.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModalityToggle(m.id)}
                    className={`py-2 px-3 rounded-lg border font-medium flex items-center justify-between transition-colors ${
                      checked
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.name}</span>
                    <CheckCircle2 className={`w-4 h-4 ${checked ? 'text-emerald-400' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {suggestedInfo && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Clasificación: {suggestedInfo.age} años ({suggestedInfo.ageDiv.name}) • Categoría: <strong>{suggestedInfo.categoryInfo.name}</strong>
                </span>
              </div>
              {suggestedInfo.isCuarteta ? (
                <div className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] font-medium">
                  🏅 <strong>Cuarteta Formativa:</strong> 4 medallas garantizadas para todos los integrantes.
                </div>
              ) : suggestedInfo.ageDiv.hasWeightDivisions ? (
                <div className="text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200 text-[11px]">
                  ⚖️ <strong>División WKF por Peso:</strong> {suggestedInfo.weightDiv?.name || 'Requiere peso'} (Gráfica oficial).
                </div>
              ) : (
                <div className="text-slate-700 bg-slate-100 p-2 rounded-lg text-[11px]">
                  🥋 Gráfica oficial por grado y edad.
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {athleteToEdit ? 'Guardar Cambios' : 'Completar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
