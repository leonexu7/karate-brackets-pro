import { jsPDF } from 'jspdf';
import { SILHOUETTE_FEMALE_BASE64, SILHOUETTE_MALE_BASE64 } from '../assets/silhouetteData.js';
import { SHITOKAI_LOGO_BASE64 } from '../assets/logoData.js';

/**
 * Generador de PDF oficial para torneos de Karate Shito-Kai en formato Horizontal (Landscape).
 * Incorpora:
 * - Escudo Shito-Kai oficial en la esquina superior izquierda (logo oficial enviado por el usuario).
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

// Dibuja el escudo oficial de Shito-Kai en el PDF con la imagen oficial enviada por el usuario
function drawShitoKaiLogoPDF(doc, x, y, size = 16) {
  if (SHITOKAI_LOGO_BASE64) {
    try {
      doc.addImage(SHITOKAI_LOGO_BASE64, 'PNG', x, y, size, size, undefined, 'FAST');
      return;
    } catch (e) {
      console.warn('Error adding ShitoKai logo image to PDF, using vector fallback:', e);
    }
  }

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

// Silueta sutil de karateka oficial según género (Femenil o Varonil) como marca de agua tenue
function drawKarateSilhouetteWatermark(doc, isFemale = false) {
  // Círculo zen tenue en el fondo de la zona de llaves
  doc.setDrawColor(241, 245, 249);
  doc.circle(100, 110, 36, 'S');

  // Silueta oficial como marca de agua sutil (5% de opacidad para no estorbar textos ni líneas)
  try {
    const silhouetteImg = isFemale ? SILHOUETTE_FEMALE_BASE64 : SILHOUETTE_MALE_BASE64;
    if (doc.GState && doc.setGState) {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.05 }));
      doc.addImage(silhouetteImg, 'PNG', 80, 90, 40, 40, undefined, 'FAST');
      doc.restoreGraphicsState();
    }
  } catch (_) {
    // Modo de respaldo silencioso
  }
}

// Dibuja texto asegurando que nunca sobrepase maxWidth ni se encime con casillas adyacentes
function drawFitText(doc, text, x, y, maxWidth, baseFontSize = 7.5, minFontSize = 5.5) {
  if (!text) return;
  let fontSize = baseFontSize;
  doc.setFontSize(fontSize);
  while (doc.getTextWidth(text) > maxWidth && fontSize > minFontSize) {
    fontSize -= 0.25;
    doc.setFontSize(fontSize);
  }
  let renderedText = text;
  if (doc.getTextWidth(renderedText) > maxWidth) {
    while (doc.getTextWidth(renderedText + '…') > maxWidth && renderedText.length > 2) {
      renderedText = renderedText.slice(0, -1);
    }
    renderedText += '…';
  }
  doc.text(renderedText, x, y);
}

/**
 * Renderiza 1 Cuarteta completa en 1 hoja horizontal (Landscape)
 * Incluye Semifinal 1, Semifinal 2, Gran Final y Podio de 4 Medallas con líneas amplias para rellenar a mano.
 */
export function renderCuartetaPage(doc, cuarteta, tournament) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const pageBadge = cuarteta.totalGroups > 1
    ? `Cuarteta ${cuarteta.groupIndex} de ${cuarteta.totalGroups} (4 Medallas al Podio)`
    : 'Cuarteta Infantil — 4 Medallas Garantizadas';

  drawHeader(doc, tournament, cuarteta.categoryName, cuarteta.tatami, pageBadge);
  const isFemale = cuarteta.gender === 'F' || (cuarteta.categoryName && cuarteta.categoryName.toUpperCase().includes('FEMENIL'));
  drawKarateSilhouetteWatermark(doc, isFemale);

  const ath = cuarteta.athletes || [];

  const leftX = 12;
  const colW = 88;

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
  doc.rect(leftX + 3, 53, 2.5, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', leftX + 7.5, 59);
  doc.setTextColor(...COLOR_DARK);
  drawFitText(doc, ath[0]?.fullName || '__________________________', leftX + 17, 59, colW - 32, 7.5, 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  drawFitText(doc, ath[0]?.dojoName || 'Dojo / Escuela', leftX + 17, 63, colW - 32, 6.5, 5.5);

  // Casilla de puntos Aka
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 13, 53, 10, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Pts', leftX + colW - 8, 51, { align: 'center' });

  // Atleta 2 (Ao)
  doc.setFillColor(...COLOR_AO);
  doc.rect(leftX + 3, 69, 2.5, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', leftX + 7.5, 75);
  doc.setTextColor(...COLOR_DARK);
  drawFitText(doc, ath[1]?.fullName || '__________________________', leftX + 17, 75, colW - 32, 7.5, 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  drawFitText(doc, ath[1]?.dojoName || 'Dojo / Escuela', leftX + 17, 79, colW - 32, 6.5, 5.5);

  // Casilla de puntos Ao
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 13, 69, 10, 8);

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
  doc.rect(leftX + 3, 111, 2.5, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', leftX + 7.5, 117);
  doc.setTextColor(...COLOR_DARK);
  drawFitText(doc, ath[2]?.fullName || '__________________________', leftX + 17, 117, colW - 32, 7.5, 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  drawFitText(doc, ath[2]?.dojoName || 'Dojo / Escuela', leftX + 17, 121, colW - 32, 6.5, 5.5);

  // Casilla puntos Aka
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 13, 111, 10, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Pts', leftX + colW - 8, 109, { align: 'center' });

  // Atleta 4 (Ao)
  doc.setFillColor(...COLOR_AO);
  doc.rect(leftX + 3, 127, 2.5, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', leftX + 7.5, 133);
  doc.setTextColor(...COLOR_DARK);
  drawFitText(doc, ath[3]?.fullName || '__________________________', leftX + 17, 133, colW - 32, 7.5, 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  drawFitText(doc, ath[3]?.dojoName || 'Dojo / Escuela', leftX + 17, 137, colW - 32, 6.5, 5.5);

  // Casilla puntos Ao
  doc.setDrawColor(...COLOR_LINE);
  doc.rect(leftX + colW - 13, 127, 10, 8);

  // --- LÍNEAS DE CONEXIÓN TIPO BRACKET HACIA LA GRAN FINAL ---
  const lineMidX = leftX + colW + 12; // 112 mm
  doc.setDrawColor(...COLOR_DARK);
  doc.setLineWidth(0.7);

  // Rama Semi 1
  doc.line(leftX + colW, 64, lineMidX, 64);
  doc.line(lineMidX, 64, lineMidX, 85);

  // Rama Semi 2
  doc.line(leftX + colW, 122, lineMidX, 122);
  doc.line(lineMidX, 122, lineMidX, 101);

  // Rama hacia la Gran Final
  const finalX = lineMidX + 10; // 122 mm
  const finalW = 74;
  doc.line(lineMidX, 93, finalX, 93);

  // --- GRAN FINAL CON ESPACIO DESPEJADO PARA RELLENAR A MANO ---
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

  // Finalista Aka (espacio despejado para rellenar a mano)
  doc.setFillColor(...COLOR_AKA);
  doc.rect(finalX + 3, 83, 2.5, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AKA);
  doc.text('AKA:', finalX + 7.5, 89);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.line(finalX + 18, 91, finalX + finalW - 16, 91); // Línea amplia y limpia para rellenar a mano

  // Casilla Pts Finalista Aka
  doc.rect(finalX + finalW - 13, 84, 9.5, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Pts', finalX + finalW - 8.2, 82, { align: 'center' });

  // Finalista Ao (espacio despejado para rellenar a mano)
  doc.setFillColor(...COLOR_AO);
  doc.rect(finalX + 3, 102, 2.5, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_AO);
  doc.text('AO:', finalX + 7.5, 108);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.line(finalX + 18, 110, finalX + finalW - 16, 110); // Línea amplia y limpia para rellenar a mano

  // Casilla Pts Finalista Ao
  doc.rect(finalX + finalW - 13, 103, 9.5, 9);

  // --- CONECTOR HACIA EL PODIO OFICIAL ---
  const podioX = 204;
  const podioW = w - 10 - podioX; // 65.4 mm
  const midChampX = 200;

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.7);
  doc.line(finalX + finalW, 93, midChampX, 93);
  doc.line(midChampX, 93, midChampX, 58);
  doc.line(midChampX, 58, podioX, 58);
  doc.setFillColor(217, 119, 6);
  doc.triangle(podioX - 2.5, 56.5, podioX - 2.5, 59.5, podioX, 58, 'F');

  // --- PODIO DE PREMIACIÓN (4 MEDALLAS) ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.roundedRect(podioX, 42, podioW, 110, 2, 2, 'FD');

  doc.setFillColor(217, 119, 6); // Oro suave
  doc.roundedRect(podioX, 42, podioW, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PODIO OFICIAL (4 MEDALLAS)', podioX + podioW / 2, 48.5, { align: 'center' });

  // 1º ORO (Sin textos superpuestos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text('1º LUGAR (ORO)', podioX + 4, 57);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Atleta:', podioX + 4, 63.5);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.line(podioX + 14, 64, podioX + podioW - 4, 64);
  doc.text('Dojo:', podioX + 4, 70.5);
  doc.line(podioX + 14, 71, podioX + podioW - 4, 71);

  // 2º PLATA (Sin textos superpuestos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('2º LUGAR (PLATA)', podioX + 4, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Atleta:', podioX + 4, 86.5);
  doc.line(podioX + 14, 87, podioX + podioW - 4, 87);
  doc.text('Dojo:', podioX + 4, 93.5);
  doc.line(podioX + 14, 94, podioX + podioW - 4, 94);

  // 3º BRONCE 1 (Sin textos superpuestos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('3º LUGAR (BRONCE)', podioX + 4, 103);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Atleta:', podioX + 4, 109.5);
  doc.line(podioX + 14, 110, podioX + podioW - 4, 110);
  doc.text('Dojo:', podioX + 4, 116.5);
  doc.line(podioX + 14, 117, podioX + podioW - 4, 117);

  // 3º BRONCE 2 (Sin textos superpuestos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('3º LUGAR (BRONCE)', podioX + 4, 126);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Atleta:', podioX + 4, 132.5);
  doc.line(podioX + 14, 133, podioX + podioW - 4, 133);
  doc.text('Dojo:', podioX + 4, 139.5);
  doc.line(podioX + 14, 140, podioX + podioW - 4, 140);

  // Pie oficial Shito-Kai
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Shito-Kai México • 4 Medallistas', podioX + podioW / 2, 148, { align: 'center' });

  drawFooter(doc);
}

/**
 * Dibuja el panel lateral derecho con el Podio Oficial (1°, 2°, 3°, 3°) y Mesa de Control
 * siguiendo el estándar de torneos oficiales (Sportdata / WKF) con amplio espacio para rellenar a mano.
 */
function drawOfficialPodiumPanel(doc, x, w) {
  // 1. Encabezado de la Mesa
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, 38, w, 9.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('RESULTADOS Y PODIO', x + w / 2, 42.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Mesa de Control • Shito-Kai', x + w / 2, 46, { align: 'center' });

  // 2. Caja Destacada del Campeón (1º Lugar - Oro)
  const champBoxY = 49.5;
  const champBoxH = 25.5;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, champBoxY, w, champBoxH, 2, 2, 'FD');

  // Cinta superior dorada
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(x, champBoxY, w, 5.8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('1º LUGAR — CAMPEÓN (ORO)', x + w / 2, champBoxY + 4.2, { align: 'center' });

  // Líneas de Atleta y Dojo para Campeón
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR_DARK);
  doc.text('Atleta:', x + 3.5, champBoxY + 11.5);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.line(x + 13, champBoxY + 12.5, x + w - 3.5, champBoxY + 12.5);

  doc.text('Dojo:', x + 3.5, champBoxY + 20);
  doc.line(x + 13, champBoxY + 21, x + w - 3.5, champBoxY + 21);

  // 3. Tabla Completa de Podio y Medallas (1°, 2°, 3°, 3°)
  const podioTableY = 77;
  const podioTableH = 78;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, podioTableY, w, podioTableH, 2, 2, 'FD');

  // Cabecera oscura
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(x, podioTableY, w, 6.5, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('PODIO Y MEDALLERO OFICIAL', x + w / 2, podioTableY + 4.5, { align: 'center' });

  const rows = [
    {
      place: '1º ORO',
      label: 'Oro',
      sub: 'Ganador Final',
      bgColor: [255, 251, 235],
      badgeBg: [217, 119, 6],
    },
    {
      place: '2º PLATA',
      label: 'Plata',
      sub: 'Finalista',
      bgColor: [248, 250, 252],
      badgeBg: [100, 116, 139],
    },
    {
      place: '3º BRONCE',
      label: 'Bronce 1',
      sub: 'Semifinalista 1',
      bgColor: [255, 255, 255],
      badgeBg: [180, 83, 9],
    },
    {
      place: '3º BRONCE',
      label: 'Bronce 2',
      sub: 'Semifinalista 2',
      bgColor: [255, 255, 255],
      badgeBg: [180, 83, 9],
    },
  ];

  const rowH = 17.5;
  rows.forEach((row, i) => {
    const rowY = podioTableY + 6.8 + i * rowH;

    // Fondo de la fila
    doc.setFillColor(...row.bgColor);
    doc.rect(x + 0.5, rowY, w - 1, rowH, 'F');

    // Badge píldora con color de medalla
    doc.setFillColor(...row.badgeBg);
    doc.roundedRect(x + 3, rowY + 2.5, 17, 4.8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text(row.place, x + 11.5, rowY + 5.9, { align: 'center' });

    // Subtítulo pequeño a la derecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.3);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(row.sub, x + w - 3.5, rowY + 5.9, { align: 'right' });

    // Línea de Atleta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...COLOR_DARK);
    doc.text('Atleta:', x + 3.5, rowY + 11.2);
    doc.setDrawColor(...COLOR_LINE);
    doc.line(x + 13, rowY + 11.7, x + w - 3.5, rowY + 11.7);

    // Línea de Dojo
    doc.text('Dojo:', x + 3.5, rowY + 15.5);
    doc.line(x + 13, rowY + 16, x + w - 3.5, rowY + 16);

    // Divisor entre filas
    if (i < rows.length - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.line(x + 2, rowY + rowH, x + w - 2, rowY + rowH);
    }
  });

  // 4. Validación de Mesa y Firmas de Tatami
  const sigBoxY = 157;
  const sigBoxH = 37;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...COLOR_LINE);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, sigBoxY, w, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(x, sigBoxY, w, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_DARK);
  doc.text('VALIDACIÓN DE MESA DE TATAMI', x + w / 2, sigBoxY + 3.8, { align: 'center' });

  // Campos de firma y hora
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...COLOR_DARK);

  doc.text('Árbitro Central (Sushin):', x + 3.5, sigBoxY + 10.5);
  doc.setDrawColor(...COLOR_LINE);
  doc.line(x + 3.5, sigBoxY + 16.5, x + w - 3.5, sigBoxY + 16.5);

  doc.text('Juez de Mesa / Planillero:', x + 3.5, sigBoxY + 22.5);
  doc.line(x + 3.5, sigBoxY + 28.5, x + w - 3.5, sigBoxY + 28.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text('Hora Cierre: [____:____]', x + 3.5, sigBoxY + 34);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.2);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Shito-Kai México', x + w - 3.5, sigBoxY + 34, { align: 'right' });
}

/**
 * Renderiza 1 Bracket estándar de 8 o 16 competidores por hoja horizontal
 * con líneas de llave profesionales, espacio subrayado para rellenar a mano y casillas [ ] de puntaje,
 * más panel derecho con Podio Oficial (1°, 2°, 3°, 3°) inspirado en Sportdata / WKF.
 */
export function renderStandardBracketPage(doc, bracket, tournament, customBadge = '') {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const is16 = bracket.bracketSize === 16;
  let defaultBadge = 'Gráfica Oficial de 8 Posiciones';
  if (bracket.bracketSize === 2) {
    defaultBadge = 'Gran Final Directa — 2 Competidores';
  } else if (bracket.bracketSize === 4) {
    defaultBadge = 'Gráfica de 4 Posiciones (Semifinales y Final)';
  } else if (bracket.bracketSize === 16) {
    defaultBadge = 'Gráfica Oficial de 16 Posiciones';
  }
  const pageBadge = customBadge || defaultBadge;

  drawHeader(doc, tournament, bracket.categoryName, bracket.tatami, pageBadge);
  const isFemale = bracket.gender === 'F' || (bracket.categoryName && bracket.categoryName.toUpperCase().includes('FEMENIL'));
  drawKarateSilhouetteWatermark(doc, isFemale);

  const rounds = bracket.rounds || [];
  const numRounds = rounds.length;

  // Panel derecho reservado para Podio Oficial y Mesa de Tatami
  const podioW = 72;
  const podioX = w - 10 - podioW; // ~197.4 mm

  // Área para el árbol de combates (llaves)
  const startX = 10;
  const availableTreeWidth = podioX - 6 - startX; // ~181.4 mm
  let colWidth = availableTreeWidth / numRounds;
  let treeStartX = startX;

  if (numRounds === 1) {
    colWidth = 96;
    treeStartX = startX + (availableTreeWidth - colWidth) / 2;
  } else if (numRounds === 2) {
    colWidth = 78;
    treeStartX = startX + (availableTreeWidth - colWidth * 2) / 2;
  }

  const startY = 38;
  const totalHeight = 146;

  rounds.forEach((round, roundIndex) => {
    const roundX = treeStartX + roundIndex * colWidth;
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
      const matchCenterY = startY + 9 + matchIdx * slotSpacing + slotSpacing / 2;
      const boxW = colWidth - 6;
      const lineY_aka = matchCenterY - 4.5;
      const lineY_ao = matchCenterY + 4.5;

      // Línea AKA
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.4);
      doc.line(roundX + 8, lineY_aka, roundX + boxW - 8, lineY_aka);

      // Marca visual AKA
      doc.setFillColor(...COLOR_AKA);
      doc.rect(roundX + 3.5, lineY_aka - 3, 2.5, 3.5, 'F');

      // Texto AKA
      doc.setFont('helvetica', roundIndex === 0 && match.aka ? 'bold' : 'normal');
      doc.setTextColor(...COLOR_DARK);

      let textAka = '___________________';
      if (roundIndex === 0) {
        textAka = match.aka?.fullName || (match.isBye ? 'BYE' : '—');
      }
      drawFitText(doc, textAka, roundX + 7.5, lineY_aka - 1, boxW - 16, 6.8, 5.2);

      // Casilla de puntos AKA [ ]
      doc.rect(roundX + boxW - 7.5, lineY_aka - 4, 6.5, 5);

      // Línea AO
      doc.line(roundX + 8, lineY_ao, roundX + boxW - 8, lineY_ao);

      // Marca visual AO
      doc.setFillColor(...COLOR_AO);
      doc.rect(roundX + 3.5, lineY_ao - 3, 2.5, 3.5, 'F');

      // Texto AO
      doc.setFont('helvetica', roundIndex === 0 && match.ao ? 'bold' : 'normal');
      doc.setTextColor(...COLOR_DARK);

      let textAo = '___________________';
      if (roundIndex === 0) {
        textAo = match.ao?.fullName || (match.isBye ? 'BYE' : '—');
      }
      drawFitText(doc, textAo, roundX + 7.5, lineY_ao - 1, boxW - 16, 6.8, 5.2);

      // Casilla de puntos AO [ ]
      doc.rect(roundX + boxW - 7.5, lineY_ao - 4, 6.5, 5);

      // Número de combate pequeño en el centro
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`#${match.matchNumber || matchIdx + 1}`, roundX + 0.8, matchCenterY + 1);

      // --- LÍNEAS DE CONEXIÓN DE BRACKET HACIA LA SIGUIENTE RONDA ---
      if (roundIndex < numRounds - 1) {
        const nextRoundX = treeStartX + (roundIndex + 1) * colWidth;
        const lineStartX = roundX + boxW;
        const midLineX = lineStartX + (nextRoundX + 2 - lineStartX) / 2;
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const nextMatchSpacing = totalHeight / (matchCount / 2);
        const nextCenterY = startY + 9 + nextMatchIdx * nextMatchSpacing + nextMatchSpacing / 2;
        const isUpper = matchIdx % 2 === 0;

        doc.setDrawColor(...COLOR_DARK);
        doc.setLineWidth(0.5);

        // Conector horizontal saliendo de este combate
        doc.line(lineStartX, matchCenterY, midLineX, matchCenterY);

        // Barra vertical conectora
        doc.line(midLineX, matchCenterY, midLineX, nextCenterY);

        // Rama horizontal avanzando a la siguiente ronda
        if (isUpper) {
          doc.line(midLineX, nextCenterY, nextRoundX + 2, nextCenterY);
        }
      } else {
        // En la final: Conector que sube y entra directamente a la caja de Campeón
        const champEntryY = 62.5;
        const midChampX = roundX + boxW + (podioX - (roundX + boxW)) / 2;

        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.7);

        // Tramo horizontal desde el combate final
        doc.line(roundX + boxW, matchCenterY, midChampX, matchCenterY);

        // Tramo vertical conectando hacia la altura de Campeón
        doc.line(midChampX, matchCenterY, midChampX, champEntryY);

        // Entrada a la caja de Campeón
        doc.line(midChampX, champEntryY, podioX, champEntryY);

        // Flecha de entrada al Campeón
        doc.setFillColor(217, 119, 6);
        doc.triangle(podioX - 2.5, champEntryY - 1.5, podioX - 2.5, champEntryY + 1.5, podioX, champEntryY, 'F');
      }
    });
  });

  // Dibujar el panel oficial de Podio y Mesa de Tatami
  drawOfficialPodiumPanel(doc, podioX, podioW);

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
      // Hoja 3: Cruces Finales con Podio Oficial
      const w = doc.internal.pageSize.getWidth();
      drawHeader(doc, tournament, multiBracket.categoryName, multiBracket.tatami, page.title);
      const isFemale = multiBracket.gender === 'F' || (multiBracket.categoryName && multiBracket.categoryName.toUpperCase().includes('FEMENIL'));
      drawKarateSilhouetteWatermark(doc, isFemale);

      // Panel izquierdo para Semifinales y Gran Final (x = 12, w = 150)
      const leftW = 150;
      const podioW = 96;
      const podioX = w - 10 - podioW; // ~173.4 mm

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLOR_DARK);
      doc.text('CRUCES DE SEMIFINALES Y GRAN FINAL ABSOLUTA', 12 + leftW / 2, 42, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(page.note, 12 + leftW / 2, 47, { align: 'center' });

      // Cajas de Semifinales cruzadas con renglones para rellenar a mano
      const finalsX = 14;
      const finalsW = leftW - 4;

      // SF-1
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.5);
      doc.roundedRect(finalsX, 52, finalsW, 28, 2, 2, 'FD');

      doc.setFillColor(241, 245, 249);
      doc.rect(finalsX, 52, finalsW, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_DARK);
      doc.text('SEMIFINAL 1 (SF-1)', finalsX + 5, 56.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(...COLOR_AKA);
      doc.text('AKA:', finalsX + 5, 64);
      doc.setTextColor(...COLOR_DARK);
      doc.text('1º Poule A (Hoja 1): ________________________________________', finalsX + 15, 64);
      doc.rect(finalsX + finalsW - 13, 60, 8, 5.5);

      doc.setTextColor(...COLOR_AO);
      doc.text('AO:', finalsX + 5, 74);
      doc.setTextColor(...COLOR_DARK);
      doc.text('2º Poule B (Hoja 2): ________________________________________', finalsX + 15, 74);
      doc.rect(finalsX + finalsW - 13, 70, 8, 5.5);

      // SF-2
      doc.roundedRect(finalsX, 86, finalsW, 28, 2, 2, 'FD');
      doc.setFillColor(241, 245, 249);
      doc.rect(finalsX, 86, finalsW, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_DARK);
      doc.text('SEMIFINAL 2 (SF-2)', finalsX + 5, 90.5);

      doc.setTextColor(...COLOR_AKA);
      doc.text('AKA:', finalsX + 5, 98);
      doc.setTextColor(...COLOR_DARK);
      doc.text('1º Poule B (Hoja 2): ________________________________________', finalsX + 15, 98);
      doc.rect(finalsX + finalsW - 13, 94, 8, 5.5);

      doc.setTextColor(...COLOR_AO);
      doc.text('AO:', finalsX + 5, 108);
      doc.setTextColor(...COLOR_DARK);
      doc.text('2º Poule A (Hoja 1): ________________________________________', finalsX + 15, 108);
      doc.rect(finalsX + finalsW - 13, 104, 8, 5.5);

      // GRAN FINAL
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.8);
      doc.roundedRect(finalsX, 122, finalsW, 36, 2, 2, 'FD');

      doc.setFillColor(217, 119, 6);
      doc.roundedRect(finalsX, 122, finalsW, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('GRAN FINAL — MEDALLA DE ORO', finalsX + finalsW / 2, 127, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_AKA);
      doc.text('AKA:', finalsX + 6, 137);
      doc.setTextColor(...COLOR_DARK);
      doc.text('Ganador SF-1: _____________________________________________', finalsX + 17, 137);
      doc.rect(finalsX + finalsW - 14, 132, 9, 6.5);

      doc.setTextColor(...COLOR_AO);
      doc.text('AO:', finalsX + 6, 149);
      doc.setTextColor(...COLOR_DARK);
      doc.text('Ganador SF-2: _____________________________________________', finalsX + 17, 149);
      doc.rect(finalsX + finalsW - 14, 144, 9, 6.5);

      // Conector hacia el panel del podio
      const finalExitY = 139;
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.8);
      doc.line(finalsX + finalsW, finalExitY, podioX, finalExitY);
      doc.setFillColor(217, 119, 6);
      doc.triangle(podioX - 2.5, finalExitY - 1.5, podioX - 2.5, finalExitY + 1.5, podioX, finalExitY, 'F');

      // Panel de Podio Oficial en Hoja 3
      drawOfficialPodiumPanel(doc, podioX, podioW);

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
