// Pestañas
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-tab");
    tabButtons.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(targetId).classList.add("active");
    dibujarTodo();
  });
});

function getSitio() {
  const val = document.getElementById("sitio").value || "SITIO";
  return val.trim().toUpperCase();
}

function getSitioSlug() {
  return getSitio().replace(/[^A-Z0-9_-]+/g, "_") || "SITIO";
}

function formatNum(val, dec = 2) {
  const num = parseFloat(val);
  return isNaN(num) ? (0).toFixed(dec) : num.toFixed(dec);
}

function descargarCanvas(canvasId, prefijo) {
  const canvas = document.getElementById(canvasId);
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

  ctx.fillStyle = "#111827";
  ctx.font = `bold ${Math.max(11, Math.round(13 * sizeMultiplier))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
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

  ctx.fillStyle = "#111827";
  ctx.font = "bold 15px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y - 24);
  ctx.restore();
}

function dibujarPuerta(ctx, x, y, ancho) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 2, y - 6, ancho + 4, 12);

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 6);
  ctx.moveTo(x + ancho, y - 6);
  ctx.lineTo(x + ancho, y + 6);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + ancho);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(x, y, ancho, 0, Math.PI / 2, false);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* =========================================================
   PESTAÑA 0: DIAGRAMA SPAT (F12M)
   ========================================================= */
function dibujarSpat() {
  const canvas = document.getElementById("canvasSpat");
  const ctx = canvas.getContext("2d");

  const sitio = getSitio();
  const tipoTorre = document.getElementById("spatTipoTorre").value;
  const cantPozos = parseInt(document.getElementById("cantidadPozos").value, 10) || 3;
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
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sitio, centerX, boxY + 36);
  ctx.restore();

  dibujarSimboloTorre(ctx, tipoTorre, centerX, boxY + boxH / 2 + 25, 1);

  const posicionesPozos = [
    { x: boxX + 265, y: boxY + 325 },
    { x: boxX + 275, y: boxY + 125 },
    { x: boxX + 95,  y: boxY + 125 },
    { x: boxX + 95,  y: boxY + 325 },
    { x: boxX + 185, y: boxY + 95  },
    { x: boxX + 145, y: boxY + 355 }
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
  const doorWidth = 56;
  const doorX = pt01.x - 16;
  const doorY = boxY + boxH;
  dibujarPuerta(ctx, doorX, doorY, doorWidth);

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

  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
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

  lecturas.forEach(item => {
    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = "#111827";
    ctx.font = "bold 17px Arial";
    ctx.fillText(item.pct, item.x, item.y);

    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 28px Arial";
    ctx.fillText(item.ohm, item.x + 12, item.y + 32);
    ctx.restore();
  });

  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("30 MTS", endRedX, endRedY + 28);
  ctx.restore();
}

/* =========================================================
   PESTAÑA 1: DIAGRAMA 1 - PERÍMETRO Y COORDENADAS
   ========================================================= */
function dibujarEtiquetaEsquina(ctx, x, y, titulo, coordTexto, alignX = "center", alignY = "middle") {
  ctx.save();
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;

  const w = 185;
  const h = 58;
  let boxX = x - w / 2;
  let boxY = y - h / 2;

  if (alignX === "left") boxX = x;
  if (alignX === "right") boxX = x - w;
  if (alignY === "top") boxY = y;
  if (alignY === "bottom") boxY = y - h;

  ctx.fillRect(boxX, boxY, w, h);
  ctx.strokeRect(boxX, boxY, w, h);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "left";
  ctx.fillText(titulo, boxX + 8, boxY + 18);

  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 12px Arial";
  ctx.fillText(coordTexto || "-", boxX + 8, boxY + 39);
  ctx.restore();
}

function dibujarPerimetro() {
  const canvas = document.getElementById("canvasPerimetro");
  const ctx = canvas.getContext("2d");

  const sitio = getSitio();
  const ancho = formatNum(document.getElementById("perAncho").value, 2);
  const largo = formatNum(document.getElementById("perLargo").value, 2);
  const tipoTorre = document.getElementById("perTipoTorre").value;
  const coordA = document.getElementById("coordA").value.trim();
  const coordB = document.getElementById("coordB").value.trim();
  const coordC = document.getElementById("coordC").value.trim();
  const coordD = document.getElementById("coordD").value.trim();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título superior
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`PERÍMETRO Y COORDENADAS — ${sitio}`, canvas.width / 2, 34);
  ctx.restore();

  // Rectángulo del perímetro
  const rectX = 250;
  const rectY = 175;
  const rectW = 460;
  const rectH = 540;

  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4.5;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  // Puerta de acceso superior izquierda
  const doorX = rectX + 24;
  const doorY = rectY;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(doorX, doorY - 4, 64, 8);
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY);
  ctx.lineTo(doorX, doorY - 45);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PUERTA DE ACCESO", doorX + 32, doorY - 64);
  ctx.fillText("AL SITE", doorX + 32, doorY - 50);
  ctx.restore();

  // Nombre del Site dentro del recuadro
  ctx.save();
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText(sitio, rectX + rectW / 2, rectY + 42);
  ctx.restore();

  // Símbolo de torre al centro
  dibujarSimboloTorre(ctx, tipoTorre, rectX + rectW / 2, rectY + rectH / 2 + 10, 0.95);

  // Cotas de Ancho (arriba y abajo) y Largo (izquierda y derecha)
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`MTS ${ancho}`, rectX + rectW / 2, rectY - 22);
  ctx.fillText(`MTS ${ancho}`, rectX + rectW / 2, rectY + rectH + 28);

  ctx.save();
  ctx.translate(rectX - 26, rectY + rectH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`MTS ${largo}`, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(rectX + rectW + 26, rectY + rectH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(`MTS ${largo}`, 0, 0);
  ctx.restore();
  ctx.restore();

  // Coordenadas en las 4 esquinas: A (sup. izq), B (sup. der), C (inf. der), D (inf. izq)
  dibujarEtiquetaEsquina(ctx, rectX - 205, rectY - 65, "COORDENADA A:", coordA, "left", "top");
  dibujarEtiquetaEsquina(ctx, rectX + rectW + 20, rectY - 65, "COORDENADA B:", coordB, "left", "top");
  dibujarEtiquetaEsquina(ctx, rectX + rectW + 20, rectY + rectH + 8, "COORDENADA C:", coordC, "left", "top");
  dibujarEtiquetaEsquina(ctx, rectX - 205, rectY + rectH + 8, "COORDENADA D:", coordD, "left", "top");
}

/* =========================================================
   PESTAÑA 2: DIAGRAMA 2 - ELEVACIÓN DE TORRE
   ========================================================= */
function dibujarTorreElevacion() {
  const canvas = document.getElementById("canvasTorre");
  const ctx = canvas.getContext("2d");

  const sitio = getSitio();
  const tipoTorre = document.getElementById("torreTipo").value;
  const alturaTotal = formatNum(document.getElementById("alturaTorre").value, 2);
  const alturaBase = formatNum(document.getElementById("alturaBase").value, 2);
  const roldanaSup = formatNum(document.getElementById("roldanaSup").value, 2);
  const roldanaInf = formatNum(document.getElementById("roldanaInf").value, 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título superior
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`ELEVACIÓN DE TORRE — ${sitio} (${tipoTorre.toUpperCase()})`, canvas.width / 2, 34);
  ctx.restore();

  const groundY = 930;
  const topY = 140;
  const cx = 410;
  const baseHalfW = 115;
  const topHalfW = 24;

  // Línea de suelo
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(140, groundY);
  ctx.lineTo(760, groundY);
  ctx.stroke();

  // Pedestales / base
  const pedH = 42;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(cx - baseHalfW - 10, groundY - pedH, 22, pedH);
  ctx.strokeRect(cx - baseHalfW - 10, groundY - pedH, 22, pedH);
  ctx.fillRect(cx + baseHalfW - 12, groundY - pedH, 22, pedH);
  ctx.strokeRect(cx + baseHalfW - 12, groundY - pedH, 22, pedH);

  const towerBaseY = groundY - pedH;

  // Dibujo según tipo de torre
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;

  if (tipoTorre === "monopolo") {
    ctx.beginPath();
    ctx.moveTo(cx - topHalfW, topY);
    ctx.lineTo(cx - baseHalfW * 0.45, towerBaseY);
    ctx.moveTo(cx + topHalfW, topY);
    ctx.lineTo(cx + baseHalfW * 0.45, towerBaseY);
    ctx.stroke();
  } else {
    // Celosía / Autosoportada / Ventada / Arriostrada
    ctx.beginPath();
    ctx.moveTo(cx - topHalfW, topY);
    ctx.lineTo(cx - baseHalfW, towerBaseY);
    ctx.moveTo(cx + topHalfW, topY);
    ctx.lineTo(cx + baseHalfW, towerBaseY);
    ctx.stroke();

    const niveles = 12;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < niveles; i++) {
      const t1 = i / niveles;
      const t2 = (i + 1) / niveles;
      const y1 = topY + (towerBaseY - topY) * t1;
      const y2 = topY + (towerBaseY - topY) * t2;
      const hw1 = topHalfW + (baseHalfW - topHalfW) * t1;
      const hw2 = topHalfW + (baseHalfW - topHalfW) * t2;

      ctx.beginPath();
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw1, y1);
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw2, y2);
      ctx.moveTo(cx + hw1, y1);
      ctx.lineTo(cx - hw2, y2);
      ctx.stroke();
    }

    // Tirantes si es arriostrada
    if (tipoTorre === "arriostrada") {
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 55, topY + 180);
      ctx.lineTo(cx - 240, groundY);
      ctx.moveTo(cx + 55, topY + 180);
      ctx.lineTo(cx + 240, groundY);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Pararrayos superior y plataforma/antenas
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, topY - 65);
  ctx.strokeRect(cx - 75, topY + 55, 150, 12);
  ctx.stroke();

  // Cota ROLDANA SUPERIOR (izquierda)
  const supY = topY + 25;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(190, supY);
  ctx.lineTo(cx - topHalfW, supY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ROLDANA", 185, supY - 22);
  ctx.fillText("SUPERIOR", 185, supY - 6);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`${roldanaSup} m`, 185, supY + 16);

  // Cota ROLDANA INFERIOR (derecha)
  const infY = topY + 115;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(cx + topHalfW + 10, infY);
  ctx.lineTo(565, infY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ROLDANA", 575, infY - 22);
  ctx.fillText("INFERIOR", 575, infY - 6);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`${roldanaInf} m`, 575, infY + 16);

  // Cota ALTURA DE TORRE + BASE (extrema derecha)
  const dimX = 720;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 30, topY);
  ctx.lineTo(dimX, topY);
  ctx.moveTo(cx + baseHalfW + 15, groundY);
  ctx.lineTo(dimX, groundY);
  ctx.moveTo(dimX - 10, topY);
  ctx.lineTo(dimX - 10, groundY);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ALTURA DE", dimX + 6, (topY + groundY) / 2 - 22);
  ctx.fillText("TORRE+BASE", dimX + 6, (topY + groundY) / 2 - 4);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 17px Arial";
  ctx.fillText(`${alturaTotal} m`, dimX + 6, (topY + groundY) / 2 + 18);

  // Cota ALTURA BASE (abajo izquierda)
  ctx.fillStyle = "#111827";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`BASE: ${alturaBase} m`, cx, groundY + 26);

  ctx.restore();
}

function dibujarTodo() {
  dibujarSpat();
  dibujarPerimetro();
  dibujarTorreElevacion();
}

// Eventos de cambios y botones
const allInputs = [
  "sitio",
  "spatTipoTorre", "cantidadPozos", "val50", "val60", "val70",
  "perAncho", "perLargo", "perTipoTorre", "coordA", "coordB", "coordC", "coordD",
  "torreTipo", "alturaTorre", "alturaBase", "roldanaSup", "roldanaInf"
];

allInputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", dibujarTodo);
    el.addEventListener("change", dibujarTodo);
  }
});

document.getElementById("btnActualizarSpat").addEventListener("click", dibujarSpat);
document.getElementById("btnDescargarSpat").addEventListener("click", () => descargarCanvas("canvasSpat", "ESQUEMA_SPAT"));

document.getElementById("btnActualizarPer").addEventListener("click", dibujarPerimetro);
document.getElementById("btnDescargarPer").addEventListener("click", () => descargarCanvas("canvasPerimetro", "DIAGRAMA_1_PERIMETRO"));

document.getElementById("btnActualizarTorre").addEventListener("click", dibujarTorreElevacion);
document.getElementById("btnDescargarTorre").addEventListener("click", () => descargarCanvas("canvasTorre", "DIAGRAMA_2_TORRE"));

dibujarTodo();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
