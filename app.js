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
   ========================================================= */
function dibujarCoordInclinada(ctx, x, y, titulo, coordTexto, angleRad, w = 220, h = 64) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  setFuenteRelleno(ctx, "#111827", "center", "middle");
  ctx.fillText(titulo, 0, -12);

  setFuenteRelleno(ctx, "#111827", "center", "middle");
  ctx.fillText(coordTexto || "-", 0, 12);
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
  const maxW = 660;
  const maxH = 540;
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
  const rectY = 140;

  const doorW = 84;
  const doorX = rectX + 24;
  const doorY = rectY;
  dibujarPuertaDobleHorizontal(ctx, doorX, doorY, doorW, -1);

  ctx.save();
  const calloutX = rectX - 30;
  const calloutY = rectY - 82;
  const calloutW = 180;
  const calloutH = 44;
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

  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.strokeRect(rectX, rectY, rectW, rectH);
  ctx.restore();

  const centerRectX = rectX + rectW / 2;
  const centerRectY = rectY + rectH / 2;

  ctx.save();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.2;
  ctx.fillStyle = "#ffffff";

  [rectY - 34, rectY + rectH + 12].forEach((by) => {
    ctx.fillRect(centerRectX - 72, by, 144, 26);
    ctx.strokeRect(centerRectX - 72, by, 144, 26);
    setFuenteRelleno(ctx, "#111827", "center", "middle");
    ctx.fillText(`MTS ${ancho}`, centerRectX, by + 13);
  });

  [rectX - 38, rectX + rectW + 12].forEach((bx) => {
    ctx.fillRect(bx, centerRectY - 72, 26, 144);
    ctx.strokeRect(bx, centerRectY - 72, 26, 144);
    ctx.save();
    ctx.translate(bx + 13, centerRectY);
    ctx.rotate(-Math.PI / 2);
    setFuenteRelleno(ctx, "#111827", "center", "middle");
    ctx.fillText(`MTS ${largo}`, 0, 0);
    ctx.restore();
  });
  ctx.restore();

  const sizeMult = Math.max(0.55, Math.min(0.85, Math.min(rectW, rectH) / 480));
  ctx.save();
  setFuenteRelleno(ctx, "#dc2626", "center", "middle");
  ctx.fillText(sitio, centerRectX, centerRectY - 82 * sizeMult);
  ctx.restore();

  dibujarSimboloTorre(ctx, tipoTorre, centerRectX, centerRectY + 12 * sizeMult, sizeMult);

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
   PESTAÑA 3: ESQUEMA 2 - ELEVACIÓN DE TORRE (8 TIPOS)
   ========================================================= */
function dibujarRoldanaRF(ctx, x, y, radio = 18) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#dc2626";
  ctx.fill();

  setFuenteRelleno(ctx, "#dc2626", "center", "bottom");
  ctx.fillText("RF", x, y - radio - 4);
  ctx.restore();
}

function dibujarTorreElevacion() {
  const canvas = document.getElementById("canvasTorre");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const tipoTorre = document.getElementById("torreTipo").value;

  const rawAlturaTotal = parseFloat(document.getElementById("alturaTorre").value);
  const rawAlturaBase = parseFloat(document.getElementById("alturaBase").value);
  const rawRoldanaSup = parseFloat(document.getElementById("roldanaSup").value);
  const rawRoldanaInf = parseFloat(document.getElementById("roldanaInf").value);
  const rawAlturaEdificio = parseFloat(document.getElementById("alturaEdificio").value);
  const rawAlturaEscalera = parseFloat(document.getElementById("alturaEscaleraGato").value);

  const numAlturaTotal = rawAlturaTotal > 0 ? rawAlturaTotal : 60.2;
  const numAlturaBase = rawAlturaBase >= 0 ? rawAlturaBase : 0;
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
  if (numRoldanaInf > numRoldanaSup) {
    avisos.push("La cota de roldana inferior es mayor que la roldana superior.");
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
  const groundY = tieneEdificio ? 760 : 980;
  const buildingBottomY = 1060;

  const maxDrawH = tieneEdificio ? 540 : 760;
  const minDrawH = 260;
  const drawH = Math.max(minDrawH, Math.min(maxDrawH, (numAlturaTotal / 60) * 680));
  const topY = groundY - drawH;
  const cx = 420;

  const pxPorMetro = drawH / Math.max(1, numAlturaTotal);
  const pedH = Math.max(14, Math.min(drawH * 0.4, numAlturaBase * pxPorMetro));
  const towerBaseY = groundY - pedH;

  const supY = Math.max(topY + 12, Math.min(groundY - 12, groundY - numRoldanaSup * pxPorMetro));
  const infY = Math.max(topY + 24, Math.min(groundY - 8, groundY - numRoldanaInf * pxPorMetro));

  ctx.save();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(90, groundY);
  ctx.lineTo(780, groundY);
  ctx.stroke();

  if (tieneEdificio) {
    const bldX = 180;
    const bldW = 480;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.fillRect(bldX, groundY, bldW, buildingBottomY - groundY);
    ctx.strokeRect(bldX, groundY, bldW, buildingBottomY - groundY);

    ctx.beginPath();
    ctx.moveTo(90, buildingBottomY);
    ctx.lineTo(780, buildingBottomY);
    ctx.stroke();

    const bldDimX = 720;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bldDimX, groundY);
    ctx.lineTo(bldDimX, buildingBottomY);
    ctx.stroke();

    setFuenteRelleno(ctx, "#111827", "left", "middle");
    ctx.fillText("ALTURA EDIFICIO", bldDimX + 12, (groundY + buildingBottomY) / 2 - 12);
    ctx.fillText(`SIN PARAPETO = ${alturaEdificio} m`, bldDimX + 12, (groundY + buildingBottomY) / 2 + 12);
  }

  if (tipoTorre === "arbol") {
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - 58, groundY - pedH, 116, pedH);
    ctx.strokeRect(cx - 58, groundY - pedH, 116, pedH);

    ctx.fillStyle = "#854d0e";
    ctx.beginPath();
    ctx.moveTo(cx - 18, towerBaseY);
    ctx.lineTo(cx - 10, topY + drawH * 0.28);
    ctx.lineTo(cx + 10, topY + drawH * 0.28);
    ctx.lineTo(cx + 18, towerBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.ellipse(cx, topY + drawH * 0.24, 68, drawH * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (tipoTorre === "monopolo") {
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - 48, groundY - pedH, 96, pedH);
    ctx.strokeRect(cx - 48, groundY - pedH, 96, pedH);

    ctx.beginPath();
    ctx.moveTo(cx - 18, topY);
    ctx.lineTo(cx - 38, towerBaseY);
    ctx.moveTo(cx + 18, topY);
    ctx.lineTo(cx + 38, towerBaseY);
    ctx.stroke();

    dibujarRoldanaRF(ctx, cx, supY, 18);
  } else if (tipoTorre === "autosoportada_normal" || tipoTorre === "autosoportada_encima") {
    const baseHalfW = 110;
    const topHalfW = 24;

    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - baseHalfW - 10, groundY - pedH, 22, pedH);
    ctx.strokeRect(cx - baseHalfW - 10, groundY - pedH, 22, pedH);
    ctx.fillRect(cx + baseHalfW - 12, groundY - pedH, 22, pedH);
    ctx.strokeRect(cx + baseHalfW - 12, groundY - pedH, 22, pedH);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - topHalfW, topY);
    ctx.lineTo(cx - baseHalfW, towerBaseY);
    ctx.moveTo(cx + topHalfW, topY);
    ctx.lineTo(cx + baseHalfW, towerBaseY);
    ctx.stroke();

    const niveles = 12;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < niveles; i++) {
      const y1 = topY + (towerBaseY - topY) * (i / niveles);
      const y2 = topY + (towerBaseY - topY) * ((i + 1) / niveles);
      const hw1 = topHalfW + (baseHalfW - topHalfW) * (i / niveles);
      const hw2 = topHalfW + (baseHalfW - topHalfW) * ((i + 1) / niveles);
      ctx.beginPath();
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw1, y1);
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw2, y2);
      ctx.moveTo(cx + hw1, y1);
      ctx.lineTo(cx - hw2, y2);
      ctx.stroke();
    }

    const roldanaPosY = tipoTorre === "autosoportada_encima" ? Math.max(40, topY - 26) : supY;
    dibujarRoldanaRF(ctx, cx, roldanaPosY, 18);
  } else if (tipoTorre === "arriostrada_escalera_gato" || tipoTorre === "arriostrada_edificio_normal") {
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - 32, groundY - pedH, 64, pedH);
    ctx.strokeRect(cx - 32, groundY - pedH, 64, pedH);

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, towerBaseY);
    ctx.stroke();

    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, topY + (towerBaseY - topY) * 0.35);
    ctx.lineTo(cx + 125, towerBaseY);
    ctx.stroke();

    if (tipoTorre === "arriostrada_escalera_gato") {
      const egH = Math.max(24, Math.min(120, numAlturaEscalera * pxPorMetro * 3));
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 26, towerBaseY - egH, 16, egH);
      setFuenteRelleno(ctx, "#111827", "left", "middle");
      ctx.fillText(`ALTURA ESCALERA GATO = ${alturaEscalera} m`, cx + 140, towerBaseY - egH / 2);
    }
  } else if (tipoTorre === "ventada_edificio" || tipoTorre === "ventada_piso") {
    const bHalfW = 48;
    const tHalfW = 14;

    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - bHalfW - 6, groundY - pedH, bHalfW * 2 + 12, pedH);
    ctx.strokeRect(cx - bHalfW - 6, groundY - pedH, bHalfW * 2 + 12, pedH);

    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(cx - tHalfW, topY);
    ctx.lineTo(cx - bHalfW, towerBaseY);
    ctx.moveTo(cx + tHalfW, topY);
    ctx.lineTo(cx + bHalfW, towerBaseY);
    ctx.stroke();

    const spanX = tipoTorre === "ventada_piso" ? 210 : 155;
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - tHalfW, topY + (towerBaseY - topY) * 0.25);
    ctx.lineTo(cx - spanX, groundY);
    ctx.moveTo(cx + tHalfW, topY + (towerBaseY - topY) * 0.25);
    ctx.lineTo(cx + spanX, groundY);
    ctx.stroke();

    if (tipoTorre === "ventada_piso") {
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#111827";
      ctx.fillRect(cx - spanX - 18, groundY - 16, 36, 16);
      ctx.strokeRect(cx - spanX - 18, groundY - 16, 36, 16);
      ctx.fillRect(cx + spanX - 18, groundY - 16, 36, 16);
      ctx.strokeRect(cx + spanX - 18, groundY - 16, 36, 16);
    }
  }

  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(140, supY);
  ctx.lineTo(cx - 24, supY);
  ctx.moveTo(cx + 28, infY);
  ctx.lineTo(560, infY);
  ctx.stroke();
  ctx.setLineDash([]);

  setFuenteRelleno(ctx, "#111827", "left", "middle");
  ctx.fillText(`ALTURA ROLDANA SUPERIOR = ${roldanaSup} m`, 110, supY - 18);
  ctx.fillText(`ALTURA ROLDANA INFERIOR = ${roldanaInf} m`, 565, infY - 18);

  const dimX = 720;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 25, topY);
  ctx.lineTo(dimX, topY);
  ctx.moveTo(cx + 120, groundY);
  ctx.lineTo(dimX, groundY);
  ctx.moveTo(dimX - 10, topY);
  ctx.lineTo(dimX - 10, groundY);
  ctx.stroke();

  const midDimY = (topY + groundY) / 2;
  setFuenteRelleno(ctx, "#111827", "left", "middle");
  ctx.fillText("ALTURA TORRE + BASE =", dimX + 8, midDimY - 12);
  ctx.fillText(`${alturaTotal} m`, dimX + 8, midDimY + 12);

  setFuenteRelleno(ctx, "#111827", "center", "top");
  ctx.fillText(`ALTURA BASE = ${alturaBase} m`, cx, groundY + 12);

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
