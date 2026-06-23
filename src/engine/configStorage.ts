import type { ConfigExport, SavedConfig, TableConfig } from '../types';

// Prefixed key — on GitHub Pages, localStorage is shared across the entire
// origin (https://patbed8.github.io), so the prefix avoids collisions with
// other projects hosted under the same account.
const STORAGE_KEY = 'ttgc:savedConfigs';

export function isStorageAvailable(): boolean {
  try {
    const probe = '__ttgc_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readAll(): SavedConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedConfig[]) : [];
  } catch {
    return [];
  }
}

function writeAll(configs: SavedConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function listConfigs(): SavedConfig[] {
  return readAll();
}

export function getConfig(id: string): SavedConfig | null {
  return readAll().find(c => c.id === id) ?? null;
}

export function saveConfig(name: string, config: TableConfig): SavedConfig {
  const now = new Date().toISOString();
  const entry: SavedConfig = { id: crypto.randomUUID(), name, createdAt: now, updatedAt: now, config };
  writeAll([...readAll(), entry]);
  return entry;
}

export function updateConfig(id: string, patch: { name?: string; config?: TableConfig }): SavedConfig | null {
  const all = readAll();
  const idx = all.findIndex(c => c.id === id);
  if (idx < 0) return null;
  const updated: SavedConfig = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  const next = [...all];
  next[idx] = updated;
  writeAll(next);
  return updated;
}

export function deleteConfig(id: string): void {
  writeAll(readAll().filter(c => c.id !== id));
}

// ── Export / Import ───────────────────────────────────────────────────────────

export function buildExport(configs: SavedConfig[]): ConfigExport {
  return { app: 'tt-game-creator', schema: 1, exportedAt: new Date().toISOString(), configs };
}

export function downloadConfigs(configs: SavedConfig[], filename?: string): void {
  const blob = new Blob([JSON.stringify(buildExport(configs), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  if (!filename) {
    if (configs.length === 1) {
      const slug = configs[0].name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40);
      filename = `ttgc-config_${slug}.json`;
    } else {
      filename = `ttgc-configs_${new Date().toISOString().slice(0, 10)}.json`;
    }
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): SavedConfig[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Fichier invalide — JSON malformé / Invalid file — malformed JSON');
  }

  const d = data as Record<string, unknown>;
  if (!d || d['app'] !== 'tt-game-creator' || d['schema'] !== 1) {
    throw new Error('Fichier invalide — format non reconnu / Invalid file — unrecognized format');
  }

  const configs = d['configs'];
  if (!Array.isArray(configs)) {
    throw new Error('Fichier invalide — liste de configurations manquante / Invalid file — missing configs list');
  }

  const now = new Date().toISOString();
  return configs.map((c: unknown, i: number) => {
    if (typeof c !== 'object' || !c) {
      throw new Error(`Config ${i + 1} invalide / Config ${i + 1} invalid`);
    }
    const entry = c as Record<string, unknown>;
    if (typeof entry['name'] !== 'string' || !entry['name'].trim()) {
      throw new Error(`Config ${i + 1} : nom manquant / Config ${i + 1}: missing name`);
    }
    const cfg = entry['config'] as Record<string, unknown> | null;
    if (
      !cfg || typeof cfg !== 'object' ||
      !Array.isArray(cfg['dice']) ||
      typeof cfg['board'] !== 'object' ||
      !Array.isArray(cfg['decks']) ||
      !Array.isArray(cfg['pawns']) ||
      typeof cfg['players'] !== 'number'
    ) {
      throw new Error(`Config ${i + 1} : données incomplètes / Config ${i + 1}: incomplete data`);
    }
    return {
      id: crypto.randomUUID(),
      name: (entry['name'] as string).trim(),
      createdAt: now,
      updatedAt: now,
      config: cfg as unknown as TableConfig,
    };
  });
}
