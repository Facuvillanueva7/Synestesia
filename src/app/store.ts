import { create } from 'zustand';
import { scenes, sceneDefaults } from '@/scenes';
import { themePresets, ThemeTokens } from '@/engine/themes/theme';
import { VisualTransport } from '@/engine/transport/VisualTransport';
import { LfoLane } from '@/engine/automation/modulation';

interface AppState {
  activeScene: string;
  sceneParams: Record<string, Record<string, any>>;
  panelOpen: boolean;
  hudOpen: boolean;
  theme: ThemeTokens;
  transport: VisualTransport;
  lfos: LfoLane[];
  setScene: (id: string) => void;
  setParam: (scene: string, key: string, value: any) => void;
  setTheme: (theme: ThemeTokens) => void;
  togglePanel: () => void;
  toggleHud: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScene: scenes[0].id,
  sceneParams: sceneDefaults,
  panelOpen: true,
  hudOpen: true,
  theme: themePresets.Neutral,
  transport: new VisualTransport(),
  lfos: [
    { id: 'lfo-a', wave: 'sine', rateHz: 0.5, depth: 0.3, offset: 0, phase: 0, smoothing: 0.1 },
    { id: 'lfo-b', wave: 'triangle', rateHz: 1.2, depth: 0.2, offset: 0, phase: 0.1, smoothing: 0.1 }
  ],
  setScene: (activeScene) => set({ activeScene }),
  setParam: (scene, key, value) => set((s) => ({ sceneParams: { ...s.sceneParams, [scene]: { ...s.sceneParams[scene], [key]: value } } })),
  setTheme: (theme) => set({ theme }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  toggleHud: () => set((s) => ({ hudOpen: !s.hudOpen }))
}));
