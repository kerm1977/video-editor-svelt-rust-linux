import { get } from 'svelte/store';
import { isPlaying, playhead, project, timelineDuration } from './state';

let rafId: number | null = null;
let lastTs = 0;
let videoEl: HTMLVideoElement | null = null;

/** Registra el elemento <video> del previsualizador. */
export const attachVideoElement = (el: HTMLVideoElement | null): void => {
  videoEl = el;
};

const tick = (ts: number): void => {
  if (!get(isPlaying)) return;
  const delta = lastTs === 0 ? 0 : (ts - lastTs) / 1000;
  lastTs = ts;
  updatePlayheadPosition(delta);
  rafId = requestAnimationFrame(tick);
};

/** Avanza el cabezal en función del tiempo transcurrido y sincroniza el vídeo. */
export const updatePlayheadPosition = (delta: number): void => {
  const duration = get(timelineDuration);
  const next = get(playhead) + delta;
  if (next >= duration) {
    playhead.set(duration);
    pause();
    return;
  }
  playhead.set(next);
  syncVideoElement(next);
};

const syncVideoElement = (time: number): void => {
  if (!videoEl) return;
  if (Math.abs(videoEl.currentTime - time) > 0.25) videoEl.currentTime = time;
};

export const play = (): void => {
  if (get(isPlaying)) return;
  isPlaying.set(true);
  lastTs = 0;
  videoEl?.play().catch(() => undefined);
  rafId = requestAnimationFrame(tick);
};

export const pause = (): void => {
  isPlaying.set(false);
  videoEl?.pause();
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

export const handlePlayPause = (): void => (get(isPlaying) ? pause() : play());

/** Coloca el cabezal en un instante concreto (segundos). */
export const seekTo = (timestamp: number): void => {
  const duration = get(timelineDuration);
  const clamped = Math.min(duration, Math.max(0, timestamp));
  playhead.set(clamped);
  if (videoEl) videoEl.currentTime = clamped;
};

export const seekBy = (delta: number): void => seekTo(get(playhead) + delta);

export const frameStep = (frames: number): void => {
  const { fps } = get(project);
  seekBy(frames / fps);
};

export const seekToStart = (): void => seekTo(0);
export const seekToEnd = (): void => seekTo(get(timelineDuration));

export const currentFrame = (): number => Math.round(get(playhead) * get(project).fps);
