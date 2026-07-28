import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';

const MIME_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml'
};

export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/** Invoca un comando de Rust; devuelve `null` si corremos en navegador puro. */
export async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isTauri()) {
    console.warn(`[bridge] "${cmd}" ignorado: backend Tauri no disponible`);
    return null;
  }
  return (await invoke(cmd, args)) as T;
}

/** Convierte una ruta local en una URL utilizable por <video>/<img>. */
export const assetUrl = (path: string): string => {
  if (!isTauri()) return path;
  const clean = path.replace(/^file:\/\//, '');
  return encodeURI(convertFileSrc(clean));
};

/** Lee un archivo en Rust y devuelve una URL de objeto (blob) para <video>/<img>. */
export const mediaBlobUrl = async (path: string): Promise<string> => {
  if (!isTauri()) return path;
  const b64 = (await call<string>('read_media_file', { path })) ?? '';
  if (!b64) return path;
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const blob = new Blob([bin], { type: MIME_TYPES[ext] ?? 'application/octet-stream' });
  return URL.createObjectURL(blob);
};
