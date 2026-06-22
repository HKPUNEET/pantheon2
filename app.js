/* ==========================================================================
   THE BUSINESS ESPIONAGE - APPLICATION LOGIC (GSAP POWERED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------------
     1. GSAP Layout Entrance Animations (Hero Section)
     ------------------------------------------------------------------------ */
  gsap.from(".hero-headline", { 
    opacity: 0, 
    y: 40, 
    duration: 1, 
    ease: "power4.out" 
  });
  
  gsap.from(".hero-subtext", { 
    opacity: 0, 
    y: 20, 
    duration: 1, 
    delay: 0.25, 
    ease: "power3.out" 
  });
  
  gsap.from(".dossier-card", { 
    opacity: 0, 
    y: 30, 
    duration: 1, 
    delay: 0.45, 
    ease: "power3.out" 
  });
  
  gsap.from(".hero-left .cta-button", { 
    opacity: 0, 
    y: 20, 
    duration: 0.8, 
    delay: 0.65, 
    ease: "power2.out" 
  });

  // Collage visuals floating in
  gsap.from(".base-image-wrapper", { 
    opacity: 0, 
    scale: 0.95, 
    x: 40, 
    duration: 1.4, 
    delay: 0.4, 
    ease: "power3.out" 
  });
  
  gsap.from(".overlay-image-wrapper", { 
    opacity: 0, 
    scale: 0.7, 
    rotation: 12, 
    duration: 1.2, 
    delay: 0.7, 
    ease: "back.out(1.5)" 
  });

  // Pull-Quote Banner fade-in
  gsap.from(".editorial-headline-quote", {
    scrollTrigger: {
      trigger: ".editorial-quote-section",
      start: "top 85%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    scale: 0.95,
    duration: 1.2,
    ease: "power3.out"
  });

  // Briefing Section Rows - individual scroll entry triggers with clearProps
  gsap.utils.toArray(".expectation-row").forEach((row) => {
    gsap.from(row, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: row,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  });

  /* ------------------------------------------------------------------------
     2. GSAP Animations for "What is a Case Competition" Section (Radial Wipe)
     ------------------------------------------------------------------------ */
  
  // Radial expansion clip-path animation for the section itself
  gsap.fromTo("#case-education", 
    { clipPath: "circle(0% at 50% 50%)" },
    { 
      clipPath: "circle(150% at 50% 50%)", 
      ease: "none", 
      scrollTrigger: { 
        trigger: "#case-education", 
        start: "top bottom", 
        end: "bottom center", 
        scrub: 1.2,
        invalidateOnRefresh: true
      } 
    }
  );

  // Entrance fades for the headings inside Case Education
  gsap.from(".case-edu-left h3, .case-edu-left .editorial-category, .case-edu-left .case-edu-text", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#case-education",
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  // Step cards - individual entry triggers with clearProps
  gsap.utils.toArray(".case-edu-left .step-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      x: -45,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  });

  // Collage images - individual triggers
  gsap.utils.toArray(".edu-image-wrapper").forEach((img) => {
    gsap.from(img, {
      opacity: 0,
      scale: 0.92,
      y: 30,
      duration: 1.0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: img,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  });


  /* ------------------------------------------------------------------------
     3. GSAP ScrollTrigger for Rising Hand (Briefing Section)
     ------------------------------------------------------------------------ */
  gsap.to(".hand-wrapper", {
    scrollTrigger: {
      trigger: "#osint",
      start: "top bottom",      // starts when top of briefing lounge enters viewport bottom
      end: "bottom center",     // ends when bottom of briefing lounge reaches viewport center
      scrub: 1.2,               // smooth scroll interpolation
      invalidateOnRefresh: true
    },
    y: 0,                       // Translate hand wrapper to baseline
    ease: "none"
  });


  /* ------------------------------------------------------------------------
     4. Briefing Video Modal handlers
     ------------------------------------------------------------------------ */
  const modal = document.getElementById('video-modal');
  const hotspot = document.getElementById('hotspot-trigger');
  const closeBtn = document.getElementById('video-close-btn');

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock base scroll
    resetVideo();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock base scroll
    pauseVideo();
  };

  hotspot.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });


  /* ------------------------------------------------------------------------
     5. Canvas Briefing Audio/Visual Telemetry
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('video-canvas');
  const ctx = canvas.getContext('2d');
  
  const playToggleBtn = document.getElementById('video-play-toggle');
  const soundToggleBtn = document.getElementById('video-sound-toggle');
  const centralPlayBtn = document.getElementById('video-central-play');
  const statusOverlay = document.getElementById('video-status-overlay');
  
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const iconUnmuted = document.getElementById('icon-unmuted');
  const iconMuted = document.getElementById('icon-muted');
  
  const timeCurrent = document.getElementById('time-current');
  const progressBar = document.getElementById('timeline-progress-bar');
  const progressFill = document.getElementById('timeline-progress-fill');
  const progressHandle = document.getElementById('timeline-progress-handle');
  const captionsDiv = document.getElementById('video-captions');

  // Video variables
  let isPlaying = false;
  let isMuted = false;
  let currentTime = 0;
  const duration = 25; // 25 seconds
  let lastFrameTime = 0;
  let animationFrameId = null;

  // Timed captions mapping Shreyas' speech
  const captions = [
    { time: 0, text: "[INITIALIZING BRIEFING VIDEO DATA NODE... SECURE PATH OK]" },
    { time: 2, text: "Shreyas: Welcome, candidates, to the Business Espionage Briefing." },
    { time: 6, text: "This year, we are targeting a major multinational conglomerate." },
    { time: 10, text: "They believe their market position is impregnable, but our competitor reports suggest otherwise." },
    { time: 15, text: "Your team will act as independent business consultants." },
    { time: 19, text: "Analyze the data, formulate the strategy, and pitch your recommendations." },
    { time: 23, text: "Intelligence is an asset. Strategy is the key. Good luck." }
  ];

  const resizeCanvas = () => {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  
  window.addEventListener('resize', resizeCanvas);

  const togglePlay = () => {
    if (isPlaying) pauseVideo();
    else playVideo();
  };

  const playVideo = () => {
    isPlaying = true;
    statusOverlay.classList.add('hidden');
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
    
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(renderLoop);
  };

  const pauseVideo = () => {
    isPlaying = false;
    statusOverlay.classList.remove('hidden');
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  const resetVideo = () => {
    currentTime = 0;
    updateTimelineUI();
    resizeCanvas();
    drawStaticFrame();
  };

  const toggleMute = () => {
    isMuted = !isMuted;
    if (isMuted) {
      iconUnmuted.classList.add('hidden');
      iconMuted.classList.remove('hidden');
    } else {
      iconUnmuted.classList.remove('hidden');
      iconMuted.classList.add('hidden');
    }
  };

  playToggleBtn.addEventListener('click', togglePlay);
  centralPlayBtn.addEventListener('click', playVideo);
  soundToggleBtn.addEventListener('click', toggleMute);

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    currentTime = Math.max(0, Math.min(duration, percentage * duration));
    updateTimelineUI();
    if (!isPlaying) drawStaticFrame();
  });

  const updateTimelineUI = () => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    timeCurrent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const percent = (currentTime / duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;

    let activeCaption = "";
    for (let i = 0; i < captions.length; i++) {
      if (currentTime >= captions[i].time) {
        activeCaption = captions[i].text;
      }
    }
    captionsDiv.textContent = activeCaption;
  };

  /* ------------------------------------------------------------------------
     6. Business Briefing Canvas Render Loop
     ------------------------------------------------------------------------ */
  let radarRotation = 0;

  const drawStaticFrame = () => {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.fillStyle = '#041114';
    ctx.fillRect(0, 0, w, h);

    // Grid outline
    ctx.strokeStyle = 'rgba(12, 60, 60, 0.25)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0c3c3c';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
    ctx.stroke();
  };

  const renderLoop = (timestamp) => {
    if (!isPlaying) return;

    const elapsed = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    currentTime += elapsed;
    if (currentTime >= duration) {
      currentTime = duration;
      updateTimelineUI();
      pauseVideo();
      resetVideo();
      return;
    }

    updateTimelineUI();

    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    // Telemetry Canvas Graphics
    ctx.fillStyle = '#041114';
    ctx.fillRect(0, 0, w, h);

    // Moving grid
    const gridOffset = (currentTime * 12) % 30;
    ctx.strokeStyle = 'rgba(12, 60, 60, 0.12)';
    ctx.lineWidth = 1;
    for (let x = -gridOffset; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Concentric analysis rings
    radarRotation += 0.015;
    const cx = w / 2;
    const cy = h / 2 - 15;
    const r = 90;

    ctx.strokeStyle = 'rgba(12, 60, 60, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Sweeping line (simulating business analysis sweep)
    ctx.strokeStyle = 'rgba(22, 83, 83, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const sweepX = cx + Math.cos(radarRotation) * r;
    const sweepY = cy + Math.sin(radarRotation) * r;
    ctx.lineTo(sweepX, sweepY);
    ctx.stroke();

    // Target sweep nodes
    const nodeX = cx - 40;
    const nodeY = cy + 30;
    const sweepDist = Math.abs((Math.atan2(nodeY - cy, nodeX - cx) - radarRotation) % (Math.PI * 2));
    ctx.fillStyle = sweepDist < 0.25 ? '#ff3b30' : 'rgba(22, 83, 83, 0.4)';
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sound wave frequency bands
    const count = 35;
    const size = 3;
    const gap = 2;
    const startX = (w - (count * (size + gap))) / 2;
    const waveBaseY = h - 65;

    ctx.fillStyle = 'rgba(22, 83, 83, 0.75)';
    const scale = isMuted ? 0.05 : 1.0;
    for (let i = 0; i < count; i++) {
      const height = (Math.sin(i * 0.4 + currentTime * 9) * Math.cos(i * 0.2 + currentTime * 4.5) + 1.2) * 15 * scale + 2;
      ctx.fillRect(startX + i * (size + gap), waveBaseY - height / 2, size, height);
    }

    // Coordinates HUD
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(22, 83, 83, 0.6)';
    ctx.fillText(`CASE_STREAM: DATA_NODE_0${Math.floor(currentTime % 6)}`, 20, 35);
    ctx.fillText(`MARKET_INDEX: ${(14800 + Math.sin(currentTime * 4) * 200).toFixed(0)}`, 20, 47);
    ctx.fillText(`BANDWIDTH: 412 KBPS`, 20, 59);

    ctx.fillText(`CAMPUS: JSSSTU MYSORE`, w - 160, 35);
    ctx.fillText(`CANDIDATES: CONNECTED`, w - 160, 47);
    ctx.fillText(`SECURITY: CONFIDENTIAL`, w - 160, 59);

    // Speak silhouette wireframe
    const bounce = Math.sin(currentTime * 9) * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy - 10 + bounce, 18, 0, Math.PI * 2);
    ctx.moveTo(cx - 8, cy - 10 + bounce);
    ctx.lineTo(cx + 8, cy - 10 + bounce);
    ctx.stroke();

    animationFrameId = requestAnimationFrame(renderLoop);
  };

  resetVideo();
});
