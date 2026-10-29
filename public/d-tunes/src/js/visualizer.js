        // ============================================
        // VISUALIZER & AUDIO ENGINE
        // ============================================
        let audioContext, analyser, source, preAmpGain, masterLimiter, eqFilters = {}, isAudioContextInitialized = false;
        let analyserData = null;
        let smoothedLow = 0, smoothedMid = 0, smoothedHigh = 0, currentProgress = 0, time = 0, hoverIntensity = 0; let visualizerCtx;
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
        // Bass (bins 0-4) drives amplitude. Treble (upper bins) drives how many waves.
        const VIZ_LOW_BINS_END = 5, VIZ_MID_BINS_START = 10, VIZ_MID_BINS_END = 40;
        const VIZ_HIGH_BINS_START = 48, VIZ_HIGH_BINS_END = 110;
        const VIZ_SILENCE_THRESHOLD = 0.001;
        let isVizLoopRunning = false;

        // Custom Track Change Waveform Collapse & Expansion Animation State
        const trackTransition = {
            active: false,
            direction: 'next', // 'next' or 'prev'
            startTime: 0,
            duration: 520, // ms
            flattenDuration: 110, // ms
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

                // Handle Track Change Waveform Collapse/Expansion Animation
                if (trackTransition.active) {
                    const now = performance.now();
                    const elapsed = now - trackTransition.startTime;

                    if (elapsed >= trackTransition.duration) {
                        trackTransition.active = false;
                        lastClipProgress = -1;
                        if (canvas) canvas.style.clipPath = '';
                        if (vizSeekTrack) vizSeekTrack.style.clipPath = '';
                    } else {
                        // Phase 1: Rapid Waveform Flattening
                        if (elapsed < trackTransition.flattenDuration) {
                            const flattenP = elapsed / trackTransition.flattenDuration;
                            const ampScale = 1 - flattenP;
                            visualizerCtx.beginPath();
                            visualizerCtx.moveTo(0, centerY);
                            for (let x = 0; x <= width; x++) {
                                const baseWave = Math.sin((x / width) * 8 * Math.PI);
                                visualizerCtx.lineTo(x, centerY + baseWave * 8 * ampScale);
                            }
                            visualizerCtx.lineWidth = 2.5;
                            visualizerCtx.lineCap = 'round';
                            visualizerCtx.strokeStyle = '#ffffff';
                            visualizerCtx.shadowColor = 'rgba(255, 255, 255, 0.7)';
                            visualizerCtx.shadowBlur = 4;
                            visualizerCtx.stroke();
                        } else {
                            // Phase 2: Dual-Line Collapse and Expansion
                            const animElapsed = elapsed - trackTransition.flattenDuration;
                            const animTotal = trackTransition.duration - trackTransition.flattenDuration;
                            const p = Math.min(1, Math.max(0, animElapsed / animTotal));
                            // Smooth easeInOutQuad
                            const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                            const dir = trackTransition.direction;

                            let oldX1, oldX2, newX1, newX2;

                            if (dir === 'next') {
                                // Collapsing line shrinks to left:
                                // Left end stays pinned at 0 till the last
                                if (ease < 0.85) {
                                    oldX1 = 0;
                                    oldX2 = width * (1 - ease / 0.85);
                                } else {
                                    // Almost a point width: slides off to left
                                    const exitP = (ease - 0.85) / 0.15;
                                    const ptW = 4;
                                    const shift = exitP * 28;
                                    oldX1 = -shift;
                                    oldX2 = -shift + ptW * (1 - exitP);
                                }

                                // Incoming line simultaneously enters from right:
                                // Right end stays pinned at width
                                if (ease < 0.12) {
                                    const enterP = ease / 0.12;
                                    newX2 = width;
                                    newX1 = width - (enterP * 6);
                                } else {
                                    const expandP = (ease - 0.12) / 0.88;
                                    newX2 = width;
                                    newX1 = width * (1 - expandP);
                                }
                            } else {
                                // Prev: Collapsing line shrinks to right:
                                // Right end stays pinned at width till the last
                                if (ease < 0.85) {
                                    oldX1 = width * (ease / 0.85);
                                    oldX2 = width;
                                } else {
                                    // Almost a point width: slides off to right
                                    const exitP = (ease - 0.85) / 0.15;
                                    const ptW = 4;
                                    const shift = exitP * 28;
                                    oldX2 = width + shift;
                                    oldX1 = width + shift - ptW * (1 - exitP);
                                }

                                // Incoming line simultaneously enters from left:
                                // Left end stays pinned at 0
                                if (ease < 0.12) {
                                    const enterP = ease / 0.12;
                                    newX1 = 0;
                                    newX2 = enterP * 6;
                                } else {
                                    const expandP = (ease - 0.12) / 0.88;
                                    newX1 = 0;
                                    newX2 = width * expandP;
                                }
                            }

                            // Keep canvas unclipped during transition for full line visibility
                            if (canvas) canvas.style.clipPath = 'none';
                            if (vizSeekTrack) vizSeekTrack.style.clipPath = 'none';

                            // Draw unplayed background track guide
                            visualizerCtx.beginPath();
                            visualizerCtx.moveTo(0, centerY);
                            visualizerCtx.lineTo(width, centerY);
                            visualizerCtx.lineWidth = 3;
                            visualizerCtx.lineCap = 'round';
                            visualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
                            visualizerCtx.stroke();

                            // Draw collapsing old line
                            if (oldX2 > oldX1) {
                                visualizerCtx.beginPath();
                                visualizerCtx.moveTo(Math.max(-50, oldX1), centerY);
                                visualizerCtx.lineTo(Math.min(width + 50, oldX2), centerY);
                                visualizerCtx.lineWidth = 3;
                                visualizerCtx.lineCap = 'round';
                                visualizerCtx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.15, 1 - ease * 0.8)})`;
                                visualizerCtx.shadowColor = 'rgba(255, 255, 255, 0.7)';
                                visualizerCtx.shadowBlur = 6;
                                visualizerCtx.stroke();
                            }

                            // Draw incoming new line
                            if (newX2 > newX1) {
                                visualizerCtx.beginPath();
                                visualizerCtx.moveTo(Math.max(-50, newX1), centerY);
                                visualizerCtx.lineTo(Math.min(width + 50, newX2), centerY);
                                visualizerCtx.lineWidth = 3;
                                visualizerCtx.lineCap = 'round';
                                visualizerCtx.strokeStyle = `rgba(255, 255, 255, ${0.35 + ease * 0.65})`;
                                visualizerCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
                                visualizerCtx.shadowBlur = 8;
                                visualizerCtx.stroke();
                            }
                        }

                        // Hide the seek edge marker during collapse animation
                        const seekEdge = document.getElementById('seek-edge-marker');
                        if (seekEdge) seekEdge.style.opacity = '0';

                        requestAnimationFrame(viz.render);
                        return;
                    }
                }

                // Restore seek edge marker opacity
                const seekEdge = document.getElementById('seek-edge-marker');
                if (seekEdge) seekEdge.style.opacity = '1';
                // Always update the clip-path so the progress line stays visible
                if(vizSeekTrack && currentProgress !== lastClipProgress) {
                    const progressWidth = width * currentProgress;
                    canvas.style.clipPath = `inset(0 ${width - progressWidth}px 0 0)`;
                    vizSeekTrack.style.clipPath = `inset(0 0 0 ${currentProgress * 100}%)`;
                    lastClipProgress = currentProgress;
                }
                time += 0.05; let targetLow = 0, targetMid = 0, targetHigh = 0;
                if (state.playing && isAudioContextInitialized && analyserData) {
                    analyser.getByteFrequencyData(analyserData);
                    let sumLow = 0; for (let i = 0; i < VIZ_LOW_BINS_END; i++) sumLow += analyserData[i];
                    let sumMid = 0; for (let i = VIZ_MID_BINS_START; i < VIZ_MID_BINS_END; i++) sumMid += analyserData[i];
                    const highEnd = Math.min(VIZ_HIGH_BINS_END, analyserData.length);
                    let sumHigh = 0; for (let i = VIZ_HIGH_BINS_START; i < highEnd; i++) sumHigh += analyserData[i];
                    const highCount = Math.max(1, highEnd - VIZ_HIGH_BINS_START);
                    targetLow = sumLow / VIZ_LOW_BINS_END / 255;
                    targetMid = sumMid / (VIZ_MID_BINS_END - VIZ_MID_BINS_START) / 255;
                    targetHigh = sumHigh / highCount / 255;
                } else if (state.playing) {
                    // Fallback motion when frequency data is unavailable (e.g., iOS restrictions).
                    targetLow = 0.28 + (0.42 * (0.5 + 0.5 * Math.sin(time * 2.2)));
                    targetMid = 0.12 + (0.09 * (0.5 + 0.5 * Math.cos(time * 3.4)));
                    targetHigh = 0.12 + (0.5 * (0.5 + 0.5 * Math.sin(time * 6.4)));
                } else {
                    // Paused: decay the wave to flat
                    smoothedLow += (0 - smoothedLow) * 0.15;
                    smoothedMid += (0 - smoothedMid) * 0.15;
                    smoothedHigh += (0 - smoothedHigh) * 0.15;
                    if (smoothedLow < VIZ_SILENCE_THRESHOLD && smoothedHigh < VIZ_SILENCE_THRESHOLD) {
                        visualizerCtx.beginPath();
                        visualizerCtx.moveTo(0, centerY);
                        visualizerCtx.lineTo(width, centerY);
                        visualizerCtx.lineWidth = 2;
                        visualizerCtx.strokeStyle = '#fff';
                        visualizerCtx.shadowColor = 'transparent';
                        visualizerCtx.shadowBlur = 0;
                        visualizerCtx.stroke();
                        isVizLoopRunning = false;
                        return; // Successfully settled: pause the rAF loop to save CPU & battery!
                    }
                }
                const lowK = targetLow > smoothedLow ? 0.28 : 0.1;
                const highK = targetHigh > smoothedHigh ? 0.34 : 0.12;
                smoothedLow += (targetLow - smoothedLow) * lowK;
                smoothedMid += (targetMid - smoothedMid) * 0.1;
                smoothedHigh += (targetHigh - smoothedHigh) * highK;
                let verticalScale = audio.duration > 0 ? (0.3 + 0.7 * Math.min(1, currentProgress / 0.4)) * 0.8 : 1.0;
                visualizerCtx.beginPath(); visualizerCtx.moveTo(0, centerY);
                // Switched: bass = height, treble = how many waves along the line.
                const bass = Math.pow(Math.max(0, smoothedLow), 0.9);
                const amplitude = centerY * (0.05 + 0.92 * bass) * Math.max(0.5, audio.volume) * verticalScale;
                const waveCount = 1.35 + Math.pow(Math.max(0, smoothedHigh), 0.75) * 15;
                const isHovering = state.hoverProgress >= 0;
                hoverIntensity += ((isHovering ? 1.0 : 0.0) - hoverIntensity) * 0.1;
                for (let x = 0; x <= width; x++) {
                    const localProgress = x / (width * currentProgress || 1); const taper = Math.sin(Math.min(1, Math.max(0, localProgress)) * Math.PI);
                    const wave = Math.sin((x / width) * waveCount * Math.PI * 2 + time * (0.35 + smoothedHigh * 2.2));
                    let interactionFactor = 1.0;
                    if (hoverIntensity > 0.01) { const hoverX = (isHovering ? state.hoverProgress : state.lastHoverProgress) * width; const dist = Math.abs(x - hoverX); if (dist < 60) interactionFactor = 1.0 - (hoverIntensity * (1.0 - (dist/60)*(dist/60)*(3-2*(dist/60)))); }
                    visualizerCtx.lineTo(x, centerY + wave * amplitude * taper * interactionFactor);
                }
                visualizerCtx.lineWidth = 2; visualizerCtx.strokeStyle = '#fff'; visualizerCtx.shadowColor = 'transparent'; visualizerCtx.shadowBlur = 0; visualizerCtx.stroke();
                
                requestAnimationFrame(viz.render);
            }
        };

