import React from 'react';
import { usePerimeterPhysics } from './hooks/usePerimeterPhysics';
import { VolumetricLight } from './components/VolumetricLight';
import { SpecularText } from './components/SpecularText';

export const App: React.FC = () => {
  // Light physics engine: travels perimeter, accelerates in corners, decelerates at edge centers
  const light = usePerimeterPhysics(1.0);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      {/* 1. Real Light Physics Volumetric Engine (Warm White Edge -> Warm Amber Diffusion) */}
      <VolumetricLight light={light} />

      {/* 2. Specular Typography (Direct Font Edge Highlights, Zero Containers) */}
      <SpecularText light={light} text="'Verse" />
    </main>
  );
};
