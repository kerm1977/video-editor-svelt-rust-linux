import {
  addMarker,
  handleCopy,
  handleCut,
  handleDelete,
  handleDuplicate,
  handlePaste,
  selectAllClips
} from './actions';
import { handleRedo, handleUndo } from './history';
import { frameStep, handlePlayPause, seekToEnd, seekToStart } from './player';
import { saveProject } from './project';
import { zoomBy } from './timeline';
import { toggleGuides } from './preview';
import { importMedia } from './media';

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable;
};

type Handler = (e: KeyboardEvent) => void;

const withMod = (e: KeyboardEvent): boolean => e.ctrlKey || e.metaKey;

const shortcuts: { match: (e: KeyboardEvent) => boolean; run: Handler }[] = [
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'z' && !e.shiftKey, run: () => handleUndo() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'z' && e.shiftKey, run: () => handleRedo() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'y', run: () => handleRedo() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'x', run: () => handleCut() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'c', run: () => handleCopy() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'v', run: () => handlePaste() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 'd', run: () => handleDuplicate() },
  { match: (e) => withMod(e) && e.key.toLowerCase() === 's', run: () => void saveProject() },
  { match: (e) => withMod(e) && (e.key === '+' || e.key === '='), run: () => zoomBy(1.25) },
  { match: (e) => withMod(e) && e.key === '-', run: () => zoomBy(0.8) },
  { match: (e) => e.key === 'Delete' || e.key === 'Backspace', run: () => handleDelete() },
  { match: (e) => e.key === ' ', run: () => handlePlayPause() },
  { match: (e) => e.key === 'ArrowLeft', run: (e) => frameStep(e.shiftKey ? -10 : -1) },
  { match: (e) => e.key === 'ArrowRight', run: (e) => frameStep(e.shiftKey ? 10 : 1) },
  { match: (e) => e.key === 'Home', run: () => seekToStart() },
  { match: (e) => e.key === 'End', run: () => seekToEnd() },
  { match: (e) => e.key.toLowerCase() === 'g' && !withMod(e), run: () => toggleGuides() },
  { match: (e) => e.key.toLowerCase() === 'x' && !withMod(e), run: () => handleCut() },
  { match: (e) => e.key.toLowerCase() === 'b' && !withMod(e), run: () => handleDelete() },
  { match: (e) => e.key.toLowerCase() === 'a' && !withMod(e) && !e.shiftKey, run: () => selectAllClips() },
  { match: (e) => e.key.toLowerCase() === 'a' && !withMod(e) && e.shiftKey, run: () => void importMedia() },
  { match: (e) => e.key.toLowerCase() === 'm' && !withMod(e), run: () => addMarker() }
];

/** Registra los atajos globales; devuelve la función de limpieza. */
export const registerShortcuts = (): (() => void) => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;
    const hit = shortcuts.find((s) => s.match(e));
    if (!hit) return;
    e.preventDefault();
    hit.run(e);
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
};
