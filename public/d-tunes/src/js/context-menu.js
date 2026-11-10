        // ============================================
        // CONTEXT MENU LOGIC
        // ============================================
        const ctxMenu = {
            activeStoreId: null, activePlaylistName: null,
            init: () => {
                const menu = document.getElementById('context-menu');
                document.addEventListener('click', (e) => { 
                    menu.classList.add('hidden'); 
                    if (!e.target.closest('#profile-dropdown') && !e.target.closest('[onclick*="profile-dropdown"]')) {
                        document.getElementById('profile-dropdown').classList.add('hidden');
                    }
                });
                document.getElementById('cm-play-next').onclick = () => { const s = songStore.get(ctxMenu.activeStoreId); if(s) player.addNext(s); };
                document.getElementById('cm-add-queue').onclick = () => { const s = songStore.get(ctxMenu.activeStoreId); if(s) player.addToQueue(s); };
                document.getElementById('cm-add-playlist').onclick = (e) => { e.stopPropagation(); menu.classList.add('hidden'); ctxMenu.showPlaylistSelector(); };
                document.getElementById('cm-like-song').onclick = () => { const s = songStore.get(ctxMenu.activeStoreId); if(s) player.likeSong(s.id); menu.classList.add('hidden'); };
                document.getElementById('cm-add-library').onclick = () => { const s = songStore.get(ctxMenu.activeStoreId); if(s) player.addToLibrary(s.id); menu.classList.add('hidden'); };
                const cmDownload = document.getElementById('cm-download') || document.getElementById('cm-download-song');
                if (cmDownload) {
                    cmDownload.onclick = () => {
                        const s = songStore.get(ctxMenu.activeStoreId);
                        menu.classList.add('hidden');
                        if (!s) return;
                        if (window.dtunesIsOfflineTrack && window.dtunesIsOfflineTrack(s.id)) {
                            if (window.dtunesDeleteOffline) window.dtunesDeleteOffline(s.id);
                        } else if (window.dtunesDownloadTrack) {
                            window.dtunesDownloadTrack(s);
                        }
                    };
                }
                const cmDislike = document.getElementById('cm-dislike-song');
                if (cmDislike) {
                    cmDislike.onclick = () => {
                        const s = songStore.get(ctxMenu.activeStoreId);
                        if (s && player.dislikeSong) player.dislikeSong(s.id);
                        menu.classList.add('hidden');
                    };
                }
                const cmReportAi = document.getElementById('cm-report-ai');
                if (cmReportAi) {
                    cmReportAi.onclick = () => {
                        const s = songStore.get(ctxMenu.activeStoreId);
                        menu.classList.add('hidden');
                        if (window.aiReportManager) {
                            window.aiReportManager.openReportModal({
                                feature: 'Song Recommendation / Track Output',
                                contentSummary: s ? `Track: "${s.name || s.title}" by ${s.artist || 'Unknown'}` : 'Track output',
                                context: s || {}
                            });
                        }
                    };
                }
                document.getElementById('cm-pl-play').onclick = () => { ui.playPlaylist(ctxMenu.activePlaylistName); };
                const cmPlNext = document.getElementById('cm-pl-play-next');
                if (cmPlNext) cmPlNext.onclick = () => { player.addPlaylistNext(ctxMenu.activePlaylistName); };
                const cmPlQueue = document.getElementById('cm-pl-add-queue');
                if (cmPlQueue) cmPlQueue.onclick = () => { player.addPlaylistToQueue(ctxMenu.activePlaylistName); };
                const cmPlEdit = document.getElementById('cm-pl-edit');
                if (cmPlEdit) cmPlEdit.onclick = () => { ui.openPlaylistEditor(ctxMenu.activePlaylistName); };
                document.getElementById('cm-pl-delete').onclick = () => { ui.deletePlaylist(ctxMenu.activePlaylistName); };
            },
            showSong: (event, storeId) => {
                const menu = document.getElementById('context-menu');
                if (!menu.classList.contains('hidden') && ctxMenu.activeStoreId === storeId) {
                    menu.classList.add('hidden');
                    ctxMenu.activeStoreId = null;
                    return;
                }
                ctxMenu.activeStoreId = storeId;
                const song = songStore.get(storeId);
                const likeLabel = document.getElementById('cm-like-song-label');
                const libraryLabel = document.getElementById('cm-add-library-label');
                if (likeLabel && song) likeLabel.textContent = player.isLiked(song.id) ? 'Unlike song' : 'Like song';
                if (libraryLabel && song) libraryLabel.textContent = player.isInLibrary(song.id) ? 'Remove from Library' : 'Add to Library';
                const downloadBtn = document.getElementById('cm-download') || document.getElementById('cm-download-song');
                if (downloadBtn) {
                    const isDesktop = Boolean((window.electronAPI && window.electronAPI.isDesktopApp) || window.isDTunesDesktop);
                    downloadBtn.classList.toggle('hidden', !isDesktop);
                    const label = document.getElementById('cm-download-label') || document.getElementById('cm-download-song-label');
                    if (label && song) {
                        label.textContent = (window.dtunesIsOfflineTrack && window.dtunesIsOfflineTrack(song.id))
                            ? 'Remove offline download'
                            : 'Download for offline';
                    }
                }

                // "Don't recommend this" and "Report recommendation" ONLY for daily mix and autoplay songs
                const isRecommendation = Boolean(
                    song && (
                        song.isAutoplay ||
                        song.isDailyMix ||
                        song.origin === 'autoplay' ||
                        song.origin === 'daily_mix' ||
                        song.source === 'recommendation' ||
                        (state.currentTrack && state.currentTrack.id === song.id && (state.currentTrack.isAutoplay || state.currentTrack.isDailyMix))
                    )
                );
                const dislikeBtn = document.getElementById('cm-dislike-song');
                const reportAiBtn = document.getElementById('cm-report-ai');
                const recDivider = document.getElementById('cm-rec-divider');
                if (dislikeBtn) {
                    dislikeBtn.classList.toggle('hidden', !isRecommendation);
                    const dislikeLabel = document.getElementById('cm-dislike-song-label');
                    if (dislikeLabel && song) {
                        dislikeLabel.textContent = (player.isDisliked && player.isDisliked(song.id)) ? 'Remove from hidden' : "Don't recommend this";
                    }
                }
                if (reportAiBtn) reportAiBtn.classList.toggle('hidden', !isRecommendation);
                if (recDivider) recDivider.classList.toggle('hidden', !isRecommendation);

                document.getElementById('cm-song-options').classList.remove('hidden');
                document.getElementById('cm-playlist-options').classList.add('hidden');
                menu.classList.remove('hidden');

                let cx = (event && typeof event.clientX === 'number') ? event.clientX : 0;
                let cy = (event && typeof event.clientY === 'number') ? event.clientY : 0;
                if ((!cx && !cy) && event && event.currentTarget && event.currentTarget.getBoundingClientRect) {
                    const rect = event.currentTarget.getBoundingClientRect();
                    cx = rect.right - 220;
                    cy = rect.bottom + 6;
                }
                const menuW = 220;
                const menuH = menu.offsetHeight || 320;
                const x = Math.max(12, Math.min(cx, window.innerWidth - menuW - 16));
                const y = Math.max(12, Math.min(cy, window.innerHeight - menuH - 16));
                menu.style.left = `${x}px`; menu.style.top = `${y}px`;
            },
            showPlaylist: (event, playlistName) => {
                const menu = document.getElementById('context-menu');
                if (!menu.classList.contains('hidden') && ctxMenu.activePlaylistName === playlistName) {
                    menu.classList.add('hidden');
                    ctxMenu.activePlaylistName = null;
                    return;
                }
                ctxMenu.activePlaylistName = playlistName;
                document.getElementById('cm-song-options').classList.add('hidden');
                document.getElementById('cm-playlist-options').classList.remove('hidden');
                menu.classList.remove('hidden');
                let cx = (event && typeof event.clientX === 'number') ? event.clientX : 0;
                let cy = (event && typeof event.clientY === 'number') ? event.clientY : 0;
                if ((!cx && !cy) && event && event.currentTarget && event.currentTarget.getBoundingClientRect) {
                    const rect = event.currentTarget.getBoundingClientRect();
                    cx = rect.right - 220;
                    cy = rect.bottom + 6;
                }
                const menuW = 220;
                const menuH = menu.offsetHeight || 320;
                const x = Math.max(12, Math.min(cx, window.innerWidth - menuW - 16));
                const y = Math.max(12, Math.min(cy, window.innerHeight - menuH - 16));
                menu.style.left = `${x}px`; menu.style.top = `${y}px`;
            },
            showPlaylistSelector: () => {
                const song = songStore.get(ctxMenu.activeStoreId); if(!song) return;
                const modal = document.getElementById('playlist-selector-modal'); const list = document.getElementById('playlist-selector-list');
                let html = '';
                Object.keys(state.playlists).forEach(name => {
                    html += `<button class="w-full text-left px-4 py-3 glass-panel rounded-lg hover:bg-white/10 text-white transition" onclick="ui.addSongToPlaylist('${utils.escapeJs(name)}')">${utils.escapeHtml(name)}</button>`;
                });
                if(Object.keys(state.playlists).length === 0) html = '<p class="text-gray-400 text-sm py-2">No playlists created yet.</p>';
                list.innerHTML = html; modal.classList.remove('hidden');
            }
        };

