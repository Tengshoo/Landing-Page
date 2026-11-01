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
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
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
  // 6. Interactive Guest Simulator Modal
  // --------------------------------------------------------------------------
  const demoModal = document.getElementById('demoModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const openDemoBtn = document.getElementById('openDemoBtn');
  const triggerDemoModal = document.getElementById('triggerDemoModal');
  const closeDemoBtn = document.getElementById('closeDemoBtn');
  const cancelDemoBtn = document.getElementById('cancelDemoBtn');

  const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
  const modalTabPanes = document.querySelectorAll('.modal-tab-pane');

  const simMicBtn = document.getElementById('simMicBtn');
  const simVoiceStatus = document.getElementById('simVoiceStatus');
  const simTimer = document.getElementById('simTimer');
  const submitDemoEntry = document.getElementById('submitDemoEntry');
  const phoneFeedScroll = document.getElementById('phoneFeedScroll');

  let isSimRecording = false;
  let simSeconds = 0;
  let simInterval = null;

  const openModal = () => {
    demoModal.classList.add('open');
    demoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    demoModal.classList.remove('open');
    demoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (isSimRecording) {
      stopSimRecording();
    }
  };

  if (openDemoBtn) openDemoBtn.addEventListener('click', openModal);
  if (triggerDemoModal) triggerDemoModal.addEventListener('click', openModal);
  if (closeDemoBtn) closeDemoBtn.addEventListener('click', closeModal);
  if (cancelDemoBtn) cancelDemoBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Tab switching
  modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalTabBtns.forEach(b => b.classList.remove('active'));
      modalTabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Voice recording simulation
  const startSimRecording = () => {
    isSimRecording = true;
    simSeconds = 0;
    simMicBtn.classList.add('recording');
    simVoiceStatus.textContent = 'Recording in progress... speak now';
    simTimer.textContent = '0:00';
    
    clearInterval(simInterval);
    simInterval = setInterval(() => {
      simSeconds++;
      simTimer.textContent = formatTime(simSeconds);
    }, 1000);
  };

  const stopSimRecording = () => {
    isSimRecording = false;
    simMicBtn.classList.remove('recording');
    clearInterval(simInterval);
    simVoiceStatus.textContent = 'Recording complete (ready to submit)';
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

  // Submit entry: Add card into phone feed dynamically!
  if (submitDemoEntry) {
    submitDemoEntry.addEventListener('click', () => {
      playCelebratoryChime();

      // Find active tab
      const activeTab = document.querySelector('.modal-tab-btn.active').getAttribute('data-tab');
      let newCardHTML = '';

      if (activeTab === 'voiceTab') {
        const guestName = document.getElementById('simVoiceName').value || 'Guest';
        newCardHTML = `
          <article class="feed-card audio-feed-card" style="border-color: var(--gold-champagne); animation: fadeIn 0.4s ease;">
            <div class="feed-card-header">
              <div class="guest-avatar-letter">${guestName.charAt(0).toUpperCase()}</div>
              <div class="guest-details">
                <span class="guest-name">${guestName}</span>
                <span class="feed-time">Just now</span>
              </div>
              <span class="media-type-tag">Voice Note</span>
            </div>
            <div class="audio-player-widget">
              <button class="audio-play-button playing" aria-label="Play recording">
                <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                <svg class="pause-icon" style="display:block;" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
              <div class="audio-waveform-container">
                <div class="waveform-bars">
                  <span style="--h: 60%"></span>
                  <span style="--h: 90%"></span>
                  <span style="--h: 40%"></span>
                  <span style="--h: 100%"></span>
                  <span style="--h: 75%"></span>
                  <span style="--h: 55%"></span>
                </div>
                <div class="audio-timer"><span>0:12</span> / <span>0:12</span></div>
              </div>
            </div>
            <p class="voice-transcription-preview">
              &ldquo;Huge congratulations to Atif &amp; Isma! Wishing you both an endless journey of love and joy!&rdquo;
            </p>
          </article>
        `;
      } else if (activeTab === 'photoTab') {
        const caption = document.getElementById('simPhotoCaption').value || 'Tahniah Atif & Isma!';
        newCardHTML = `
          <article class="feed-card photo-feed-card" style="border-color: var(--gold-champagne); animation: fadeIn 0.4s ease;">
            <div class="feed-card-header">
              <div class="guest-avatar-letter">Y</div>
              <div class="guest-details">
                <span class="guest-name">You (Demo Guest)</span>
                <span class="feed-time">Just now</span>
              </div>
              <span class="media-type-tag">Candid Photo</span>
            </div>
            <div class="feed-photo-frame">
              <img src="assets/candid_guest_moments.jpg" alt="Uploaded guest photo" class="feed-img">
            </div>
            <p class="feed-caption">&ldquo;${caption}&rdquo;</p>
          </article>
        `;
      } else {
        const wishName = document.getElementById('simWishName').value || 'A Friend';
        const wishMsg = document.getElementById('simWishMessage').value || 'Warmest congratulations on your engagement, Atif & Isma!';
        newCardHTML = `
          <article class="feed-card wish-feed-card" style="border-color: var(--gold-champagne); animation: fadeIn 0.4s ease;">
            <div class="feed-card-header">
              <div class="guest-avatar-letter">${wishName.charAt(0).toUpperCase()}</div>
              <div class="guest-details">
                <span class="guest-name">${wishName}</span>
                <span class="feed-time">Just now</span>
              </div>
              <span class="media-type-tag">Written Wish</span>
            </div>
            <p class="wish-text">&ldquo;${wishMsg}&rdquo;</p>
          </article>
        `;
      }

      // Prepend to phone feed
      if (phoneFeedScroll) {
        phoneFeedScroll.insertAdjacentHTML('afterbegin', newCardHTML);
        phoneFeedScroll.scrollTop = 0;
      }

      closeModal();

      // Show confirmation toast
      if (toastTitle) toastTitle.textContent = 'Blessing added to live guestbook!';
      if (audioToast) {
        audioToast.classList.add('show');
        setTimeout(() => {
          audioToast.classList.remove('show');
        }, 4000);
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
