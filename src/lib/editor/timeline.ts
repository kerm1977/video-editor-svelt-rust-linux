import { get } from 'svelte/store';
import type { Clip, MediaAsset, TimelineState, Track } from './types';
import { CLIP_COLORS } from './types';
import { pixelsPerSecond, timeline, trackHeight, uid } from './state';
import { commit } from './history';

export const MIN_PPS = 12;
export const MAX_PPS = 600;
export const MIN_CLIP_DURATION = 0.1;

/** Convierte segundos a píxeles según el zoom actual. */
export const timeToPx = (seconds: number, pps: number): number => seconds * pps;

/** Convierte píxeles a segundos según el zoom actual. */
export const pxToTime = (px: number, pps: number): number => px / pps;

export const clampZoom = (pps: number): number =>
  Math.min(MAX_PPS, Math.max(MIN_PPS, pps));

/** Aplica un factor multiplicativo de zoom (1.2 = acercar, 0.8 = alejar). */
export const zoomBy = (factor: number): void =>
  pixelsPerSecond.update((pps) => clampZoom(pps * factor));

export const setZoom = (pps: number): void => pixelsPerSecond.set(clampZoom(pps));

/** Calcula el paso ideal de la regla de tiempo para el zoom dado. */
export const rulerStep = (pps: number): number => {
  const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
  return steps.find((s) => s * pps >= 70) ?? 600;
};

export const formatTime = (seconds: number, fps = 30): string => {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const f = Math.floor((safe % 1) * fps);
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  return `${pad(m)}:${pad(s)}.${pad(f)}`;
};

export const clipFromAsset = (asset: MediaAsset, start: number): Clip => ({
  id: uid('clip'),
  assetId: asset.id,
  name: asset.name,
  kind: asset.kind,
  start: Math.max(0, start),
  duration: Math.max(MIN_CLIP_DURATION, asset.duration || 4),
  inPoint: 0,
  volume: 1,
  opacity: 1,
  color: CLIP_COLORS[asset.kind],
  thumbnail: asset.thumbnail,
  inline: asset.inline
});

const sortClips = (clips: Clip[]): Clip[] =>
  [...clips].sort((a, b) => a.start - b.start);

/** Empuja hacia la derecha los clips que solapen con `clip` en la pista. */
export const resolveOverlaps = (clips: Clip[], clip: Clip): Clip[] => {
  const ordered = sortClips(clips);
  const out: Clip[] = [];
  let cursor = clip.start + clip.duration;
  for (const c of ordered) {
    if (c.id === clip.id) continue;
    const overlaps = c.start < cursor && c.start + c.duration > clip.start;
    if (overlaps) {
      out.push({ ...c, start: cursor });
      cursor += c.duration;
    } else {
      out.push(c);
    }
  }
  out.push(clip);
  return sortClips(out);
};

const mapTrack = (
  state: TimelineState,
  trackId: string,
  fn: (track: Track) => Track
): TimelineState => ({
  ...state,
  tracks: state.tracks.map((t) => (t.id === trackId ? fn(t) : t))
});

/** Inserta un clip en la pista indicada respetando solapamientos. */
export const insertClip = (trackId: string, clip: Clip, label = 'Insertar clip'): void => {
  commit(label, (state) =>
    mapTrack(state, trackId, (track) => ({
      ...track,
      clips: resolveOverlaps(track.clips, clip)
    }))
  );
};

/** Mueve un clip dentro de su pista o hacia otra pista. */
export const moveClip = (clipId: string, targetTrackId: string, newStart: number): void => {
  commit('Mover clip', (state) => {
    let moving: Clip | null = null;
    const stripped = state.tracks.map((track) => {
      const found = track.clips.find((c) => c.id === clipId);
      if (!found) return track;
      moving = { ...found, start: Math.max(0, newStart) };
      return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
    });
    if (!moving) return state;
    return mapTrack({ ...state, tracks: stripped }, targetTrackId, (track) => ({
      ...track,
      clips: resolveOverlaps(track.clips, moving as Clip)
    }));
  });
};

/** Redimensiona un clip por su borde izquierdo o derecho. */
export const resizeClip = (clipId: string, edge: 'start' | 'end', delta: number): void => {
  commit('Ajustar clip', (state) => ({
    ...state,
    tracks: state.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((c) => {
        if (c.id !== clipId) return c;
        if (edge === 'end') {
          return { ...c, duration: Math.max(MIN_CLIP_DURATION, c.duration + delta) };
        }
        const shift = Math.min(delta, c.duration - MIN_CLIP_DURATION);
        return {
          ...c,
          start: Math.max(0, c.start + shift),
          inPoint: Math.max(0, c.inPoint + shift),
          duration: c.duration - shift
        };
      })
    }))
  }));
};

/** Reordena las pistas (drag & drop vertical). */
export const reorderTracks = (from: number, to: number): void => {
  commit('Reordenar pistas', (state) => {
    const tracks = [...state.tracks];
    const [moved] = tracks.splice(from, 1);
    tracks.splice(to, 0, moved);
    return { ...state, tracks };
  });
};

/** Elimina huecos de la pista compactando los clips hacia la izquierda. */
export const rippleTrack = (trackId: string): void => {
  commit('Cerrar huecos', (state) =>
    mapTrack(state, trackId, (track) => {
      let cursor = 0;
      const clips = sortClips(track.clips).map((c) => {
        const next = { ...c, start: cursor };
        cursor += c.duration;
        return next;
      });
      return { ...track, clips };
    })
  );
};

export const addTrack = (kind: Track['kind']): void => {
  commit('Añadir pista', (state) => {
    const count = state.tracks.filter((t) => t.kind === kind).length + 1;
    const label = kind === 'audio' ? 'Audio' : kind === 'overlay' ? 'Overlay' : 'Video';
    return { ...state, tracks: [...state.tracks, { ...trackTemplate(kind), name: `${label} ${count}` }] };
  });
};

const trackTemplate = (kind: Track['kind']): Track => ({
  id: uid('track'),
  name: kind,
  kind,
  height: trackHeight(kind),
  muted: false,
  locked: false,
  hidden: false,
  clips: []
});

export const toggleTrackFlag = (trackId: string, flag: 'muted' | 'locked' | 'hidden'): void => {
  timeline.update((state) =>
    mapTrack(state, trackId, (track) => ({ ...track, [flag]: !track[flag] }))
  );
};

export const currentZoom = (): number => get(pixelsPerSecond);
