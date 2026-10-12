import * as XLSX from 'xlsx';
import { getKyuInfo, resolveCompetingCategory } from '../constants/belts';

/**
 * Genera y descarga el archivo Excel oficial (.xlsx) con la plantilla estructurada
 * para que los profesores solo tengan que llenarla.
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Lista de Alumnos para Inscripción
  const headers = [
    'Nombre Completo',
    'Fecha Nacimiento (AAAA-MM-DD)',
    'Sexo (M/F)',
    'Grado KYU',
    'Modalidades (Ambas / Kata / Kumite)',
    'Peso kg',
    'Estatura cm (Opcional)',
  ];

  const sampleRows = [
    ['Mateo Tanaka Solís', '2019-04-12', 'M', '10 kyu', 'Ambas', 22.5, 118],
    ['Valentina Ruiz Flores', '2018-09-05', 'F', '8 kyu', 'Kata', 25.0, 122],
    ['Santiago Morales Gómez', '2014-06-20', 'M', '6 kyu', 'Kumite', 38.4, 145],
    ['Diego Hernández Cruz', '2011-03-15', 'M', '3 kyu', 'Ambas', 54.2, 168],
    ['Sofía Ramírez Soto', '2016-11-28', 'F', '7 kyu', 'Ambas', 29.1, 130],
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Configurar anchos de columna para que se lea perfectamente en Excel
  ws['!cols'] = [
    { wch: 32 }, // Nombre
    { wch: 28 }, // Fecha
    { wch: 12 }, // Sexo
    { wch: 16 }, // Grado KYU
    { wch: 34 }, // Modalidades
    { wch: 12 }, // Peso
    { wch: 22 }, // Estatura
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');

  // Hoja 2: Instrucciones y Normativa Oficial
  const guideData = [
    ['INSTRUCCIONES OFICIALES PARA EL LLENADO DE LA PLANTILLA - SHITO-KAI MÉXICO'],
    [''],
    ['1. Nombre Completo:', 'Escribe el nombre y apellidos del atleta sin apodos ni títulos.'],
    ['2. Fecha Nacimiento:', 'Usa el formato AAAA-MM-DD (ejemplo: 2018-05-15) para el cálculo exacto de edad al día del torneo.'],
    ['3. Sexo / Rama:', 'Escribe "M" para Varonil o "F" para Femenil.'],
    ['4. Grado KYU:', 'Escribe el Kyu técnico oficial: 10 kyu, 9 kyu, 8 kyu, 7 kyu, 6 kyu, 5 kyu, 4 kyu, 3 kyu, 2 kyu, 1 kyu o Dan / Cinta Negra.'],
    ['', 'NOTA: No se usan colores de cinta para evitar discrepancias entre diferentes escuelas.'],
    ['5. Modalidades:', '"Ambas" (Kata y Kumite), "Kata" (Formas) o "Kumite" (Combate).'],
    ['6. Peso (kg):', 'Peso del competidor en báscula. Obligatorio desde los 14 años (WKF). En menores de 14 años se usa para equilibrar las cuartetas.'],
    ['7. Estatura (cm):', 'Dato de referencia opcional.'],
  ];
  const guideWs = XLSX.utils.aoa_to_sheet(guideData);
  guideWs['!cols'] = [{ wch: 26 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, guideWs, 'Instrucciones');

  // Descargar archivo
  XLSX.writeFile(wb, 'Plantilla_Inscripcion_Karate_ShitoKai.xlsx');
}

/**
 * Lee y procesa un archivo Excel (.xlsx, .xls o .csv) subido por el profesor.
 * Devuelve un array de objetos atleta normalizados y validados.
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd',
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir hoja a matriz de filas crudas
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        });

        if (!rawRows || rawRows.length === 0) {
          resolve({ success: false, error: 'El archivo Excel está vacío.' });
          return;
        }

        const athletes = [];
        const warnings = [];

        rawRows.forEach((row, rowIndex) => {
          // Omitir fila si está vacía
          if (!row || row.length === 0 || !row.some(cell => String(cell).trim() !== '')) {
            return;
          }

          const firstCell = String(row[0] || '').trim().toLowerCase();
          // Omitir cabecera
          if (firstCell.includes('nombre') || firstCell.includes('atleta') || firstCell.includes('competidor')) {
            return;
          }

          const fullName = String(row[0] || '').trim();
          if (!fullName) return;

          // Normalizar fecha
          let birthDate = String(row[1] || '').trim();
          // Si la fecha viene como DD/MM/AAAA, convertir a AAAA-MM-DD
          if (birthDate.includes('/')) {
            const parts = birthDate.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                // DD/MM/YYYY -> YYYY-MM-DD
                birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else if (parts[0].length === 4) {
                // YYYY/MM/DD -> YYYY-MM-DD
                birthDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          }
          // Si no es fecha válida, usar fecha default
          if (!birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            birthDate = '2016-01-01';
            warnings.push(`Fila ${rowIndex + 1} (${fullName}): Fecha inválida, se asignó 2016-01-01.`);
          }

          // Rama / Sexo
          const rawGender = String(row[2] || '').trim().toUpperCase();
          const gender = rawGender.startsWith('F') ? 'F' : 'M';

          // Grado Kyu
          const rawKyu = String(row[3] || '').trim();
          const kyu = getKyuInfo(rawKyu || '10_kyu');

          // Modalidades
          const rawMod = String(row[4] || '').trim().toLowerCase();
          let modalities = ['kumite_ind', 'kata_ind'];
          if (rawMod.includes('kata') && !rawMod.includes('kumite') && !rawMod.includes('ambas')) {
            modalities = ['kata_ind'];
          } else if (rawMod.includes('kumite') && !rawMod.includes('kata') && !rawMod.includes('ambas')) {
            modalities = ['kumite_ind'];
          }

          // Peso y Estatura
          const rawWeight = parseFloat(String(row[5] || '').replace(',', '.'));
          const weight = !isNaN(rawWeight) && rawWeight > 0 ? rawWeight : null;

          const rawHeight = parseFloat(String(row[6] || '').replace(',', '.'));
          const height = !isNaN(rawHeight) && rawHeight > 0 ? rawHeight : null;

          athletes.push({
            id: `real-excel-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 5)}`,
            fullName,
            birthDate,
            gender,
            beltId: kyu.id,
            kyuName: kyu.name,
            competingCategory: kyu.naturalCategory,
            weight,
            height,
            modalities,
          });
        });

        if (athletes.length === 0) {
          resolve({
            success: false,
            error: 'No se encontraron registros válidos de competidores en el archivo.',
          });
          return;
        }

        resolve({
          success: true,
          athletes,
          count: athletes.length,
          warnings,
        });
      } catch (err) {
        reject(new Error('Error al procesar el archivo Excel: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsArrayBuffer(file);
  });
}
