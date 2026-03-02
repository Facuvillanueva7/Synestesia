export interface ThemeTokens {
  background: string;
  panelBg: string;
  panelBorder: string;
  text: string;
  mutedText: string;
  accent: string;
  accent2: string;
  gridLines: string;
  focusRing: string;
  shadow: string;
  glow: string;
  danger: string;
  success: string;
  fontFamily: string;
  fontSize: number;
  density: number;
  radius: number;
}

export const themePresets: Record<string, ThemeTokens> = {
  Neutral: { background: '#0c1016', panelBg: '#121924cc', panelBorder: '#263348', text: '#e6ecf7', mutedText: '#9bb0ca', accent: '#50b9ff', accent2: '#d062ff', gridLines: '#22314a', focusRing: '#80d3ff', shadow: 'rgba(0,0,0,0.4)', glow: '#65c7ff', danger: '#f15d78', success: '#42d6a7', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, density: 1, radius: 1 },
  'High Contrast': { background: '#020202', panelBg: '#151515dd', panelBorder: '#f3f3f3', text: '#ffffff', mutedText: '#d0d0d0', accent: '#ffee00', accent2: '#00f0ff', gridLines: '#555555', focusRing: '#ffffff', shadow: 'rgba(0,0,0,0.8)', glow: '#ffee00', danger: '#ff3d3d', success: '#2ee76f', fontFamily: 'Arial, sans-serif', fontSize: 15, density: 0.95, radius: 0.6 },
  Soft: { background: '#1f1a2b', panelBg: '#2a2438cc', panelBorder: '#6f6286', text: '#f5f0ff', mutedText: '#beafdb', accent: '#fca5ff', accent2: '#8ad8ff', gridLines: '#4f4368', focusRing: '#ffd6ff', shadow: 'rgba(0,0,0,0.3)', glow: '#f39bff', danger: '#ff6ba1', success: '#7fe9c6', fontFamily: 'Trebuchet MS, sans-serif', fontSize: 14, density: 1.1, radius: 1.2 }
};
