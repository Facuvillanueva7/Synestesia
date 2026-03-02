export interface TransportState {
  bpm: number;
  running: boolean;
  swing: number;
  numerator: number;
  denominator: 4 | 8 | 16;
  division: number;
  triplet: boolean;
  phase: number;
  barPhase: number;
  beatIndex: number;
  barCount: number;
  onBeat: boolean;
  onBar: boolean;
  onStep: boolean;
}

export class VisualTransport {
  state: TransportState = {
    bpm: 120,
    running: true,
    swing: 0,
    numerator: 4,
    denominator: 4,
    division: 4,
    triplet: false,
    phase: 0,
    barPhase: 0,
    beatIndex: 0,
    barCount: 0,
    onBeat: false,
    onBar: false,
    onStep: false
  };
  private elapsedBeats = 0;
  private lastBeatFloor = 0;
  private lastStepFloor = 0;
  private taps: number[] = [];

  update(dt: number) {
    this.state.onBeat = false;
    this.state.onBar = false;
    this.state.onStep = false;
    if (!this.state.running) return this.state;
    this.elapsedBeats += dt * (this.state.bpm / 60);
    const beatFloor = Math.floor(this.elapsedBeats);
    if (beatFloor > this.lastBeatFloor) {
      this.state.onBeat = true;
      this.state.beatIndex = beatFloor % this.state.numerator;
      if (this.state.beatIndex === 0) {
        this.state.onBar = true;
        this.state.barCount += 1;
      }
      this.lastBeatFloor = beatFloor;
    }
    const beatPhase = this.elapsedBeats % 1;
    const swingOffset = this.state.swing * 0.6 * (this.state.beatIndex % 2 === 1 ? 1 : -1);
    this.state.phase = (beatPhase + swingOffset + 1) % 1;
    this.state.barPhase = ((this.elapsedBeats % this.state.numerator) / this.state.numerator + 1) % 1;
    const stepsPerBeat = this.state.triplet ? (this.state.division * 2) / 3 : this.state.division;
    const stepFloor = Math.floor(this.elapsedBeats * stepsPerBeat);
    if (stepFloor > this.lastStepFloor) {
      this.state.onStep = true;
      this.lastStepFloor = stepFloor;
    }
    return this.state;
  }

  tapTempo(nowMs: number) {
    this.taps.push(nowMs);
    if (this.taps.length > 8) this.taps.shift();
    if (this.taps.length < 4) return this.state.bpm;
    const intervals = this.taps.slice(1).map((t, i) => t - this.taps[i]);
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const filtered = intervals.filter((v) => Math.abs(v - avg) / avg < 0.25);
    const bpm = 60000 / (filtered.reduce((a, b) => a + b, 0) / filtered.length);
    this.state.bpm = Math.min(240, Math.max(20, bpm));
    return this.state.bpm;
  }
}
