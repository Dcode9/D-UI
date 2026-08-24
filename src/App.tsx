import React, { useState, useEffect } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { ControlDock, AppHeader } from './components/ControlDock';

type TextMode = 'fixed' | 'sweep';

export const App: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [textMode, setTextMode] = useState<TextMode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(18);
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [oppositeGlowStrength, setOppositeGlowStrength] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);

  const handleSelectText = (t: string) => {
    setSelectedText(t);
    if (t === "'Verse" || t === "D'Verse") {
      setDirection('left-to-right');
      setLightPosition(18);
    } else {
      setDirection('right-to-left');
      setLightPosition(82);
    }
  };

  // Auto Sweep mode
  useEffect(() => {
    if (textMode !== 'sweep') return;

    let animId: number;
    const startTime = performance.now();

    const sweepLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const pos = 50 + 35 * Math.sin(elapsed * 1.2);
      setLightPosition(pos);
      animId = requestAnimationFrame(sweepLoop);
    };

    animId = requestAnimationFrame(sweepLoop);
    return () => cancelAnimationFrame(animId);
  }, [textMode]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-between select-none">
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, #060608 0%, #000000 90%)' }}
      />

      <AppHeader />

      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        <WwdcTextEffect
          text={selectedText}
          direction={direction}
          lightPosition={lightPosition}
          chromaticIntensity={chromaticIntensity}
          bloomStrength={bloomStrength}
          oppositeGlowStrength={oppositeGlowStrength}
          animateIn={true}
        />
      </div>

      <ControlDock
        selectedText={selectedText}
        onSelectText={handleSelectText}
        direction={direction}
        onSetDirection={setDirection}
        onSetLightPosition={setLightPosition}
        textMode={textMode}
        onSetTextMode={setTextMode}
        lightPosition={lightPosition}
        bloomStrength={bloomStrength}
        onSetBloomStrength={setBloomStrength}
        chromaticIntensity={chromaticIntensity}
        onSetChromaticIntensity={setChromaticIntensity}
        oppositeGlowStrength={oppositeGlowStrength}
        onSetOppositeGlowStrength={setOppositeGlowStrength}
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
      />
    </main>
  );
};
