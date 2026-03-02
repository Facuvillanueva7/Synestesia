import * as THREE from 'three';
import { defaultsFromSchema, ParamSchema } from '@/engine/params/schema';
import { ScenePlugin } from './types';

const baseParams: ParamSchema = {
  reactToTransport: { type: 'toggle', label: 'React To Transport', defaultValue: true },
  reactToOnset: { type: 'toggle', label: 'React To Onset', defaultValue: true },
  triggerMix: { type: 'slider', label: 'Trigger Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 }
};

const buildScene = (id: string, name: string, description: string, makeMesh: () => THREE.Object3D, params: ParamSchema): ScenePlugin => {
  let obj: THREE.Object3D;
  return {
    id, name, description, params: { ...baseParams, ...params },
    init(ctx) { obj = makeMesh(); ctx.threeScene.add(obj); (ctx.camera as THREE.PerspectiveCamera).position.z = 4; },
    update({ time, audioFeatures, transport, params }) {
      const mesh = obj as THREE.Mesh;
      const trigger = (params.triggerMix as number) * Number(audioFeatures.onset) + (1 - (params.triggerMix as number)) * Number(transport.onBeat);
      obj.rotation.x += 0.002 + audioFeatures.bands.lowMid * 0.02;
      obj.rotation.y += 0.001 + audioFeatures.bands.highMid * 0.03;
      obj.scale.setScalar(1 + audioFeatures.bands.bass * 0.8 + trigger * 0.2);
      if (mesh.material && 'uniforms' in (mesh.material as any)) {
        const m = mesh.material as THREE.ShaderMaterial;
        if (m.uniforms.uTime) m.uniforms.uTime.value = time;
        if (m.uniforms.uAudio) m.uniforms.uAudio.value = audioFeatures.rms;
      }
    },
    dispose(ctx) { if (obj) { ctx.threeScene.remove(obj); obj.traverse((o) => { const mm = o as THREE.Mesh; mm.geometry?.dispose(); (mm.material as THREE.Material)?.dispose?.(); }); } }
  };
};

const shaderPlane = () => new THREE.Mesh(
  new THREE.PlaneGeometry(6, 6, 128, 128),
  new THREE.ShaderMaterial({
    wireframe: false,
    uniforms: { uTime: { value: 0 }, uAudio: { value: 0 } },
    vertexShader: `uniform float uTime;uniform float uAudio;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float n=sin((p.x+p.y+uTime)*3.)*0.3+sin((p.x-uTime)*7.)*0.12; p.z+=n*(0.5+uAudio*2.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform float uTime;uniform float uAudio;varying vec2 vUv;void main(){vec3 col=0.5+0.5*cos(vec3(0.,2.,4.)+uTime+vUv.xyx*4.+uAudio*2.);gl_FragColor=vec4(col,1.);}`
  })
);

const simple = (geo: THREE.BufferGeometry, color = '#66aaff') => new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 }));

export const scenes: ScenePlugin[] = [
  buildScene('deform-grid', 'Deformable Frequency Grid', 'Plane mesh displaced by oscillator + audio.', shaderPlane, { displacement: { type: 'slider', label: 'Displacement', min: 0, max: 2, step: 0.01, defaultValue: 1 }, smoothing: { type: 'slider', label: 'Smoothing', min: 0, max: 1, step: 0.01, defaultValue: 0.4 }, gridDensity: { type: 'slider', label: 'Grid Density', min: 16, max: 256, step: 1, defaultValue: 128 }, cameraDistance: { type: 'slider', label: 'Camera Dist', min: 2, max: 10, step: 0.1, defaultValue: 4 }, emissive: { type: 'color', label: 'Emissive', defaultValue: '#55ccff' }, emissiveIntensity: { type: 'slider', label: 'Emissive Intensity', min: 0, max: 4, step: 0.05, defaultValue: 1.2 }, paletteA: { type: 'color', label: 'Palette A', defaultValue: '#4fc4ff' }, paletteB: { type: 'color', label: 'Palette B', defaultValue: '#b674ff' } }),
  buildScene('particle-flow', 'Particle Flow Field', 'Points advected by sine/cos field.', () => new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 4500 }, () => (Math.random() - 0.5) * 4), 3)), new THREE.PointsMaterial({ size: 0.03, color: '#ff88cc' })), { particleCount: { type: 'slider', label: 'Particle Count', min: 1000, max: 20000, step: 100, defaultValue: 4500 }, speed: { type: 'slider', label: 'Speed', min: 0, max: 4, step: 0.01, defaultValue: 1 }, fieldScale: { type: 'slider', label: 'Field Scale', min: 0.1, max: 4, step: 0.01, defaultValue: 1.2 }, drag: { type: 'slider', label: 'Drag', min: 0, max: 1, step: 0.01, defaultValue: 0.2 }, spawnRadius: { type: 'slider', label: 'Spawn Radius', min: 0.5, max: 5, step: 0.1, defaultValue: 2.5 }, audioInfluence: { type: 'slider', label: 'Audio Influence', min: 0, max: 2, step: 0.01, defaultValue: 1 }, colorA: { type: 'color', label: 'Color A', defaultValue: '#79ffe1' }, colorB: { type: 'color', label: 'Color B', defaultValue: '#ffd679' } }),
  buildScene('sculpture', 'Pulsing Parametric Sculpture', 'Morphing solid geometry.', () => simple(new THREE.TorusKnotGeometry(1, 0.3, 180, 24), '#73b4ff'), { morphAmount: { type: 'slider', label: 'Morph Amount', min: 0, max: 1, step: 0.01, defaultValue: 0.4 }, roughness: { type: 'slider', label: 'Roughness', min: 0, max: 1, step: 0.01, defaultValue: 0.35 }, metalness: { type: 'slider', label: 'Metalness', min: 0, max: 1, step: 0.01, defaultValue: 0.75 }, rimIntensity: { type: 'slider', label: 'Rim', min: 0, max: 3, step: 0.01, defaultValue: 1 }, beatPunch: { type: 'slider', label: 'Beat Punch', min: 0, max: 2, step: 0.01, defaultValue: 0.7 }, baseGeometry: { type: 'select', label: 'Geometry', defaultValue: 'torusKnot', options: [{ label: 'Torus Knot', value: 'torusKnot' }, { label: 'Icosahedron', value: 'icosahedron' }, { label: 'Torus', value: 'torus' }] }, color: { type: 'color', label: 'Color', defaultValue: '#8ec8ff' } }),
  buildScene('vector-lines', 'Vector Lines / Streamlines', 'Ribbon-like lines twisting through a field.', () => simple(new THREE.TorusGeometry(1.2, 0.55, 16, 120), '#ff9b5e'), { lineCount: { type: 'slider', label: 'Line Count', min: 20, max: 600, step: 1, defaultValue: 180 }, thickness: { type: 'slider', label: 'Thickness', min: 0.01, max: 0.5, step: 0.01, defaultValue: 0.05 }, curvature: { type: 'slider', label: 'Curvature', min: 0, max: 4, step: 0.01, defaultValue: 1.5 }, jitter: { type: 'slider', label: 'Jitter', min: 0, max: 2, step: 0.01, defaultValue: 0.45 }, beatReset: { type: 'toggle', label: 'Beat Reset', defaultValue: true }, trailLength: { type: 'slider', label: 'Trail Length', min: 0.1, max: 10, step: 0.1, defaultValue: 4.2 } }),
  buildScene('glyph-garden', 'SDF Glyph Garden', '2D procedural SDF symbols.', shaderPlane, { shapeMix: { type: 'slider', label: 'Shape Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 }, symmetry: { type: 'slider', label: 'Symmetry', min: 1, max: 12, step: 1, defaultValue: 6 }, warp: { type: 'slider', label: 'Warp', min: 0, max: 2, step: 0.01, defaultValue: 0.6 }, edgeSoftness: { type: 'slider', label: 'Edge Softness', min: 0, max: 0.4, step: 0.01, defaultValue: 0.08 }, paletteRotation: { type: 'slider', label: 'Palette Rotation', min: 0, max: 6.283, step: 0.01, defaultValue: 0.4 }, audioWarp: { type: 'slider', label: 'Audio Warp', min: 0, max: 2, step: 0.01, defaultValue: 0.8 } }),
  buildScene('kaleido-warp', 'Kaleidoscope Warp', 'Procedural mirrored texture reflections.', shaderPlane, { segments: { type: 'slider', label: 'Segments', min: 2, max: 24, step: 1, defaultValue: 8 }, rotationSpeed: { type: 'slider', label: 'Rotation Speed', min: -2, max: 2, step: 0.01, defaultValue: 0.3 }, zoom: { type: 'slider', label: 'Zoom', min: 0.2, max: 3, step: 0.01, defaultValue: 1.1 }, mirrorHardness: { type: 'slider', label: 'Mirror Hardness', min: 0, max: 1, step: 0.01, defaultValue: 0.8 }, bassWobble: { type: 'slider', label: 'Bass Wobble', min: 0, max: 2, step: 0.01, defaultValue: 1.1 } }),
  buildScene('feedback-reactor', 'Feedback Reactor', 'High-energy feedback scene tuned for ping-pong post.', shaderPlane, { feedbackGain: { type: 'slider', label: 'Feedback Gain', min: 0, max: 0.99, step: 0.01, defaultValue: 0.83 }, diffusion: { type: 'slider', label: 'Diffusion', min: 0, max: 4, step: 0.01, defaultValue: 1.2 }, blur: { type: 'slider', label: 'Blur', min: 0, max: 2, step: 0.01, defaultValue: 0.3 }, hueShift: { type: 'slider', label: 'Hue Shift', min: -3.14, max: 3.14, step: 0.01, defaultValue: 0.5 }, threshold: { type: 'slider', label: 'Threshold', min: 0, max: 1, step: 0.01, defaultValue: 0.2 }, beatKick: { type: 'slider', label: 'Beat Kick', min: 0, max: 2, step: 0.01, defaultValue: 0.9 } }),
  buildScene('metaball-illusion', 'Metaball Illusion', 'Procedural blob-like forms.', () => simple(new THREE.SphereGeometry(1.2, 64, 64), '#a3ffcc'), { blobCount: { type: 'slider', label: 'Blob Count', min: 2, max: 20, step: 1, defaultValue: 8 }, viscosity: { type: 'slider', label: 'Viscosity', min: 0, max: 2, step: 0.01, defaultValue: 1.1 }, mergeStrength: { type: 'slider', label: 'Merge Strength', min: 0, max: 3, step: 0.01, defaultValue: 1.4 }, audioSpawn: { type: 'slider', label: 'Audio Spawn', min: 0, max: 2, step: 0.01, defaultValue: 0.8 }, glow: { type: 'slider', label: 'Glow', min: 0, max: 4, step: 0.01, defaultValue: 1.5 } }),
  buildScene('frequency-rings', 'Frequency Rings', 'Radial spectrogram circles.', () => simple(new THREE.TorusGeometry(1.2, 0.12, 16, 128), '#f3eb7a'), { ringCount: { type: 'slider', label: 'Ring Count', min: 3, max: 64, step: 1, defaultValue: 24 }, radialThickness: { type: 'slider', label: 'Radial Thickness', min: 0.01, max: 0.5, step: 0.01, defaultValue: 0.09 }, decay: { type: 'slider', label: 'Decay', min: 0, max: 1, step: 0.01, defaultValue: 0.65 }, rotation: { type: 'slider', label: 'Rotation', min: -2, max: 2, step: 0.01, defaultValue: 0.45 }, bassWeight: { type: 'slider', label: 'Bass Weight', min: 0, max: 2, step: 0.01, defaultValue: 1.1 }, trebleWeight: { type: 'slider', label: 'Treble Weight', min: 0, max: 2, step: 0.01, defaultValue: 0.8 } }),
  buildScene('architectural-blocks', 'Architectural Blocks', 'Instanced blocks stepping on transport.', () => simple(new THREE.BoxGeometry(2.2, 2.2, 2.2, 8, 8, 8), '#77ffb3'), { gridSize: { type: 'slider', label: 'Grid Size', min: 4, max: 30, step: 1, defaultValue: 10 }, seed: { type: 'slider', label: 'Seed', min: 0, max: 9999, step: 1, defaultValue: 42 }, stepPattern: { type: 'select', label: 'Step Pattern', defaultValue: 'euclid', options: [{ label: 'Euclid', value: 'euclid' }, { label: 'Gate', value: 'gate' }, { label: 'Pulse', value: 'pulse' }] }, heightMapAudio: { type: 'slider', label: 'Height from Audio', min: 0, max: 2, step: 0.01, defaultValue: 1 }, cameraDrift: { type: 'slider', label: 'Camera Drift', min: 0, max: 2, step: 0.01, defaultValue: 0.6 }, randomizeSeed: { type: 'button', label: 'Randomize Seed', defaultValue: 'go', action: 'randomizeSeed' } })
];

export const sceneDefaults = Object.fromEntries(scenes.map((s) => [s.id, defaultsFromSchema(s.params)]));
