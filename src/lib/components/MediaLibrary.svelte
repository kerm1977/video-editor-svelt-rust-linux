<script lang="ts">
  import IconButton from './IconButton.svelte';
  import MediaItem from './MediaItem.svelte';
  import StickerPicker from './StickerPicker.svelte';
  import type { MediaAsset } from '../editor/types';
  import { assets, getActiveTrackId, playhead } from '../editor/state';
  import { importMedia, removeAsset } from '../editor/media';
  import { clipFromAsset, insertClip } from '../editor/timeline';
  import { addStickerToTimeline } from '../editor/stickers';

  let filter: 'all' | 'video' | 'audio' | 'sticker' = 'all';
  let query = '';

  $: visible = $assets.filter(
    (a: MediaAsset) =>
      (filter === 'all' ||
        a.kind === filter ||
        (filter === 'video' && a.kind === 'image') ||
        (filter === 'sticker' && a.kind === 'sticker')) &&
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  const addToTimeline = (asset: MediaAsset) => {
    if (asset.kind === 'sticker') {
      addStickerToTimeline(asset);
      return;
    }
    const kind = asset.kind === 'audio' ? 'audio' : 'video';
    insertClip(getActiveTrackId(kind), clipFromAsset(asset, $playhead));
  };
</script>

<section class="panel">
  <div class="panel-head">
    <span>Biblioteca</span>
    <IconButton icon="import" size="sm" label="Importar medios" onClick={() => void importMedia()} />
  </div>

  <div class="filters">
    <input placeholder="Buscar…" bind:value={query} />
    <div class="row">
      {#each [['all', 'Todo'], ['video', 'Vídeo'], ['audio', 'Audio'], ['sticker', 'Stickers']] as [key, label]}
        <button
          class="chip"
          class:active={filter === key}
          on:click={() => (filter = key as typeof filter)}>{label}</button
        >
      {/each}
    </div>
  </div>

  <div class="panel-body">
    <ul>
      {#each visible as asset (asset.id)}
        <MediaItem {asset} onAdd={addToTimeline} onRemove={removeAsset} />
      {:else}
        <li class="empty">
          Arrastra archivos o pulsa <strong>Importar</strong> para añadir vídeo, audio, imágenes, GIF o SVG.
        </li>
      {/each}
    </ul>
  </div>

  <StickerPicker />
</section>

<style>
  .filters {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 8px 9px;
    border-bottom: 1px solid var(--line);
  }
  .filters input {
    padding: 4px 8px;
    font-size: 12px;
  }
  .filters .row {
    flex-wrap: wrap;
    gap: 4px;
  }
  .chip {
    cursor: pointer;
    padding: 2px 8px;
    font-size: 10.5px;
    letter-spacing: 0.02em;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 6px;
  }
  .empty {
    padding: 20px 12px;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--txt-2);
    text-align: center;
  }
</style>
