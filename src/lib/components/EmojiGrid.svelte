<script lang="ts">
  import { EMOJI_CATEGORIES, loadRecentEmojis } from '../editor/emoji';
  import { addEmoji } from '../editor/stickers';

  let recent: string[] = loadRecentEmojis();
  let active = EMOJI_CATEGORIES[0].id;
  let query = '';

  $: categories = recent.length
    ? [{ id: 'recent', label: 'Recientes', icon: '🕘', items: recent }, ...EMOJI_CATEGORIES]
    : EMOJI_CATEGORIES;
  $: current = categories.find((c) => c.id === active) ?? categories[0];
  $: items = query
    ? categories
        .filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()))
        .flatMap((c) => c.items)
    : current.items;

  const pick = (emoji: string) => {
    addEmoji(emoji);
    recent = loadRecentEmojis();
  };
</script>

<div class="emoji">
  <input class="search" placeholder="Buscar categoría…" bind:value={query} />

  <div class="cats">
    {#each categories as cat (cat.id)}
      <button
        class:on={!query && current.id === cat.id}
        title={cat.label}
        on:click={() => {
          query = '';
          active = cat.id;
        }}>{cat.icon}</button
      >
    {/each}
  </div>

  <div class="grid">
    {#each items as e, i (e + i)}
      <button title="Insertar {e}" on:click={() => pick(e)}>{e}</button>
    {/each}
  </div>
</div>

<style>
  .emoji {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
  }
  .search {
    padding: 4px 8px;
    font-size: 12px;
  }
  .cats {
    display: flex;
    gap: 2px;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .cats button {
    flex: none;
    width: 26px;
    height: 24px;
    font-size: 14px;
    border-radius: 6px;
    opacity: 0.65;
  }
  .cats button:hover {
    background: var(--bg-3);
    opacity: 1;
  }
  .cats button.on {
    background: var(--accent-soft);
    opacity: 1;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 3px;
    max-height: 150px;
    overflow-y: auto;
    padding-right: 3px;
  }
  .grid button {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    font-size: 17px;
    line-height: 1;
    border-radius: 6px;
  }
  .grid button:hover {
    background: var(--bg-3);
    outline: 1px solid var(--accent);
  }
</style>
