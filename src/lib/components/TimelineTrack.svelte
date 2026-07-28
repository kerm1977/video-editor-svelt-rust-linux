<script lang="ts">
  import Icon from './Icon.svelte';
  import TimelineClip from './TimelineClip.svelte';
  import type { Track } from '../editor/types';
  import { activeTrackId, assets, pixelsPerSecond, playhead } from '../editor/state';
  import { clipFromAsset, insertClip, rippleTrack, toggleTrackFlag } from '../editor/timeline';
  import { get } from 'svelte/store';

  export let track: Track;
  export let duration: number;
  export let labelWidth = 148;
  export let snap = true;

  $: pps = $pixelsPerSecond;
  $: isActive = $activeTrackId === track.id;

  let dropX: number | null = null;

  const iconFor = track.kind === 'audio' ? 'music' : track.kind === 'overlay' ? 'sticker' : 'film';

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropX = e.clientX - rect.left;
  };

  const onDragLeave = () => (dropX = null);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    dropX = null;
    const assetId = e.dataTransfer?.getData('application/x-asset-id');
    if (!assetId) return;
    const asset = get(assets).find((a) => a.id === assetId);
    if (!asset) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const start = Math.max(0, (e.clientX - rect.left) / pps);
    insertClip(track.id, clipFromAsset(asset, snap ? Math.round(start * 10) / 10 : start));
  };

  const focusTrack = () => activeTrackId.set(track.id);
</script>

<div class="track" class:active={isActive} style="--h:{track.height}px;--label-w:{labelWidth}px">
  <div class="head" role="presentation" on:click={focusTrack}>
    <div class="title">
      <Icon name={iconFor} size={14} />
      <span class="name">{track.name}</span>
    </div>
    <div class="flags">
      <button title="Silenciar" class:on={track.muted} on:click|stopPropagation={() => toggleTrackFlag(track.id, 'muted')}>
        <Icon name={track.muted ? 'mute' : 'volume'} size={14} />
      </button>
      <button title="Ocultar" class:on={track.hidden} on:click|stopPropagation={() => toggleTrackFlag(track.id, 'hidden')}>
        <Icon name={track.hidden ? 'eyeOff' : 'eye'} size={14} />
      </button>
      <button title="Bloquear" class:on={track.locked} on:click|stopPropagation={() => toggleTrackFlag(track.id, 'locked')}>
        <Icon name={track.locked ? 'lock' : 'unlock'} size={14} />
      </button>
      <button title="Cerrar huecos" on:click|stopPropagation={() => rippleTrack(track.id)}>
        <Icon name="magnet" size={14} />
      </button>
    </div>
  </div>

  <div
    class="lane"
    class:locked={track.locked}
    role="presentation"
    style="width:{duration * pps}px"
    on:dragover={onDragOver}
    on:dragleave={onDragLeave}
    on:drop={onDrop}
    on:mousedown={focusTrack}
  >
    {#each track.clips as clip (clip.id)}
      <TimelineClip {clip} trackId={track.id} {snap} />
    {/each}
    {#if dropX !== null}
      <div class="drop-marker" style="left:{dropX}px"></div>
    {/if}
  </div>
</div>

<style>
  .track {
    display: flex;
    height: var(--h);
    border-bottom: 1px solid var(--line);
  }
  .head {
    position: sticky;
    left: 0;
    z-index: 25;
    flex: 0 0 var(--label-w);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 5px;
    padding: 0 10px;
    background: var(--bg-2);
    border-right: 1px solid var(--line);
    color: var(--txt-1);
    cursor: pointer;
  }
  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    width: 100%;
  }
  .track.active .head {
    background: var(--bg-3);
    box-shadow: inset 3px 0 0 var(--accent);
    color: var(--txt-0);
  }
  .name {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .flags {
    display: flex;
    gap: 2px;
    margin-left: -3px;
  }
  .flags button {
    display: grid;
    place-items: center;
    width: 22px;
    height: 20px;
    border-radius: 4px;
    color: var(--txt-2);
  }
  .flags button:hover {
    background: #34343a;
    color: var(--txt-0);
  }
  .flags button.on {
    color: var(--accent);
  }
  .lane {
    position: relative;
    background:
      repeating-linear-gradient(90deg, transparent 0 29px, #202026 29px 30px),
      repeating-linear-gradient(90deg, transparent 0 149px, #2b2b32 149px 150px),
      var(--bg-1);
  }
  .drop-marker {
    position: absolute;
    top: 2px;
    bottom: 2px;
    width: 2px;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    pointer-events: none;
  }
  .lane.locked {
    opacity: 0.55;
    pointer-events: none;
  }
</style>
