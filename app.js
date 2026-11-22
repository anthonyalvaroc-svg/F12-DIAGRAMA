const canvas = document.getElementById("esquemaCanvas");
const ctx = canvas.getContext("2d");

const inputs = ["sitio", "tipoTorre", "cantidadPozos", "val50", "val60", "val70"];
inputs.forEach(id => {
  document.getElementById(id).addEventListener("input", dibujarEsquema);
  document.getElementById(id).addEventListener("change", dibujarEsquema);
});

document.getElementById("btnActualizar").addEventListener("click", dibujarEsquema);

document.getElementById("btnDescargar").addEventListener("click", () => {
  const sitio = (document.getElementById("sitio").value || "SITIO")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_");
  const link = document.createElement("a");
  link.download = `ESQUEMA_SPAT_${sitio}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function formatOhm(val) {
  const num = parseFloat(val);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function dibujarPozo(x, y, label) {
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

function dibujarPuerta(x, y, ancho) {
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

function dibujarEsquema() {
  const sitio = (document.getElementById("sitio").value || "SITIO").trim().toUpperCase();
  const tipoTorre = document.getElementById("tipoTorre").value;
  const cantPozos = parseInt(document.getElementById("cantidadPozos").value, 10) || 3;
  const v50 = formatOhm(document.getElementById("val50").value);
  const v60 = formatOhm(document.getElementById("val60").value);
  const v70 = formatOhm(document.getElementById("val70").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Recuadro principal del Site / perímetro
  const boxX = 65;
  const boxY = 55;
  const boxW = 380;
  const boxH = 400;

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Nombre del Site dentro del cuadro del Site
  const centerX = boxX + boxW / 2;
  ctx.save();
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sitio, centerX, boxY + 36);
  ctx.restore();

  // Símbolo de la torre + texto "TORRE"
  const towerCenterY = boxY + boxH / 2 + 25;

  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3.5;

  if (tipoTorre === "auto_cuadrado") {
    const sqSize = 148;
    ctx.strokeRect(centerX - sqSize / 2, towerCenterY - sqSize / 2, sqSize, sqSize);
  } else if (tipoTorre === "auto_triangulo") {
    const r = 82;
    ctx.beginPath();
    ctx.moveTo(centerX, towerCenterY - r);
    ctx.lineTo(centerX - r * 0.9, towerCenterY + r * 0.72);
    ctx.lineTo(centerX + r * 0.9, towerCenterY + r * 0.72);
    ctx.closePath();
    ctx.stroke();
  } else if (tipoTorre === "monopolo") {
    ctx.beginPath();
    ctx.arc(centerX, towerCenterY, 64, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tipoTorre === "ventada") {
    const sqSmall = 86;
    ctx.strokeRect(centerX - sqSmall / 2, towerCenterY - sqSmall / 2, sqSmall, sqSmall);
  } else if (tipoTorre === "arriostrada") {
    ctx.beginPath();
    ctx.arc(centerX, towerCenterY, 40, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#111827";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TORRE", centerX, towerCenterY + (tipoTorre === "auto_triangulo" ? 14 : 0));
  ctx.restore();

  // Posiciones predefinidas de pozos (PT01..PT06)
  const posicionesPozos = [
    { x: boxX + 265, y: boxY + 325 }, // PT01
    { x: boxX + 275, y: boxY + 125 }, // PT02
    { x: boxX + 95,  y: boxY + 125 }, // PT03
    { x: boxX + 95,  y: boxY + 325 }, // PT04
    { x: boxX + 185, y: boxY + 95  }, // PT05
    { x: boxX + 145, y: boxY + 355 }  // PT06
  ];

  // Conexión entre pozos
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

  // Dibujar pozos
  for (let i = 0; i < cantPozos; i++) {
    const p = posicionesPozos[i];
    const code = `PT0${i + 1}`;
    dibujarPozo(p.x, p.y, code);
  }

  // Símbolo de puerta en el muro inferior donde sale el cable verde
  const pt01 = posicionesPozos[0];
  const doorWidth = 56;
  const doorX = pt01.x - 16;
  const doorY = boxY + boxH;
  dibujarPuerta(doorX, doorY, doorWidth);

  // Telurómetro
  const telX = 435;
  const telY = 545;
  const telW = 30;
  const telH = 78;

  // Cable verde desde PT01 pasando por la puerta hasta el telurómetro
  ctx.save();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pt01.x, pt01.y + 18);
  ctx.lineTo(pt01.x, doorY + 62);
  ctx.lineTo(telX + 10, telY + 18);
  ctx.stroke();
  ctx.restore();

  // Caja del telurómetro
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

  // 2 Líneas del telurómetro separadas: Línea roja MÁS LARGA que la línea azul
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

  // Etiquetas de medición
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

  // Etiqueta 30 MTS
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("30 MTS", endRedX, endRedY + 28);
  ctx.restore();
}

dibujarEsquema();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
