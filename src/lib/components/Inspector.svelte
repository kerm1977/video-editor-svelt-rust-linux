<script lang="ts">
  import { playhead, project, selectedClip } from '../editor/state';
  import { updateClipProperty } from '../editor/actions';
  import { formatTime } from '../editor/timeline';
  import { setResolution } from '../editor/project';

  const PRESETS = [
    { label: '1080p 16:9', w: 1920, h: 1080 },
    { label: '4K 16:9', w: 3840, h: 2160 },
    { label: 'Vertical 9:16', w: 1080, h: 1920 },
    { label: 'Cuadrado 1:1', w: 1080, h: 1080 }
  ];

  $: clip = $selectedClip;
</script>

<aside class="panel">
  <div class="panel-head"><span>Inspector</span></div>
  <div class="panel-body">
    {#if clip}
      <div class="block">
        <h4>Clip</h4>
        <p class="title">{clip.name}</p>
        <p class="sub">{clip.kind} · inicio {formatTime(clip.start)} · dur {formatTime(clip.duration)}</p>
      </div>

      <label class="field">
        <span>Opacidad <b>{Math.round(clip.opacity * 100)}%</b></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={clip.opacity}
          on:change={(e) => updateClipProperty(clip.id, 'opacity', +e.currentTarget.value)}
        />
      </label>

      <label class="field">
        <span>Volumen <b>{Math.round(clip.volume * 100)}%</b></span>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={clip.volume}
          on:change={(e) => updateClipProperty(clip.id, 'volume', +e.currentTarget.value)}
        />
      </label>

      <label class="field">
        <span>Nombre</span>
        <input
          value={clip.name}
          on:change={(e) => updateClipProperty(clip.id, 'name', e.currentTarget.value)}
        />
      </label>
    {:else}
      <p class="hint">Selecciona un clip en la línea de tiempo para editar sus propiedades.</p>
    {/if}

    <div class="block">
      <h4>Proyecto</h4>
      <div class="presets">
        {#each PRESETS as p (p.label)}
          <button
            class="chip"
            class:active={$project.width === p.w && $project.height === p.h}
            on:click={() => setResolution(p.w, p.h, $project.fps)}>{p.label}</button
          >
        {/each}
      </div>
      <label class="field">
        <span>FPS</span>
        <select
          value={$project.fps}
          on:change={(e) => setResolution($project.width, $project.height, +e.currentTarget.value)}
        >
          {#each [24, 25, 30, 50, 60] as fps (fps)}<option value={fps}>{fps}</option>{/each}
        </select>
      </label>
      <p class="sub">Cabezal: {formatTime($playhead, $project.fps)}</p>
    </div>
  </div>
</aside>

<style>
  .block {
    padding: 11px;
    border-bottom: 1px solid var(--line);
  }
  h4 {
    margin: 0 0 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--txt-1);
  }
  .title {
    margin: 0 0 3px;
    font-size: 13px;
    font-weight: 600;
    color: var(--txt-0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    margin: 0;
    font-size: 11px;
    color: var(--txt-2);
    font-variant-numeric: tabular-nums;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 9px 11px;
    font-size: 11.5px;
    color: var(--txt-2);
  }
  .field > span {
    letter-spacing: 0.02em;
  }
  .field b {
    color: var(--accent);
    float: right;
  }
  input[type='range'] {
    width: 100%;
    padding: 0;
    background: transparent;
    border: none;
    accent-color: var(--accent);
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 8px 0;
  }
  .chip {
    cursor: pointer;
  }
  .hint {
    padding: 18px 12px;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--txt-2);
    text-align: center;
  }
</style>
