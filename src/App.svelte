<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import TopBar from './lib/components/TopBar.svelte';
  import MediaLibrary from './lib/components/MediaLibrary.svelte';
  import Preview from './lib/components/Preview.svelte';
  import Timeline from './lib/components/Timeline.svelte';
  import Inspector from './lib/components/Inspector.svelte';
  import { registerShortcuts } from './lib/editor/keyboard';
  import { panelSizes, resetLayout } from './lib/editor/layout';
  import type { PanelSizes } from './lib/editor/layout';
  import { setStatus } from './lib/editor/state';

  let unregister: (() => void) | null = null;
  let sizes: PanelSizes = { leftWidth: 290, rightWidth: 250, topHeight: 0.52 };

  panelSizes.subscribe((v) => (sizes = v));

  onMount(() => {
    unregister = registerShortcuts();
  });

  onDestroy(() => unregister?.());

  let dragging: 'left' | 'right' | 'top' | null = null;

  const startDrag = (which: 'left' | 'right' | 'top') => (e: MouseEvent) => {
    e.preventDefault();
    dragging = which;
    document.body.style.cursor = which === 'top' ? 'ns-resize' : 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    if (dragging === 'left') {
      const w = Math.max(200, Math.min(450, e.clientX));
      panelSizes.update((s) => ({ ...s, leftWidth: w }));
    } else if (dragging === 'right') {
      const w = Math.max(180, Math.min(400, window.innerWidth - e.clientX));
      panelSizes.update((s) => ({ ...s, rightWidth: w }));
    } else if (dragging === 'top') {
      const h = Math.max(0.2, Math.min(0.8, e.clientY / window.innerHeight));
      panelSizes.update((s) => ({ ...s, topHeight: h }));
    }
  };

  const onMouseUp = () => {
    if (dragging) {
      dragging = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('vg.panelSizes', JSON.stringify(sizes));
      } catch {
        /* ignore */
      }
    }
  };

  const doReset = () => {
    resetLayout();
    setStatus('Diseño restablecido');
  };
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<div class="app">
  <TopBar onResetLayout={doReset} />
  <main
    style="grid-template-rows: minmax(0, {sizes.topHeight}fr) 5px minmax(220px, {1 - sizes.topHeight}fr);"
  >
    <div
      class="top"
      style="grid-template-columns: {sizes.leftWidth}px 5px minmax(0, 1fr) 5px {sizes.rightWidth}px;"
    >
      <MediaLibrary />
      <div class="resizer-v" on:mousedown={startDrag('left')}></div>
      <Preview />
      <div class="resizer-v" on:mousedown={startDrag('right')}></div>
      <Inspector />
    </div>
    <div class="resizer-h" on:mousedown={startDrag('top')}></div>
    <Timeline />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  main {
    flex: 1;
    display: grid;
    min-height: 0;
  }
  .top {
    display: grid;
    min-height: 0;
  }
  .resizer-v {
    cursor: ew-resize;
    background: transparent;
    z-index: 10;
    transition: background 0.15s;
  }
  .resizer-v:hover {
    background: var(--accent);
  }
  .resizer-h {
    cursor: ns-resize;
    background: transparent;
    z-index: 10;
    transition: background 0.15s;
  }
  .resizer-h:hover {
    background: var(--accent);
  }
  @media (max-width: 1180px) {
    .top {
      grid-template-columns: 250px 5px minmax(0, 1fr) !important;
    }
    .top :global(> :nth-child(4)),
    .top :global(> :nth-child(5)) {
      display: none;
    }
  }
</style>
