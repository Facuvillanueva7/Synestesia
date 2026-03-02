export interface AudioFeatures {
  timestamp: number;
  rms: number;
  peak: number;
  centroid: number;
  flux: number;
  onset: boolean;
  bands: Record<'sub' | 'bass' | 'lowMid' | 'highMid' | 'treble', number>;
  spectrum: Float32Array;
  waveform: Float32Array;
}

export interface SmoothingSettings {
  attack: number;
  release: number;
}

export const smoothValue = (
  previous: number,
  next: number,
  settings: SmoothingSettings,
  dt: number
): number => {
  const rising = next > previous;
  const tau = rising ? settings.attack : settings.release;
  const alpha = 1 - Math.exp(-dt / Math.max(0.0001, tau));
  return previous + (next - previous) * alpha;
};
