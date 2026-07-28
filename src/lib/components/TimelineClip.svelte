<script lang="ts">
  import type { Clip } from '../editor/types';
  import { pixelsPerSecond, selection } from '../editor/state';
  import { formatTime, moveClip, resizeClip } from '../editor/timeline';
  import { selectClip } from '../editor/actions';

  export let clip: Clip;
  export let trackId: string;
  export let snap = true;

  $: pps = $pixelsPerSecond;
  $: selected = $selection.clipId === clip.id;

  const snapTime = (t: number) => (snap ? Math.round(t * 10) / 10 : t);

  const startDrag = (e: MouseEvent) => {
    if (e.button !== 0) return;
    selectClip(trackId, clip.id);
    const originX = e.clientX;
    const originStart = clip.start;
    const onMove = (ev: MouseEvent) => {
      const delta = (ev.clientX - originX) / pps;
      moveClip(clip.id, trackId, snapTime(Math.max(0, originStart + delta)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (edge: 'start' | 'end') => (e: MouseEvent) => {
    e.stopPropagation();
    const originX = e.clientX;
    let last = 0;
    const onMove = (ev: MouseEvent) => {
      const total = (ev.clientX - originX) / pps;
      resizeClip(clip.id, edge, total - last);
      last = total;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
</script>

<div
  class="clip"
  class:selected
  role="button"
  tabindex="0"
  style="left:{clip.start * pps}px;width:{clip.duration * pps}px;--clr:{clip.color}"
  on:mousedown={startDrag}
  on:keydown={(e) => e.key === 'Enter' && selectClip(trackId, clip.id)}
>
  <span class="handle left" role="presentation" on:mousedown={startResize('start')}></span>

  {#if clip.thumbnail}
    <img class="thumb" src={clip.thumbnail} alt="" />
  {/if}
  <span class="label">{clip.name}</span>
  <span class="dur">{formatTime(clip.duration)}</span>

  <span class="handle right" role="presentation" on:mousedown={startResize('end')}></span>
</div>

<style>
  .clip {
    position: absolute;
    top: 4px;
    bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    border-radius: 6px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--clr) 40%, #1b1b1f), #17171b);
    border: 1px solid color-mix(in srgb, var(--clr) 60%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--clr) 30%, transparent);
    color: var(--txt-0);
    overflow: hidden;
    cursor: grab;
    user-select: none;
  }
  .clip.selected {
    border-color: #fff;
    background: linear-gradient(180deg, color-mix(in srgb, var(--clr) 62%, #1b1b1f), #1f1f24);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--clr) 85%, #fff), 0 8px 22px rgba(0, 0, 0, 0.55);
    z-index: 2;
  }
  .thumb {
    height: 70%;
    aspect-ratio: 16/9;
    object-fit: cover;
    border-radius: 3px;
    flex: none;
  }
  .label {
    font-size: 11.5px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dur {
    margin-left: auto;
    font-size: 10px;
    color: var(--txt-2);
    font-variant-numeric: tabular-nums;
  }
  .handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 7px;
    cursor: ew-resize;
    background: transparent;
  }
  .handle:hover {
    background: color-mix(in srgb, var(--clr) 65%, transparent);
  }
  .handle.left {
    left: 0;
  }
  .handle.right {
    right: 0;
  }
</style>
