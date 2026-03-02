export type HotkeyMap = Record<string, () => void>;
export const bindHotkeys = (map: HotkeyMap) => {
  const handler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (map[key]) {
      e.preventDefault();
      map[key]();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
};
