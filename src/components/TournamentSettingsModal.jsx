import React, { useState } from 'react';
import { X, Settings, Calendar, MapPin, Shield, RefreshCw, Key, Trash2, Coins, AlertTriangle, Download, Scale, Users, Plus, RotateCcw, Copy, Check, Upload, Image as ImageIcon, Sliders, Palette, Lock, Clock, Layers, Tag, Type } from 'lucide-react';
import { ShitoKaiLogo } from '../assets/shitoKaiLogo';
import sakuraTreeImg from '../assets/sakura_tree.png';
import { DEMO_ATHLETES, DEMO_DOJOS } from '../constants/mockData';
import { DEFAULT_WEIGHT_DIVISIONS, PRESETS_2_WEIGHTS, PRESETS_3_WEIGHTS } from '../constants/categories';

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
    registrationDeadline: tournament.registrationDeadline || '',
    groupByModalityProfile: tournament.groupByModalityProfile !== undefined ? tournament.groupByModalityProfile : true,
    customLogo: tournament.customLogo || null,
    customBg: tournament.customBg || null,
    bgOpacity: tournament.bgOpacity !== undefined ? tournament.bgOpacity : 0.20,
    bgFit: tournament.bgFit || 'contain',
    bannerBadgeText: tournament.bannerBadgeText || 'Shito-Kai México',
    navbarBadgeText: tournament.navbarBadgeText || 'SHITO-KAI',
    badgeBgColor: tournament.badgeBgColor || '#FFF1F2',
    badgeBorderColor: tournament.badgeBorderColor || '#FECDD3',
    badgeTextColor: tournament.badgeTextColor || '#BE123C',
  });

  const [activeAgeTab, setActiveAgeTab] = useState('senior'); // 'senior' | '16-17' | '14-15'
  const [activeGender, setActiveGender] = useState('M'); // 'M' | 'F'
  const [weightDivisions, setWeightDivisions] = useState(() => {
    return tournament.weightDivisions
      ? JSON.parse(JSON.stringify(tournament.weightDivisions))
      : JSON.parse(JSON.stringify(DEFAULT_WEIGHT_DIVISIONS));
  });
  const [actionFeedback, setActionFeedback] = useState('');

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const showTempFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(''), 2500);
  };

  const handleUpdateWeightDivision = (index, field, value) => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];

      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        if (!next[ageKey][activeGender]) next[ageKey][activeGender] = [];
        if (next[ageKey][activeGender][index]) {
          next[ageKey][activeGender][index][field] = value;

          // Sugerir nombre automático al cambiar los valores de peso
          if (field === 'max' && value !== null && value !== '' && !isNaN(value)) {
            const num = parseFloat(value);
            const oldName = next[ageKey][activeGender][index].name || '';
            if (oldName.startsWith('-') || oldName.endsWith('kg') || oldName === '') {
              next[ageKey][activeGender][index].name = `-${num} kg`;
            }
          } else if (field === 'min' && (next[ageKey][activeGender][index].max === null || next[ageKey][activeGender][index].max === '') && value !== null && value !== '' && !isNaN(value)) {
            const num = parseFloat(value);
            const oldName = next[ageKey][activeGender][index].name || '';
            if (oldName.startsWith('+') || oldName.endsWith('kg') || oldName === '') {
              next[ageKey][activeGender][index].name = `+${Math.floor(num)} kg`;
            }
          }
        }
      });
      return next;
    });
  };

  const handleAddWeightDivision = () => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];

      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        if (!next[ageKey][activeGender]) next[ageKey][activeGender] = [];

        const list = next[ageKey][activeGender];
        const lastItem = list[list.length - 1];
        let newMin = null;
        let newMax = 80;
        let newName = '-80 kg';

        if (lastItem) {
          if (lastItem.max) {
            newMin = parseFloat(lastItem.max) + 0.01;
            newMax = Math.round(parseFloat(lastItem.max) + 8);
            newName = `-${newMax} kg`;
          } else if (lastItem.min) {
            newMin = parseFloat(lastItem.min) + 5;
            newMax = Math.round(newMin + 7);
            newName = `-${newMax} kg`;
          }
        }

        const newId = `custom-${ageKey}-${activeGender.toLowerCase()}-${Date.now()}`;
        list.push({
          id: newId,
          name: newName,
          min: newMin,
          max: newMax,
        });
      });
      return next;
    });
    showTempFeedback('Categoría de peso añadida');
  };

  const handleDeleteWeightDivision = (index) => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];
      targetAgeKeys.forEach(ageKey => {
        if (next[ageKey]?.[activeGender] && next[ageKey][activeGender].length > 1) {
          next[ageKey][activeGender].splice(index, 1);
        }
      });
      return next;
    });
    showTempFeedback('Categoría de peso eliminada');
  };

  const handleResetToWKF = () => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const defaultData = JSON.parse(JSON.stringify(DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];
      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        next[ageKey][activeGender] = JSON.parse(JSON.stringify(defaultData[ageKey][activeGender]));
      });
      return next;
    });
    showTempFeedback('Restablecido a pesos oficiales WKF');
  };

  const handleApply2WeightsPreset = () => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];
      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        next[ageKey][activeGender] = JSON.parse(JSON.stringify(PRESETS_2_WEIGHTS[activeGender]));
      });
      return next;
    });
    showTempFeedback('Preset de 2 pesos aplicado');
  };

  const handleApply3WeightsPreset = () => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];
      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        next[ageKey][activeGender] = JSON.parse(JSON.stringify(PRESETS_3_WEIGHTS[activeGender]));
      });
      return next;
    });
    showTempFeedback('Preset de 3 pesos aplicado');
  };

  const handleCopyWeightsToOtherGender = () => {
    const targetGender = activeGender === 'M' ? 'F' : 'M';
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const source = next[activeAgeTab]?.[activeGender] || [];
      const targetAgeKeys = activeAgeTab === 'senior' ? ['senior', '18-20'] : [activeAgeTab];
      targetAgeKeys.forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        next[ageKey][targetGender] = JSON.parse(JSON.stringify(source));
      });
      return next;
    });
    showTempFeedback(`Pesos copiados a Rama ${targetGender === 'M' ? 'Varonil' : 'Femenil'}`);
  };

  const handleCopyWeightsToAllAges = () => {
    setWeightDivisions(prev => {
      const next = JSON.parse(JSON.stringify(prev || DEFAULT_WEIGHT_DIVISIONS));
      const sourceM = next[activeAgeTab]?.M || [];
      const sourceF = next[activeAgeTab]?.F || [];
      ['14-15', '16-17', '18-20', 'senior'].forEach(ageKey => {
        if (!next[ageKey]) next[ageKey] = { M: [], F: [] };
        next[ageKey].M = JSON.parse(JSON.stringify(sourceM));
        next[ageKey].F = JSON.parse(JSON.stringify(sourceF));
      });
      return next;
    });
    showTempFeedback('Pesos aplicados a todas las edades (Cadetes, Juniors y Adultos)');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 8 MB. Por favor elige una imagen más ligera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar a máx 400x400 para mantener el localStorage ligero y optimizado
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL('image/png');
        setForm(prev => ({ ...prev, customLogo: base64Data }));
        showTempFeedback('Logotipo personalizado cargado con éxito');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setForm(prev => ({ ...prev, customLogo: null }));
    showTempFeedback('Restablecido al escudo Shito-Kai');
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 15 MB. Por favor elige una imagen más ligera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para mantener localStorage ligero y rápido (< 250 KB)
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const base64Data = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82);

        setForm(prev => ({
          ...prev,
          customBg: base64Data,
          bgFit: prev.bgFit || 'cover',
        }));
        showTempFeedback('Fondo personalizado cargado con éxito');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetBackground = () => {
    setForm(prev => ({
      ...prev,
      customBg: null,
      bgOpacity: 0.20,
      bgFit: 'contain',
    }));
    showTempFeedback('Restablecido al fondo predeterminado (Cerezo Sakura)');
  };

  const handleSetDeadlinePreset = (offsetDays, timeStr = '23:59') => {
    if (!form.date) {
      alert('Primero especifica la Fecha del Torneo para calcular el cierre automático.');
      return;
    }
    try {
      const [y, m, d] = form.date.split('-').map(Number);
      const target = new Date(y, m - 1, d + offsetDays);
      const pad = (n) => String(n).padStart(2, '0');
      const targetStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${timeStr}`;
      setForm(prev => ({ ...prev, registrationDeadline: targetStr }));
      showTempFeedback(`Fecha límite ajustada (${offsetDays === 0 ? 'mismo día' : `${Math.abs(offsetDays)} día(s) antes`})`);
    } catch (_) {}
  };

  const formatDeadlineDisplay = (dtStr) => {
    if (!dtStr) return '';
    try {
      const d = new Date(dtStr.includes('T') ? dtStr : `${dtStr}T23:59:59`);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return dtStr;
    }
  };

  const currentList = weightDivisions?.[activeAgeTab]?.[activeGender] || [];

  const handleResetBadge = () => {
    setForm(prev => ({
      ...prev,
      bannerBadgeText: 'Shito-Kai México',
      navbarBadgeText: 'SHITO-KAI',
      badgeBgColor: '#FFF1F2',
      badgeBorderColor: '#FECDD3',
      badgeTextColor: '#BE123C',
    }));
    showTempFeedback('Insignia y textos restablecidos a Shito-Kai oficial');
  };

  const BADGE_PRESETS = [
    {
      name: 'Shito-Kai Oficial',
      badgeBgColor: '#FFF1F2',
      badgeBorderColor: '#FECDD3',
      badgeTextColor: '#BE123C',
      chip: 'bg-rose-500',
    },
    {
      name: 'Azul Tatami (WKF)',
      badgeBgColor: '#EFF6FF',
      badgeBorderColor: '#BFDBFE',
      badgeTextColor: '#1D4ED8',
      chip: 'bg-blue-600',
    },
    {
      name: 'Verde Marcial',
      badgeBgColor: '#ECFDF5',
      badgeBorderColor: '#A7F3D0',
      badgeTextColor: '#047857',
      chip: 'bg-emerald-600',
    },
    {
      name: 'Dorado / Honor',
      badgeBgColor: '#FEFCE8',
      badgeBorderColor: '#FEF08A',
      badgeTextColor: '#A16207',
      chip: 'bg-amber-500',
    },
    {
      name: 'Cinturón Negro',
      badgeBgColor: '#0F172A',
      badgeBorderColor: '#334155',
      badgeTextColor: '#F8FAFC',
      chip: 'bg-slate-900',
    },
    {
      name: 'Blanco / Clásico',
      badgeBgColor: '#FFFFFF',
      badgeBorderColor: '#CBD5E1',
      badgeTextColor: '#0F172A',
      chip: 'bg-white border border-slate-300',
    },
  ];

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
      registrationDeadline: form.registrationDeadline || '',
      groupByModalityProfile: Boolean(form.groupByModalityProfile),
      weightDivisions: weightDivisions,
      customLogo: form.customLogo || null,
      customBg: form.customBg || null,
      bgOpacity: form.bgOpacity !== undefined ? parseFloat(form.bgOpacity) : 0.20,
      bgFit: form.bgFit || 'contain',
      bannerBadgeText: form.bannerBadgeText || 'Shito-Kai México',
      navbarBadgeText: form.navbarBadgeText || 'SHITO-KAI',
      badgeBgColor: form.badgeBgColor || '#FFF1F2',
      badgeBorderColor: form.badgeBorderColor || '#FECDD3',
      badgeTextColor: form.badgeTextColor || '#BE123C',
    });
    onClose();
  };

  const handleExecuteReset = async () => {
    if (confirmText.trim().toUpperCase() !== 'REINICIAR' && confirmText.trim().toUpperCase() !== 'BORRAR') {
      alert('Debes escribir la palabra REINICIAR o BORRAR para confirmar la eliminación total.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await onResetAllToZero();
      setShowResetConfirm(false);
      setConfirmText('');
      const countMsg = res && res.deletedAthletes !== undefined
        ? `\n• Registros de atletas eliminados en la nube: ${res.deletedAthletes}\n• Dojos eliminados en la nube: ${res.deletedDojos || 0}`
        : '';
      alert(`¡Torneo limpiado con éxito a 0!${countMsg}\n\nEl sistema local y la base de datos de Firebase están completamente limpios y listos para el próximo torneo.`);
      onClose();
    } catch (err) {
      console.error('Error durante el reinicio:', err);
      alert('Hubo un detalle al limpiar los registros: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-tatami-200">
        <div className="bg-tatami-900 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-aka shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-aka-light" />
            <h2 className="text-sm font-semibold">Configuración del Torneo (Solo Administrador)</h2>
          </div>
          <button onClick={onClose} className="text-tatami-400 hover:text-white cursor-pointer">
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

          {/* Logotipo Oficial del Torneo / Organización */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Logotipo del Torneo / Organización</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Reemplaza el escudo en pantalla y PDFs</span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
              {/* Vista previa del logo actual */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-2xs">
                  {form.customLogo ? (
                    <img
                      src={form.customLogo}
                      alt="Logotipo Personalizado"
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <ShitoKaiLogo className="w-12 h-12" />
                  )}
                </div>
                {form.customLogo && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Logotipo personalizado activo">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Botones para subir imagen o restablecer */}
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="tournamentLogoUpload"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>{form.customLogo ? 'Cambiar Imagen de Logo' : 'Subir Imagen de Logo'}</span>
                  </label>
                  <input
                    id="tournamentLogoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {form.customLogo && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restablecer Shito-Kai</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-500">
                  {form.customLogo ? (
                    <span className="text-emerald-700 font-semibold">✓ Imagen personalizada activa (se usará en llaves, podio y hojas de impresión PDF).</span>
                  ) : (
                    <span>Se muestra actualmente el escudo oficial Shito-Kai. Puedes subir el logo de tu dojo o evento (.png, .jpg).</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Fondo del Torneo y Barra de Traslucidez */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-600" />
                <span>Imagen de Fondo del Torneo</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Predeterminado: Cerezo Sakura Sumi-e</span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
              {/* Miniatura del fondo actual con la opacidad aplicada */}
              <div className="relative shrink-0 w-20 h-16 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-2xs">
                <img
                  src={form.customBg || sakuraTreeImg}
                  alt="Vista Previa Fondo"
                  className={`w-full h-full select-none ${
                    form.customBg && form.bgFit === 'cover' ? 'object-cover' : 'object-contain object-top-right'
                  }`}
                  style={{
                    opacity: form.bgOpacity,
                    mixBlendMode: (!form.customBg || form.bgFit !== 'cover') ? 'multiply' : 'normal',
                  }}
                />
                {form.customBg ? (
                  <span className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Fondo personalizado activo">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="absolute bottom-1 left-1 bg-slate-800/80 text-white text-[8px] font-bold px-1 rounded">
                    Default
                  </span>
                )}
              </div>

              {/* Botones de acción para el fondo */}
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="tournamentBgUpload"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>{form.customBg ? 'Cambiar Imagen de Fondo' : 'Subir Fondo Personalizado'}</span>
                  </label>
                  <input
                    id="tournamentBgUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />

                  {form.customBg && (
                    <button
                      type="button"
                      onClick={handleResetBackground}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restablecer Predeterminado</span>
                    </button>
                  )}
                </div>

                {/* Si hay fondo personalizado, permitir elegir modo de ajuste */}
                {form.customBg && (
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                    <span className="text-slate-500 font-medium">Ajuste:</span>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, bgFit: 'cover' }))}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        form.bgFit === 'cover'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Pantalla Completa
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, bgFit: 'contain' }))}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        form.bgFit === 'contain'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Esquina / Marca de Agua
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BARRA DE TRASLUCIDEZ / OPACIDAD */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ajuste de Tono Traslúcido del Fondo:</span>
                </label>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-[11px] border border-slate-300 shadow-2xs">
                  {Math.round(form.bgOpacity * 100)}% de visibilidad ({100 - Math.round(form.bgOpacity * 100)}% traslúcido)
                </span>
              </div>

              {/* Slider de menos a más traslúcido */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={Math.round(form.bgOpacity * 100)}
                  onChange={(e) => setForm(prev => ({ ...prev, bgOpacity: parseFloat(e.target.value) / 100 }))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-hidden"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>← Más traslúcido (sutil y transparente)</span>
                  <span>Menos traslúcido (marcado y visible) →</span>
                </div>
              </div>

              {/* Mini caja de prueba de legibilidad */}
              <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 p-2.5 text-center mt-2">
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden flex justify-end items-start"
                  aria-hidden="true"
                >
                  <img
                    src={form.customBg || sakuraTreeImg}
                    alt=""
                    className={`select-none ${
                      form.customBg && form.bgFit === 'cover'
                        ? 'w-full h-full object-cover'
                        : 'h-full max-w-full object-contain ml-auto'
                    }`}
                    style={{
                      opacity: form.bgOpacity,
                      mixBlendMode: (!form.customBg || form.bgFit !== 'cover') ? 'multiply' : 'normal',
                    }}
                  />
                </div>
                <div className="relative z-10 py-1">
                  <span className="bg-white/85 backdrop-blur-xs text-slate-900 px-3 py-1 rounded-md text-[11px] font-bold border border-slate-300 shadow-2xs inline-block">
                    Ejemplo de legibilidad con {Math.round(form.bgOpacity * 100)}% de tono traslúcido
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Identidad Superior: Textos, Insignia (Badge), Fondo y Marco */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                <span>Textos Superiores, Insignia y Marco (Navbar y Portada)</span>
              </label>
              <button
                type="button"
                onClick={handleResetBadge}
                className="text-[10px] text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Restablecer textos y colores originales de Shito-Kai"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Shito-Kai</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Personaliza los <strong>2 textos superiores</strong> (insignia del banner y etiqueta de la barra superior), así como el <strong>color de fondo</strong> y el <strong>marco (borde)</strong>.
            </p>

            {/* Inputs para los 2 textos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Texto 1: Insignia en Banner (Portada)</span>
                </label>
                <input
                  type="text"
                  value={form.bannerBadgeText}
                  onChange={(e) => setForm({ ...form, bannerBadgeText: e.target.value })}
                  placeholder="Ej. Shito-Kai México, Shotokan México, etc."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Se muestra en la cabecera del portal de profesores.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Texto 2: Barra Superior (Navbar)</span>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, navbarBadgeText: (prev.bannerBadgeText || '').toUpperCase() }))}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
                    title="Copiar texto del banner en mayúsculas"
                  >
                    Copiar del Texto 1
                  </button>
                </label>
                <input
                  type="text"
                  value={form.navbarBadgeText}
                  onChange={(e) => setForm({ ...form, navbarBadgeText: e.target.value })}
                  placeholder="Ej. SHITO-KAI, SHOTOKAN, etc."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-medium uppercase"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Se muestra en la barra oscura superior fija.</span>
              </div>
            </div>

            {/* Configuración de Colores: Fondo, Marco y Texto */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-600" />
                <span>Colores de Fondo, Marco y Letra:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Color de Fondo */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    Color de Fondo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.badgeBgColor}
                      onChange={(e) => setForm({ ...form, badgeBgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.badgeBgColor}
                      onChange={(e) => setForm({ ...form, badgeBgColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Color del Marco / Borde */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    Color del Marco (Borde)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.badgeBorderColor}
                      onChange={(e) => setForm({ ...form, badgeBorderColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.badgeBorderColor}
                      onChange={(e) => setForm({ ...form, badgeBorderColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Color del Texto */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    Color de Letra
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.badgeTextColor}
                      onChange={(e) => setForm({ ...form, badgeTextColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.badgeTextColor}
                      onChange={(e) => setForm({ ...form, badgeTextColor: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Paleta rápida de combinaciones predeterminadas */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                  Combinaciones Rápidas Recomendadas:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {BADGE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        badgeBgColor: p.badgeBgColor,
                        badgeBorderColor: p.badgeBorderColor,
                        badgeTextColor: p.badgeTextColor,
                      }))}
                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${p.chip}`} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* VISTA PREVIA EN VIVO DE AMBOS TEXTOS */}
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Vista Previa en Tiempo Real de Ambos Textos:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Preview 1: Portada (Fondo claro) */}
                <div
                  className="bg-white p-3 rounded-lg border shadow-2xs space-y-1 transition-all"
                  style={{ borderColor: form.badgeBorderColor }}
                >
                  <span className="text-[9px] text-slate-400 font-bold block">1. En Banner de Profesores:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border shadow-2xs transition-all inline-block"
                      style={{
                        backgroundColor: form.badgeBgColor,
                        borderColor: form.badgeBorderColor,
                        color: form.badgeTextColor,
                      }}
                    >
                      {form.bannerBadgeText || 'Texto Superior'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-serif block truncate">
                    {form.name || 'Nombre del Torneo'}
                  </span>
                </div>

                {/* Preview 2: Navbar (Fondo oscuro) */}
                <div className="bg-slate-900 p-3 rounded-lg border-b-2 shadow-2xs space-y-1 transition-all" style={{ borderBottomColor: form.badgeBorderColor }}>
                  <span className="text-[9px] text-slate-400 font-bold block">2. En Barra Superior (Navbar):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {form.name || 'Torneo'}
                    </span>
                    <span
                      className="text-[10px] border px-1.5 py-0.2 rounded font-serif truncate max-w-[140px] font-bold shadow-2xs transition-all inline-block"
                      style={{
                        backgroundColor: form.badgeBgColor,
                        borderColor: form.badgeBorderColor,
                        color: form.badgeTextColor,
                      }}
                    >
                      {form.navbarBadgeText || 'OFICIAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

          {/* Fecha Límite de Inscripciones (Cierre Automático para Profesores) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                <label className="font-bold text-slate-900 text-xs">
                  Fecha Límite de Inscripción (Cierre Automático para Maestros)
                </label>
              </div>
              {form.registrationDeadline ? (
                (() => {
                  const dlTime = new Date(form.registrationDeadline.includes('T') ? form.registrationDeadline : `${form.registrationDeadline}T23:59:59`).getTime();
                  const isClosed = !isNaN(dlTime) && Date.now() > dlTime;
                  return isClosed ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Inscripciones CERRADAS
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      Inscripciones ABIERTAS
                    </span>
                  );
                })()
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Sin límite (Abiertas)
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600">
              Establece una fecha y hora límite. Al cumplirse, el portal de maestros quedará bloqueado impidiendo nuevos registros. Tú como Administrador podrás seguir haciendo cambios de emergencia.
            </p>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={form.registrationDeadline}
                  onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 outline-hidden focus:ring-1 focus:ring-rose-500 font-medium"
                />
                {form.registrationDeadline && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, registrationDeadline: '' }));
                      showTempFeedback('Fecha límite removida (Inscripciones abiertas)');
                    }}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Quitar Límite
                  </button>
                )}
              </div>

              {/* Atajos Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Atajos Rápidos:
                </span>
                <button
                  type="button"
                  onClick={() => handleSetDeadlinePreset(-1, '23:59')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] text-slate-700 font-medium cursor-pointer shadow-2xs"
                >
                  1 día antes (23:59 hrs)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDeadlinePreset(-2, '23:59')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] text-slate-700 font-medium cursor-pointer shadow-2xs"
                >
                  2 días antes (23:59 hrs)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDeadlinePreset(0, '08:00')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] text-slate-700 font-medium cursor-pointer shadow-2xs"
                >
                  Día del evento (08:00 hrs)
                </button>
              </div>

              {form.registrationDeadline && (
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  📅 Cierre programado: <strong>{formatDeadlineDisplay(form.registrationDeadline)}</strong>
                </div>
              )}
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
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-600" />
                  <span>División por Peso en Mayores (Kumite Cadetes, Juniors, Adultos ≥ 14 años)</span>
                </label>
                <p className="text-[11px] text-slate-600">
                  {form.divideAdultsByWeight
                    ? 'Activado: Divide estrictamente en categorías de peso. Abajo puedes desglosar y editar los pesos a tu gusto.'
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

            {/* SECCIÓN DESGLOSADA DE PESOS CONFIGURABLES (CUANDO ESTÁ ACTIVADO) */}
            {form.divideAdultsByWeight && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">
                      Desglose de Opciones de Peso:
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
                      Editable en tiempo real
                    </span>
                  </div>
                  {actionFeedback && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {actionFeedback}
                    </span>
                  )}
                </div>

                {/* Pestañas de Grupo de Edad */}
                <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveAgeTab('senior')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-center transition-colors cursor-pointer ${
                      activeAgeTab === 'senior' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Adultos / Senior (≥18)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAgeTab('16-17')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-center transition-colors cursor-pointer ${
                      activeAgeTab === '16-17' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Junior (16-17)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAgeTab('14-15')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-center transition-colors cursor-pointer ${
                      activeAgeTab === '14-15' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cadetes (14-15)
                  </button>
                </div>

                {/* Selector de Rama y Presets Rápidos */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveGender('M')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        activeGender === 'M' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🥋 Varonil (M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGender('F')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        activeGender === 'F' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🥋 Femenil (F)
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Presets:</span>
                    <button
                      type="button"
                      onClick={handleResetToWKF}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold border border-slate-300 transition-colors cursor-pointer"
                      title="Restablece los pesos estándar oficiales de la WKF"
                    >
                      WKF Oficial
                    </button>
                    <button
                      type="button"
                      onClick={handleApply2WeightsPreset}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold border border-slate-300 transition-colors cursor-pointer"
                      title="Configura 2 pesos (Ligero / Pesado)"
                    >
                      2 Pesos
                    </button>
                    <button
                      type="button"
                      onClick={handleApply3WeightsPreset}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold border border-slate-300 transition-colors cursor-pointer"
                      title="Configura 3 pesos (Ligero / Medio / Pesado)"
                    >
                      3 Pesos
                    </button>
                  </div>
                </div>

                {/* Lista de Rangos de Peso Desglosados */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 px-1">
                    <span>Categorías para {activeAgeTab === 'senior' ? 'Adultos / Senior' : activeAgeTab === '16-17' ? 'Junior' : 'Cadetes'} ({activeGender === 'M' ? 'Varonil' : 'Femenil'}):</span>
                    <span className="text-[10px] text-slate-400 font-normal">Modifica nombres y pesos en kg</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {currentList.map((div, idx) => {
                      return (
                        <div
                          key={div.id || idx}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          {/* Badge de Orden */}
                          <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {idx + 1}
                          </span>

                          {/* Nombre de la Categoría */}
                          <div className="w-24 sm:w-28 shrink-0">
                            <input
                              type="text"
                              value={div.name}
                              onChange={(e) => handleUpdateWeightDivision(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:border-rose-500 outline-hidden"
                              placeholder="-60 kg"
                              title="Nombre visible de la categoría"
                            />
                          </div>

                          {/* Rango Min y Max en kg */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-[150px] text-[11px] text-slate-600">
                            <span className="text-[10px] text-slate-400 shrink-0">Mín:</span>
                            <input
                              type="number"
                              step="0.1"
                              value={div.min ?? ''}
                              onChange={(e) => handleUpdateWeightDivision(idx, 'min', e.target.value === '' ? null : parseFloat(e.target.value))}
                              placeholder="0"
                              className="w-14 px-1.5 py-1 text-xs font-mono text-center border border-slate-300 rounded-md bg-white focus:border-rose-500 outline-hidden"
                              title="Peso mínimo en kg (dejar vacío si es desde 0)"
                            />
                            <span className="text-[10px] text-slate-400 shrink-0">a</span>
                            <input
                              type="number"
                              step="0.1"
                              value={div.max ?? ''}
                              onChange={(e) => handleUpdateWeightDivision(idx, 'max', e.target.value === '' ? null : parseFloat(e.target.value))}
                              placeholder="Máx"
                              className="w-14 px-1.5 py-1 text-xs font-mono text-center border border-slate-300 rounded-md bg-white focus:border-rose-500 outline-hidden"
                              title="Peso máximo en kg (dejar vacío para categoría pesada '+')"
                            />
                            <span className="text-[11px] font-semibold text-slate-500">kg</span>
                          </div>

                          {/* Rótulo explicativo */}
                          <div className="text-[10px] text-slate-500 italic hidden sm:block shrink-0 min-w-[95px] text-right">
                            {!div.min && div.max ? `Hasta ${div.max} kg` :
                             div.min && div.max ? `${div.min} a ${div.max} kg` :
                             div.min && !div.max ? `Más de ${Math.floor(div.min)} kg` : 'Cualquier peso'}
                          </div>

                          {/* Botón Borrar */}
                          <button
                            type="button"
                            onClick={() => handleDeleteWeightDivision(idx)}
                            disabled={currentList.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors shrink-0 cursor-pointer"
                            title={currentList.length <= 1 ? "Debe haber al menos 1 división" : "Eliminar esta categoría de peso"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones de la lista */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleAddWeightDivision}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Categoría de Peso</span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleCopyWeightsToOtherGender}
                        className="text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                      >
                        Copiar a {activeGender === 'M' ? 'Femenil' : 'Varonil'}
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleCopyWeightsToAllAges}
                        className="text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                      >
                        Copiar a todas las edades
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

          {/* Agrupación de Áreas por Modalidad (Kata, Kumite y Doble Modalidad) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Agrupar Áreas por Modalidad (Doble Modalidad, Solo Kumite, Solo Kata)</span>
                </label>
                <p className="text-[11px] text-slate-600">
                  {form.groupByModalityProfile
                    ? 'Activado: Agrupa en llaves y áreas compartidas a los competidores de Doble Modalidad (Kata y Kumite en el mismo tatami), separando a los de Solo Kumite y Solo Kata para no revolver las mesas.'
                    : 'Desactivado: Modo clásico (todos los alumnos inscritos a una modalidad entran a la misma gráfica general sin distinguir su perfil).'}
                </p>
                <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div>
                    ✓ <strong>Doble Modalidad:</strong> Realizan Kata y Kumite juntos en el mismo tatami sin retrasos.
                  </div>
                  <div>
                    ✓ <strong>Solo Kumite / Solo Kata:</strong> Tienen sus propias gráficas exclusivas.
                  </div>
                  <div>
                    ✓ <strong>Regla de casos extremos:</strong> Si un niño queda solo en Solo Kumite o Solo Kata (1 huérfano), se integra a la gráfica de Doble Modalidad para garantizar que compita por medalla.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, groupByModalityProfile: !prev.groupByModalityProfile }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.groupByModalityProfile ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    form.groupByModalityProfile ? 'translate-x-5' : 'translate-x-0'
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
                disabled={isResetting}
                onClick={() => { setShowResetConfirm(false); setConfirmText(''); }}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting || (confirmText.trim().toUpperCase() !== 'REINICIAR' && confirmText.trim().toUpperCase() !== 'BORRAR')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Borrando de Firebase...
                  </>
                ) : (
                  'Confirmar y Borrar Todo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
