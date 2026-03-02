import { AudioFeatures, smoothValue } from './features';

export class AudioEngine {
  private context = new AudioContext();
  private analyser = this.context.createAnalyser();
  private gain = this.context.createGain();
  private sourceNode?: MediaElementAudioSourceNode | MediaStreamAudioSourceNode;
  private element?: HTMLAudioElement;
  private freqData: Float32Array;
  private timeData: Float32Array;
  private prevSpectrum: Float32Array;
  private smoothed: AudioFeatures;
  private onsetThreshold = 0.12;
  private lastOnset = 0;

  constructor(fftSize = 2048) {
    this.analyser.fftSize = fftSize;
    this.analyser.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.freqData = new Float32Array(this.analyser.frequencyBinCount);
    this.timeData = new Float32Array(this.analyser.fftSize);
    this.prevSpectrum = new Float32Array(this.analyser.frequencyBinCount);
    this.smoothed = {
      timestamp: 0,
      rms: 0,
      peak: 0,
      centroid: 0,
      flux: 0,
      onset: false,
      bands: { sub: 0, bass: 0, lowMid: 0, highMid: 0, treble: 0 },
      spectrum: new Float32Array(this.analyser.frequencyBinCount),
      waveform: new Float32Array(this.analyser.fftSize)
    };
  }

  async useMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.disconnectSource();
    this.sourceNode = this.context.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);
  }

  async useFile(file: File) {
    this.disconnectSource();
    this.element = new Audio(URL.createObjectURL(file));
    this.element.crossOrigin = 'anonymous';
    this.element.loop = true;
    this.sourceNode = this.context.createMediaElementSource(this.element);
    this.sourceNode.connect(this.analyser);
    await this.context.resume();
    await this.element.play();
  }

  playPause() {
    if (!this.element) return;
    if (this.element.paused) void this.element.play();
    else this.element.pause();
  }
  seek(t: number) {
    if (this.element) this.element.currentTime = t;
  }
  setVolume(v: number) {
    this.gain.gain.value = v;
  }
  getDuration() {
    return this.element?.duration ?? 0;
  }
  getCurrentTime() {
    return this.element?.currentTime ?? 0;
  }

  update(dt: number): AudioFeatures {
    this.analyser.getFloatFrequencyData(this.freqData);
    this.analyser.getFloatTimeDomainData(this.timeData);
    const spectrum = this.smoothed.spectrum;
    let rmsAcc = 0;
    let peak = 0;
    for (let i = 0; i < this.timeData.length; i += 1) {
      const s = this.timeData[i];
      rmsAcc += s * s;
      peak = Math.max(peak, Math.abs(s));
      this.smoothed.waveform[i] = s;
    }
    const rms = Math.sqrt(rmsAcc / this.timeData.length);
    let flux = 0;
    let weighted = 0;
    let sum = 0;
    for (let i = 0; i < this.freqData.length; i += 1) {
      const v = Math.min(1, Math.max(0, (this.freqData[i] + 100) / 100));
      spectrum[i] = smoothValue(spectrum[i], v, { attack: 0.02, release: 0.15 }, dt);
      const d = Math.max(0, spectrum[i] - this.prevSpectrum[i]);
      flux += d;
      this.prevSpectrum[i] = spectrum[i];
      weighted += i * spectrum[i];
      sum += spectrum[i];
    }
    const centroid = sum > 0 ? weighted / sum / this.freqData.length : 0;
    const bandSlice = (a: number, b: number) => {
      let acc = 0;
      const start = Math.floor(a * spectrum.length);
      const end = Math.floor(b * spectrum.length);
      for (let i = start; i < end; i += 1) acc += spectrum[i];
      return acc / Math.max(1, end - start);
    };
    const bands = {
      sub: bandSlice(0, 0.03),
      bass: bandSlice(0.03, 0.08),
      lowMid: bandSlice(0.08, 0.22),
      highMid: bandSlice(0.22, 0.45),
      treble: bandSlice(0.45, 1)
    };
    const now = performance.now();
    const onset = flux > this.onsetThreshold && now - this.lastOnset > 100;
    if (onset) {
      this.lastOnset = now;
      this.onsetThreshold = flux * 1.1;
    }
    this.onsetThreshold = smoothValue(this.onsetThreshold, 0.12, { attack: 1.2, release: 1.2 }, dt);
    this.smoothed.timestamp = now;
    this.smoothed.rms = smoothValue(this.smoothed.rms, rms, { attack: 0.03, release: 0.2 }, dt);
    this.smoothed.peak = peak;
    this.smoothed.centroid = smoothValue(this.smoothed.centroid, centroid, { attack: 0.04, release: 0.2 }, dt);
    this.smoothed.flux = smoothValue(this.smoothed.flux, flux, { attack: 0.01, release: 0.2 }, dt);
    this.smoothed.onset = onset;
    this.smoothed.bands = bands;
    return this.smoothed;
  }

  private disconnectSource() {
    if (this.sourceNode) this.sourceNode.disconnect();
  }
}
