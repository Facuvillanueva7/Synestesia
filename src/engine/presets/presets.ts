export const PRESET_KEY = 'pac.presets.v1';
export interface AppPreset { id: string; name: string; state: any; }

export const loadPresets = (): AppPreset[] => {
  try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '[]'); } catch { return []; }
};
export const savePresets = (presets: AppPreset[]) => localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
