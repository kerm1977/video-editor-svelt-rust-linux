import { ACTIVITY } from './activity';
import { FOOD } from './food';
import { NATURE } from './nature';
import { OBJECTS } from './objects';
import { PEOPLE } from './people';
import { SMILEYS } from './smileys';
import { SYMBOLS } from './symbols';
import { TRAVEL } from './travel';

export interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  items: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: 'smileys', label: 'Caritas', icon: '😀', items: SMILEYS },
  { id: 'people', label: 'Personas', icon: '👋', items: PEOPLE },
  { id: 'nature', label: 'Naturaleza', icon: '🐶', items: NATURE },
  { id: 'food', label: 'Comida', icon: '🍔', items: FOOD },
  { id: 'activity', label: 'Actividades', icon: '⚽', items: ACTIVITY },
  { id: 'travel', label: 'Viajes', icon: '✈️', items: TRAVEL },
  { id: 'objects', label: 'Objetos', icon: '💡', items: OBJECTS },
  { id: 'symbols', label: 'Símbolos', icon: '🔣', items: SYMBOLS }
];

export const ALL_EMOJIS: string[] = EMOJI_CATEGORIES.flatMap((c) => c.items);

const RECENT_KEY = 'vg.recentEmojis';
const RECENT_MAX = 32;

export const loadRecentEmojis = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

/** Guarda el emoji usado al principio de la lista de recientes. */
export const pushRecentEmoji = (emoji: string): string[] => {
  const next = [emoji, ...loadRecentEmojis().filter((e) => e !== emoji)].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* almacenamiento no disponible */
  }
  return next;
};
