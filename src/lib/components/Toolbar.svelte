<script lang="ts">
  import IconButton from './IconButton.svelte';
  import { clipboard, selectedClip } from '../editor/state';
  import { handleCopy, handleCut, handleDelete, handleDuplicate, handlePaste } from '../editor/actions';
  import { canRedo, canUndo, handleRedo, handleUndo } from '../editor/history';
  import { addTrack, zoomBy } from '../editor/timeline';

  export let snap = true;
  export let onToggleSnap: () => void = () => {};

  $: hasClip = !!$selectedClip;
</script>

<div class="toolbar">
  <div class="group">
    <IconButton icon="cut" label="Cortar en el playhead (Ctrl+X)" disabled={!hasClip} onClick={handleCut} />
    <IconButton icon="copy" label="Copiar (Ctrl+C)" disabled={!hasClip} onClick={handleCopy} />
    <IconButton icon="paste" label="Pegar (Ctrl+V)" disabled={!$clipboard} onClick={handlePaste} />
    <IconButton icon="duplicate" label="Duplicar (Ctrl+D)" disabled={!hasClip} onClick={handleDuplicate} />
    <IconButton icon="trash" label="Eliminar (Supr)" danger disabled={!hasClip} onClick={() => handleDelete()} />
  </div>

  <span class="sep"></span>

  <div class="group">
    <IconButton icon="undo" label="Deshacer (Ctrl+Z)" disabled={!$canUndo} onClick={handleUndo} />
    <IconButton icon="redo" label="Rehacer (Ctrl+Shift+Z)" disabled={!$canRedo} onClick={handleRedo} />
  </div>

  <span class="sep"></span>

  <div class="group">
    <IconButton icon="magnet" label="Ajuste magnético" active={snap} onClick={onToggleSnap} />
    <IconButton icon="zoomOut" label="Alejar (Ctrl+-)" onClick={() => zoomBy(0.8)} />
    <IconButton icon="zoomIn" label="Acercar (Ctrl++)" onClick={() => zoomBy(1.25)} />
  </div>

  <span class="sep"></span>

  <div class="group">
    <IconButton icon="film" label="Nueva pista de vídeo" onClick={() => addTrack('video')} />
    <IconButton icon="music" label="Nueva pista de audio" onClick={() => addTrack('audio')} />
    <IconButton icon="sticker" label="Nueva pista de overlay" onClick={() => addTrack('overlay')} />
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: rgba(30, 30, 30, 0.92);
    border: 1px solid var(--line);
    border-radius: 999px;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(8px);
  }
  .group {
    display: flex;
    gap: 2px;
  }
  .sep {
    width: 1px;
    height: 20px;
    background: var(--line);
    margin: 0 3px;
  }
</style>
