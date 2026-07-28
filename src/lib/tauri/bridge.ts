import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';

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
