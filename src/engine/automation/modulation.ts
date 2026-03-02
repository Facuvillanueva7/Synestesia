import { AudioFeatures } from '../audio/features';

export type LfoWave = 'sine' | 'triangle' | 'square' | 'saw' | 'random-step' | 'noise';
export interface LfoLane {
  id: string;
  wave: LfoWave;
  rateHz: number;
  depth: number;
  offset: number;
  phase: number;
  smoothing: number;
}
export interface AudioMapping {
  targetKey: string;
  source: 'rms' | 'bass' | 'centroid' | 'flux' | 'onset';
  amount: number;
  curve: 'linear' | 'exp';
  clamp?: [number, number];
}

export const evalLfo = (lane: LfoLane, time: number): number => {
  const p = time * lane.rateHz + lane.phase;
  const frac = p - Math.floor(p);
  let raw = 0;
  switch (lane.wave) {
    case 'sine': raw = Math.sin(frac * Math.PI * 2); break;
    case 'triangle': raw = 1 - 4 * Math.abs(frac - 0.5); break;
    case 'square': raw = frac < 0.5 ? 1 : -1; break;
    case 'saw': raw = frac * 2 - 1; break;
    case 'random-step': raw = Math.sin(Math.floor(p) * 12.9898) * 43758.5453 % 2 - 1; break;
    case 'noise': raw = Math.sin(p * 17.17) * Math.cos(p * 23.31); break;
  }
  return lane.offset + raw * lane.depth;
};

export const resolveAudioMapping = (mapping: AudioMapping, features: AudioFeatures): number => {
  const source = mapping.source === 'bass' ? features.bands.bass : (features as any)[mapping.source];
  const curved = mapping.curve === 'exp' ? source * source : source;
  let value = curved * mapping.amount;
  if (mapping.clamp) value = Math.min(mapping.clamp[1], Math.max(mapping.clamp[0], value));
  return value;
};
