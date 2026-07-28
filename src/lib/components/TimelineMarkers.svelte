<script lang="ts">
  import { markers, pixelsPerSecond } from '../editor/state';
  import { removeMarker } from '../editor/actions';
  import { formatTime } from '../editor/timeline';

  export let labelWidth = 148;

  $: positions = $markers.map((m) => ({
    ...m,
    x: m.time * $pixelsPerSecond + labelWidth
  }));
</script>

<div class="markers" role="list" aria-label="Marcas">
  {#each positions as marker (marker.id)}
    <button
      class="marker"
      style="transform: translateX({marker.x}px);"
      title="{marker.label} — {formatTime(marker.time)} — click para borrar"
      on:click={() => removeMarker(marker.id)}
    >
      <span class="arrow" style="border-color: {marker.color};"></span>
      <span class="label">{marker.label}</span>
    </button>
  {/each}
</div>

<style>
  .markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 35;
  }
  .marker {
    position: absolute;
    top: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
    background: transparent;
    border: none;
    padding: 0;
    margin-left: -8px;
  }
  .arrow {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid var(--accent);
  }
  .label {
    margin-top: 2px;
    font-size: 10px;
    color: var(--accent);
    background: rgba(15, 20, 30, 0.9);
    padding: 1px 4px;
    border-radius: 4px;
    white-space: nowrap;
    border: 1px solid #fff2;
  }
</style>
