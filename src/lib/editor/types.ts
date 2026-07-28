export type MediaKind = 'video' | 'audio' | 'image' | 'sticker';

export interface MediaAsset {
  id: string;
  name: string;
  path: string;
  kind: MediaKind;
  duration: number;
  width: number;
  height: number;
  thumbnail: string | null;
  /** Contenido inline para emojis / SVG / GIF sin archivo en disco. */
  inline?: string;
}

export interface Clip {
  id: string;
  assetId: string;
  name: string;
  kind: MediaKind;
  /** Posición en la línea de tiempo (segundos). */
  start: number;
  /** Duración en la línea de tiempo (segundos). */
  duration: number;
  /** Recorte dentro del asset de origen (segundos). */
  inPoint: number;
  volume: number;
  opacity: number;
  color: string;
  thumbnail: string | null;
  inline?: string;
}

export type TrackKind = 'video' | 'audio' | 'overlay';

export interface Track {
  id: string;
  name: string;
  kind: TrackKind;
  height: number;
  muted: boolean;
  locked: boolean;
  hidden: boolean;
  clips: Clip[];
}

export interface TimelineState {
  tracks: Track[];
  duration: number;
}

export interface GuideSettings {
  enabled: boolean;
  thirds: boolean;
  center: boolean;
  titleSafe: boolean;
  actionSafe: boolean;
}

export interface ProjectMeta {
  id: number | null;
  name: string;
  width: number;
  height: number;
  fps: number;
}

export interface ProjectFile {
  meta: ProjectMeta;
  assets: MediaAsset[];
  timeline: TimelineState;
  markers?: Marker[];
}

export interface Selection {
  trackId: string | null;
  clipId: string | null;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export const CLIP_COLORS: Record<MediaKind, string> = {
  video: '#f59e0b',
  audio: '#38bdf8',
  image: '#a78bfa',
  sticker: '#f472b6'
};
