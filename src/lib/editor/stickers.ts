import type { Clip, MediaAsset } from './types';
import { CLIP_COLORS } from './types';
import { assets, getActiveTrackId, playhead, setStatus, uid } from './state';
import { get } from 'svelte/store';
import { insertClip } from './timeline';
import { pushRecentEmoji } from './emoji';

export { ALL_EMOJIS as EMOJI_SET, EMOJI_CATEGORIES } from './emoji';

export const SVG_SHAPES: { name: string; svg: string }[] = [
  {
    name: 'Flecha',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50h60l-20-20 8-8 34 28-34 28-8-8 20-20H10z" fill="#f59e0b"/></svg>'
  },
  {
    name: 'Estrella',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5l13 30 33 3-25 22 8 32-29-17-29 17 8-32L4 38l33-3z" fill="#fbbf24"/></svg>'
  },
  {
    name: 'Bocadillo',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 15h80v55H55L30 90V70H10z" fill="#38bdf8"/></svg>'
  },
  {
    name: 'Corazón',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88S8 60 8 34a22 22 0 0142-9 22 22 0 0142 9c0 26-42 54-42 54z" fill="#f472b6"/></svg>'
  }
];

const svgDataUrl = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const emojiDataUrl = (emoji: string): string =>
  svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="72" font-size="72" text-anchor="middle">${emoji}</text></svg>`
  );

const registerInlineAsset = (name: string, inline: string): MediaAsset => {
  const asset: MediaAsset = {
    id: uid('asset'),
    name,
    path: '',
    kind: 'sticker',
    duration: 3,
    width: 512,
    height: 512,
    thumbnail: inline,
    inline
  };
  assets.update((list) => [...list, asset]);
  return asset;
};

export const createEmojiAsset = (emoji: string): MediaAsset =>
  registerInlineAsset(emoji, emojiDataUrl(emoji));

export const createSvgAsset = (name: string, svg: string): MediaAsset =>
  registerInlineAsset(name, svgDataUrl(svg));

/** Inserta un sticker (emoji, SVG o GIF) en la pista de overlay bajo el playhead. */
export const addStickerToTimeline = (asset: MediaAsset): void => {
  const clip: Clip = {
    id: uid('clip'),
    assetId: asset.id,
    name: asset.name,
    kind: 'sticker',
    start: get(playhead),
    duration: asset.duration,
    inPoint: 0,
    volume: 0,
    opacity: 1,
    color: CLIP_COLORS.sticker,
    thumbnail: asset.thumbnail,
    inline: asset.inline
  };
  insertClip(getActiveTrackId('overlay'), clip, 'Añadir sticker');
  setStatus(`Sticker añadido: ${asset.name}`);
};

export const addEmoji = (emoji: string): void => {
  pushRecentEmoji(emoji);
  addStickerToTimeline(createEmojiAsset(emoji));
};

export const addSvgShape = (shape: { name: string; svg: string }): void =>
  addStickerToTimeline(createSvgAsset(shape.name, shape.svg));
