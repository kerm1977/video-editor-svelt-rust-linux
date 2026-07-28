let ghost: HTMLElement | null = null;

const buildGhost = (label: string, thumbnail: string | null): HTMLElement => {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'top:-1000px',
    'left:-1000px',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'max-width:220px',
    'padding:6px 10px',
    'border-radius:8px',
    'background:#1e1e1e',
    'border:1px solid #f59e0b',
    'color:#f5f5f7',
    'font:500 12px/1 Inter, system-ui, sans-serif',
    'box-shadow:0 10px 24px rgba(0,0,0,.55)',
    'pointer-events:none'
  ].join(';');

  if (thumbnail) {
    const img = document.createElement('img');
    img.src = thumbnail;
    img.style.cssText = 'width:34px;height:22px;object-fit:cover;border-radius:4px';
    el.appendChild(img);
  }

  const text = document.createElement('span');
  text.textContent = label;
  text.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
  el.appendChild(text);
  return el;
};

/** Sustituye la imagen de arrastre nativa por una etiqueta compacta. */
export const setDragGhost = (
  e: DragEvent,
  label: string,
  thumbnail: string | null = null
): void => {
  clearDragGhost();
  if (!e.dataTransfer) return;
  ghost = buildGhost(label, thumbnail);
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 12, 12);
};

export const clearDragGhost = (): void => {
  ghost?.remove();
  ghost = null;
};
