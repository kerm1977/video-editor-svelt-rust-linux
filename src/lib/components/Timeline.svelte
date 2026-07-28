<script lang="ts">
  import TimelineRuler from './TimelineRuler.svelte';
  import TimelineTrack from './TimelineTrack.svelte';
  import Playhead from './Playhead.svelte';
  import TimelineMarkers from './TimelineMarkers.svelte';
  import Toolbar from './Toolbar.svelte';
  import { pixelsPerSecond, playhead, timeline, timelineDuration } from '../editor/state';
  import { clearSelection } from '../editor/actions';
  import { zoomBy } from '../editor/timeline';

  const LABEL_W = 148;
  const EDGE = 90;
  let snap = true;
  let scroller: HTMLDivElement;

  $: duration = Math.max($timelineDuration + 10, 30);
  $: if (scroller) followPlayhead($playhead * $pixelsPerSecond);

  /** Mantiene el cabezal dentro del área visible durante la reproducción. */
  const followPlayhead = (x: number) => {
    const view = scroller.clientWidth - LABEL_W;
    const left = scroller.scrollLeft;
    if (x < left + EDGE) scroller.scrollLeft = Math.max(0, x - EDGE);
    else if (x > left + view - EDGE) scroller.scrollLeft = x - view + EDGE;
  };

  const onWheel = (e: WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89);
  };
</script>

<section class="panel timeline">
  <div class="panel-head">
    <span>Línea de tiempo</span>
    <span class="chip">{Math.round($pixelsPerSecond)} px/s</span>
  </div>

  <div
    class="scroll"
    role="presentation"
    bind:this={scroller}
    on:wheel={onWheel}
    on:mousedown={(e) => e.target === scroller && clearSelection()}
  >
    <div class="inner" style="width:{duration * $pixelsPerSecond + LABEL_W}px">
      <TimelineRuler {duration} labelWidth={LABEL_W} />
      <TimelineMarkers labelWidth={LABEL_W} />
      {#each $timeline.tracks as track (track.id)}
        <TimelineTrack {track} {duration} labelWidth={LABEL_W} {snap} />
      {/each}
      <Playhead labelWidth={LABEL_W} />
    </div>
  </div>

  <div class="floating">
    <Toolbar bind:snap onToggleSnap={() => (snap = !snap)} />
  </div>
</section>

<style>
  .timeline {
    position: relative;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background: var(--bg-1);
  }
  .inner {
    position: relative;
    min-width: 100%;
    padding-bottom: 62px;
  }
  .floating {
    position: absolute;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    z-index: 40;
  }
</style>
