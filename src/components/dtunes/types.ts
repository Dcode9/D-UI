export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string;
  lyrics?: Array<{ time: number; text: string }>;
  isLiked?: boolean;
  bitrate?: string;
  year?: string;
}

export interface EqualizerBand {
  label: string;
  freq: string;
  value: number; // -12dB to +12dB
}

export type RepeatMode = 'off' | 'all' | 'one';
export type PlayerTab = 'player' | 'queue' | 'lyrics' | 'equalizer';

export const SAMPLE_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: "D'Verse (Optical Resonance)",
    artist: "Dcode9 & WWDC Sound Lab",
    album: "Optical Typography Vol. 1",
    duration: 218, // 3:38
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    bitrate: "24-bit / 96kHz Lossless",
    year: "2026",
    isLiked: true,
    lyrics: [
      { time: 0, text: "Into the smoked obsidian void" },
      { time: 6, text: "A beam of light awakens the glyphs" },
      { time: 14, text: "Specular ridges catch the dusk" },
      { time: 22, text: "Eight needles piercing through the dark" },
      { time: 31, text: "Resonant waves in chromatic bloom" },
      { time: 42, text: "D'Verse alive, breathing in unison" },
      { time: 54, text: "Frequencies sculpt the chiseled glass" },
      { time: 68, text: "Silent dither across the perimeter" },
      { time: 82, text: "Pure acoustic precision, zero friction" },
      { time: 98, text: "The starburst holds the timeless rhythm" },
      { time: 115, text: "Fading into stippled echoes..." }
    ]
  },
  {
    id: 'track-2',
    title: "Stippled Starlight",
    artist: "Maelie Lusson & Mono Craft",
    album: "Club Eight Card Anthology",
    duration: 184, // 3:04
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    bitrate: "Master Hi-Fi",
    year: "2026",
    isLiked: false,
    lyrics: [
      { time: 0, text: "Eight of clubs drawn from the deck" },
      { time: 8, text: "Tactile card on velvet stone" },
      { time: 18, text: "Sub-bass rolling through the needles" },
      { time: 28, text: "Granular dust suspended in air" },
      { time: 40, text: "Hear the optical frequency" },
      { time: 55, text: "Everything aligns in mono bliss" }
    ]
  },
  {
    id: 'track-3',
    title: "Obsidian Horizon",
    artist: "Dcode9 Architecture",
    album: "Fluid Dynamics",
    duration: 252, // 4:12
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    bitrate: "Spatial Hi-Res Audio",
    year: "2026",
    isLiked: true,
    lyrics: [
      { time: 0, text: "Deep sub-harmonic resonance" },
      { time: 12, text: "Light sweeps from left to dock" },
      { time: 25, text: "No latency, pure presence" }
    ]
  }
];
