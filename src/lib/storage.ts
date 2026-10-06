import { Project, EditorSettings } from '../types';
import { DEFAULT_PROJECTS } from './templates';

const PROJECTS_STORAGE_KEY = 'bilzx_codex_projects_v1';
const SETTINGS_STORAGE_KEY = 'bilzx_codex_settings_v1';
const ACTIVE_PROJECT_KEY = 'bilzx_codex_active_proj_v1';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load projects from storage:', e);
  }
  return DEFAULT_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage:', e);
  }
}

export function loadActiveProjectId(availableProjects: Project[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (saved && availableProjects.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return availableProjects[0]?.id || 'project-nodejs-quickstart';
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch {
    // ignore
  }
}

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  theme: 'neo-dark',
  tabSize: 2,
  wordWrap: 'on',
  minimap: false,
  lineNumbers: 'on',
};

export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
