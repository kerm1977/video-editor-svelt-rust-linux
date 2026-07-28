<script lang="ts">
  import { pixelsPerSecond, playhead } from '../editor/state';
  import { seekTo } from '../editor/player';

  export let labelWidth = 148;

  $: x = $playhead * $pixelsPerSecond + labelWidth;

  const startDrag = (e: MouseEvent) => {
    const originX = e.clientX;
    const originTime = $playhead;
    const pps = $pixelsPerSecond;
    const onMove = (ev: MouseEvent) => seekTo(originTime + (ev.clientX - originX) / pps);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
</script>

<div class="playhead" style="transform:translateX({x}px)">
  <button class="grip" aria-label="Arrastrar cabezal" on:mousedown={startDrag}></button>
  <div class="line"></div>
</div>

<style>
  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }
  .grip {
    position: sticky;
    top: 38px;
    flex: none;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    border-radius: 4px 4px 8px 8px;
    background: var(--accent);
    border: 1px solid #fff3;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.75);
    cursor: ew-resize;
    pointer-events: auto;
  }
  .line {
    flex: 1;
    width: 2px;
    margin-left: -1px;
    margin-top: -6px;
    background: var(--accent);
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.45);
  }
</style>
