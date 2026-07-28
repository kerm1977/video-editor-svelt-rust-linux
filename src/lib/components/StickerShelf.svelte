<script lang="ts">
  import IconButton from './IconButton.svelte';
  import type { MediaAsset } from '../editor/types';
  import { assets } from '../editor/state';
  import { importStickers, removeAsset } from '../editor/media';
  import { addStickerToTimeline } from '../editor/stickers';

  $: mine = $assets.filter((a: MediaAsset) => a.kind === 'sticker' && a.path);
</script>

<div class="shelf">
  <div class="head">
    <span>Stickers de WhatsApp (.webp), GIF, SVG o PNG</span>
    <IconButton icon="import" size="sm" label="Importar stickers" onClick={() => void importStickers()} />
  </div>

  {#if mine.length}
    <div class="grid">
      {#each mine as sticker (sticker.id)}
        <div class="cell">
          <button title={sticker.name} on:click={() => addStickerToTimeline(sticker)}>
            <img src={sticker.inline ?? sticker.thumbnail ?? ''} alt={sticker.name} />
          </button>
          <button class="del" title="Quitar" on:click={() => removeAsset(sticker.id)}>×</button>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty">Importa tus stickers y aparecerán aquí para arrastrarlos al overlay.</p>
  {/if}
</div>

<style>
  .shelf {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--txt-2);
    line-height: 1.3;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    max-height: 150px;
    overflow-y: auto;
  }
  .cell {
    position: relative;
  }
  .cell > button:first-child {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 7px;
    background: var(--bg-2);
    overflow: hidden;
  }
  .cell > button:first-child:hover {
    outline: 1px solid var(--accent);
  }
  .cell img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .del {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--bg-3);
    color: var(--txt-2);
    font-size: 12px;
    line-height: 1;
    opacity: 0;
  }
  .cell:hover .del {
    opacity: 1;
  }
  .del:hover {
    color: var(--danger);
  }
  .empty {
    margin: 0;
    padding: 12px 4px;
    font-size: 11.5px;
    color: var(--txt-2);
    text-align: center;
  }
</style>
