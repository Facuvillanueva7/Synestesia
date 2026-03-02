import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RenderEngine } from '@/engine/render/RenderEngine';
import { AudioEngine } from '@/engine/audio/AudioEngine';
import { bindHotkeys } from '@/engine/input/hotkeys';
import { evalLfo } from '@/engine/automation/modulation';
import { scenes } from '@/scenes';
import { useAppStore } from './store';
import { ParamControls } from '@/ui/components/ParamControls';
import { themePresets } from '@/engine/themes/theme';

export const App = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RenderEngine>();
  const activePluginRef = useRef(scenes[0]);
  const audio = useMemo(() => new AudioEngine(2048), []);
  const [fps, setFps] = useState(0);
  const { activeScene, sceneParams, setParam, setScene, panelOpen, togglePanel, hudOpen, toggleHud, theme, setTheme, transport, lfos } = useAppStore();

  useEffect(() => {
    if (!mountRef.current) return;
    const engine = new RenderEngine(mountRef.current);
    engineRef.current = engine;
    engine.scene.add(new THREE.DirectionalLight('#ffffff', 1.1), new THREE.AmbientLight('#6688aa', 0.35));
    engine.switchScene(activePluginRef.current);
    let last = performance.now();
    let frames = 0;
    let sec = 0;
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const features = audio.update(dt);
      const tState = transport.update(dt);
      const ctx = engine.makeCtx();
      const automation = Object.fromEntries(lfos.map((l) => [l.id, evalLfo(l, now / 1000)]));
      activePluginRef.current.update({ ...ctx, dt, time: now / 1000, audioFeatures: features, transport: tState, params: sceneParams[activePluginRef.current.id], theme, automation });
      engine.render(() => {}, now / 1000);
      frames++; sec += dt;
      if (sec > 1) { setFps(frames / sec); frames = 0; sec = 0; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const unbind = bindHotkeys({ p: togglePanel, h: toggleHud, t: () => transport.tapTempo(performance.now()), f: () => document.documentElement.requestFullscreen(), r: () => Object.keys(sceneParams[activeScene]).forEach((k) => setParam(activeScene, k, Math.random())), s: () => { const a = document.createElement('a'); a.href = engine.renderer.domElement.toDataURL('image/png'); a.download = 'snapshot.png'; a.click(); }, ' ': () => (transport.state.running = !transport.state.running), arrowup: () => (transport.state.bpm += 0.1), arrowdown: () => (transport.state.bpm -= 0.1), '1': () => setScene(scenes[0].id), '2': () => setScene(scenes[1].id), '3': () => setScene(scenes[2].id), '4': () => setScene(scenes[3].id), '5': () => setScene(scenes[4].id), '6': () => setScene(scenes[5].id), '7': () => setScene(scenes[6].id), '8': () => setScene(scenes[7].id), '9': () => setScene(scenes[8].id), '0': () => setScene(scenes[9].id) });
    return () => { cancelAnimationFrame(raf); unbind(); };
  }, []);

  useEffect(() => {
    const plugin = scenes.find((s) => s.id === activeScene) ?? scenes[0];
    activePluginRef.current = plugin;
    engineRef.current?.switchScene(plugin);
  }, [activeScene]);

  useEffect(() => {
    document.body.style.background = theme.background;
    document.body.style.color = theme.text;
    document.body.style.fontFamily = theme.fontFamily;
    document.body.style.fontSize = `${theme.fontSize}px`;
  }, [theme]);

  const scene = scenes.find((s) => s.id === activeScene) ?? scenes[0];

  return <div className="app"><div ref={mountRef} className="canvas" />{panelOpen && <aside className="panel"><h2>Prismatic Audio Canvas</h2><section><h3>Scenes</h3>{scenes.map((s) => <button key={s.id} onClick={() => setScene(s.id)}>{s.name}</button>)}</section><section><h3>Audio</h3><button onClick={() => audio.useMicrophone()}>Mic</button><input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && audio.useFile(e.target.files[0])} /></section><section><h3>Transport</h3><input type="range" min={20} max={240} value={transport.state.bpm} onChange={(e) => (transport.state.bpm = Number(e.target.value))} /><button onClick={() => transport.tapTempo(performance.now())}>Tap</button></section><section><h3>Theme</h3><select onChange={(e) => setTheme(themePresets[e.target.value])}>{Object.keys(themePresets).map((k) => <option key={k}>{k}</option>)}</select></section><section><h3>Scene Controls</h3><ParamControls schema={scene.params} values={sceneParams[scene.id]} onChange={(k, v) => setParam(scene.id, k, v)} /></section></aside>}{hudOpen && <div className="hud">{scene.name} | BPM {transport.state.bpm.toFixed(1)} | FPS {fps.toFixed(1)}</div>}</div>;
};
