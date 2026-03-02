import { describe, expect, it } from 'vitest';
import { smoothValue } from './features';

describe('smoothValue', () => {
  it('uses attack for rising signal', () => {
    const v = smoothValue(0, 1, { attack: 0.01, release: 1 }, 0.1);
    expect(v).toBeGreaterThan(0.9);
  });

  it('uses release for falling signal', () => {
    const v = smoothValue(1, 0, { attack: 0.01, release: 1 }, 0.1);
    expect(v).toBeGreaterThan(0.8);
  });
});
