const FONT_SIZE_RELLENO = 16;

function setFuenteRelleno(ctx, color = "#111827", align = "center", baseline = "middle") {
  ctx.fillStyle = color;
  ctx.font = `bold ${FONT_SIZE_RELLENO}px Arial`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
}

function activarTab(targetId, btnEl) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  tabPanels.forEach((p) => p.classList.remove("active"));

  if (btnEl) {
    btnEl.classList.add("active");
    btnEl.setAttribute("aria-selected", "true");
  }
  const panel = document.getElementById(targetId);
  if (panel) panel.classList.add("active");

  dibujarTodo();
}

window.activarTab = activarTab;

function getSitio() {
  const input = document.getElementById("sitio");
  const val = input ? input.value : "";
  return val.trim().toUpperCase() || "SITIO";
}

function getSitioSlug() {
  return getSitio().replace(/[^A-Z0-9_-]+/g, "_") || "SITIO";
}

function parsePositiveNum(val, fallback = 0) {
  const num = parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.max(0, num);
}

function formatNum(val, dec = 2, fallback = 0) {
  return parsePositiveNum(val, fallback).toFixed(dec);
}

function setAviso(elementId, mensaje) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (mensaje) {
    el.textContent = mensaje;
    el.hidden = false;
  } else {
    el.textContent = "";
    el.hidden = true;
  }
}

function descargarCanvas(canvasId, prefijo) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `${prefijo}_${getSitioSlug()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function dibujarSimboloTorre(ctx, tipo, cx, cy, sizeMultiplier = 1) {
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3.5;

  let textOffsetY = 0;

  if (tipo === "auto_cuadrado") {
    const s = 148 * sizeMultiplier;
    ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
  } else if (tipo === "auto_triangulo") {
    const r = 82 * sizeMultiplier;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx - r * 0.9, cy + r * 0.72);
    ctx.lineTo(cx + r * 0.9, cy + r * 0.72);
    ctx.closePath();
    ctx.stroke();
    textOffsetY = 14 * sizeMultiplier;
  } else if (tipo === "monopolo") {
    const rad = 64 * sizeMultiplier;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tipo === "ventada") {
    const s = 86 * sizeMultiplier;
    ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
  } else if (tipo === "arriostrada") {
    const rad = 40 * sizeMultiplier;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
  }

  setFuenteRelleno(ctx, "#111827", "center", "middle");
  ctx.fillText("TORRE", cx, cy + textOffsetY);
  ctx.restore();
}

function dibujarPozo(ctx, x, y, label) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.fillRect(x - 14, y - 18, 28, 36);
  ctx.strokeRect(x - 14, y - 18, 28, 36);

  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y);
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x + 9, y);
  ctx.moveTo(x - 6, y + 6);
  ctx.lineTo(x + 6, y + 6);
  ctx.moveTo(x - 3, y + 12);
  ctx.lineTo(x + 3, y + 12);
  ctx.stroke();

  setFuenteRelleno(ctx, "#111827", "center", "bottom");
  ctx.fillText(label, x, y - 22);
  ctx.restore();
}

function dibujarPuertaDobleHorizontal(ctx, x, y, anchoTotal, dirY = 1) {
  const half = anchoTotal / 2;
  ctx.save();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 2, y - 6, anchoTotal + 4, 12);

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 6);
  ctx.moveTo(x + anchoTotal, y - 6);
  ctx.lineTo(x + anchoTotal, y + 6);
  ctx.stroke();

  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + dirY * half);
  ctx.moveTo(x + anchoTotal, y);
  ctx.lineTo(x + anchoTotal, y + dirY * half);
  ctx.stroke();

  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  if (dirY > 0) {
    ctx.arc(x, y, half, 0, Math.PI / 2, false);
    ctx.arc(x + anchoTotal, y, half, Math.PI / 2, Math.PI, false);
  } else {
    ctx.arc(x, y, half, -Math.PI / 2, 0, false);
    ctx.arc(x + anchoTotal, y, half, -Math.PI, -Math.PI / 2, false);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* =========================================================
   PESTAÑA 1: DIAGRAMA SPAT (F12M)
   ========================================================= */
function dibujarSpat() {
  const canvas = document.getElementById("canvasSpat");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const sitio = getSitio();
  const tipoTorre = document.getElementById("spatTipoTorre").value;
  const cantPozos = Math.min(6, Math.max(1, parseInt(document.getElementById("cantidadPozos").value, 10) || 3));
  const v50 = formatNum(document.getElementById("val50").value, 2);
  const v60 = formatNum(document.getElementById("val60").value, 2);
  const v70 = formatNum(document.getElementById("val70").value, 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const boxX = 65;
  const boxY = 55;
  const boxW = 380;
  const boxH = 400;

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  const centerX = boxX + boxW / 2;
  ctx.save();
  setFuenteRelleno(ctx, "#dc2626", "center", "middle");
  ctx.fillText(sitio, centerX, boxY + 34);
  ctx.restore();

  dibujarSimboloTorre(ctx, tipoTorre, centerX, boxY + boxH / 2 + 25, 1);

  const posicionesPozos = [
    { x: boxX + 275, y: boxY + 325 },
    { x: boxX + 275, y: boxY + 125 },
    { x: boxX + 190, y: boxY + 100 },
    { x: boxX + 95,  y: boxY + 125 },
    { x: boxX + 95,  y: boxY + 325 },
    { x: boxX + 185, y: boxY + 350 }
  ];

  if (cantPozos > 1) {
    ctx.save();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < cantPozos; i++) {
      const p = posicionesPozos[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < cantPozos; i++) {
    dibujarPozo(ctx, posicionesPozos[i].x, posicionesPozos[i].y, `PT0${i + 1}`);
  }

  const pt01 = posicionesPozos[0];
  const doorWidth = 76;
  const doorX = pt01.x - 28;
  const doorY = boxY + boxH;
  dibujarPuertaDobleHorizontal(ctx, doorX, doorY, doorWidth, 1);

  const telX = 435;
  const telY = 545;
  const telW = 30;
  const telH = 78;

  ctx.save();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pt01.x, pt01.y + 18);
  ctx.lineTo(pt01.x, doorY + 62);
  ctx.lineTo(telX + 10, telY + 18);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.fillRect(telX, telY, telW, telH);
  ctx.strokeRect(telX, telY, telW, telH);

  setFuenteRelleno(ctx, "#111827", "left", "middle");
  ctx.fillText("TELUROMETRO", telX + 38, telY + 24);
  ctx.restore();

  const endBlueX = 595;
  const endBlueY = 825;
  ctx.save();
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(telX + 8, telY + telH);
  ctx.lineTo(endBlueX, endBlueY);
  ctx.stroke();

  const endRedX = 720;
  const endRedY = 935;
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(telX + 22, telY + telH);
  ctx.lineTo(endRedX, endRedY);
  ctx.stroke();
  ctx.restore();

  const lecturas = [
    { pct: "50%-15MTS=", ohm: `${v50} OHMS`, x: 575, y: 625 },
    { pct: "60%-18MTS=", ohm: `${v60} OHMS`, x: 640, y: 720 },
    { pct: "70%-21MTS=", ohm: `${v70} OHMS`, x: 705, y: 815 }
  ];

  lecturas.forEach((item) => {
    ctx.save();
    setFuenteRelleno(ctx, "#111827", "left", "top");
    ctx.fillText(item.pct, item.x, item.y);

    setFuenteRelleno(ctx, "#dc2626", "left", "top");
    ctx.fillText(item.ohm, item.x + 12, item.y + 24);
    ctx.restore();
  });

  ctx.save();
  setFuenteRelleno(ctx, "#111827", "center", "top");
  ctx.fillText("30 MTS", endRedX, endRedY + 12);
  ctx.restore();

  setAviso("avisoSpat", "");
}

/* =========================================================
   PESTAÑA 2: ESQUEMA 1 - PERÍMETRO Y COORDENADAS INCLINADAS
   CORRECCIÓN DE MEDIDAS LATERALES Y FONDOS (sin cuadros negros)
   ========================================================= */
function dibujarCoordInclinada(ctx, x, y, titulo, coordTexto, angleRad, w = 220, h = 64) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  setFuenteRelleno(ctx, "#111827", "center", "middle");
  ctx.fillText(titulo, 0, -13);
  ctx.fillText(coordTexto || "-", 0, 13);
  ctx.restore();
}

function dibujarPerimetro() {
  const canvas = document.getElementById("canvasPerimetro");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const sitio = getSitio();
  const rawAncho = parseFloat(document.getElementById("perAncho").value);
  const rawLargo = parseFloat(document.getElementById("perLargo").value);
  const invalido = isNaN(rawAncho) || isNaN(rawLargo) || rawAncho <= 0 || rawLargo <= 0;

  const numAncho = rawAncho > 0 ? rawAncho : 8.1;
  const numLargo = rawLargo > 0 ? rawLargo : 10.0;
  const ancho = numAncho.toFixed(2);
  const largo = numLargo.toFixed(2);

  const tipoTorre = document.getElementById("perTipoTorre").value;
  const coordA = document.getElementById("coordA").value.trim();
  const coordB = document.getElementById("coordB").value.trim();
  const coordC = document.getElementById("coordC").value.trim();
  const coordD = document.getElementById("coordD").value.trim();

  setAviso(
    "avisoPerimetro",
    invalido ? "Ingresa valores mayores a 0 en Ancho y Largo para calcular la proporción exacta." : ""
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ratio = numAncho / numLargo;
  const maxW = 640;
  const maxH = 520;
  const minSide = 310;
  let rectW = maxW;
  let rectH = maxH;

  if (ratio >= 1) {
    rectW = maxW;
    rectH = Math.max(minSide, Math.min(maxH, maxW / ratio));
  } else {
    rectH = maxH;
    rectW = Math.max(minSide, Math.min(maxW, maxH * ratio));
  }

  const rectX = (canvas.width - rectW) / 2;
  const rectY = 145;

  // Puerta de acceso en borde superior izquierdo
  const doorW = 84;
  const doorX = rectX + 24;
  const doorY = rectY;
  dibujarPuertaDobleHorizontal(ctx, doorX, doorY, doorW, -1);

  ctx.save();
  const calloutX = rectX - 24;
  const calloutY = rectY - 84;
  const calloutW = 190;
  const calloutH = 42;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.fillRect(calloutX, calloutY, calloutW, calloutH);
  ctx.strokeRect(calloutX, calloutY, calloutW, calloutH);

  ctx.beginPath();
  ctx.moveTo(calloutX + calloutW * 0.55, calloutY + calloutH);
  ctx.lineTo(doorX + doorW * 0.5, doorY - 40);
  ctx.stroke();

  setFuenteRelleno(ctx, "#111827", "center", "middle");
  ctx.fillText("PUERTA DE ACCESO", calloutX + calloutW / 2, calloutY + calloutH / 2);
  ctx.restore();

  // Perímetro principal
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.strokeRect(rectX, rectY, rectW, rectH);
  ctx.restore();

  const centerRectX = rectX + rectW / 2;
  const centerRectY = rectY + rectH / 2;

  // Cotas superiores e inferiores (Ancho) con fondo blanco explícito en cada caja
  [rectY - 38, rectY + rectH + 12].forEach((by) => {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.fillRect(centerRectX - 82, by, 164, 28);
    ctx.strokeRect(centerRectX - 82, by, 164, 28);
    setFuenteRelleno(ctx, "#111827", "center", "middle");
    ctx.fillText(`MTS ${ancho}`, centerRectX, by + 14);
    ctx.restore();
  });

  // Cotas izquierda y derecha (Largo) con fondo blanco explícito antes de rotar texto
  [rectX - 42, rectX + rectW + 14].forEach((bx) => {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.fillRect(bx, centerRectY - 82, 28, 164);
    ctx.strokeRect(bx, centerRectY - 82, 28, 164);

    ctx.translate(bx + 14, centerRectY);
    ctx.rotate(-Math.PI / 2);
    setFuenteRelleno(ctx, "#111827", "center", "middle");
    ctx.fillText(`MTS ${largo}`, 0, 0);
    ctx.restore();
  });

  // Sitio y símbolo de torre central
  const sizeMult = Math.max(0.55, Math.min(0.85, Math.min(rectW, rectH) / 480));
  ctx.save();
  setFuenteRelleno(ctx, "#dc2626", "center", "middle");
  ctx.fillText(sitio, centerRectX, centerRectY - 82 * sizeMult);
  ctx.restore();

  dibujarSimboloTorre(ctx, tipoTorre, centerRectX, centerRectY + 12 * sizeMult, sizeMult);

  // Coordenadas inclinadas en las 4 esquinas interiores
  const diagOffsetX = Math.min(125, rectW * 0.24);
  const diagOffsetY = Math.min(78, rectH * 0.22);
  const boxW = Math.min(235, Math.max(165, rectW * 0.42));
  const boxH = 62;

  dibujarCoordInclinada(ctx, rectX + diagOffsetX, rectY + diagOffsetY, "COORDENADA A:", coordA, -Math.PI / 4, boxW, boxH);
  dibujarCoordInclinada(ctx, rectX + rectW - diagOffsetX, rectY + diagOffsetY, "COORDENADA B:", coordB, Math.PI / 4, boxW, boxH);
  dibujarCoordInclinada(ctx, rectX + rectW - diagOffsetX, rectY + rectH - diagOffsetY, "COORDENADA C:", coordC, -Math.PI / 4, boxW, boxH);
  dibujarCoordInclinada(ctx, rectX + diagOffsetX, rectY + rectH - diagOffsetY, "COORDENADA D:", coordD, Math.PI / 4, boxW, boxH);
}

/* =========================================================
   PESTAÑA 3: ESQUEMA 2 - ELEVACIÓN DE TORRE (8 MODELOS FIELES A IMÁGENES)
   ========================================================= */
function actualizarCamposTorre() {
  const tipo = document.getElementById("torreTipo").value;
  const isMonopolo = tipo === "monopolo";
  const isStdRoldana = tipo === "autosoportada_normal" || tipo === "autosoportada_encima";
  const hasEdificio = tipo === "ventada_edificio" || tipo === "arriostrada_edificio_normal";
  const hasEscalera = tipo === "arriostrada_escalera_gato";

  document.querySelectorAll(".grp-monopolo").forEach((el) => (el.hidden = !isMonopolo));
  document.querySelectorAll(".grp-roldana-std").forEach((el) => (el.hidden = !isStdRoldana));
  document.querySelectorAll(".grp-edificio").forEach((el) => (el.hidden = !hasEdificio));
  document.querySelectorAll(".grp-escalera").forEach((el) => (el.hidden = !hasEscalera));
}

function dibujarFlechaVertical(ctx, x, yTop, yBot, punteada = true) {
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.fillStyle = "#111827";
  ctx.lineWidth = 2;

  // Línea vertical principal
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yBot);
  ctx.stroke();

  // Punta superior
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x - 5, yTop + 10);
  ctx.lineTo(x + 5, yTop + 10);
  ctx.closePath();
  ctx.fill();

  // Punta inferior
  ctx.beginPath();
  ctx.moveTo(x, yBot);
  ctx.lineTo(x - 5, yBot - 10);
  ctx.lineTo(x + 5, yBot - 10);
  ctx.closePath();
  ctx.fill();

  if (punteada) {
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x - 25, yTop);
    ctx.lineTo(x + 25, yTop);
    ctx.moveTo(x - 25, yBot);
    ctx.lineTo(x + 25, yBot);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function dibujarEdificioBase(ctx, groundY, buildingBottomY, alturaEdificio) {
  const bldX = 160;
  const bldW = 460;
  const bldH = buildingBottomY - groundY;

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2.5;
  ctx.fillRect(bldX, groundY, bldW, bldH);
  ctx.strokeRect(bldX, groundY, bldW, bldH);

  // Losas de pisos (4 niveles) y columnas internas como en la referencia
  const pisos = 4;
  for (let p = 1; p < pisos; p++) {
    const py = groundY + (bldH / pisos) * p;
    ctx.beginPath();
    ctx.moveTo(bldX, py);
    ctx.lineTo(bldX + bldW, py);
    ctx.stroke();
  }
  [bldX + 130, bldX + 185, bldX + 320].forEach((colX) => {
    ctx.beginPath();
    ctx.moveTo(colX, groundY);
    ctx.lineTo(colX, buildingBottomY);
    ctx.stroke();
  });

  // Ducto vertical interno punteado rojo/azul
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(bldX + 152, groundY + 6);
  ctx.lineTo(bldX + 152, buildingBottomY - 6);
  ctx.stroke();

  ctx.strokeStyle = "#0284c7";
  ctx.beginPath();
  ctx.moveTo(bldX + 160, groundY + 6);
  ctx.lineTo(bldX + 160, buildingBottomY - 6);
  ctx.stroke();
  ctx.setLineDash([]);

  // Línea de suelo inferior
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, buildingBottomY);
  ctx.lineTo(840, buildingBottomY);
  ctx.stroke();

  // Cota ALTURA EDIFICIO SIN PARAPETO =
  const dimX = 700;
  dibujarFlechaVertical(ctx, dimX, groundY, buildingBottomY, true);
  setFuenteRelleno(ctx, "#111827", "left", "middle");
  const midY = (groundY + buildingBottomY) / 2;
  ctx.fillText("ALTURA", dimX + 12, midY - 30);
  ctx.fillText("EDIFICIO", dimX + 12, midY - 10);
  ctx.fillText("SIN", dimX + 12, midY + 10);
  ctx.fillText(`PARAPETO = ${alturaEdificio} m`, dimX + 12, midY + 30);

  ctx.restore();
}

function dibujarTorreElevacion() {
  const canvas = document.getElementById("canvasTorre");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  actualizarCamposTorre();

  const tipoTorre = document.getElementById("torreTipo").value;
  const rawAlturaTotal = parseFloat(document.getElementById("alturaTorre").value);
  const rawAlturaBase = parseFloat(document.getElementById("alturaBase").value);
  const rawRoldanaSup = parseFloat(document.getElementById("roldanaSup").value);
  const rawRoldanaInf = parseFloat(document.getElementById("roldanaInf").value);
  const rawAlturaEdificio = parseFloat(document.getElementById("alturaEdificio").value);
  const rawAlturaEscalera = parseFloat(document.getElementById("alturaEscaleraGato").value);

  const numAlturaTotal = rawAlturaTotal > 0 ? rawAlturaTotal : 60.2;
  const numAlturaBase = rawAlturaBase >= 0 ? rawAlturaBase : 0.5;
  const numRoldanaSup = rawRoldanaSup >= 0 ? rawRoldanaSup : numAlturaTotal;
  const numRoldanaInf = rawRoldanaInf >= 0 ? rawRoldanaInf : Math.max(0, numRoldanaSup - 1.2);
  const numAlturaEdificio = rawAlturaEdificio >= 0 ? rawAlturaEdificio : 12.0;
  const numAlturaEscalera = rawAlturaEscalera >= 0 ? rawAlturaEscalera : 2.4;

  const avisos = [];
  if (rawAlturaTotal <= 0 || isNaN(rawAlturaTotal)) {
    avisos.push("La altura total debe ser mayor a 0 m.");
  }
  if (numAlturaBase > numAlturaTotal) {
    avisos.push("La altura de base/pedestal supera la altura total ingresada.");
  }
  setAviso("avisoTorre", avisos.join(" "));

  const alturaTotal = numAlturaTotal.toFixed(2);
  const alturaBase = numAlturaBase.toFixed(2);
  const roldanaSup = numRoldanaSup.toFixed(2);
  const roldanaInf = numRoldanaInf.toFixed(2);
  const alturaEdificio = numAlturaEdificio.toFixed(2);
  const alturaEscalera = numAlturaEscalera.toFixed(2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tieneEdificio = tipoTorre === "ventada_edificio" || tipoTorre === "arriostrada_edificio_normal";
  const groundY = tieneEdificio ? 740 : 1040;
  const buildingBottomY = 1120;
  const maxDrawH = tieneEdificio ? 540 : 840;
  const minDrawH = 300;
  const drawH = Math.max(minDrawH, Math.min(maxDrawH, (numAlturaTotal / 60) * maxDrawH));
  const topY = groundY - drawH;
  const cx = 400;

  const pxPorMetro = drawH / Math.max(1, numAlturaTotal);
  const pedH = Math.max(24, Math.min(drawH * 0.25, numAlturaBase * pxPorMetro));
  const towerBaseY = groundY - pedH;

  ctx.save();

  // Línea de suelo / azotea
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, groundY);
  ctx.lineTo(840, groundY);
  ctx.stroke();

  if (tieneEdificio) {
    dibujarEdificioBase(ctx, groundY, buildingBottomY, alturaEdificio);
  }

  /* =========================================================
     MODELO 1: Torre público tipo arbol
     ========================================================= */
  if (tipoTorre === "arbol") {
    // Pedestal de concreto
    const pedW = 140;
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - pedW / 2, groundY - pedH, pedW, pedH);
    ctx.strokeRect(cx - pedW / 2, groundY - pedH, pedW, pedH);

    // Tronco marrón con textura
    const trunkTopY = topY + drawH * 0.14;
    ctx.fillStyle = "#78553a";
    ctx.beginPath();
    ctx.moveTo(cx - 22, towerBaseY);
    ctx.lineTo(cx - 12, trunkTopY);
    ctx.lineTo(cx + 12, trunkTopY);
    ctx.lineTo(cx + 22, towerBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Escalera lateral derecha sobre el tronco
    const ladX = cx + 18;
    const ladTop = topY + drawH * 0.42;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ladX, ladTop);
    ctx.lineTo(ladX, towerBaseY - 10);
    ctx.moveTo(ladX + 10, ladTop);
    ctx.lineTo(ladX + 10, towerBaseY - 10);
    for (let y = ladTop + 8; y < towerBaseY - 12; y += 12) {
      ctx.moveTo(ladX, y);
      ctx.lineTo(ladX + 10, y);
    }
    ctx.stroke();

    // Collarín intermedio
    ctx.fillStyle = "#64748b";
    ctx.fillRect(cx - 22, topY + drawH * 0.62, 46, 10);
    ctx.strokeRect(cx - 22, topY + drawH * 0.62, 46, 10);

    // Follaje ovalado verde-grisáceo y antenas sectoriales internas
    const canopyCY = topY + drawH * 0.23;
    const canopyRX = 92;
    const canopyRY = drawH * 0.22;
    ctx.fillStyle = "rgba(134, 163, 145, 0.45)";
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, canopyCY, canopyRX, canopyRY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ramas / hojas perimetrales
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      const lx = cx + Math.cos(a) * (canopyRX - 8);
      const ly = canopyCY + Math.sin(a) * (canopyRY - 8);
      ctx.beginPath();
      ctx.ellipse(lx, ly, 22, 12, a, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Antenas sectoriales dentro de la copa
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(cx - 42, canopyCY - 45, 22, 75);
    ctx.strokeRect(cx - 42, canopyCY - 45, 22, 75);
    ctx.fillRect(cx + 20, canopyCY - 45, 22, 75);
    ctx.strokeRect(cx + 20, canopyCY - 45, 22, 75);

    // Cotas: izquierda ALTURA TORRE + BASE= (desde tope de copa hasta tope de pedestal)
    const leftDimX = 215;
    dibujarFlechaVertical(ctx, leftDimX, topY, towerBaseY, true);
    setFuenteRelleno(ctx, "#111827", "left", "middle");
    const midL = (topY + towerBaseY) / 2;
    ctx.fillText("ALTURA", 65, midL - 22);
    ctx.fillText("TORRE +", 65, midL);
    ctx.fillText(`BASE = ${alturaTotal} m`, 65, midL + 22);

    // Derecha inferior ALTURA BASE=
    const rightDimX = cx + 125;
    dibujarFlechaVertical(ctx, rightDimX, towerBaseY, groundY, true);
    setFuenteRelleno(ctx, "#111827", "left", "middle");
    const midB = (towerBaseY + groundY) / 2;
    ctx.fillText("ALTURA", rightDimX + 14, midB - 10);
    ctx.fillText(`BASE = ${alturaBase} m`, rightDimX + 14, midB + 12);
  }

  /* =========================================================
     MODELO 2: TORRE MONOPOLO (fuste escalonado + 3 cuerpos de roldanas)
     ========================================================= */
  else if (tipoTorre === "monopolo") {
    const r1Sup = formatNum(document.getElementById("rol1Sup").value, 2);
    const r1Inf = formatNum(document.getElementById("rol1Inf").value, 2);
    const r2Sup = formatNum(document.getElementById("rol2Sup").value, 2);
    const r2Inf = formatNum(document.getElementById("rol2Inf").value, 2);
    const r3Sup = formatNum(document.getElementById("rol3Sup").value, 2);
    const r3Inf = formatNum(document.getElementById("rol3Inf").value, 2);

    // Base inferior redondeada
    const baseW = 135;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - baseW / 2, groundY - pedH, baseW, pedH, 10);
    ctx.fill();
    ctx.stroke();

    // Fuste monopolo cónico
    ctx.beginPath();
    ctx.moveTo(cx - 24, topY);
    ctx.lineTo(cx - 48, towerBaseY);
    ctx.lineTo(cx + 48, towerBaseY);
    ctx.lineTo(cx + 24, topY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3 cuerpos/plataformas rectangulares de roldanas (1, 2, 3)
    const bloques = [
      { y1: topY + drawH * 0.06, h: 48, w: 86, sup: r1Sup, inf: r1Inf, n: 1 },
      { y1: topY + drawH * 0.17, h: 52, w: 102, sup: r2Sup, inf: r2Inf, n: 2 },
      { y1: topY + drawH * 0.29, h: 56, w: 118, sup: r3Sup, inf: r3Inf, n: 3 }
    ];

    bloques.forEach((b) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - b.w / 2, b.y1, b.w, b.h);
      ctx.strokeRect(cx - b.w / 2, b.y1, b.w, b.h);

      // Líneas horizontales de cota a la derecha
      ctx.beginPath();
      ctx.moveTo(cx + b.w / 2, b.y1);
      ctx.lineTo(cx + 105, b.y1);
      ctx.moveTo(cx + b.w / 2, b.y1 + b.h);
      ctx.lineTo(cx + 105, b.y1 + b.h);
      ctx.stroke();

      setFuenteRelleno(ctx, "#111827", "left", "middle");
      ctx.fillText(`ALTURA ROLDANA ${b.n} SUPERIOR = ${b.sup} m`, cx + 112, b.y1 + 6);
      ctx.fillText(`ALTURA ROLDANA ${b.n} INFERIOR = ${b.inf} m`, cx + 112, b.y1 + b.h - 4);
    });

    // Llave izquierda ALTURA TORRE + BASE=
    const brX = 230;
    ctx.beginPath();
    ctx.moveTo(brX + 16, topY);
    ctx.lineTo(brX, topY);
    ctx.lineTo(brX, (topY + groundY) / 2 - 8);
    ctx.lineTo(brX - 16, (topY + groundY) / 2);
    ctx.lineTo(brX, (topY + groundY) / 2 + 8);
    ctx.lineTo(brX, groundY);
    ctx.lineTo(brX + 16, groundY);
    ctx.stroke();

    setFuenteRelleno(ctx, "#111827", "left", "middle");
    const midM = (topY + groundY) / 2;
    ctx.fillText("ALTURA", 45, midM - 22);
    ctx.fillText("TORRE +", 45, midM);
    ctx.fillText(`BASE = ${alturaTotal} m`, 45, midM + 22);

    // Llave derecha inferior ALTURA BASE=
    const rBrX = cx + baseW / 2 + 12;
    ctx.beginPath();
    ctx.moveTo(rBrX, towerBaseY);
    ctx.lineTo(rBrX + 12, towerBaseY);
    ctx.lineTo(rBrX + 12, (towerBaseY + groundY) / 2 - 5);
    ctx.lineTo(rBrX + 22, (towerBaseY + groundY) / 2);
    ctx.lineTo(rBrX + 12, (towerBaseY + groundY) / 2 + 5);
    ctx.lineTo(rBrX + 12, groundY);
    ctx.lineTo(rBrX, groundY);
    ctx.stroke();

    const midBase = (towerBaseY + groundY) / 2;
    ctx.fillText("ALTURA", rBrX + 30, midBase - 10);
    ctx.fillText(`BASE = ${alturaBase} m`, rBrX + 30, midBase + 12);
  }

  /* =========================================================
     MODELOS 3 y 7: Torre autosoportada (roldana normal / roldana encima)
     ========================================================= */
  else if (tipoTorre === "autosoportada_normal" || tipoTorre === "autosoportada_encima") {
    const baseHalfW = 105;
    const topHalfW = 48;
    const waistY = topY + (towerBaseY - topY) * 0.55;
    const waistHalfW = 54;

    // Pedestales izquierdo y derecho
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.fillRect(cx - baseHalfW - 12, groundY - pedH, 24, pedH);
    ctx.strokeRect(cx - baseHalfW - 12, groundY - pedH, 24, pedH);
    ctx.fillRect(cx + baseHalfW - 12, groundY - pedH, 24, pedH);
    ctx.strokeRect(cx + baseHalfW - 12, groundY - pedH, 24, pedH);

    // Montantes principales con quiebre en cintura
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - topHalfW, topY);
    ctx.lineTo(cx - waistHalfW, waistY);
    ctx.lineTo(cx - baseHalfW, towerBaseY);
    ctx.moveTo(cx + topHalfW, topY);
    ctx.lineTo(cx + waistHalfW, waistY);
    ctx.lineTo(cx + baseHalfW, towerBaseY);
    ctx.stroke();

    // Escalera central
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 10, topY);
    ctx.lineTo(cx - 10, towerBaseY);
    ctx.moveTo(cx + 10, topY);
    ctx.lineTo(cx + 10, towerBaseY);
    for (let y = topY + 12; y < towerBaseY; y += 16) {
      ctx.moveTo(cx - 10, y);
      ctx.lineTo(cx + 10, y);
    }
    ctx.stroke();

    // Celosía en X
    const tramos = 12;
    for (let i = 0; i < tramos; i++) {
      const f1 = i / tramos;
      const f2 = (i + 1) / tramos;
      const y1 = topY + (towerBaseY - topY) * f1;
      const y2 = topY + (towerBaseY - topY) * f2;
      const hw1 = f1 < 0.55
        ? topHalfW + (waistHalfW - topHalfW) * (f1 / 0.55)
        : waistHalfW + (baseHalfW - waistHalfW) * ((f1 - 0.55) / 0.45);
      const hw2 = f2 < 0.55
        ? topHalfW + (waistHalfW - topHalfW) * (f2 / 0.55)
        : waistHalfW + (baseHalfW - waistHalfW) * ((f2 - 0.55) / 0.45);

      ctx.beginPath();
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw1, y1);
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw2, y2);
      ctx.moveTo(cx + hw1, y1);
      ctx.lineTo(cx - hw2, y2);
      ctx.stroke();
    }

    // Canastilla superior y antenas sectoriales laterales
    const platTopY = topY + 34;
    const platBotY = topY + 72;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 82, platTopY, 164, platBotY - platTopY);
    // Antenas laterales
    ctx.strokeRect(cx - 98, platTopY - 22, 12, 62);
    ctx.strokeRect(cx + 86, platTopY - 22, 12, 62);

    // Mástil pararrayos superior
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, Math.max(36, topY - 82));
    ctx.stroke();

    // Cotas según modelo 3 (roldana normal) o 7 (roldana encima)
    const supLineY = tipoTorre === "autosoportada_encima" ? platTopY - 12 : platTopY;
    const infLineY = platBotY;

    // Flecha izquierda: ALTURA ROLDANA SUPERIOR =
    const leftArrowX = 235;
    dibujarFlechaVertical(ctx, leftArrowX, supLineY, groundY, true);
    setFuenteRelleno(ctx, "#111827", "left", "middle");
    const midSup = (supLineY + groundY) / 2;
    ctx.fillText("ALTURA", 40, midSup - 22);
    ctx.fillText("ROLDANA", 40, midSup);
    ctx.fillText(`SUPERIOR = ${roldanaSup} m`, 40, midSup + 22);

    // Flecha derecha 1: ALTURA ROLDANA INFERIOR =
    const rightArrow1X = 560;
    dibujarFlechaVertical(ctx, rightArrow1X, infLineY, groundY, true);
    const midInf = (infLineY + groundY) / 2 + 25;
    ctx.fillText("ALTURA", rightArrow1X + 10, midInf - 22);
    ctx.fillText("ROLDANA", rightArrow1X + 10, midInf);
    ctx.fillText(`INFERIOR = ${roldanaInf} m`, rightArrow1X + 10, midInf + 22);

    // Flecha derecha 2: ALTURA TORRE + BASE =
    const rightArrow2X = 720;
    dibujarFlechaVertical(ctx, rightArrow2X, topY, groundY, true);
    const midTot = (topY + groundY) / 2 - 40;
    ctx.fillText("ALTURA", rightArrow2X + 12, midTot - 22);
    ctx.fillText("TORRE +", rightArrow2X + 12, midTot);
    ctx.fillText(`BASE = ${alturaTotal} m`, rightArrow2X + 12, midTot + 22);

    // Texto central inferior: Altura Base =
    setFuenteRelleno(ctx, "#111827", "center", "middle");
    ctx.fillText(`ALTURA BASE = ${alturaBase} m`, cx, groundY - pedH / 2);
  }

  /* =========================================================
     MODELOS 4 y 8: Torre arriostrada (con escalera gato / con edificio normal)
     ========================================================= */
  else if (tipoTorre === "arriostrada_escalera_gato" || tipoTorre === "arriostrada_edificio_normal") {
    const hasEscalera = tipoTorre === "arriostrada_escalera_gato";
    const egH = hasEscalera ? Math.max(54, Math.min(115, numAlturaEscalera * 22)) : 0;
    const baseStructTopY = groundY - egH;

    if (hasEscalera) {
      // Caseta / escalera gato sobre azotea
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 80, baseStructTopY, 180, egH);
      ctx.strokeRect(cx - 80, baseStructTopY, 180, egH);

      // Escalera de gato vertical a la izquierda
      ctx.strokeStyle = "#111827";
      ctx.beginPath();
      ctx.moveTo(cx - 64, baseStructTopY + 6);
      ctx.lineTo(cx - 64, groundY - 6);
      ctx.moveTo(cx - 52, baseStructTopY + 6);
      ctx.lineTo(cx - 52, groundY - 6);
      for (let y = baseStructTopY + 12; y < groundY - 8; y += 12) {
        ctx.moveTo(cx - 64, y);
        ctx.lineTo(cx - 52, y);
      }
      ctx.stroke();

      // Cota ALTURA ESCALERA GATO =
      const egDimX = 560;
      dibujarFlechaVertical(ctx, egDimX, baseStructTopY, groundY, true);
      setFuenteRelleno(ctx, "#111827", "left", "middle");
      const midEg = (baseStructTopY + groundY) / 2;
      ctx.fillText("ALTURA", egDimX + 12, midEg - 20);
      ctx.fillText("ESCALERA", egDimX + 12, midEg);
      ctx.fillText(`GATO = ${alturaEscalera} m`, egDimX + 12, midEg + 20);
    }

    const mastTopY = topY;
    const mastPedTopY = baseStructTopY - pedH;

    // Pedestal izquierdo y punto de anclaje derecho de riostra
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - 58, mastPedTopY, 44, pedH);
    ctx.strokeRect(cx - 58, mastPedTopY, 44, pedH);

    ctx.fillRect(cx + 85, baseStructTopY - 22, 32, 22);
    ctx.strokeRect(cx + 85, baseStructTopY - 22, 32, 22);

    // Mástil monopolo arriostrado con soportes de antenas
    const mastX = cx - 36;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mastX, mastTopY);
    ctx.lineTo(mastX, mastPedTopY);
    ctx.stroke();

    // Soportes de antenas superiores
    ctx.lineWidth = 2.5;
    ctx.strokeRect(mastX - 46, mastTopY + 25, 92, 85);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mastX - 46, mastTopY + 12);
    ctx.lineTo(mastX - 46, mastTopY + 125);
    ctx.moveTo(mastX + 46, mastTopY + 12);
    ctx.lineTo(mastX + 46, mastTopY + 125);
    ctx.stroke();

    // Brazo diagonal rígido (riostra)
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(mastX, mastTopY + (mastPedTopY - mastTopY) * 0.36);
    ctx.lineTo(cx + 100, baseStructTopY - 22);
    ctx.stroke();

    // Cota izquierda: Altura Base =
    setFuenteRelleno(ctx, "#111827", "right", "middle");
    ctx.fillText("ALTURA", mastX - 38, mastPedTopY + pedH / 2 - 10);
    ctx.fillText(`BASE = ${alturaBase} m`, mastX - 38, mastPedTopY + pedH / 2 + 12);

    // Cota derecha: Altura Torre + base =
    const dimX = 560;
    dibujarFlechaVertical(ctx, dimX, mastTopY, baseStructTopY, true);
    setFuenteRelleno(ctx, "#111827", "left", "middle");
    const midT = (mastTopY + baseStructTopY) / 2;
    ctx.fillText("ALTURA", dimX + 12, midT - 22);
    ctx.fillText("TORRE +", dimX + 12, midT);
    ctx.fillText(`BASE = ${alturaTotal} m`, dimX + 12, midT + 22);
  }

  /* =========================================================
     MODELOS 5 y 6: Torre ventada (con edificio / de piso)
     ========================================================= */
  else if (tipoTorre === "ventada_edificio" || tipoTorre === "ventada_piso") {
    const isDePiso = tipoTorre === "ventada_piso";
    const mastW = 18;
    const mastTopY = topY;

    // Pedestal central
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - 22, groundY - pedH, 44, pedH);
    ctx.strokeRect(cx - 22, groundY - pedH, 44, pedH);

    // Mástil reticulado vertical uniforme
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - mastW / 2, mastTopY, mastW, towerBaseY - mastTopY);
    for (let y = mastTopY + 12; y < towerBaseY; y += 14) {
      ctx.beginPath();
      ctx.moveTo(cx - mastW / 2, y);
      ctx.lineTo(cx + mastW / 2, y + 14);
      ctx.stroke();
    }

    // Antenas superiores
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 48, mastTopY + 22, 96, 68);

    // Cámaras de anclaje y vientos (2 niveles de vientos)
    const ancSpan = isDePiso ? 260 : 195;
    const ancLeftX = cx - ancSpan;
    const ancRightX = cx + ancSpan;

    [ancLeftX, ancRightX].forEach((ax) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ax - 16, groundY - 16, 32, 16);
      ctx.strokeRect(ax - 16, groundY - 16, 32, 16);
    });

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.6;
    [0.24, 0.56].forEach((frac) => {
      const tieY = mastTopY + (towerBaseY - mastTopY) * frac;
      ctx.beginPath();
      ctx.moveTo(cx - mastW / 2, tieY);
      ctx.lineTo(ancLeftX, groundY - 16);
      ctx.moveTo(cx + mastW / 2, tieY);
      ctx.lineTo(ancRightX, groundY - 16);
      ctx.stroke();
    });

    if (isDePiso) {
      setFuenteRelleno(ctx, "#111827", "center", "top");
      ctx.fillText("CAMARA DE ANCLAJE", ancLeftX, groundY + 12);
      ctx.fillText("CAMARA DE ANCLAJE", ancRightX, groundY + 12);
    }

    // Etiqueta Altura base =
    setFuenteRelleno(ctx, "#111827", "left", "middle");
    ctx.fillText(`ALTURA BASE = ${alturaBase} m`, cx + 32, groundY - pedH / 2);

    // Cota derecha: ALTURA TORRE + BASE = / PEDESTAL =
    const dimX = isDePiso ? 740 : 660;
    dibujarFlechaVertical(ctx, dimX, mastTopY, groundY, true);
    const midT = (mastTopY + groundY) / 2;
    ctx.fillText("ALTURA", dimX + 12, midT - 22);
    ctx.fillText("TORRE +", dimX + 12, midT);
    ctx.fillText(`${isDePiso ? "PEDESTAL" : "BASE"} = ${alturaTotal} m`, dimX + 12, midT + 22);
  }

  ctx.restore();
}

function dibujarTodo() {
  dibujarSpat();
  dibujarPerimetro();
  dibujarTorreElevacion();
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-tab");
    if (targetId) activarTab(targetId, btn);
  });
});

const allInputs = [
  "sitio",
  "spatTipoTorre", "cantidadPozos", "val50", "val60", "val70",
  "perAncho", "perLargo", "perTipoTorre", "coordA", "coordB", "coordC", "coordD",
  "torreTipo", "alturaTorre", "alturaBase", "roldanaSup", "roldanaInf",
  "rol1Sup", "rol1Inf", "rol2Sup", "rol2Inf", "rol3Sup", "rol3Inf",
  "alturaEdificio", "alturaEscaleraGato"
];

allInputs.forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", dibujarTodo);
    el.addEventListener("change", dibujarTodo);
  }
});

document.getElementById("btnActualizarSpat").addEventListener("click", dibujarSpat);
document.getElementById("btnDescargarSpat").addEventListener("click", () => descargarCanvas("canvasSpat", "ESQUEMA_SPAT"));

document.getElementById("btnActualizarPer").addEventListener("click", dibujarPerimetro);
document.getElementById("btnDescargarPer").addEventListener("click", () => descargarCanvas("canvasPerimetro", "ESQUEMA_1_PERIMETRO"));

document.getElementById("btnActualizarTorre").addEventListener("click", dibujarTorreElevacion);
document.getElementById("btnDescargarTorre").addEventListener("click", () => descargarCanvas("canvasTorre", "ESQUEMA_2_TORRE"));

dibujarTodo();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    }).catch(() => {});
  });
}
