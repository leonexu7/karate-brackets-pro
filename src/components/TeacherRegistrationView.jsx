import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Shield,
  Award,
  Calendar,
  Scale,
  Ruler,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Lock,
  MapPin,
  UserCheck,
  TrendingUp,
  Download,
  Upload,
  Coins,
  Receipt,
  FileCheck,
  Info,
  MessageSquare
} from 'lucide-react';
import {
  KYUS,
  KYU_CATEGORIES,
  getKyuInfo,
  getKyuCategoryInfo,
  canCompeteInCategory,
  resolveCompetingCategory
} from '../constants/belts';
import { MODALITIES, calculateAge, findAgeDivision, findWeightDivision } from '../constants/categories';
import { ShitoKaiLogo } from '../assets/shitoKaiLogo';
import sakuraTreeImg from '../assets/sakura_tree.png';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelHandler';

export default function TeacherRegistrationView({
  tournament,
  onRegisterAthlete,
  onRegisterBatchAthletes,
  onOpenAdminLogin,
}) {
  // Cuotas de inscripción configuradas para el torneo (por defecto $300 para 1 y 2 modalidades)
  const feeSingle = tournament?.feeSingleModality !== undefined ? tournament.feeSingleModality : 300;
  const feeDouble = tournament?.feeDoubleModality !== undefined ? tournament.feeDoubleModality : 300;

  // Datos del Dojo del Profesor
  const [dojoInfo, setDojoInfo] = useState({
    name: '',
    sensei: '',
    city: '',
    phone: '',
  });

  // Datos del Atleta individual
  const [athleteForm, setAthleteForm] = useState({
    fullName: '',
    birthDate: '',
    gender: 'M',
    beltId: '10_kyu', // 10º Kyu por defecto
    competingCategory: 'cat_10_8',
    weight: '',
    height: '',
    modalities: ['kumite_ind', 'kata_ind'],
  });

  // Modo de registro: 'single' o 'batch'
  const [registerMode, setRegisterMode] = useState('single');

  // Estado para importación de archivo Excel (.xlsx / .csv)
  const fileInputRef = useRef(null);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelParsedList, setExcelParsedList] = useState([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelError, setExcelError] = useState('');

  // Modo de texto pegado tradicional
  const [batchText, setBatchText] = useState('');
  const [batchError, setBatchError] = useState('');

  // Lista local de atletas inscritos únicamente por este profesor en su sesión actual
  const [myRegisteredAthletes, setMyRegisteredAthletes] = useState([]);
  const [successNotice, setSuccessNotice] = useState('');
  const [suggestedInfo, setSuggestedInfo] = useState(null);

  // Manejar cambio de Kyu y sincronizar/validar la categoría de competencia
  const handleKyuChange = (newBeltId) => {
    const kyu = getKyuInfo(newBeltId);
    setAthleteForm(prev => {
      const isStillAllowed = canCompeteInCategory(newBeltId, prev.competingCategory);
      return {
        ...prev,
        beltId: newBeltId,
        competingCategory: isStillAllowed ? prev.competingCategory : kyu.naturalCategory,
      };
    });
  };

  // Manejar selección de categoría de competencia con validación de juego limpio
  const handleCompetingCategorySelect = (categoryId) => {
    if (canCompeteInCategory(athleteForm.beltId, categoryId)) {
      setAthleteForm(prev => ({
        ...prev,
        competingCategory: categoryId,
      }));
    }
  };

  // Calcular predicción de categoría en tiempo real
  useEffect(() => {
    if (!athleteForm.birthDate) {
      setSuggestedInfo(null);
      return;
    }
    const age = calculateAge(athleteForm.birthDate, tournament.date);
    if (age === null || isNaN(age)) {
      setSuggestedInfo(null);
      return;
    }
    const ageDiv = findAgeDivision(age);
    const weightNum = parseFloat(athleteForm.weight) || 0;
    const weightDiv = ageDiv.hasWeightDivisions
      ? findWeightDivision(ageDiv.id, athleteForm.gender, weightNum)
      : null;
    const kyuInfo = getKyuInfo(athleteForm.beltId);
    const targetCatId = resolveCompetingCategory(athleteForm.beltId, athleteForm.competingCategory);
    const categoryInfo = getKyuCategoryInfo(targetCatId);

    setSuggestedInfo({
      age,
      ageDiv,
      weightDiv,
      kyuInfo,
      categoryInfo,
      isCuarteta: ageDiv.format === 'cuarteta',
    });
  }, [
    athleteForm.birthDate,
    athleteForm.gender,
    athleteForm.weight,
    athleteForm.beltId,
    athleteForm.competingCategory,
    tournament.date,
  ]);

  // Manejar envío individual
  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!dojoInfo.name.trim()) {
      alert('Por favor ingresa el nombre oficial completo de tu Dojo o Escuela.');
      return;
    }
    if (!dojoInfo.sensei.trim()) {
      alert('Por favor ingresa el nombre del Sensei o profesor responsable.');
      return;
    }
    if (!athleteForm.fullName.trim() || !athleteForm.birthDate) {
      alert('Por favor completa el nombre del atleta y su fecha de nacimiento.');
      return;
    }

    const kyu = getKyuInfo(athleteForm.beltId);
    const finalCompCategory = resolveCompetingCategory(athleteForm.beltId, athleteForm.competingCategory);
    const catInfo = getKyuCategoryInfo(finalCompCategory);

    const newAthlete = {
      id: `real-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: athleteForm.fullName.trim(),
      birthDate: athleteForm.birthDate,
      gender: athleteForm.gender,
      beltId: kyu.id,
      kyuName: kyu.name,
      competingCategory: finalCompCategory,
      competingCategoryName: catInfo.name,
      weight: athleteForm.weight !== '' ? parseFloat(athleteForm.weight) : null,
      height: athleteForm.height !== '' ? parseFloat(athleteForm.height) : null,
      modalities: athleteForm.modalities.length > 0 ? athleteForm.modalities : ['kumite_ind'],
      dojoName: dojoInfo.name.trim(),
      sensei: dojoInfo.sensei.trim(),
      city: dojoInfo.city.trim(),
      phone: dojoInfo.phone.trim(),
    };

    onRegisterAthlete(newAthlete, dojoInfo);
    setMyRegisteredAthletes(prev => [newAthlete, ...prev]);

    // Limpiar formulario de atleta manteniendo datos del dojo
    setAthleteForm({
      fullName: '',
      birthDate: '',
      gender: athleteForm.gender,
      beltId: '10_kyu',
      competingCategory: 'cat_10_8',
      weight: '',
      height: '',
      modalities: ['kumite_ind', 'kata_ind'],
    });

    setSuccessNotice(`¡Competidor ${newAthlete.fullName} (${kyu.name}) inscrito exitosamente en ${catInfo.name}!`);
    setTimeout(() => setSuccessNotice(''), 4500);
  };

  // Manejar carga de archivo Excel (.xlsx / .csv)
  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelError('');
    setIsProcessingExcel(true);
    setExcelFileName(file.name);

    try {
      const result = await parseExcelFile(file);
      if (result.success && result.athletes?.length > 0) {
        setExcelParsedList(result.athletes);
      } else {
        setExcelError(result.error || 'No se pudieron leer competidores válidos del archivo.');
        setExcelParsedList([]);
      }
    } catch (err) {
      setExcelError(err.message || 'Error al procesar el archivo Excel.');
      setExcelParsedList([]);
    } finally {
      setIsProcessingExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirmar registro de atletas leídos desde el archivo Excel
  const handleConfirmExcelImport = () => {
    if (!dojoInfo.name.trim() || !dojoInfo.sensei.trim()) {
      alert('Por favor completa primero los datos oficiales de tu Dojo y Sensei en la Sección 1.');
      return;
    }

    if (excelParsedList.length === 0) return;

    const formattedAthletes = excelParsedList.map((a, idx) => ({
      ...a,
      id: `real-xl-${Date.now()}-${idx}`,
      dojoName: dojoInfo.name.trim(),
      sensei: dojoInfo.sensei.trim(),
      city: dojoInfo.city.trim(),
      phone: dojoInfo.phone.trim(),
    }));

    onRegisterBatchAthletes(formattedAthletes, dojoInfo);
    setMyRegisteredAthletes(prev => [...formattedAthletes, ...prev]);
    setSuccessNotice(`¡Se han inscrito ${formattedAthletes.length} competidores desde el archivo "${excelFileName}" exitosamente!`);
    setExcelParsedList([]);
    setExcelFileName('');
    setTimeout(() => setSuccessNotice(''), 4500);
  };

  // Manejar importación en lote por texto pegado
  const handleBatchSubmit = (e) => {
    e.preventDefault();
    setBatchError('');

    if (!dojoInfo.name.trim() || !dojoInfo.sensei.trim()) {
      setBatchError('Por favor completa primero el nombre oficial del Dojo y del Sensei en la Sección 1.');
      return;
    }
    if (!batchText.trim()) {
      setBatchError('Por favor pega los datos de tus competidores.');
      return;
    }

    const lines = batchText.split('\n').map(l => l.trim()).filter(Boolean);
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

        let specifiedCat = parts[6]?.trim();
        let finalCat = kyu.naturalCategory;
        if (specifiedCat) {
          if (specifiedCat.includes('10') || specifiedCat.includes('8')) specifiedCat = 'cat_10_8';
          else if (specifiedCat.includes('7') || specifiedCat.includes('4')) specifiedCat = 'cat_7_4';
          else if (specifiedCat.includes('3') || specifiedCat.toLowerCase().includes('libre')) specifiedCat = 'cat_3_plus';
          finalCat = resolveCompetingCategory(kyu.id, specifiedCat);
        }
        const catInfo = getKyuCategoryInfo(finalCat);

        if (fullName) {
          parsed.push({
            id: `real-batch-${Date.now()}-${idx}`,
            fullName,
            birthDate: birthDate.match(/^\d{4}-\d{2}-\d{2}$/) ? birthDate : '2016-01-01',
            gender,
            beltId: kyu.id,
            kyuName: kyu.name,
            competingCategory: finalCat,
            competingCategoryName: catInfo.name,
            weight,
            height,
            modalities: ['kumite_ind', 'kata_ind'],
            dojoName: dojoInfo.name.trim(),
            sensei: dojoInfo.sensei.trim(),
            city: dojoInfo.city.trim(),
            phone: dojoInfo.phone.trim(),
          });
        }
      }
    });

    if (parsed.length === 0) {
      setBatchError('No se reconocieron registros válidos. Usa el formato: Nombre, Fecha(AAAA-MM-DD), Sexo(M/F), Kyu, Peso');
      return;
    }

    onRegisterBatchAthletes(parsed, dojoInfo);
    setMyRegisteredAthletes(prev => [...parsed, ...prev]);
    setBatchText('');
    setSuccessNotice(`¡Se han inscrito ${parsed.length} competidores correctamente!`);
    setTimeout(() => setSuccessNotice(''), 4500);
  };

  const handleModalityToggle = (modId) => {
    setAthleteForm(prev => {
      const exists = prev.modalities.includes(modId);
      const updated = exists ? prev.modalities.filter(m => m !== modId) : [...prev.modalities, modId];
      return { ...prev, modalities: updated };
    });
  };

  const currentKyu = getKyuInfo(athleteForm.beltId);

  // Cálculo financiero de cuotas de inscripción para este profesor
  const singleModalityAthletes = myRegisteredAthletes.filter(a => (a.modalities || []).length === 1);
  const doubleModalityAthletes = myRegisteredAthletes.filter(a => (a.modalities || []).length >= 2);
  const totalSingleFee = singleModalityAthletes.length * feeSingle;
  const totalDoubleFee = doubleModalityAthletes.length * feeDouble;
  const totalGrandPayment = totalSingleFee + totalDoubleFee;

  const handleSendWhatsAppReport = () => {
    const text = encodeURIComponent(
      `🥋 *CÉDULA DE INSCRIPCIÓN Y COBRO - SHITO-KAI MÉXICO*\n\n` +
      `• *Dojo:* ${dojoInfo.name || 'Sin especificar'}\n` +
      `• *Sensei:* ${dojoInfo.sensei || 'Sin especificar'}\n` +
      `• *Ciudad:* ${dojoInfo.city || 'S/D'}\n` +
      `• *Teléfono:* ${dojoInfo.phone || 'S/D'}\n\n` +
      `📊 *Resumen de Competidores:*\n` +
      `• Total de Alumnos: *${myRegisteredAthletes.length} atletas*\n` +
      `• 1 Modalidad: ${singleModalityAthletes.length} atleta(s) ($${totalSingleFee} MXN)\n` +
      `• 2 Modalidades: ${doubleModalityAthletes.length} atleta(s) ($${totalDoubleFee} MXN)\n\n` +
      `💰 *MONTO TOTAL A LIQUIDAR:* *$${totalGrandPayment.toLocaleString('es-MX')} MXN*\n\n` +
      `_Envío comprobante oficial de mi escuela para mesa de pesaje._`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)]">
      {/* FONDO OFICIAL CON ÁRBOL DE CEREZO EN TINTA JAPONESA (SUMI-E SAKURA) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-end items-start"
        aria-hidden="true"
      >
        <img
          src={sakuraTreeImg}
          alt=""
          className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl opacity-20 md:opacity-25 object-contain object-top-right select-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 pb-12 px-2 sm:px-0">
        {/* BANNER PRINCIPAL CON ESCUDO SHITO-KAI ROJO Y ÁRBOL DE CEREZO OFICIAL */}
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-rose-200/90 shadow-md overflow-hidden relative">
          {/* ÁRBOL DE CEREZO OFICIAL EN LA PARTE DERECHA */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 sm:pr-4 pointer-events-none opacity-85">
            <img
              src={sakuraTreeImg}
              alt="Cerezo Shito-Kai"
              className="w-40 sm:w-64 md:w-80 h-32 sm:h-44 object-contain object-right"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          <div className="p-5 sm:p-7 text-slate-800 relative z-10 max-w-xl space-y-3">
            <div className="flex items-center gap-3">
              {/* Escudo rojo oficial Shito-Kai */}
              <ShitoKaiLogo className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-sm shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                    Shito-Kai México
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold font-serif tracking-wide text-slate-900 mt-1">
                  {tournament.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Fecha: <strong className="text-slate-800">{tournament.date}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Sede: <strong className="text-slate-800">{tournament.venue}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
              Cédula Oficial de Inscripción para Dojos y Profesores Afiliados.
            </p>

            <div className="pt-1">
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Acceso exclusivo para el comité organizador con clave de seguridad"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Acceso Administrador (Mesa de Control)</span>
              </button>
            </div>
          </div>

          <div className="px-5 sm:px-7 py-2.5 bg-slate-50/90 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 relative z-10">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Privacidad protegida: Las listas de otros dojos y competidores permanecen confidenciales hasta el inicio del torneo.</span>
          </div>
        </div>

        {/* Notificación de Éxito */}
        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* SECCIÓN 1: DATOS OFICIALES DEL DOJO / ESCUELA */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center font-serif">
              館
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Datos Oficiales de tu Dojo / Escuela</h2>
              <p className="text-[11px] text-slate-500">
                Ingresa el nombre oficial completo sin abreviaciones para la correcta separación en tatami.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Nombre Oficial Completo del Dojo / Escuela / Asociación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Escuela Shito-Ryu Kai Honbu México (Escribe el nombre completo)"
                value={dojoInfo.name}
                onChange={(e) => setDojoInfo({ ...dojoInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Este nombre exacto es usado por el sorteo para evitar que dos compañeros del mismo dojo choquen en primera ronda.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Sensei / Profesor Responsable *</label>
              <input
                type="text"
                required
                placeholder="Ej. Sensei Roberto Tanaka"
                value={dojoInfo.sensei}
                onChange={(e) => setDojoInfo({ ...dojoInfo, sensei: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Ciudad / Estado</label>
                <input
                  type="text"
                  placeholder="Ej. Puebla, Pue."
                  value={dojoInfo.city}
                  onChange={(e) => setDojoInfo({ ...dojoInfo, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="22 1234 5678"
                  value={dojoInfo.phone}
                  onChange={(e) => setDojoInfo({ ...dojoInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: FORMULARIO DE INSCRIPCIÓN (INDIVIDUAL O CARGA MASIVA EXCEL) */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center font-serif">
                級
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">2. Registro de Atletas</h2>
                <p className="text-[11px] text-slate-500">
                  Inscribe atleta por atleta o descarga la plantilla oficial de Excel para cargar la lista completa en segundos.
                </p>
              </div>
            </div>

            {/* Selector de modo */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setRegisterMode('single')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  registerMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inscripción Individual
              </button>
              <button
                type="button"
                onClick={() => setRegisterMode('batch')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  registerMode === 'batch'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Carga Masiva con Excel</span>
              </button>
            </div>
          </div>

          {registerMode === 'single' ? (
            /* FORMULARIO INDIVIDUAL */
            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              {/* Nombre y Fecha de Nacimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Nombre Completo del Competidor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mateo Tanaka Solís"
                    value={athleteForm.fullName}
                    onChange={(e) => setAthleteForm({ ...athleteForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={athleteForm.birthDate}
                    onChange={(e) => setAthleteForm({ ...athleteForm, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>
              </div>

              {/* Sexo / Rama */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Rama / Sexo *</label>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setAthleteForm({ ...athleteForm, gender: 'M' })}
                    className={`py-2 text-center rounded-lg border font-semibold transition-colors cursor-pointer ${
                      athleteForm.gender === 'M'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Varonil (M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAthleteForm({ ...athleteForm, gender: 'F' })}
                    className={`py-2 text-center rounded-lg border font-semibold transition-colors cursor-pointer ${
                      athleteForm.gender === 'F'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Femenil (F)
                  </button>
                </div>
              </div>

              {/* 1. SELECCIÓN DE GRADO TÉCNICO OFICIAL POR KYU (SIN COLORES) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-700" />
                    <span>Grado Técnico Oficial del Alumno (KYU) *</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Seleccionado: {currentKyu.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {KYUS.map(kyu => {
                    const isSelected = athleteForm.beltId === kyu.id;
                    return (
                      <button
                        key={kyu.id}
                        type="button"
                        onClick={() => handleKyuChange(kyu.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs ring-2 ring-rose-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{kyu.name}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {kyu.rank === 1 ? '10º-8º' : kyu.rank === 2 ? '7º-4º' : '3º+'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELECTOR DE CATEGORÍA DE COMPETENCIA */}
              <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div>
                    <label className="font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                      <span>Categoría en la que Competirá (Decisión del Entrenador) *</span>
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      El alumno puede competir en su categoría correspondiente o en una categoría superior. No se permite descender a una categoría inferior.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {KYU_CATEGORIES.map(cat => {
                    const isAllowed = canCompeteInCategory(athleteForm.beltId, cat.id);
                    const isSelected = athleteForm.competingCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={!isAllowed}
                        onClick={() => handleCompetingCategorySelect(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[82px] ${
                          !isAllowed
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-white border-rose-500 ring-2 ring-rose-400 shadow-sm text-slate-900 cursor-pointer'
                            : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs">{cat.name}</span>
                          {!isAllowed ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : null}
                        </div>

                        <div className="text-[10px] mt-1">
                          {!isAllowed ? (
                            <span className="text-red-500 font-medium">⛔ Grado inferior (Bloqueado)</span>
                          ) : (
                            <span className="text-slate-500">{cat.description}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {athleteForm.competingCategory !== currentKyu.naturalCategory && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>
                      El competidor ({currentKyu.name}) participará en la categoría <strong>{getKyuCategoryInfo(athleteForm.competingCategory).name}</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* Peso y Estatura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    Peso en Báscula (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="150"
                    placeholder="Ej. 24.5 (obligatorio desde 14 años)"
                    value={athleteForm.weight}
                    onChange={(e) => setAthleteForm({ ...athleteForm, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-500">
                    En categorías menores a 14 años el peso sirve para equilibrar equitativamente las cuartetas.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-slate-500" />
                    Estatura (cm) - Opcional
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="80"
                    max="220"
                    placeholder="Ej. 125"
                    value={athleteForm.height}
                    onChange={(e) => setAthleteForm({ ...athleteForm, height: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>
              </div>

              {/* Modalidades y Cuota individual */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800">Modalidades a Participar</label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Cuota de Ficha: ${(athleteForm.modalities.length >= 2 ? feeDouble : feeSingle)} MXN ({athleteForm.modalities.length} mod.)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {MODALITIES.filter(m => m.type === 'individual').map(m => {
                    const isChecked = athleteForm.modalities.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleModalityToggle(m.id)}
                        className={`py-2 px-3 rounded-lg border font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{m.name}</span>
                        <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-emerald-400' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumen y Clasificación en Tiempo Real */}
              {suggestedInfo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Edad al día del evento: {suggestedInfo.age} años ({suggestedInfo.ageDiv.name}) • Categoría: <strong>{suggestedInfo.categoryInfo.name}</strong>
                    </span>
                  </div>

                  {suggestedInfo.isCuarteta ? (
                    <div className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] font-medium">
                      🏅 <strong>Regla Formativa Infantil:</strong> Asignado a <strong>Cuarteta de 4 competidores</strong>. Los 4 atletas subirán al podio y recibirán medalla oficial.
                    </div>
                  ) : suggestedInfo.ageDiv.hasWeightDivisions ? (
                    <div className="text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200 text-[11px]">
                      ⚖️ <strong>División WKF por Peso:</strong> {suggestedInfo.weightDiv?.name || 'Se requiere peso para división'} (Gráfica oficial de llaves).
                    </div>
                  ) : (
                    <div className="text-slate-700 bg-slate-100 p-2 rounded-lg text-[11px]">
                      🥋 Gráfica oficial estándar por edad y grado ({suggestedInfo.categoryInfo.name}).
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Inscribir Competidor a la Lista</span>
                </button>
              </div>
            </form>
          ) : (
            /* MODO CARGA MASIVA CON DOCUMENTO EXCEL */
            <div className="space-y-5 text-xs">
              {/* BLOQUE DESTACADO: DESCARGA DE PLANTILLA Y SUBIDA DE ARCHIVO EXCEL */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <span>Plantilla Oficial de Excel (.xlsx)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Descarga el documento de Excel ya estructurado con las columnas exactas, llénalo con los alumnos de tu dojo y súbelo aquí.
                    </p>
                  </div>

                  {/* BOTÓN DESCARGA DE PLANTILLA */}
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Plantilla Excel</span>
                  </button>
                </div>

                {/* ZONA DE CARGA DEL ARCHIVO EXCEL */}
                <div className="border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center bg-white/90 space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelFileSelect}
                    className="hidden"
                    id="excelFileInput"
                  />

                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <label
                      htmlFor="excelFileInput"
                      className="cursor-pointer text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      Haz clic aquí para seleccionar tu archivo Excel (.xlsx / .csv)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      El sistema leerá automáticamente los nombres, fechas de nacimiento, grados Kyu, modalidades y pesos.
                    </p>
                  </div>

                  {isProcessingExcel && (
                    <div className="text-xs text-emerald-800 font-semibold animate-pulse">
                      Leyendo y validando archivo Excel...
                    </div>
                  )}

                  {excelFileName && !isProcessingExcel && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/90 text-emerald-900 rounded-lg text-xs font-semibold">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>Archivo seleccionado: {excelFileName}</span>
                    </div>
                  )}
                </div>

                {excelError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{excelError}</span>
                  </div>
                )}

                {/* PREVISUALIZACIÓN DE ATLETAS LEÍDOS DESDE EXCEL */}
                {excelParsedList.length > 0 && (
                  <div className="bg-white rounded-xl border border-emerald-300 p-4 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Se detectaron {excelParsedList.length} competidores en el archivo:</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Listo para registrar
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                      {excelParsedList.map((ath, i) => (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{ath.fullName}</span>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Nac: {ath.birthDate}</span>
                              <span>• {ath.gender === 'F' ? 'Fem' : 'Var'}</span>
                              <span className="font-semibold text-slate-700">• {ath.kyuName}</span>
                              <span>• {ath.modalities.length >= 2 ? 'Ambas modalidades' : ath.modalities[0].replace('_ind', '')}</span>
                              {ath.weight && <span>• {ath.weight} kg</span>}
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            Fila {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => { setExcelParsedList([]); setExcelFileName(''); }}
                        className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmExcelImport}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Inscribir los {excelParsedList.length} Competidores</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OPCIÓN SECUNDARIA: PEGAR TEXTO DESDE WHATSAPP / TABLA */}
              <details className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <summary className="font-semibold text-slate-700 cursor-pointer">
                  O pegar lista en texto plano (desde WhatsApp / notas)
                </summary>
                <form onSubmit={handleBatchSubmit} className="space-y-3 mt-3">
                  <p className="text-slate-600 text-[11px]">
                    Formato: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">Nombre, AAAA-MM-DD, Sexo(M/F), Kyu, Peso, Estatura</code>
                  </p>
                  <textarea
                    rows={4}
                    placeholder={`Mateo Tanaka, 2021-04-12, M, 10 kyu, 18.5, 105\nRodrigo Tanaka, 2019-05-10, M, 8 kyu, 23.0, 120`}
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                  {batchError && (
                    <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                      {batchError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Procesar Texto
                  </button>
                </form>
              </details>
            </div>
          )}
        </div>

        {/* SECCIÓN 3: RESUMEN DE PAGO Y CUOTAS DE INSCRIPCIÓN (CALCULADOR FINANCIERO) */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-emerald-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  3. Resumen de Fichas de Inscripción y Total a Pagar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cálculo oficial de la cuota por ficha según las modalidades en las que participa cada competidor.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Cuota 1 modalidad: <strong>${feeSingle} MXN</strong> • 2 modalidades: <strong>${feeDouble} MXN</strong>
            </div>
          </div>

          {/* TARJETAS DE DESGLOSE FINANCIERO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">1 Modalidad (Kata o Kumite)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{singleModalityAthletes.length} atletas</span>
                <span className="text-xs text-slate-700 font-mono font-semibold">${totalSingleFee.toLocaleString('es-MX')} MXN</span>
              </div>
              <span className="text-[10px] text-slate-400 block">${feeSingle} MXN por competidor</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">2 Modalidades (Kata y Kumite)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{doubleModalityAthletes.length} atletas</span>
                <span className="text-xs text-slate-700 font-mono font-semibold">${totalDoubleFee.toLocaleString('es-MX')} MXN</span>
              </div>
              <span className="text-[10px] text-slate-400 block">${feeDouble} MXN por competidor</span>
            </div>

            {/* TOTAL DESTACADO */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-100 text-[11px] font-semibold">
                <span>TOTAL A LIQUIDAR</span>
                <Receipt className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                ${totalGrandPayment.toLocaleString('es-MX')} <span className="text-xs font-normal text-emerald-100">MXN</span>
              </div>
              <span className="text-[10px] text-emerald-100 block">
                Total de competidores: {myRegisteredAthletes.length}
              </span>
            </div>
          </div>

          {/* BOTÓN ENVIAR REPORTE AL ORGANIZADOR POR WHATSAPP */}
          {myRegisteredAthletes.length > 0 && (
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-100">
              <span className="text-[11px] text-emerald-800 font-medium">
                ¿Terminaste de inscribir? Envía tu reporte de alumnos y cuota al organizador:
              </span>
              <button
                type="button"
                onClick={handleSendWhatsAppReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Cédula y Ficha al Organizador por WhatsApp</span>
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN 4: MIS ATLETAS REGISTRADOS EN ESTA SESIÓN */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Alumnos Registrados por tu Escuela ({myRegisteredAthletes.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {dojoInfo.name || 'Sin dojo especificado aún'}
            </span>
          </div>

          {myRegisteredAthletes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aún no has registrado competidores. Completa el formulario individual o sube tu plantilla de Excel arriba.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {myRegisteredAthletes.map((ath, i) => {
                const modCount = (ath.modalities || []).length;
                const athleteFee = modCount >= 2 ? feeDouble : feeSingle;

                return (
                  <div key={ath.id || i} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{ath.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{ath.gender === 'F' ? 'Femenil' : 'Varonil'}</span>
                        <span>• Nac: {ath.birthDate}</span>
                        <span className="font-bold text-slate-700">• {ath.kyuName || ath.beltId}</span>
                        {ath.competingCategoryName && (
                          <span className="text-slate-600 font-medium">• {ath.competingCategoryName}</span>
                        )}
                        <span>• {modCount >= 2 ? 'Ambas modalidades (Kata + Kumite)' : ath.modalities?.[0]?.replace('_ind', '')}</span>
                        {ath.weight && <span>• {ath.weight} kg</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-slate-700 font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">
                        ${athleteFee} MXN
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Inscrito ✓
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
