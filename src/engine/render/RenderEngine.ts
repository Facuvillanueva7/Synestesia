import * as THREE from 'three';
import { ScenePlugin, SceneContext } from '@/scenes/types';

export interface RenderQuality { resolutionScale: number; postEnabled: boolean; bloom: number; vignette: number; grain: number; chroma: number; feedback: number; }

export class RenderEngine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  private container: HTMLElement;
  private active?: ScenePlugin;
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private postScene = new THREE.Scene();
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private postMat: THREE.ShaderMaterial;
  quality: RenderQuality = { resolutionScale: 1, postEnabled: true, bloom: 0.2, vignette: 0.3, grain: 0.03, chroma: 0.002, feedback: 0.82 };

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    container.appendChild(this.renderer.domElement);
    this.rtA = new THREE.WebGLRenderTarget(16, 16);
    this.rtB = new THREE.WebGLRenderTarget(16, 16);
    this.postMat = new THREE.ShaderMaterial({
      uniforms: { tCurrent: { value: null }, tPrev: { value: null }, uVignette: { value: 0.3 }, uGrain: { value: 0.03 }, uChroma: { value: 0.002 }, uFeedback: { value: 0.8 }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `varying vec2 vUv;uniform sampler2D tCurrent;uniform sampler2D tPrev;uniform float uVignette;uniform float uGrain;uniform float uChroma;uniform float uFeedback;uniform float uTime;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+uTime)*43758.5453);} 
      void main(){vec2 c=vUv-0.5;float d=dot(c,c);vec2 off=normalize(c+1e-5)*uChroma*d;
      vec3 col=vec3(texture2D(tCurrent,vUv+off).r,texture2D(tCurrent,vUv).g,texture2D(tCurrent,vUv-off).b);
      vec3 prev=texture2D(tPrev,vUv).rgb;col=mix(col,prev,uFeedback);col*=1.0-uVignette*d*2.0;col+=(hash(vUv)-0.5)*uGrain;gl_FragColor=vec4(col,1.);}`
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  switchScene(next: ScenePlugin) {
    if (this.active) this.active.dispose(this.makeCtx());
    this.scene.clear();
    this.active = next;
    next.init(this.makeCtx());
  }

  makeCtx(): SceneContext {
    const size = this.renderer.getSize(new THREE.Vector2());
    return { renderer: this.renderer, threeScene: this.scene, camera: this.camera, gl: this.renderer.getContext(), size: { width: size.x, height: size.y } };
  }

  render(update: () => void, time: number) {
    update();
    if (this.quality.postEnabled) {
      this.postMat.uniforms.uVignette.value = this.quality.vignette;
      this.postMat.uniforms.uGrain.value = this.quality.grain;
      this.postMat.uniforms.uChroma.value = this.quality.chroma;
      this.postMat.uniforms.uFeedback.value = this.quality.feedback;
      this.postMat.uniforms.uTime.value = time;
      this.renderer.setRenderTarget(this.rtA);
      this.renderer.render(this.scene, this.camera);
      this.postMat.uniforms.tCurrent.value = this.rtA.texture;
      this.postMat.uniforms.tPrev.value = this.rtB.texture;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCam);
      [this.rtA, this.rtB] = [this.rtB, this.rtA];
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.rtA.setSize(w, h);
    this.rtB.setSize(w, h);
  }
}
