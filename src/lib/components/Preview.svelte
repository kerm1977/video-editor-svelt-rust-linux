<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import IconButton from './IconButton.svelte';
  import PreviewOverlay from './PreviewOverlay.svelte';
  import PreviewControls from './PreviewControls.svelte';
  import { assets, guides, playhead, previewScale, project } from '../editor/state';
  import {
    activeVideoClip,
    clipLocalTime,
    fitPreview,
    overlayClips,
    toggleGuide,
    toggleGuides
  } from '../editor/preview';
  import { attachVideoElement } from '../editor/player';
  import { assetUrl } from '../tauri/bridge';

  let stage: HTMLDivElement;
  let video: HTMLVideoElement | undefined;
  let failed = false;

  $: clip = $activeVideoClip;
  $: asset = clip ? $assets.find((a) => a.id === clip.assetId) : undefined;
  $: src = asset?.inline ?? (asset?.path ? assetUrl(asset.path) : '');
  $: if (src) failed = false;
  $: attachVideoElement(video ?? null);
  $: if (video && clip) syncFrame(clip, $playhead);

  /** Alinea el fotograma mostrado con la posición global del cabezal. */
  const syncFrame = (activeClip: typeof clip, time: number) => {
    if (!video || !activeClip || Number.isNaN(video.duration)) return;
    const target = clipLocalTime(activeClip, time);
    if (Math.abs(video.currentTime - target) > 0.2) video.currentTime = target;
  };

  let observer: ResizeObserver | null = null;

  const refit = () => {
    if (!stage) return;
    fitPreview(stage.clientWidth - 28, stage.clientHeight - 28);
  };

  $: if (stage && ($project.width || $project.height)) refit();

  onMount(() => {
    refit();
    observer = new ResizeObserver(refit);
    if (stage) observer.observe(stage);
  });

  onDestroy(() => {
    attachVideoElement(null);
    observer?.disconnect();
  });
</script>

<section class="panel">
  <div class="panel-head">
    <span>Previsualización</span>
    <div class="row">
      <IconButton icon="fit" size="sm" label="Ajustar a la ventana" onClick={refit} />
      <IconButton icon="grid" size="sm" label="Líneas de seguridad (G)" active={$guides.enabled} onClick={toggleGuides} />
      <button class="chip" class:active={$guides.thirds} on:click={() => toggleGuide('thirds')}>Tercios</button>
      <button class="chip" class:active={$guides.center} on:click={() => toggleGuide('center')}>Centro</button>
      <button class="chip" class:active={$guides.titleSafe} on:click={() => toggleGuide('titleSafe')}>Title</button>
      <button class="chip" class:active={$guides.actionSafe} on:click={() => toggleGuide('actionSafe')}>Action</button>
    </div>
  </div>

  <div class="stage" bind:this={stage}>
    <div
      class="canvas"
      style="width:{$project.width * $previewScale}px;height:{$project.height * $previewScale}px"
    >
      {#if asset && asset.kind === 'video' && !failed}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          bind:this={video}
          {src}
          muted
          playsinline
          preload="auto"
          on:loadedmetadata={() => clip && syncFrame(clip, $playhead)}
          on:error={() => (failed = true)}
        ></video>
      {:else if asset && asset.kind !== 'video'}
        <img src={asset.inline ?? assetUrl(asset.path)} alt={asset.name} />
      {:else if failed && asset}
        <div class="empty">No se pudo decodificar <b>{asset.name}</b> en el visor</div>
      {:else}
        <div class="empty">Sin contenido bajo el cabezal</div>
      {/if}

      {#each $overlayClips as sticker (sticker.id)}
        <img class="sticker" src={sticker.inline ?? sticker.thumbnail ?? ''} alt={sticker.name} />
      {/each}

      <PreviewOverlay />
    </div>
  </div>

  <PreviewControls />
</section>

<style>
  .stage {
    flex: 1;
    display: grid;
    place-items: center;
    min-height: 0;
    padding: 12px;
    background: radial-gradient(circle at 50% 40%, #16161a 0%, #0d0d0f 80%);
  }
  .canvas {
    position: relative;
    background: #000;
    border: 1px solid var(--line);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }
  video,
  .canvas > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .sticker {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 22%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .empty {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--txt-2);
    font-size: 12.5px;
  }
  .chip {
    cursor: pointer;
    text-transform: none;
  }
</style>
