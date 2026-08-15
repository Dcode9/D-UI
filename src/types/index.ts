export type ColorThemeId = 'cyan' | 'violet' | 'solar' | 'emerald' | 'tricolor';

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  accent: string;
  gradientText: string;
  badgeBg: string;
  borderGlow: string;
}

export interface OpticsSettings {
  glowIntensity: number; // 0.2 to 2.0
  ambientLight: number; // 0.1 to 1.0
  interactiveLighting: boolean;
  particleDensity: number; // 20 to 120
  pulseSpeed: number; // 0.5 to 2.0
}
