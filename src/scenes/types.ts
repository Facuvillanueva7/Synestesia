import * as THREE from 'three';
import { AudioFeatures } from '@/engine/audio/features';
import { ParamSchema, ParamValues } from '@/engine/params/schema';
import { TransportState } from '@/engine/transport/VisualTransport';
import { ThemeTokens } from '@/engine/themes/theme';

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  threeScene: THREE.Scene;
  camera: THREE.Camera;
  gl: WebGLRenderingContext;
  size: { width: number; height: number };
}

export interface SceneUpdateContext extends SceneContext {
  dt: number;
  time: number;
  audioFeatures: AudioFeatures;
  transport: TransportState;
  params: ParamValues;
  theme: ThemeTokens;
  automation: Record<string, number>;
}

export interface ScenePlugin {
  id: string;
  name: string;
  description: string;
  params: ParamSchema;
  init(ctx: SceneContext): Promise<void> | void;
  update(ctx: SceneUpdateContext): void;
  resize?(ctx: SceneContext): void;
  dispose(ctx: SceneContext): void;
}
