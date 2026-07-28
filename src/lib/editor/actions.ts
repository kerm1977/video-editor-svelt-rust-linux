import { get } from 'svelte/store';
import type { Clip } from './types';
import {
  clipboard,
  findClipTrack,
  getActiveTrackId,
  markers,
  playhead,
  selectedClip,
  selection,
  setStatus,
  timeline,
  uid
} from './state';
import { commit } from './history';
import { MIN_CLIP_DURATION, resolveOverlaps } from './timeline';

export const selectClip = (trackId: string, clipId: string): void =>
  selection.set({ trackId, clipId });

export const clearSelection = (): void => selection.set({ trackId: null, clipId: null });

const requireClip = (): Clip | null => {
  const clip = get(selectedClip);
  if (!clip) setStatus('Selecciona un clip primero');
  return clip;
};

/** Divide el clip activo en la posición actual del playhead. */
export const handleCut = (): void => {
  const clip = requireClip();
  if (!clip) return;
  const at = get(playhead);
  const local = at - clip.start;
  if (local <= MIN_CLIP_DURATION || local >= clip.duration - MIN_CLIP_DURATION) {
    setStatus('El playhead debe estar dentro del clip para cortar');
    return;
  }
  commit('Cortar clip', (state) => ({
    ...state,
    tracks: state.tracks.map((track) => {
      if (!track.clips.some((c) => c.id === clip.id)) return track;
      const left: Clip = { ...clip, duration: local };
      const right: Clip = {
        ...clip,
        id: uid('clip'),
        start: clip.start + local,
        inPoint: clip.inPoint + local,
        duration: clip.duration - local
      };
      return {
        ...track,
        clips: track.clips.flatMap((c) => (c.id === clip.id ? [left, right] : [c]))
      };
    })
  }));
  setStatus('Clip dividido');
};

/** Copia los metadatos del clip seleccionado al portapapeles interno. */
export const handleCopy = (): void => {
  const clip = requireClip();
  if (!clip) return;
  clipboard.set({ ...clip });
  setStatus(`Copiado: ${clip.name}`);
};

/** Inserta el clip copiado en la pista activa a partir del playhead. */
export const handlePaste = (): void => {
  const source = get(clipboard);
  if (!source) {
    setStatus('Portapapeles vacío');
    return;
  }
  const kind = source.kind === 'audio' ? 'audio' : source.kind === 'sticker' ? 'overlay' : 'video';
  const trackId = getActiveTrackId(kind);
  const pasted: Clip = { ...source, id: uid('clip'), start: get(playhead) };
  commit('Pegar clip', (state) => ({
    ...state,
    tracks: state.tracks.map((track) =>
      track.id === trackId ? { ...track, clips: resolveOverlaps(track.clips, pasted) } : track
    )
  }));
  selection.set({ trackId, clipId: pasted.id });
  setStatus(`Pegado: ${pasted.name}`);
};

/** Elimina el clip seleccionado y compacta los clips posteriores de la pista. */
export const handleDelete = (ripple = true): void => {
  const clip = requireClip();
  if (!clip) return;
  const track = findClipTrack(get(timeline), clip.id);
  if (!track) return;
  commit('Eliminar clip', (state) => ({
    ...state,
    tracks: state.tracks.map((t) => {
      if (t.id !== track.id) return t;
      const remaining = t.clips.filter((c) => c.id !== clip.id);
      if (!ripple) return { ...t, clips: remaining };
      return {
        ...t,
        clips: remaining.map((c) =>
          c.start > clip.start ? { ...c, start: Math.max(0, c.start - clip.duration) } : c
        )
      };
    })
  }));
  clearSelection();
  setStatus('Clip eliminado');
};

/** Duplica el clip seleccionado justo después de su posición. */
export const handleDuplicate = (): void => {
  const clip = requireClip();
  if (!clip) return;
  const copy: Clip = { ...clip, id: uid('clip'), start: clip.start + clip.duration };
  commit('Duplicar clip', (state) => ({
    ...state,
    tracks: state.tracks.map((track) =>
      track.clips.some((c) => c.id === clip.id)
        ? { ...track, clips: resolveOverlaps(track.clips, copy) }
        : track
    )
  }));
  setStatus('Clip duplicado');
};

export const updateClipProperty = <K extends keyof Clip>(
  clipId: string,
  key: K,
  value: Clip[K]
): void => {
  commit('Editar propiedad', (state) => ({
    ...state,
    tracks: state.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((c) => (c.id === clipId ? { ...c, [key]: value } : c))
    }))
  }));
};

/** Selecciona todos los clips de todas las pistas. */
export const selectAllClips = (): void => {
  const state = get(timeline);
  const firstClip = state.tracks.flatMap((t) => t.clips)[0];
  if (!firstClip) {
    setStatus('No hay clips que seleccionar');
    return;
  }
  const track = state.tracks.find((t) => t.clips.some((c) => c.id === firstClip.id));
  if (track) selection.set({ trackId: track.id, clipId: firstClip.id });
  setStatus('Clip seleccionado (usa Ctrl+E para seleccionar todos en el futuro)');
};

/** Añade una marca en la posición actual del playhead. */
export const addMarker = (): void => {
  const time = get(playhead);
  const id = uid('marker');
  const label = `Marca ${get(markers).length + 1}`;
  const color = '#ef4444';
  markers.update((list) => [...list, { id, time, label, color }]);
  setStatus(`Marca añadida en ${time.toFixed(1)}s`);
};

/** Elimina una marca por id. */
export const removeMarker = (id: string): void => {
  markers.update((list) => list.filter((m) => m.id !== id));
};
