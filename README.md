# VideoGuru Editor

Editor de vídeo multipista para Linux: **Tauri 2 + Rust** (backend) y **Svelte 5 + Vite + TypeScript** (frontend).
Interfaz oscura inspirada en VideoGuru: biblioteca de medios, previsualizador con líneas de seguridad y línea de tiempo multipista con barra flotante.

## Requisitos del sistema

Esta máquina **no tiene** Node, Rust ni FFmpeg instalados. En Debian 13:

```bash
# Node 20 + npm
sudo apt install -y nodejs npm

# FFmpeg (obligatorio para probe, miniaturas y render)
sudo apt install -y ffmpeg

# Dependencias de compilación de Tauri 2 (WebKitGTK 4.1)
sudo apt install -y build-essential curl wget file libssl-dev \
  libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev \
  libgtk-3-dev pkg-config

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Puesta en marcha

```bash
npm install          # instala dependencias del frontend
npm run dev          # sólo UI en http://localhost:1420 (sin backend)
npm run app          # aplicación de escritorio completa (Tauri)
npm run app:build    # empaquetado .deb / AppImage
```

## Arquitectura

Regla del proyecto: **ningún archivo supera las 200 líneas** y cada acción vive en su propia función.

### Frontend (`src/lib/editor/`)

- `types.ts` — modelos `Clip`, `Track`, `MediaAsset`, `ProjectFile`.
- `state.ts` — stores de Svelte (timeline, selección, playhead, zoom, guías).
- `timeline.ts` — zoom/escala (`timeToPx`, `pxToTime`, `zoomBy`, `rulerStep`), inserción, movimiento, resize, reordenación y ripple.
- `player.ts` — `handlePlayPause()`, `seekTo(t)`, `updatePlayheadPosition(delta)`, `frameStep()`.
- `actions.ts` — `handleCut()`, `handleCopy()`, `handlePaste()`, `handleDelete()`, `handleDuplicate()`.
- `history.ts` — patrón Command: `commit()`, `handleUndo()`, `handleRedo()`, `undoStack`/`redoStack`.
- `preview.ts` — escala del visor, clips activos bajo el cabezal y guías (`toggleGuides`, `safeAreas`).
- `media.ts` — importación vía diálogo nativo + ffprobe/miniaturas.
- `stickers.ts` — emojis, formas SVG y GIF como clips de overlay.
- `project.ts` — guardar/cargar/listar proyectos en SQLite y exportar con FFmpeg.
- `keyboard.ts` — atajos globales.

### Componentes (`src/lib/components/`)

`TopBar`, `MediaLibrary` + `MediaItem` + `StickerPicker`, `Preview` + `PreviewOverlay` + `PreviewControls`,
`Timeline` + `TimelineRuler` + `TimelineTrack` + `TimelineClip` + `Playhead`, `Toolbar`, `Inspector`, `Icon`, `IconButton`.

### Backend (`src-tauri/src/`)

- `db.rs` — SQLite (`projects`, `assets_cache`, `settings`) en `~/.local/share/videoguru-editor/projects.db`.
- `ffmpeg.rs` — envoltorio de procesos `ffmpeg`/`ffprobe`.
- `commands/media.rs` — `probe_media`, `extract_thumbnail`, `extract_filmstrip`, `ffmpeg_available`.
- `commands/project.rs` — `save_project`, `load_project`, `list_projects`, `delete_project`, `set_setting`, `get_setting`.
- `commands/render.rs` — `render_timeline` (recorte + concat en hilo aparte, sin bloquear la UI).

## Atajos

| Acción | Atajo |
| --- | --- |
| Reproducir / Pausa | `Espacio` |
| Cortar en el playhead | `Ctrl+X` / `S` |
| Copiar / Pegar / Duplicar | `Ctrl+C` / `Ctrl+V` / `Ctrl+D` |
| Eliminar clip | `Supr` |
| Deshacer / Rehacer | `Ctrl+Z` / `Ctrl+Shift+Z` o `Ctrl+Y` |
| Guardar proyecto | `Ctrl+S` |
| Zoom línea de tiempo | `Ctrl + +/-` o `Ctrl+rueda` |
| Fotograma anterior/siguiente | `←` / `→` (con `Shift` = 10) |
| Líneas de seguridad | `G` |

## Pendiente

- Falta `src-tauri/icons/icon.png` (Tauri lo requiere para empaquetar): genera uno con
  `npm run tauri icon ruta/al/logo.png`.
- El render actual concatena la pista de vídeo principal; mezcla de audio y overlays con
  `filter_complex` es el siguiente paso.
