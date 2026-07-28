<script lang="ts">
  import IconButton from './IconButton.svelte';
  import { project, statusMessage } from '../editor/state';
  import {
    exportProject,
    listProjects,
    loadProject,
    openProjectFile,
    saveProject,
    saveProjectAsFile
  } from '../editor/project';
  import type { ProjectSummary } from '../editor/project';

  export let onResetLayout: () => void = () => {};

  let recent: ProjectSummary[] = [];
  let showRecent = false;

  const openRecent = async () => {
    recent = await listProjects();
    showRecent = !showRecent;
  };

  const pick = async (id: number) => {
    await loadProject(id);
    showRecent = false;
  };

  const doExport = () => {
    const name = `${$project.name.replace(/\s+/g, '_')}.mp4`;
    void exportProject(name);
  };
</script>

<header class="bar">
  <div class="row brand">
    <span class="dot"></span>
    <strong>VideoGuru</strong>
    <input class="name" bind:value={$project.name} aria-label="Nombre del proyecto" />
    <span class="chip">{$project.width}×{$project.height} · {$project.fps}fps</span>
  </div>

  <div class="row actions">
    <IconButton icon="save" label="Guardar (Ctrl+S)" onClick={() => void saveProject()} />
    <IconButton icon="save" label="Guardar como archivo…" onClick={() => void saveProjectAsFile()} />
    <IconButton icon="folder" label="Abrir archivo de proyecto…" onClick={() => void openProjectFile()} />
    <div class="recent-wrap">
      <IconButton icon="folder" label="Proyectos recientes" onClick={openRecent} active={showRecent} />
      {#if showRecent}
        <ul class="recent">
          {#each recent as p (p.id)}
            <li><button on:click={() => pick(p.id)}>{p.name}<span>{p.updated_at}</span></button></li>
          {:else}
            <li class="empty">Sin proyectos guardados</li>
          {/each}
        </ul>
      {/if}
    </div>
    <IconButton icon="export" label="Exportar vídeo" onClick={doExport}>Exportar</IconButton>
    <button class="reset-btn" title="Restablecer diseño" on:click={onResetLayout}>↺</button>
  </div>

  <div class="status">{$statusMessage}</div>
</header>

<style>
  .bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 12px;
    background: var(--bg-1);
    border-bottom: 1px solid var(--line);
  }
  .brand strong {
    letter-spacing: 0.02em;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
  }
  .name {
    width: 220px;
    background: transparent;
    border-color: transparent;
  }
  .name:hover {
    border-color: var(--line);
  }
  .actions {
    justify-self: center;
  }
  .reset-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    font-size: 16px;
    color: var(--txt-2);
  }
  .reset-btn:hover {
    background: var(--bg-3);
    color: var(--accent);
  }
  .status {
    justify-self: end;
    font-size: 12px;
    color: var(--txt-2);
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .recent-wrap {
    position: relative;
  }
  .recent {
    position: absolute;
    top: 110%;
    left: 0;
    z-index: 40;
    width: 260px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
  .recent button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 7px 9px;
    border-radius: var(--radius-sm);
    font-size: 13px;
  }
  .recent button:hover {
    background: var(--bg-3);
  }
  .recent span {
    color: var(--txt-2);
    font-size: 11px;
  }
  .empty {
    padding: 8px;
    color: var(--txt-2);
    font-size: 12px;
  }
</style>
