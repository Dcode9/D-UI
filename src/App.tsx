import React, { useState, useCallback } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { LoadingPortalSweep } from './components/LoadingPortalSweep';
import { LabControlsDock } from './components/LabControlsDock';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Text Effect State
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [specularEdgeIntensity, setSpecularEdgeIntensity] = useState<number>(1.2);

  // Loading Animation State
  const [isLoadingAnimationPlaying, setIsLoadingAnimationPlaying] = useState<boolean>(true);
  const [sweepLightPos, setSweepLightPos] = useState<number | undefined>(18);

  // UI Controls Visibility
  const [showControls, setShowControls] = useState<boolean>(true);

  // Handle Preset Switching
  const handleSelectText = (t: string) => {
    setSelectedText(t);
    if (t === "'Verse" || t === "D'Verse") {
      setDirection('left-to-right');
      setSweepLightPos(18);
    } else {
      setDirection('right-to-left');
      setSweepLightPos(82);
    }
  };

  // Handle Direction Change
  const handleDirectionChange = (dir: FlowDirection) => {
    setDirection(dir);
    setSweepLightPos(dir === 'left-to-right' ? 18 : 82);
  };

  // Trigger / Replay Loading Sweep Animation
  const handleReplayAnimation = useCallback(() => {
    setIsLoadingAnimationPlaying(false);
    // Micro-timeout to re-trigger useEffect in LoadingPortalSweep
    setTimeout(() => {
      setIsLoadingAnimationPlaying(true);
    }, 50);
  }, []);

  // Update text effect light position as the loading sweep travels across
  const handleProgressUpdate = useCallback(
    (progress: number) => {
      if (!isLoadingAnimationPlaying) return;

      const isL2R = direction === 'left-to-right';
      let currentPos: number;

      if (isL2R) {
        if (progress < 0.65) {
          const p1 = progress / 0.65;
          const easeForward = Math.sin((p1 * Math.PI) / 2);
          currentPos = -15 + easeForward * 95; // -15% -> 80%
        } else {
          const p2 = (progress - 0.65) / 0.35;
          const easeSettle = 1 - Math.pow(1 - p2, 3);
          currentPos = 80 - easeSettle * 62; // 80% -> 18%
        }
      } else {
        if (progress < 0.65) {
          const p1 = progress / 0.65;
          const easeForward = Math.sin((p1 * Math.PI) / 2);
          currentPos = 115 - easeForward * 95;
        } else {
          const p2 = (progress - 0.65) / 0.35;
          const easeSettle = 1 - Math.pow(1 - p2, 3);
          currentPos = 20 + easeSettle * 62;
        }
      }

      setSweepLightPos(currentPos);
    },
    [isLoadingAnimationPlaying, direction]
  );

  const handleAnimationComplete = useCallback(() => {
    setIsLoadingAnimationPlaying(false);
    setSweepLightPos(direction === 'left-to-right' ? 18 : 82);
  }, [direction]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-between select-none">
      
      {/* Background Pure Obsidian Void */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #060608 0%, #000000 95%)',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-30 pt-8 px-6 flex items-center justify-between w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>D&apos;VERSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                OPTICAL PORTAL LAB
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>PORTAL SWEEP ENGINE</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT DISPLAY AREA */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        {/* Volumetric Left Sweeping Portal Glow Animation Layer */}
        <LoadingPortalSweep
          isPlaying={isLoadingAnimationPlaying}
          onComplete={handleAnimationComplete}
          direction={direction}
          chromaticIntensity={chromaticIntensity}
          bloomStrength={bloomStrength}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* Optical Typography with Specular Border Highlights & Smoked Body */}
        <WwdcTextEffect
          text={selectedText}
          direction={direction}
          lightPosition={sweepLightPos}
          bloomStrength={bloomStrength}
          chromaticIntensity={chromaticIntensity}
          specularEdgeIntensity={specularEdgeIntensity}
        />
      </div>

      {/* ========================================================================= */}
      {/* MODULAR FLOATING LAB CONTROL DOCK */}
      {/* ========================================================================= */}
      <LabControlsDock
        selectedText={selectedText}
        onSelectText={handleSelectText}
        direction={direction}
        onDirectionChange={handleDirectionChange}
        bloomStrength={bloomStrength}
        onBloomChange={setBloomStrength}
        chromaticIntensity={chromaticIntensity}
        onChromaticChange={setChromaticIntensity}
        specularEdgeIntensity={specularEdgeIntensity}
        onSpecularEdgeChange={setSpecularEdgeIntensity}
        onReplayAnimation={handleReplayAnimation}
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
      />

    </main>
  );
};
