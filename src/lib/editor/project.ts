import { get } from 'svelte/store';
import type { ProjectFile } from './types';
import { assets, project, setStatus, timeline } from './state';
import { call } from '../tauri/bridge';
import { clearHistory } from './history';

export interface ProjectSummary {
  id: number;
  name: string;
  updated_at: string;
}

const snapshot = (): ProjectFile => ({
  meta: get(project),
  assets: get(assets),
  timeline: get(timeline)
});

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
  project.set({ ...data.meta, id });
  assets.set(data.assets);
  timeline.set(data.timeline);
  clearHistory();
  setStatus(`Proyecto cargado: ${data.meta.name}`);
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
