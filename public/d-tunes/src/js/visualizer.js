        // ============================================
        // VISUALIZER & AUDIO ENGINE
        // ============================================
        let audioContext, analyser, source, preAmpGain, masterLimiter, eqFilters = {}, isAudioContextInitialized = false;
        let analyserData = null;
        let smoothedLow = 0, smoothedMid = 0, currentProgress = 0, time = 0, hoverIntensity = 0; let visualizerCtx;
        let vizCanvas = null, vizSeekTrack = null, lastClipProgress = -1;
        let resizeCanvas = () => {};

        const applyEqualizer = () => {
            if (!isAudioContextInitialized || !audioContext) return;
            const now = audioContext.currentTime;

            let maxPositiveGain = 0;
            let positiveGainSum = 0;

            EQ_BANDS.forEach((band) => {
                const val = Number(state.equalizer[band.key] || 0);
                if (val > 0) {
                    if (val > maxPositiveGain) maxPositiveGain = val;
                    positiveGainSum += val;
                }
                if (eqFilters[band.key]) {
                    // Smooth exponential transition prevents zipper noise and pops
                    eqFilters[band.key].gain.setTargetAtTime(val, now, 0.02);
                }
            });

            // Dynamic Headroom Staging:
            // When boosting bass (e.g. +6dB to +12dB), automatically trim pre-amp gain
            // so signal peaks never exceed 0dBFS before hitting the limiter.
            let targetPreAmpDb = 0;
            if (maxPositiveGain > 0) {
                targetPreAmpDb = -(maxPositiveGain * 0.7 + (positiveGainSum - maxPositiveGain) * 0.12);
                targetPreAmpDb = Math.max(-12, Math.min(0, targetPreAmpDb));
            }

            if (preAmpGain) {
                const linearPreAmp = Math.pow(10, targetPreAmpDb / 20);
                preAmpGain.gain.setTargetAtTime(linearPreAmp, now, 0.02);
            }

            if (ui && typeof ui.updateEqualizerMonitoring === 'function') {
                ui.updateEqualizerMonitoring(targetPreAmpDb);
            }
        };

        function setupAudioContext() {
            if (isMobileDevice) return; // Do not attach Web Audio API on mobile as it mutes audio in background and silent mode
            if (isAudioContextInitialized) {
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume().catch(() => {});
                }
                return;
            }
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                audioContext = new AudioCtx();
                if (audioContext.state === 'suspended') {
                    audioContext.resume().catch(() => {});
                }
                
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.8;
                
                source = audioContext.createMediaElementSource(audio);
                
                // 1. Dynamic Headroom Pre-Amp Stage
                preAmpGain = audioContext.createGain();
                preAmpGain.gain.setValueAtTime(1.0, audioContext.currentTime);
                
                let previousNode = source;
                previousNode.connect(preAmpGain);
                previousNode = preAmpGain;
                
                // 2. 10-Band Studio Equalizer Chain with musical Q
                eqFilters = {};
                EQ_BANDS.forEach((band) => {
                    const filter = audioContext.createBiquadFilter();
                    filter.type = band.type;
                    filter.frequency.setValueAtTime(band.frequency, audioContext.currentTime);
                    filter.Q.setValueAtTime(band.q || (band.type === 'peaking' ? 1.414 : 0.707), audioContext.currentTime);
                    filter.gain.setValueAtTime(Number(state.equalizer[band.key] || 0), audioContext.currentTime);
                    
                    eqFilters[band.key] = filter;
                    previousNode.connect(filter);
                    previousNode = filter;
                });
                
                // 3. Studio Mastering Peak Limiter & Anti-Clipping Dynamics Compressor
                masterLimiter = audioContext.createDynamicsCompressor();
                masterLimiter.threshold.setValueAtTime(-0.8, audioContext.currentTime);
                masterLimiter.knee.setValueAtTime(3.0, audioContext.currentTime);
                masterLimiter.ratio.setValueAtTime(20.0, audioContext.currentTime);
                masterLimiter.attack.setValueAtTime(0.002, audioContext.currentTime);
                masterLimiter.release.setValueAtTime(0.050, audioContext.currentTime);
                
                previousNode.connect(masterLimiter);
                masterLimiter.connect(analyser);
                analyser.connect(audioContext.destination);
                
                analyserData = new Uint8Array(analyser.frequencyBinCount);
                isAudioContextInitialized = true;
                
                applyEqualizer();
            } catch(e) {
                console.warn('[DTunes] AudioContext setup notice, falling back to direct audio:', e);
                isAudioContextInitialized = false;
            }
        }
        // Visualizer frequency bin ranges: bins 0-4 = bass/low, bins 10-39 = mid frequencies.
        const VIZ_LOW_BINS_END = 5, VIZ_MID_BINS_START = 10, VIZ_MID_BINS_END = 40;
        const VIZ_SILENCE_THRESHOLD = 0.001;
        let isVizLoopRunning = false;

        // Custom Track Change Waveform Collapse & Expansion Animation State
        // Redesigned sequence:
        // Step 1: Waveform flattens, and player head shrinks to a flat line (3px).
        // Step 2: The flat line smoothly fades to the grey background color of the remaining progress line.
        // Step 3: At 0%, the player head animates in with an expand/grow animation (from a point to a line),
        //         then normal playback resumes as it is.
        const trackTransition = {
            active: false,
            direction: 'next',
            startTime: 0,
            startProgress: 0,
            flattenDuration: 120, // ms: Step 1
            fadeDuration: 140,    // ms: Step 2
            growDuration: 170,    // ms: Step 3
            duration: 430,        // ms: Total = 120 + 140 + 170
        };

        const viz = {
            start: () => {
                if (!isVizLoopRunning) {
                    isVizLoopRunning = true;
                    requestAnimationFrame(viz.render);
                }
            },
            triggerTrackTransition: (dir = 'next') => {
                trackTransition.active = true;
                trackTransition.direction = dir;
                trackTransition.startTime = performance.now();
                // Capture where seekbar currently is (at ANY position)
                let prog = 0;
                if (typeof currentProgress === 'number' && Number.isFinite(currentProgress)) {
                    prog = currentProgress;
                } else if (audio && audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
                    prog = audio.currentTime / audio.duration;
                }
                trackTransition.startProgress = Math.max(0, Math.min(1, prog));
                lastClipProgress = -1;
                viz.start();
            },
            render: () => {
                if (!state.loaded && !trackTransition.active) {
                    isVizLoopRunning = false;
                    return;
                }
                const canvas = vizCanvas; const dpr = Math.min(window.devicePixelRatio || 1, 2);
                if (!canvas || !visualizerCtx) {
                    isVizLoopRunning = false;
                    return;
                }
                const width = canvas.width / dpr; const height = canvas.height / dpr; const centerY = height / 2; visualizerCtx.clearRect(0, 0, width, height);

                // Handle Redesigned Multi-Step Track Change Animation
                if (trackTransition.active) {
                    const now = performance.now();
                    const elapsed = now - trackTransition.startTime;
                    const seekEdge = document.getElementById('seek-edge-marker');
                    const startP = trackTransition.startProgress;
                    const isHovering = state.hoverProgress >= 0;
                    const targetNormalH = isHovering ? 16 : 12;

                    if (elapsed >= trackTransition.duration) {
                        trackTransition.active = false;
                        currentProgress = 0;
                        lastClipProgress = -1;
                        if (canvas) canvas.style.clipPath = 'inset(0 100% 0 0)';
                        if (vizSeekTrack) vizSeekTrack.style.clipPath = 'inset(0 0 0 0%)';
                        if (seekEdge) {
                            seekEdge.style.left = '0%';
                            seekEdge.style.height = '';
                            seekEdge.style.opacity = '';
                        }
                    } else if (startP > 0.01 && elapsed < trackTransition.flattenDuration) {
                        // ========================================================
                        // STEP 1: Player flattens, and player head shrinks to a flat line (3px)
                        // ========================================================
                        const p1 = Math.min(1, elapsed / trackTransition.flattenDuration);
                        const ease1 = p1 * (2 - p1); // smooth ease-out
                        const ampScale = 1 - ease1;

                        if (canvas) canvas.style.clipPath = `inset(0 ${(1 - startP) * 100}% 0 0)`;
                        if (vizSeekTrack) vizSeekTrack.style.clipPath = `inset(0 0 0 ${startP * 100}%)`;

                        const playW = width * startP;
                        const waveCount = Math.min(14, Math.max(2, playW * 0.03));
                        visualizerCtx.beginPath();
                        visualizerCtx.moveTo(0, centerY);
                        for (let x = 0; x <= playW; x++) {
                            const localProgress = x / (playW || 1);
                            const taper = Math.sin(localProgress * Math.PI);
                            const baseWave = Math.sin((x / width) * waveCount * Math.PI);
                            const fastWave = Math.sin((x / width) * waveCount * 2.5 * Math.PI + time);
                            const baseAmp = (centerY * 0.75) * ampScale;
                            const detailAmp = (centerY * 0.25) * ampScale;
                            visualizerCtx.lineTo(x, centerY + (baseWave * baseAmp + fastWave * detailAmp) * taper);
                        }
                        visualizerCtx.lineWidth = 3;
                        visualizerCtx.lineCap = 'round';
                        visualizerCtx.lineJoin = 'round';
                        visualizerCtx.strokeStyle = '#ffffff';
                        visualizerCtx.shadowColor = 'transparent';
                        visualizerCtx.shadowBlur = 0;
                        visualizerCtx.stroke();

                        // Player head shrinks down vertically to 3px (flat line)
                        if (seekEdge) {
                            seekEdge.style.left = `${startP * 100}%`;
                            const currentH = targetNormalH - (targetNormalH - 3) * ease1;
                            seekEdge.style.height = `${currentH}px`;
                            seekEdge.style.opacity = '1';
                        }

                        requestAnimationFrame(viz.render);
                        return;
                    } else if (startP > 0.01 && elapsed < trackTransition.flattenDuration + trackTransition.fadeDuration) {
                        // ========================================================
                        // STEP 2: The flat line fades to the grey color of the remaining progress line
                        // ========================================================
                        const elapsed2 = elapsed - trackTransition.flattenDuration;
                        const p2 = Math.min(1, elapsed2 / trackTransition.fadeDuration);
                        const ease2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 2) / 2;

                        if (canvas) canvas.style.clipPath = `inset(0 ${(1 - startP) * 100}% 0 0)`;
                        if (vizSeekTrack) vizSeekTrack.style.clipPath = `inset(0 0 0 ${startP * 100}%)`;

                        const playW = width * startP;
                        visualizerCtx.beginPath();
                        visualizerCtx.moveTo(0, centerY);
                        visualizerCtx.lineTo(playW, centerY);
                        visualizerCtx.lineWidth = 3;
                        visualizerCtx.lineCap = 'round';
                        visualizerCtx.lineJoin = 'round';

                        // Fade alpha smoothly from 1.0 (solid white) to 0.18 (background grey)
                        const lineAlpha = Math.max(0.18, 1.0 - ease2 * (1.0 - 0.18));
                        visualizerCtx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                        visualizerCtx.shadowColor = 'transparent';
                        visualizerCtx.shadowBlur = 0;
                        visualizerCtx.stroke();

                        // Player head at startP is flat line (3px) and fades out
                        if (seekEdge) {
                            seekEdge.style.left = `${startP * 100}%`;
                            seekEdge.style.height = '3px';
                            seekEdge.style.opacity = String(Math.max(0, 1 - ease2));
                        }

                        requestAnimationFrame(viz.render);
                        return;
                    } else {
                        // ========================================================
                        // STEP 3: At 0%, player head animates in with expand/grow animation
                        // (from a point 0px to full line), then works as it is.
                        // ========================================================
                        const elapsed3 = Math.max(0, elapsed - (startP > 0.01 ? (trackTransition.flattenDuration + trackTransition.fadeDuration) : 0));
                        const p3 = Math.min(1, elapsed3 / trackTransition.growDuration);
                        // Elastic / spring grow ease
                        const ease3 = 1 - Math.pow(1 - p3, 3);

                        currentProgress = 0;
                        if (canvas) canvas.style.clipPath = 'inset(0 100% 0 0)';
                        if (vizSeekTrack) vizSeekTrack.style.clipPath = 'inset(0 0 0 0%)';

                        if (seekEdge) {
                            seekEdge.style.left = '0%';
                            seekEdge.style.opacity = '1';
                            const growHeight = targetNormalH * ease3;
                            seekEdge.style.height = `${growHeight}px`;
                        }

                        if (p3 < 1) {
                            requestAnimationFrame(viz.render);
                            return;
                        }

                        trackTransition.active = false;
                        if (seekEdge) {
                            seekEdge.style.height = '';
                            seekEdge.style.opacity = '';
                        }
                    }
                }

                // Restore seek edge marker styles when not transitioning
                const seekEdge = document.getElementById('seek-edge-marker');
                if (seekEdge && !trackTransition.active) {
                    seekEdge.style.opacity = '1';
                    if (!seekEdge.dataset.customHeight) seekEdge.style.height = '';
                }
                // Always update the clip-path so the progress line stays visible
                if(vizSeekTrack && currentProgress !== lastClipProgress) {
                    // Use percentage clipping so the waveform edge always lands
                    // exactly on the needle, independent of canvas backing size.
                    canvas.style.clipPath = `inset(0 ${(1 - currentProgress) * 100}% 0 0)`;
                    vizSeekTrack.style.clipPath = `inset(0 0 0 ${currentProgress * 100}%)`;
                    lastClipProgress = currentProgress;
                }
                time += 0.05; let targetLow = 0, targetMid = 0;
                if (state.playing && isAudioContextInitialized && analyserData) {
                    analyser.getByteFrequencyData(analyserData);
                    let sumLow = 0; for (let i = 0; i < VIZ_LOW_BINS_END; i++) sumLow += analyserData[i];
                    let sumMid = 0; for (let i = VIZ_MID_BINS_START; i < VIZ_MID_BINS_END; i++) sumMid += analyserData[i];
                    targetLow = sumLow / VIZ_LOW_BINS_END / 255; targetMid = sumMid / (VIZ_MID_BINS_END - VIZ_MID_BINS_START) / 255;
                } else if (state.playing) {
                    // Fallback motion when frequency data is unavailable (e.g., iOS restrictions).
                    targetLow = 0.2 + (0.16 * (0.5 + 0.5 * Math.sin(time * 2.8)));
                    targetMid = 0.12 + (0.09 * (0.5 + 0.5 * Math.cos(time * 3.4)));
                } else {
                    // Paused: decay the wave to flat
                    smoothedLow += (0 - smoothedLow) * 0.15; smoothedMid += (0 - smoothedMid) * 0.15;
                    if (smoothedLow < VIZ_SILENCE_THRESHOLD && smoothedMid < VIZ_SILENCE_THRESHOLD) {
                        visualizerCtx.beginPath();
                        visualizerCtx.moveTo(0, centerY);
                        visualizerCtx.lineTo(width, centerY);
                        visualizerCtx.lineWidth = 3;
                        visualizerCtx.lineCap = 'round';
                        visualizerCtx.lineJoin = 'round';
                        visualizerCtx.strokeStyle = '#ffffff';
                        visualizerCtx.shadowColor = 'transparent';
                        visualizerCtx.shadowBlur = 0;
                        visualizerCtx.stroke();
                        isVizLoopRunning = false;
                        return; // Successfully settled: pause the rAF loop to save CPU & battery!
                    }
                }
                smoothedLow += (targetLow - smoothedLow) * 0.1; smoothedMid += (targetMid - smoothedMid) * 0.1;
                let verticalScale = audio.duration > 0 ? (0.3 + 0.7 * Math.min(1, currentProgress / 0.4)) * 0.8 : 1.0;
                visualizerCtx.beginPath(); visualizerCtx.moveTo(0, centerY);
                const waveCount = Math.min(14, Math.max(2, (width * currentProgress) * 0.03)); const intensity = audio.volume; const isHovering = state.hoverProgress >= 0;
                hoverIntensity += ((isHovering ? 1.0 : 0.0) - hoverIntensity) * 0.1;
                for (let x = 0; x <= width; x++) {
                    const localProgress = x / (width * currentProgress || 1); const taper = Math.sin(localProgress * Math.PI);
                    const baseWave = Math.sin((x / width) * waveCount * Math.PI); const fastWave = Math.sin((x / width) * waveCount * 2.5 * Math.PI + time);
                    const loudness = Math.max(0.45, intensity);
                    const baseAmplitude = (centerY * 1.05) * Math.pow(smoothedLow, 1.7) * loudness * verticalScale;
                    const detailAmplitude = (centerY * 0.34) * Math.pow(smoothedMid, 1.35) * loudness * verticalScale;
                    let interactionFactor = 1.0;
                    if (hoverIntensity > 0.01) { const hoverX = (isHovering ? state.hoverProgress : state.lastHoverProgress) * width; const dist = Math.abs(x - hoverX); if (dist < 60) interactionFactor = 1.0 - (hoverIntensity * (1.0 - (dist/60)*(dist/60)*(3-2*(dist/60)))); }
                    visualizerCtx.lineTo(x, centerY + (baseWave * baseAmplitude + fastWave * detailAmplitude) * taper * interactionFactor);
                }
                visualizerCtx.lineWidth = 3; visualizerCtx.lineCap = 'round'; visualizerCtx.lineJoin = 'round'; visualizerCtx.strokeStyle = '#ffffff'; visualizerCtx.shadowColor = 'transparent'; visualizerCtx.shadowBlur = 0; visualizerCtx.stroke();
                
                requestAnimationFrame(viz.render);
            }
        };

