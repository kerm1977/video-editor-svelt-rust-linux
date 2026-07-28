import { get } from 'svelte/store';
import type { ProjectFile } from './types';
import { assets, markers, project, setStatus, timeline } from './state';
import { call, isTauri } from '../tauri/bridge';
import { clearHistory } from './history';
import { open, save } from '@tauri-apps/plugin-dialog';

export interface ProjectSummary {
  id: number;
  name: string;
  updated_at: string;
}

const VGPROJ_EXT = 'vgproj';

const snapshot = (): ProjectFile => ({
  meta: get(project),
  assets: get(assets),
  timeline: get(timeline),
  markers: get(markers)
});

const hydrateProject = (data: ProjectFile, fileId: number | null = null): void => {
  project.set({ ...data.meta, id: data.meta.id ?? fileId });
  assets.set(data.assets);
  timeline.set(data.timeline);
  markers.set(data.markers ?? []);
  clearHistory();
};

/** Persiste el proyecto completo en SQLite (backend Rust). */
export const saveProject = async (): Promise<number | null> => {
  const data = snapshot();
  setStatus('Guardando proyecto…');
  const id = await call<number>('save_project', {
    id: data.meta.id,
    name: data.meta.name,
    payload: JSON.stringify(data)
  });
  if (id !== null) project.update((p) => ({ ...p, id }));
  setStatus(id !== null ? 'Proyecto guardado' : 'No se pudo guardar (sin backend)');
  return id;
};

export const listProjects = async (): Promise<ProjectSummary[]> =>
  (await call<ProjectSummary[]>('list_projects')) ?? [];

/** Carga un proyecto desde SQLite y reemplaza el estado del editor. */
export const loadProject = async (id: number): Promise<boolean> => {
  const raw = await call<string>('load_project', { id });
  if (!raw) {
    setStatus('Proyecto no encontrado');
    return false;
  }
  const data = JSON.parse(raw) as ProjectFile;
  hydrateProject(data, id);
  setStatus(`Proyecto cargado: ${data.meta.name}`);
  return true;
};

/** Guarda el proyecto actual en un archivo externo .vgproj. */
export const saveProjectAsFile = async (): Promise<void> => {
  if (!isTauri()) {
    setStatus('Guardar como archivo disponible solo en la app de escritorio');
    return;
  }
  const path = await save({
    defaultPath: `${get(project).name}.${VGPROJ_EXT}`,
    filters: [{ name: 'Proyecto VideoGuru', extensions: [VGPROJ_EXT] }]
  });
  if (!path) return;
  const payload = JSON.stringify(snapshot());
  const result = await call<void>('save_project_file', { path, payload });
  setStatus(result !== null ? `Proyecto guardado en ${path}` : 'No se pudo guardar el archivo');
};

/** Abre un proyecto desde un archivo externo .vgproj. */
export const openProjectFile = async (): Promise<boolean> => {
  if (!isTauri()) {
    setStatus('Abrir archivo disponible solo en la app de escritorio');
    return false;
  }
  const path = await open({
    filters: [{ name: 'Proyecto VideoGuru', extensions: [VGPROJ_EXT] }],
    multiple: false
  });
  if (!path || Array.isArray(path)) return false;
  setStatus('Abriendo proyecto…');
  const raw = await call<string>('load_project_file', { path });
  if (!raw) {
    setStatus('No se pudo abrir el archivo');
    return false;
  }
  const data = JSON.parse(raw) as ProjectFile;
  hydrateProject(data, null);
  setStatus(`Proyecto abierto: ${data.meta.name}`);
  return true;
};

export const deleteProject = async (id: number): Promise<void> => {
  await call('delete_project', { id });
  setStatus('Proyecto eliminado');
};

/** Exporta la línea de tiempo a un archivo de vídeo mediante FFmpeg. */
export const exportProject = async (outputPath: string): Promise<string | null> => {
  setStatus('Renderizando…');
  const result = await call<string>('render_timeline', {
    payload: JSON.stringify(snapshot()),
    output: outputPath
  });
  setStatus(result ? `Exportado a ${result}` : 'Render no disponible sin backend');
  return result;
};

export const renameProject = (name: string): void =>
  project.update((p) => ({ ...p, name }));

export const setResolution = (width: number, height: number, fps: number): void =>
  project.update((p) => ({ ...p, width, height, fps }));
