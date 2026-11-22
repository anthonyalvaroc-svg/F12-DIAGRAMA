function activarTab(targetId, btnEl) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabButtons.forEach(b => b.classList.remove("active"));
  tabPanels.forEach(p => p.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  const panel = document.getElementById(targetId);
  if (panel) panel.classList.add("active");
  dibujarTodo();
}

window.activarTab = activarTab;

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

/* Puerta doble hoja en muro horizontal (abre hacia afuera si dirY > 0 o hacia arriba si dirY < 0) */
function dibujarPuertaDobleHorizontal(ctx, x, y, anchoTotal, dirY = 1) {
  const half = anchoTotal / 2;
  ctx.save();

  // Borrar tramo del muro
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 2, y - 6, anchoTotal + 4, 12);

  // Jambas / marcos laterales
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 6);
  ctx.moveTo(x + anchoTotal, y - 6);
  ctx.lineTo(x + anchoTotal, y + 6);
  ctx.stroke();

  // Hoja izquierda
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + dirY * half);
  ctx.stroke();

  // Hoja derecha
  ctx.beginPath();
  ctx.moveTo(x + anchoTotal, y);
  ctx.lineTo(x + anchoTotal, y + dirY * half);
  ctx.stroke();

  // Arcos de barrido punteados
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

  // Puerta doble hoja en muro inferior donde sale el cable verde
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
   PESTAÑA 2: DIAGRAMA 1 - PERÍMETRO RECTANGULAR Y COORDENADAS INTERIORES
   ========================================================= */
function dibujarCoordInterior(ctx, x, y, titulo, coordTexto, alignX = "left", alignY = "top") {
  ctx.save();
  const w = 215;
  const h = 52;
  let boxX = x;
  let boxY = y;

  if (alignX === "right") boxX = x - w;
  if (alignY === "bottom") boxY = y - h;

  ctx.fillStyle = "rgba(248, 250, 252, 0.94)";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  ctx.fillRect(boxX, boxY, w, h);
  ctx.strokeRect(boxX, boxY, w, h);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "left";
  ctx.fillText(titulo, boxX + 8, boxY + 17);

  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 12px Arial";
  ctx.fillText(coordTexto || "-", boxX + 8, boxY + 37);
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

  // Rectángulo proporcional según Ancho y Largo
  const numAncho = Math.max(1, parseFloat(document.getElementById("perAncho").value) || 8.1);
  const numLargo = Math.max(1, parseFloat(document.getElementById("perLargo").value) || 10.0);
  const ratio = numAncho / numLargo;

  const maxW = 640;
  const maxH = 560;
  let rectW = maxW;
  let rectH = maxH;

  if (ratio >= 1) {
    rectW = maxW;
    rectH = Math.max(260, Math.min(maxH, maxW / ratio));
  } else {
    rectH = maxH;
    rectW = Math.max(280, Math.min(maxW, maxH * ratio));
  }

  const rectX = (canvas.width - rectW) / 2;
  const rectY = 120;

  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4.5;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  // Puerta doble hoja de acceso en el borde superior del rectángulo
  const doorW = 76;
  const doorX = rectX + 28;
  const doorY = rectY;
  dibujarPuertaDobleHorizontal(ctx, doorX, doorY, doorW, -1);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PUERTA DE ACCESO AL SITE", doorX + doorW / 2, doorY - 52);
  ctx.restore();

  // Nombre del Site dentro del recuadro
  ctx.save();
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 25px Arial";
  ctx.textAlign = "center";
  ctx.fillText(sitio, rectX + rectW / 2, rectY + rectH / 2 - 95);
  ctx.restore();

  // Símbolo de torre al centro
  dibujarSimboloTorre(ctx, tipoTorre, rectX + rectW / 2, rectY + rectH / 2 + 12, 0.92);

  // Cotas exteriores de Ancho y Largo
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`ANCHO: MTS ${ancho}`, rectX + rectW / 2, rectY + rectH + 34);

  ctx.save();
  ctx.translate(rectX - 28, rectY + rectH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`LARGO: MTS ${largo}`, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(rectX + rectW + 28, rectY + rectH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(`LARGO: MTS ${largo}`, 0, 0);
  ctx.restore();
  ctx.restore();

  // Coordenadas en las 4 esquinas INTERIORES del rectángulo (A, B, C, D)
  const pad = 12;
  dibujarCoordInterior(ctx, rectX + pad, rectY + pad, "COORDENADA A (INT.):", coordA, "left", "top");
  dibujarCoordInterior(ctx, rectX + rectW - pad, rectY + pad, "COORDENADA B (INT.):", coordB, "right", "top");
  dibujarCoordInterior(ctx, rectX + rectW - pad, rectY + rectH - pad, "COORDENADA C (INT.):", coordC, "right", "bottom");
  dibujarCoordInterior(ctx, rectX + pad, rectY + rectH - pad, "COORDENADA D (INT.):", coordD, "left", "bottom");
}

/* =========================================================
   PESTAÑA 3: DIAGRAMA 2 - ELEVACIÓN DE TORRE
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

  // Eje central de la roldana
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#dc2626";
  ctx.fill();

  // Etiqueta RF
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RF", x, y - radio - 12);
  ctx.restore();
}

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

  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`ELEVACIÓN DE TORRE — ${sitio} (${tipoTorre.toUpperCase()})`, canvas.width / 2, 34);
  ctx.restore();

  const groundY = 950;
  const topY = 155;
  const cx = 420;
  const pedH = 42;
  const towerBaseY = groundY - pedH;

  ctx.save();
  // Línea de suelo
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(90, groundY);
  ctx.lineTo(780, groundY);
  ctx.stroke();

  if (tipoTorre === "arriostrada") {
    // Dibujar 2 torres arriostradas cada una con su pedestal
    const centers = [cx - 135, cx + 135];
    centers.forEach((tcx, idx) => {
      const bHalfW = 48;
      const tHalfW = 12;

      // Pedestal de cada torre arriostrada
      ctx.fillStyle = "#cbd5e1";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.fillRect(tcx - bHalfW - 6, groundY - pedH, bHalfW * 2 + 12, pedH);
      ctx.strokeRect(tcx - bHalfW - 6, groundY - pedH, bHalfW * 2 + 12, pedH);

      // Fuste
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tcx - tHalfW, topY + 60);
      ctx.lineTo(tcx - bHalfW, towerBaseY);
      ctx.moveTo(tcx + tHalfW, topY + 60);
      ctx.lineTo(tcx + bHalfW, towerBaseY);
      ctx.stroke();

      // Celosía
      const niveles = 10;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < niveles; i++) {
        const y1 = topY + 60 + (towerBaseY - (topY + 60)) * (i / niveles);
        const y2 = topY + 60 + (towerBaseY - (topY + 60)) * ((i + 1) / niveles);
        const hw1 = tHalfW + (bHalfW - tHalfW) * (i / niveles);
        const hw2 = tHalfW + (bHalfW - tHalfW) * ((i + 1) / niveles);
        ctx.beginPath();
        ctx.moveTo(tcx - hw1, y1);
        ctx.lineTo(tcx + hw1, y1);
        ctx.moveTo(tcx - hw1, y1);
        ctx.lineTo(tcx + hw2, y2);
        ctx.moveTo(tcx + hw1, y1);
        ctx.lineTo(tcx - hw2, y2);
        ctx.stroke();
      }

      // Vientos / cables de arriostramiento hacia el suelo
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(tcx - tHalfW, topY + 150);
      ctx.lineTo(tcx - 110, groundY);
      ctx.moveTo(tcx + tHalfW, topY + 150);
      ctx.lineTo(tcx + 110, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`ARRIOSTRADA ${idx + 1}`, tcx, groundY + 22);
    });
  } else if (tipoTorre === "ventada") {
    // Torre ventada con vientos y cámara de anclaje
    const bHalfW = 75;
    const tHalfW = 18;

    // Pedestal
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx - bHalfW - 8, groundY - pedH, bHalfW * 2 + 16, pedH);
    ctx.strokeRect(cx - bHalfW - 8, groundY - pedH, bHalfW * 2 + 16, pedH);

    // Fuste ventada
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - tHalfW, topY + 25);
    ctx.lineTo(cx - bHalfW, towerBaseY);
    ctx.moveTo(cx + tHalfW, topY + 25);
    ctx.lineTo(cx + bHalfW, towerBaseY);
    ctx.stroke();

    const niveles = 11;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < niveles; i++) {
      const y1 = topY + 25 + (towerBaseY - (topY + 25)) * (i / niveles);
      const y2 = topY + 25 + (towerBaseY - (topY + 25)) * ((i + 1) / niveles);
      const hw1 = tHalfW + (bHalfW - tHalfW) * (i / niveles);
      const hw2 = tHalfW + (bHalfW - tHalfW) * ((i + 1) / niveles);
      ctx.beginPath();
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw1, y1);
      ctx.moveTo(cx - hw1, y1);
      ctx.lineTo(cx + hw2, y2);
      ctx.moveTo(cx + hw1, y1);
      ctx.lineTo(cx - hw2, y2);
      ctx.stroke();
    }

    // Vientos tensorizados a ambos lados
    const ancLeftX = cx - 205;
    const ancRightX = cx + 205;
    const ancY = groundY;

    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - tHalfW, topY + 95);
    ctx.lineTo(ancLeftX, ancY - 14);
    ctx.moveTo(cx - 38, topY + 360);
    ctx.lineTo(ancLeftX, ancY - 14);
    ctx.moveTo(cx + tHalfW, topY + 95);
    ctx.lineTo(ancRightX, ancY - 14);
    ctx.moveTo(cx + 38, topY + 360);
    ctx.lineTo(ancRightX, ancY - 14);
    ctx.stroke();

    // Cámaras de anclaje izquierda y derecha
    [ancLeftX, ancRightX].forEach((ax, idx) => {
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.fillRect(ax - 24, ancY - 22, 48, 22);
      ctx.strokeRect(ax - 24, ancY - 22, 48, 22);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CÁMARA DE", ax, ancY + 16);
      ctx.fillText(`ANCLAJE ${idx + 1}`, ax, ancY + 30);
    });
  } else {
    // Autosoportada o Monopolo
    const baseHalfW = 115;
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

    if (tipoTorre === "monopolo") {
      ctx.beginPath();
      ctx.moveTo(cx - topHalfW, topY);
      ctx.lineTo(cx - baseHalfW * 0.45, towerBaseY);
      ctx.moveTo(cx + topHalfW, topY);
      ctx.lineTo(cx + baseHalfW * 0.45, towerBaseY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - topHalfW, topY);
      ctx.lineTo(cx - baseHalfW, towerBaseY);
      ctx.moveTo(cx + topHalfW, topY);
      ctx.lineTo(cx + baseHalfW, towerBaseY);
      ctx.stroke();

      const niveles = 12;
      ctx.lineWidth = 1.6;
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
    }

    // Pararrayos superior y plataforma
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, topY - 65);
    ctx.strokeRect(cx - 75, topY + 55, 150, 12);
    ctx.stroke();

    // Roldana grande con etiqueta RF para Autosoportada y Monopolo
    dibujarRoldanaRF(ctx, cx, topY + 25, 22);
  }

  // Cota ROLDANA SUPERIOR (izquierda)
  const supY = topY + 25;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(150, supY);
  ctx.lineTo(cx - 24, supY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ROLDANA", 145, supY - 22);
  ctx.fillText("SUPERIOR", 145, supY - 6);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`${roldanaSup} m`, 145, supY + 16);

  // Cota ROLDANA INFERIOR (derecha)
  const infY = topY + 115;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(cx + 28, infY);
  ctx.lineTo(570, infY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ROLDANA", 580, infY - 22);
  ctx.fillText("INFERIOR", 580, infY - 6);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`${roldanaInf} m`, 580, infY + 16);

  // Cota ALTURA DE TORRE + BASE (extrema derecha)
  const dimX = 740;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 30, topY);
  ctx.lineTo(dimX, topY);
  ctx.moveTo(cx + 125, groundY);
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

  // Cota ALTURA BASE
  ctx.fillStyle = "#111827";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`BASE / PEDESTAL: ${alturaBase} m`, cx, groundY + 46);

  ctx.restore();
}

function dibujarTodo() {
  dibujarSpat();
  dibujarPerimetro();
  dibujarTorreElevacion();
}

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
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    }).catch(() => {});
  });
}
