import { jsPDF } from 'jspdf';
import { SILHOUETTE_FEMALE_BASE64, SILHOUETTE_MALE_BASE64 } from '../assets/silhouetteData';

/**
 * Generador de PDF oficial para torneos de Karate Shito-Kai en formato Horizontal (Landscape).
 * Incorpora:
 * - Escudo Shito-Kai oficial en la esquina superior izquierda.
 * - Líneas de llave estilo bracket conectadas con espacio amplio para rellenar a mano en mesa.
 * - Casillas de puntaje oficial [  ].
 * - Silueta sutil de karateka y detalle estético sin saturar la hoja.
 * - Tipografía y coordenadas calibradas para que NUNCA se encimen letras al imprimir.
 * - Paleta atractiva y suave (sin color vino).
 */

const COLOR_AKA = [225, 29, 72];      // Coral suave oficial WKF (reemplaza al vino)
const COLOR_AO = [37, 99, 235];       // Azul Zafiro suave WKF
const COLOR_DARK = [30, 41, 59];      // Pizarra oscuro #1E293B
const COLOR_MUTED = [100, 116, 139];  // Gris texto #64748B
const COLOR_LINE = [148, 163, 184];   // Líneas de bracket nítidas #94A3B8
const COLOR_HEADER_BG = [248, 250, 252];

// Dibuja el escudo vectorial oficial de Shito-Kai en el PDF (pequeño y nítido)
function drawShitoKaiLogoPDF(doc, x, y, size = 16) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  // Círculo rojo exterior
  doc.setFillColor(220, 38, 38);
  doc.circle(cx, cy, r, 'F');

  // Anillo blanco
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, r - 1.5, 'S');

  // Mon Mabuni interior en blanco
  doc.setFillColor(255, 255, 255);
  // Curvas estilizadas
  doc.circle(cx - 2.5, cy, 3, 'F');
  doc.circle(cx + 2.5, cy, 3, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(cx, cy - 5, cx, cy + 5);
  doc.line(cx - 5, cy, cx + 5, cy);
  // Centro
  doc.setFillColor(220, 38, 38);
  doc.circle(cx, cy, 1.2, 'F');
}

// Dibuja el encabezado oficial con escudo Shito-Kai
function drawHeader(doc, tournament, categoryName, tatami, pageBadge = '') {
  const w = doc.internal.pageSize.getWidth();

  // Fondo superior suave
  doc.setFillColor(...COLOR_HEADER_BG);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, 8, w - 20, 24, 1.5, 1.5, 'FD');

  // Franja bicolor sutil superior (Aka / Ao)
  doc.setFillColor(...COLOR_AKA);
  doc.rect(10, 8, (w - 20) / 2, 1.5, 'F');
  doc.setFillColor(...COLOR_AO);
  doc.rect(10 + (w - 20) / 2, 8, (w - 20) / 2, 1.5, 'F');

  // Escudo oficial Shito-Kai (chico, discreto, superior izquierdo)
  drawShitoKaiLogoPDF(doc, 14, 12, 15);

  // Título de la Organización y Torneo
  doc.setTextColor(...COLOR_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text((tournament?.name || 'TORNEO NACIONAL DE KARATE DO SHITO-KAI').toUpperCase(), 33, 17);

  // Subtítulo con fecha y sede
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Fecha: ${tournament?.date || '2026'} | Sede: ${tournament?.venue || 'Gimnasio Oficial'} | Organización Shito-Kai Karate-Do`,
    33,
    22
  );

  // Badge de Tatami en la esquina derecha
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.roundedRect(w - 60, 11, 46, 12, 1.5, 1.5, 'FD');
  doc.setTextColor(...COLOR_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`TATAMI ${tatami || 1}`, w - 37, 19, { align: 'center' });

  // Franja de Categoría Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text(`CATEGORÍA: ${categoryName.toUpperCase()}`, 33, 29);

  if (pageBadge) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_AKA);
    doc.text(pageBadge, w - 15, 29, { align: 'right' });
  }
}

// Dibuja el pie de página con firmas oficiales para los jueces
function drawFooter(doc) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const y = h - 14;

  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.3);
  doc.line(10, y, w - 10, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);

  // Firma Árbitro Central
  const f1X = 25;
  doc.line(f1X, y + 6, f1X + 45, y + 6);
  doc.text('Firma Árbitro Central (Sushin)', f1X + 22.5, y + 10, { align: 'center' });

  // Firma Juez de Mesa / Cronometrador
  const f2X = w - 70;
  doc.line(f2X, y + 6, f2X + 45, y + 6);
  doc.text('Firma Juez de Mesa / Planillero', f2X + 22.5, y + 10, { align: 'center' });

  // Texto central
  doc.text('Shito-Kai Karate-Do • Documento Oficial de Competencia • Mesa de Arbitraje', w / 2, y + 10, { align: 'center' });
}

// Silueta sutil de karateka oficial según género (Femenil o Varonil)
function drawKarateSilhouetteWatermark(doc, isFemale = false) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Círculo zen tenue en el centro de fondo
  doc.setDrawColor(241, 245, 249);
  doc.circle(w / 2, h / 2 + 6, 38, 'S');

  // Silueta oficial según rama (Femenil o Varonil)
  try {
    const silhouetteImg = isFemale ? SILHOUETTE_FEMALE_BASE64 : SILHOUETTE_MALE_BASE64;
    // Dibujada en la esquina inferior derecha como sello sobrio y nítido
    doc.addImage(silhouetteImg, 'PNG', w - 46, h - 48, 34, 34, undefined, 'FAST');
  } catch (_) {
    // Detalle de respaldo si fuera necesario
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('空手道', w - 30, h - 18, { align: 'center' });
  }
}

/**
 * Renderiza 1 Cuarteta completa en 1 hoja horizontal (Landscape)
 * Incluye Semifinal 1, Semifinal 2, Gran Final y Podio de 4 Medallas con líneas para rellenar a mano.
 */
export function renderCuartetaPage(doc, cuarteta, tournament) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const pageBadge = cuarteta.totalGroups > 1
    ? `Cuarteta ${cuarteta.groupIndex} de ${cuarteta.totalGroups} (4 Medallas al Podio)`
    : 'Cuarteta Formativa Infantil — 4 Medallas Garantizadas';

  drawHeader(doc, tournament, cuarteta.categoryName, cuarteta.tatami, pageBadge);
  const isFemale = cuarteta.gender === 'F' || (cuarteta.categoryName && cuarteta.categoryName.toUpperCase().includes('FEMENIL'));
  drawKarateSilhouetteWatermark(doc, isFemale);

  const ath = cuarteta.athletes || [];

  const leftX = 16;
  const colW = 80;

  // --- SEMIFINAL 1 ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftX, 42, colW, 44, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(leftX, 42, colW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_DARK);
  doc.text('COMBATE 1 — SEMIFINAL 1', leftX + 4, 47);

  // Atleta 1 (Aka)
  doc.setFillColor(...COLOR_AKA);
  doc.rect(leftX + 3, 53, 3, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', leftX + 8, 59);
  doc.setTextColor(...COLOR_DARK);
  const name1 = ath[0]?.fullName || '__________________________';
  doc.text(name1.length > 24 ? name1.slice(0, 23) + '…' : name1, leftX + 17, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(ath[0]?.dojoName || 'Dojo / Escuela', leftX + 17, 63);

  // Casilla de puntos Aka
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 14, 53, 10, 8);
  doc.text('Pts', leftX + colW - 9, 51, { align: 'center' });

  // Atleta 2 (Ao)
  doc.setFillColor(...COLOR_AO);
  doc.rect(leftX + 3, 69, 3, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', leftX + 8, 75);
  doc.setTextColor(...COLOR_DARK);
  const name2 = ath[1]?.fullName || '__________________________';
  doc.text(name2.length > 24 ? name2.slice(0, 23) + '…' : name2, leftX + 17, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(ath[1]?.dojoName || 'Dojo / Escuela', leftX + 17, 79);

  // Casilla de puntos Ao
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 14, 69, 10, 8);

  // --- SEMIFINAL 2 ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.roundedRect(leftX, 100, colW, 44, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(leftX, 100, colW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_DARK);
  doc.text('COMBATE 2 — SEMIFINAL 2', leftX + 4, 105);

  // Atleta 3 (Aka)
  doc.setFillColor(...COLOR_AKA);
  doc.rect(leftX + 3, 111, 3, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', leftX + 8, 117);
  doc.setTextColor(...COLOR_DARK);
  const name3 = ath[2]?.fullName || '__________________________';
  doc.text(name3.length > 24 ? name3.slice(0, 23) + '…' : name3, leftX + 17, 117);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(ath[2]?.dojoName || 'Dojo / Escuela', leftX + 17, 121);

  // Casilla puntos Aka
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 14, 111, 10, 8);
  doc.text('Pts', leftX + colW - 9, 109, { align: 'center' });

  // Atleta 4 (Ao)
  doc.setFillColor(...COLOR_AO);
  doc.rect(leftX + 3, 127, 3, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', leftX + 8, 133);
  doc.setTextColor(...COLOR_DARK);
  const name4 = ath[3]?.fullName || '__________________________';
  doc.text(name4.length > 24 ? name4.slice(0, 23) + '…' : name4, leftX + 17, 133);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(ath[3]?.dojoName || 'Dojo / Escuela', leftX + 17, 137);

  // Casilla puntos Ao
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 14, 127, 10, 8);

  // --- LÍNEAS DE CONEXIÓN TIPO BRACKET HACIA LA GRAN FINAL ---
  const lineMidX = leftX + colW + 14;
  doc.setDrawColor(...COLOR_DARK);
  doc.setLineWidth(0.7);

  // Rama Semi 1
  doc.line(leftX + colW, 64, lineMidX, 64);
  doc.line(lineMidX, 64, lineMidX, 85);

  // Rama Semi 2
  doc.line(leftX + colW, 122, lineMidX, 122);
  doc.line(lineMidX, 122, lineMidX, 101);

  // Rama hacia la Gran Final
  const finalX = lineMidX + 14;
  const finalW = 85;
  doc.line(lineMidX, 93, finalX, 93);

  // --- GRAN FINAL CON ESPACIO PARA RELLENAR A MANO ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_DARK);
  doc.setLineWidth(0.8);
  doc.roundedRect(finalX, 70, finalW, 52, 2, 2, 'FD');

  doc.setFillColor(...COLOR_DARK);
  doc.rect(finalX, 70, finalW, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('COMBATE 3 — GRAN FINAL (ORO Y PLATA)', finalX + finalW / 2, 75.5, { align: 'center' });

  // Finalista Aka (espacio para rellenar a mano)
  doc.setFillColor(...COLOR_AKA);
  doc.rect(finalX + 3, 83, 3, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', finalX + 8, 89);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Ganador Combate 1:', finalX + 17, 88);
  doc.setDrawColor(...COLOR_LINE);
  doc.line(finalX + 17, 94, finalX + finalW - 18, 94); // Línea para rellenar a mano

  // Casilla Pts Finalista Aka
  doc.rect(finalX + finalW - 14, 84, 10, 9);
  doc.text('Pts', finalX + finalW - 9, 82, { align: 'center' });

  // Finalista Ao (espacio para rellenar a mano)
  doc.setFillColor(...COLOR_AO);
  doc.rect(finalX + 3, 102, 3, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', finalX + 8, 108);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Ganador Combate 2:', finalX + 17, 107);
  doc.setDrawColor(...COLOR_LINE);
  doc.line(finalX + 17, 113, finalX + finalW - 18, 113); // Línea para rellenar a mano

  // Casilla Pts Finalista Ao
  doc.rect(finalX + finalW - 14, 103, 10, 9);

  // --- PODIO DE PREMIACIÓN (4 MEDALLAS GARANTIZADAS) ---
  const podioX = finalX + finalW + 12;
  const podioW = w - podioX - 12;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.roundedRect(podioX, 42, podioW, 110, 2, 2, 'FD');

  doc.setFillColor(217, 119, 6); // Oro suave
  doc.roundedRect(podioX, 42, podioW, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PODIO OFICIAL (4 MEDALLAS)', podioX + podioW / 2, 48.5, { align: 'center' });

  // 1º ORO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6);
  doc.text('1º LUGAR (ORO):', podioX + 4, 61);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Ganador Gran Final', podioX + podioW - 4, 61, { align: 'right' });
  doc.setDrawColor(...COLOR_LINE);
  doc.line(podioX + 4, 69, podioX + podioW - 4, 69); // Línea amplia para escribir nombre

  // 2º PLATA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('2º LUGAR (PLATA):', podioX + 4, 82);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Subcampeón Gran Final', podioX + podioW - 4, 82, { align: 'right' });
  doc.line(podioX + 4, 90, podioX + podioW - 4, 90); // Línea para escribir

  // 3º BRONCE 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('3º LUGAR (BRONCE):', podioX + 4, 103);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Perdedor Combate 1', podioX + podioW - 4, 103, { align: 'right' });
  doc.line(podioX + 4, 111, podioX + podioW - 4, 111); // Línea para escribir

  // 3º BRONCE 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('3º LUGAR (BRONCE):', podioX + 4, 124);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Perdedor Combate 2', podioX + podioW - 4, 124, { align: 'right' });
  doc.line(podioX + 4, 132, podioX + podioW - 4, 132); // Línea para escribir

  // Mensaje formativo
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(217, 119, 6);
  doc.text('✓ Formato Formativo: Todos los 4 niños reciben medalla', podioX + podioW / 2, 144, { align: 'center' });

  drawFooter(doc);
}

/**
 * Renderiza 1 Bracket estándar de 8 o 16 competidores por hoja horizontal
 * con líneas de llave profesionales, espacio subrayado para rellenar a mano y casillas [ ] de puntaje.
 */
export function renderStandardBracketPage(doc, bracket, tournament, customBadge = '') {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const is16 = bracket.bracketSize === 16;
  const pageBadge = customBadge || (is16 ? 'Gráfica Oficial de 16 Posiciones' : 'Gráfica Oficial de 8 Posiciones');

  drawHeader(doc, tournament, bracket.categoryName, bracket.tatami, pageBadge);
  const isFemale = bracket.gender === 'F' || (bracket.categoryName && bracket.categoryName.toUpperCase().includes('FEMENIL'));
  drawKarateSilhouetteWatermark(doc, isFemale);

  const rounds = bracket.rounds || [];
  const numRounds = rounds.length;
  const startX = 14;
  const availableWidth = w - 28;
  const colWidth = availableWidth / numRounds;
  const startY = 44;
  const totalHeight = 138;

  rounds.forEach((round, roundIndex) => {
    const roundX = startX + roundIndex * colWidth;
    const matches = round.matches || [];
    const matchCount = matches.length;
    const slotSpacing = totalHeight / matchCount;

    // Encabezado de la Ronda
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...COLOR_LINE);
    doc.setLineWidth(0.4);
    doc.roundedRect(roundX + 2, startY, colWidth - 4, 6.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_DARK);
    doc.text(round.name.toUpperCase(), roundX + colWidth / 2, startY + 4.5, { align: 'center' });

    matches.forEach((match, matchIdx) => {
      const matchCenterY = startY + 10 + matchIdx * slotSpacing + slotSpacing / 2;
      const boxW = colWidth - 7;
      const lineY_aka = matchCenterY - 4.5;
      const lineY_ao = matchCenterY + 4.5;

      // Línea AKA
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.4);
      doc.line(roundX + 8, lineY_aka, roundX + boxW - 10, lineY_aka);

      // Marca visual AKA
      doc.setFillColor(...COLOR_AKA);
      doc.rect(roundX + 4, lineY_aka - 3, 2.5, 3.5, 'F');

      // Texto AKA
      doc.setFont('helvetica', roundIndex === 0 && match.aka ? 'bold' : 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...COLOR_DARK);

      let textAka = '___________________';
      if (roundIndex === 0) {
        textAka = match.aka?.fullName || (match.isBye ? 'BYE' : '—');
      }
      const safeTextAka = textAka.length > 18 ? textAka.slice(0, 17) + '…' : textAka;
      doc.text(safeTextAka, roundX + 8, lineY_aka - 1);

      // Casilla de puntos AKA [ ]
      doc.rect(roundX + boxW - 9, lineY_aka - 4, 7, 5);

      // Línea AO
      doc.line(roundX + 8, lineY_ao, roundX + boxW - 10, lineY_ao);

      // Marca visual AO
      doc.setFillColor(...COLOR_AO);
      doc.rect(roundX + 4, lineY_ao - 3, 2.5, 3.5, 'F');

      // Texto AO
      doc.setFont('helvetica', roundIndex === 0 && match.ao ? 'bold' : 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...COLOR_DARK);

      let textAo = '___________________';
      if (roundIndex === 0) {
        textAo = match.ao?.fullName || (match.isBye ? 'BYE' : '—');
      }
      const safeTextAo = textAo.length > 18 ? textAo.slice(0, 17) + '…' : textAo;
      doc.text(safeTextAo, roundX + 8, lineY_ao - 1);

      // Casilla de puntos AO [ ]
      doc.rect(roundX + boxW - 9, lineY_ao - 4, 7, 5);

      // Número de combate pequeño en el centro
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`#${match.matchNumber || matchIdx + 1}`, roundX + 1, matchCenterY + 1);

      // --- LÍNEAS DE CONEXIÓN DE BRACKET HACIA LA SIGUIENTE RONDA ---
      if (roundIndex < numRounds - 1) {
        const nextRoundX = startX + (roundIndex + 1) * colWidth;
        const lineStartX = roundX + boxW;
        const midLineX = lineStartX + (nextRoundX + 4 - lineStartX) / 2;
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const nextMatchSpacing = totalHeight / (matchCount / 2);
        const nextCenterY = startY + 10 + nextMatchIdx * nextMatchSpacing + nextMatchSpacing / 2;
        const isUpper = matchIdx % 2 === 0;

        doc.setDrawColor(...COLOR_DARK);
        doc.setLineWidth(0.6);

        // Conector horizontal saliendo de este combate
        doc.line(lineStartX, matchCenterY, midLineX, matchCenterY);

        // Barra vertical conectora
        doc.line(midLineX, matchCenterY, midLineX, nextCenterY);

        // Rama horizontal avanzando a la siguiente ronda
        if (isUpper) {
          doc.line(midLineX, nextCenterY, nextRoundX + 4, nextCenterY);
        }
      } else {
        // En la final: Rama hacia la línea de CAMPEÓN
        const champLineX = roundX + boxW + 4;
        doc.setDrawColor(...COLOR_DARK);
        doc.setLineWidth(0.7);
        doc.line(roundX + boxW, matchCenterY, champLineX + 2, matchCenterY);

        // Línea de CAMPEÓN (ORO)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(217, 119, 6);
        doc.text('CAMPEÓN (1º ORO):', champLineX + 3, matchCenterY - 4);
        doc.setDrawColor(217, 119, 6);
        doc.line(champLineX + 3, matchCenterY + 1, champLineX + 38, matchCenterY + 1);
      }
    });
  });

  drawFooter(doc);
}

/**
 * Renderiza una gráfica Multi-Hoja conectada (ej. 3 hojas para categorías grandes de adolescentes)
 */
export function renderMultiPageBracket(doc, multiBracket, tournament) {
  const pages = multiBracket.pages || [];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage('letter', 'landscape');

    if (page.pageNumber === 1 || page.pageNumber === 2) {
      renderStandardBracketPage(doc, page.bracket, tournament, page.title);
    } else {
      // Hoja 3: Cruces Finales
      const w = doc.internal.pageSize.getWidth();
      drawHeader(doc, tournament, multiBracket.categoryName, multiBracket.tatami, page.title);
      const isFemale = multiBracket.gender === 'F' || (multiBracket.categoryName && multiBracket.categoryName.toUpperCase().includes('FEMENIL'));
      drawKarateSilhouetteWatermark(doc, isFemale);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_DARK);
      doc.text('CRUCES DE SEMIFINALES Y FINAL ABSOLUTA', w / 2, 48, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(page.note, w / 2, 54, { align: 'center' });

      // Cajas de Semifinales cruzadas con renglones para rellenar a mano
      const finalsX = w / 2 - 65;
      const finalsW = 130;

      // SF-1
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.5);
      doc.roundedRect(finalsX, 62, finalsW, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_DARK);
      doc.text('SEMIFINAL 1 (SF-1)', finalsX + 5, 68);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_AKA);
      doc.text('AKA:', finalsX + 5, 75);
      doc.setTextColor(...COLOR_DARK);
      doc.text('1º Poule A (Hoja 1): ________________________________', finalsX + 15, 75);
      doc.rect(finalsX + finalsW - 13, 70, 8, 6);

      doc.setTextColor(...COLOR_AO);
      doc.text('AO:', finalsX + 5, 83);
      doc.setTextColor(...COLOR_DARK);
      doc.text('2º Poule B (Hoja 2): ________________________________', finalsX + 15, 83);
      doc.rect(finalsX + finalsW - 13, 78, 8, 6);

      // SF-2
      doc.roundedRect(finalsX, 94, finalsW, 26, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_DARK);
      doc.text('SEMIFINAL 2 (SF-2)', finalsX + 5, 100);

      doc.setTextColor(...COLOR_AKA);
      doc.text('AKA:', finalsX + 5, 107);
      doc.setTextColor(...COLOR_DARK);
      doc.text('1º Poule B (Hoja 2): ________________________________', finalsX + 15, 107);
      doc.rect(finalsX + finalsW - 13, 102, 8, 6);

      doc.setTextColor(...COLOR_AO);
      doc.text('AO:', finalsX + 5, 115);
      doc.setTextColor(...COLOR_DARK);
      doc.text('2º Poule A (Hoja 1): ________________________________', finalsX + 15, 115);
      doc.rect(finalsX + finalsW - 13, 110, 8, 6);

      // GRAN FINAL
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(...COLOR_DARK);
      doc.setLineWidth(0.8);
      doc.roundedRect(finalsX, 126, finalsW, 28, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(217, 119, 6);
      doc.text('GRAN FINAL — MEDALLA DE ORO', finalsX + finalsW / 2, 133, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_DARK);
      doc.text('AKA: Ganador SF-1 _____________________', finalsX + 8, 142);
      doc.text('AO: Ganador SF-2 _____________________', finalsX + 70, 142);

      drawFooter(doc);
    }
  });
}

/**
 * Genera el documento PDF completo con todas las llaves del torneo
 */
export async function generateFullTournamentPDF(brackets, tournament, onProgress = () => {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const total = brackets.length;

  for (let i = 0; i < total; i++) {
    const item = brackets[i];
    if (i > 0) doc.addPage('letter', 'landscape');

    if (item.type === 'cuarteta') {
      renderCuartetaPage(doc, item, tournament);
    } else if (item.type === 'multipage') {
      renderMultiPageBracket(doc, item, tournament);
    } else {
      renderStandardBracketPage(doc, item, tournament);
    }

    onProgress(Math.round(((i + 1) / total) * 100));
    await new Promise(r => setTimeout(r, 10));
  }

  const safeName = (tournament?.name || 'Torneo_ShitoKai').replace(/\s+/g, '_');
  doc.save(`${safeName}_Graficas_Oficiales_Tatami.pdf`);
}

/**
 * Genera el PDF de una sola gráfica específica
 */
export function generateSingleBracketPDF(bracket, tournament) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  if (bracket.type === 'cuarteta') {
    renderCuartetaPage(doc, bracket, tournament);
  } else if (bracket.type === 'multipage') {
    renderMultiPageBracket(doc, bracket, tournament);
  } else {
    renderStandardBracketPage(doc, bracket, tournament);
  }

  const safeCategory = (bracket.categoryName || 'Grafica').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Grafica_ShitoKai_${safeCategory}.pdf`);
}
