import { writable } from 'svelte/store';

export interface PanelSizes {
  leftWidth: number;
  rightWidth: number;
  topHeight: number;
}

export const DEFAULT_SIZES: PanelSizes = {
  leftWidth: 290,
  rightWidth: 250,
  topHeight: 0.52
};

const STORAGE_KEY = 'vg.panelSizes';

const loadSizes = (): PanelSizes => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SIZES, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SIZES };
};

export const panelSizes = writable<PanelSizes>(loadSizes());

export const setPanelSize = (key: keyof PanelSizes, value: number): void => {
  panelSizes.update((s) => {
    const next = { ...s, [key]: value };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  });
};

export const resetLayout = (): void => {
  panelSizes.set({ ...DEFAULT_SIZES });
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
