<script lang="ts">
  import Icon from './Icon.svelte';
  import type { MediaAsset } from '../editor/types';
  import { formatTime } from '../editor/timeline';
  import { clearDragGhost, setDragGhost } from '../ui/drag';

  export let asset: MediaAsset;
  export let onAdd: (asset: MediaAsset) => void;
  export let onRemove: (id: string) => void;

  const iconFor = (kind: MediaAsset['kind']) =>
    kind === 'audio' ? 'music' : kind === 'image' ? 'image' : kind === 'sticker' ? 'sticker' : 'film';

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer?.setData('application/x-asset-id', asset.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
    setDragGhost(e, asset.name, asset.thumbnail);
  };
</script>

<li class="item" draggable="true" on:dragstart={onDragStart} on:dragend={clearDragGhost}>
  <div class="thumb">
    {#if asset.thumbnail}
      <img src={asset.thumbnail} alt={asset.name} />
    {:else}
      <Icon name={iconFor(asset.kind)} size={20} />
    {/if}
  </div>
  <div class="meta">
    <span class="name" title={asset.path || asset.name}>{asset.name}</span>
    <span class="sub">{asset.kind} · {formatTime(asset.duration)}</span>
  </div>
  <div class="tools">
    <button title="Añadir a la línea de tiempo" on:click={() => onAdd(asset)}>
      <Icon name="plus" size={15} />
    </button>
    <button class="del" title="Quitar" on:click={() => onRemove(asset.id)}>
      <Icon name="trash" size={15} />
    </button>
  </div>
</li>

<style>
  .item {
    display: grid;
    grid-template-columns: 68px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 6px;
    border-radius: var(--radius-sm);
    cursor: grab;
  }
  .item:hover {
    background: var(--bg-2);
  }
  .thumb {
    display: grid;
    place-items: center;
    width: 68px;
    height: 42px;
    border-radius: 6px;
    background: var(--bg-3);
    color: var(--txt-2);
    overflow: hidden;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-size: 12.5px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 10.5px;
    letter-spacing: 0.02em;
    color: var(--txt-2);
    font-variant-numeric: tabular-nums;
  }
  .tools {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .item:hover .tools {
    opacity: 1;
  }
  .tools button {
    padding: 5px;
    border-radius: 5px;
    color: var(--txt-1);
  }
  .tools button:hover {
    background: var(--bg-3);
    color: var(--accent);
  }
  .tools .del:hover {
    color: var(--danger);
  }
</style>
