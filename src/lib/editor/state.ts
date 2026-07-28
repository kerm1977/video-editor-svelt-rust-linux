import { derived, writable, get } from 'svelte/store';
import type {
  Clip,
  GuideSettings,
  Marker,
  MediaAsset,
  ProjectMeta,
  Selection,
  TimelineState,
  Track
} from './types';

export const uid = (prefix = 'id'): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export const trackHeight = (kind: Track['kind']): number =>
  kind === 'audio' ? 62 : kind === 'overlay' ? 68 : 88;

export const createTrack = (kind: Track['kind'], name: string): Track => ({
  id: uid('track'),
  name,
  kind,
  height: trackHeight(kind),
  muted: false,
  locked: false,
  hidden: false,
  clips: []
});

const initialTimeline = (): TimelineState => ({
  tracks: [
    createTrack('overlay', 'Overlay 1'),
    createTrack('video', 'Video 1'),
    createTrack('video', 'Video 2'),
    createTrack('audio', 'Audio 1')
  ],
  duration: 60
});

export const project = writable<ProjectMeta>({
  id: null,
  name: 'Proyecto sin título',
  width: 1920,
  height: 1080,
  fps: 30
});

export const assets = writable<MediaAsset[]>([]);
export const timeline = writable<TimelineState>(initialTimeline());
export const selection = writable<Selection>({ trackId: null, clipId: null });
export const activeTrackId = writable<string | null>(null);
export const clipboard = writable<Clip | null>(null);

export const playhead = writable(0);
export const isPlaying = writable(false);
export const pixelsPerSecond = writable(90);
export const previewScale = writable(1);
export const statusMessage = writable('Listo');

export const markers = writable<Marker[]>([]);

export const guides = writable<GuideSettings>({
  enabled: false,
  thirds: true,
  center: true,
  titleSafe: true,
  actionSafe: true
});

export const timelineDuration = derived(timeline, ($t) => {
  const end = $t.tracks.reduce((max, track) => {
    const trackEnd = track.clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
    return Math.max(max, trackEnd);
  }, 0);
  return Math.max(end, 10);
});

export const selectedClip = derived([timeline, selection], ([$t, $s]) => {
  if (!$s.clipId) return null;
  for (const track of $t.tracks) {
    const clip = track.clips.find((c) => c.id === $s.clipId);
    if (clip) return clip;
  }
  return null;
});

export const findTrack = (state: TimelineState, trackId: string): Track | undefined =>
  state.tracks.find((t) => t.id === trackId);

export const findClipTrack = (state: TimelineState, clipId: string): Track | undefined =>
  state.tracks.find((t) => t.clips.some((c) => c.id === clipId));

export const getActiveTrackId = (kind: Track['kind'] = 'video'): string => {
  const explicit = get(activeTrackId);
  const state = get(timeline);
  if (explicit && findTrack(state, explicit)) return explicit;
  const match = state.tracks.find((t) => t.kind === kind) ?? state.tracks[0];
  return match.id;
};

export const setStatus = (message: string): void => statusMessage.set(message);

export const resetProject = (): void => {
  assets.set([]);
  timeline.set(initialTimeline());
  selection.set({ trackId: null, clipId: null });
  clipboard.set(null);
  playhead.set(0);
  isPlaying.set(false);
  markers.set([]);
};
