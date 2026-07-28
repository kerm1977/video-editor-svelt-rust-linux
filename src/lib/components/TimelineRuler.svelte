<script lang="ts">
  import { pixelsPerSecond, project } from '../editor/state';
  import { formatTime, rulerStep } from '../editor/timeline';
  import { seekTo } from '../editor/player';

  export let duration: number;
  export let labelWidth = 148;

  $: pps = $pixelsPerSecond;
  $: step = rulerStep(pps);
  $: ticks = Array.from({ length: Math.ceil(duration / step) + 1 }, (_, i) => i * step);
  $: subTicks = Array.from({ length: Math.ceil(duration / (step / 4)) + 1 }, (_, i) => (i * step) / 4);

  const scrub = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    seekTo((e.clientX - rect.left) / pps);
  };

  const onDrag = (e: MouseEvent) => {
    if (e.buttons === 1) scrub(e);
  };
</script>

<div class="ruler-row" style="--label-w:{labelWidth}px">
  <div class="corner">{formatTime(duration, $project.fps)}</div>
  <div
    class="ruler"
    role="slider"
    tabindex="0"
    aria-label="Regla de tiempo"
    aria-valuenow={0}
    style="width:{duration * pps}px"
    on:mousedown={scrub}
    on:mousemove={onDrag}
  >
    {#each subTicks as t (t)}
      <div class="sub" style="left:{t * pps}px"></div>
    {/each}
    {#each ticks as t (t)}
      <div class="tick" style="left:{t * pps}px">
        <span>{formatTime(t, $project.fps).slice(0, 5)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .ruler-row {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 30;
    background: var(--bg-2);
    border-bottom: 1px solid var(--line);
  }
  .corner {
    position: sticky;
    left: 0;
    z-index: 36;
    flex: 0 0 var(--label-w);
    display: grid;
    place-items: center;
    height: 32px;
    font-size: 11px;
    color: var(--txt-2);
    background: var(--bg-2);
    border-right: 1px solid var(--line);
    font-variant-numeric: tabular-nums;
  }
  .ruler {
    position: relative;
    height: 32px;
    cursor: ew-resize;
  }
  .tick {
    position: absolute;
    top: 0;
    height: 100%;
    border-left: 1px solid #4a4a52;
    padding-left: 5px;
  }
  .tick span {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--txt-1);
    font-variant-numeric: tabular-nums;
  }
  .sub {
    position: absolute;
    bottom: 0;
    height: 8px;
    border-left: 1px solid #35353c;
  }
</style>
