<script lang="ts">
  import EmojiGrid from './EmojiGrid.svelte';
  import StickerShelf from './StickerShelf.svelte';
  import { SVG_SHAPES, addSvgShape } from '../editor/stickers';

  let tab: 'emoji' | 'svg' | 'mine' = 'emoji';
</script>

<div class="wrap">
  <div class="tabs">
    <button class:active={tab === 'emoji'} on:click={() => (tab = 'emoji')}>Emojis</button>
    <button class:active={tab === 'svg'} on:click={() => (tab = 'svg')}>Formas</button>
    <button class:active={tab === 'mine'} on:click={() => (tab = 'mine')}>Mis stickers</button>
  </div>

  {#if tab === 'emoji'}
    <EmojiGrid />
  {:else if tab === 'svg'}
    <div class="grid svg">
      {#each SVG_SHAPES as shape (shape.name)}
        <button title={shape.name} on:click={() => addSvgShape(shape)}>
          {@html shape.svg}
        </button>
      {/each}
    </div>
  {:else}
    <StickerShelf />
  {/if}
</div>

<style>
  .wrap {
    padding: 8px;
    border-top: 1px solid var(--line);
  }
  .tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
  }
  .tabs button {
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 999px;
    color: var(--txt-2);
  }
  .tabs button.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .grid {
    display: grid;
    gap: 5px;
  }
  .grid.svg {
    grid-template-columns: repeat(4, 1fr);
  }
  .grid button {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    font-size: 18px;
    border-radius: var(--radius-sm);
    background: var(--bg-2);
  }
  .grid button:hover {
    background: var(--bg-3);
    outline: 1px solid var(--accent);
  }
  .grid.svg button :global(svg) {
    width: 26px;
    height: 26px;
  }
</style>
