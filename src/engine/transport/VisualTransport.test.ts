import { describe, expect, it } from 'vitest';
import { VisualTransport } from './VisualTransport';

describe('VisualTransport', () => {
  it('generates beat events', () => {
    const t = new VisualTransport();
    t.state.bpm = 120;
    t.update(0.5);
    expect(t.state.onBeat).toBe(true);
  });

  it('tap tempo clamps range', () => {
    const t = new VisualTransport();
    [0, 500, 1000, 1500, 2000].forEach((ms) => t.tapTempo(ms));
    expect(t.state.bpm).toBeGreaterThan(20);
    expect(t.state.bpm).toBeLessThan(240);
  });
});
