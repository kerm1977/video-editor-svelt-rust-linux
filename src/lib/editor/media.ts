import { get } from 'svelte/store';
import { open } from '@tauri-apps/plugin-dialog';
import type { MediaAsset, MediaKind } from './types';
import { assets, setStatus, uid } from './state';
import { assetUrl, call, isTauri } from '../tauri/bridge';

export interface ProbeResult {
  duration: number;
  width: number;
  height: number;
  has_audio: boolean;
  has_video: boolean;
}

const VIDEO_EXT = ['mp4', 'mkv', 'mov', 'webm', 'avi', 'm4v'];
const AUDIO_EXT = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'bmp'];
const STICKER_EXT = ['gif', 'svg', 'apng', 'webp'];

export const kindFromPath = (path: string): MediaKind => {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  if (STICKER_EXT.includes(ext)) return 'sticker';
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (VIDEO_EXT.includes(ext)) return 'video';
  return 'video';
};

export const baseName = (path: string): string => path.split('/').pop() ?? path;

/** Analiza un archivo con ffprobe a través del backend Rust. */
export const probeMedia = async (path: string): Promise<ProbeResult> => {
  const result = await call<ProbeResult>('probe_media', { path });
  return result ?? { duration: 5, width: 1920, height: 1080, has_audio: false, has_video: true };
};

/** Genera una miniatura (data URL base64) mediante FFmpeg. */
export const makeThumbnail = async (path: string, at = 0.5): Promise<string | null> =>
  call<string>('extract_thumbnail', { path, timestamp: at });

export const registerAsset = async (path: string): Promise<MediaAsset> => {
  const kind = kindFromPath(path);
  const probe = await probeMedia(path);
  const asset: MediaAsset = {
    id: uid('asset'),
    name: baseName(path),
    path,
    kind,
    duration: kind === 'image' ? 5 : kind === 'sticker' ? 3 : probe.duration,
    width: probe.width,
    height: probe.height,
    thumbnail: kind === 'audio' ? null : kind === 'sticker' ? assetUrl(path) : await makeThumbnail(path),
    inline: kind === 'sticker' ? assetUrl(path) : undefined
  };
  assets.update((list) => [...list, asset]);
  return asset;
};

/** Abre el diálogo del sistema e importa los archivos seleccionados. */
export const importMedia = async (): Promise<MediaAsset[]> => {
  if (!isTauri()) {
    setStatus('Importación disponible sólo dentro de la app de escritorio');
    return [];
  }
  const picked = await open({
    multiple: true,
    filters: [
      { name: 'Multimedia', extensions: [...VIDEO_EXT, ...AUDIO_EXT, ...IMAGE_EXT, ...STICKER_EXT] }
    ]
  });
  if (!picked) return [];
  const paths = Array.isArray(picked) ? picked : [picked];
  setStatus(`Importando ${paths.length} archivo(s)…`);
  const imported: MediaAsset[] = [];
  for (const p of paths) imported.push(await registerAsset(p));
  setStatus(`Importados ${imported.length} archivo(s)`);
  return imported;
};

/** Importa stickers de WhatsApp (.webp), GIF, SVG o PNG animados. */
export const importStickers = async (): Promise<MediaAsset[]> => {
  if (!isTauri()) {
    setStatus('Importación disponible sólo dentro de la app de escritorio');
    return [];
  }
  const picked = await open({
    multiple: true,
    filters: [{ name: 'Stickers', extensions: [...STICKER_EXT, 'png', 'jpg', 'jpeg'] }]
  });
  if (!picked) return [];
  const paths = Array.isArray(picked) ? picked : [picked];
  const imported: MediaAsset[] = [];
  for (const p of paths) {
    const asset = await registerAsset(p);
    const url = assetUrl(p);
    const sticker: MediaAsset = { ...asset, kind: 'sticker', inline: url, thumbnail: url, duration: 3 };
    assets.update((list) => list.map((a) => (a.id === asset.id ? sticker : a)));
    imported.push(sticker);
  }
  setStatus(`${imported.length} sticker(s) importado(s)`);
  return imported;
};

export const removeAsset = (assetId: string): void => {
  assets.update((list) => list.filter((a) => a.id !== assetId));
};

export const findAsset = (assetId: string): MediaAsset | undefined =>
  get(assets).find((a) => a.id === assetId);
