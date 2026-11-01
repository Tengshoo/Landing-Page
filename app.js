/**
 * Memoira - The Modern Wedding & Engagement Guestbook
 * Vanilla JavaScript Interactivity Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Header Scroll State
  // --------------------------------------------------------------------------
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --------------------------------------------------------------------------
  // 2. Mobile Navigation Drawer
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-cta');

  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // --------------------------------------------------------------------------
  // 3. Web Audio API Synthesis for Luxury Wedding Sound Experience
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let activeOscillators = [];
  let isPlayingHeroAudio = false;
  let heroTimerInterval = null;
  let heroCurrentSeconds = 0;
  const heroTotalSeconds = 38;

  let isPlayingSampleAudio = false;
  let sampleTimerInterval = null;
  let sampleCurrentSeconds = 0;
  const sampleTotalSeconds = 44;

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  // iOS Safari and Android WebView AudioContext unlock on initial user gesture
  const unlockAudioContext = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  ['touchstart', 'touchend', 'click'].forEach(evt => {
    window.addEventListener(evt, unlockAudioContext, { once: true, passive: true });
  });

  // Play soft harmonic wedding tones
  const playAmbientHarpChord = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientHarpChord();

    // Soft pentatonic frequencies (warm wedding blessing mood)
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Gentle pulsating gain
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04 / (index + 1), ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.008, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.15);
      activeOscillators.push({ osc, gain });
    });
  };

  const stopAmbientHarpChord = () => {
    if (activeOscillators.length > 0 && audioCtx) {
      activeOscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
          osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
          // ignore
        }
      });
      activeOscillators = [];
    }
  };

  // Play celebratory wedding chime when guest submits wish
  const playCelebratoryChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chimeFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  };

  // --------------------------------------------------------------------------
  // 4. Hero Audio Player Toggle & Waveform Simulation
  // --------------------------------------------------------------------------
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioCurrentTime = document.getElementById('audioCurrentTime');
  const audioToast = document.getElementById('audioToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastStopBtn = document.getElementById('toastStopBtn');

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stopHeroAudio = () => {
    isPlayingHeroAudio = false;
    if (audioToggleBtn) audioToggleBtn.classList.remove('playing');
    clearInterval(heroTimerInterval);
    stopAmbientHarpChord();
    if (audioToast) audioToast.classList.remove('show');
  };

  const startHeroAudio = () => {
    // If feature sample audio was playing, pause it first
    stopSampleAudio();

    isPlayingHeroAudio = true;
    if (audioToggleBtn) audioToggleBtn.classList.add('playing');
    playAmbientHarpChord();

    if (toastTitle) toastTitle.textContent = 'Pak Long Kamarul - Table 2';
    if (audioToast) audioToast.classList.add('show');

    clearInterval(heroTimerInterval);
    heroTimerInterval = setInterval(() => {
      heroCurrentSeconds++;
      if (heroCurrentSeconds > heroTotalSeconds) {
        heroCurrentSeconds = 0;
        stopHeroAudio();
      }
      if (audioCurrentTime) {
        audioCurrentTime.textContent = formatTime(heroCurrentSeconds);
      }
    }, 1000);
  };

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (isPlayingHeroAudio) {
        stopHeroAudio();
      } else {
        startHeroAudio();
      }
    });
  }

  if (toastStopBtn) {
    toastStopBtn.addEventListener('click', () => {
      stopHeroAudio();
      stopSampleAudio();
    });
  }

  // --------------------------------------------------------------------------
  // 5. Feature Section Audio Sample (Grandma's Blessing)
  // --------------------------------------------------------------------------
  const voiceSamplePlayBtn = document.getElementById('voiceSamplePlayBtn');
  const voiceSampleTimer = document.getElementById('voiceSampleTimer');

  const stopSampleAudio = () => {
    isPlayingSampleAudio = false;
    if (voiceSamplePlayBtn) voiceSamplePlayBtn.classList.remove('playing');
    clearInterval(sampleTimerInterval);
    stopAmbientHarpChord();
    if (audioToast) audioToast.classList.remove('show');
  };

  const startSampleAudio = () => {
    // If hero audio was playing, pause it first
    stopHeroAudio();

    isPlayingSampleAudio = true;
    if (voiceSamplePlayBtn) voiceSamplePlayBtn.classList.add('playing');
    playAmbientHarpChord();

    if (toastTitle) toastTitle.textContent = "Grandmother's Cantonese Blessing";
    if (audioToast) audioToast.classList.add('show');

    clearInterval(sampleTimerInterval);
    sampleTimerInterval = setInterval(() => {
      sampleCurrentSeconds++;
      if (sampleCurrentSeconds > sampleTotalSeconds) {
        sampleCurrentSeconds = 0;
        stopSampleAudio();
      }
      if (voiceSampleTimer) {
        voiceSampleTimer.textContent = `${formatTime(sampleCurrentSeconds)} / 0:44`;
      }
    }, 1000);
  };

  if (voiceSamplePlayBtn) {
    voiceSamplePlayBtn.addEventListener('click', () => {
      if (isPlayingSampleAudio) {
        stopSampleAudio();
      } else {
        startSampleAudio();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Interactive Suite Emulator & Guest Simulator (demo-guestbook)
  // --------------------------------------------------------------------------
  
  // A. 4-Module Navigation Tab Switching
  const moduleTabs = document.querySelectorAll('.demo-module-tab');
  const modulePanes = document.querySelectorAll('.demo-pane');

  const switchModule = (targetModuleId) => {
    moduleTabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-module') === targetModuleId;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    modulePanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetModuleId);
    });
  };

  moduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-module');
      if (targetId) switchModule(targetId);
    });
  });

  // Cross-module jump links
  document.querySelectorAll('[data-goto-module]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModule = btn.getAttribute('data-goto-module');
      if (targetModule) switchModule(targetModule);
    });
  });

  // B. Bilingual Toggle on Mobile Mockup
  const demoLangBtn = document.getElementById('demoLangBtn');
  const demoLangText = document.getElementById('demoLangText');
  const demoEventSubtitle = document.getElementById('demoEventSubtitle');
  const demoDateVenue = document.getElementById('demoDateVenue');
  const demoFieldPlaceholder = document.getElementById('demoFieldPlaceholder');
  const demoCtaLabel = document.getElementById('demoCtaLabel');

  let currentDemoLang = 'ms';

  if (demoLangBtn) {
    demoLangBtn.addEventListener('click', () => {
      if (currentDemoLang === 'ms') {
        currentDemoLang = 'en';
        if (demoLangText) demoLangText.textContent = 'MS | EN';
        if (demoEventSubtitle) demoEventSubtitle.textContent = 'WEDDING CELEBRATION';
        if (demoDateVenue) demoDateVenue.textContent = 'Saturday, 28 November 2026 \u2022 Glasshouse at Seputeh';
        if (demoFieldPlaceholder) demoFieldPlaceholder.textContent = 'Your name / Table (e.g. Sarah - Table 5)';
        if (demoCtaLabel) demoCtaLabel.textContent = 'Snap Photo & Sign Guestbook';
      } else {
        currentDemoLang = 'ms';
        if (demoLangText) demoLangText.textContent = 'EN | MS';
        if (demoEventSubtitle) demoEventSubtitle.textContent = 'MAJLIS PERKAHWINAN';
        if (demoDateVenue) demoDateVenue.textContent = 'Sabtu, 28 November 2026 \u2022 Glasshouse at Seputeh';
        if (demoFieldPlaceholder) demoFieldPlaceholder.textContent = 'Your name / Table (e.g. Pak Long - Table 2)';
        if (demoCtaLabel) demoCtaLabel.textContent = 'Snap Photo & Sign Guestbook';
      }
    });
  }

  // C. Photobooth Studio Simulator (/photobooth)
  const pbCameraFeed = document.getElementById('pbCameraFeed');
  const pbCountdownOverlay = document.getElementById('pbCountdownOverlay');
  const pbCountdownNum = document.getElementById('pbCountdownNum');
  const pbFlashOverlay = document.getElementById('pbFlashOverlay');
  const pbShootBtn = document.getElementById('pbShootBtn');
  const pbDownloadBtn = document.getElementById('pbDownloadBtn');
  const pbAttachBtn = document.getElementById('pbAttachBtn');
  const pbFilterBtns = document.querySelectorAll('[data-pb-filter]');
  const pbSlotImgs = document.querySelectorAll('.pb-slot-img');

  let isPbShooting = false;

  // Filter selection in photobooth
  pbFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pbFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterVal = btn.getAttribute('data-pb-filter');
      if (pbCameraFeed) pbCameraFeed.style.filter = filterVal === 'none' ? 'none' : filterVal;
      pbSlotImgs.forEach(img => {
        img.style.filter = filterVal === 'none' ? 'none' : filterVal;
      });
    });
  });

  // Shoot 3-cut sequence with countdown & flash
  if (pbShootBtn) {
    pbShootBtn.addEventListener('click', () => {
      if (isPbShooting) return;
      isPbShooting = true;
      pbShootBtn.disabled = true;

      let count = 3;
      if (pbCountdownOverlay) pbCountdownOverlay.classList.add('show');
      if (pbCountdownNum) pbCountdownNum.textContent = count;

      const countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          if (pbCountdownNum) pbCountdownNum.textContent = count;
        } else {
          clearInterval(countdownTimer);
          if (pbCountdownOverlay) pbCountdownOverlay.classList.remove('show');

          // Camera Flash
          if (pbFlashOverlay) {
            pbFlashOverlay.classList.add('flash');
            setTimeout(() => pbFlashOverlay.classList.remove('flash'), 180);
          }
          playCelebratoryChime();

          // Confetti burst
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 }
            });
          }

          if (toastTitle) toastTitle.textContent = '3-Cut photobooth strip captured!';
          if (audioToast) {
            audioToast.classList.add('show');
            setTimeout(() => audioToast.classList.remove('show'), 3000);
          }

          isPbShooting = false;
          pbShootBtn.disabled = false;
        }
      }, 800);
    });
  }

  // Download Strip button simulation
  if (pbDownloadBtn) {
    pbDownloadBtn.addEventListener('click', () => {
      if (toastTitle) toastTitle.textContent = 'Photobooth strip saved to device!';
      if (audioToast) {
        audioToast.classList.add('show');
        setTimeout(() => audioToast.classList.remove('show'), 3000);
      }
    });
  }

  // D. Live Ballroom Projector Wall Carousel (/wall)
  const wallGuestName = document.getElementById('wallGuestName');
  const wallGuestMeta = document.getElementById('wallGuestMeta');
  const wallWishText = document.getElementById('wallWishText');
  const wallPhoto = document.getElementById('wallPhoto');
  const wallSignatureBox = document.getElementById('wallSignatureBox');
  const wallCycleBar = document.getElementById('wallCycleBar');
  const wallPrevBtn = document.getElementById('wallPrevBtn');
  const wallNextBtn = document.getElementById('wallNextBtn');
  const wallPlayPauseBtn = document.getElementById('wallPlayPauseBtn');
  const wallPlayAudioBtn = document.getElementById('wallPlayAudioBtn');

  const wallEntries = [
    {
      name: 'Sarah & Daniel',
      meta: 'Table 5 \u2022 Solemnization Guest',
      wish: 'Selamat pengantin baru Aliff & Ilya! Wishing both of you endless love, patience, and barakah on your beautiful journey together!',
      photo: 'assets/candid_guest_moments.jpg',
      sig: 'Sarah & Daniel'
    },
    {
      name: 'Pak Long Kamarul',
      meta: 'Table 2 \u2022 Family Elder',
      wish: 'Alhamdulillah selamat pengantin baru Aliff & Ilya. Pak Long doakan dipermudahkan segala urusan dan diberkati Allah SWT selalu. Terus berbahagia ke anak cucu!',
      photo: 'assets/aliff-ilya-welcome.jpg',
      sig: 'Pak Long Kamarul'
    },
    {
      name: 'Amir & Nadia',
      meta: 'Table 8 \u2022 University Friends',
      wish: 'Cantik sangat majlis perkahwinan harini! Tahniah korang berdua, dari zaman belajar sampai sekarang. We are so proud of you both! #AliffIlyaForever',
      photo: 'assets/honeymoon_keepsake.jpg',
      sig: 'Amir & Nadia'
    }
  ];

  let currentWallIndex = 0;
  let isWallPlaying = true;
  let wallProgress = 0;
  let wallTimer = null;

  const renderWallSlide = (index) => {
    const entry = wallEntries[index];
    if (!entry) return;

    if (wallGuestName) wallGuestName.textContent = entry.name;
    if (wallGuestMeta) wallGuestMeta.textContent = entry.meta;
    if (wallWishText) wallWishText.textContent = `\u201C${entry.wish}\u201D`;
    if (wallPhoto) wallPhoto.src = entry.photo;
    if (wallSignatureBox) {
      wallSignatureBox.innerHTML = `<span class="simulated-handwriting">${entry.sig}</span>`;
    }
  };

  const startWallTimer = () => {
    clearInterval(wallTimer);
    wallProgress = 0;

    wallTimer = setInterval(() => {
      if (!isWallPlaying) return;
      wallProgress += (100 / (7000 / 100)); // 7 seconds total
      if (wallCycleBar) wallCycleBar.style.width = `${Math.min(wallProgress, 100)}%`;

      if (wallProgress >= 100) {
        wallProgress = 0;
        currentWallIndex = (currentWallIndex + 1) % wallEntries.length;
        renderWallSlide(currentWallIndex);
      }
    }, 100);
  };

  if (wallPrevBtn) {
    wallPrevBtn.addEventListener('click', () => {
      currentWallIndex = (currentWallIndex - 1 + wallEntries.length) % wallEntries.length;
      renderWallSlide(currentWallIndex);
      wallProgress = 0;
    });
  }

  if (wallNextBtn) {
    wallNextBtn.addEventListener('click', () => {
      currentWallIndex = (currentWallIndex + 1) % wallEntries.length;
      renderWallSlide(currentWallIndex);
      wallProgress = 0;
    });
  }

  if (wallPlayPauseBtn) {
    wallPlayPauseBtn.addEventListener('click', () => {
      isWallPlaying = !isWallPlaying;
      wallPlayPauseBtn.textContent = isWallPlaying ? 'Pause 7s Auto-Play' : 'Resume 7s Auto-Play';
    });
  }

  if (wallPlayAudioBtn) {
    wallPlayAudioBtn.addEventListener('click', () => {
      playAmbientHarpChord();
      if (toastTitle) toastTitle.textContent = 'Voice blessing playing on Live Wall';
      if (audioToast) {
        audioToast.classList.add('show');
        setTimeout(() => audioToast.classList.remove('show'), 3500);
      }
    });
  }

  startWallTimer();

  // E. Interactive Guestbook Submission Drawer (#demoModal)
  const demoModal = document.getElementById('demoModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const openDemoBtn = document.getElementById('openDemoBtn');
  const triggerDemoModal = document.getElementById('triggerDemoModal');
  const openPhoneSimulatorBtn = document.getElementById('openPhoneSimulatorBtn');
  const closeDemoBtn = document.getElementById('closeDemoBtn');
  const cancelDemoBtn = document.getElementById('cancelDemoBtn');
  const submitDemoEntry = document.getElementById('submitDemoEntry');
  const phoneFeedScroll = document.getElementById('phoneFeedScroll');

  const simMicBtn = document.getElementById('simMicBtn');
  const simVoiceStatus = document.getElementById('simVoiceStatus');
  const simTimer = document.getElementById('simTimer');
  const simWaveformBars = document.getElementById('simWaveformBars');

  const simPhotoPreview = document.getElementById('simPhotoPreview');
  const simPhotoFrameContainer = document.getElementById('simPhotoFrameContainer');
  const filterChoiceBtns = document.querySelectorAll('.filter-choice-btn');
  const frameChoiceBtns = document.querySelectorAll('.frame-choice-btn');

  const signatureCanvas = document.getElementById('signatureCanvas');
  const clearSignatureBtn = document.getElementById('clearSignatureBtn');

  let isSimRecording = false;
  let simSeconds = 0;
  let simInterval = null;
  let selectedFilter = 'original';
  let selectedFrame = 'none';

  // Modal Open & Close Handlers
  const openModal = () => {
    if (!demoModal) return;
    demoModal.classList.add('open');
    demoModal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    setTimeout(resizeSignatureCanvas, 60);
  };

  const closeModal = () => {
    if (!demoModal) return;
    demoModal.classList.remove('open');
    demoModal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (isSimRecording) stopSimRecording();
  };

  if (openDemoBtn) openDemoBtn.addEventListener('click', openModal);
  if (triggerDemoModal) triggerDemoModal.addEventListener('click', openModal);
  if (openPhoneSimulatorBtn) openPhoneSimulatorBtn.addEventListener('click', openModal);
  if (pbAttachBtn) pbAttachBtn.addEventListener('click', openModal);
  if (closeDemoBtn) closeDemoBtn.addEventListener('click', closeModal);
  if (cancelDemoBtn) cancelDemoBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && demoModal && demoModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Voice recording simulation
  const startSimRecording = () => {
    isSimRecording = true;
    simSeconds = 0;
    if (simMicBtn) simMicBtn.classList.add('recording');
    if (simWaveformBars) simWaveformBars.classList.add('active');
    if (simVoiceStatus) simVoiceStatus.textContent = 'Recording in progress... speak your wishes';
    if (simTimer) simTimer.textContent = '0:00';

    clearInterval(simInterval);
    simInterval = setInterval(() => {
      simSeconds++;
      if (simTimer) simTimer.textContent = formatTime(simSeconds);
    }, 1000);
  };

  const stopSimRecording = () => {
    isSimRecording = false;
    if (simMicBtn) simMicBtn.classList.remove('recording');
    if (simWaveformBars) simWaveformBars.classList.remove('active');
    clearInterval(simInterval);
    if (simVoiceStatus) simVoiceStatus.textContent = 'Voice blessing recorded (0:12) - ready to submit';
  };

  if (simMicBtn) {
    simMicBtn.addEventListener('click', () => {
      if (!isSimRecording) {
        startSimRecording();
      } else {
        stopSimRecording();
      }
    });
  }

  // 4 Photo Filters switching
  filterChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterChoiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFilter = btn.getAttribute('data-filter') || 'original';

      if (simPhotoPreview) {
        simPhotoPreview.className = `sim-photo-img filter-${selectedFilter}`;
      }
    });
  });

  // 5 Photo Frames switching
  frameChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      frameChoiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFrame = btn.getAttribute('data-frame') || 'none';

      if (simPhotoFrameContainer) {
        simPhotoFrameContainer.className = `sim-photo-frame-container frame-${selectedFrame}`;
      }
    });
  });

  // HTML5 Touch & Mouse Signature Canvas with Retina / High-DPI Support
  let isDrawing = false;
  let hasDrawnSignature = false;
  let sigCtx = null;

  const resizeSignatureCanvas = () => {
    if (!signatureCanvas) return;
    const rect = signatureCanvas.getBoundingClientRect();
    if (rect.width > 0) {
      const dpr = window.devicePixelRatio || 1;
      signatureCanvas.width = Math.floor(rect.width * dpr);
      signatureCanvas.height = Math.floor((rect.height || 110) * dpr);
      sigCtx = signatureCanvas.getContext('2d');
      if (sigCtx) {
        sigCtx.scale(dpr, dpr);
        sigCtx.strokeStyle = '#1C1917';
        sigCtx.lineWidth = 2.5;
        sigCtx.lineCap = 'round';
        sigCtx.lineJoin = 'round';
      }
    }
  };

  // Recalculate canvas on orientation change or window resize
  window.addEventListener('resize', () => {
    if (demoModal && demoModal.classList.contains('open')) {
      resizeSignatureCanvas();
    }
  }, { passive: true });

  const getCanvasPos = (e) => {
    if (!signatureCanvas) return { x: 0, y: 0 };
    const rect = signatureCanvas.getBoundingClientRect();
    const touch = e.touches && e.touches.length > 0
      ? e.touches[0]
      : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : e);
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  if (signatureCanvas) {
    const startDraw = (e) => {
      isDrawing = true;
      hasDrawnSignature = true;
      const pos = getCanvasPos(e);
      if (sigCtx) {
        sigCtx.beginPath();
        sigCtx.moveTo(pos.x, pos.y);
      }
      if (e.cancelable) e.preventDefault();
    };

    const moveDraw = (e) => {
      if (!isDrawing || !sigCtx) return;
      const pos = getCanvasPos(e);
      sigCtx.lineTo(pos.x, pos.y);
      sigCtx.stroke();
      if (e.cancelable) e.preventDefault();
    };

    const endDraw = () => {
      isDrawing = false;
    };

    signatureCanvas.addEventListener('mousedown', startDraw);
    signatureCanvas.addEventListener('mousemove', moveDraw);
    signatureCanvas.addEventListener('mouseup', endDraw);
    signatureCanvas.addEventListener('mouseleave', endDraw);

    // iOS and Android touch events
    signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
    signatureCanvas.addEventListener('touchmove', moveDraw, { passive: false });
    signatureCanvas.addEventListener('touchend', endDraw, { passive: false });
    signatureCanvas.addEventListener('touchcancel', endDraw, { passive: true });
  }

  if (clearSignatureBtn && signatureCanvas) {
    clearSignatureBtn.addEventListener('click', () => {
      if (sigCtx) {
        const dpr = window.devicePixelRatio || 1;
        sigCtx.clearRect(0, 0, signatureCanvas.width / dpr, signatureCanvas.height / dpr);
      }
      hasDrawnSignature = false;
    });
  }

  // Submit Entry with Confetti Explosion & Realtime Sync
  if (submitDemoEntry) {
    submitDemoEntry.addEventListener('click', () => {
      playCelebratoryChime();

      // Trigger multi-stage confetti burst matching demo-guestbook
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#E11D48', '#FAF8F5', '#C5A059']
        });

        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      }

      const guestNameInput = document.getElementById('simGuestName');
      const guestMessageInput = document.getElementById('simGuestMessage');
      const guestName = (guestNameInput && guestNameInput.value.trim()) || 'Pak Long Kamarul - Table 2';
      const guestMsg = (guestMessageInput && guestMessageInput.value.trim()) || 'Tahniah Aliff & Ilya! Semoga berkekalan ke anak cucu!';

      // Add to Live Wall carousel
      wallEntries.unshift({
        name: guestName,
        meta: 'Tabletop QR Upload \u2022 Just now',
        wish: guestMsg,
        photo: 'assets/candid_guest_moments.jpg',
        sig: guestName.split('-')[0].trim()
      });
      currentWallIndex = 0;
      renderWallSlide(0);

      // Prepend to phone feed
      const newCardHTML = `
        <article class="feed-card photo-feed-card" style="border-color: var(--gold-champagne); animation: fadeIn 0.4s ease;">
          <div class="feed-card-header">
            <div class="guest-avatar-letter">${guestName.charAt(0).toUpperCase()}</div>
            <div class="guest-details">
              <span class="guest-name">${guestName}</span>
              <span class="feed-time">Just now</span>
            </div>
            <span class="media-type-tag">Voice &amp; Photo</span>
          </div>
          <div class="feed-photo-frame ${selectedFrame !== 'none' ? `frame-${selectedFrame}` : ''}">
            <img src="assets/candid_guest_moments.jpg" alt="Uploaded guest photo" class="feed-img filter-${selectedFilter}">
          </div>
          <p class="feed-caption">&ldquo;${guestMsg}&rdquo;</p>
        </article>
      `;

      if (phoneFeedScroll) {
        phoneFeedScroll.insertAdjacentHTML('afterbegin', newCardHTML);
        phoneFeedScroll.scrollTop = 0;
      }

      closeModal();

      // Confirmation Toast
      if (toastTitle) toastTitle.textContent = 'Uploaded to Live Wall & Google Drive!';
      if (audioToast) {
        audioToast.classList.add('show');
        setTimeout(() => audioToast.classList.remove('show'), 4000);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Wedding FAQ Accordion
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordion items for clean focus
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Open first FAQ item by default for inviting scannability
  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
    const firstBtn = faqItems[0].querySelector('.faq-question');
    if (firstBtn) firstBtn.setAttribute('aria-expanded', 'true');
  }

  // --------------------------------------------------------------------------
  // 8. Smooth Scrolling for Anchor Links with Header Offset
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
