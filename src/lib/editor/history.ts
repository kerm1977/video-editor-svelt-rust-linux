import { get, writable } from 'svelte/store';
import type { TimelineState } from './types';
import { setStatus, timeline } from './state';

export interface HistoryEntry {
  label: string;
  state: TimelineState;
}

const MAX_DEPTH = 100;

export const undoStack = writable<HistoryEntry[]>([]);
export const redoStack = writable<HistoryEntry[]>([]);
export const canUndo = writable(false);
export const canRedo = writable(false);

const clone = (state: TimelineState): TimelineState => ({
  duration: state.duration,
  tracks: state.tracks.map((t) => ({ ...t, clips: t.clips.map((c) => ({ ...c })) }))
});

const syncFlags = (): void => {
  canUndo.set(get(undoStack).length > 0);
  canRedo.set(get(redoStack).length > 0);
};

/** Guarda el estado actual en la pila de deshacer antes de mutar. */
export const pushHistory = (label: string): void => {
  undoStack.update((stack) => {
    const next = [...stack, { label, state: clone(get(timeline)) }];
    return next.length > MAX_DEPTH ? next.slice(next.length - MAX_DEPTH) : next;
  });
  redoStack.set([]);
  syncFlags();
};

/**
 * Patrón Command: aplica una transformación pura sobre la línea de tiempo
 * registrando automáticamente el estado previo.
 */
export const commit = (
  label: string,
  transform: (state: TimelineState) => TimelineState
): void => {
  pushHistory(label);
  timeline.update((state) => transform(state));
};

export const handleUndo = (): void => {
  const stack = get(undoStack);
  if (stack.length === 0) {
    setStatus('Nada que deshacer');
    return;
  }
  const entry = stack[stack.length - 1];
  redoStack.update((r) => [...r, { label: entry.label, state: clone(get(timeline)) }]);
  undoStack.set(stack.slice(0, -1));
  timeline.set(entry.state);
  syncFlags();
  setStatus(`Deshecho: ${entry.label}`);
};

export const handleRedo = (): void => {
  const stack = get(redoStack);
  if (stack.length === 0) {
    setStatus('Nada que rehacer');
    return;
  }
  const entry = stack[stack.length - 1];
  undoStack.update((u) => [...u, { label: entry.label, state: clone(get(timeline)) }]);
  redoStack.set(stack.slice(0, -1));
  timeline.set(entry.state);
  syncFlags();
  setStatus(`Rehecho: ${entry.label}`);
};

export const clearHistory = (): void => {
  undoStack.set([]);
  redoStack.set([]);
  syncFlags();
};
