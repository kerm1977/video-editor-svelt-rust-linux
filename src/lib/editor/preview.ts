import { derived, get } from 'svelte/store';
import type { Clip, GuideSettings } from './types';
import { guides, playhead, previewScale, project, timeline } from './state';

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 4;

/** Alterna la visualización global de las líneas de seguridad. */
export const toggleGuides = (): void =>
  guides.update((g) => ({ ...g, enabled: !g.enabled }));

/** Alterna una guía concreta (tercios, centro, title-safe, action-safe). */
export const toggleGuide = (key: keyof Omit<GuideSettings, 'enabled'>): void =>
  guides.update((g) => ({ ...g, [key]: !g[key], enabled: true }));

export const setPreviewScale = (scale: number): void =>
  previewScale.set(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)));

export const zoomPreview = (factor: number): void =>
  setPreviewScale(get(previewScale) * factor);

export const fitPreview = (containerW: number, containerH: number): void => {
  const { width, height } = get(project);
  if (!containerW || !containerH) return;
  setPreviewScale(Math.min(containerW / width, containerH / height));
};

/** Clips visibles bajo el playhead, ordenados de fondo a frente. */
export const activeClips = derived([timeline, playhead], ([$t, $p]) => {
  const layers: { clip: Clip; trackKind: string }[] = [];
  for (const track of $t.tracks) {
    if (track.hidden) continue;
    const clip = track.clips.find((c) => $p >= c.start && $p < c.start + c.duration);
    if (clip) layers.push({ clip, trackKind: track.kind });
  }
  return layers;
});

export const activeVideoClip = derived(activeClips, ($layers) => {
  const found = [...$layers].reverse().find((l) => l.clip.kind === 'video' || l.clip.kind === 'image');
  return found?.clip ?? null;
});

export const overlayClips = derived(activeClips, ($layers) =>
  $layers.filter((l) => l.clip.kind === 'sticker').map((l) => l.clip)
);

/** Rectángulos normalizados (0..1) de las guías de seguridad. */
export const safeAreas = (settings: GuideSettings) => {
  const areas: { key: string; inset: number }[] = [];
  if (settings.actionSafe) areas.push({ key: 'action', inset: 0.05 });
  if (settings.titleSafe) areas.push({ key: 'title', inset: 0.1 });
  return areas;
};

/** Tiempo local dentro del clip para extraer el fotograma correcto. */
export const clipLocalTime = (clip: Clip, globalTime: number): number =>
  Math.max(0, clip.inPoint + (globalTime - clip.start));
