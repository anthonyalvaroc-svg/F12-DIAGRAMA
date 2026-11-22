# Generador Automático — Esquema de Medición SPAT (F12M)

Aplicación web ligera para generar en segundos la imagen PNG del **Esquema de Medición (Sección 5 - F12M)** para mantenimiento preventivo de sistemas de puesta a tierra.

## Características
- **Nombre del Site** integrado dentro del recuadro de la estación.
- **5 tipos de torre**:
  1. Cuadrado grande = Autosoportada
  2. Triángulo = Autosoportada
  3. Círculo = Monopolo
  4. Cuadrado pequeño = Ventada
  5. Círculo pequeño = Arriostrada
- **Cantidad de pozos configurable** (`PT01` hasta `PT06`).
- **Símbolo de puerta** en la salida del cable verde hacia el telurómetro.
- **Líneas de medición diferenciadas** (línea azul de potencial y línea roja de corriente más larga hasta `30 MTS`) con valores al `50% (15 m)`, `60% (18 m)` y `70% (21 m)`.
- **Funciona sin internet** una vez abierta la página (incluye Service Worker y Manifest para instalar en la pantalla de inicio del celular).

## Cómo publicarlo gratis en GitHub Pages
1. Crea un nuevo repositorio público en GitHub (por ejemplo, `generador-esquema-spat`).
2. Sube todos los archivos de esta carpeta a la raíz del repositorio (`index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `README.md`).
3. Ve a **Settings → Pages** en tu repositorio.
4. En **Build and deployment → Source**, selecciona **Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`, y haz clic en **Save**.
5. En 1 minuto GitHub te mostrará tu enlace público (`https://<tu-usuario>.github.io/generador-esquema-spat/`).
