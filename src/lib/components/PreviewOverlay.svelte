<script lang="ts">
  import { guides } from '../editor/state';
  import { safeAreas } from '../editor/preview';

  $: settings = $guides;
  $: areas = safeAreas(settings);
</script>

{#if settings.enabled}
  <svg class="overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    {#if settings.thirds}
      <g class="thirds">
        <line x1="33.33" y1="0" x2="33.33" y2="100" />
        <line x1="66.66" y1="0" x2="66.66" y2="100" />
        <line x1="0" y1="33.33" x2="100" y2="33.33" />
        <line x1="0" y1="66.66" x2="100" y2="66.66" />
      </g>
    {/if}

    {#if settings.center}
      <g class="center">
        <line x1="50" y1="46" x2="50" y2="54" />
        <line x1="46" y1="50" x2="54" y2="50" />
      </g>
    {/if}

    {#each areas as area (area.key)}
      <rect
        class={`safe ${area.key}`}
        x={area.inset * 100}
        y={area.inset * 100}
        width={100 - area.inset * 200}
        height={100 - area.inset * 200}
      />
    {/each}
  </svg>
{/if}

<style>
  .overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  line,
  rect {
    vector-effect: non-scaling-stroke;
    fill: none;
  }
  .thirds line {
    stroke: rgba(255, 255, 255, 0.28);
    stroke-width: 1;
  }
  .center line {
    stroke: var(--accent);
    stroke-width: 1.5;
  }
  .safe.action {
    stroke: rgba(76, 194, 255, 0.7);
    stroke-width: 1;
    stroke-dasharray: 6 4;
  }
  .safe.title {
    stroke: rgba(245, 158, 11, 0.8);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }
</style>
