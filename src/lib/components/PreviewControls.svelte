<script lang="ts">
  import IconButton from './IconButton.svelte';
  import { isPlaying, playhead, previewScale, project, timelineDuration } from '../editor/state';
  import { frameStep, handlePlayPause, seekToEnd, seekToStart } from '../editor/player';
  import { setPreviewScale, zoomPreview } from '../editor/preview';
  import { formatTime } from '../editor/timeline';
</script>

<div class="controls">
  <div class="row">
    <IconButton icon="skipStart" size="sm" label="Inicio (Home)" onClick={seekToStart} />
    <IconButton icon="frameBack" size="sm" label="Fotograma anterior (←)" onClick={() => frameStep(-1)} />
    <IconButton
      icon={$isPlaying ? 'pause' : 'play'}
      size="lg"
      active={$isPlaying}
      label="Reproducir / Pausa (Espacio)"
      onClick={handlePlayPause}
    />
    <IconButton icon="frameNext" size="sm" label="Fotograma siguiente (→)" onClick={() => frameStep(1)} />
    <IconButton icon="skipEnd" size="sm" label="Final (End)" onClick={seekToEnd} />
  </div>

  <div class="time">
    <strong>{formatTime($playhead, $project.fps)}</strong>
    <span>/ {formatTime($timelineDuration, $project.fps)}</span>
  </div>

  <div class="row">
    <IconButton icon="zoomOut" size="sm" label="Reducir vista" onClick={() => zoomPreview(0.8)} />
    <button class="chip" on:click={() => setPreviewScale(1)}>{Math.round($previewScale * 100)}%</button>
    <IconButton icon="zoomIn" size="sm" label="Ampliar vista" onClick={() => zoomPreview(1.25)} />
  </div>
</div>

<style>
  .controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    background: var(--bg-2);
    border-top: 1px solid var(--line);
  }
  .controls > .row:first-child {
    justify-self: start;
  }
  .controls > .row:last-child {
    justify-self: end;
  }
  .time {
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
    font-size: 13px;
  }
  .time strong {
    color: var(--accent);
  }
  .time span {
    color: var(--txt-2);
    font-size: 12px;
  }
  .chip {
    cursor: pointer;
    min-width: 52px;
  }
</style>
